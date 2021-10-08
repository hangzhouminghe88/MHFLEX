import api from './apis';
import Utils from "../../utils";
export default {
  async basicQuery(param){
    let realParam = {};
    realParam = _.cloneDeep(param);
    if(param.sortDirection && param.sortBy){
      realParam.sort = `${param.sortDirection}${param.sortBy}`
    }
    param.replyWithCount ? realParam.replyWithCount = param.replyWithCount : realParam.replyWithCount = true;
    let resp = await api.query(realParam);
    return {
      total: resp.total,
      resourceStackArray: resp.inventories
    }
  },
  async queryResourceOwner (uuidList, commit, rpc, rootState) {
    let resourceProjectMap = await Utils.getResourceOwner(uuidList, commit, rpc, rootState);
    return resourceProjectMap;
  },
}
