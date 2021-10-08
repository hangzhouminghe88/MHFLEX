import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`hybrid/tencent/ecs`, param);
  },
  queryVpcName(ecsVSwitchUuid) {
    return rpc.query(`hybrid/tencent/vswitch/${ecsVSwitchUuid}`, {
      fields: 'ecsVpcUuid'
    }).then( (resp) => {
      return rpc.query(`hybrid/tencent/vpc/${resp.inventories[0].ecsVpcUuid}`);
    })
  },
  updateEcsInstancePassword(url, param, progressCb) {
    return rpc.create(url, param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.create(`/hybrid/tencent/${uuid}/ecs`, param, progressCb)
  },
  delete(uuid, progressCb, isDeleteRemote) {
    let realUrl = '';
    if(isDeleteRemote){
     realUrl=`/hybrid/tencent/ecs/${uuid}/remote`;
    }else {
      realUrl=`/hybrid/tencent/ecs/${uuid}`;
    }
    return rpc._delete(realUrl, null, progressCb)
  },
  queryIdentityZone(uuid){
    return rpc.query(`hybrid/tencent/identity-zone`, {
      q: `uuid=${uuid}`,
    })
  },
  action(uuid, param ,  progressCb) {
    return rpc.update('hybrid/tencent/ecs', uuid, param, progressCb)
  },
  querySecurityGroupName(uuid){
    return rpc.query(`hybrid/tencent/security-group`, {
      q: `uuid=${uuid}`,
    })
  },

  queryImageName(uuid) {
    return rpc.query(`/hybrid/tencent/image/${uuid}`)
  }
}
