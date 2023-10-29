// imports
const { Settings, Client } = require('./BagelDB.js')
const fs = require('fs')

// example for new javascript api
const pingVersionExample = async () => {
  // create settings
  const settings = new Settings({
    bagel_api_impl: 'rest',
    bagel_server_host: 'api.bageldb.ai',
    bagel_server_http_port: 80
  })

  // create api
  const api = new Client(settings)

  // ping server
  const response = await api.ping()
  console.log(response)

  // get version
  const version = await api.get_version()
  console.log(version)
}

// example for get all clusters
const getAllClustersExample = async () => {
  // create settings
  const settings = new Settings({
    bagel_api_impl: 'rest',
    bagel_server_host: 'api.bageldb.ai',
    bagel_server_http_port: 80
  })

  // create api
  const api = new Client(settings)

  // get all clusters
  const clusters = await api.get_all_clusters()
  console.log(clusters)
}

// example for create/delete cluster and get or create cluster
const createDeleteGetOrCreateClusterExample = async () => {
  // create settings
  const settings = new Settings({
    bagel_api_impl: 'rest',
    bagel_server_host: 'api.bageldb.ai',
    bagel_server_http_port: 80
  })

  // create api
  const api = new Client(settings)

  // create a new cluster
  const name = 'my_test_cluster_200000'
  await api.create_cluster(name).then((res) => {
    if (res.name === name) {
      console.log(`Cluster with name ${name} created successfully`)
    }
  }).catch((err) => {
    console.log(err)
  })

  // delete a cluster
  await api.delete_cluster(name)

  // get or create a cluster
  const cluster = await api.get_or_create_cluster('my_test_cluster_200000')
  console.log(cluster)

  // delete a cluster
  await api.delete_cluster('my_test_cluster_200000')
}

// example for add data to the cluster (without embeddings)
const addDataToClusterWithoutEmbeddingExample = async () => {
  // create settings
  const settings = new Settings({
    bagel_api_impl: 'rest',
    bagel_server_host: 'api.bageldb.ai',
    bagel_server_http_port: 80
  })

  // create api
  const api = new Client(settings)

  // get or create a cluster
  const newName = 'testing_1000'

  const cluster = await api.get_or_create_cluster(newName)

  // add data to the cluster
  await cluster.add(
    ['i37', 'i38', 'i39'], // ids
    null, // embeddings
    [
      { source: 'notion' },
      { source: 'notion' },
      { source: 'google-doc' }
    ], // metadatas
    [
      'This is document',
      'This is Towhid',
      'This is text'
    ] // documents
  ).then((res) => {
    if (res) {
      console.log('Data added successfully')
    }
  }).catch((err) => {
    console.log(err)
  })

  // peek into the cluster
  const peeks = await cluster.peek(10)
  console.log('peek result: ', peeks)

  // find data in the cluster
  console.log('query result: ')
  await cluster.find(
    null, // query_embeddings
    5, // n_results
    { source: 'notion' }, // where
    { $contains: 'is' }, // where_document
    ['metadatas', 'documents', 'distances'], // include
    ['This'] // query_texts
  )

  // delete the cluster
  await api.delete_cluster(newName)
}

// example for add data to the cluster (with embeddings)
const addDataToClusterWithEmbeddingExample = async () => {
  // create settings
  const settings = new Settings({
    bagel_api_impl: 'rest',
    bagel_server_host: 'api.bageldb.ai',
    bagel_server_http_port: 80
  })

  // create api
  const api = new Client(settings)

  // get or create a cluster
  const newName = 'testing_2000'

  const cluster = await api.get_or_create_cluster(newName)

  // add data to the cluster
  await cluster.add(
    ['id1', 'id2'], //  ids
    [[1.1, 2.3], [4.5, 6.9]], // embeddings
    [{ info: 'M1' }, { info: 'M1' }], // metadatas
    ['doc1', 'doc2'] // documents
  ).then((res) => {
    if (res) {
      console.log('Data added successfully')
    }
  }).catch((err) => {
    console.log(err)
  })

  // peek into the cluster
  const peeks = await cluster.peek(10)
  console.log('peek result: ', peeks)

  // find data in the cluster
  console.log('query result: ')
  await cluster.find(
    [[1.1, 2.3]], // query_embeddings
    5, //  n_results
    { info: 'M1' }, // where
    { $contains: 'doc' }, // where_document
    ['metadatas', 'documents', 'distances'], // include
    null // query_texts
  )

  // delete the cluster
  await api.delete_cluster(newName)
}

// example for delete data from the cluster
const deleteDataFromClusterExample = async () => {
  // create settings
  const settings = new Settings({
    bagel_api_impl: 'rest',
    bagel_server_host: 'api.bageldb.ai',
    bagel_server_http_port: 80
  })

  // create api
  const api = new Client(settings)

  // get or create a cluster
  const newName = 'testing_3000'

  const cluster = await api.get_or_create_cluster(newName)

  // add data to the cluster
  await cluster.add(
    ['id1', 'id2'], // ids
    [[1.1, 2.3], [4.5, 6.9]], // embeddings
    [{ info: 'M1' }, { info: 'M1' }], // metadatas
    ['doc1', 'doc2'] // documents
  ).then((res) => {
    if (res) {
      console.log('Data added successfully')
    }
  }).catch((err) => {
    console.log(err)
  })

  // delete data from the cluster
  await cluster.delete(
    ['id1'], // ids
    {}, // where
    {} // where_document
  ).then((res) => {
    if (res) {
      console.log('Data deleted successfully')
    }
  }).catch((err) => {
    console.log(err)
  })

  // peek into the cluster
  const peeks = await cluster.peek(10)
  console.log('peek result: ', peeks)

  // delete the cluster
  await api.delete_cluster(newName)
}

// example for update data in the cluster
const updateDataInClusterExample = async () => {
  // create settings
  const settings = new Settings({
    bagel_api_impl: 'rest',
    bagel_server_host: 'api.bageldb.ai',
    bagel_server_http_port: 80
  })

  // create api
  const api = new Client(settings)

  // get or create a cluster
  const newName = 'testing_4000'

  const cluster = await api.get_or_create_cluster(newName)

  // add data to the cluster
  await cluster.add(
    ['id1', 'id2'], // ids
    [[1.1, 2.3], [4.5, 6.9]], // embeddings
    [{ info: 'M1' }, { info: 'M1' }], // metadatas
    ['doc1', 'doc2'] // documents
  ).then((res) => {
    if (res) {
      console.log('Data added successfully')
    }
  }).catch((err) => {
    console.log(err)
  })

  // update data in the cluster
  await cluster.update(
    ['id1'], // ids
    [[10.1, 20.3]], // embeddings
    [{ info: 'M1' }], // metadatas
    ['doc1'] // documents
  ).then((res) => {
    if (res) {
      console.log('Data updated successfully')
    }
  }
  ).catch((err) => {
    console.log(err)
  })

  // peek into the cluster
  const peeks = await cluster.peek(10)
  console.log('peek result: ', peeks)

  // delete the cluster
  await api.delete_cluster(newName)
}

// example for upsert data in the cluster
const upsertDataInClusterExample = async () => {
  // create settings
  const settings = new Settings({
    bagel_api_impl: 'rest',
    bagel_server_host: 'api.bageldb.ai',
    bagel_server_http_port: 80
  })

  // create api
  const api = new Client(settings)

  // get or create a cluster
  const newName = 'testing_5000'

  const cluster = await api.get_or_create_cluster(newName)

  // add data to the cluster
  await cluster.add(
    ['id1', 'id2'], // ids
    [[1.1, 2.3], [4.5, 6.9]], // embeddings
    [{ info: 'M1' }, { info: 'M1' }], // metadatas
    ['doc1', 'doc2'] // documents
  ).then((res) => {
    if (res) {
      console.log('Data added successfully')
    }
  }).catch((err) => {
    console.log(err)
  })

  // upsert data in the cluster
  await cluster.upsert(
    ['id1', 'id3'], // ids
    [[15.1, 25.3], [30.1, 40.3]], // embeddings
    [{ info: 'M1' }, { info: 'M1' }], // metadatas
    ['doc1', 'doc3'] // documents
  ).then((res) => {
    if (res) {
      console.log('Data upserted successfully')
    }
  }
  ).catch((err) => {
    console.log(err)
  })

  // peek into the cluster
  const peeks = await cluster.peek(10)
  console.log('peek result: ', peeks)

  // delete the cluster
  await api.delete_cluster(newName)
}

// example for modify cluster name and metadata
const modifyClusterNameAndMetadataExample = async () => {
  // create settings
  const settings = new Settings({
    bagel_api_impl: 'rest',
    bagel_server_host: 'api.bageldb.ai',
    bagel_server_http_port: 80
  })

  // create api
  const api = new Client(settings)

  // get or create a cluster
  const newName = 'testing_6000'

  const cluster = await api.get_or_create_cluster(newName)

  // add data to the cluster
  await cluster.add(
    ['id1', 'id2'], // ids
    [[1.1, 2.3], [4.5, 6.9]], // embeddings
    [{ info: 'M1' }, { info: 'M1' }], // metadatas
    ['doc1', 'doc2'] // documents
  ).then((res) => {
    if (res) {
      console.log('Data added successfully')
    }
  }).catch((err) => {
    console.log(err)
  })

  const modifiedName = 'testing_7000'
  // modify cluster name and metadata
  await cluster.modify(
    modifiedName, // name
    { info: 'M2' } // metdata
  ).then((res) => {
    if (res) {
      console.log('Cluster modified successfully')
    }
  }
  ).catch((err) => {
    console.log(err)
  })

  // peek into the cluster
  const peeks = await cluster.peek(10)
  console.log('peek result: ', peeks)

  // delete the cluster
  await api.delete_cluster(modifiedName)
}

// example for adding images to the cluster
const addImagesToClusterExample = async () => {
  // create settings
  const settings = new Settings({
    bagel_api_impl: 'rest',
    bagel_server_host: 'api.bageldb.ai',
    bagel_server_http_port: 80
  })

  // create api
  const api = new Client(settings)

  // get or create a cluster
  const newName = 'image_add_test'

  const cluster = await api.get_or_create_cluster(newName)

  // add image to the cluster
  const imagePath = ['./image_emb/test.jpg', './image_emb/test.png', './image_emb/2.png', './image_emb/BagelImage3.png']
  for (const image of imagePath) {
    const imageFile = fs.readFileSync(image)
    const imageData = Buffer.from(imageFile).toString('base64')
    console.log(imageData)
    const imageName = image.split('/').pop()
    await cluster.add_image(imageName, imageData).then((res) => {
      if (res) {
        console.log('Image added successfully')
      }
    }).catch((err) => {
      console.log(err)
    })
  }

  // peek into the cluster
  const peeks = await cluster.peek(10)
  console.log('peek result: ', peeks)
}

// run examples
const runExamples = async () => {
  console.log('Running examples...')
  console.log('====================================')
  console.log('pinging server and getting version...')
  await pingVersionExample()
  console.log('====================================')
  console.log('getting all clusters...')
  await getAllClustersExample()
  console.log('====================================')
  console.log('creating, deleting, and getting or creating a cluster...')
  await createDeleteGetOrCreateClusterExample()
  console.log('====================================')
  console.log('adding data and querying to the cluster (without embeddings)...')
  await addDataToClusterWithoutEmbeddingExample()
  console.log('====================================')
  console.log('adding data and querying to the cluster (with embeddings)...')
  await addDataToClusterWithEmbeddingExample()
  console.log('====================================')
  console.log('deleting data from the cluster...')
  await deleteDataFromClusterExample()
  console.log('====================================')
  console.log('updating data in the cluster...')
  await updateDataInClusterExample()
  console.log('====================================')
  console.log('upserting data in the cluster...')
  await upsertDataInClusterExample()
  console.log('====================================')
  console.log('modifying cluster name and metadata...')
  await modifyClusterNameAndMetadataExample()
  console.log('====================================')
  console.log('adding images to the cluster...')
  await addImagesToClusterExample()
  console.log('====================================')
  console.log('Finished running examples...')
}

// run examples
runExamples()
