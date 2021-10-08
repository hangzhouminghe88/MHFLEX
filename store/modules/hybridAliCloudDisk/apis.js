import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`hybrid/aliyun/disk`, param);
  },
  querySystemTag(uuid) {
    return rpc.query('system-tags', {
      q: [`resourceUuid=${uuid}`, 'resourceType=AliyunDiskVO']
    });
  },
  create(param, progressCb) {
    return rpc.create('/hybrid/aliyun/disk', param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update('/hybrid/aliyun/disk', uuid, {
      "updateAliyunDisk": param
    }, progressCb)
  },
  delete(url, uuid, progressCb) {
    let realUrl = '';
    if(url==='1'){
     realUrl=`hybrid/aliyun/disk/${uuid}/remote`;
    }else {
      realUrl=`hybrid/aliyun/disk/${uuid}`;
    }
    return rpc._delete(realUrl, null, progressCb)
  },
  queryIdentityZone(uuid){
    return rpc.query(`hybrid/identity-zone`, {
      q: `uuid=${uuid}`,
    })
  },
  detach(uuid, progressCb) {
    return rpc.put(`hybrid/aliyun/disk/${uuid}/detach`, {
      'params': null
    }, progressCb)
  },
  attach(uuid,ecsUuid,  progressCb) {
    return rpc.put(`hybrid/aliyun/disk/${uuid}/attach`, {
      'params' : {
       'ecsUuid': ecsUuid
     }
    }, progressCb)
  },
  queryEscName(uuid){
    return rpc.query(`hybrid/aliyun/ecs`, {
      q: `uuid=${uuid}`,
    })
  }
}
