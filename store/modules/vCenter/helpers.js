import api from './apis';

export  default {
  //查询vCenter资源
  async basicQuery(param){
    let realParam = _.cloneDeep(param);
    if(!param.replyWithCount){
      realParam.replyWithCount = true;
    }
    let resp = await api.query(realParam);
    return {
      total: resp.total,
      vCenterArray: resp.inventories
    }
  }
}
