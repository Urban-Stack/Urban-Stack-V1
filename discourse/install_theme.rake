def import_theme(directory)
  puts "Importing theme/component from #{directory}"

  importer = ThemeStore::DirectoryImporter.new(directory)
  importer.import!

  RemoteTheme.send("update_theme",
    importer,
    theme_id: Theme.find_by(name: RemoteTheme.extract_theme_info(importer)["name"])&.id,
  )
end

desc "Install default theme and components from local directories"
task "themes:install:custom" => :environment do |task, args|
  _, theme, *components = ARGV
  t = import_theme(theme)
  t.set_default!
  # disable welcome banner, otherwise this hides the search icon on the main page
  Themes::ThemeSiteSettingManager.call(
    params: {
      theme_id: t.id,
      name: "enable_welcome_banner",
      value: "f"
    },
    guardian: Discourse.system_user.guardian,
  )

  components.each do |c|
    import_theme(c).parent_themes = [t]
  end
end
