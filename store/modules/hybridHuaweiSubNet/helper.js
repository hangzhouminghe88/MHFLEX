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
  async queryIdentityZone(commit, uuid, identityZoneUuid) {
    let res;
    if(identityZoneUuid)
      res = await api.queryIdentityZone(identityZoneUuid);
    commit('merge',{
        [uuid]: {
        izoneName: (res && res.inventories[0]) ? res.inventories[0].zoneName : ''
      }
    })
  },
  async queryVpc(commit, uuid, ecsVpcUuid) {
    let res = await api.queryVpc(ecsVpcUuid);
    commit('merge',{
      [uuid]: {
        vpcName: (res && res.inventories && res.inventories[0]) ? res.inventories[0].name : ''
      }
    })
  }
}
