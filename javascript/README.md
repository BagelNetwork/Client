# Bagel JavaScript Client 🥯

## Table of Contents.

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
  - [Upload File](#upload-file-to-asset)
  - [Delete Asset](#delete-asset)

## Installation

To install the Bagel JavaScript client, use npm:

```bash
npm install bageldb-beta
```

## Dependencies

Also, install the following dependencies:

1. Axios : `npm install axios`
2. Node-Fetch: `npm install node-fetch`
3. Form data: `npm install form-data`
4. uuid: `npm install uuid`
5. Buffer: `npm install buffer`

## Overview

The official Bagel API endpoint is `api.bageldb.ai`.
The Bagel JavaScript client provides easy access to the Bagel API from Node.js applications.
The full source code with examples is available on [GitHub](https://github.com/BagelNetwork/Client/tree/main/javascript).

## Client

The `Client` class is the main interface to the Bagel API. It requires a `Settings` object to configure connectivity:

```js
import { Settings, Client } from "bageldb-beta";

// Settings config
const settings = new Settings({
  bagel_api_impl: "rest",
  bagel_server_host: "api.bageldb.ai",
});

const client = new Client(settings);
```

## Settings

The `Settings` class contains configuration options for the client:

- `bagel_api_impl` - The Bagel API implementation, usually `"rest"`
- `bagel_server_host` - Bagel server hostname
- See `Settings` source for additional options

## Usage

Once you have created a `Client` instance, you can call API methods as shown in the examples below.

## API Methods

### Ping API

```js
const pingExample = async () => {
  const response = await client.ping();
  console.log(response);
};

pingExample();
```

This method pings the API to check connectivity. You will get `Pong!` as a response, acknowledging that the Bagel API is reachable.

### Get API Version

```js
const versionExample = async () => {
  const version = await client.get_version();
  console.log(version);
};

versionExample();
```

This method retrieves the API version string.

### Create Asset

Assets in Bagel serve as powerful containers for large datasets, encapsulating embeddings — high-dimensional vectors that represent various data forms, such as text, images, or audio. These Assets enable efficient similarity searches, which are fundamental to a wide range of applications, from recommendation systems and search engines to data analytics tools.

#### Create Asset: 'RAW' Type dataset

A raw dataset is an unprocessed collection of data in its original form. This type of dataset typically consists of various types of data such as text, images, audio, or any other form of data that hasn't been transformed, processed, or encoded into a specific format.

```js
import { Settings, Client } from "bageldb-beta";

// Settings config
const settings = new Settings({
  bagel_api_impl: "rest",
  bagel_server_host: "api.bageldb.ai",
});

const client = new Client(settings);

const apiKey = "4gB2wJPByf8qnUihAmH8dgbGYsZESEOH";
const payload = {
  dataset_type: "RAW",
  title: "insert_assetName",
  category: "insert_category",
  details: "insert_details",
  tags: [],
  user_id: "insert_userId",
};
const createAsset = async () => {
  // get version
  const asset = await client.create_asset(payload, apiKey);
  console.log(asset);
};

createAsset();
```

This method creates a new asset and returns a response indicating "Asset successfully created" along with the asset ID. If the asset already exists, the response will be:

```js
data: {
  error: "ValueError('Asset already exists')";
}
```

`NOTE:` Ensure all assets you create are unique to avoid errors.

#### Create Asset: 'VECTOR' Type Asset

A vector dataset consists of data that has been transformed into vectors, which are numerical representations of the original data. Each vector typically contains a set of numbers (features) that capture the essential characteristics of the data.

Creating a 'VECTOR' type asset is similar to creating a 'RAW' type asset. The only difference is the payload:

```js
import { Settings, Client } from "bageldb-beta";

// Settings config
const settings = new Settings({
  bagel_api_impl: "rest",
  bagel_server_host: "api.bageldb.ai",
});

const client = new Client(settings);

const assetId = "f4013273-03fa-4d2a-bfb4-d36bda4d5a1c";
const apiKey = "4gB2wJPByf8qnUihAmH8dgbGYsZESEOH";

const payload = {
  metadatas: [{ source: "This is apple" }],
  documents: ["This is apple "],
  ids: ["hbdvsf-478t4bf4g4bj-4bc8be8bc8b8b8"],
};

const addVectorAsset = async () => {
  try {
    console.log("Sending request with payload:", payload);

    const response = await client.add_data_to_asset(assetId, payload, apiKey);

    console.log("Response received:", response);
  } catch (error) {
    console.error("Error embedding data to vector asset:", error);
  }
};

addVectorAsset();
```

### Get Asset by ID

This method retrieves details for a specific Asset using the generated "Asset ID". An API key is used to ensure security.

```js
import { Settings, Client } from "bageldb-beta";

// Settings config
const settings = new Settings({
  bagel_api_impl: "rest",
  bagel_server_host: "api.bageldb.ai",
});

const client = new Client(settings);

//Pass in requirements
const assetId = "insert_assetID";
const apiKey = "insert_apiKey";

const getAsset = async () => {
  // get version
  const asset = await client.get_asset_by_Id(assetId, apiKey);
  console.log(asset);
};

getAsset();
```

### Get All Assets (For a Specific User)

This method retrieves a list of Assets created by a specific user. An API key is used to ensure security.

```js
import { Settings, Client } from "bageldb-beta";

const settings = new Settings({
  bagel_api_impl: "rest",
  bagel_server_host: "api.bageldb.ai",
});

const client = new Client(settings);

//Pass in requirements
const userId = "insert_userID";
const apiKey = "insert_apiKey";

const getAssets = async () => {
  // get version
  const asset = await client.get_all_assets(userId, apiKey);
  console.log(asset);
};

getAssets();
```

### Upload File to Asset

This method uploads files to a specific Asset.

```Js
import { Settings, Client } from 'bageldb-beta'

// Settings config
const settings = new Settings({
  bagel_api_impl: 'rest',
  bagel_server_host: 'api.bageldb.ai',
})

const client = new Client(settings)
const assetId = 'b59195f2-030e-430d-8a25-29dbf79aa03e'
const filePath = './sample_data.csv'
const apiKey = '4gB2wJPByf8qnUihAmH8dgbGYsZESEOH'

const uploadFile = async () => {
  // get version
  const asset = await client.add_file(assetId, filePath, apiKey)
  console.log(asset)
}

uploadFile()
```

### Delete Asset

This method deletes a specific Asset.

```js
import { Settings, Client } from "bageldb-beta";

// Settings config
const settings = new Settings({
  bagel_api_impl: "rest",
  bagel_server_host: "api.bageldb.ai",
});

const client = new Client(settings);

const apiKey = "insert_apiKey";
const assetId = "insert_assetID";

const deleteAsset = async () => {
  // get version
  const asset = await client.delete_asset(assetId, apiKey);
  console.log(asset);
};
deleteAsset();
```

This method deletes an Asset by ID. You can also confirm this by trying to delete the Asset, which will result in an `error`. All changes can be viewed on your console.
