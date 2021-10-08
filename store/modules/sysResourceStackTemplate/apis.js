import Utils from "../../utils";
import rpc from 'src/utils/rpc';

export default {
  query(param){
    return rpc.query(`cloudformation/template`, param);
  },
  async queryResourceOwner (uuidList, commit, rpc, rootState) {
    let resourceProjectMap = await Utils.getResourceOwner(uuidList, commit, rpc, rootState);
    return resourceProjectMap;
  },
  changeTemplateState(uuid, state , progressCb){
    return rpc.update('cloudformation/template', uuid, {
      'updateStackTemplate': {
        state: state
      }
    }, progressCb)
  }
}
