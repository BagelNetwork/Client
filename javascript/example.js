// imports
const {Settings, Client} = require('./BagelDB.js');

// example for new javascript api
const example = async () => {
    // create settings
    const settings = new Settings({
        bagel_api_impl:"rest",
        bagel_server_host:"api.bageldb.ai",
        bagel_server_http_port:80,
    });

    // create api
    const api = new Client(settings);

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
    const name = 'my_test_cluster_200000'
    await api.create_cluster(name);

    // delete a cluster
    await api.delete_cluster(name);


    // get or create a cluster
    const cluster = await api.get_or_create_cluster("my_test_cluster_200000");
    console.log(cluster);

    // add data to the cluster
    await cluster.add(
        ids = ["id1", "id2"],
        embeddings = [[1.1, 2.3], [4.5, 6.9]],
        metadatas = [{"info": "M1"}, {"info": "M1"}],
        documents = ["doc1", "doc2"]
    );


    // peek into the cluster
    const peeks = await cluster.peek(10);
    console.log(peeks);


    // find data in the cluster
    const results = await cluster.find(query_embeddings=[[1.1, 2.3]], n_results=2, where={}, where_document={}, include=["metadatas", "documents", "distances"], query_texts=null);
    console.log(results);


    // modify cluster name
    await cluster.modify("my_test_cluster_200001");


    // update data in the cluster
    await cluster.update(
        ids = ["id1", "id2"],
        embeddings = [[1.9, 4.3], [2.5, 8.9]]
    );


    // peek into the cluster
    const peeks2 = await cluster.peek(10);
    console.log(peeks2);


    // upsert data in the cluster
    await cluster.upsert(
        ids = ["id3"],
        embeddings = [[9.9, 16.3]],
        metadatas = [{"info": "M3"}],
        documents = ["doc3"],
    );


    // peek into the cluster
    const peeks3 = await cluster.peek(10);
    console.log(peeks3);


    // delete the cluster
    await api.delete_cluster("my_test_cluster_200001");

};


example();