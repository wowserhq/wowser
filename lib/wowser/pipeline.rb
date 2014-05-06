require 'pathname'
require 'sinatra/base'
require 'sinatra/reloader'

class Wowser::Pipeline < Sinatra::Base

  configure do
    set :root, Pathname.pwd
  end

  configure :development do
    register Sinatra::Reloader
  end

  def initialize(expansion)
    @expansion = expansion
    super()
  end

  def normalize_path!(path)
    path.gsub! '/', '\\'
  end

  get '/dbc/:resource/:id' do |resource, id|
    halt 404 unless @expansion.class.const_defined? :DBC

    # TODO: Serve requested DBC record in JSON-format
  end

  get %r{/(.+\.m2)\.3geo$} do |path|
    normalize_path! path
    halt 404 unless @expansion.archive.contains? path

    # TODO: Convert requested model to ThreeJS geometry
  end

end
