// Class to interact with a cluster
class Cluster {
  // Constructor
  constructor (client, data) {
    this.name = data.name
    this.id = data.id
    this.metadata = data.metadata
    this._client = client
  }

  // Methods

  // getting data count within the cluster
  count () {
    return this._client._count(this.id)
  };

  // getting all data within the cluster
  get (ids = null, where = {}, sort = null, limit = null, offset = null, page = null, pageSize = null, whereDocument = {}, include = ['metadatas', 'documents']) {
    return this._client._get(this.id, ids, where, sort, limit, offset, page, pageSize, whereDocument, include)
  };

  // getting top n data within the cluster
  peek (n = 10) {
    return this._client._peek(this.id, n)
  };

  // modifying cluster name and metadata
  modify (name = null, metadata = null) {
    return this._client._modify(this.id, name, metadata)
  };

  // adding data to the cluster
  add (ids, embeddings = null, metadatas = null, documents = null, incrementIndex = true) {
    return this._client._add(this.id, ids, embeddings, metadatas, documents, incrementIndex)
  };

  // deleting data from the cluster
  delete (ids = null, where = {}, whereDocument = {}) {
    return this._client._delete(this.id, ids, where, whereDocument)
  };

  // updating data in the cluster
  update (ids, embeddings = null, metadatas = null, documents = null) {
    return this._client._update(this.id, ids, embeddings, metadatas, documents)
  };

  // upserting data in the cluster
  upsert (ids, embeddings = null, metadatas = null, documents = null) {
    return this._client._upsert(this.id, ids, embeddings, metadatas, documents)
  }

  // querying data in the cluster
  find (queryEmbeddings = null, nResults = 10, where = {}, whereDocument = {}, include = ['metadatas', 'documents', 'distances'], queryTexts = null) {
    if ((queryEmbeddings === null && queryTexts === null) || (queryEmbeddings !== null && queryTexts !== null)) {
      throw new Error('You must provide either embeddings or texts to find, but not both')
    }

    if (where === null) {
      where = {}
    }

    if (whereDocument === null) {
      whereDocument = {}
    }

    return this._client._query(this.id, queryEmbeddings, nResults, where, whereDocument, include, queryTexts)
  }

  // creating index in the cluster
  create_index () {
    return this._client._create_index(this.name)
  }

  // add image to the cluster
  add_image (imageName, imageData) {
    console.log('add_image', imageData)
    return this._client._add_image(this.id, imageName, imageData)
  };

  // add images to the cluster via web form
  add_image_web (formData) {
    return this._client._add_image_web(this.id, formData)
  };

  // add images
  add_imagess (imageNames, imageDatas) {
    return this._client._add_imagess(this.id, imageNames, imageDatas)
  }
}

export default Cluster
