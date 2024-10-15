// // imports
// import {Settings, Client} from './Bagel.js'
// // const { Settings, Client } = require('./Bagel.js')

// // example for new javascript api
// const ping_version_example = async () => {
//   // create settings
//   const settings = new Settings({
//     bagel_api_impl: 'rest',
//     bagel_server_host: 'localhost',
//     bagel_server_http_port: 8000
//   })

//   // create api
//   const api = new Client(settings)

//   // ping server
//   const response = await api.ping()
//   console.log(response)

//   // get version
//   const version = await api.get_version()
//   console.log(version)
// }

// // example for get all clusters
// const get_all_clusters_example = async () => {
//   // create settings
//   const settings = new Settings({
//     bagel_api_impl: 'rest',
//     bagel_server_host: 'localhost',
//     bagel_server_http_port: 8000
//   })

//   // create api
//   const api = new Client(settings)

//   // get all clusters
//   const clusters = await api.get_all_clusters()
//   console.log(clusters)
// }

// // example for create/delete cluster and get or create cluster
// const create_delete_get_or_create_cluster_example = async () => {
//   // create settings
//   const settings = new Settings({
//     bagel_api_impl: 'rest',
//     bagel_server_host: 'localhost',
//     bagel_server_http_port: 8000
//   })

//   // create api
//   const api = new Client(settings)

//   // create a new cluster
//   const name = 'my_test_cluster_200000'
//   await api.create_cluster(name).then((res) => {
//     if (res.name === name) {
//       console.log(`Cluster with name ${name} created successfully`)
//     }
//   }).catch((err) => {
//     console.log(err)
//   })

//   // delete a cluster
//   await api.delete_cluster(name)

//   // get or create a cluster
//   const cluster = await api.get_or_create_cluster('my_test_cluster_200000')
//   console.log(cluster)

//   // delete a cluster
//   await api.delete_cluster('my_test_cluster_200000')
// }

// // example for add data to the cluster (without embeddings)
// const add_data_to_cluster_without_embedding_example = async () => {
//   // create settings
//   const settings = new Settings({
//     bagel_api_impl: 'rest',
//     bagel_server_host: 'localhost',
//     bagel_server_http_port: 8000
//   })

//   // create api
//   const api = new Client(settings)

//   // get or create a cluster
//   const newName = 'testing_10000'

//   const cluster = await api.get_or_create_cluster(newName)

//   // add data to the cluster
//   await cluster.add(
//     ids = ['i37', 'i38', 'i39'],
//     embeddings = null,
//     metadatas = [
//       { source: 'notion' },
//       { source: 'notion' },
//       { source: 'google-doc' }
//     ],
//     documents = [
//       'This is document',
//       'This is Towhid',
//       'This is text'
//     ]
//   ).then((res) => {
//     if (res) {
//       console.log('Data added successfully')
//     }
//   }).catch((err) => {
//     console.log(err)
//   })

//   // peek into the cluster
//   const peeks = await cluster.peek(10)
//   console.log('peek result: ', peeks)

//   // find data in the cluster
//   console.log('query result: ')
//   const results = await cluster.find(
//     query_embeddings = null,
//     n_results = 5,
//     where = { source: 'notion' },
//     where_document = { $contains: 'is' },
//     include = ['metadatas', 'documents', 'distances'],
//     query_texts = ['This']
//   )

//   // delete the cluster
//   await api.delete_cluster(newName)
// }

// // example for add data to the cluster (with embeddings)
// const add_data_to_cluster_with_embedding_example = async () => {
//   // create settings
//   const settings = new Settings({
//     bagel_api_impl: 'rest',
//     bagel_server_host: 'localhost',
//     bagel_server_http_port: 8000
//   })

//   // create api
//   const api = new Client(settings)

//   // get or create a cluster
//   const newName = 'testing_20000'

//   const cluster = await api.get_or_create_cluster(newName)

//   // add data to the cluster
//   await cluster.add(
//     ids = ['id1', 'id2'],
//     embeddings = [[1.1, 2.3], [4.5, 6.9]],
//     metadatas = [{ info: 'M1' }, { info: 'M1' }],
//     documents = ['doc1', 'doc2']
//   ).then((res) => {
//     if (res) {
//       console.log('Data added successfully')
//     }
//   }).catch((err) => {
//     console.log(err)
//   })

//   // peek into the cluster
//   const peeks = await cluster.peek(10)
//   console.log('peek result: ', peeks)

//   // find data in the cluster
//   console.log('query result: ')
//   await cluster.find(
//     query_embeddings = [[1.1, 2.3]],
//     n_results = 5,
//     where = { info: 'M1' },
//     where_document = { $contains: 'doc' },
//     include = ['metadatas', 'documents', 'distances'],
//     query_texts = null
//   )

//   // delete the cluster
//   await api.delete_cluster(newName)
// }

// // example for delete data from the cluster
// const delete_data_from_cluster_example = async () => {
//   // create settings
//   const settings = new Settings({
//     bagel_api_impl: 'rest',
//     bagel_server_host: 'localhost',
//     bagel_server_http_port: 8000
//   })

//   // create api
//   const api = new Client(settings)

//   // get or create a cluster
//   const newName = 'testing_30000'

//   const cluster = await api.get_or_create_cluster(newName)

//   // add data to the cluster
//   await cluster.add(
//     ids = ['id1', 'id2'],
//     embeddings = [[1.1, 2.3], [4.5, 6.9]],
//     metadatas = [{ info: 'M1' }, { info: 'M1' }],
//     documents = ['doc1', 'doc2']
//   ).then((res) => {
//     if (res) {
//       console.log('Data added successfully')
//     }
//   }).catch((err) => {
//     console.log(err)
//   })

//   // delete data from the cluster
//   await cluster.delete(
//     ids = ['id1'],
//     where = {},
//     where_document = {}
//   ).then((res) => {
//     if (res) {
//       console.log('Data deleted successfully')
//     }
//   }).catch((err) => {
//     console.log(err)
//   })

//   // peek into the cluster
//   const peeks = await cluster.peek(10)
//   console.log('peek result: ', peeks)

//   // delete the cluster
//   await api.delete_cluster(newName)
// }

// // example for update data in the cluster
// const update_data_in_cluster_example = async () => {
//   // create settings
//   const settings = new Settings({
//     bagel_api_impl: 'rest',
//     bagel_server_host: 'localhost',
//     bagel_server_http_port: 8000
//   })

//   // create api
//   const api = new Client(settings)

//   // get or create a cluster
//   const newName = 'testing_40000'

//   const cluster = await api.get_or_create_cluster(newName)

//   // add data to the cluster
//   await cluster.add(
//     ids = ['id1', 'id2'],
//     embeddings = [[1.1, 2.3], [4.5, 6.9]],
//     metadatas = [{ info: 'M1' }, { info: 'M1' }],
//     documents = ['doc1', 'doc2']
//   ).then((res) => {
//     if (res) {
//       console.log('Data added successfully')
//     }
//   }).catch((err) => {
//     console.log(err)
//   })

//   // update data in the cluster
//   await cluster.update(
//     ids = ['id1'],
//     embeddings = [[10.1, 20.3]],
//     metadatas = [{ info: 'M1' }],
//     documents = ['doc1']
//   ).then((res) => {
//     if (res) {
//       console.log('Data updated successfully')
//     }
//   }
//   ).catch((err) => {
//     console.log(err)
//   })

//   // peek into the cluster
//   const peeks = await cluster.peek(10)
//   console.log('peek result: ', peeks)

//   // delete the cluster
//   await api.delete_cluster(newName)
// }

// // example for upsert data in the cluster
// const upsert_data_in_cluster_example = async () => {
//   // create settings
//   const settings = new Settings({
//     bagel_api_impl: 'rest',
//     bagel_server_host: 'localhost',
//     bagel_server_http_port: 8000
//   })

//   // create api
//   const api = new Client(settings)

//   // get or create a cluster
//   const newName = 'testing_50000'

//   const cluster = await api.get_or_create_cluster(newName)

//   // add data to the cluster
//   await cluster.add(
//     ids = ['id1', 'id2'],
//     embeddings = [[1.1, 2.3], [4.5, 6.9]],
//     metadatas = [{ info: 'M1' }, { info: 'M1' }],
//     documents = ['doc1', 'doc2']
//   ).then((res) => {
//     if (res) {
//       console.log('Data added successfully')
//     }
//   }).catch((err) => {
//     console.log(err)
//   })

//   // upsert data in the cluster
//   await cluster.upsert(
//     ids = ['id1', 'id3'],
//     embeddings = [[15.1, 25.3], [30.1, 40.3]],
//     metadatas = [{ info: 'M1' }, { info: 'M1' }],
//     documents = ['doc1', 'doc3']
//   ).then((res) => {
//     if (res) {
//       console.log('Data upserted successfully')
//     }
//   }
//   ).catch((err) => {
//     console.log(err)
//   })

//   // peek into the cluster
//   const peeks = await cluster.peek(10)
//   console.log('peek result: ', peeks)

//   // delete the cluster
//   await api.delete_cluster(newName)
// }

// // example for modify cluster name and metadata
// const modify_cluster_name_and_metadata_example = async () => {
//   // create settings
//   const settings = new Settings({
//     bagel_api_impl: 'rest',
//     bagel_server_host: 'localhost',
//     bagel_server_http_port: 8000
//   })

//   // create api
//   const api = new Client(settings)

//   // get or create a cluster
//   const newName = 'testing_60000'

//   const cluster = await api.get_or_create_cluster(newName)

//   // add data to the cluster
//   await cluster.add(
//     ids = ['id1', 'id2'],
//     embeddings = [[1.1, 2.3], [4.5, 6.9]],
//     metadatas = [{ info: 'M1' }, { info: 'M1' }],
//     documents = ['doc1', 'doc2']
//   ).then((res) => {
//     if (res) {
//       console.log('Data added successfully')
//     }
//   }).catch((err) => {
//     console.log(err)
//   })

//   const modified_name = 'testing_70000'

//   // modify cluster name and metadata
//   await cluster.modify(
//     name = modified_name,
//     metadata = { info: 'M2' }
//   ).then((res) => {
//     if (res) {
//       console.log('Cluster modified successfully')
//     }
//   }
//   ).catch((err) => {
//     console.log(err)
//   })

//   // peek into the cluster
//   const peeks = await cluster.peek(10)
//   console.log(peeks)

//   // delete the cluster
//   await api.delete_cluster(modified_name)
// }

// // run examples
// const run_examples = async () => {
//   console.log('Running examples...')
//   console.log('====================================')
//   console.log('pinging server and getting version...')
//   await ping_version_example()
//   console.log('====================================')
//   console.log('getting all clusters...')
//   await get_all_clusters_example()
//   console.log('====================================')
//   console.log('creating, deleting, and getting or creating a cluster...')
//   await create_delete_get_or_create_cluster_example()
//   console.log('====================================')
//   console.log('adding data and querying to the cluster (without embeddings)...')
//   await add_data_to_cluster_without_embedding_example()
//   console.log('====================================')
//   console.log('adding data and querying to the cluster (with embeddings)...')
//   await add_data_to_cluster_with_embedding_example()
//   console.log('====================================')
//   console.log('deleting data from the cluster...')
//   await delete_data_from_cluster_example()
//   console.log('====================================')
//   console.log('updating data in the cluster...')
//   await update_data_in_cluster_example()
//   console.log('====================================')
//   console.log('upserting data in the cluster...')
//   await upsert_data_in_cluster_example()
//   console.log('====================================')
//   console.log('modifying cluster name and metadata...')
//   await modify_cluster_name_and_metadata_example()
//   console.log('====================================')
//   console.log('Finished running examples...')
// }

// // run examples
// run_examples()
