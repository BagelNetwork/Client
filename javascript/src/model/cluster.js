class Cluster {
  constructor(client, name, id, metadata = null) {
    this._client = client;
    this.name = name;
    this.id = id;
    this.metadata = metadata;
  }

  count() {
    return this._client._count(this.id);
  }

  add(ids, embeddings = null, metadatas = null, documents = null, increment_index = true) {
    this._client._add(ids, this.id, embeddings, metadatas, documents, increment_index);
  }

  get(ids = null, where = null, limit = null, offset = null, where_document = null, include = ["metadatas", "documents"]) {
    return this._client._get(this.id, ids, where, null, limit, offset, where_document, include);
  }

  peek(limit = 10) {
    return this._client._peek(this.id, limit);
  }

  find(query_embeddings = null, query_texts = null, n_results = 10, where = null, where_document = null, include = ["metadatas", "documents", "distances"]) {
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

  modify(name = null, metadata = null) {
    this._client._modify(this.id, name, metadata);
    if (name !== null) {
      this.name = name;
    }
    if (metadata !== null) {
      this.metadata = metadata;
    }
  }

  update(ids, embeddings = null, metadatas = null, documents = null) {
    this._client._update(this.id, ids, embeddings, metadatas, documents);
  }

  upsert(ids, embeddings = null, metadatas = null, documents = null, increment_index = true) {
    this._client._upsert(this.id, ids, embeddings, metadatas, documents, increment_index);
  }

  delete(ids = null, where = null, where_document = null) {
    this._client._delete(this.id, ids, where, where_document);
  }

  createIndex() {
    this._client.createIndex(this.name);
  }
}


module.exports = { Cluster };
