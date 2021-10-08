import api from './apis';
export default {
  async basicQuery(param){
    let realParam = {};
    realParam = _.cloneDeep(param);
    param.replyWithCount ? realParam.replyWithCount = param.replyWithCount : realParam.replyWithCount = true;
    let resp = await api.basicQuery(realParam);
    return {
      total: resp.total,
      iZoneArray: resp.inventories
    }
  },

  async queryDataCenter(commit, uuid, dataCenterUuid) {
    let resp
    if(dataCenterUuid)
     resp = await api.queryDataCenter(dataCenterUuid);
    commit('merge', {
      [uuid]: {
        dataCenterName: (resp.inventories && resp.inventories[0]) ? resp.inventories[0].regionName : ''
      }
    })
  }
}
