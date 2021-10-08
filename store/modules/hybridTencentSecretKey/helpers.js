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
      secretKeyArray: resp.inventories
    }
  }
}
