import {
  createActionTemplate,
  createBatchActionTemplate,
  createBatchQueryTemplate,
  createQueryTemplate,
  arrayToDict
} from "../../utils";
import helper from './helpers';
const tableName = 'adLdapServer'
let queryTemplate = createQueryTemplate(tableName)
let batchQueryTemplate = createBatchQueryTemplate(tableName)
let actionTempalte = createActionTemplate(tableName)
let batchActionTemplate = createBatchActionTemplate(tableName)
export default {
  query: batchQueryTemplate(async ({commit, rootScope, dispatch}, param) => {
     let ret = await helper.query(param);
     let adLdapArr = ret.adLdapArray;
     let adLdapMap =  arrayToDict(adLdapArr);
     dispatch('queryRelation', adLdapArr);
     let total = ret.total;
     return {
       total,
       inventories: adLdapMap
     }
  }),
  queryRelation: ({commit, rootScope},param) => {
    let adLdapArray, tasks = [];
    if (!_.isArray(param)) {
      adLdapArray = [param]
    } else {
      adLdapArray = param
    }
    let uuidList = adLdapArray.map((ad) => {
      return ad.uuid;
    })
    uuidList.forEach(uuid => {
      tasks.push(helper.querySystemTag(commit, rootScope, uuid));
    });
    return Promise.all(tasks);
  }
}
