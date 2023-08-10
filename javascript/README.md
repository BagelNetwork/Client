# BagelDB JavaScript Client 🥯

## Table of Contents

- [Overview](#overview)

- [Installation](#installation)
- [Configuration](#configuration)
- [Creating the Client](#creating-the-client)
- [Ping API](#ping-api)
- [Get API Version](#get-api-version)
- [Get All Clusters](#get-all-clusters)
- [Cluster Operations](#cluster-operations)
  - [Create Cluster](#create-cluster)
  - [Get or Create Cluster](#get-or-create-cluster)
  - [Delete Cluster](#delete-cluster)
  - [Add Data](#add-data)
  - [Query Data](#query-data)
  - [Delete Data](#delete-data)
  - [Update Data](#update-data)
  - [Upsert Data](#upsert-data)
  - [Modify Cluster](#modify-cluster)
- [Direct SQL Queries](#direct-sql-queries)
- [Examples](#examples)

## Overview

BagelDB.js is a client for interacting with the BagelDB 🥯 vector database API. It allows you to:

- Ping the BagelDB API server
- Get API version
- Get all clusters
- Create, delete, get clusters
- Add, delete, update, upsert data in clusters
- Query clusters by vector or text
- Modify cluster name and metadata
- Directly execute SQL on BagelDB
- [Client](#client)
- [Settings](#settings)
- [Usage](#usage)
- [API Methods](#api-methods)
- [Cluster Methods](#cluster-methods)
- [Full Example](#full-example)

## Installation

```
npm install bageldb-beta
```

## Overview

Import the `Settings` and `Client` classes:

```js
const { Settings, Client } = require("bageldb-beta");
```

The BagelDB JavaScript client provides easy access to the BagelDB API from Node.js applications.

```js
const settings = new Settings({
  bagel_api_impl: "rest",
  bagel_server_host: "api.bageldb.ai",
  bagel_server_http_port: 80,
});

const api = new Client(settings);
```

The full source code with examples is available on GitHub:
https://github.com/Bagel-DB/Client/tree/main/javascript

## Creating the Client

## Client

```js
const client = new Client(settings);
```

The `Client` class is the main interface to the BagelDB API. It requires a `Settings` object to configure connectivity:

```js
async () => {
  const response = await api.ping();
  console.log(response);
};
```

## Settings

The `Settings` class contains configuration options for the client:

- `bagel_api_impl` - The BagelDB API implementation, usually `"rest"`
- `bagel_server_host` - BagelDB server hostname
- `bagel_server_http_port` - BagelDB HTTP port
- See `Settings` source for additional options

## Usage

Once you have created a `Client` instance, you can call API methods like:

## API Methods

### Ping API

```js
async () => {
  const version = await api.get_version();
  console.log(version);
};
```

Pings the API to check connectivity.

### Get API Version

```js
async () => {
  const clusters = await api.get_all_clusters();
  console.log(clusters);
};
```

## Cluster Operations

The `Cluster` instance has methods for interacting with the cluster.

### Create Cluster and Delete Cluster

Create a new cluster by name then delete it:

```js
async () => {
  const name = "my_test_cluster_200000";

  try {
    await api.create_cluster(name);
    console.log(`Cluster with name ${name} created successfully`);
  } catch (err) {
    console.log(err);
  }

  await api.delete_cluster(name);

  const cluster = await api.get_or_create_cluster("my_test_cluster_200000");
  console.log(cluster);

  await api.delete_cluster("my_test_cluster_200000");
};
```

### Get or Create Cluster

Get a cluster if exists, otherwise create it:

```js
async () => {
  const cluster = await api.get_or_create_cluster("my_test_cluster_200000");
  console.log(cluster);
};
```

Gets an existing cluster by name.

Add data to a cluster:

```js
async () => {
  const name = "testing_2000";
  const cluster = await api.get_or_create_cluster(name);

  try {
    await cluster.add({
      ids: ["id1", "id2"],
      embeddings: [
        [1.1, 2.3],
        [4.5, 6.9],
      ],
      metadatas: [{ info: "M1" }, { info: "M1" }],
      documents: ["doc1", "doc2"],
    });
    console.log("Data added successfully");
  } catch (err) {
    console.log(err);
  }
};
```

The key addition is the `query_texts` parameter to search by text directly:

```js
async () => {
  const name = "testing_1000";
  const cluster = await api.get_or_create_cluster(name);

  try {
    await cluster.add({
      ids: ["i37", "i38", "i39"],
      embeddings: null,
      metadatas: [
        { source: "notion" },
        { source: "notion" },
        { source: "google-doc" },
      ],
      documents: ["This is document", "This is Towhid", "This is text"],
    });
    console.log("Data added successfully");
  } catch (err) {
    console.log(err);
  }
};
```

### Query Data

The key points are:

```js
async () => {
  const name = "testing_2000";
  const cluster = await api.get_or_create_cluster(name);

  const queryEmbeddings = [
    [1.1, 2.3],
    [4.5, 6.9],
  ];

  const results = await cluster.find(queryEmbeddings);
  console.log(results);
};
```

- Behind the scenes, BagelDB will run the text through its built-in neural network to generate an embedding vector.

```js
async () => {
  const name = "testing_2000";
  const cluster = await api.get_or_create_cluster(name);

  const queryText = "This is document";

  const results = await cluster.find(queryText);
  console.log(results);
};
```

This allows you to easily index and search text without having to generate embeddings yourself. BagelDB handles it automatically.

Let me know if this helps explain the full end-to-end flow!

```js
async () => {
  const name = "testing_2000";
  const cluster = await api.get_or_create_cluster(name);

  await cluster.delete({
    ids: ["id1"],
    where: {},
    where_document: {},
  });
};
```

### Update Data

Update existing data in a cluster:

```js
async () => {
  const name = "testing_2000";
  const cluster = await api.get_or_create_cluster(name);

  await cluster.update({
    ids: ["id1"],
    embeddings: [[10.1, 20.3]],
    metadatas: [{ info: "M1" }],
    documents: ["doc1"],
  });
};
```

### Upsert Data

Upsert data in a cluster:

```js
async () => {
  const name = "testing_2000";
  const cluster = await api.get_or_create_cluster(name);

  await cluster.upsert({
    ids: ["id1", "id3"],
    embeddings: [
      [15.1, 25.3],
      [30.1, 40.3],
    ],
    metadatas: [{ info: "M1" }, { info: "M1" }],
    documents: ["doc1", "doc3"],
  });
};
```

### Modify Cluster

Modify a cluster's name and metadata:

```js
async () => {
  const name = "testing_2000";
  const cluster = await api.get_or_create_cluster(name);

  await cluster.modify({
    name: "testing_2000_modified",
    metadata: { info: "M1" },
  });
};
```

## Direct SQL Queries

Execute raw SQL queries directly on BagelDB:

```js
async () => {
  const name = "testing_2000";
  const cluster = await api.get_or_create_cluster(name);

  const query = "SELECT * FROM testing_2000";
  const results = await cluster.raw_sql(query);
  console.log(results);
};
```

## Examples

See the [examples](./example.js) file included for code samples of common operations.

The key steps are:

1. Create `Settings` with your API configuration
2. Create a `Client` instance
3. Call API methods like `createCluster`
4. Use the returned `Cluster` instance to add, query, etc.
