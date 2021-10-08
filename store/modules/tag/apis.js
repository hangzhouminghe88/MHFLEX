import rpc from 'src/utils/rpc'

export default {
  // attachTag (tagUuid, resourceUuids, progressCb) {
  //   return rpc.post(`tags/${tagUuid}/resources`, {
  //     resourceUuids
  //   }, progressCb)
  // },
  create (msg, progressCb) {
    return rpc.create('tags', msg, progressCb)
  },
  delete (uuid, progressCb) {
    return rpc._delete(`tags/${uuid}`, null, progressCb)
  },
  update (uuid, param, progressCb) {
    return rpc.update('tags', uuid, {
      'updateTag': param
    }, progressCb)
  },
  attach (tagUuid, resourceUuids, progressCb) {
    return rpc.post(`tags/${tagUuid}/resources`, {
      params: {
        resourceUuids
      }
    }, progressCb)
    .then(() => {
      return Promise.resolve({
        tagUuid,
        resourceUuidList: resourceUuids
      })
    })
  },
  detach (tagUuid, resourceUuids, progressCb) {
    let param = {
      resourceUuids
    }
    return rpc._delete(`tags/${tagUuid}/resources`, param, progressCb)
    .then(() => {
      return Promise.resolve({
        tagUuid,
        resourceUuidList: resourceUuids
      })
    })
  }
}



// WEBPACK FOOTER //
// ./src/store/modules/tag/apis.js