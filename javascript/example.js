// imports
const { Settings, Client } = require("./BagelDB.js");
const fs = require("fs");
require("dotenv").config();

// example for new javascript api
const ping_version_example = async () => {
  // create settings
  const settings = new Settings({
    bagel_api_impl: "rest",
    bagel_server_host: "api.bageldb.ai",
    bagel_server_http_port: 80,
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

// JavaScript equivalent to check_emaillist in Python
const checkEmailList = async (api) => {
  const validEmail = "example@gmail.com";
  const response = await api.joinWaitlist(validEmail);
  console.log(">> ", response);
};

// Uses UUID for unique names, directly translating the Python logic
const { v4: uuidv4 } = require("uuid");

const createAndDeleteCluster = async (api) => {
  const name = uuidv4();
  console.log(name);

  const cluster = await api.createCluster(name);
  console.log(`cluster size ${cluster.clusterSize} mb`);
  console.log(`embedding size ${cluster.embeddingSize}`);

  await api.deleteCluster(name);
  console.log(">> create and delete done !");
};

const createAddGet = async (api) => {
  const name = "testing";
  const cluster = await api.getOrCreateCluster(name);

  await cluster.add({
    documents: ["This is document1", "This is bidhan"],
    metadatas: [{ source: "google" }, { source: "notion" }],
    ids: [uuidv4(), uuidv4()],
  });

  const count = await cluster.count();
  console.log("count of docs:", count);

  const firstItem = await cluster.peek(1);
  if (firstItem) {
    console.log("get 1st item");
  }

  await api.deleteCluster(name);
  console.log(">> create_add_get done !");
};

const createAddFind = async (api) => {
  const name = "testing";
  const cluster = await api.getOrCreateCluster(name);

  await cluster.add({
    documents: ["This is document", "This is Towhid", "This is text"],
    metadatas: [
      { source: "notion" },
      { source: "notion" },
      { source: "google-doc" },
    ],
    ids: [uuidv4(), uuidv4(), uuidv4()],
  });

  const results = await cluster.find({
    queryTexts: ["This"],
    nResults: 5,
    where: { source: "notion" },
    whereDocument: { $contains: "is" },
  });

  console.log(results);
  await api.deleteCluster(name);
  console.log(">> create_add_find done !");
};

const createAddFindEmbeddings = async (api) => {
  const name = "testing_embeddings";
  const cluster = await api.getOrCreateCluster(name);

  try {
    await cluster.add({
      embeddings: [
        [1.1, 2.3, 3.2],
        [4.5, 6.9, 4.4],
        [1.1, 2.3, 3.2],
        [4.5, 6.9, 4.4],
        [1.1, 2.3, 3.2],
        [4.5, 6.9, 4.4],
        [1.1, 2.3, 3.2],
        [4.5, 6.9, 4.4],
      ],
      metadatas: [
        { uri: "img1.png", style: "style1" },
        { uri: "img2.png", style: "style2" },
        { uri: "img3.png", style: "style1" },
        { uri: "img4.png", style: "style1" },
        { uri: "img5.png", style: "style1" },
        { uri: "img6.png", style: "style1" },
        { uri: "img7.png", style: "style1" },
        { uri: "img8.png", style: "style1" },
      ],
      documents: [
        "doc1",
        "doc2",
        "doc3",
        "doc4",
        "doc5",
        "doc6",
        "doc7",
        "doc8",
      ],
      ids: ["id1", "id2", "id3", "id4", "id5", "id6", "id7", "id8"],
    });
  } catch (exc) {
    console.log(exc);
  }

  const results = await cluster.find({
    queryEmbeddings: [[1.1, 2.3, 3.2]],
    nResults: 5,
  });

  console.log("find result:", results);
  await api.deleteCluster(name);
  console.log(">> create_add_find_em done !");
};

const createAddModifyUpdate = async (api) => {
  const name = "testing";
  const new_name = "new_" + name;

  const cluster = await api.getOrCreateCluster(name);
  console.log("Before:", cluster.name);

  try {
    await cluster.modify({ name: new_name });
  } catch (exc) {
    console.log(exc);
  }

  console.log("After:", cluster.name);

  await cluster.add({
    documents: ["This is document1", "This is bidhan"],
    metadatas: [{ source: "notion" }, { source: "google" }],
    ids: ["id1", "id2"],
  });

  console.log("Before update:");
  console.log(await cluster.get({ ids: ["id1"] }));

  await cluster.update({
    ids: ["id1"],
    metadatas: [{ source: "google" }],
  });

  console.log("After update source:");
  console.log(await cluster.get({ ids: ["id1"] }));
  await api.deleteCluster(new_name);
  console.log(">> create_add_modify_update done !");
};

const createUpsert = async (api) => {
  const name = "testing";

  const cluster = await api.getOrCreateCluster(name);

  try {
    await cluster.add({
      documents: ["This is document1", "This is bidhan"],
      metadatas: [{ source: "notion" }, { source: "google" }],
      ids: ["id1", "id2"],
    });
  } catch (exc) {
    console.log("add warning: ", exc);
  }

  try {
    await cluster.upsert({
      documents: ["This is document", "This is google"],
      metadatas: [{ source: "notion" }, { source: "google" }],
      ids: ["id1", "id3"],
    });
  } catch (exc) {
    console.log("upsert warning: ", exc);
  }

  console.log("Count of documents :", await cluster.count());
  await api.deleteCluster(name);
  console.log(">> create_upsert done !");
};

const addImageFind = async (api) => {
  const name = "image_add_test";
  const cluster = await api.getOrCreateCluster(name, {
    embeddingModel: "bagel-multi-modal",
  });

  // Assuming an API method exists for adding images directly
  const imgFileList = ["./image_emb/test.jpg", "./image_emb/test.png"];
  for (const filename of imgFileList) {
    const image = fs.readFileSync(filename);
    const resp = await cluster.addImage({
      image: Buffer.from(image).toString("base64"),
      name: filename,
    });
    console.log("---------------\n", resp);
  }

  console.log("count of images:", await cluster.count());

  const embeddings = (await cluster.peek(1))[0].embeddings; // Adjust based on actual API response
  const results = await cluster.find({
    queryEmbeddings: embeddings,
    nResults: 5,
  });
  console.log(results);
  await api.deleteCluster(name);
  console.log(">> add_image_find done !");
};
const addImageURLsFind = async (api) => {
  const name = "image_add_urls_testing";
  const cluster = await api.getOrCreateCluster(name);
  const urls = [
    "https://example.com/cat.jpg",
    "https://example.com/dog.jpg",
    // Add more URLs as needed
  ];
  const ids = urls.map(() => uuidv4());

  const resp = await cluster.addImageURLs({ ids: ids, urls: urls });
  console.log("count of images:", await cluster.count());

  const embeddings = (await cluster.peek(1))[0].embeddings; // Adjust based on actual API response
  const results = await cluster.find({
    queryEmbeddings: embeddings,
    nResults: 5,
  });
  console.log(results);
  await api.deleteCluster(name);
  console.log(">> add_image_urls_find done !");
};

// example for get all clusters
const get_all_clusters_example = async () => {
  // create settings
  const settings = new Settings({
    bagel_api_impl: "rest",
    bagel_server_host: "api.bageldb.ai",
    bagel_server_http_port: 80,
  });

  // create api
  const api = new Client(settings);

  // get all clusters
  const clusters = await api.get_all_clusters();
  console.log(clusters);
};

// example for create/delete cluster and get or create cluster
const create_delete_get_or_create_cluster_example = async () => {
  // create settings
  const settings = new Settings({
    bagel_api_impl: "rest",
    bagel_server_host: "api.bageldb.ai",
    bagel_server_http_port: 80,
  });

  // create api
  const api = new Client(settings);

  // create a new cluster
  const name = "my_test_cluster_200000";
  await api
    .create_cluster(name)
    .then((res) => {
      if (res.name === name) {
        console.log(`Cluster with name ${name} created successfully`);
      }
    })
    .catch((err) => {
      console.log(err);
    });

  // delete a cluster
  await api.delete_cluster(name);

  // get or create a cluster
  const cluster = await api.get_or_create_cluster("my_test_cluster_200000");
  console.log(cluster);

  // delete a cluster
  await api.delete_cluster("my_test_cluster_200000");
};

// example for add data to the cluster (without embeddings)
const add_data_to_cluster_without_embedding_example = async () => {
  // create settings
  const settings = new Settings({
    bagel_api_impl: "rest",
    bagel_server_host: "api.bageldb.ai",
    bagel_server_http_port: 80,
  });

  // create api
  const api = new Client(settings);

  // get or create a cluster
  const newName = "testing_1000";

  const cluster = await api.get_or_create_cluster(newName);

  // add data to the cluster
  await cluster
    .add(
      (ids = ["i37", "i38", "i39"]),
      (embeddings = null),
      (metadatas = [
        { source: "notion" },
        { source: "notion" },
        { source: "google-doc" },
      ]),
      (documents = ["This is document", "This is Towhid", "This is text"])
    )
    .then((res) => {
      if (res) {
        console.log("Data added successfully");
      }
    })
    .catch((err) => {
      console.log(err);
    });

  // peek into the cluster
  const peeks = await cluster.peek(10);
  console.log("peek result: ", peeks);

  // find data in the cluster
  console.log("query result: ");
  await cluster.find(
    (query_embeddings = null),
    (n_results = 5),
    (where = { source: "notion" }),
    (where_document = { $contains: "is" }),
    (include = ["metadatas", "documents", "distances"]),
    (query_texts = ["This"])
  );

  // delete the cluster
  await api.delete_cluster(newName);
};

// example for add data to the cluster (with embeddings)
const add_data_to_cluster_with_embedding_example = async () => {
  // create settings
  const settings = new Settings({
    bagel_api_impl: "rest",
    bagel_server_host: "api.bageldb.ai",
    bagel_server_http_port: 80,
  });

  // create api
  const api = new Client(settings);

  // get or create a cluster
  const newName = "testing_2000";

  const cluster = await api.get_or_create_cluster(newName);

  // add data to the cluster
  await cluster
    .add(
      (ids = ["id1", "id2"]),
      (embeddings = [
        [1.1, 2.3],
        [4.5, 6.9],
      ]),
      (metadatas = [{ info: "M1" }, { info: "M1" }]),
      (documents = ["doc1", "doc2"])
    )
    .then((res) => {
      if (res) {
        console.log("Data added successfully");
      }
    })
    .catch((err) => {
      console.log(err);
    });

  // peek into the cluster
  const peeks = await cluster.peek(10);
  console.log("peek result: ", peeks);

  // find data in the cluster
  console.log("query result: ");
  await cluster.find(
    (query_embeddings = [[1.1, 2.3]]),
    (n_results = 5),
    (where = { info: "M1" }),
    (where_document = { $contains: "doc" }),
    (include = ["metadatas", "documents", "distances"]),
    (query_texts = null)
  );

  // delete the cluster
  await api.delete_cluster(newName);
};

// example for delete data from the cluster
const delete_data_from_cluster_example = async () => {
  // create settings
  const settings = new Settings({
    bagel_api_impl: "rest",
    bagel_server_host: "api.bageldb.ai",
    bagel_server_http_port: 80,
  });

  // create api
  const api = new Client(settings);

  // get or create a cluster
  const newName = "testing_3000";

  const cluster = await api.get_or_create_cluster(newName);

  // add data to the cluster
  await cluster
    .add(
      (ids = ["id1", "id2"]),
      (embeddings = [
        [1.1, 2.3],
        [4.5, 6.9],
      ]),
      (metadatas = [{ info: "M1" }, { info: "M1" }]),
      (documents = ["doc1", "doc2"])
    )
    .then((res) => {
      if (res) {
        console.log("Data added successfully");
      }
    })
    .catch((err) => {
      console.log(err);
    });

  // delete data from the cluster
  await cluster
    .delete((ids = ["id1"]), (where = {}), (where_document = {}))
    .then((res) => {
      if (res) {
        console.log("Data deleted successfully");
      }
    })
    .catch((err) => {
      console.log(err);
    });

  // peek into the cluster
  const peeks = await cluster.peek(10);
  console.log("peek result: ", peeks);

  // delete the cluster
  await api.delete_cluster(newName);
};

// example for update data in the cluster
const update_data_in_cluster_example = async () => {
  // create settings
  const settings = new Settings({
    bagel_api_impl: "rest",
    bagel_server_host: "api.bageldb.ai",
    bagel_server_http_port: 80,
  });

  // create api
  const api = new Client(settings);

  // get or create a cluster
  const newName = "testing_4000";

  const cluster = await api.get_or_create_cluster(newName);

  // add data to the cluster
  await cluster
    .add(
      (ids = ["id1", "id2"]),
      (embeddings = [
        [1.1, 2.3],
        [4.5, 6.9],
      ]),
      (metadatas = [{ info: "M1" }, { info: "M1" }]),
      (documents = ["doc1", "doc2"])
    )
    .then((res) => {
      if (res) {
        console.log("Data added successfully");
      }
    })
    .catch((err) => {
      console.log(err);
    });

  // update data in the cluster
  await cluster
    .update(
      (ids = ["id1"]),
      (embeddings = [[10.1, 20.3]]),
      (metadatas = [{ info: "M1" }]),
      (documents = ["doc1"])
    )
    .then((res) => {
      if (res) {
        console.log("Data updated successfully");
      }
    })
    .catch((err) => {
      console.log(err);
    });

  // peek into the cluster
  const peeks = await cluster.peek(10);
  console.log("peek result: ", peeks);

  // delete the cluster
  await api.delete_cluster(newName);
};

// example for upsert data in the cluster
const upsert_data_in_cluster_example = async () => {
  // create settings
  const settings = new Settings({
    bagel_api_impl: "rest",
    bagel_server_host: "api.bageldb.ai",
    bagel_server_http_port: 80,
  });

  // create api
  const api = new Client(settings);

  // get or create a cluster
  const newName = "testing_5000";

  const cluster = await api.get_or_create_cluster(newName);

  // add data to the cluster
  await cluster
    .add(
      (ids = ["id1", "id2"]),
      (embeddings = [
        [1.1, 2.3],
        [4.5, 6.9],
      ]),
      (metadatas = [{ info: "M1" }, { info: "M1" }]),
      (documents = ["doc1", "doc2"])
    )
    .then((res) => {
      if (res) {
        console.log("Data added successfully");
      }
    })
    .catch((err) => {
      console.log(err);
    });

  // upsert data in the cluster
  await cluster
    .upsert(
      (ids = ["id1", "id3"]),
      (embeddings = [
        [15.1, 25.3],
        [30.1, 40.3],
      ]),
      (metadatas = [{ info: "M1" }, { info: "M1" }]),
      (documents = ["doc1", "doc3"])
    )
    .then((res) => {
      if (res) {
        console.log("Data upserted successfully");
      }
    })
    .catch((err) => {
      console.log(err);
    });

  // peek into the cluster
  const peeks = await cluster.peek(10);
  console.log("peek result: ", peeks);

  // delete the cluster
  await api.delete_cluster(newName);
};

// example for modify cluster name and metadata
const modify_cluster_name_and_metadata_example = async () => {
  // create settings
  //   const settings = new Settings({
  //     bagel_api_impl: "rest",
  //     bagel_server_host: "api.bageldb.ai",
  //     bagel_server_http_port: 80,
  //   });

  // create api
  const api = new Client(settings);

  // get or create a cluster
  const newName = "testing_6000";

  const cluster = await api.get_or_create_cluster(newName);

  // add data to the cluster
  await cluster
    .add(
      (ids = ["id1", "id2"]),
      (embeddings = [
        [1.1, 2.3],
        [4.5, 6.9],
      ]),
      (metadatas = [{ info: "M1" }, { info: "M1" }]),
      (documents = ["doc1", "doc2"])
    )
    .then((res) => {
      if (res) {
        console.log("Data added successfully");
      }
    })
    .catch((err) => {
      console.log(err);
    });

  const modified_name = "testing_7000";
  // modify cluster name and metadata
  await cluster
    .modify((name = modified_name), (metadata = { info: "M2" }))
    .then((res) => {
      if (res) {
        console.log("Cluster modified successfully");
      }
    })
    .catch((err) => {
      console.log(err);
    });

  // peek into the cluster
  const peeks = await cluster.peek(10);
  console.log("peek result: ", peeks);

  // delete the cluster
  await api.delete_cluster(modified_name);
};

// example for adding images to the cluster
const add_images_to_cluster_example = async () => {
  // create settings
  const settings = new Settings({
    bagel_api_impl: "rest",
    bagel_server_host: "api.bageldb.ai",
    bagel_server_http_port: 80,
  });

  // create api
  const api = new Client(settings);

  // get or create a cluster with a specified embedding model (assuming API support)
  const newName = "image_add_test"; // Consider generating a UUID for uniqueness
  const embeddingModel = "bagel-multi-modal";
  const cluster = await api.get_or_create_cluster(newName, embeddingModel);

  // add image to the cluster
  const image_path = ["./image_emb/test.jpg", "./image_emb/test.png"];
  for (let image of image_path) {
    const image_file = fs.readFileSync(image);
    const image_data = Buffer.from(image_file).toString("base64");
    const image_name = image.split("/").pop();
    await cluster
      .add_image(image_name, image_data)
      .then((res) => {
        console.log("Image added successfully");
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // peek into the cluster and find similar images
  const peeks = await cluster.peek(1);
  console.log("peek result: ", peeks);
  const embeddings = peeks[0].embeddings; // Assuming response structure
  const results = await cluster.find(embeddings, 5);
  console.log(results);

  // Optionally, delete the cluster if needed
  // await api.delete_cluster(newName);
  // console.log("Cluster deleted");
};

// run examples
const run_examples = async () => {
  console.log("Running examples...");
  console.log("====================================");
  console.log("pinging server and getting version...");
  await ping_version_example();
  console.log("====================================");
  console.log("getting all clusters...");
  await get_all_clusters_example();
  console.log("====================================");
  console.log("creating, deleting, and getting or creating a cluster...");
  await create_delete_get_or_create_cluster_example();
  console.log("====================================");
  console.log(
    "adding data and querying to the cluster (without embeddings)..."
  );
  await add_data_to_cluster_without_embedding_example();
  console.log("====================================");
  //   console.log("adding data and querying to the cluster (with embeddings)...");
  //   await add_data_to_cluster_with_embedding_example(); // might not work
  console.log("====================================");
  //   console.log("deleting data from the cluster...");
  //   await delete_data_from_cluster_example(); // not important
  console.log("====================================");
  console.log("updating data in the cluster...");
  await update_data_in_cluster_example();
  console.log("====================================");
  console.log("upserting data in the cluster...");
  await upsert_data_in_cluster_example();
  console.log("====================================");
  console.log("modifying cluster name and metadata...");
  await modify_cluster_name_and_metadata_example();
  console.log("====================================");
  console.log("adding images to the cluster...");
  await add_images_to_cluster_example(); //not important
  console.log("====================================");
  console.log("Finished running examples...");
};

// run examples
run_examples();
