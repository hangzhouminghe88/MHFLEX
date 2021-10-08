import rpc from 'src/utils/rpc';
import Utils from '../../utils';
import api from "./apis";

export default{
  async queryAccountRefs(param){
    let resp = await rpc.query('accounts/resources/refs', {
      q: param
    });
    let myImageUuidList = resp.inventories.map((item) => item.resourceUuid);
    return{
      myImageUuidList: myImageUuidList,
      arInventories: resp.inventories
    }
  },

  async normalQuery(param){
    let realParam = _.cloneDeep(param)
    realParam.replyWithCount = true
    let resp = await api.query(realParam)
    return {
      imageArray: resp.inventories,
      total: resp.total
    }
  },

  async queryBackupStorage(imageArray, commit, rpc, rootState,param){
    let ret = await api.queryBs(param);
    let bsUuidOnlyArray = ret.inventories.map(bs => {
      return {
        uuid: bs.uuid,
      }
    })
    let list = _.values(bsUuidOnlyArray);
    commit('merge', bsUuidOnlyArray);
    commit('mergeDbTable', {tableName: 'imageMigrate', list}, {root: true})
    return ret;
  },
  async queryResourceOwner(imageUuidList, commit, rpc, rootState) {
    let resourceProjectMap = await Utils.getResourceOwner(imageUuidList, commit, rpc, rootState);
    console.log(resourceProjectMap);
    commit('merge', resourceProjectMap)
  },
}
