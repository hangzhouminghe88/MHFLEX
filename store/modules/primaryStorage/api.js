import rpc from '../../../src/utils/rpc'
// import _ from 'lodash'
// import accountResourceApi from '../accountResource/apis'
// import util from '../../utils'

export default {
  queryLocalStorageResourceRef (param) {
    return rpc.query('primary-storage/local-storage/resource-refs', param)
  }
}



// WEBPACK FOOTER //
// ./src/store/modules/primaryStorage/api.js
