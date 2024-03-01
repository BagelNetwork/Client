const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const os = require("os");
const uuid = require("uuid");

const bagel = require("bagel-js");
const { Settings } = require("bagel-js/config");
const DEMO_USER_ID = uuidv4();
const DEMO_USER_ID_API_KEYS_PROD = "ORmYFmMUauBrdiTgukaE8GxAQ5R7Ip0b";
const DEMO_USER_ID_API_KEYS_LOCAL = "ORmYFmMUauBrdiTgukaE8GxAQ5R7Ip0b";
const DEMO_KEY_IN_USE = DEMO_USER_ID_API_KEYS_LOCAL;

// Set environment variables
process.env.BAGEL_API_KEY = DEMO_KEY_IN_USE;
process.env.BAGEL_USER_ID = DEMO_USER_ID;

function create_and_delete(api) {
  // Generate a unique cluster name using UUID
  let name = uuid.v4();
  console.log(name);

  // Create a cluster
  let cluster = api.createCluster({ name });
  console.log(`cluster size ${cluster.cluster_size} mb`);
  console.log(`embedding size ${cluster.embedding_size}`);

  // Delete it
  api.deleteCluster({ name });
  console.log(">> create and delete done !\n");
}

function create_add_get(api) {
  let name = "testing";

  // Get or create a cluster
  let cluster = api.getOrCreateCluster({ name });

  // Add documents to the cluster
  cluster.add({
    documents: ["This is document1", "This is bidhan"],
    metadatas: [{ source: "google" }, { source: "notion" }],
    ids: [uuid.v4(), uuid.v4()],
  });

  // Print count
  console.log("count of docs:", cluster.count());

  // Get the first item
  let first_item = cluster.peek({ n: 1 });
  if (first_item) {
    console.log("get 1st item");
  }
  // delete after test
  api.deleteCluster({ name });
  console.log(">> create_add_get done !\n");
}

function create_add_find(api) {
  let name = "testing";

  // Get or create a cluster
  let cluster = api.getOrCreateCluster({ name });

  // Add documents to the cluster
  cluster.add({
    documents: ["This is document", "This is Towhid", "This is text"],
    metadatas: [
      { source: "notion" },
      { source: "notion" },
      { source: "google-doc" },
    ],
    ids: [uuid.v4(), uuid.v4(), uuid.v4()],
  });

  // Query the cluster for similar results
  let results = cluster.find({
    query_texts: ["This"],
    n_results: 5,
    where: { source: "notion" },
    where_document: { $contains: "is" },
  });

  console.log(results);
  // delete after test
  api.deleteCluster({ name });
  console.log(">> create_add_find done  !\n");
}

function create_add_find_em(api) {
  let name = "testing_embeddings";

  // Get or create a cluster
  let cluster = api.getOrCreateCluster({ name });
  // Add embeddings and other data to the cluster
  try {
    cluster.add({
      embeddings: [
        [1.1, 2.3, 3.2],
        // Add more embeddings as required
      ],
      metadatas: [
        { uri: "img1.png", style: "style1" },
        // Add more metadata as required
      ],
      documents: [
        "doc1",
        "doc2",
        "doc3", // Add more documents as required
      ],
      ids: [
        "id1",
        "id2",
        "id3", // Add more IDs as required
      ],
    });
  } catch (exception) {
    console.log(exception);
  }
  // Query the cluster for results
  let results = cluster.find({
    query_embeddings: [[1.1, 2.3, 3.2]],
    n_results: 5,
  });

  console.log("find result:", results);
  // delete after test
  api.deleteCluster({ name });
  console.log(">> create_add_find_em done  !\n");
}

function create_add_modify_update(api) {
  let name = "testing";
  let new_name = "new_" + name;

  // Get or create a cluster
  let cluster = api.getOrCreateCluster({ name });

  // Modify the cluster name
  console.log("Before:", cluster.name);
  try {
    cluster.modify({ name: new_name });
  } catch (exception) {
    console.log(exception);
  }

  console.log("After:", cluster.name);

  // Add documents to the cluster
  cluster.add({
    documents: ["This is document1", "This is bidhan"],
    metadatas: [{ source: "notion" }, { source: "google" }],
    ids: ["id1", "id2"],
  });

  // Retrieve document metadata before updating
  console.log("Before update:");
  console.log(cluster.get({ ids: ["id1"] }));

  // Update document metadata
  cluster.update({ ids: ["id1"], metadatas: [{ source: "google" }] });

  // Retrieve document metadata after updating
  console.log("After update source:");
  console.log(cluster.get({ ids: ["id1"] }));
  // delete after test
  api.deleteCluster({ new_name });
  console.log(">> create_add_modify_update done !\n");
}

function create_upsert(api) {
  let name = "testing";

  // Get or create a cluster
  let cluster = api.getOrCreateCluster({ name });

  // Add documents to the cluster
  try {
    cluster.add({
      documents: ["This is document1", "This is bidhan"],
      metadatas: [{ source: "notion" }, { source: "google" }],
      ids: ["id1", "id2"],
    });
  } catch (exception) {
    console.log("add warning: ", exception);
  }
  // Upsert documents in the cluster
  try {
    cluster.upsert({
      documents: ["This is document", "This is google"],
      metadatas: [{ source: "notion" }, { source: "google" }],
      ids: ["id1", "id3"],
    });
  } catch (exception) {
    console.log("upsert warning: ", exception);
  }
  // Print the count of documents in the cluster
  console.log("Count of documents :", cluster.count());
  // delete after test
  api.deleteCluster({ name });
  console.log(">> create_upsert done !\n");
}

function main() {
  let start_time = time.time(); // Record the start time

  // Initialize Bagel client with server settings
  let server_settings = new Settings({
    bagel_api_impl: "rest",
    bagel_server_host: "localhost",
    bagel_server_http_port: "8088",
  });

  let client = new bagel.Client({ settings: server_settings });

  // Ping the Bagel server
  console.log("ping: ", client.ping());

  // Get the Bagel server version
  console.log("version: ", client.getVersion());

  // Call all functions
  create_and_delete(client);
  create_add_get(client);
  create_add_find(client);
  create_add_find_em(client);
  create_add_modify_update(client);
  create_upsert(client);

  let end_time = time.time(); // Record the end time
  let execution_time = end_time - start_time; // Calculate the execution time
  console.log(`Total execution time: ${execution_time.toFixed(2)} seconds`);
}

if (require.main === module) {
  main();
}
