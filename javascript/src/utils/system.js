const config = require('./config.js');

export class System {
    constructor(settings){
        this.settings = settings;
        this._instance = {};

        // check if thin client
        if(config.default.is_thin_client) {
            if(this.settings.bagel_api_impl !== 'bagel.api.fastapi.FastAPI') {
                throw new Error("Bagel is running in http-only client mode, and can only be run with 'bagel.api.fastapi.FastAPI' or 'rest' as the bagel_api_impl.");
            }
        }
    }

    

