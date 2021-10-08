import api from './apis';
export default {
  async queryNormal(param){
    //克隆请求参数
    let realParam = _.cloneDeep(param)
    realParam.replyWithCount = true
    if (param.sortDirection && param.sortBy) {
      realParam.sort = `${param.sortDirection}${param.sortBy}`
    }
    let resp = await api.queryNormal(param);
    return {
      total: resp.total,
      usbArray: resp.inventories
    }
  },

  async queryHost(commit, uuid) {
    let resp;
    resp = await api.queryHost(uuid);
    commit('merge', {
      [uuid]: {
        hostName: resp.inventories[0] ? resp.inventories[0].name : ''
      }
    })
  }
}
