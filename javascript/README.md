
# BagelDB JavaScript Client 🥯

## Table of Contents

- [Installation](#installation)
- [Overview](#overview)
- [Client](#client)
- [Settings](#settings)
- [Usage](#usage)
- [API Methods](#api-methods)
  - [Ping API](#ping-api)
  - [Get API Version](#get-api-version)
  - [Create Asset](#create-asset)
  - [Get Asset](#get-asset)
  - [Get All Assets](#get-all-assets)
  - [Delete Asset](#delete-asset)

## Installation

To install the BagelDB JavaScript client, use npm:

```bash
npm install bageldb-beta
```

## Overview

The official BagelDB API endpoint is `api.bageldb.ai`.

The BagelDB JavaScript client provides easy access to the BagelDB API from Node.js applications.

The full source code with examples is available on [GitHub](https://github.com/BagelNetwork/Client/tree/main/javascript).

Refer to `example.js` for comprehensive usage examples.

## Client

The `Client` class is the main interface to the BagelDB API. It requires a `Settings` object to configure connectivity:

```js
const { Settings, Client } = require('bageldb-beta');

// Settings configuration
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

Once you have created a `Client` instance, you can call API methods as shown in the examples below.

## API Methods

### Ping API

```js
const pingExample = async () => {
    const response = await client.ping();
    console.log(response);
}

pingExample();
```

This method pings the API to check connectivity. You will get `Pong!` as a response, acknowledging that the BagelDB API is reachable.

### Get API Version

```js
const versionExample = async () => {
    const version = await client.get_version();
    console.log(version);
}

versionExample();
```

This method retrieves the API version string.

### Create Asset

#### Create 'VECTOR' Type Asset

```js
const { Settings, Client } = require('bageldb-beta');

// Settings configuration
const settings = new Settings({
  bagel_api_impl: 'rest',
  bagel_server_host: 'api.bageldb.ai',
});

const client = new Client(settings);

const apiKey = 'insert_your_api_key';

const payload = {
  dataset_type: 'VECTOR',
  title: 'WINE_PRESS!',
  category: 'Cat2',
  details: 'Testing',
  tags: ['VECTOR'],
  user_id: 'insert_your_user_id',
  embedding_model: 'Embeddings here',
  dimensions: 3,
};

const createAsset = async () => {
  const asset = await client.create_asset(payload, apiKey);
  console.log(asset);
}

createAsset();
```

#### Create 'RAW' Type Asset

Creating a 'RAW' type asset is similar to creating a 'VECTOR' type asset. The only difference is the payload:

```js
const payload = {
  dataset_type: 'RAW',
  title: 'string',
  category: 'AI',
  details: '',
  tags: [],
  user_id: 'insert_your_user_id'
};

const createAsset = async () => {
  const asset = await client.create_asset(payload, 'insert_your_api_key');
  console.log(asset);
}

createAsset();
```

This method creates a new asset and returns a response indicating "Asset successfully created" along with the asset ID. If the asset already exists, the response will be:

```js
data: { error: "ValueError('Asset NewOne already exists')" }
```

`NOTE:` Ensure all assets you create are unique to avoid errors.

### Get Asset

```js
const { Settings, Client } = require('bageldb-beta');

// Settings configuration
const settings = new Settings({
  bagel_api_impl: 'rest',
  bagel_server_host: 'api.bageldb.ai',
});

const client = new Client(settings);

const apiKey = 'insert_your_api_key';

const getAsset = async () => {
  const asset = await client.get_asset_by_Id('08c5b693-fd91-4c4d-bdea-134d487f3a5d', apiKey);
  console.log(asset);
}

getAsset();
```

### Get All Assets (For a Specific User)

```js
const { Settings, Client } = require('bageldb-beta');

// Settings configuration
const settings = new Settings({
  bagel_api_impl: "rest",
  bagel_server_host: "api.bageldb.ai"
});

const client = new Client(settings);

const userId = 'insert_your_user_id';
const apiKey = 'insert_your_api_key';

const getAllAssets = async () => {
  const assets = await client.get_all_assets(userId, apiKey);
  console.log(assets);
}

getAllAssets();
```

### Delete Asset 

```js
const { Settings, Client } = require('bageldb-beta');

// Settings configuration
const settings = new Settings({
  bagel_api_impl: "rest",
  bagel_server_host: "api.bageldb.ai"
});

const client = new Client(settings);

const apiKey = 'insert_your_api_key';
const assetId = 'eb95aeae-5e49-4d5b-96ee-11bb7c305e98';

const deleteAsset = async () => {
  const asset = await client.delete_asset(apiKey, assetId);
  console.log(asset);
}

deleteAsset();
```

This method deletes an asset by ID.