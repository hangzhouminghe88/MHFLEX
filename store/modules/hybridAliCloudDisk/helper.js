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
  async queryEscName(commit, uuid, escInstanceUuid) {
    let res = await api.queryEscName(escInstanceUuid);
    commit('merge', {
      [uuid]: {
        ecsName: escInstanceUuid ? res.inventories[0].name : ''
      }
     })
  },
  async querySystemTag(commit, rootState, uuid){
    let res = await api.querySystemTag(uuid);
    commit('mergeDbTable', {tableName: 'hybridAliyunDiskSystemTag', list: res.inventories}, { root: true })
  },
  async queryIdentityZone(commit, uuid, identityZoneUuid) {
    let res = await  api.queryIdentityZone(identityZoneUuid);
      commit('merge',{
        [uuid]:{
        'identityZoneName': identityZoneUuid ? res.inventories[0].zoneName : ''
        }
      })
  }
}
