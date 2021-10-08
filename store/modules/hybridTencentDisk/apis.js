import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`hybrid/tencent/disk`, param);
  },
  querySystemTag(uuid) {
    return rpc.query('system-tags', {
      q: [`resourceUuid=${uuid}`, 'resourceType=TencentDiskVO']
    });
  },
  create(param, progressCb) {
    return rpc.create('/hybrid/tencent/disk', param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update('/hybrid/tencent/disk', uuid, {
      "updateTencentDisk": param
    }, progressCb)
  },
  delete(url, uuid, progressCb) {
    let realUrl = '';
    if(url==='1'){
     realUrl=`/hybrid/tencent/disk/${uuid}/remote`;
    }else {
      realUrl=`/hybrid/tencent/disk/${uuid}`;
    }
    return rpc._delete(realUrl, null, progressCb)
  },
  queryIdentityZone(uuid){
    return rpc.query(`hybrid/tencent/identity-zone`, {
      q: `uuid=${uuid}`,
    })
  },
  detach(uuid, progressCb) {
    return rpc.put(`/hybrid/tencent/disk/${uuid}/detach`, {
      'params': null
    }, progressCb)
  },
  attach(uuid,ecsUuid,  progressCb) {
    return rpc.put(`/hybrid/tencent/disk/${uuid}/attach`, {
      'params' : {
       'ecsUuid': ecsUuid
     }
    }, progressCb)
  },
  queryEscName(uuid){
    return rpc.query(`hybrid/tencent/ecs`, {
      q: `uuid=${uuid}`,
    })
  }
}
