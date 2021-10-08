import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`/hybrid/huawei/ecs`, param);
  },
  queryVpcName(subnetUuid) {
    return rpc.query(`hybrid/huawei/subnet/${subnetUuid}`, {
      fields: 'ecsVpcId'
    }).then( (resp) => {
      return rpc.query(`hybrid/huawei/vpc/${resp.inventories[0].ecsVpcId}`);
    })
  },
  updateEcsInstancePassword(url, param, progressCb) {
    return rpc.create(url, param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.create(`/hybrid/huawei/${uuid}/ecs`, param, progressCb)
  },
  delete(uuid, progressCb, isDeleteRemote) {
    let realUrl = '';
    if(isDeleteRemote){
     realUrl=`/hybrid/huawei/ecs/${uuid}/remote`;
    }else {
      realUrl=`/hybrid/huawei/ecs/${uuid}`;
    }
    return rpc._delete(realUrl, null, progressCb)
  },
  queryIdentityZone(uuid){
    return rpc.query(`brid/identity-zone`, {
      q: `uuid=${uuid}`,
    })
  },
  action(uuid, param ,  progressCb) {
    return rpc.update('hybrid/huawei/ecs', uuid, param, progressCb)
  },
  querySecurityGroupName(uuid){
    return rpc.query(`hybrid/huawei/security-group`, {
      q: `uuid=${uuid}`,
    })
  },

  queryImageName(uuid) {
    return rpc.query(`/hybrid/huawei/image/${uuid}`)
  }
}
