import rpc from 'src/utils/rpc'

export default {
  query (param) {
    return rpc.query('vm-instances/cdroms', param)
  },
  create (param, progressCb) {
    return rpc.create('vm-instances/cdroms', param, progressCb)
  },
  delete (uuid, progressCb) {
    return rpc._delete(`vm-instances/cdroms/${uuid}`, null, progressCb)
  },
  setDefault ({ vmInstanceUuid, uuid }, progressCb) {
    return rpc.put(`vm-instances/${vmInstanceUuid}/cdroms/${uuid}/actions`, null, progressCb)
  }
}
