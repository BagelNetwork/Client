# BagelDB JavaScript Client 🥯

## Table of Contents

- [Installation](#installation)
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

The official BagelDB API endpoint is `api.bageldb.ai`.

The BagelDB JavaScript client provides easy access to the BagelDB API from Node.js applications.

The full source code with examples is available on GitHub:
https://github.com/Bagel-DB/Client/tree/main/javascript

See `example.js` for complete usage examples.

## Client

```js
const { Client } = require('bageldb-beta');

const client = new Client(settings);
```

The `Client` class is the main interface to the BagelDB API. It requires a `Settings` object to configure connectivity:

```js 
// Settings config
const settings = new Settings({
  bagel_api_impl: "rest",
  bagel_server_host: "api.bageldb.ai",
  bagel_server_http_port: 80
});
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
const response = await client.ping(); 
```

Pings the API to check connectivity.

### Get API Version

```js
const version = await client.get_version();
```

Gets the API version string.

### Get All Clusters 

```js
const clusters = await client.get_all_clusters();
```

Gets info on all existing clusters.

### Create Cluster

```js
const cluster = await client.create_cluster('mycluster');
``` 

Creates a new cluster.

### Get Cluster

```js
const cluster = await client.get_cluster('mycluster'); 
```

Gets an existing cluster by name.

### Delete Cluster

```js
await client.delete_cluster('mycluster');
```

Deletes a cluster by name.

## Cluster Methods

The `Cluster` class represents a specific cluster and has methods like:

```js
// Add documents
await cluster.add([
  { id: 1, text: 'Document 1' },  
  { id: 2, text: 'Document 2' }
]);

// Search by vector 
const results = await cluster.query([0.5, 0.5]); 
```

See the `Cluster` class documentation for full details on:

- `count()` - Get total rows
- `add()` - Insert new rows
- `delete()` - Delete rows  
- `update()` - Update existing rows
- `query()` - Search by vectors
- `peek()` - Sample rows
- And more

## Full Example

```js
const { Client } = require('bageldb-beta');

const settings = new Settings({
  bagel_api_impl:"rest",
  bagel_server_host:"api.bageldb.ai",
  bagel_server_http_port:80,
});

const client = new Client(settings); 

const cluster = await client.get_or_create_cluster('products');

await cluster.add([
  { id: 1, name: 'Baseball', vector: [0.1, 0.3] },
  { id: 2, name: 'Bat', vector: [0.7, 0.2] }
]);

const results = await cluster.query([0.5, 0.5]); 
```

Here is another example showing the usage flow:

You're right, I should show an example of searching by text as well. Here is an updated full example:

```js 
// Import and initialize client
const { Client } = require('bageldb-beta');

const settings = new Settings({
  bagel_api_impl: "rest",
  bagel_server_host: "api.bageldb.ai", 
  bagel_server_http_port: 80  
});

const client = new Client(settings);

// Get or create cluster
const cluster = await client.get_or_create_cluster('products');  

// Add documents
await cluster.add([
  { id: 1, text: 'Baseball' },
  { id: 2, text: 'Bat' }  
]); 

// Search by vector 
const results1 = await cluster.query([0.5, 0.5]);

// Search by text
const results2 = await cluster.query(null, {
  query_texts: ['Baseball'] 
});

// BagelDB will search using the embeddings
// it previously generated for the documents
```

The key addition is the `query_texts` parameter to search by text directly:

```js
const results2 = await cluster.query(null, {
  query_texts: ['Baseball']  
});
```

This searches for the document with the text "Baseball" without needing to provide any embeddings.

The key points are:

- You can insert documents by just providing a text field instead of an embedding vector.

- Behind the scenes, BagelDB will run the text through its built-in neural network to generate an embedding vector. 

- When you search by vector later, it will use the embeddings it previously generated.

This allows you to easily index and search text without having to generate embeddings yourself. BagelDB handles it automatically.

Let me know if this helps explain the full end-to-end flow!

See the [GitHub README](https://github.com/Bagel-DB/Client/tree/main/javascript) and `example.js` for more complete examples. Let me know if any part needs more explanation!
