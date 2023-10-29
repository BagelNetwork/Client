// imports
const { Settings } = require('../src/utils/settings.js')
const { API } = require('../src/api/api.js')

// example for new javascript api
const example = async () => {
  // create settings
  const settings = new Settings({
    bagel_api_impl: 'rest',
    bagel_server_host: 'api.bageldb.ai',
    bagel_server_http_port: 80
  })

  // create api
  const api = new API(settings)

  // ping server
  const response = await api.ping()
  console.log(response)

  // get version
  const version = await api.get_version()
  console.log(version)

  // get all clusters
  const clusters = await api.get_all_clusters()
  console.log(clusters)

  // create a new cluster
  const name = 'my_test_cluster_13'
  await api.create_cluster(name)

  // delete a cluster
  await api.delete_cluster(name)

  // get or create a cluster
  const cluster = await api.get_or_create_cluster('my_test_cluster_13')
  console.log(cluster)

  // add data to the cluster
  await cluster.add(
    ['id1', 'id2'], // ids
    [[1.1, 2.3], [4.5, 6.9]], // embeddings
    [{ info: 'M1' }, { info: 'M1' }], // metadatas
    ['doc1', 'doc2'] // documents
  )

  // peek into the cluster
  const peeks = await cluster.peek(10)
  console.log(peeks)

  // find data in the cluster
  const results = await cluster.find([[1.1, 2.3]] /* query_embeddings */)
  console.log(results)

  // modify cluster name
  await cluster.modify('my_test_cluster_15')

  // update data in the cluster
  await cluster.update(
    ['id1', 'id2'], // ids
    [[1.9, 4.3], [2.5, 8.9]] // embeddings
  )

  // upsert data in the cluster
  await cluster.upsert(
    ['id3'], // ids
    [[9.9, 16.3]], // embeddings
    [{ info: 'M3' }], // metadatas
    ['doc3'] // documents
  )
}

example()
