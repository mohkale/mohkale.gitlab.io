# frozen_string_literal: true

require 'html-proofer'

# test the built site.
#
class Test < Thor
  extend ThorUtils

  def self.exit_on_failure?
    true
  end

  class_option :output,
               aliases: '-o',
               desc: 'specify output directory to test'

  desc 'site', 'test the site'
  def site
    invoke :html
  end

  desc 'html', 'test produced html output'
  def html
    output = options[:output] || dirs[:publish]
    proofer_options[:verbose] = true if options[:verbose]

    begin
      in_root do
        HTMLProofer.check_directory(output, proofer_options).run
      end
    rescue RuntimeError => e
      puts e.to_s
      exit 1
    end
  end

  no_commands do
    def proofer_options
      # see here: https://github.com/gjtorikian/html-proofer
      @proofer_options ||= {
        :assume_extension => true,
        :check_favicon => true,
        :check_html => true,
        :disable_external => true,
        :empty_alt_ignore => true,
        :allow_hash_ref => true,
        :url_ignore => [/^\/livereload.js/],
        :file_ignore => [/\/brain\//],

        # HTML options
        :validation => {
          :report_eof_tags => true,
          :report_invalid_tags => true,
          :report_missing_names => true,
          #:report_mismatched_tags => true,
          :report_missing_doctype => true
        },

        :parallel => {
          :in_processes => 3
        },

        # link checking
        :cache => {
          :timeframe => '1w'
        },

        :typhoeus => {
          :followlocation => true,
          :connecttimeout => 10,
          :timeout => 30
        },

        :hydra => {
          :max_concurrency => 50
        }
      }
    end
  end
end

Utils.setup(Test)
Test.verbose_class_options
