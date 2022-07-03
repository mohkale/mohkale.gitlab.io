module Utils
  # Add a -h flag to all tasks to cause thor to print out help messages.
  # Going back to the start of the line and adding help, is far more
  # annoying than simply appending -h to my command line.
  #
  def self.add_help_options(klass, exclude=[])
    default_help_options = {
      type: :boolean,
      default: false,
      desc: 'print this help message and exit'
    }

    klass.commands.each_pair do |name, cmd|
      next if exclude.include? name

      unless self.options_contain_flag(cmd.options, :help)
        help_options = default_help_options.clone
        unless self.options_contain_flag(cmd.options, '-h')
          help_options[:aliases] = ['-h']
        end

        cmd.options[:help] = Thor::Option.new(:help, help_options)

        default_method = cmd.method(:run)
        cmd.define_singleton_method(:run) do |instance, *args|
          if instance.options[:help]
            klass.command_help(instance.shell, cmd.name)
          else
            default_method.call(instance, *args)
          end
        end
      end
    end
  end

  # check if a Thor::Command hash contains a command
  # which either uses the given flag, or alises to it.
  #
  def self.options_contain_flag(options, flag)
    flag = "--#{flag}" if flag.is_a? Symbol

    options.each_pair do |key, value|
      return true if key.to_s == flag

      value.aliases.each do |al|
        return true if al.to_s == flag
      end
    end

    false
  end
end
