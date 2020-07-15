# frozen_string_literal: true

require 'shellwords'

class Clean < Thor
  default_task :all

  def self.exit_on_failure?
    true
  end

  desc 'all', 'clean all.'
  def all
    invoke :build
    invoke :cache
  end

  desc 'full', 'clean all, including installed dependencies.'
  def full
    invoke :all
    invoke :fontawesome
    invoke :vendor
    invoke :lock
  end

  desc 'build', 'delete site build directory.'
  def build
    remove_paths(*Dir.glob(dirs[:publish]))
    remove_paths(*Dir.glob('src/assets/scripts/*.bundle.js'))
  end

  desc 'cache', 'delete site cache.'
  def cache
    remove_paths File.join($root, 'var', 'babel')
    remove_paths File.join($root, '.log')
    remove_paths File.join($root, 'var', 'ascii')
    remove_paths File.join($root, 'var', 'yarn-cache')
    remove_paths dirs[:resource]
  end

  desc 'vendor', 'remove installed packages/extensions.'
  def vendor
    remove_paths File.join($root, 'vendor/ruby/')
    remove_paths File.join($root, '.bundle')

    yarn_cache_path = File.join($root, yarn_config[:cache_folder])
    remove_paths yarn_cache_path if yarn_cache_path

    yarn_vendor = yarn_config[:modules_folder]
    remove_paths File.join($root, yarn_vendor)
    unless node_modules?
      remove_paths File.join($root, 'node_modules') unless node_modules?
    end
  end

  desc 'lock', 'delete lock files'
  def lock
    remove_paths File.join($root, 'yarn.lock'),
                 File.join($root, 'package-lock.json'),
                 File.join($root, 'Gemfile.lock')
  end

  desc 'themes', 'remove cloned ruby themes.'
  method_option :force,
                type: :boolean,
                default: false,
                aliases: '-f',
                desc: 'remove any themes with dirty working trees.'
  def themes
    STDERR.puts 'not yet implemented'
  end

  desc 'fontawesome', 'delete fontawesome svgs'
  def fontawesome
    remove_paths File.join(dirs[:asset], 'images', 'fa')
  end

  private

  def remove_paths(*paths)
    self.class.remove_paths(*paths)
  end

  def self.remove_paths(*paths)
    # WARN not secure
    paths.each { |f| FileUtils.rm_rf(f, verbose: true) }
  end
end

Utils.setup(Clean)
