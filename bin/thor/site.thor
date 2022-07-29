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

  desc 'brain', 'Compile org brain files into html.'
  method_option :watch,
                aliases: '-w',
                type: :boolean,
                default: false,
                desc: 'Spawn a watcher and keep generating files afterwards'
  method_option :jobs,
                aliases: '-j',
                type: :numeric,
                default: 1,
                desc: 'Number of jobs to run in parallel'
  def brain
    in_root do
      inside File.join('vendor/org') do
        # Prepratory tasks that should be done before we can start generating files
        run 'make emacs-setup brain-hugo/locations.el brain-hugo/bib-all.bib'
        if options[:watch]
          run "make -j#{options[:jobs]} brain-watcher"
        else
          run "make -j#{options[:jobs]}"
        end
      end
    end
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
      else
        cmd
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
