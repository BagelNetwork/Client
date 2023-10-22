# BagelDB JavaScript Client 🥯

## Table of Contents

- [BagelDB JavaScript Client 🥯](#bageldb-javascript-client-)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Overview](#overview)
  - [Client](#client)
  - [Settings](#settings)
  - [Usage](#usage)
  - [API Methods](#api-methods)
    - [Ping API](#ping-api)
    - [Get API Version](#get-api-version)
    - [Create Cluster](#create-cluster)
    - [Get Cluster](#get-cluster)
    - [Delete Cluster](#delete-cluster)
  - [Cluster Methods](#cluster-methods)
  - [Full Example](#full-example)

## Installation

```
npm install bageldb-beta
```

## Overview

The official BagelDB API endpoint is `api.bageldb.ai`.

The BagelDB JavaScript client provides easy access to the BagelDB API from Node.js applications.

The full source code with examples is available on GitHub:
https://github.com/Bagel-DB/Client/tree/main/javascript

See `example.js` for complete usage examples.

## Client

The `Client` class is the main interface to the BagelDB API. It requires a `Settings` object to configure connectivity:

```js
const { Settings, Client } = require('bageldb-beta');

// Settings config
const settings = new Settings({
  bagel_api_impl: "rest",
  bagel_server_host: "api.bageldb.ai"
});

const client = new Client(settings);
```

## Settings

The `Settings` class contains configuration options for the client:

- `bagel_api_impl` - The BagelDB API implementation, usually `"rest"`
- `bagel_server_host` - BagelDB server hostname
- See `Settings` source for additional options

## Usage

Once you have created a `Client` instance, you can call API methods like:

## API Methods

### Ping API

```js
const ping_example = async () => {
    // ping server
    const response = await client.ping();
    console.log(response);
}

ping_example()
```

Pings the API to check connectivity.

### Get API Version

```js
const version_example = async () => {
    // get version
    const version = await client.get_version();
    console.log(version);
}

version_example()
```

Gets the API version string.


### Create Cluster

```js
const create_cluster_example = async () => {
    // create cluster
    const resp = await client.create_cluster('testing_js_client');
    console.log(resp)
}
```
Creates a new cluster. If already cluster with same name does not exist then resposne will be somethig like this :
```js
Cluster {
    name: 'testing_js_client',
    id: 'a9c6b467-4af9-4b9e-ab6a-9589b9ceb1cb',
    metadata: null,
    _client: API { _api_url: 'http://api.bageldb.ai:80/api/v1' }
  }
```

### Get Cluster

```js
const get_cluster_example = async () => {
    // get cluster
    const cluster = await client.get_or_create_cluster("myclsuter");
    console.log(cluster)
}

get_cluster_example()
```

Gets an existing cluster by name. If cluster does not exist then it will create and return.

### Delete Cluster

```js
const delete_cluster_example = async () => {
    // delete cluster
    await client.delete_cluster('mycluster');
}

delete_cluster_example()
```

Delete a cluster by name.

## Cluster Methods

The `Cluster` class represents a specific cluster and has methods like:

```js
const cluster_methods_example = async () => {
    // get or create a cluster
    const cluster_name = "cluster_methods";
    const cluster = await client.get_or_create_cluster(cluster_name);

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

    // find data in the cluster
    console.log('query result: ')
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

cluster_methods_example()
```

See the `Cluster` class documentation for full details on:

- `count()` - Get total rows
- `add()` - Insert new rows
- `delete()` - Delete rows 
- `update()` - Update existing rows
- `find()` - Search by vectors
- `peek()` - Sample rows
- And more

## Full Example
```js
// import
const { Settings, Client } = require('bageldb-beta');

// create settings
const settings = new Settings({
  bagel_api_impl: "rest",
  bagel_server_host: "api.bageldb.ai",
  bagel_server_http_port: 80,
});

// example for add data to the cluster (with embeddings)
const full_example = async () => {
    // create api or client
    const api = new Client(settings);
    // get or create a cluster
    const newName = "testing";
    const cluster = await api.get_or_create_cluster(newName);
    // add data to the cluster
    await cluster.add(
        ids = ["id1", "id2"],
        embeddings = [[1.1, 2.3], [4.5, 6.9]],
        metadatas = [{ "info": "M1" }, { "info": "M1" }],
        documents = ["doc1", "doc2"]
    ).then((res) => {
        if (res) {
            console.log("Data added successfully");
        }
    }).catch((err) => {
        console.log(err);
    });
    // get count
    const count = await cluster.count()
    console.log("Count of data inside cluster:", count)

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
    console.log('peek result: ', peeks);

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

    // get count
    const countDelete = await cluster.count()
    console.log("Count after delete:", countDelete)

    // find data in the cluster
    console.log("query result: ");
    await cluster.find(
        query_embeddings = [[1.1, 2.3]],
        n_results = 5,
        where = { info: "M1" },
        where_document = { $contains: "doc" },
        include = ["metadatas", "documents", "distances"],
        query_texts = null
    );

    // delete the cluster
    await api.delete_cluster(newName);
}

full_example();
```
 The code demonstrates how to connect to a BagelDB server, create or retrieve a cluster, perform various operations on the cluster (add, update, delete, find, peek), and then delete the cluster.


See `example.js` for more complete examples. Let me know if any part needs more explanation!
