import API from './src/api/api.js'
import Settings from './src/utils/settings.js'
import cluster from './src/model/cluster.js'

// exports

const settings = new Settings({
  bagel_api_impl: 'rest',
  bagel_server_host: 'api.bageldb.ai',
  bagel_server_http_port: '80',
})
const api = new API(settings)
export {
  // api
  api as client,
  // cluster
  cluster as Cluster
}