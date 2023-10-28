const api = require('./src/api/api.js')
const settigs = require('./src/utils/settings.js')
const cluster = require('./src/model/cluster.js')

// exports
module.exports = {
  // api
  Client: api.API,
  // utils
  Settings: settigs.Settings,
  // cluster
  Cluster: cluster.Cluster
}
