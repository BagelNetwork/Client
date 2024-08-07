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

  // -------------------New Create Asset Function Merged ---------------------
  // async create_asset (payload, apiKey) {
  //   // Define headers
  //   const headers = {
  //     'x-api-key': apiKey,
  //     'Content-Type': 'application/json'
  //   }

  //   try {
  //     const response = await fetch(this._api_url + '/asset', {
  //       method: 'POST',
  //       headers,
  //       body: JSON.stringify(payload)
  //     })

  //     const data = await response.json()

  //     if (response.status === 200) {
  //       console.log('Asset created successfully!')
  //       console.log(JSON.stringify(data))

  //       // Get the asset ID from the response
  //       const assetId = data
  //       console.log(`Asset ID: ${assetId}`)
  //     } else {
  //       console.error(`Error creating Asset: ${JSON.stringify(data)}`)
  //     }
  //   } catch (error) {
  //     console.error('Error creating Asset:', error)
  //   }
  // }


// -------------------New Create Asset Function WAITLIST CHECK---------------------
async create_asset(payload, apiKey) {
  // Define headers
  const headers = {
    'x-api-key': apiKey,
    'Content-Type': 'application/json'
  }

  try {
    // Get user details
    const userDetails = await this.get_user_details(payload.user_id, apiKey)
    if (!userDetails) {
      throw new Error('Failed to retrieve user details')
    }

    // Check if user is in the waitlist
    if (userDetails.role !== 'waitlist') {
      console.log('User is not in the waitlist, access denied.')
      console.log('Visit waitlist.bagel.net to get free credits on the Bagel model development platform.')
      return
    }

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
        console.log('Asset retrieved successfully!')
        console.log(data)
      } else {
        console.error(`Error retrieving asset: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      console.error('Error retrieving asset:', error)
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
        console.log('Asset retrieved successfully!')
        console.log(data)
      } else {
        console.error(`Error retrieving asset: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      console.error('Error retrieving asset:', error)
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
        throw new Error(`Error deleting asset: ${JSON.stringify(errorDetail)}`)
      }
      console.log('Asset deleted successfully.')
    } catch (error) {
      console.error(error.message)
    }
  }

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
        console.error('Error response:', errorDetail) // Log the full error response
        // throw new Error(`Error updating data: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Internal error:', error)
      throw error
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
        console.error('Error response:', errorDetail) // Log the full error response
        throw new Error(
          `Error adding data: ${response.status} - ${response.statusText}`
        )
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
        console.error('Error response:', errorDetail) // Log the full error response
        //   throw new Error(`Error querying data: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Internal error:', error)
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
      console.error('Error:', error)
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
        console.log('Asset retrieved successfully!')
        console.log(data)
      } else {
        console.error(`Error retrieving asset: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      console.error('Error retrieving asset:', error)
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
        console.log('API key created successfully and sent to user ID:', userId)
        return data
      } else {
        console.error(`Error creating API key: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      console.error('Error creating API key:', error)
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
        console.log('Dataset liked successfully!')
        return data
      } else {
        console.error(`Error liking dataset: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      console.error('Error liking dataset:', error)
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
        console.log('Dataset rated successfully!')
        return data
      } else {
        console.error(`Error rating dataset: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      console.error('Error rating dataset:', error)
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
        console.error('Error response:', errorDetail) // Log the full error response
        // throw new Error(`Error fine tuning: ${response.status}`)
      } else {
        return await response.json()
      }
    } catch (error) {
      console.error('Internal error:', error)
      throw error
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
        console.error('Error response:', errorDetail)
        throw new Error(
          `Error listing jobs: ${response.status} ${errorDetail.detail}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error('Internal error:', error)
      throw error
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
        console.error('Error response:', errorDetail)
        // throw new Error(
        //   `Error getting job: ${response.status} ${errorDetail.detail}`
        // )
      }

      return await response.json()
    } catch (error) {
      console.error('Internal error:', error)
      throw error
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
        console.error('Error response:', errorDetail)
        // throw new Error(
        //   `Error getting job by asset: ${response.status} ${errorDetail.detail}`
        // )
      }

      return await response.json()
    } catch (error) {
      console.error('Internal error:', error)
      throw error
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
        console.error('Error response:', errorDetail)
        throw new Error(
          `Error listing model files: ${response.status} ${errorDetail.detail}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error('Internal error:', error)
      throw error
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
        console.error('Error response:', errorDetail)
        // // throw new Error(
        // //   `Error downloading model file: ${response.status} ${errorDetail.detail}`
        // )
      } else {
        return await response.blob() // Assuming the file is binary data
      }
    } catch (error) {
      console.error('Internal error:', error)
      throw error
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
        console.log('Notification recieved successfully!')
        return data
      } else {
        console.error(`Error recieving notification: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      console.error('Error recieving notification:', error)
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
        console.log('File downloaded successfully!')
        return data
      } else {
        console.error(`Error downloading files: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      console.error('Error downloading files:', error)
    }
  }
}

export default API
