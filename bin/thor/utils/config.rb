require 'yaml'

class String
  def to_identifier
    self.gsub(/(?:\s|-)+/, "_").downcase.to_sym
  end
end

module Utils
  module Config
    def hugo_config
      @hugo_config ||= {}.tap do |cfg|
        Dir.chdir($root) do
          cfg.update(YAML.load(File.read("config.yml")))
        end
      end
    end

    def yarn_config
      unless @yarn_config
        config_path = File.join($root, '.yarnrc')
        @yarn_config = {
          modules_folder: 'node_modules',
        }

        if File.exist?(config_path)
          File.open(config_path, 'r') do |fd|
            fd.each_line do |line|
              line = line.strip # no trailing \n

              if line =~ /--(.+)\s+(.+)$/
                @yarn_config[$1.to_identifier] = $2
              end
            end
          end
        end
      end

      @yarn_config
    end

    # true when yarn is installing to node_modules.
    #
    def node_modules?
      yarn_config[:modules_folder] == 'node_modules'
    end

    def archetypes_list
      arch_dir = dirs[:archetypes]

      Dir.children(arch_dir).map do |path|
        full_path = File.join(arch_dir, path)

        if File.directory?(full_path)
          path
        else
          File.basename(path, '.*')
        end
      end
    end

    def dirs
      unless @dirs
        @dirs = {}

        [[:archetypes, 'archetypeDir', 'archetypes'],
         [:config, 'configDir', 'config'],
         [:asset, 'assetDir', 'assets'],
         [:content, 'contentDir', 'content'],
         [:data, 'dataDir', 'data'],
         [:layout, 'layoutDir', 'layout'],
         [:static, 'staticDir', 'static'],
         [:publish, 'publishDir', 'public'],
         [:themes, 'themesDir', 'themes'],
         [:resource, 'resourceDir', 'resources']]
          .each do |key, cfg_key, default|
          @dirs[key] = File.join($root, hugo_config.fetch(cfg_key, default))
        end
      end

      @dirs
    end
  end

  def node_or_npm
    @node_or_npm ||= in_root do
      if File.exist?('yarn.lock')
        :yarn
      elsif File.exist?('package-lock.json')
        :npm
      elsif $stdin.isatty && !options['no_confirm']
        ask('which package manager would you like to use?',
            limited_to: %w[npm yarn]).to_sym
      end
    end
  end
end
