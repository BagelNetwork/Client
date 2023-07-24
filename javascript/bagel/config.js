class Settings {
    constructor() {
      this.environment = '';
      this.bagel_impl = 'bagel.db.duckdb.DuckDB';
      this.bagel_api_impl = 'bagel.api.fastapi.FastAPI';
      this.bagel_telemetry_impl = 'bagel.telemetry.posthog.Posthog';
      this.clickhouse_host = null;
      this.clickhouse_port = null;
      this.persist_directory = '.bagel';
      this.bagel_server_host = null;
      this.bagel_server_http_port = null;
      this.bagel_server_ssl_enabled = false;
      this.bagel_server_grpc_port = null;
      this.bagel_server_cors_allow_origins = []; // eg ["http://localhost:3000"]
      this.anonymized_telemetry = true;
      this.allow_reset = false;
      this.sqlite_database = ':memory:';
      this.migrations = 'apply';
    }
  
    // Return the value of a required config key, or raise an exception if it is not set
    require(key) {
      const val = this[key];
      if (val === null || val === undefined) {
        throw new Error(`Missing required config value '${key}'`);
      }
      return val;
    }
  
    getConfigValue(key) {
      const legacyConfigValues = {
        rest: 'bagel.api.fastapi.FastAPI',
      };
      let val = this[key];
      // Backwards compatibility with short names instead of full class names
      if (val in legacyConfigValues) {
        const newval = legacyConfigValues[val];
        val = newval;
      }
      return val;
    }
  }
  
  // File: component.js
  class Component {
    constructor(system) {
      this._dependencies = new Set();
      this._system = system;
      this._running = false;
    }
  
    require(type) {
      const inst = this._system.instance(type);
      this._dependencies.add(inst);
      return inst;
    }
  
    dependencies() {
      return this._dependencies;
    }
  
    stop() {
      this._running = false;
    }
  
    start() {
      this._running = true;
    }
  
    reset() {
      // Reset this component's state to its initial blank state. Only intended to be
      // called from tests.
    }
  }
  
  // File: system.js
  class System extends Component {
    constructor(settings) {
      super(settings);
      this.settings = settings;
      this._instances = {};
      // The thin client is a system with only the API component
      this.is_thin_client = false; // Set this value based on your environment
      if (this.is_thin_client) {
        if (
          this.settings.getConfigValue('bagel_api_impl') !==
          'bagel.api.fastapi.FastAPI'
        ) {
          throw new Error(
            "Bagel is running in http-only client mode, and can only be run with 'bagel.api.fastapi.FastAPI' or 'rest' as the bagel_api_impl."
          );
        }
      }
    }
  
    instance(type) {
      // Implement logic for handling abstract classes here if needed
      if (!(type in this._instances)) {
        const impl = new type(this);
        this._instances[type] = impl;
        if (this._running) {
          impl.start();
        }
      }
      return this._instances[type];
    }
  
    components() {
      // Implement logic for retrieving components in dependency order here
      const sorter = new TopologicalSorter();
      for (const component of Object.values(this._instances)) {
        sorter.add(component, ...component.dependencies());
      }
      return sorter.staticOrder();
    }
  
    start() {
      super.start();
      for (const component of this.components()) {
        component.start();
      }
    }
  
    stop() {
      super.stop();
      for (const component of [...this.components()].reverse()) {
        component.stop();
      }
    }
  
    reset() {
      if (!this.settings.allow_reset) {
        throw new Error('Resetting is not allowed by this configuration');
      }
      for (const component of this.components()) {
        component.reset();
      }
    }
  }
  
  // File: utils.js
  // Function to implement getClass based on FQN
  function getClass(fqn, type) {
    // Implement this function to load classes dynamically based on the FQN
    throw new Error('Implement the getClass function to load classes dynamically.');
  }
  
  // Function to implement getFQN for classes
  function getFQN(cls) {
    // Implement this function to get the fully qualified name of a class
    // You may need to use the constructor name and its module to create the FQN
    throw new Error('Implement the getFQN function to get the fully qualified name of a class.');
  }
  
  module.exports = { Settings, System, getClass, getFQN };
  