const {Settings} = require('./utils/settings.js');
const {API} = require('./api/api.js');
const { v4: uuidv4 } = require('uuid');


const example = async () => {
    const settings = new Settings({
        bagel_api_impl:"rest",
        bagel_server_host:"api.bageldb.ai",
        bagel_server_http_port:80,
    });

    const api = new API(settings);

    const response = await api.ping();

    console.log(response);

    const version = await api.get_version();

    console.log(version);

    const clusters = await api.get_all_clusters();

    console.log(clusters);


    const name = String(uuidv4());

    await api.create_cluster(name);

    await api.delete_cluster(name);

    const cluster2 = await api.get_or_create_cluster("new_testing");

    console.log(cluster2);


    // await cluster2.add(
    //     embeddings=[[1.1, 2.3], [4.5, 6.9]],
    //     metadatas=[{"info": "M1"}, {"info": "M1"}],
    //     documents=["doc1", "doc2"],
    //     ids=["id1", "id2"]
    // );


    // await cluster2.find
    //await cluster2.modify(name="new_testing_2");

}


example();