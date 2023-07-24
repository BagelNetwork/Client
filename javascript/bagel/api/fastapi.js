const axios = require("axios");
const { Cluster } = require("bagel");
const emb = require("bagel/utils/embedding_utils");
const errors = require("bagel/errors");

class FastAPI {
  constructor(system) {
    super(system);
    const urlPrefix = system.settings.bagel_server_ssl_enabled ? "https" : "http";
    const { bagel_server_host, bagel_server_http_port } = system.settings;
    this._apiUrl = `${urlPrefix}://${bagel_server_host}:${bagel_server_http_port}/api/v1`;
  }

  ping() {
    console.log(`url ${this._apiUrl}`);
    return axios.get(this._apiUrl)
      .then(resp => resp.data["nanosecond heartbeat"])
      .catch(raiseBagelError);
  }

  getAllClusters() {
    return axios.get(`${this._apiUrl}/clusters`)
      .then(resp => {
        const jsonClusters = resp.data;
        return jsonClusters.map(jsonCluster => new Cluster(this, jsonCluster));
      })
      .catch(raiseBagelError);
  }

  createCluster(name, metadata = null, embeddingFunction = emb.DefaultEmbeddingFunction(), getOrCreate = false) {
    return axios.post(`${this._apiUrl}/clusters`, {
      name: name,
      metadata: metadata,
      get_or_create: getOrCreate
    })
      .then(resp => new Cluster(this, {
        id: resp.data.id,
        name: resp.data.name,
        embedding_function: embeddingFunction,
        metadata: resp.data.metadata
      }))
      .catch(raiseBagelError);
  }

  getCluster(name, embeddingFunction = emb.DefaultEmbeddingFunction()) {
    return axios.get(`${this._apiUrl}/clusters/${name}`)
      .then(resp => new Cluster(this, {
        name: resp.data.name,
        id: resp.data.id,
        embedding_function: embeddingFunction,
        metadata: resp.data.metadata
      }))
      .catch(raiseBagelError);
  }

  getOrCreateCluster(name, metadata = null, embeddingFunction = emb.DefaultEmbeddingFunction()) {
    return this.createCluster(name, metadata, embeddingFunction, true);
  }

  _modify(id, newName = null, newMetadata = null) {
    return axios.put(`${this._apiUrl}/clusters/${id}`, {
      new_name: newName,
      new_metadata: newMetadata
    })
      .catch(raiseBagelError);
  }

  deleteCluster(name) {
    return axios.delete(`${this._apiUrl}/clusters/${name}`)
      .catch(raiseBagelError);
  }

  _count(clusterId) {
    return axios.get(`${this._apiUrl}/clusters/${clusterId}/count`)
      .then(resp => resp.data)
      .catch(raiseBagelError);
  }

  _peek(clusterId, n = 10) {
    return this._get(clusterId, { limit: n, include: ["embeddings", "documents", "metadatas"] });
  }

  _get(clusterId, ids = null, where = {}, sort = null, limit = null, offset = null, page = null, pageSize = null, whereDocument = {}, include = ["metadatas", "documents"]) {
    if (page && pageSize) {
      offset = (page - 1) * pageSize;
      limit = pageSize;
    }

    return axios.post(`${this._apiUrl}/clusters/${clusterId}/get`, {
      ids: ids,
      where: where,
      sort: sort,
      limit: limit,
      offset: offset,
      where_document: whereDocument,
      include: include
    })
      .then(resp => {
        const body = resp.data;
        return {
          ids: body.ids,
          embeddings: body.embeddings || null,
          metadatas: body.metadatas || null,
          documents: body.documents || null
        };
      })
      .catch(raiseBagelError);
  }

  _delete(clusterId, ids = null, where = {}, whereDocument = {}) {
    return axios.post(`${this._apiUrl}/clusters/${clusterId}/delete`, {
      ids: ids,
      where: where,
      where_document: whereDocument
    })
      .then(resp => resp.data)
      .catch(raiseBagelError);
  }

  _add(clusterId, ids, embeddings, metadatas = null, documents = null, incrementIndex = true) {
    return axios.post(`${this._apiUrl}/clusters/${clusterId}/add`, {
      ids: ids,
      embeddings: embeddings,
      metadatas: metadatas,
      documents: documents,
      increment_index: incrementIndex
    })
      .then(() => true)
      .catch(raiseBagelError);
  }

  _update(clusterId, ids, embeddings = null, metadatas = null, documents = null) {
    return axios.post(`${this._apiUrl}/clusters/${clusterId}/update`, {
      ids: ids,
      embeddings: embeddings,
      metadatas: metadatas,
      documents: documents
    })
      .then(() => true)
      .catch(raiseBagelError);
  }

  _upsert(clusterId, ids, embeddings, metadatas = null, documents = null, incrementIndex = true) {
    return axios.post(`${this._apiUrl}/clusters/${clusterId}/upsert`, {
      ids: ids,
      embeddings: embeddings,
      metadatas: metadatas,
      documents: documents,
      increment_index: incrementIndex
    })
      .then(() => true)
      .catch(raiseBagelError);
  }

  _query(clusterId, queryEmbeddings, nResults = 10, where = {}, whereDocument = {}, include = ["metadatas", "documents", "distances"]) {
    return axios.post(`${this._apiUrl}/clusters/${clusterId}/query`, {
      query_embeddings: queryEmbeddings,
      n_results: nResults,
      where: where,
      where_document: whereDocument,
      include: include
    })
      .then(resp => {
        const body = resp.data;
        return {
          ids: body.ids,
          distances: body.distances || null,
          embeddings: body.embeddings || null,
          metadatas: body.metadatas || null,
          documents: body.documents || null
        };
      })
      .catch(raiseBagelError);
  }

  reset() {
    return axios.post(`${this._apiUrl}/reset`)
      .catch(raiseBagelError);
  }

  persist() {
    return axios.post(`${this._apiUrl}/persist`)
      .then(resp => resp.data)
      .catch(raiseBagelError);
  }

  rawSql(sql) {
    return axios.post(`${this._apiUrl}/raw_sql`, { raw_sql: sql })
      .then(resp => resp.data)
      .catch(raiseBagelError);
  }

  createIndex(clusterName) {
    return axios.post(`${this._apiUrl}/clusters/${clusterName}/create_index`)
      .then(resp => resp.data)
      .catch(raiseBagelError);
  }

  getVersion() {
    return axios.get(`${this._apiUrl}/version`)
      .then(resp => resp.data)
      .catch(raiseBagelError);
  }
}

function raiseBagelError(resp) {
  if (resp.status >= 400) {
    let bagelError = null;
    try {
      const body = resp.data;
      if ("error" in body && errors.error_types.hasOwnProperty(body.error)) {
        bagelError = new errors.error_types[body.error](body.message);
      }
    } catch (err) {
      // Ignore any errors during error handling
    }

    if (bagelError) {
      throw bagelError;
    } else {
      throw new Error(resp.statusText);
    }
  }
}

module.exports = FastAPI;
