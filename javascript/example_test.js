async function createAddFind(api) {
    const name = "testing";

    const cluster = await api.get_or_create_cluster(name);

    await cluster.add(
        ids = ['i13', 'i14', 'i15'],
        embeddings = null,
        metadatas = [
            { source: "notion" },
            { source: "notion" },
            { source: "google-doc" }
        ],
        documents = [
            "This is document",
            "This is Towhid",
            "This is text",
        ],
    );

    const results = await cluster.find_by_text(
        query_texts = ["This"],
        n_results = 5,
        where = { source: "notion" },
        where_document = { $contains: "is" }
    );

    console.log(results);
    console.log(">> create_add_find done !\n");
}


const {Settings, Client} = require('./BagelDB.js');
const settings = new Settings({
    bagel_api_impl:"rest",
    bagel_server_host:"localhost",
    bagel_server_http_port:8000,
});

// create api
const api = new Client(settings);

// test
createAddFind(api);