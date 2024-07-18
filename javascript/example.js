// imports
import { Settings, Client } from './Bagel.js'
import fs from 'fs'
import Buffer from 'buffer'

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
  await cluster.add({
    ids: ['i37', 'i38', 'i39'],
    embeddings: null,
    metadatas: [
      { source: 'notion' },
      { source: 'notion' },
      { source: 'google-doc' }
    ],
    documents: [
      'This is document',
      'This is Towhid',
      'This is text'
    ]
  }).then((res) => {
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
  await cluster.find({
    query_embeddings: null,
    n_results: 5,
    where: { source: 'notion' },
    where_document: { $contains: 'is' },
    include: ['metadatas', 'documents', 'distances'],
    query_texts: ['This']
  })

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
  await cluster.add({
    ids: ['id1', 'id2'],
    embeddings: [[1.1, 2.3], [4.5, 6.9]],
    metadatas: [{ info: 'M1' }, { info: 'M1' }],
    documents: ['doc1', 'doc2']
  }).then((res) => {
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
  await cluster.find({
    query_embeddings: [[1.1, 2.3]],
    n_results: 5,
    where: { info: 'M1' },
    where_document: { $contains: 'doc' },
    include: ['metadatas', 'documents', 'distances'],
    query_texts: null
  })

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
  await cluster.add({
    ids: ['id1', 'id2'],
    embeddings: [[1.1, 2.3], [4.5, 6.9]],
    metadatas: [{ info: 'M1' }, { info: 'M1' }],
    documents: ['doc1', 'doc2']
  }).then((res) => {
    if (res) {
      console.log('Data added successfully')
    }
  }).catch((err) => {
    console.log(err)
  })

  // delete data from the cluster
  await cluster.delete({
    ids: ['id1'],
    where: {},
    where_document: {}
  }).then((res) => {
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
  await cluster.add({
    ids: ['id1', 'id2'],
    embeddings: [[1.1, 2.3], [4.5, 6.9]],
    metadatas: [{ info: 'M1' }, { info: 'M1' }],
    documents: ['doc1', 'doc2']
  }).then((res) => {
    if (res) {
      console.log('Data added successfully')
    }
  }).catch((err) => {
    console.log(err)
  })

  // update data in the cluster
  await cluster.update({
    ids: ['id1'],
    embeddings: [[10.1, 20.3]],
    metadatas: [{ info: 'M1' }],
    documents: ['doc1']
  }).then((res) => {
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
  await cluster.add({
    ids: ['id1', 'id2'],
    embeddings: [[1.1, 2.3], [4.5, 6.9]],
    metadatas: [{ info: 'M1' }, { info: 'M1' }],
    documents: ['doc1', 'doc2']
  }).then((res) => {
    if (res) {
      console.log('Data added successfully')
    }
  }).catch((err) => {
    console.log(err)
  })

  // upsert data in the cluster
  await cluster.upsert({
    ids: ['id1', 'id3'],
    embeddings: [[15.1, 25.3], [30.1, 40.3]],
    metadatas: [{ info: 'M1' }, { info: 'M1' }],
    documents: ['doc1', 'doc3']
  }).then((res) => {
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
  await cluster.add({
    ids: ['id1', 'id2'],
    embeddings: [[1.1, 2.3], [4.5, 6.9]],
    metadatas: [{ info: 'M1' }, { info: 'M1' }],
    documents: ['doc1', 'doc2']
  }).then((res) => {
    if (res) {
      console.log('Data added successfully')
    }
  }).catch((err) => {
    console.log(err)
  })

  const modifiedName = 'testing_7000'
  // modify cluster name and metadata
  await cluster.modify({
    name: modifiedName,
    metadata: { info: 'M2' }
  }).then((res) => {
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
  let image
  for (image of imagePath) {
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
