const config = require('./config.js')

class Settings {
  constructor (options = {}) {
    // default params
    this.environment = ''
    this.bagel_api_impl = 'bagel.api.fastapi.FastAPI'
    this.clickhouse_host = null
    this.clickhouse_port = null
    this.persist_directory = '.bagel'
    this.bagel_server_host = null
    this.bagel_server_http_port = null
    this.bagel_server_ssl_enabled = false
    this.bagel_server_grpc_port = null
    this.bagel_server_cors_allow_origins = []
    this.anonymized_telemetry = true
    this.allow_reset = false
    this.sqlite_database = ':memory:'
    this.migrations = 'apply'

    // override defaults
    Object.keys(options).forEach((key) => {
      this[key] = options[key]
    })
  }

  require (key) {
    const val = this[key]
    if (val === undefined || val === null) {
      throw new Error(`Missing required config value '${key}'`)
    }
    return val
  }

  // In JavaScript, we cannot directly access class attributes like in Python.
  // Instead, we can define getter methods to achieve similar functionality.
  get (key) {
    const val = this[key]
    // Backwards compatibility with short names instead of full class names
    if (config.default.legacy_config_values[val]) {
      return config.default.legacy_config_values[val]
    }
    return val
  }
};

module.exports = { Settings }
