# Bagel JavaScript Client 🥯

## Table of Contents

- [Installation](#installation)
- [Overview](#overview)
- [Client](#client)
- [Settings](#settings)
- [Usage](#usage)
- [API Methods](#api-methods)
  - [Ping API](#ping-api)
  - [Get API Version](#get-api-version)
  - [Create Asset](#create-asset) - [Create Asset: RAW Type Dataset](#create-asset-raw-type-dataset) - [Create Asset: VECTOR Type Dataset](https://github.com/BagelNetwork/Client/blob/main/javascript/README.md#create-asset-vector-type-asset)
  - [Add Embeddings: 'VECTOR' Type Asset](#add-embeddings-vector-type-asset)
  - [Query Vector Asset](#query-vector-asset)
  - [Get Asset by ID](#get-asset-by-id)
  - [Get All Assets](https://github.com/BagelNetwork/Client/blob/main/javascript/README.md#get-all-assets-for-a-specific-user)
  - [Upload File to Asset](#upload-file-to-asset)
  - [Update Asset](#update-asset)
  - [Get User Details](#get-user-details)
  - [Create API Key](#create-api-key)
  - [Fine-tuning](https://github.com/BagelNetwork/Client/blob/main/javascript/README.md#finetuning)
  - [Get Job by Asset](#get-job-by-asset)
  - [Get Job](#get-job)
  - [List Jobs](#list-jobs)
  - [List Model Files](#list-model-files)
  - [Delete Asset](#delete-asset)

## Installation

To install the Bagel JavaScript client, use npm:

```bash
npm install bagelml
```

Make sure you to also update your `package.json` file by including ` "type": "module",` above your dependencies. Your file should look similar to this:

```js
{
  "type": "module",
  "dependencies": {
    "bagelml": "^0.0.1"
  }
}
```

## Overview

The official Bagel API endpoint is `api.bageldb.ai`.
The Bagel JavaScript client provides easy access to the Bagel API from Node.js applications.

The full source code with examples is available on [GitHub](https://github.com/BagelNetwork/Client/tree/main/javascript).

## Client

The `client` class is the main interface to the Bagel API. Make sure to import it using this statement:

```js
import { client } from "bagelml";
```

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
import { client } from "bagelml";

const apiKey = "insert-your-api-key";
const payload = {
  dataset_type: "RAW",
  title: "Insert Asset Name",
  category: "Insert Category",
  details: "Insert Details",
  tags: [],
  userId: "Insert Your User ID",
};

const createAsset = async () => {
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
import { client } from "bagelml";

const apiKey = "insert-your-api-key";
const payload = {
  dataset_type: "VECTOR",
  title: "Insert Asset Name",
  category: "Insert Category",
  details: "Insert Details",
  tags: [],
  userId: "Insert Your User ID",
  embedding_model: "bagel-text",
  dimensions: 768,
};

const createVectorAsset = async () => {
  const asset = await client.create_asset(payload, apiKey);
  console.log(asset);
};

createVectorAsset();
```

### Add Embeddings: 'VECTOR' Type Asset

```js
import { client } from "bagelml";

const assetId = "insert your asset Id";
const apiKey = "insert your api key";

const payload = {
  metadatas: [{ source: "insert text" }],
  documents: ["Insert text"],
  ids: ["jkfbnjfd-t84urb54hurugb-uuybdiubviwd"], //manually generated by you
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

### Query Vector Asset

```js
import { client } from "bagelml";

const assetId = "insert your asset Id";
const apiKey = "insert your api key";

const payload = {
  where: {
    // category: 'Cat2',
  },
  where_document: {
    // is_published: true,
  },
  // query_embeddings: [em],
  n_results: 1,
  include: ["metadatas", "documents", "distances"],
  query_texts: ["input query text"],
  padding: false,
};
const query = async () => {
  try {
    console.log("Sending request with payload:", payload);

    const response = await client.query_asset(assetId, payload, apiKey);

    console.log("Response received:", response);
  } catch (error) {
    console.error("Error querryin asset:", error);
  }
};

query();
```

### Get Asset by ID

This method retrieves details for a specific Asset using the generated "Asset ID". An API key is used to ensure security.

```js
import { client } from "bagelml";

const apiKey = "insert-your-api-key";
const assetId = "insert-your-asset-id";

const getAsset = async () => {
  const asset = await client.get_asset_by_Id(assetId, apiKey);
  console.log(asset);
};

getAsset();
```

### Update Asset

Updates data in the Asset

```js
import { client } from "bagelml";

// Settings config
const settings = new Settings({
  bagel_api_impl: "rest",
  bagel_server_host: "api.bageldb.ai",
});

const client = new Client(settings);

const assetId = "";
const apiKey = "";

const payload = {
  price: 200,
  is_published: true,
  is_purchased: true,
  details: "",
  title: "",
};
const update = async () => {
  try {
    console.log("Sending request with payload:", payload);

    const response = await client.update_asset(assetId, payload, apiKey);

    console.log("Response received:", response);
  } catch (error) {
    console.error("Error update cluster embedding:", error);
  }
};

update();
```

### Get All Assets (For a Specific User)

Retrieves all assets associated with a specific user. An API key is used to ensure security.

```js
import { client } from "bagelml";

const apiKey = "insert-your-api-key";
const userId = "insert-your-user-id";

const getAssets = async () => {
  const assets = await client.get_all_assets(userId, apiKey);
  console.log(assets);
};

getAssets();
```

### Upload File to Asset

This method uploads files to a specific Asset.

```Js
import { client } from "bagelml";

const assetId = "insert your asset Id"
const filePath = "./sample_data.csv"
const apiKey = "insert your api key"

const uploadFile = async () => {
  // get version
  const asset = await client.add_file(assetId, filePath, apiKey)
  console.log(asset)
}

uploadFile()
```

### Update Asset

Updates data in the Asset

```js
import { client } from "bagelml";

const apiKey = "insert-your-api-key";
const assetId = "insert-your-asset-id";

const payload = {
  price: 200,
  is_published: true,
  is_purchased: true,
  details: "insert text",
  title: "insert text",
};
const update = async () => {
  try {
    console.log("Sending request with payload:", payload);

    const response = await client.update_asset(assetId, payload, apiKey);

    console.log("Response received:", response);
  } catch (error) {
    console.error("Error update cluster embedding:", error);
  }
};

update();
```

### Get User Details

Retrieve details of a specific user from BagelDB using their user ID.

```js
import { client } from "bagelml";

const apiKey = "insert your api key";
const userId = "insert your user id"; // Replace with an actual user ID

const getUserDetails = async () => {
  try {
    const userDetails = await client.get_user_details(userId, apiKey);
    console.log(userDetails);
  } catch (error) {
    console.error("Error retrieving user details:", error);
  }
};

getUserDetails();
```

#### Create API Key

Create a new API key for a specified user.

```js
import { client } from "bagelml";

const userId = "insert your user id";

const createApiKey = async (userId) => {
  try {
    const apiKeyDetail = await client.create_api_key("api-key1", userId);
    console.log(apiKeyDetail);
  } catch (error) {
    console.error("Error creating API key:", error);
  }
};

createApiKey(userId);
```

### Buy Asset

This code purchases an asset of your choice by passing in the following parameters:

```js
import { client } from "bagelml";

const assetId = "";
const apiKey = "";
const userId = "";

const buyAsset = async () => {
  // get version
  const asset = await client.buy_asset(assetId, userId, apiKey);
  console.log(asset);
};

buyAsset();
```

### Download Model Files

```js
import { client } from 'bagelml'

const assetId = 'input asset id' // e.g '78908uyuihghjkjhyu'
const apiKey = 'input api key' // e.gn '76890kjhg876huiyg67876tyhj'

const downloadModel = async () => {
  // get version
  const asset = await client.download_model(assetId, apiKey)
  console.log(asset)
}
downloadModel()
```

### Finetuning

Fine-tune a model using a specific dataset and configuration.

```js
import { client } from 'bagelml'

const fineTune = async () => {
  // get version
  const apiKey = 'input api key' // e.g '67890ytghijhgghugfghutrty'
  const title = 'input name of finetuned model' // e.g 'orange comic'
  const user_id = 'input your user id' // e.g '3456789876'
  const asset_id = 'input asset id' // e.g 'yuiou89-hgjkhgiohg-gh8yuiouy'
  const base_model_id = 'input base model id' // This is the model you want to use for fine tuning
  const file_name = 'input file name' // This is the name of file uploaded to the asset you want to finetune to the new model
  const epochs = 3 // default is 3
  const learning_rate = 0.01 // default is 0.01 but you could change it

  const asset = await client.fine_tune(
    title,
    user_id,
    asset_id,
    base_model_id,
    file_name,
    epochs,
    learning_rate,
    apiKey
  )
  console.log(asset)
}

fineTune()
```

### Get Job by asset

Retrieve job details associated with a specific asset ID.

```js
import { client } from "bagelml";

const apiKey = "insert your api key";
const asset_id = "insert your asset id"; // Replace with actual asset ID

const testGetJobByAsset = async () => {
  try {
    const response = await client.get_job_by_asset(asset_id, apiKey);
    console.log("Get job by asset response:", response);
  } catch (error) {
    console.error("Error getting job by asset:", error.message);
    console.error("Error details:", error);
  }
};

testGetJobByAsset();
```

### Get Job

Retrieve details of a specific job by its ID.

```js
import { client } from "bagelml";

const apiKey = "insert your api key";
const job_id = "insert your job id"; // Replace with actual job ID

const testGetJob = async () => {
  try {
    const response = await client.get_job(job_id, apiKey);
    console.log("Get job response:", response);
  } catch (error) {
    console.error("Error getting job:", error.message);
    console.error("Error details:", error);
  }
};

testGetJob();
```

### List Jobs

List all jobs associated with a specific user.

```js
import { client } from "bagelml";

const apiKey = "insert your api key";
const user_id = "insert your user id"; // Replace with actual user ID

const testListJobs = async () => {
  try {
    const response = await client.list_jobs(user_id, apiKey);
    console.log("List jobs response:", response);
  } catch (error) {
    console.error("Error listing jobs:", error.message);
    console.error("Error details:", error);
  }
};

testListJobs();
```

### List model files

List all files associated with a specific model asset.

```js
import { client } from "bagelml";

const apiKey = "insert your api key";
const asset_id = "insert your asset id"; // Replace with actual asset ID

const testListModelFiles = async () => {
  try {
    const response = await client.list_model_files(asset_id, apiKey);
    console.log("List model files response:", response);
  } catch (error) {
    console.error("Error listing model files:", error.message);
    console.error("Error details:", error);
  }
};

testListModelFiles();
```

### Delete Asset

This method deletes a specific Asset.

```js
import { client } from "bagelml";

const apiKey = "insert your api key";
const assetId = "insert your asset id"; // Replace with actual asset ID

const deleteAsset = async () => {
  // get version
  const asset = await client.delete_asset(assetId, apiKey);
  console.log(asset);
};
deleteAsset();
```

This documentation provides examples of using Bagels API methods for user management, job handling, model management, and finetuning. For additional support, please contact victor@bagel.net 🥯.

All changes can be viewed on your console.
