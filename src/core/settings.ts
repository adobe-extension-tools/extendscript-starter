const SETTINGS_NAMESPACE = 'YourCoolExtension'

const DEFAULT_SETTINGS = {
  language: 'en'
}

export function getSettings() {
  const settingKeys = Object.keys(DEFAULT_SETTINGS)
  settingKeys.forEach(key => {
    if (!app.settings.haveSetting(SETTINGS_NAMESPACE, key)) {
      app.settings.saveSetting(SETTINGS_NAMESPACE, key, DEFAULT_SETTINGS[key])
    }
  })
  const result = {}
  settingKeys.forEach(key => {
    result[key] = app.settings.getSetting(SETTINGS_NAMESPACE, key)
  })
  return result
}

export function getSetting(key) {
  const settings = getSettings()
  return settings[key]
}

export function saveSetting(key, value) {
  app.settings.saveSetting(SETTINGS_NAMESPACE, key, value)
}

export function resetSettings() {
  Object.keys(DEFAULT_SETTINGS).forEach(key =>
    saveSetting(key, DEFAULT_SETTINGS[key])
  )
}
