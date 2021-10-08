import api from './apis';

export default {
  async query(param) {
    if (!param) return;
    let realParam = _.cloneDeep(param);
    if (!param.replyWithCount) realParam.replyWithCount = true;
    let resp = await api.query(realParam);
    return {
      total: resp.total,
      inventories: resp.inventories
    }
  },
  async querySecurityGroupName(commit, uuid, securityGroupUuid) {
    let res = await api.querySecurityGroupName(securityGroupUuid);
    commit('merge', {
      [uuid]: {
        securityGroupName: securityGroupUuid ? res.inventories[0].name : ''
      }
     })
  },
  async queryVpcName(commit, uuid, ecsVSwitchUuid){
    let res = await api.queryVpcName(ecsVSwitchUuid);
    commit('merge', {
      [uuid]:{
        'vpcName': ecsVSwitchUuid ? res.inventories[0].name : '',
        'ecsVpcUuid': ecsVSwitchUuid && res.inventories[0] ? res.inventories[0].uuid : ''
      }
    })
  },
  async queryIdentityZone(commit, uuid, identityZoneUuid) {
    let res = await  api.queryIdentityZone(identityZoneUuid);
      commit('merge',{
        [uuid]:{
        'identityZoneName': identityZoneUuid ? res.inventories[0].zoneName : ''
        }
      })
  },
  async queryImageName(commit, uuid, ecsImageUuid) {
    let res = await  api.queryImageName(ecsImageUuid);
      commit('merge',{
        [uuid]:{
        'imageName': ecsImageUuid ? res.inventories[0].name : ''
        }
      })
  },
}
