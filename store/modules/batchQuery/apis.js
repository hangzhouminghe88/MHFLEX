import rpc from 'src/utils/rpc'
import util from '../../utils'

export default {
  query (script, progressCb) {
    return rpc.query('batch-queries', {
      script: encodeURIComponent(script)
    }, progressCb).then(resp => {
      return util.emptyPromise(resp.result)
    })
  }
}

