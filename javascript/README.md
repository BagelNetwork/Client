# 🥯 BagelDB.js Client Documentation 🥯

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

## Installation

Install BagelDB.js using npm:

```
npm install bageldb-beta
```

## Configuration

Create a `Settings` instance, passing in your BagelDB API configuration:

```js
const settings = new Settings({
  // config  
});
```

## Creating the Client 

Pass the `Settings` instance to the `Client` constructor:

```js
const client = new Client(settings);
```

## Ping API

Ping the API to verify connectivity:

```js 
client.ping();
```

## Get API Version

Get the API version string:

```js
client.getVersion(); 
```

## Get All Clusters

Get an array of all clusters:

```js
client.getAllClusters();
```

## Cluster Operations 

The `Cluster` instance has methods for interacting with the cluster.

### Create Cluster 

Create a new cluster:

```js  
client.createCluster("my_cluster");
```

### Get or Create Cluster

Get a cluster if exists, otherwise create it: 

```js
client.getOrCreateCluster("my_cluster");
```

### Delete Cluster 

Delete a cluster by name:

```js
client.deleteCluster("my_cluster"); 
```

### Add Data

Add data to a cluster: 

```js 
cluster.add(
  // ids, embeddings, etc  
);
```

Data can be added without passing embeddings. BagelDB 🥯 will handle embedding the data automatically:

```js
cluster.add(
  // ids, null embeddings, documents
);
```

### Query Data 

Query the cluster by vector:

```js
cluster.find(queryEmbeddings: [vector]); 
```

Or query by text:

```js
cluster.find(queryTexts: ['text']);
```

### Delete Data

Delete data from a cluster:

```js 
cluster.delete(ids: [...]);
```

### Update Data 

Update existing data in a cluster:

```js
cluster.update(ids: [...], embeddings: [...]); 
```

### Upsert Data

Upsert data in a cluster:  

```js 
cluster.upsert(ids: [...], embeddings: [...]);
```

### Modify Cluster 

Modify a cluster's name and metadata:

```js
cluster.modify(name: 'new-name', metadata: {...}); 
```

## Direct SQL Queries 

Execute raw SQL queries directly on BagelDB:

```js
client.rawSQL('SELECT * FROM clusters');
```

## Examples

See the [examples](./example.js) file included for code samples of common operations.

The key steps are:

1. Create `Settings` with your API configuration  
2. Create a `Client` instance
3. Call API methods like `createCluster` 
4. Use the returned `Cluster` instance to add, query, etc.
