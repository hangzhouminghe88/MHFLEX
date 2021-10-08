import api from './apis';
export default {
  async basicQuery(param){
    let realParam = {};
    realParam = _.cloneDeep(param);
    param.replyWithCount ? realParam.replyWithCount = param.replyWithCount : realParam.replyWithCount = true;
    param.sortBy && param.sortDirection ? realParam.sort = `${param.sortDirection}${param.sortBy}` : realParam.sort = '';
    let resp = await api.basicQuery(realParam);
    return {
      total: resp.total,
      accessKeyArray: resp.inventories
    }
  },
  async queryAccountResource(param){
    let resp = await api.queryAccountResource(param);
    return resp;
  },
  async queryAccount(commit,resourceUuidList){
    let resp = await api.queryAccount(resourceUuidList);
    commit('mergeDbTable', {tableName: 'account', list: resp.inventories}, {root: true});
    return resp;
  },
  async queryProjects(commit, resourceUuidList){
    let resp = await api.queryProjects(resourceUuidList);
    return resp;
  }
}
