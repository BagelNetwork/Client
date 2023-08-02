const config = {
    // default params
    default: {
        // client type
        is_thin_client: false,
        // logging
        logger: {
            info: console.log,
            error: console.error,
            debug: console.debug,
        },
        // legacy config values
        legacy_config_values: {
            rest: "bagel.api.fastapi.FastAPI",
        },
        // abstract type keys
        abstract_type_keys: {
            "bagel.api.API": "bagel_api_impl",
        },
        // environment file
        environment_file: "env",
        environment_file_encoding: "utf-8",
    },
};


module.exports = {config};