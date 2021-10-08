import api from './apis';
import Utils from "../../utils";
export default {
  async basicQuery(param){
    let realParam = null;
    realParam = _.cloneDeep(param);
    if(!param.replyWithCount){
      realParam.replayWithCount = true;
    }
    let resp = await api.query(realParam);
    return {
      total: resp.total,
      sysResourceStackTemplateArr: resp.inventories
    }
  },
  async queryResourceOwner (uuidList, commit, rpc, rootState) {
    let resourceProjectMap = await Utils.getResourceOwner(uuidList, commit, rpc, rootState);
    return resourceProjectMap;
  }
}
