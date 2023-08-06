// imports
const {Settings, Client} = require('./BagelDB.js');


// example for new javascript api
const ping_version_example = async () => {
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
}


// example for get all clusters
const get_all_clusters_example = async () => {
    // create settings
    const settings = new Settings({
        bagel_api_impl:"rest",
        bagel_server_host:"api.bageldb.ai",
        bagel_server_http_port:80,
    });

    // create api
    const api = new Client(settings);

    // get all clusters
    const clusters = await api.get_all_clusters();
    console.log(clusters);
}


// example for create/delete cluster and get or create cluster
const create_delete_get_or_create_cluster_example = async () => {
    // create settings
    const settings = new Settings({
        bagel_api_impl:"rest",
        bagel_server_host:"api.bageldb.ai",
        bagel_server_http_port:80,
    });

    // create api
    const api = new Client(settings);

    // create a new cluster
    const name = 'my_test_cluster_200000'
    await api.create_cluster(name).then((res) => {
        if(res.name === name) {
            console.log(`Cluster with name ${name} created successfully`);
        }
    }).catch((err) => {
        console.log(err);
    });

    // delete a cluster
    await api.delete_cluster(name);


    // get or create a cluster
    const cluster = await api.get_or_create_cluster("my_test_cluster_200000");


    // delete a cluster
    await api.delete_cluster("my_test_cluster_200000");
}




// example for add data to the cluster (without embeddings)
const add_data_to_cluster_without_embedding_example = async () => {
    // create settings
    const settings = new Settings({
        bagel_api_impl:"rest",
        bagel_server_host:"api.bageldb.ai",
        bagel_server_http_port:80,
    });

    // create api
    const api = new Client(settings);

    // get or create a cluster
    const newName = "testing_10";

    const cluster = await api.get_or_create_cluster(newName);

    // add data to the cluster
    await cluster.add(
        ids = ['i37', 'i38', 'i39'],
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
    ).then((res) => {
        if(res){
            console.log("Data added successfully");
        }
    }).catch((err) => {
        console.log(err);
    });


    // peek into the cluster
    const peeks = await cluster.peek(10);
    console.log(peeks);


    // find data in the cluster
    const results = await cluster.find(
        query_embeddings = null,
        n_results = 5,
        where = { source: "notion" },
        where_document = { $contains: "is" },
        include = ["metadatas", "documents", "distances"],
        query_texts = ["This"]
    );
    console.log(results);
}



// example for add data to the cluster (with embeddings)
const add_data_to_cluster_with_embedding_example = async () => {
    // create settings
    const settings = new Settings({
        bagel_api_impl:"rest",
        bagel_server_host:"api.bageldb.ai",
        bagel_server_http_port:80,
    });

    // create api
    const api = new Client(settings);

    // get or create a cluster
    const newName = "testing_20";

    const cluster = await api.get_or_create_cluster(newName);

    // add data to the cluster
    await cluster.add(
        ids = ["id1", "id2"],
        embeddings = [[1.1, 2.3], [4.5, 6.9]],
        metadatas = [{"info": "M1"}, {"info": "M1"}],
        documents = ["doc1", "doc2"]
    ).then((res) => {
        if(res){
            console.log("Data added successfully");
        }
    }).catch((err) => {
        console.log(err);
    });


    // peek into the cluster
    const peeks = await cluster.peek(10);
    console.log(peeks);


    // find data in the cluster
    const results = await cluster.find(
        query_embeddings = [[1.1, 2.3]],
        n_results = 5,
        where = { info: "M1" },
        where_document = { $contains: "doc" },
        include = ["metadatas", "documents", "distances"],
        query_texts = null
    );
    console.log(results);
}


// example for delete data from the cluster
const delete_data_from_cluster_example = async () => {
    // create settings
    const settings = new Settings({
        bagel_api_impl:"rest",
        bagel_server_host:"api.bageldb.ai",
        bagel_server_http_port:80,
    });

    // create api
    const api = new Client(settings);

    // get or create a cluster
    const newName = "testing_30";

    const cluster = await api.get_or_create_cluster(newName);

    // add data to the cluster
    await cluster.add(
        ids = ["id1", "id2"],
        embeddings = [[1.1, 2.3], [4.5, 6.9]],
        metadatas = [{"info": "M1"}, {"info": "M1"}],
        documents = ["doc1", "doc2"]
    ).then((res) => {
        if(res){
            console.log("Data added successfully");
        }
    }).catch((err) => {
        console.log(err);
    });


    // delete data from the cluster
    await cluster.delete(
        ids = ["id1"],
        where = {},
        where_document = {}
    ).then((res) => {
        if(res){
            console.log("Data deleted successfully");
        }
    }).catch((err) => {
        console.log(err);
    });


    // peek into the cluster
    const peeks = await cluster.peek(10);
    console.log(peeks);
}



// example for update data in the cluster
const update_data_in_cluster_example = async () => {
    // create settings
    const settings = new Settings({
        bagel_api_impl:"rest",
        bagel_server_host:"api.bageldb.ai",
        bagel_server_http_port:80,
    });

    // create api
    const api = new Client(settings);

    // get or create a cluster
    const newName = "testing_40";

    const cluster = await api.get_or_create_cluster(newName);

    // add data to the cluster
    await cluster.add(
        ids = ["id1", "id2"],
        embeddings = [[1.1, 2.3], [4.5, 6.9]],
        metadatas = [{"info": "M1"}, {"info": "M1"}],
        documents = ["doc1", "doc2"]
    ).then((res) => {
        if(res){
            console.log("Data added successfully");
        }
    }).catch((err) => {
        console.log(err);
    });


    // update data in the cluster
    await cluster.update(
        ids = ["id1"],
        embeddings = [[10.1, 20.3]],
        metadatas = [{"info": "M1"}],
        documents = ["doc1"]
    ).then((res) => {
        if(res){
            console.log("Data updated successfully");
        }
    }
    ).catch((err) => {
        console.log(err);
    });


    // peek into the cluster
    const peeks = await cluster.peek(10);
    console.log(peeks);
}



// example for upsert data in the cluster
const upsert_data_in_cluster_example = async () => {
    // create settings
    const settings = new Settings({
        bagel_api_impl:"rest",
        bagel_server_host:"api.bageldb.ai",
        bagel_server_http_port:80,
    });

    // create api
    const api = new Client(settings);

    // get or create a cluster
    const newName = "testing_50";

    const cluster = await api.get_or_create_cluster(newName);

    // add data to the cluster
    await cluster.add(
        ids = ["id1", "id2"],
        embeddings = [[1.1, 2.3], [4.5, 6.9]],
        metadatas = [{"info": "M1"}, {"info": "M1"}],
        documents = ["doc1", "doc2"]
    ).then((res) => {
        if(res){
            console.log("Data added successfully");
        }
    }).catch((err) => {
        console.log(err);
    });


    // upsert data in the cluster
    await cluster.upsert(
        ids = ["id1", "id3"],
        embeddings = [[15.1, 25.3], [30.1, 40.3]],
        metadatas = [{"info": "M1"}, {"info": "M1"}],
        documents = ["doc1", "doc3"]
    ).then((res) => {
        if(res){
            console.log("Data upserted successfully");
        }
    }
    ).catch((err) => {
        console.log(err);
    });


    // peek into the cluster
    const peeks = await cluster.peek(10);
    console.log(peeks);
}



// example for modify cluster name and metadata
const modify_cluster_name_and_metadata_example = async () => {
    // create settings
    const settings = new Settings({
        bagel_api_impl:"rest",
        bagel_server_host:"api.bageldb.ai",
        bagel_server_http_port:80,
    });

    // create api
    const api = new Client(settings);

    // get or create a cluster
    const newName = "testing_70";

    const cluster = await api.get_or_create_cluster(newName);

    // add data to the cluster
    await cluster.add(
        ids = ["id1", "id2"],
        embeddings = [[1.1, 2.3], [4.5, 6.9]],
        metadatas = [{"info": "M1"}, {"info": "M1"}],
        documents = ["doc1", "doc2"]
    ).then((res) => {
        if(res){
            console.log("Data added successfully");
        }
    }).catch((err) => {
        console.log(err);
    });


    // modify cluster name and metadata
    await cluster.modify(
        name = "testing_80",
        metadata = {"info": "M2"}
    ).then((res) => {
        if(res){
            console.log("Cluster modified successfully");
        }
    }
    ).catch((err) => {
        console.log(err);
    });


    // peek into the cluster
    const peeks = await cluster.peek(10);
    console.log(peeks);
}



// run examples
ping_version_example();
get_all_clusters_example();
create_delete_get_or_create_cluster_example();
add_data_to_cluster_without_embedding_example();
add_data_to_cluster_with_embedding_example();
delete_data_from_cluster_example();
update_data_in_cluster_example();
upsert_data_in_cluster_example();
create_index_in_cluster_example();
modify_cluster_name_and_metadata_example();

