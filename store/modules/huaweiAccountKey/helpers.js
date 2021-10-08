import api from './apis';
export default {
  async basicQuery(param){
    //整合请求条件
    let realParam = {};
    realParam = _.cloneDeep(param);
    param.replyWithCount ? realParam.replyWithCount = param.replyWithCount : realParam.replyWithCount = true;
    param.sortBy && param.sortDirection ? realParam.sort = `${param.sortDirection}${param.sortBy}` : realParam.sort = '';
    let resp = await api.basicQuery(realParam);
    return {
      total: resp.total,
      acccountKeyArray: resp.inventories
    }
  }
}
