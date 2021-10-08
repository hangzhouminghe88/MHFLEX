import rpc from 'src/utils/rpc';
export default {
  batchQuery(param){
    return rpc.query('certificates', param);
  },
  create(param, progressCb){
    return rpc.create('certificates', param, progressCb);
  },
  delete(uuid, progressCb){
    return rpc._delete(`certificates/${uuid}`, null, progressCb);
  },
  detach(uuid,certificateUuid, progressCb){
    return rpc._delete(`load-balancers/listeners/${uuid}/certificate`,  {
      certificateUuid: certificateUuid,
      listenerUuid: uuid
    }, progressCb);
  },
  update(uuid, param, progressCb){
    return rpc.update(`certificates`, uuid, {
      'updateCertificate': param
    }, progressCb)
  }
}
