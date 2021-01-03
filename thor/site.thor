# frozen_string_literal: true

require 'pry'
require 'git'
require 'pathname'

# rubcop:disable
def site_build_options
  environment_option

  method_option :drafts,
                aliases: '-d',
                type: :boolean,
                default: true,
                desc: 'also build drafts.'
  method_option :output,
                aliases: '-o',
                desc: 'path to write site to.'
  method_option :webpack,
                type: :boolean,
                default: true,
                desc: 'build scripts using webpack'
  method_option :hugo,
                type: :boolean,
                default: true,
                desc: 'build site using hugo'
end

def which(bin)
  ex = `which #{Shellwords.escape bin} 2>/dev/null`.chomp
  ex if $?.success?
end

def editor
  ENV['EDITOR'] || which('vim') || which('vi')
end

class Site < Thor
  default_task :build
  extend ThorUtils

  def self.exit_on_failure?
    true
  end

  desc 'config', 'print the site configuration'
  def config
    in_root { run 'hugo config', verbose: false }
  end

  desc 'archetypes', 'print all known archetypes'
  def archetypes
    puts archetypes_list
  end

  # publish local site to remote repository on the branch which
  # triggers rebuilding the pages.
  #
  # This command also stashes changes in the local index to prevent
  # them interfering with the remote and adds some lock/useful runtime
  # files to the repository to speed up builds.
  class SitePublish < Thor
    default_task :default
    extend ThorUtils

    attr_accessor :stashed, :added_locks

    def initialize(*args)
      super
      self.stashed = false
      self.added_locks = false
    end

    LOCK_MSG  = '@autocommit add buildfiles'
    STASH_MSG = '@autostash for publishing'

    def self.exit_on_failure?
      true
    end

    desc 'default', 'publish changes from current branch to deployment branch.'
    def default
      initial_branch = git.branch

      if initial_branch.name == public_branch
        logger.error "cannot publish from the public branch: #{public_branch}"
        return false
      end

      status = git.status
      unless [*status.added, *status.changed, *status.deleted, *status.untracked].empty?
        if no_confirm || yes_no_prompt('working directory modified, stash before proceeding')
          logger.debug 'stashing work tree index'
          initial_branch.stashes.save(STASH_MSG)
          stashed = true
        else
          return false
        end
      end

      if git.branches.map(&:full).include? public_branch
        if sudo_no_confirm || yes_no_prompt('local public branch exists, delete before proceeding')
          logger.debug('deleting local copy of public branch')
          git.branch(public_branch).delete
        else
          return false
        end
      end

      # checkout, then add any useful files for building
      git.checkout(public_branch, new_branch: true)
      new_files = lock_files
      if new_files
        git.add(new_files, force: true)
        git.commit(LOCK_MSG)
        added_locks = true
      end

      git.push('origin', public_branch, force: true)

      # cleanup
      git.branch(public_branch).delete if options[:delete_local]
    ensure
      git_lib = git.instance_variable_get(:@lib)

      unless git.current_branch == initial_branch.full
        initial_branch.checkout
        # restore any lock files that were pushed onto the public branch in
        # my current branch.
        if added_locks
          new_files.each do |f|
            git_lib.checkout_file(public_branch, f)
            git_lib.send(:command, 'restore', ['--staged', '--', f])
          end
        end
      end
      git_lib.send(:command, 'stash pop') if stashed
    end

    no_commands do
      def yes_no_prompt(prompt)
        %w[yes y].include? ask(prompt, limited_to: %w[yes y no n])
      end

      def git
        @git ||= Git.open($root, log: logger)
      end

      def public_branch
        @public_branch ||= options[:public_branch]
      end

      def remote_public_branch
        @remote_public_branch ||= "remotes/origin/#{public_branch}"
      end

      def no_confirm
        @no_confirm ||= options[:no_confirm] || sudo_no_confirm
      end

      def sudo_no_confirm
        @sudo_no_confirm ||= options[:sudo_no_confirm]
      end

      private

      # files which aren't included in the site, but are useful for
      # deployment.
      def lock_files
        in_root do
          %w[.bundle vendor/]
            .filter { |file| File.exist?(file) }
        end
      end
    end
  end

  Utils.setup(SitePublish)
  SitePublish.verbose_class_options

  method_option :no_confirm,
                type: :boolean,
                default: false,
                aliases: '-y',
                desc: 'assume yes on all non-destructive queries.'
  method_option :sudo_no_confirm,
                type: :boolean,
                default: false,
                aliases: '-Y',
                desc: 'assume yes on all queries.'
  method_option :public_branch,
                default: 'public',
                aliases: '-b',
                desc: 'branch on which posts are to be published'
  method_option :delete_local,
                type: :boolean,
                aliases: '-d',
                desc: 'delete local public branch once done'
  desc 'publish', 'publish changes from current branch to deployment branch.'
  subcommand 'publish', SitePublish

  desc 'build', 'build my site.'
  site_build_options
  method_option :clean,
                type: :boolean,
                default: true,
                desc: 'clean before building'
  def build
    do_pack = options[:webpack]
    do_hugo = options[:hugo]

    clean if options[:clean] && do_pack && do_hugo

    commands = build_commands
    commands[:pack] += ' --progress --profile --colors'

    in_root do
      run commands[:pack] if do_pack
      run commands[:hugo] if do_hugo
    end
    # build_resumes
  end

  # desc 'build_resumes', 'convert html resumes to pdfs.'
  # site_build_options
  # def build_resumes
  #   Dir.chdir(options[:output] || dirs[:publish]) do
  #     Pathname.new('resume').children.map do |path|
  #       next unless path.directory?
  #       src = path / 'index.html'
  #       dst = path / 'index.pdf'
  #       if src.exist?
  #         run Shellwords.join([chromium_engine, '--headless', '--disable-gpu',
  #                              "--print-to-pdf=#{dst.to_path}", '--no-margins',
  #                              src.to_path])
  #       end
  #     end
  #   end
  # end

  desc 'serve', 'build then serve the site on localhost.'
  site_build_options
  method_option :force_write,
                aliases: '-w',
                type: :boolean,
                default: true,
                help: 'force hugo to write out a build directory'
  def serve
    do_pack = options[:webpack]
    do_hugo = options[:hugo]

    # webpack needs to be done before hugo can start :sad:.
    # now either I force this task to invoke build before
    # invoking itself, or just assume I've run a build at
    # least once before trying to serve.
    # clean if do_pack && do_hugo

    commands = build_commands
    commands[:pack] += ' -w'
    commands[:hugo] += ' server --port 4567 --noHTTPCache'
    commands[:hugo] += ' --renderToDisk' if options[:force_write]

    commands.delete :pack unless do_pack
    commands.delete :hugo unless do_hugo

    in_root { run concurrently commands } unless commands.empty?
  rescue Interrupt
    0
  end

  method_option :front_matter,
                aliases: ['-f'],
                type: :hash,
                lazy_default: nil,
                desc: 'overwrite frontmatter for draft, format is key:value'
  method_option :edit,
                aliases: ['-e'],
                lazy_default: editor,
                help: 'open with EDITOR after creating draft'
  method_option :time,
                type: :boolean,
                default: true,
                desc: 'prefix drafts using a (file) archetype with current date'
  method_option :arch,
                aliases: ['-a'],
                default: 'default',
                desc: 'specify archetype for new draft'
  desc 'draft PATH', 'create a new draft post at PATH'
  def draft(path)
    arch_file = nil
    ['', '.md'].each do |suffix|
      file = File.join(dirs[:archetypes], options[:arch] + suffix)
      if File.exist? file
        arch_file = file
        break
      end
    end

    raise 'unable to find archetype: ' + options[:arch] if arch_file.nil?

    if options[:front_matter] && !File.file?(arch_file)
      raise '--front_matter flag only works with page archetypes'
    end

    # also only works with page archetypes, but it's on by default so
    # silently ignore it if not working with a page archetype.
    if options[:time] && File.file?(arch_file)
      dir, base = File.split(path)
      path = File.join(dir, Time.now.strftime('%Y-%m-%d-') + base)
    end

    cmd = "hugo new #{Shellwords.escape path}"
    cmd += " --kind #{Shellwords.escape options[:arch]}"
    in_root { run cmd }

    output_file = File.join(dirs[:content], path)
    unless File.exist?(output_file)
      fail 'unable to locate output post at: ' + output_file
    end

#     if options[:front_matter]
#       File.open(output_file, 'r+') do |fd|
#         contents = fd.read
#         if contents.start_with? '---'
#           # read existing frontmatter, update, then overwrite.
#         else
#           contents = <<~EOF
#   #{YAML.dump(options[:frontmatter])}
#   ---
#   #{content}
# EOF
#         end
#       end
#     end
    if options[:front_matter]
      STDERR.puts 'WARN: frontmatter option not yet implemented'
    end

    if options[:edit]
      run "#{options[:edit]} #{Shellwords.escape output_file}"
    end

    puts output_file
  end

  no_commands do
    def colors
      @colors ||= %i[blue magenta green black red yellow cyan white gray]
    end

    def concurrently(commands = {})
      case commands.length
      when 0
        raise 'must supply at least one command string.'
      when 1
        commands.first[1]
      else
        flags  = ' -k -s first'
        flags += " -n #{commands.keys.join(',')}"
        flags += " -c #{colors.cycle.first(commands.length).map(&:to_s).join(',')}"
        commands.values
                .map  { |cmd| '"' + cmd + '"' }
                .each { |cmd| flags += ' ' + cmd }

        node_cmd 'concurrently' + flags
      end
    end

    def node_cmd(cmd)
      case node_or_npm
      when :yarn
        'yarn run ' + cmd
      when :npm
        'npx ' + cmd
      end
    end

    private

    def clean
      invoke 'clean:build', [], {}
    end

    def build_commands
      commands = {
        hugo: "hugo -e #{options[:env]}",
        pack: node_cmd("webpack --env=#{options[:env]} --config=./etc/webpack.config.ts")
      }

      commands[:hugo] += ' --buildDrafts' if options[:env] == Environments::DEV

      if options[:verbose]
        commands[:pack] += ' --verbose'
        commands[:hugo] += ' -v'
      end

      commands[:hugo] += " -d #{options[:output]}" if options[:output]
      commands[:hugo] += ' --minify' if options[:env] == Environments::REL
      commands[:hugo] += ' -D' if options[:drafts]

      commands
    end
  end
end

Utils.setup(Site)
Site.verbose_class_options
