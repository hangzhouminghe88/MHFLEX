import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`hybrid/huawei/disk`, param);
  },
  querySystemTag(uuid) {
    return rpc.query('system-tags', {
      q: [`resourceUuid=${uuid}`, 'resourceType=HDiskVO']
    });
  },
  create(param, progressCb) {
    return rpc.create('/hybrid/huawei/disk', param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update('/hybrid/huawei/disk', uuid, {
      "updateTencentDisk": param
    }, progressCb)
  },
  delete(url, uuid, progressCb) {
    let realUrl = '';
    if(url==='1'){
     realUrl=`/hybrid/huawei/disk/${uuid}/remote`;
    }else {
      realUrl=`/hybrid/huawei/disk/${uuid}`;
    }
    return rpc._delete(realUrl, null, progressCb)
  },
  queryIdentityZone(uuid){
    return rpc.query(`brid/identity-zone`, {
      q: `uuid=${uuid}`,
    })
  },
  detach(uuid, progressCb) {
    return rpc.put(`/hybrid/huawei/disk/${uuid}/detach`, {
      'params': null
    }, progressCb)
  },
  attach(uuid,ecsUuid,  progressCb) {
    return rpc.put(`/hybrid/huawei/disk/${uuid}/attach`, {
      'params' : {
       'ecsUuid': ecsUuid
     }
    }, progressCb)
  },
  queryEscName(uuid){
    return rpc.query(`hybrid/huawei/ecs`, {
      q: `uuid=${uuid}`,
    })
  }
}
