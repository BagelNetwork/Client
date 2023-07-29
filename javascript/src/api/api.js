const axios = require("axios");
const { Cluster } = require("../model/cluster.js");

class API {
  constructor(settings) {
    const urlPrefix = settings.bagel_server_ssl_enabled ? "https" : "http";
    if(!settings.bagel_server_host || !settings.bagel_server_http_port) {
        throw new Error("Missing required config values 'bagel_server_host' and/or 'bagel_server_http_port'");
    }
    this._api_url = `${urlPrefix}://${settings.bagel_server_host}:${settings.bagel_server_http_port}/api/v1`;
  }

  async ping() {
    try {
      const response = await axios.get(this._api_url);
      if (!response.data) {
        throw new Error("Empty response data received");
      }
      return parseInt(response.data["nanosecond heartbeat"]);
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }

  async get_all_clusters() {
    try {
      const response = await axios.get(this._api_url + "/clusters");
      if (!response.data) {
        throw new Error("Empty response data received");
      }
      const json_clusters = response.data;
      const clusters = json_clusters.map(json_cluster => new Cluster(this, json_cluster));
      return clusters;
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }

  async create_cluster(name, metadata = null, get_or_create = false) {
    try {
      const response = await axios.post(
        this._api_url + "/clusters",
        { name, metadata, get_or_create }
      );
      if (!response.data) {
        throw new Error("Empty response data received");
      }
      const { id, name: clusterName, metadata: clusterMetadata } = response.data;
      return new Cluster(this, { id, name: clusterName, metadata: clusterMetadata });
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }

  async get_cluster(name) {
    try {
      const response = await axios.get(this._api_url + "/clusters/" + name);
      if (!response.data) {
        throw new Error("Empty response data received");
      }
      const { id, name: clusterName, metadata: clusterMetadata } = response.data;
      return new Cluster(this, { id, name: clusterName, metadata: clusterMetadata });
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }

  async get_or_create_cluster(name, metadata = null) {
    try {
      return await this.create_cluster(name, metadata, true);
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }

  async _modify(id, new_name = null, new_metadata = null) {
    try {
      await axios.put(
        this._api_url + "/clusters/" + id,
        { new_metadata, new_name }
      );
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }

  async delete_cluster(name) {
    try {
      await axios.delete(this._api_url + "/clusters/" + name);
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }

  async _count(cluster_id) {
    try {
      const response = await axios.get(this._api_url + "/clusters/" + cluster_id + "/count");
      if (!response.data) {
        throw new Error("Empty response data received");
      }
      return parseInt(response.data);
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }

  async _peek(cluster_id, n = 10) {
    return this._get(cluster_id, n, ["embeddings", "documents", "metadatas"]);
  }

  async _get(cluster_id, ids = null, where = {}, sort = null, limit = null, offset = null, page = null, page_size = null, where_document = {}, include = ["metadatas", "documents"]) {
    if (page && page_size) {
      offset = (page - 1) * page_size;
      limit = page_size;
    }

    try {
      const response = await axios.post(
        this._api_url + "/clusters/" + cluster_id + "/get",
        {
          ids,
          where,
          sort,
          limit,
          offset,
          where_document,
          include
        }
      );
      if (!response.data) {
        throw new Error("Empty response data received");
      }
      const { ids: resultIds, embeddings, metadatas, documents } = response.data;
      return {
        ids: resultIds,
        embeddings: embeddings ? embeddings : null,
        metadatas: metadatas ? metadatas : null,
        documents: documents ? documents : null
      };
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }

  async _delete(cluster_id, ids = null, where = {}, where_document = {}) {
    try {
      const response = await axios.post(
        this._api_url + "/clusters/" + cluster_id + "/delete",
        { where, ids, where_document }
      );
      if (!response.data) {
        throw new Error("Empty response data received");
      }
      return response.data;
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }

  async _add(ids, cluster_id, embeddings = null, metadatas = null, documents = null, increment_index = true) {
    try {
      const response = await axios.post(
        this._api_url + "/clusters/" + cluster_id + "/add",
        {
          ids,
          embeddings,
          metadatas,
          documents,
          increment_index
        }
      );
      if (!response.data) {
        throw new Error("Empty response data received");
      }
      return true;
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }

  async _update(cluster_id, ids, embeddings = null, metadatas = null, documents = null) {
    try {
      const response = await axios.post(
        this._api_url + "/clusters/" + cluster_id + "/update",
        { ids, embeddings, metadatas, documents }
      );
      if (!response.data) {
        throw new Error("Empty response data received");
      }
      return true;
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }

  async _upsert(cluster_id, ids, embeddings = null, metadatas = null, documents = null, increment_index = true) {
    try {
      const response = await axios.post(
        this._api_url + "/clusters/" + cluster_id + "/upsert",
        {
          ids,
          embeddings,
          metadatas,
          documents,
          increment_index
        }
      );
      if (!response.data) {
        throw new Error("Empty response data received");
      }
      return true;
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }

  async _query(cluster_id, query_embeddings, n_results = 10, where = {}, where_document = {}, include = ["metadatas", "documents", "distances"], query_texts = null) {
    try {
      const response = await axios.post(
        this._api_url + "/clusters/" + cluster_id + "/query",
        {
          query_embeddings,
          n_results,
          where,
          where_document,
          include,
          query_texts
        }
      );
      if (!response.data) {
        throw new Error("Empty response data received");
      }
      const { ids: resultIds, distances, embeddings, metadatas, documents } = response.data;
      return {
        ids: resultIds,
        distances: distances ? distances : null,
        embeddings: embeddings ? embeddings : null,
        metadatas: metadatas ? metadatas : null,
        documents: documents ? documents : null
      };
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }

  async reset() {
    try {
      await axios.post(this._api_url + "/reset");
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }

  async persist() {
    try {
      const response = await axios.post(this._api_url + "/persist");
      if (!response.data) {
        throw new Error("Empty response data received");
      }
      return response.data;
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }

  async raw_sql(sql) {
    try {
      const response = await axios.post(
        this._api_url + "/raw_sql",
        { raw_sql: sql }
      );
      if (!response.data) {
        throw new Error("Empty response data received");
      }
      return response.data;
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }

  async create_index(cluster_name) {
    try {
      const response = await axios.post(
        this._api_url + "/clusters/" + cluster_name + "/create_index"
      );
      if (!response.data) {
        throw new Error("Empty response data received");
      }
      return response.data;
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }

  async get_version() {
    try {
      const response = await axios.get(this._api_url + "/version");
      if (!response.data) {
        throw new Error("Empty response data received");
      }
      return response.data;
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }
}


module.exports = { API };