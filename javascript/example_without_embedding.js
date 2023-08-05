async function example(api) {
    // ping server
    const response = await api.ping();
    console.log(response);

    // get version
    const version = await api.get_version();
    console.log(version);

    // get all clusters
    const clusters = await api.get_all_clusters();
    console.log(clusters);

    // create a new cluster
    const name = 'my_test_cluster_3000'
    await api.create_cluster(name);

    // delete a cluster
    await api.delete_cluster(name);


    // get or create a cluster
    const newName = "testing";

    const cluster = await api.get_or_create_cluster(newName);

    // add data to the cluster
    await cluster.add(
        ids = ['i31', 'i32', 'i33'],
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


    // peek into the cluster
    const peeks = await cluster.peek(10);
    console.log(peeks);


    // find data in the cluster
    const results = await cluster.find_by_text(
        query_texts = ["This"],
        n_results = 5,
        where = { source: "notion" },
        where_document = { $contains: "is" }
    );

    console.log(results);
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
example(api);