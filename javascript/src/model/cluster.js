
// Class to interact with a cluster
class Cluster {
    // Constructor
    constructor(client, data) {
        this.name = data.name;
        this.id = data.id;
        this.metadata = data.metadata;
        this._client = client;
    }

    // Methods

    // getting data count within the cluster
    count() {
        return this._client._count(this.id);
    };


    // getting all data within the cluster
    get(ids = null, where = {}, sort = null, limit = null, offset = null, page = null, page_size = null, where_document = {}, include = ["metadatas", "documents"]) {
        return this._client._get(this.id, ids, where, sort, limit, offset, page, page_size, where_document, include);
    };


    // getting top n data within the cluster
    peek(n = 10) {
        return this._client._peek(this.id, n);
    };


    // modifying cluster name and metadata
    modify(name = null, metadata = null) {
        return this._client._modify(this.id, name, metadata);
    };


    // adding data to the cluster
    add(ids, embeddings=null, metadatas=null, documents=null, increment_index=true) {
        return this._client._add(this.id, ids, embeddings, metadatas, documents, increment_index);
    };


    // deleting data from the cluster
    delete(ids = null, where = {}, where_document = {}) {
        return this._client._delete(this.id, ids, where, where_document);
    };


    // updating data in the cluster
    update(ids, embeddings=null, metadatas=null, documents=null) {
        return this._client._update(this.id, ids, embeddings, metadatas, documents);
    };


    // upserting data in the cluster
    upsert(ids, embeddings=null, metadatas=null, documents=null) {
        return this._client._upsert(this.id, ids, embeddings, metadatas, documents);
    }


    // querying data in the cluster
    find(query_embeddings = null, n_results = 10, where = {}, where_document = {}, include = ["metadatas", "documents"], query_texts = null) {
        if ((query_embeddings === null && query_texts === null) || (query_embeddings !== null && query_texts !== null)) {
            throw new Error("You must provide either embeddings or texts to find, but not both");
        }

        if (where === null) {
            where = {};
        }

        if (where_document === null) {
            where_document = {};
        }
        
        return this._client._query(this.id, query_embeddings, n_results, where, where_document, include, query_texts);
    }


    // creating index in the cluster
    create_index() {
        return this._client._create_index(this.name);
    }

}


module.exports = { Cluster };