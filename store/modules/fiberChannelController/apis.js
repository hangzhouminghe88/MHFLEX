import rpc from 'src/utils/rpc'

export default {
  query (param) {
    return rpc.query('storage-devices/fiber-channel/controllers', param)
  }
}



// WEBPACK FOOTER //
// ./src/store/modules/fiberChannelController/apis.js