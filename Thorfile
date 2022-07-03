#!/usr/bin/env thor

require 'rake'
require 'yaml'
require 'logger'
require 'shellwords'
require 'bundler/setup'

begin
  require 'colorize' # pretty strings
rescue LoadError
  # pretty printing unavailable :(
  # just define some dummy methods
  class String
    ignore = ->(*args) { self } # do nothing

    [
      :default,
      :colorize,
      :black,  :light_black,
      :red,    :light_red,
      :green,  :light_green,
      :yellow, :light_yellow,
      :blue,   :light_blue,
      :magenta,:light_magenta,
      :cyan,   :light_cyan,
      :white,  :light_white
    ].each { |name| define_method(name, ignore) }
  end
end

$root = File.dirname(__FILE__)

Dir.glob(File.expand_path('./bin/thor/utils/*.rb'))
  .each(&method(:require))

Dir.chdir($root) do
  Dir.glob('./bin/thor/*.thor')
    .sort.each(&method(:load))
end
