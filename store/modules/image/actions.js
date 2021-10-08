import Utils, {getResourceOwner, mergeMap} from "../../utils";
import helper from './helpers';
import rpc from "../../../src/utils/rpc";
import api from "./apis";

let tableName = 'image';
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName);
let batchActionTemplate = Utils.createBatchActionTemplate(tableName);
export default{
  query: batchQueryTemplate(async ({ commit, dispatch, rootState }, param) => {
    let respAr;
    if(rootState.db.common.isAdmin){
      respAr = new Promise((resolve, reject) => { resolve() })
     }else{
       let queryArConditions = ['resourceType=ImageVO', `accountUuid=${localStorage.getItem('accountUuid')}`];
       respAr = await helper.queryAccountRefs(queryArConditions);
     }
    if (!rootState.db.common.isAdmin) {
      if (param.currTab && param.currTab === 'mine') {
        param.conditions = conditions.concat(`uuid?=${respAr.myImageUuidList.join(',')}`)
      } else if (param.currTab && param.currTab === 'share') {
        param.conditions = conditions.concat(`uuid!?=${respAr.myImageUuidList.join(',')}`)
      }
    }
    let ret = await dispatch('basicQuery', param);
    let imageArray = ret.imageArray;
    let imageMap = Utils.arrayToDict(imageArray);
    let total = ret.total
    dispatch('queryRelatedData', imageArray)
    return {
      total,
      inventories: imageMap
    }
  }),
  basicQuery: async ({ commit, dispatch, rootState }, param) => {
    // NOTICE: (xiang.gao)
    // The conditions for normal query and zql are different,
    // so I keep conditions for normal query to limit the change.
    // Later I will use zql to replace normal query.
    let ret = await helper.normalQuery(param);
    return ret
  },

  async queryRelatedData ({ commit, dispatch, rootState }, param) {
    let imageArray
    if (!_.isArray(param)) {
      imageArray = [param]
    } else {
      imageArray = param
    }
    if (imageArray.length <= 0) return
    let imageUuidList = imageArray.map(vm => vm.uuid)
    let backupStorageUuidList = imageArray.map((item) => {
      if (item.backupStorageRefs && item.backupStorageRefs.length > 0) {
        return item.backupStorageRefs[0].backupStorageUuid
      }
    }).join()
    let tasks = [];
    let imageMap = Utils.arrayToDict(imageArray);
    let resourceProjectMap = await getResourceOwner(imageArray, commit, rpc, rootState);
    imageMap = mergeMap(imageMap, resourceProjectMap);
    return imageMap
  },
  update: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let resp = await api.update(param.uuid, param.param, progressCb)
    return resp.inventory
   }),
}
