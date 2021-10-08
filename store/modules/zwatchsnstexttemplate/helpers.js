import api from './apis';

export default {
  async basicQuery(param){
    let realParam = {};
    realParam = _.cloneDeep(param);
    if(!param) return;
    if(param.sort) {
      realParam.sort = param.sort
     }
     param.replyWithCount ? realParam.replyWithCount = param.replyWithCount : realParam.replyWithCount = true;
     let  resp = await api.query(realParam);
     return {
       total: resp.total,
       zwatchSNSTextTemplateArr: resp.inventories
     }
  }
}
