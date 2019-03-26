const debug = require('debug')('hookhub:bootstrap-url')
const yaml = require('js-yaml')
const fs = require('fs')
const rp = require('request-promise')
var remoteConf = {}
var loadedConf = {}

const BOOTSTRAP_CONFIG = process.env.HOOKHUB_BOOTSTRAP_CONFIG ? process.env.HOOKHUB_BOOTSTRAP_CONFIG : 'hookhub.yml'

// Sanity check
if (!fs.existsSync(BOOTSTRAP_CONFIG)) {
  throw new Error('Missing bootstrap config')
}

if (fs.accessSync(BOOTSTRAP_CONFIG) !== undefined) {
  throw new Error('Inaccessible bootstrap config')
}

try {
  debug('Loading bootstrap configuration')
  remoteConf = yaml.safeLoad(fs.readFileSync(BOOTSTRAP_CONFIG, 'utf8'))
  debug('Loaded bootstrap configuration. Now loading remote configuration')

  rp(remoteConf)
    .then(function (resp) {
      loadedConf = yaml.safeLoad(resp)
      if (typeof loadedConf !== 'object' || !JSON.stringify(loadedConf)) { throw new Error('Error loading remote configuration') }
    })
    .catch(function (rpErr) {
      throw new Error(rpErr)
    })
} catch (e) {
  throw new Error(e)
}

function get (confPath) {
  var result = loadedConf // cloning the existing obj

  if (confPath === '/') return loadedConf
  confPath.substring(1).split('/').forEach(function (key) {
    if (result !== null) {
      if (typeof result[key] === 'undefined') {
        result = null
      } else {
        result = result[key]
      }
    }
  })

  return result
}

module.exports.get = get
