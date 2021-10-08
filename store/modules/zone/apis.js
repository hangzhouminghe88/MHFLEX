import rpc from 'src/utils/rpc';
export default {
  basicQuery(param){
    return  rpc.query(`zones`, param)
  },
  delete(uuid, progressCb){
    return rpc._delete(`zones/${uuid}`, null, progressCb);
  },
  enable(uuid, progressCb){
    return rpc.update('zones', uuid, {
      'changeZoneState': {
        'stateEvent': 'enable'
      }
    },  progressCb)
  },
  disable(uuid, progressCb){
    return rpc.update('zones', uuid, {
      'changeZoneState': {
        'stateEvent': 'disable'
      }
    }, progressCb)
  },
  detailQuery(uuid){
    return  rpc.query(`zones/${uuid}`)
  }
}
