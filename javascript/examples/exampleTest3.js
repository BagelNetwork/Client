const {System, Settings} = require('../bagel/config');
const FastAPI = require('../bagel/api/fastapi');
const { v4: uuidv4 } = require('uuid');
const EmbeddingUtil = require('../bagel/utils/embedding_utils');

server_settings = new Settings({
    bagel_server_ssl_enabled: true,
    bagel_api_impl:"rest",
    bagel_server_host:"api.bageldb.ai"
});

const system = new System(server_settings);

const db = new FastAPI(system); // Create a new instance of BagelDB

// Ping the server to check if it's responding
db.ping().then((response) => {
    console.log(response);
}
).catch((error) => {
    console.log(error);
});


db.getAllClusters().then((clusters) => {
    console.log(clusters);
}
).catch((error) => {
    console.log(error);
}
);



const embUtil = new EmbeddingUtil('key', );
const name = String(uuidv4())
db.createCluster(name, embUtil.getOpenAIEmbedding(), true)
db.deleteCluster(name)


cluster = db.getOrCreateCluster("testing", null, embUtil.getOpenAIEmbedding())


cluster._add("test", embUtil.getOpenAIEmbedding("test"))