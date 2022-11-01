require "shrine"
require "shrine/storage/file_system"
shrine_storage = Rails.application.config_for :shrine_config

<<<<<<< HEAD
=======
Rails.application.configure do
  config.shrine_storage = ActiveSupport::OrderedOptions.new
  config.shrine_storage.maximum_size = shrine_storage[:maximum_size]
end

>>>>>>> applying-gem-shrine-2
Shrine.storages = {
  cache: Shrine::Storage::FileSystem.new(shrine_storage[:cache]), # temporary
  store: Shrine::Storage::FileSystem.new(shrine_storage[:store]) # permanent
}

Shrine.plugin :activerecord           # loads Active Record integration
<<<<<<< HEAD
Shrine.plugin :keep_files
=======
>>>>>>> applying-gem-shrine-2
Shrine.plugin :derivatives
Shrine.plugin :cached_attachment_data # enables retaining cached file across form redisplays
Shrine.plugin :restore_cached_data    # extracts metadata for assigned cached files
