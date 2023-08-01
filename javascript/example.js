// imports
const {Settings, Client} = require('./BagelDB.js');

// example for new javascript api
const connect_client = async () => {
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
};


const get_create_delete_cluster = async () => {
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

    // create a new cluster
    const name = 'my_test_cluster_1111';
    await api.create_cluster(name);

    // delete a cluster
    await api.delete_cluster(name);
};

const add_data_to_cluster = async () => {
    // create settings
    const settings = new Settings({
        bagel_api_impl:"rest",
        bagel_server_host:"api.bageldb.ai",
        bagel_server_http_port:80,
    });

    // create api
    const api = new Client(settings);

    // get or create a cluster
    const cluster = await api.get_or_create_cluster("my_test_cluster_1111");
    console.log(cluster);

    // add data to the cluster
    await cluster.add(
        ids = ["id1", "id2"],
        embeddings = [[1.1, 2.3], [4.5, 6.9]],
        metadatas = [{"info": "M1"}, {"info": "M1"}],
        documents = ["doc1", "doc2"]
    );
};


const peek_find_in_cluster = async () => {
    // create settings
    const settings = new Settings({
        bagel_api_impl:"rest",
        bagel_server_host:"api.bageldb.ai",
        bagel_server_http_port:80,
    });

    // create api
    const api = new Client(settings);

    // get or create a cluster
    const cluster = await api.get_or_create_cluster("my_test_cluster_1111");
    console.log(cluster);

    // peek into the cluster
    const peeks = await cluster.peek(10);
    console.log(peeks);


    // find data in the cluster
    const results = await cluster.find(query_embeddings=[[1.1, 2.3]]);
};


/*
Server not responding/returning null response
*/

// const modify_cluster_name = async () => {
//     // create settings
//     const settings = new Settings({
//         bagel_api_impl:"rest",
//         bagel_server_host:"api.bageldb.ai",
//         bagel_server_http_port:80,
//     });

//     // create api
//     const api = new Client(settings);

//     // get or create a cluster
//     const cluster = await api.get_or_create_cluster("my_test_cluster_113");
//     console.log(cluster);

//     // modify cluster name
//     await cluster.modify("my_test_cluster_313");
// };


const update_upsert_cluster = async () => {
    // create settings
    const settings = new Settings({
        bagel_api_impl:"rest",
        bagel_server_host:"api.bageldb.ai",
        bagel_server_http_port:80,
    });

    // create api
    const api = new Client(settings);

    // get or create a cluster
    const cluster = await api.get_or_create_cluster("my_test_cluster_1111");
    console.log(cluster);

    // update data in the cluster
    await cluster.update(
        ids = ["id1", "id2"],
        embeddings = [[1.9, 4.3], [2.5, 8.9]]
    );


    // upsert data in the cluster
    await cluster.upsert(
        ids = ["id3"],
        embeddings = [[9.9, 16.3]],
        metadatas = [{"info": "M3"}],
        documents = ["doc3"],
    );

};


// run examples - one at a time
// connect_client();
// get_create_delete_cluster();
// add_data_to_cluster();
// peek_find_in_cluster();
// update_upsert_cluster();
// peek_find_in_cluster();
