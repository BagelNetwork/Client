const { v4: uuidv4 } = require('uuid');
const bagel_utils_embedding_utils = require('bagel.utils.embedding_utils');

const {
  ClusterMetadata,
  Embedding,
  Include,
  Metadata,
  Document,
  Where,
  IDs,
  EmbeddingFunction,
  GetResult,
  QueryResult,
  ID,
  OneOrMany,
  WhereDocument,
  maybe_cast_one_to_many,
  validate_ids,
  validate_include,
  validate_metadatas,
  validate_where,
  validate_where_document,
  validate_n_results,
  validate_embeddings,
} = require('bagel.api.types');

const logging = require('logging');
const logger = logging.getLogger(__name__);

class Cluster extends BaseModel {
  constructor(client, name, id, embedding_function = bagel_utils_embedding_utils.DefaultEmbeddingFunction(), metadata = null) {
    super({ name, metadata, id });
    this._client = client;
    this._embedding_function = embedding_function;
  }

  __repr__() {
    return `Cluster(name=${this.name})`;
  }

  count() {
    return this._client._count({ cluster_id: this.id });
  }

  add(ids, embeddings = null, metadatas = null, documents = null, increment_index = true) {
    [ids, embeddings, metadatas, documents] = this._validate_embedding_set(ids, embeddings, metadatas, documents);

    this._client._add({
      ids,
      cluster_id: this.id,
      embeddings,
      metadatas,
      documents,
      increment_index,
    });
  }

  get(ids = null, where = null, limit = null, offset = null, where_document = null, include = ['metadatas', 'documents']) {
    where = validate_where(where);
    where_document = validate_where_document(where_document);
    ids = validate_ids(maybe_cast_one_to_many(ids));
    include = validate_include(include, false);
    return this._client._get({
      cluster_id: this.id,
      ids,
      where,
      limit,
      offset,
      where_document,
      include,
    });
  }

  peek(limit = 10) {
    return this._client._peek({ cluster_id: this.id, limit });
  }

  find(query_embeddings = null, query_texts = null, n_results = 10, where = null, where_document = null, include = ['metadatas', 'documents', 'distances']) {
    where = validate_where(where);
    where_document = validate_where_document(where_document);
    query_embeddings = validate_embeddings(maybe_cast_one_to_many(query_embeddings));
    query_texts = maybe_cast_one_to_many(query_texts);
    include = validate_include(include, true);
    n_results = validate_n_results(n_results);

    if ((query_embeddings === null && query_texts === null) || (query_embeddings !== null && query_texts !== null)) {
      throw new ValueError('You must provide either query embeddings or query texts, but not both');
    }

    if (query_embeddings === null) {
      if (this._embedding_function === null) {
        throw new ValueError('You must provide embeddings or a function to compute them');
      }
      query_embeddings = this._embedding_function(query_texts);
    }

    return this._client._query({
      cluster_id: this.id,
      query_embeddings,
      n_results,
      where,
      where_document,
      include,
    });
  }

  modify(name = null, metadata = null) {
    this._client._modify({ id: this.id, new_name: name, new_metadata: metadata });
    if (name !== null) {
      this.name = name;
    }
    if (metadata !== null) {
      this.metadata = metadata;
    }
  }

  update(ids, embeddings = null, metadatas = null, documents = null) {
    [ids, embeddings, metadatas, documents] = this._validate_embedding_set(ids, embeddings, metadatas, documents, false);

    this._client._update({ cluster_id: this.id, ids, embeddings, metadatas, documents });
  }

  upsert(ids, embeddings = null, metadatas = null, documents = null, increment_index = true) {
    [ids, embeddings, metadatas, documents] = this._validate_embedding_set(ids, embeddings, metadatas, documents);

    this._client._upsert({
      cluster_id: this.id,
      ids,
      embeddings,
      metadatas,
      documents,
      increment_index,
    });
  }

  delete(ids = null, where = null, where_document = null) {
    ids = validate_ids(maybe_cast_one_to_many(ids));
    where = validate_where(where);
    where_document = validate_where_document(where_document);
    this._client._delete({ cluster_id: this.id, ids, where, where_document });
  }

  create_index() {
    this._client.create_index(this.name);
  }

  _validate_embedding_set(ids, embeddings, metadatas, documents, require_embeddings_or_documents = true) {
    ids = validate_ids(maybe_cast_one_to_many(ids));
    embeddings = validate_embeddings(maybe_cast_one_to_many(embeddings));
    metadatas = validate_metadatas(maybe_cast_one_to_many(metadatas));
    documents = maybe_cast_one_to_many(documents);

    if (require_embeddings_or_documents && embeddings === null && documents === null) {
      throw new ValueError('You must provide either embeddings or documents, or both');
    }

    if (embeddings !== null && embeddings.length !== ids.length) {
      throw new ValueError(`Number of embeddings ${embeddings.length} must match number of ids ${ids.length}`);
    }

    if (metadatas !== null && metadatas.length !== ids.length) {
      throw new ValueError(`Number of metadatas ${metadatas.length} must match number of ids ${ids.length}`);
    }

    if (documents !== null && documents.length !== ids.length) {
      throw new ValueError(`Number of documents ${documents.length} must match number of ids ${ids.length}`);
    }

    if (embeddings === null && documents !== null) {
      if (this._embedding_function === null) {
        throw new ValueError('You must provide embeddings or a function to compute them');
      }
      embeddings = this._embedding_function(documents);
    }

    return [ids, embeddings, metadatas, documents];
  }
}

// If TYPE_CHECKING is true, import the API module
if (TYPE_CHECKING) {
  const { API } = require('bagel.api');
}
