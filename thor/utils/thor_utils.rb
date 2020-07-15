# frozen_string_literal: true

module ThorUtils
  def verbose_options(opts = {})
    make_verbose_options method(:method_option), opts
  end

  def verbose_class_options(opts = {})
    make_verbose_options method(:class_option), opts
  end

  def environment_option(opts = {})
    method_option :env,
                  aliases: '-e',
                  default: Environments::DEV,
                  desc: 'the app environment for the current runtime.'
  end

  private

  def make_verbose_options(opt_method, opts = {})
    opt_method.call :verbose,
                    aliases: opts.fetch(:verbose_alias, ['-v']),
                    type: :boolean,
                    desc: 'use verbose output.'
    opt_method.call :sudo_verbose,
                    aliases: opts.fetch(:sudo_verbose_alias, ['-V']),
                    type: :boolean,
                    desc: 'use even more verbose output.'
  end
end
