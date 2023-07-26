## BagelDB - Node.js Client

This repository contains the Node.js client library for interacting with BagelDB - an innovative and scalable database for managing embeddings efficiently. BagelDB allows you to store, retrieve, and perform operations on embeddings, making it an ideal choice for various machine learning and natural language processing tasks.
Prerequisites

Before using this library, please ensure you have the following prerequisites:

    Node.js: Make sure you have Node.js installed on your system. If you don't have it, you can download it from https://nodejs.org.

    BagelDB Account: You need to sign up for a BagelDB account to obtain the necessary API key for accessing the BagelDB service. Visit https://www.bageldb.ai to create an account and retrieve your API key.

Installation

To install the BagelDB Node.js client library, follow these steps:

    Clone this repository to your local machine or download the latest release as a ZIP archive.

    Navigate to the root directory of the downloaded/cloned repository.

    Install the required dependencies by running the following command:

bash

```
npm install
```

Usage

To get started with using the BagelDB Node.js client, follow these steps:

    Import the necessary modules:

```
const { System, Settings } = require('../bagel/config');
const FastAPI = require('../bagel/api/fastapi');
const { v4: uuidv4 } = require('uuid');
const EmbeddingUtil = require('../bagel/utils/embedding_utils');
```

    Create a Settings object to configure the BagelDB server:

```
server_settings = new Settings({
    bagel_server_ssl_enabled: true,
    bagel_api_impl: "rest",
    bagel_server_host: "api.bageldb.ai"
});
```

    Create a System object with the server settings:

```
const system = new System(server_settings);
```

    Initialize the BagelDB client by creating a FastAPI instance:

```
const db = new FastAPI(system);
```

    Ping the BagelDB server to check if it's responding:

```
db.ping()
    .then((response) => {
        console.log(response);
    })
    .catch((error) => {
        console.log(error);
    });
```

    Perform operations on clusters:

```
// Retrieve all clusters
db.getAllClusters()
    .then((clusters) => {
        console.log(clusters);
    })
    .catch((error) => {
        console.log(error);
    });

// Create a new cluster
const embUtil = new EmbeddingUtil('your_api_key');
const name = String(uuidv4());
db.createCluster(name, embUtil.getOpenAIEmbedding('hello world'), true);

// Delete a cluster
db.deleteCluster(name);

// Get or create a cluster
const cluster = db.getOrCreateCluster("testing", null, embUtil.getOpenAIEmbedding('hello world'));

// Add an item to a cluster
cluster._add("test", embUtil.getOpenAIEmbedding("test"));
```

Note: Replace 'your_api_key' in the EmbeddingUtil constructor with your actual API key.
