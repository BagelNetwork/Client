// imports
const axios = require('axios');
const fetch = require('node-fetch');
const { Cluster } = require('../model/cluster.js');


// Class to interact with the Bagel API
class API {
    // Constructor
    constructor(settings) {
        const urlPrefix = settings.bagel_server_ssl_enabled ? "https" : "http";
        if(!settings.bagel_server_host || !settings.bagel_server_http_port) {
            throw new Error("Missing required config values 'bagel_server_host' and/or 'bagel_server_http_port'");
        }
        this._api_url = `${urlPrefix}://${settings.bagel_server_host}:${settings.bagel_server_http_port}/api/v1`;
    };


    // Methods

    // ping the Bagel API
    async ping() {
        try {
            const response = await axios.get(this._api_url);
            if (!response.data) {
                throw new Error("Empty response data received");
            }
            if(parseInt(response.data["nanosecond heartbeat"]) > 0) {
                return "pong";
            }
        } catch (error) {
            console.error("Error:", error.response.data.error);
        }
    };


    // get the Bagel API version
    async get_version() {
        try {
            const response = await axios.get(this._api_url + "/version");
            if (!response.data) {
                throw new Error("Empty response data received");
            }
            return response.data;
        }
        catch (error) {
            console.error("Error:", error.response.data.error);
        }
    };


    // get all clusters
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
            console.error("Error:", error.response.data.error);
        }
    };



    // create a cluster
    async create_cluster(name, metadata = null, get_or_create = false) {
    try {
        const response = await axios.post(
            this._api_url + "/clusters",
            { name, metadata, get_or_create }
        );
        if (!response.data) {
            throw new Error("Empty response data received");
        }
        return new Cluster(this, response.data);
    } catch (error) {
        console.error("Error:", error.response.data.error);
        // throw error;
        }
    };


    // get or create a cluster
    async get_or_create_cluster(name, metadata = null) {
        try {
            const response = await axios.post(
                this._api_url + "/clusters",
                { name, metadata, get_or_create: true }
            );
            if (!response.data) {
                throw new Error("Empty response data received");
            }
            return new Cluster(this, response.data);
        } catch (error) {
            console.error("Error:", error.response.data.error);
        }
    };


    // get a cluster
    async delete_cluster(name) {
        try {
            const resp = await axios.delete(this._api_url + "/clusters/" + name);
            if(resp.status == 200){
                console.log(`Cluster with name ${name} deleted successfully`);
            }
        } catch (error) {
            if(error.response.data.error == "IndexError('list index out of range')"){
                console.error("Error", "Cluster does not exist");
            }
        }
    };


    // reset the database
    async reset() {
        try {
            await axios.post(this._api_url + "/reset");
        } catch (error) {
            console.error("Error:", error.response.data.error);
        }
    };


    // persist the database on disk
    async persist() {
        try {
            await axios.post(this._api_url + "/persist");
        } catch (error) {
            console.error("Error:", error.response.data.error);
        }
    };



    // use raw sql to query the database
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
            console.error("Error:", error.response.data.error);
        }
    };



    // get count of data within a cluster
    async _count(cluster_id) {
        try {
            const response = await axios.get(this._api_url + "/clusters/" + cluster_id + "/count");
            if (!response.data) {
                throw new Error("Empty response data received");
            }
            return parseInt(response.data);
        } catch (error) {
            console.error("Error:", error.response.data.error);
        }
    };



    // get data within a cluster
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
            console.error("Error:", error.response.data.error);
        }
    };



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

        return this._get(cluster_id, ids = null, where = {}, sort = null, limit = n, offset = null, page = null, page_size = null, where_document = {}, include = ["embeddings", "documents", "metadatas"]);
    };



    // modify cluster name and metadata
    async _modify(cluster_id, new_name = null, new_metadata = null) {
        try {
            const response = await axios.put(
                this._api_url + "/clusters/" + cluster_id,
                { "new_metadata": new_metadata, "new_name": new_name },
                { headers: { "Content-Type": "application/json" }}
            );
            return 'success';
        } catch (error) {
            console.error("Error:", error.response.data.error);
        }
    };



    // add data to a cluster
    async _add(cluster_id, ids, embeddings, metadatas=null, documents=null, increment_index=true) {
        try {
            const response = await axios.post(
                this._api_url + "/clusters/" + cluster_id + "/add",
                {
                    "ids": ids,
                    "embeddings": embeddings,
                    "metadatas": metadatas,
                    "documents": documents,
                    "increment_index": increment_index,
                }
            );
            if (!response.data) {
                throw new Error("Empty response data received");
            }
            //console.log(response.data);
            return response.data;
        } catch (error) {
            console.error("Error:", error.response.data.error);
        }
    }



    // delete data from a cluster
    async _delete(cluster_id, ids = null, where = {}, where_document = {}) {
        try {
            const url = this._api_url + "/clusters/" + cluster_id + "/delete";
            const requestOpts = {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids, where, where_document })
            };
            const response = await fetch(url, requestOpts);
            return response.json();
        } catch (error) {
            console.error("Error:", error.response.data.error);
        }
    };


    // update data in a cluster
    async _update(cluster_id, ids, embeddings=null, metadatas=null, documents=null) {
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
    };


    // upsert data in a cluster
    async _upsert(cluster_id, ids, embeddings=null, metadatas=null, documents=null, increment_index=true) {
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
    };


    // query a cluster
    async _query(cluster_id, query_embeddings, n_results = 10, where = {}, where_document = {}, include = ["metadatas", "documents", "distances"], query_texts = null) {
        try {
            const response = await axios.post(
                this._api_url + "/clusters/" + `${cluster_id}` + "/query",
                {
                    "query_embeddings": query_embeddings,
                    "n_results": n_results,
                    "where": where,
                    "where_document": where_document,
                    "include": include,
                    "query_texts": query_texts,
                }
            );
            console.log(JSON.stringify(response.data));
            if (!response.data) {
                throw new Error("Empty response data received");
            }
            const {ids, embeddings, documents, metadatas, distances} = response.data;
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
    };



    // query a cluster by text
    async _query_text(cluster_id, query_texts, n_results = 10, where = {}, where_document = {}, include = ["metadatas", "documents", "distances"], query_embeddings = null) {
        try {
            const response = await axios.post(
                this._api_url + "/clusters/" + `${cluster_id}` + "/query",
                {
                    "query_embeddings": query_embeddings,
                    "n_results": n_results,
                    "where": where,
                    "where_document": where_document,
                    "include": include,
                    "query_texts": query_texts,
                }
            );
            console.log(JSON.stringify(response.data));
            if (!response.data) {
                throw new Error("Empty response data received");
            }
            const {ids, embeddings, documents, metadatas, distances} = response.data;
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
    };
    

    // create index for a cluster
    async _create_index(cluster_name) {
        try {
            await axios.post(this._api_url + "/clusters/" + cluster_name + "/create_index");
        } catch (error) {
            console.error("Error:", error.message);
            throw error;
        }
    }

};



module.exports = { API };