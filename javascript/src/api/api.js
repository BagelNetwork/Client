// imports
import axios from 'axios'
import fetch from 'node-fetch'
// const { Cluster } = require('./cluster') [Deprecated]
import { v4 as uuidv4 } from 'uuid'
// const { v4: uuidv4 } = require('uuid')
import FormData from 'form-data'
import fs from 'fs'
// const FormData = require('form-data')
// import {Buffer} from 'buffer'
// // const Buffer = require('buffer').Buffer

// Class to interact with the Bagel API====================================================================================
class API {
  // Constructor
  constructor (settings) {
    const urlPrefix = settings.bagel_server_ssl_enabled ? 'https' : 'http'
    if (!settings.bagel_server_host) {
      throw new Error(
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
        throw new Error('Empty response data received')
      }
      if (parseInt(response.data['nanosecond heartbeat']) > 0) {
        return 'pong'
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // get the Bagel API version====================================================================================
  async get_version () {
    try {
      const response = await fetch(this._api_url + '/version')
      if (!response.data) {
        throw new Error('Empty response data received')
      }
      return response.data
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Create Asset===================================================================================[ADDED]
  async create_asset (payload, apiKey) {
    // Define headers
    const headers = {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    }

    try {
      const response = await fetch(this._api_url + '/asset', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.status === 200) {
        console.log('Asset created successfully!')
        console.log(JSON.stringify(data))

        // Get the asset ID from the response
        const assetId = data
        console.log(`Asset ID: ${assetId}`)
      } else {
        console.error(`Error creating Asset: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      console.error('Error creating Asset:', error)
    }
  }

  // Get a particular created asset using the asset id
  // getAssetById.js
  //= ===================================================================================[ADDED]
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
        console.log('Asset retrieved successfully!')
        console.log(data)
      } else {
        console.error(`Error retrieving asset: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      console.error('Error retrieving asset:', error)
    }
  }

  // Get all assets of a particular user===============================[ADDED]
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
        console.log('Asset retrieved successfully!')
        console.log(data)
      } else {
        console.error(`Error retrieving asset: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      console.error('Error retrieving asset:', error)
    }
  }

  // Deletes a particular asset using its asset id==========================================[ADDED]
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
        throw new Error(`Error deleting asset: ${JSON.stringify(errorDetail)}`)
      }
      console.log('Asset deleted successfully.')
    } catch (error) {
      console.error(error.message)
    }
  };

  // reset the database====================================================================================
  async reset () {
    try {
      await fetch(this._api_url + '/reset', {
        method: 'POST'
      })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // persist the database on disk====================================================================================
  async persist () {
    try {
      await fetch(this._api_url + '/persist', {
        method: 'POST'
      })
    } catch (error) {
      console.error('Error:', error)
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
        throw new Error('Empty response data received')
      }
      return parseInt(response.data)
    } catch (error) {
      console.error('Error:', error)
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
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json() // Parse JSON response

      if (!data) {
        throw new Error('Empty response data received')
      }

      return {
        ids: data.ids,
        embeddings: data.embeddings ? data.embeddings : null,
        metadatas: data.metadatas ? data.metadatas : null,
        documents: data.documents ? data.documents : null
      }
    } catch (error) {
      console.error('Error:', error.message)
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
        throw new Error(`API request failed with status ${response.status}`)
      }

      return 'success' // Assuming success on 2xx status code
    } catch (error) {
      console.error('Error:', error.message)
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
        throw new Error('Empty response data received')
      }
      // console.log(response.data);
      return response.data
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Add data to vector asset=================================================================================

  async add_data_to_asset (assetId, payload, apiKey) {
    try {
      const response = await fetch(`https://api.bageldb.ai/api/v1/asset/${assetId}/add`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorDetail = await response.json() // Changed to json to catch the error detail
        console.error('Error response:', errorDetail) // Log the full error response
        throw new Error(`Error adding data: ${response.status} - ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Internal error:', error)
      throw error
    }
  }

  // -------------------New Query Asset Function ---------------------
  async query_asset (assetId, payload, apiKey) {
    return this._query_asset(assetId, payload, apiKey)
  }

  async _query_asset (assetId, payload, apiKey) {
    try {
      const response = await fetch(this._api_url + '/asset/' + assetId + '/query', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorDetail = await response.json() // Changed to json to catch the error detail
        console.error('Error response:', errorDetail) // Log the full error response
        throw new Error(`Error querying data: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Internal error:', error)
      // throw error;
    }
  }

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
      console.error('Error:', error)
    }
  }

  // new update function added
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
        console.error('Error response:', errorDetail) // Log the full error response
        throw new Error(`Error updating data: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Internal error:', error)
      throw error
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
        throw new Error('Empty response data received')
      }
      return response.data
    } catch (error) {
      console.error('Error:', error.message)
      throw error
    }
  }

  // helper method for accessing the private add file method outside the class ===========================================
  async add_file (assetId, filePath, apiKey) {
    return this._add_file(assetId, filePath, apiKey)
  };

  // add file to asset====================================================================================
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

      console.log(responseData) // Print response content for debugging

      if (response.ok) {
        console.log('Data uploaded successfully!')
      } else {
        console.log(`Error uploading data: ${responseData}`)
      }
    } catch (error) {
      console.error('Error:', error)
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
        throw new Error('Empty response data received')
      }
      return response.data
    } catch (error) {
      console.error('Error:', error.message)
      throw error
    }
  }

  // create index for a cluster====================================================================================
  async _create_index (clusterName) {
    try {
      await axios.post(
        this._api_url + '/clusters/' + clusterName + '/create_index'
      )
    } catch (error) {
      console.error('Error:', error.message)
      throw error
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
        console.error('Error:', error)
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
        console.error('Error:', error)
      })
  }

  // Retrieve user details for a given user ID ======================================= [NEW]
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
        console.log('Asset retrieved successfully!')
        console.log(data)
      } else {
        console.error(`Error retrieving asset: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      console.error('Error retrieving asset:', error)
    }
  }

  // Create API key
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
        console.log('API key created successfully and sent to user ID:', userId)
        return data
      } else {
        console.error(`Error creating API key: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      console.error('Error creating API key:', error)
    }
  }

  // List API keys ===================================
  async list_api_keys (userId, apiKey) {
    const headers = {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    }

    try {
      const response = await fetch(this._api_url + `/api_keys?userId=${userId}`, {
        method: 'GET',
        headers
      })

      const data = await response.json()

      if (response.status === 200) {
        console.log('API keys listed successfully!')
        return data
      } else {
        console.error(`Error listing API keys: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      console.error('Error listing API keys:', error)
    }
  }

  // Get notification ==============================================
  async get_notification (userId, apiKey) {
    const headers = {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    }

    try {
      const response = await fetch(this._api_url + `/notification/user/${userId}`, {
        method: 'POST',
        headers
      })

      const data = await response.json()

      if (response.status === 200) {
        console.log('Notification recieved successfully!')
        return data
      } else {
        console.error(`Error recieving notification: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      console.error('Error recieving notification:', error)
    }
  }
}

export default API
