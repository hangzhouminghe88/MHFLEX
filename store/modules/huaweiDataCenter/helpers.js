import api from './apis';
export default {
  async basicQuery(param){
    let realParam = {};
    realParam = _.cloneDeep(param);
    param.replyWithCount ? realParam.replyWithCount = param.replyWithCount : realParam.replyWithCount = true;
    let resp = await api.basicQuery(realParam);
    return {
      total: resp.total,
      dataCenterArray: resp.inventories
    }
  }
}
