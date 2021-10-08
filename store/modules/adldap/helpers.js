import api from './apis';
export default {
  async query(param){
    if(!param) return;
    let realParam = _.cloneDeep(param);
    param.replyWithCount ? realParam.replyWithCount = param.replyWithCount :realParam.replyWithCount = true;
    if(param.sortDirection && param.sortBy){
      realParam.sort = `${param.sortDirection}${param.sortBy}`;
    }
    let resp = await api.query(realParam);
    return {
      total: resp.total,
      adLdapArray: resp.inventories
    }
  },
  async querySystemTag(commit, rootScope, uuid){
    let resp = await api.querySystemTag(uuid);
    commit('mergeDbRow', {
      tableName: 'adLdapServerSystemTag',
      id: uuid,
      data: resp.inventories
    });
  }
}
