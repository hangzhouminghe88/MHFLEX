import api from  './apis';
export default {
  async basicQuery(param){
    if(!param) return;
    let realParam = _.cloneDeep(param);
    if(!param.replyWithCount) realParam.replyWithCount = true;
    if(!param.sort) realParam.sort = `${param.sortDirection}${param.sortBy}`;
    let resp = await api.basicQuery(realParam);
    return {
      userGroupArray: resp.inventories,
      total: resp.total
    }
  }
}
