// imports
import axios from 'axios'
import fetch from 'node-fetch'
// const { Cluster } = require('./cluster') [Deprecated]
import {v4 as uuidv4} from 'uuid'
// const { v4: uuidv4 } = require('uuid')
import FormData from 'form-data'
// const FormData = require('form-data')
// import {Buffer} from 'buffer'
// // const Buffer = require('buffer').Buffer

// Class to interact with the Bagel API====================================================================================
class API {
  // Constructor
  constructor(settings) {
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
  async ping() {
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
  async get_version() {
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

  // get all clusters====================================================================================
  //   async get_all_clusters() {
  //     try {
  //       const response = await fetch(this._api_url + '/clusters')
  //       if (!response.data) {
  //         throw new Error('Empty response data received')
  //       }
  //       const json_clusters = response.data
  //       const clusters = json_clusters.map(
  //         (json_cluster) => new Cluster(this, json_cluster)
  //       )
  //       return clusters
  //     } catch (error) {
  //       console.error('Error:', error)
  //     }
  //   }

  //
  //Create Asset===================================================================================[ADDED]
  async create_asset(payload, apiKey) {
    // Define headers
    const headers = {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    }

    try {
      const response = await fetch(this._api_url + '/asset', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.status === 200) {
        console.log('Dataset created successfully!')
        console.log(JSON.stringify(data))

        // Get the asset ID from the response
        const assetId = data
        console.log(`Asset ID: ${assetId}`)
      } else {
        console.error(`Error creating dataset: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      console.error('Error creating dataset:', error)
    }
  }

  //Get a particular created asset using the asset id
  // getAssetById.js
  //====================================================================================[ADDED]
  async get_asset_by_Id(id, apiKey) {
    // Define headers
    const headers = {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    }

    try {
      const response = await fetch(this._api_url + `/asset/${id}`, {
        method: 'GET',
        headers: headers,
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

  //Get all assets of a particular user===============================[ADDED]
  async get_all_assets(userId, apiKey) {
    // Define headers
    const headers = {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    }

    try {
      const response = await fetch(
        this._api_url + `/datasets?owner=${userId}`,
        {
          method: 'GET',
          headers: headers,
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
  async delete_asset(assetId, apiKey) {
    const headers = {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    }

    try {
      const response = await fetch(this._api_url + `/asset/${assetId}`, {
        method: 'DELETE',
        header: headers,
      })
      if (response.ok) {
        console.log(`Cluster with the id ${assetId} deleted successfully`)
      } else {
        throw new Error(`Error deleting assets ${await response.text()}`)
      }
    } catch (error) {
      console.error('Error: asset does not exist!', error)
    }
  }

  //===========================================================================================
  // create a cluster
  //   async create_cluster(name, metadata = null, get_or_create = false) {
  //     try {
  //       const response = await axios.post(this._api_url + '/clusters', {
  //         name,
  //         metadata,
  //         get_or_create,
  //       })
  //       if (!response.data) {
  //         throw new Error('Empty response data received')
  //       }
  //       return new Cluster(this, response.data)
  //     } catch (error) {
  //       console.error('Error:', error)
  //       // throw error;
  //     }
  //   }

  //   // get or create a cluster
  //   async get_or_create_cluster(name, metadata = null) {
  //     try {
  //       const response = await axios.post(this._api_url + '/clusters', {
  //         name,
  //         metadata,
  //         get_or_create: true,
  //       })
  //       if (!response.data) {
  //         throw new Error('Empty response data received')
  //       }
  //       return new Cluster(this, response.data)
  //     } catch (error) {
  //       console.error('Error:', error.response)
  //     }
  //   }

  // get a cluster
  //   async delete_cluster(name) {
  //     try {
  //       const resp = await axios.delete(this._api_url + '/clusters/' + name)
  //       if (resp.status == 200) {
  //         console.log(`Cluster with name ${name} deleted successfully`)
  //       }
  //     } catch (error) {
  //       if (error == "IndexError('list index out of range')") {
  //         console.error('Error', 'Cluster does not exist')
  //       }
  //     }
  //   }

  // reset the database====================================================================================
  async reset() {
    try {
      await fetch(this._api_url + '/reset', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // persist the database on disk====================================================================================
  async persist() {
    try {
      await fetch(this._api_url + '/persist', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // use raw sql to query the database====================================================================================
  //async raw_sql(sql) {
  //    try {
  //        const response = await axios.post(
  //            this._api_url + "/raw_sql",
  //            { raw_sql: sql }
  //        );
  //        if (!response.data) {
  //            throw new Error("Empty response data received");
  //        }
  //        return response.data;
  //    } catch (error) {
  //        console.error("Error:", error);
  //    }
  //};

  // get count of data within a cluster====================================================================================
  async _count(cluster_id) {
    try {
      const response = await fetch(
        this._api_url + '/clusters/' + cluster_id + '/count',
        {
          method: 'GET',
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
  async _get(
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
            where_document: whereDocument,
            include,
          }),
          headers: { 'Content-Type': 'application/json' }, // Set content type header
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
        documents: data.documents ? data.documents : null,
      }
    } catch (error) {
      console.error('Error:', error.message)
    }
  }

  // // get top n data within a cluster
  // async _peek(cluster_id, n = 10) {
  //   let ids
  //   let where
  //   let sort
  //   let limit
  //   let offset
  //   let page
  //   let page_size
  //   let where_document
  //   let include

  //   return this._get(
  //     cluster_id,
  //     (ids = null),
  //     (where = {}),
  //     (sort = null),
  //     (limit = n),
  //     (offset = null),
  //     (page = null),
  //     (page_size = null),
  //     (where_document = {}),
  //     (include = ['embeddings', 'documents', 'metadatas'])
  //   )
  // }

  // modify cluster name and metadata====================================================================================
  async _modify(clusterId, new_name = null, new_metadata = null) {
    try {
      const data = { new_metadata, new_name } // Combine data into a single object
      const response = await fetch(this._api_url + '/clusters/' + clusterId, {
        method: 'PUT', // Use PUT for modifying existing data
        body: JSON.stringify(data), // Convert data to JSON string
        headers: { 'Content-Type': 'application/json' }, // Set content type header
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      return 'success' // Assuming success on 2xx status code
    } catch (error) {
      console.error('Error:', error.message)
    }
  }
  //====================================================================================
  // add data to a cluster
  async _add(
    cluster_id,
    ids,
    embeddings,
    metadatas = null,
    documents = null,
    increment_index = true
  ) {
    try {
      const response = await axios.post(
        this._api_url + '/clusters/' + cluster_id + '/add',
        {
          ids: ids,
          embeddings: embeddings,
          metadatas: metadatas,
          documents: documents,
          increment_index: increment_index,
        }
      )
      if (!response.data) {
        throw new Error('Empty response data received')
      }
      //console.log(response.data);
      return response.data
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // delete data from a cluster====================================================================================
  async _delete(cluster_id, ids = null, where = {}, where_document = {}) {
    try {
      const url = this._api_url + '/clusters/' + cluster_id + '/delete'
      const requestOpts = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, where, where_document }),
      }
      const response = await fetch(url, requestOpts)
      return response.json()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // update data in a cluster====================================================================================
  async _update(
    cluster_id,
    ids,
    embeddings = null,
    metadatas = null,
    documents = null
  ) {
    try {
      const response = await axios.post(
        this._api_url + '/clusters/' + cluster_id + '/update',
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

  // upsert data in a cluster====================================================================================
  async _upsert(
    cluster_id,
    ids,
    embeddings = null,
    metadatas = null,
    documents = null,
    increment_index = true
  ) {
    try {
      const response = await axios.post(
        this._api_url + '/clusters/' + cluster_id + '/upsert',
        { ids, embeddings, metadatas, documents, increment_index }
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

  // query a cluster====================================================================================
  async _query(
    cluster_id,
    query_embeddings,
    n_results = 10,
    where = {},
    where_document = {},
    include = ['metadatas', 'documents', 'distances'],
    query_texts = null
  ) {
    try {
      const response = await axios.post(
        this._api_url + '/clusters/' + `${cluster_id}` + '/query',
        {
          query_embeddings: query_embeddings,
          n_results: n_results,
          where: where,
          where_document: where_document,
          include: include,
          query_texts: query_texts,
        }
      )
      console.log(JSON.stringify(response.data))
      if (!response.data) {
        throw new Error('Empty response data received')
      }
      const { ids, embeddings, documents, metadatas, distances } = JSON.parse(
        JSON.stringify(response.data)
      )
      return {
        ids: ids,
        embeddings: embeddings ? embeddings : null,
        documents: documents ? documents : null,
        metadatas: metadatas ? metadatas : null,
        distances: distances ? distances : null,
      }
    } catch (error) {
      console.error('Error:', error.message)
      throw error
    }
  }

  // create index for a cluster====================================================================================
  async _create_index(cluster_name) {
    try {
      await axios.post(
        this._api_url + '/clusters/' + cluster_name + '/create_index'
      )
    } catch (error) {
      console.error('Error:', error.message)
      throw error
    }
  }

  // add image to a cluster====================================================================================
  async _add_image(cluster_id, image_name, image_data) {
    console.log('add_image', image_data)
    const uid = uuidv4()

    const data = {
      metadata: [{ filename: image_name.toString() }],
      ids: [String(uid)],
      increment_index: true,
    }

    const formData = new FormData()
    formData.append('image', image_data, {
      contentType: 'image/jpeg',
      filename: image_name.toString(),
    })
    formData.append('data', JSON.stringify(data), {
      contentType: 'application/json',
    })

    // Send the POST request====================================================================================
    await fetch(this._api_url + '/clusters/' + cluster_id + '/add_image', {
      method: 'POST',
      body: formData,
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
  async _add_image_web(cluster_id, formData) {
    console.log('add_image_web', formData)
     await fetch(
      this._api_url + '/clusters/' + cluster_id + '/add_image',
      {
        method: 'POST',
        body: formData,
      }
    )
      .then((response) => response.json())
      .then((data) => {
        return data
      })
      .catch((error) => {
        console.error('Error:', error)
      })
  }
}

export default { API }