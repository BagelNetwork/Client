// imports
const axios = require('axios')
const fetch = require('node-fetch')
const { Cluster } = require('../model/cluster.js')
const { v4: uuidv4 } = require('uuid')
const FormData = require('form-data')

// Class to interact with the Bagel API
class API {
  // Constructor
  constructor (settings) {
    const urlPrefix = settings.bagel_server_ssl_enabled ? 'https' : 'http'
    if (!settings.bagel_server_host) {
      throw new Error("Missing required config values 'bagel_server_host' and/or 'bagel_server_http_port'")
    }
    let port
    if (settings.bagel_server_http_port) {
      port = settings.bagel_server_http_port
    } else if (settings.bagel_server_ssl_enabled && settings.bagel_server_https_port) {
      port = settings.bagel_server_https_port
    } else {
      port = 80
    }

    this._api_url = `${urlPrefix}://${settings.bagel_server_host}:${port}/api/v1`
  };

  // Methods

  // ping the Bagel API
  async ping () {
    try {
      const response = await axios.get(this._api_url)
      if (!response.data) {
        throw new Error('Empty response data received')
      }
      if (parseInt(response.data['nanosecond heartbeat']) > 0) {
        return 'pong'
      }
    } catch (error) {
      console.error('Error:', error)
    }
  };

  // get the Bagel API version
  async get_version () {
    try {
      const response = await axios.get(this._api_url + '/version')
      if (!response.data) {
        throw new Error('Empty response data received')
      }
      return response.data
    } catch (error) {
      console.error('Error:', error)
    }
  };

  // get all clusters
  async get_all_clusters () {
    try {
      const response = await axios.get(this._api_url + '/clusters')
      if (!response.data) {
        throw new Error('Empty response data received')
      }
      const jsonClusters = response.data
      const clusters = jsonClusters.map(jsonCluster => new Cluster(this, jsonCluster))
      return clusters
    } catch (error) {
      console.error('Error:', error)
    }
  };

  // create a cluster
  async create_cluster (name, metadata = null, getOrCreate = false) {
    try {
      const response = await axios.post(
        this._api_url + '/clusters',
        { name, metadata, getOrCreate }
      )
      if (!response.data) {
        throw new Error('Empty response data received')
      }
      return new Cluster(this, response.data)
    } catch (error) {
      console.error('Error:', error)
      // throw error;
    }
  };

  // get or create a cluster
  async get_or_create_cluster (name, metadata = null) {
    try {
      const response = await axios.post(
        this._api_url + '/clusters',
        { name, metadata, getOrCreate: true }
      )
      if (!response.data) {
        throw new Error('Empty response data received')
      }
      return new Cluster(this, response.data)
    } catch (error) {
      console.error('Error:', error.response)
    }
  };

  // get a cluster
  async delete_cluster (name) {
    try {
      const resp = await axios.delete(this._api_url + '/clusters/' + name)
      if (resp.status === 200) {
        console.log(`Cluster with name ${name} deleted successfully`)
      }
    } catch (error) {
      if (error === "IndexError('list index out of range')") {
        console.error('Error', 'Cluster does not exist')
      }
    }
  };

  // reset the database
  async reset () {
    try {
      await axios.post(this._api_url + '/reset')
    } catch (error) {
      console.error('Error:', error)
    }
  };

  // persist the database on disk
  async persist () {
    try {
      await axios.post(this._api_url + '/persist')
    } catch (error) {
      console.error('Error:', error)
    }
  };

  // use raw sql to query the database
  // async raw_sql(sql) {
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
  // };

  // get count of data within a cluster
  async _count (clusterId) {
    try {
      const response = await axios.get(this._api_url + '/clusters/' + clusterId + '/count')
      if (!response.data) {
        throw new Error('Empty response data received')
      }
      return parseInt(response.data)
    } catch (error) {
      console.error('Error:', error)
    }
  };

  // get data within a cluster
  async _get (clusterId, ids = null, where = {}, sort = null, limit = null, offset = null, page = null, pageSize = null, whereDocument = {}, include = ['metadatas', 'documents']) {
    if (page && pageSize) {
      offset = (page - 1) * pageSize
      limit = pageSize
    }

    try {
      const response = await axios.post(
        this._api_url + '/clusters/' + clusterId + '/get',
        {
          ids,
          where,
          sort,
          limit,
          offset,
          whereDocument,
          include
        }
      )
      if (!response.data) {
        throw new Error('Empty response data received')
      }
      const { ids: resultIds, embeddings, metadatas, documents } = response.data
      return {
        ids: resultIds,
        embeddings: embeddings || null,
        metadatas: metadatas || null,
        documents: documents || null
      }
    } catch (error) {
      console.error('Error:', error)
    }
  };

  // get top n data within a cluster
  async _peek (
    clusterId,
    n = 10,
    {
      ids = null,
      where = {},
      sort = null,
      limit = n,
      offset = null,
      page = null,
      pageSize = null,
      whereDocument = {},
      include = ['embeddings', 'documents', 'metadatas']
    } = {}
  ) {
    return this._get(clusterId, ids, where, sort, limit, offset, page, pageSize, whereDocument, include)
  }

  // modify cluster name and metadata
  async _modify (clusterId, newName = null, newMetadata = null) {
    try {
      await axios.put(
        this._api_url + '/clusters/' + clusterId,
        { newMetadata, newName },
        { headers: { 'Content-Type': 'application/json' } }
      )
      return 'success'
    } catch (error) {
      console.error('Error:', error)
    }
  };

  // add data to a cluster
  async _add (clusterId, ids, embeddings, metadatas = null, documents = null, incrementIndex = true) {
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

  // delete data from a cluster
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
  };

  // update data in a cluster
  async _update (clusterId, ids, embeddings = null, metadatas = null, documents = null) {
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
  };

  // upsert data in a cluster
  async _upsert (clusterId, ids, embeddings = null, metadatas = null, documents = null, incrementIndex = true) {
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
  };

  // query a cluster
  async _query (clusterId, queryEmbeddings, nResults = 10, where = {}, whereDocument = {}, include = ['metadatas', 'documents', 'distances'], queryTexts = null) {
    try {
      const response = await axios.post(
        this._api_url + '/clusters/' + `${clusterId}` + '/query',
        {
          queryEmbeddings,
          nResults,
          where,
          whereDocument,
          include,
          queryTexts
        }
      )
      console.log(JSON.stringify(response.data))
      if (!response.data) {
        throw new Error('Empty response data received')
      }
      const { ids, embeddings, documents, metadatas, distances } = JSON.parse(JSON.stringify(response.data))
      return {
        ids,
        embeddings: embeddings || null,
        documents: documents || null,
        metadatas: metadatas || null,
        distances: distances || null
      }
    } catch (error) {
      console.error('Error:', error.message)
      throw error
    }
  };

  // create index for a cluster
  async _create_index (clusterName) {
    try {
      await axios.post(this._api_url + '/clusters/' + clusterName + '/create_index')
    } catch (error) {
      console.error('Error:', error.message)
      throw error
    }
  }

  // add image to a cluster
  async _add_image (clusterId, imageName, imageData) {
    console.log('add_image', imageData)
    const uid = uuidv4()

    const data = {
      metadata: [{ filename: imageName.toString() }],
      ids: [String(uid)],
      incrementIndex: true
    }

    const formData = new FormData()
    formData.append('image', imageData, { contentType: 'image/jpeg', filename: imageName.toString() })
    formData.append('data', JSON.stringify(data), { contentType: 'application/json' })

    // Send the POST request
    await fetch(this._api_url + '/clusters/' + clusterId + '/add_image', {
      method: 'POST',
      body: formData
    }).then(response => response.json()).then(data => {
      return data
    }).catch((error) => {
      console.error('Error:', error)
    })
  };

  // add images to a cluster via web form
  async _add_image_web (clusterId, formData) {
    console.log('add_image_web', formData)
    await fetch(this._api_url + '/clusters/' + clusterId + '/add_image', {
      method: 'POST',
      body: formData
    }).then(response => response.json()).then(data => {
      return data
    }
    ).catch((error) => {
      console.error('Error:', error)
    }
    )
  };
};

module.exports = { API }
