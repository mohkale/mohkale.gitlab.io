# frozen_string_literal: true

module Utils
  include Thor::Actions

  # setup a Thor class with relevent submodules.
  #
  def self.setup(klass, options={})
    if options.fetch(:add_help_command, true)
      add_help_options(
        klass, options.fetch(:exclude_help_cmds, []))
    end

    klass.include self
    klass.include Config
    klass.extend ThorUtils
  end

  def in_root(config={}, &block)
    if destination_root.eql?($root)
      block.call # invoke as is
    else
      inside($root, config, &block)
    end
  end

  def windows?
    # source: https://github.com/rdp/os/blob/master/lib/os.rb
    if RUBY_PLATFORM =~ /cygwin/ # i386-cygwin
      false
    else
      ENV['OS'] == 'Windows_NT'
    end
  end

  def which(bin)
    ex = `which #{Shellwords.escape bin} 2>/dev/null`.chomp
    ex if $?.success?
  end

  def editor
    @editor ||= ENV['editor'] || which('vim') || which('vi')
  end

  def chromium_engine
    @engine = which('chrome') || which('chromium') || which('brave')
  end

  def logger
    @logger ||= if options[:verbose]
                  Logger.new(STDERR, level: Logger::INFO)
                elsif options[:sudo_verbose]
                  Logger.new(STDERR, level: Logger::DEBUG)
                else
                  Logger.new(IO::NULL)
                end
  end
end
