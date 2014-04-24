lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

require 'wowser'

map '/' do
  run Wowser::Client
end

Wowser::Expansion.registry.each do |identifier, expansion|
  map "/#{identifier}" do
    run Wowser::Pipeline.new(expansion)
  end if expansion.available?
end
