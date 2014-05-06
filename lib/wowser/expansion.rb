require 'blizzardry'
require 'singleton'

class Wowser::Expansion
  include Singleton

  ARCHIVES = %w(
    common.MPQ
    common-2.MPQ
    expansion.MPQ
    lichking.MPQ
    */locale-*.MPQ
    */speech-*.MPQ
    */expansion-locale-*.MPQ
    */lichking-locale-*.MPQ
    */expansion-speech-*.MPQ
    */lichking-speech-*.MPQ
    */patch-*.MPQ
    patch.MPQ
    patch-*.MPQ
  )

  def archives
    ARCHIVES.map do |archive|
      "data/#{identifier}/#{archive}"
    end
  end

  def archive
    @archive ||= Blizzardry::MPQ.open Dir[*archives], prefix: ''
  end

  def identifier
    self.class.identifier
  end

  alias_method :available?, :archive

  class << self

    def inherited(cls)
      super
      registry[cls.identifier] = cls.instance
    end

    def registry
      @registry ||= {}
    end

    def identifier
      @identifier ||= name.split('::').last.downcase
    end

  end

  require 'wowser/expansion/classic'
  require 'wowser/expansion/tbc'
  require 'wowser/expansion/wotlk'
  require 'wowser/expansion/cataclysm'
  require 'wowser/expansion/mop'
end
