// imports
import axios from 'axios'
import fetch from 'node-fetch'
// const { Cluster } = require('./cluster') [Deprecated]
import { v4 as uuidv4 } from 'uuid'
// const { v4: uuidv4 } = require('uuid')
import FormData from 'form-data'
import fs from 'fs'
import { pipeline } from 'stream'
import { promisify } from 'util'
import path from 'path'
import { fileURLToPath } from 'url'

const streamPipeline = promisify(pipeline)

// Manually define __dirname in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// const FormData = require('form-data')
// import {Buffer} from 'buffer'
// // const Buffer = require('buffer').Buffer

// Class to interact with the Bagel API====================================================================================
class API {
  // Constructor
  constructor (settings) {
    const urlPrefix = settings.bagel_server_ssl_enabled ? 'https' : 'http'
    if (!settings.bagel_server_host) {
      return (
        "Missing required config values 'bagel_server_host' and/or 'bagel_server_http_port'"
      )
    }
    let port
    if (settings.bagel_server_http_port) {
      port = settings.bagel_server_http_port
    } else if (
      settings.bagel_server_ssl_enabled &&
      settings.bagel_server_https_port
    ) {
      port = settings.bagel_server_https_port
    } else {
      port = 80
    }

    this._api_url = `${urlPrefix}://${settings.bagel_server_host}:${port}/api/v1`
  }

  // Methods

  // ping the Bagel API====================================================================================
  async ping () {
    try {
      const response = await fetch(this._api_url)
      if (!response.data) {
        return 'Empty response data received'
      }
      if (parseInt(response.data['nanosecond heartbeat']) > 0) {
        return 'pong'
      }
    } catch (error) {
      return `Error: ${error.message}`
    }
  }

  // get the Bagel API version====================================================================================
  async get_version () {
    try {
      const response = await fetch(this._api_url + '/version')
      if (!response.data) {
        return 'Empty response data received'
      }
      return response.data
    } catch (error) {
      return `Error ${error.message}`
    }
  }

  // -------------------New Create Asset Function ---------------------
  async create_asset(payload, apiKey = null) {
    const url = `${this._api_url}/asset`; // Assuming `this._apiUrl` is defined elsewhere
    const headers = {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    } // Assuming this method exists to populate headers with the API key

    // Check if payload is valid
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return ("Payload must be a non-empty object");
    }

    // Required fields
    const requiredFields = ['dataset_type', 'title', 'user_id'];
    const missingFields = requiredFields.filter(field => !payload.hasOwnProperty(field));

    if (missingFields.length > 0) {
      return (`Missing required fields in payload: ${missingFields.join(', ')}`);
    }

    // Check for valid dataset_type
    const validDatasetTypes = ['RAW', 'MODEL', 'VECTOR'];
    if (!validDatasetTypes.includes(payload.dataset_type)) {
      return ("Invalid dataset_type. Must be 'RAW', 'MODEL', or 'VECTOR'");
    }

    try {
      // Make a POST request to create a dataset
      const response = await axios.post(url, payload, { headers });

      // Check the response status code
      if (response.status === 200) {
        const assetId = response.data;
        return assetId;
      } else {
        return `Error creating dataset: ${JSON.stringify(response.data)}`;
      }
    } catch (error) {
      if (error.response) {
        // Server returned an error response
        return (`Error creating dataset: ${error.response.data}`);
      } else {
        // Network or other errors
        return (`Request failed: ${error.message}`);
      }
    }
  }
  // Get a particular created asset using the asset id
  // getAssetById.js
  // -------------------New Get Asset by ID Function ---------------------
  async get_asset_by_Id (id, apiKey) {
    // Define headers
    const headers = {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    }

    try {
      const response = await fetch(this._api_url + `/asset/${id}`, {
        method: 'GET',
        headers
      })

      const data = await response.json()

      if (response.status === 200) {
        return `Asset retrieved successfully! \n ${data}`
      } else {
        return `Error retrieving asset: ${JSON.stringify(data)}`
      }
    } catch (error) {
      return `Error retrieving asset: ${error.message}`
    }
  }

  // -------------------New Get all assets Function ---------------------
  async get_all_assets (userId, apiKey) {
    // Define headers
    const headers = {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    }

    try {
      const response = await fetch(
        this._api_url + `/datasets?owner=${userId}`,
        {
          method: 'GET',
          headers
        }
      )

      const data = await response.json()

      if (response.status === 200) {
        return `Asset retrieved successfully! \n ${data}`
      } else {
        return `Error retrieving asset: ${JSON.stringify(data)}`
      }
    } catch (error) {
      return `Error retrieving asset: ${error.message}`
    }
  }

  // -------------------New Delete Asset Function ---------------------
  async delete_asset (assetId, apiKey) {
    try {
      const url = this._api_url + `/asset/${assetId}`

      // Define headers object with API key
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-Key': apiKey
      }

      // Make DELETE request to delete the asset
      const response = await fetch(url, {
        method: 'DELETE',
        headers
      })

      if (!response.ok) {
        const errorDetail = await response.json()
        return `Error deleting asset: ${JSON.stringify(errorDetail)}`
      }
      return 'Asset deleted successfully.'
    } catch (error) {
      return `Error: ${error.message}`
    }
  }

  // reset the database====================================================================================
  async reset () {
    try {
      await fetch(this._api_url + '/reset', {
        method: 'POST'
      })
    } catch (error) {
      return `Error: ${error}`
    }
  }

  // -------------------New Update asset Function ---------------------
  async update_asset (assetId, payload, apiKey) {
    return this._update_asset(assetId, payload, apiKey)
  }

  async _update_asset (assetId, payload, apiKey) {
    try {
      const response = await fetch(this._api_url + '/datasets/' + assetId, {
        method: 'PUT',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorDetail = await response.json() // Changed to json to catch the error detail
        return `Error response: ${errorDetail}` // Log the full error response
        // throw new Error(`Error updating data: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      return `Internal error: ${error}`
    }
  }

  // persist the database on disk====================================================================================
  async persist () {
    try {
      await fetch(this._api_url + '/persist', {
        method: 'POST'
      })
    } catch (error) {
      return `Error: ${error}`
    }
  }

  // get count of data within a cluster====================================================================================
  async _count (clusterId) {
    try {
      const response = await fetch(
        this._api_url + '/clusters/' + clusterId + '/count',
        {
          method: 'GET'
        }
      )
      if (!response.data) {
        return 'Empty response data received'
      }
      return parseInt(response.data)
    } catch (error) {
      return `Error: ${error}`
    }
  }

  // get data within a dataset====================================================================================
  async _get (
    clusterId,
    ids = null,
    where = {},
    sort = null,
    limit = null,
    offset = null,
    page = null,
    pageSize = null,
    whereDocument = {},
    include = ['metadatas', 'documents']
  ) {
    if (page && pageSize) {
      offset = (page - 1) * pageSize
      limit = pageSize
    }

    try {
      const response = await fetch(
        this._api_url + '/clusters/' + clusterId + '/get',
        {
          method: 'POST', // Use POST for sending data with the request
          body: JSON.stringify({
            // Convert data to JSON string for the body
            ids,
            where,
            sort,
            limit,
            offset,
            whereDocument,
            include
          }),
          headers: { 'Content-Type': 'application/json' } // Set content type header
        }
      )

      if (!response.ok) {
        return `API request failed with status ${response.status}`
      }

      const data = await response.json() // Parse JSON response

      if (!data) {
        return 'Empty response data received'
      }

      return {
        ids: data.ids,
        embeddings: data.embeddings ? data.embeddings : null,
        metadatas: data.metadatas ? data.metadatas : null,
        documents: data.documents ? data.documents : null
      }
    } catch (error) {
      return `Error: ${error.message}`
    }
  }

  // modify cluster name and metadata====================================================================================
  async _modify (clusterId, newName = null, newMetadata = null) {
    try {
      const data = { newMetadata, newName } // Combine data into a single object
      const response = await fetch(this._api_url + '/clusters/' + clusterId, {
        method: 'PUT', // Use PUT for modifying existing data
        body: JSON.stringify(data), // Convert data to JSON string
        headers: { 'Content-Type': 'application/json' } // Set content type header
      })

      if (!response.ok) {
        return `API request failed with status ${response.status}`
      }

      return 'success' // Assuming success on 2xx status code
    } catch (error) {
      return `Error: ${error.message}`
    }
  }

  //= ===================================================================================
  // add data to a cluster
  async _add (
    clusterId,
    ids,
    embeddings,
    metadatas = null,
    documents = null,
    incrementIndex = true
  ) {
    try {
      const response = await axios.post(
        this._api_url + '/clusters/' + clusterId + '/add',
        {
          ids,
          embeddings,
          metadatas,
          documents,
          incrementIndex
        }
      )
      if (!response.data) {
        return 'Empty response data received'
      }
      // console.log(response.data);
      return response.data
    } catch (error) {
      return `Error: ${error}`
    }
  }

  // -------------------New Add data to vector asset Function ---------------------

  async add_data_to_asset (assetId, payload, apiKey) {
    try {
      const response = await fetch(
        `https://api.bageldb.ai/api/v1/asset/${assetId}/add`,
        {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        const errorDetail = await response.json() // Changed to json to catch the error detail
        return `Error response: ${errorDetail} \n Error adding data: ${response.status} - ${response.statusText}` // Log the full error response
      }

      return await response.json()
    } catch (error) {
      return `Internal error: ${error}`
    }
  }

  // -------------------New Query Asset Function ---------------------
  async query_asset (assetId, payload, apiKey) {
    return this._query_asset(assetId, payload, apiKey)
  }

  async _query_asset (assetId, payload, apiKey) {
    try {
      const response = await fetch(
        this._api_url + '/asset/' + assetId + '/query',
        {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        const errorDetail = await response.json() // Changed to json to catch the error detail
        return `Error response: ${errorDetail}` // Log the full error response
        //   throw new Error(`Error querying data: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      return `Internal error: ${error}`
      // throw error;
    }
  } // ------------------- Query Asset ---------------------

  // delete data from a cluster====================================================================================
  async _delete (clusterId, ids = null, where = {}, whereDocument = {}) {
    try {
      const url = this._api_url + '/clusters/' + clusterId + '/delete'
      const requestOpts = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, where, whereDocument })
      }
      const response = await fetch(url, requestOpts)
      return response.json()
    } catch (error) {
      return `Error: ${error}`
    }
  }

  // -------------------New add text embedding Function --------------------

  async add_text(assetId, payload, apiKey = null) {
    // Validate assetId
    if (!assetId) {
      return ("Asset ID must be provided");
    }

    // Validate payload
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return ("Payload must be a non-empty object");
    }

    const requiredKeys = ['metadatas', 'documents', 'ids'];
    const missingKeys = requiredKeys.filter(key => !payload.hasOwnProperty(key));

    if (missingKeys.length > 0) {
      return (`Missing required keys in payload: ${missingKeys.join(', ')}`);
    }

    // Additional validations for metadatas, documents, and ids
    if (!Array.isArray(payload.metadatas) || payload.metadatas.length === 0) {
      return ("'metadatas' must be a non-empty array");
    }

    if (!Array.isArray(payload.documents) || payload.documents.length === 0) {
      return ("'documents' must be a non-empty array");
    }

    if (!Array.isArray(payload.ids) || payload.ids.length === 0) {
      return ("'ids' must be a non-empty array");
    }

    if (payload.metadatas.length !== payload.documents.length || payload.documents.length !== payload.ids.length) {
      return ("'metadatas', 'documents', and 'ids' must have the same length");
    }

    for (const metadata of payload.metadatas) {
      if (typeof metadata !== 'object' || !metadata.hasOwnProperty('source')) {
        return ("Each item in 'metadatas' must be an object with a 'source' key");
      }
    }

    // Populate headers (assuming this._populateHeadersWithApiKey exists)
    const headers = {
      'x-api-key': apiKey,
      'Content-Type': 'application/json' 
    }

    try {
      const url = `${this._api_url}/asset/${assetId}/add`; // Assuming this._apiUrl is defined elsewhere
      const dataPayload = {
        "metadatas": payload.metadatas,
        "documents": payload.documents,
        "ids": payload.ids.map(id => String(id)) // Convert IDs to strings if necessary
      };

      // Make a POST request
      const response = await fetch(url, dataPayload, { 
        method: 'POST',
        headers
      });

      // Check the response status
      if (response.status === 200) {
        return `Text data successfully Added: ${response.data}`; // Return the response data on success
      } else {
        return `Error response: ${JSON.stringify(response.data)}`;
      }
    } catch (error) {
      if (error.response) {
        // Handle server error response
        return (`Error response: ${JSON.stringify(error.response.data)}`);
      } else {
        // Handle network or other errors
        return (`Internal error: ${error.message}`);
      }
    }
  }


  // update data in a cluster====================================================================================
  async _update (
    clusterId,
    ids,
    embeddings = null,
    metadatas = null,
    documents = null
  ) {
    try {
      const response = await axios.post(
        this._api_url + '/clusters/' + clusterId + '/update',
        { ids, embeddings, metadatas, documents }
      )
      if (!response.data) {
        return 'Empty response data received'
      }
      return response.data
    } catch (error) {
      return `Error: ${error.message}`
    }
  }

  // helper method for accessing the private add file method outside the class ===========================================
  async add_file (assetId, filePath, apiKey) {
    return this._add_file(assetId, filePath, apiKey)
  }

  // -------------------New Add file Function ---------------------
  async _add_file (assetId, filePath, apiKey) {
    // Create a form object to send file data
    const form = new FormData()
    form.append('data_file', fs.createReadStream(filePath))

    const headers = {
      'x-api-key': apiKey,
      ...form.getHeaders() // Include headers from the form
    }

    try {
      const response = await fetch(this._api_url + `/asset/${assetId}/upload`, {
        method: 'POST',
        body: form,
        headers
      })

      const responseData = await response.text() // Get response text

      if (response.ok) {
        return 'Data uploaded successfully!'
      } else {
        return `Error uploading data: ${responseData}`
      }
    } catch (error) {
      return `Error: ${error}`
    }
  }

  // upsert data in a cluster====================================================================================
  async _upsert (
    clusterId,
    ids,
    embeddings = null,
    metadatas = null,
    documents = null,
    incrementIndex = true
  ) {
    try {
      const response = await axios.post(
        this._api_url + '/clusters/' + clusterId + '/upsert',
        { ids, embeddings, metadatas, documents, incrementIndex }
      )
      if (!response.data) {
        return 'Empty response data received'
      }
      return response.data
    } catch (error) {
      return `Error: ${error.message}`
    }
  }

  // create index for a cluster====================================================================================
  async _create_index (clusterName) {
    try {
      await axios.post(
        this._api_url + '/clusters/' + clusterName + '/create_index'
      )
    } catch (error) {
      return `Error: ${error.message}`
    }
  }

  // add image to a cluster====================================================================================
  async _add_image (clusterId, imageName, imageData) {
    console.log('add_image', imageData)
    const uid = uuidv4()

    const data = {
      metadata: [{ filename: imageName.toString() }],
      ids: [String(uid)],
      incrementIndex: true
    }

    const formData = new FormData()
    formData.append('image', imageData, {
      contentType: 'image/jpeg',
      filename: imageName.toString()
    })
    formData.append('data', JSON.stringify(data), {
      contentType: 'application/json'
    })

    // Send the POST request====================================================================================
    await fetch(this._api_url + '/clusters/' + clusterId + '/add_image', {
      method: 'POST',
      body: formData
    })
      .then((response) => response.json())
      .then((data) => {
        return data
      })
      .catch((error) => {
        return `Error: ${error.message}`
      })
  }

  // add images to a cluster via web form====================================================================================
  async _add_image_web (clusterId, formData) {
    console.log('add_image_web', formData)
    await fetch(this._api_url + '/clusters/' + clusterId + '/add_image', {
      method: 'POST',
      body: formData
    })
      .then((response) => response.json())
      .then((data) => {
        return data
      })
      .catch((error) => {
        return `Error: ${error}`
      })
  }

  // -------------------New Get user details Function ---------------------
  async get_user_details (userId, apiKey) {
    // Define headers
    const headers = {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    }

    try {
      const response = await fetch(this._api_url + `/user?userId=${userId}`, {
        method: 'GET',
        headers
      })

      const data = await response.json()

      if (response.status === 200) {
        return `Asset retrieved successfully! ${data}`
      } else {
        return `Error retrieving asset: ${JSON.stringify(data)}`
      }
    } catch (error) {
      return `Error retrieving asset: ${error}`
    }
  }

  // -------------------New Create API Key Function ---------------------
  async create_api_key (name, userId, apiKey = '') {
    const headers = {
      'Content-Type': 'application/json'
    }

    try {
      const response = await fetch(this._api_url + '/api_keys', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name, api_key: apiKey, userId })
      })

      const data = await response.json()

      if (response.status === 200) {
        return `API key created successfully and sent to user ID: ${userId} ${data}`
      } else {
        return `Error creating API key: ${JSON.stringify(data)}`
      }
    } catch (error) {
      return `Error creating API key: ${error}`
    }
  }

  // -------------------New Like asset Function --------------------- [WIP/NA]

  async like_dataset (assetId, userId, action, apiKey) {
    const headers = {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    }

    try {
      const response = await fetch(
        this._api_url +
          `/datasets/${assetId}/like?userId=${userId}&action=${action}`,
        {
          method: 'POST',
          headers
        }
      )

      const data = await response.json()

      if (response.status === 200) {
        return `Dataset liked successfully! ${data}`
      } else {
        return `Error liking dataset: ${JSON.stringify(data)}`
      }
    } catch (error) {
      return `Error liking dataset: ${error}`
    }
  }

  // -------------------New Rate asset Function --------------------- [WIP/NA]

  async rate_dataset (assetId, userId, rating, apiKey) {
    const headers = {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    }

    try {
      const response = await fetch(
        this._api_url +
          `/datasets/${assetId}/like?userId=${userId}&rating=${rating}`,
        {
          method: 'POST',
          headers
        }
      )

      const data = await response.json()

      if (response.status === 200) {
        return `Dataset rated successfully! ${data}`
      } else {
        return `Error rating dataset: ${JSON.stringify(data)}`
      }
    } catch (error) {
      return `Error rating dataset: ${error}`
    }
  }

  // -------------------New Fine Tune Function ---------------------
  async fine_tune (payload, apiKey) {
    return this._fine_tune(payload, apiKey)
  }

  async _fine_tune (payload, apiKey) {
    try {
      const response = await fetch(this._api_url + '/asset', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorDetail = await response.json() // Changed to json to catch the error detail
        return `Error response: ${errorDetail} \n Error Finetuning: ${response.status} ${errorDetail.detail}`
        // throw new Error(`Error fine tuning: ${response.status}`)
      } else {
        return await response.json()
      }
    } catch (error) {
      return `Internal error: ${error}`
    }
  }

  // -------------------New List Jobs Function ---------------------
  async list_jobs (userId, apiKey) {
    return this._list_jobs(userId, apiKey)
  }

  async _list_jobs (userId, apiKey) {
    try {
      const url = `${this._api_url}/jobs/created_by/${userId}`
      console.log('Request URL:', url) // Log the URL to verify it's correct

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorDetail = await response.json()
        return `Error response: ${errorDetail} \n Error listing jobs: ${response.status} ${errorDetail.detail}`
      }

      return await response.json()
    } catch (error) {
      return `Internal error: ${error}`
    }
  }

  // -------------------New Get job Function ---------------------
  async get_job (jobId, apiKey) {
    try {
      const url = `${this._api_url}/jobs/${jobId}`
      console.log('Request URL:', url) // Log the URL to verify it's correct

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorDetail = await response.json()
        return `Error response: ${errorDetail}`
        // throw new Error(
        //   `Error getting job: ${response.status} ${errorDetail.detail}`
        // )
      }

      return await response.json()
    } catch (error) {
      return `Internal error: ${error}`
    }
  }

  // -------------------New Get job by Asset Function ---------------------

  async get_job_by_asset (assetId, apiKey) {
    return this._get_job_by_asset(assetId, apiKey)
  }

  async _get_job_by_asset (assetId, apiKey) {
    try {
      const response = await fetch(`${this._api_url}/asset/${assetId}`, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorDetail = await response.json()
        return `Error response: ${errorDetail} \n Error getting job by asset: ${response.status} ${errorDetail.detail}`
      }

      return await response.json()
    } catch (error) {
      return `Internal error: ${error}`
    }
  }

  // -------------------New List Model Files Function ---------------------
  async list_model_files (assetId, apiKey) {
    return this._list_model_files(assetId, apiKey)
  }

  async _list_model_files (assetId, apiKey) {
    try {
      const url = `${this._api_url}/jobs/asset/${assetId}/files`
      console.log('Request URL:', url) // Log the URL to verify it's correct

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorDetail = await response.json()
        return `Error response: ${errorDetail} Error listing model files: ${response.status} ${errorDetail.detail}`
      }

      return await response.json()
    } catch (error) {
      return `Internal error: ${error}`
    }
  }

  // -------------------New Download Model Files Function ---------------------
  async download_model_file (assetId, fileName, apiKey) {
    return this._download_model_file(assetId, fileName, apiKey)
  }

  async _download_model_file (assetId, fileName, apiKey) {
    try {
      const url = `${this._api_url}/api/v1/jobs/asset/${assetId}/files/${fileName}`
      console.log('Request URL:', url) // Log the URL to verify it's correct

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorDetail = await response.json()
        return `Error response: ${errorDetail}`
      } else {
        return await response.blob() // Assuming the file is binary data
      }
    } catch (error) {
      return `Internal error: ${error}`
    }
  }

  // Get notification ============================================== [WIP]
  async get_notification (userId, apiKey) {
    const headers = {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    }

    try {
      const response = await fetch(
        this._api_url + `/notification/user/${userId}`,
        {
          method: 'POST',
          headers
        }
      )

      const data = await response.json()

      if (response.status === 200) {
        return `Notification recieved successfully! ${data}`
      } else {
        return `Error recieving notification: ${JSON.stringify(data)}`
      }
    } catch (error) {
      return `Error recieving notification: ${error}`
    }
  }

  // download model function
  async download_model (assetId, apiKey) {
    return this._downloadModel(assetId, apiKey)
  }

  // async _downloadModel(assetId, apiKey = null) {
  //     const streamPipeline = promisify(pipeline);

  //     // Populate headers with API key
  //     const headers = apiKey ? { 'x-api-key': apiKey, 'Content-Type': 'application/json' } : {};
  //     const url = `${this._api_url}/jobs/asset/${assetId}/download`;
  //     const fileName = `${assetId}.zip`;

  //     try {
  //         const response = await fetch(url, { method: 'GET', headers });

  //         if (response.ok) {
  //             const fileStream = fs.createWriteStream(fileName);
  //             await streamPipeline(response.body, fileStream);

  //             return `Successfully downloaded! Model ID: ${assetId}`;
  //         } else {
  //             return "Error downloading file";
  //         }
  //     } catch (error) {
  //         return `Error: ${error.message}`;
  //     }
  // }

  async _downloadModel (assetId, apiKey = null) {
    const fileName = `${assetId}.zip`
    const filePath = path.resolve(__dirname, fileName)

    const headers = apiKey ? { 'x-api-key': apiKey, 'Content-Type': 'application/json' } : {}

    try {
      const url = `${this._api_url}/jobs/asset/${assetId}/download`

      // Check if the file already exists and determine its current size (for resuming)
      let startByte = 0
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath)
        startByte = stats.size
        return `Resuming from byte: ${startByte}`
      }

      // Set the Range header for resuming the download
      headers.Range = `bytes=${startByte}-`

      const response = await axios.get(url, {
        headers,
        responseType: 'stream',
        timeout: 10000
      })

      const writer = fs.createWriteStream(filePath, { flags: 'a' })

      // Track download progress
      let downloadedBytes = startByte

      response.data.on('data', (chunk) => {
        downloadedBytes += chunk.length
        const progress = downloadedBytes / (fs.existsSync(filePath) ? downloadedBytes : 1)
        return `Downloaded ${downloadedBytes} bytes (${(progress * 100).toFixed(2)}%)`
      })

      await streamPipeline(response.data, writer)

      return `Successfully downloaded! Model ID: ${assetId}`
    } catch (error) {
      return `Error: ${error.message}`
    }
  }

  // Download model files ==============================[WIP]
  async download_model_files (jobId, fileName, apiKey) {
    const headers = {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    }

    try {
      const response = await fetch(
        this._api_url + `/jobs/${jobId}/files/${fileName}`,
        {
          method: 'GET',
          headers
        }
      )

      const data = await response.json()

      if (response.status === 200) {
        return `File downloaded successfully! ${data}`
      } else {
        return `Error downloading files: ${JSON.stringify(data)}`
      }
    } catch (error) {
      return `Error downloading files: ${error}`
    }
  }

  // buy asset function
  async buy_asset (assetId, userId, apiKey) {
    return this._buy_asset(assetId, userId, apiKey)
  }

  async _buy_asset (assetId, userId, apiKey = null) {
    // Populate headers with API key
    const headers = apiKey ? { 'x-api-key': apiKey, 'Content-Type': 'application/json' } : {}
    const url = `${this._api_url}/asset/${assetId}/buy/${userId}`

    try {
      const response = await fetch(url, { method: 'GET', headers })

      if (response.ok) {
        const data = await response.json()
        return `Buy asset successful: ${JSON.stringify(data)}`
      } else {
        const errorData = await response.json()
        return JSON.stringify(errorData)
      }
    } catch (error) {
      return `Error: ${error.message}`
    }
  }
}

export default API
