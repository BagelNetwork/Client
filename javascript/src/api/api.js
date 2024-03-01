// imports
const axios = require("axios");
const fetch = require("node-fetch");
const { Cluster } = require("../model/cluster.js");
const { v4: uuidv4 } = require("uuid");
const FormData = require("form-data");
const Buffer = require("buffer").Buffer;
const DEFAULT_TENANT = "default_tenant";
const DEFAULT_DATABASE = "default_database";
const fs = require("fs");
const path = require("path");

// Class to interact with the Bagel API
class API {
  // Constructor
  constructor(settings) {
    const urlPrefix = settings.bagel_server_ssl_enabled ? "https" : "http";
    if (!settings.bagel_server_host) {
      throw new Error(
        "Missing required config values 'bagel_server_host' and/or 'bagel_server_http_port'"
      );
    }
    let port;
    if (settings.bagel_server_http_port) {
      port = settings.bagel_server_http_port;
    } else if (
      settings.bagel_server_ssl_enabled &&
      settings.bagel_server_https_port
    ) {
      port = settings.bagel_server_https_port;
    } else {
      port = 80;
    }

    this._api_url = `${urlPrefix}://${settings.bagel_server_host}:${port}/api/v1`;
  }
  _populateHeadersWithApiKey(api_key = null) {
    const headers = {
      "Content-Type": "application/json", // Default header
      // Add more default headers here if necessary
    };

    if (api_key) {
      headers["Authorization"] = `Bearer ${api_key}`; // Assuming the API expects a Bearer token
    }

    return headers;
  }
  // Methods

  // ping the Bagel API
  async ping() {
    try {
      const response = await axios.get(this._api_url, {
        headers: this._headers,
      });
      return response.data["nanosecond heartbeat"];
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // get the Bagel API version
  async get_version() {
    try {
      const response = await axios.get(this._api_url + "/version");
      if (!response.data) {
        throw new Error("Empty response data received");
      }
      return response.data;
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // get all clusters
  async get_all_clusters() {
    try {
      const response = await axios.get(this._api_url + "/clusters");
      if (!response.data) {
        throw new Error("Empty response data received");
      }
      const json_clusters = response.data;
      const clusters = json_clusters.map(
        (json_cluster) => new Cluster(this, json_cluster)
      );
      return clusters;
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // create a cluster
  async create_cluster(
    name,
    metadata = null,
    get_or_create = false,
    user_id = DEFAULT_TENANT,
    api_key = null,
    embedding_model = null
  ) {
    const headers = this._populateHeadersWithApiKey(api_key);
    try {
      const response = await axios.post(
        `${this._api_url}/clusters`,
        {
          name,
          metadata,
          get_or_create,
          user_id,
          embedding_model,
        },
        { headers }
      );
      return new Cluster(this, response.data);
    } catch (error) {
      console.error("Error:", error.response || error);
    }
  }

  // get or create a cluster
  async get_or_create_cluster(
    name,
    metadata = null,
    user_id = DEFAULT_TENANT,
    api_key = null,
    embedding_model = null
  ) {
    const headers = this._populateHeadersWithApiKey(api_key);
    // Additional logic to include user_id and embedding_model in the request if necessary
    try {
      const response = await axios.post(
        `${this._api_url}/clusters`,
        {
          name,
          metadata,
          get_or_create: true,
          user_id,
          embedding_model,
        },
        { headers }
      );
      return new Cluster(this, response.data);
    } catch (error) {
      console.error("Error:", error.response);
    }
  }

  // get a cluster
  async delete_cluster(name) {
    try {
      const resp = await axios.delete(this._api_url + "/clusters/" + name);
      if (resp.status == 200) {
        console.log(`Cluster with name ${name} deleted successfully`);
      }
    } catch (error) {
      if (error == "IndexError('list index out of range')") {
        console.error("Error", "Cluster does not exist");
      }
    }
  }

  // reset the database
  async reset() {
    try {
      await axios.post(this._api_url + "/reset");
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // persist the database on disk
  async persist() {
    try {
      await axios.post(this._api_url + "/persist");
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // use raw sql to query the database
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

  // get count of data within a cluster
  async _count(cluster_id, api_key = null) {
    try {
      const headers = {};
      if (api_key) {
        headers["Authorization"] = `Bearer ${api_key}`;
      }

      const response = await axios.get(
        `${this._api_url}/clusters/${cluster_id}/count`,
        { headers }
      );

      if (!response.data) {
        throw new Error("Empty response data received");
      }
      return parseInt(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // get data within a cluster
  async _get(
    cluster_id,
    ids = null,
    where = {},
    sort = null,
    limit = null,
    offset = null,
    page = null,
    page_size = null,
    where_document = {},
    include = ["metadatas", "documents"]
  ) {
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
          include,
        }
      );
      if (!response.data) {
        throw new Error("Empty response data received");
      }
      const {
        ids: resultIds,
        embeddings,
        metadatas,
        documents,
      } = response.data;
      return {
        ids: resultIds,
        embeddings: embeddings ? embeddings : null,
        metadatas: metadatas ? metadatas : null,
        documents: documents ? documents : null,
      };
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // get top n data within a cluster
  async _peek(cluster_id, n = 10) {
    let ids;
    let where;
    let sort;
    let limit;
    let offset;
    let page;
    let page_size;
    let where_document;
    let include;

    return this._get(
      cluster_id,
      (ids = null),
      (where = {}),
      (sort = null),
      (limit = n),
      (offset = null),
      (page = null),
      (page_size = null),
      (where_document = {}),
      (include = ["embeddings", "documents", "metadatas"])
    );
  }

  // modify cluster name and metadata
  async _modify(cluster_id, new_name = null, new_metadata = null) {
    try {
      const response = await axios.put(
        this._api_url + "/clusters/" + cluster_id,
        { new_metadata: new_metadata, new_name: new_name },
        { headers: { "Content-Type": "application/json" } }
      );
      return "success";
    } catch (error) {
      console.error("Error:", error);
    }
  }

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
        this._api_url + "/clusters/" + cluster_id + "/add",
        {
          ids: ids,
          embeddings: embeddings,
          metadatas: metadatas,
          documents: documents,
          increment_index: increment_index,
        }
      );
      if (!response.data) {
        throw new Error("Empty response data received");
      }
      //console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // delete data from a cluster
  async _delete(
    cluster_id,
    ids = null,
    where = {},
    where_document = {},
    api_key = null
  ) {
    const headers = this._populateHeadersWithApiKey(api_key);
    try {
      const response = await axios.post(
        `${this._api_url}/clusters/${cluster_id}/delete`,
        { ids, where, where_document },
        { headers }
      );
      console.log("Data deleted successfully");
    } catch (error) {
      console.error("Error:", error.response || error);
    }
  }

  // update data in a cluster
  async _update(
    cluster_id,
    ids,
    embeddings = null,
    metadatas = null,
    documents = null,
    api_key = null
  ) {
    try {
      const response = await axios.post(
        this._api_url + "/clusters/" + cluster_id + "/update",
        { ids, embeddings, metadatas, documents }
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

  // upsert data in a cluster
  async _upsert(
    cluster_id,
    ids,
    embeddings = null,
    metadatas = null,
    documents = null,
    increment_index = true,
    api_key = null
  ) {
    try {
      const response = await axios.post(
        this._api_url + "/clusters/" + cluster_id + "/upsert",
        { ids, embeddings, metadatas, documents, increment_index }
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

  // query a cluster
  async _query(
    cluster_id,
    query_embeddings,
    n_results = 10,
    where = {},
    where_document = {},
    include = ["metadatas", "documents", "distances"],
    query_texts = null
  ) {
    try {
      const response = await axios.post(
        this._api_url + "/clusters/" + `${cluster_id}` + "/query",
        {
          query_embeddings: query_embeddings,
          n_results: n_results,
          where: where,
          where_document: where_document,
          include: include,
          query_texts: query_texts,
        }
      );
      console.log(JSON.stringify(response.data));
      if (!response.data) {
        throw new Error("Empty response data received");
      }
      const { ids, embeddings, documents, metadatas, distances } = JSON.parse(
        JSON.stringify(response.data)
      );
      return {
        ids: ids,
        embeddings: embeddings ? embeddings : null,
        documents: documents ? documents : null,
        metadatas: metadatas ? metadatas : null,
        distances: distances ? distances : null,
      };
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }

  // create index for a cluster
  async _create_index(cluster_name) {
    try {
      await axios.post(
        this._api_url + "/clusters/" + cluster_name + "/create_index"
      );
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }

  // add image to a cluster
  async _add_image(cluster_id, filename, metadata = null, api_key = null) {
    const headers = this._populateHeadersWithApiKey(api_key);
    headers["Content-Type"] = "multipart/form-data"; // Set appropriately by the FormData instance

    const formData = new FormData();
    const fileStream = fs.createReadStream(filename);
    formData.append("image", fileStream);
    formData.append(
      "metadata",
      JSON.stringify(metadata || { filename: path.basename(filename) })
    );

    try {
      const response = await axios.post(
        `${this._api_url}/clusters/${cluster_id}/add_image`,
        formData,
        {
          headers: formData.getHeaders(),
        }
      );
      console.log("Image added successfully");
    } catch (error) {
      console.error("Error:", error.response || error);
    }
  }

  // add images to a cluster via web form
  async _add_image_web(cluster_id, formData) {
    console.log("add_image_web", formData);
    const resp = await fetch(
      this._api_url + "/clusters/" + cluster_id + "/add_image",
      {
        method: "POST",
        body: formData,
      }
    )
      .then((response) => response.json())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

module.exports = { API };
