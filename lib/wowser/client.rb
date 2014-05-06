require 'pathname'
require 'sinatra/asset_pipeline'
require 'sinatra/base'
require 'sinatra/reloader'

class Wowser::Client < Sinatra::Base

  configure do
    set :root, Pathname.pwd

    register Sinatra::AssetPipeline

    # Locate vendor assets installed through Bower
    sprockets.append_path File.join(root, 'vendor', 'assets')

    # Disable CoffeeScript's anonymous function wrap
    Tilt::CoffeeScriptTemplate.default_bare = true
  end

  configure :development do
    register Sinatra::Reloader

    # Configure Sprockets' caching mechanism manually as it defaults to none
    # See: https://github.com/middleman/middleman-sprockets/pull/25
    sprockets.cache = {}
  end

  get '/' do
    erb :index
  end

end
