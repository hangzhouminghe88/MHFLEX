import api from './apis';
export default {
  async batchQuery(param){
    let realParam ={};
    realParam = _.cloneDeep(param);
    if(param.sortBy && param.sortDirection){
      realParam.sort = `${param.sortDirection}${param.sortBy}`;
    }
    param.replyWithCount
      ?
      realParam.replyWithCount = param.replyWithCount
      :
      realParam.replyWithCount = true;
    let resp  = await api.batchQuery(realParam);
    return {
      certificateArray: resp.inventories,
      total: resp.total
    }
  }
}
