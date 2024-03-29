#!/usr/bin/env thor
# frozen_string_literal: true

require 'git'
require 'shellwords'

class Install < Thor
  default_task 'all'
  extend ThorUtils

  def self.exit_on_failure?
    true
  end

  verbose_class_options

  class_option :no_confirm,
               aliases: ['-y'],
               type: :boolean,
               default: false,
               desc: 'assume the defaults for any confirmation prompts.'

  desc 'all', 'install all setup tasks.'
  def all
    invoke :themes
    invoke :asciinema
    invoke :submodules
    invoke :node
  end

  desc 'asciinema', 'retrieve asciinema source and styles.'
  ASCIINEMA_URL = 'https://github.com/asciinema/asciinema-player/releases/download'
  ASCIINEMA_VERSION = '2.6.1'
  def asciinema
    url = "#{ASCIINEMA_URL}/v#{ASCIINEMA_VERSION}/"
    style_dest = File.join dirs[:asset], 'styles', 'asciinema.scss'
    script_dest = File.join dirs[:asset], 'scripts', 'asciinema.js'

    in_root do
      run "curl -L# --create-dirs -o #{Shellwords.escape style_dest}  #{Shellwords.escape url + '/asciinema-player.css'}"
      run "curl -L# --create-dirs -o #{Shellwords.escape script_dest} #{Shellwords.escape url + '/asciinema-player.js'}"
    end
  end

  desc 'themes', 'install hugo themes.'
  method_option :force,
                type: :boolean,
                default: false,
                aliases: '-f',
                desc: 'overwrite local repositories.'
  def themes
    hugo_config.fetch('themes', []).each do |theme|
      name = theme['name']
      repo = theme['repo']
      branch = theme.fetch('branch', 'master')

      install_path = File.join(dirs[:themes], name)

      if Dir.exist?(install_path)
        if options[:force]
          puts "checking out branch '#{('origin/' + branch).blue}' in theme: #{name.green}"
          Git.open(install_path, log: logger).tap {
            |g| g.checkout("origin/#{branch}") }
        end
      else
        puts "cloning theme: #{name.green}"
        Git.clone(repo, name, path: dirs[:themes], log: logger)
      end
    end
  end

  desc 'submodules', 'fetch any git submodules'
  def submodules
    in_root { run 'git submodule update --init --recursive' }
  end

  desc 'node', 'sync node modules/dependencies'
  def node
    in_root do
      case node_or_npm
      when :yarn
        run 'yarn install'
      when :npm
        run 'npm install'
      end
    end
  end

  desc 'org', 'install my org-brain submodule.'
  def org
    in_root do
      dest = File.join('vendor', 'org')
      if File.exist?(dest)
        # inside dest do
        #   run 'git fetch --all'
        #   run 'git reset --hard origin/master'
        # end
      else
        token = ENV["GITHUB_TOKEN"]
        url = "https://mohkale#{token ? ':' + token : nil}@github.com/mohkale/org.git"
        run "git clone #{Shellwords.escape url} #{Shellwords.escape dest}"
      end
    end
  end
end

Utils.setup(Install)
