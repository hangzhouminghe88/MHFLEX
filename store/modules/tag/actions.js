import _ from 'lodash'
import Utils from '../../utils'
// import helper from './helpers'
import api from './apis'
// import batchQueryApi from '../batchQuery/apis'
// import accountResourceApi from '../accountResource/apis'
// import longjobApi from '../longjob/apis'
// import systemTagHelper from '../systemTag/helpers'
import rpc from 'src/utils/rpc'
import GlobalUtils from 'src/utils/utils'

const tableName = 'tag'
// let queryTemplate = createQueryTemplate(tableName)
let batchQueryTemplate = Utils.createBatchQueryTemplate(tableName)
// let actionTempalte = createActionTemplate(tableName)
let batchActionTemplate = Utils.createBatchActionTemplate(tableName)

export default {
  query: batchQueryTemplate(async ({ commit, dispatch, rootState }, param) => {
    // exclude owner.name
    let realConditionList = _.filter(param.q, it => !_.startsWith(it, 'owner.name'))
    realConditionList = realConditionList.map(condition => decodeURI(condition))
    let zqlConditions = GlobalUtils.translateConditions(realConditionList)
    let zql = `query tagPattern`
    if (zqlConditions.length > 0) {
      zql = `${zql} where ${zqlConditions}`
    }
    let ownerNameCondition = _.find(param.q, it => _.startsWith(it, 'owner.name'))
    if (ownerNameCondition) {
      if (zqlConditions.length === 0) {
        zql = `${zql} where`
      } else {
        zql = `${zql} and`
      }
      let ownerName = decodeURI(ownerNameCondition.substring('owner.name='.length + 1))
      zql = `${zql} (
  uuid in ( query AccountResourceRef.resourceUuid where accountUuid in (
    query account.uuid where name like '${ownerName}')
  ) or
  uuid in ( query AccountResourceRef.resourceUuid where accountUuid in (
    query IAM2Project.uuid where name like '${ownerName}')
  )
)
`
    }
    zql = `${zql} return with (total)`
    if (param.sortBy && param.sortDirection && param.limit && param.start !== undefined) { // update count
      zql = zql + `order by ${param.sortBy} ${GlobalUtils.getLiteralDirection(param.sortDirection)} limit ${param.limit} offset ${param.start}`
    }
    let resp = await rpc.query('zql', {
      zql: encodeURIComponent(zql)
    })
    let tagArray = resp.results[0].inventories
    let tagMap = Utils.arrayToDict(tagArray)
    let tagUuidList = tagArray.map(it => it.uuid)
    let resourceOwnerMap = await Utils.getResourceOwner(tagUuidList, commit, rpc, rootState)
    tagMap = Utils.mergeMap(tagMap, resourceOwnerMap)
    return {
      inventories: tagMap,
      total: resp.results[0].total
    }
    // let resp = await rpc.query('tags', param)
    // let tagArray = resp.inventories
    // let tagMap = Utils.arrayToDict(tagArray)
    // let tagUuidList = tagArray.map(it => it.uuid)
    // let resourceOwnerMap = await Utils.getResourceOwner(tagUuidList, commit, rpc, rootState)
    // tagMap = Utils.mergeMap(tagMap, resourceOwnerMap)
    // return {
    //   total: resp.total,
    //   inventories: tagMap
    // }
  }),
  queryByAccount: batchQueryTemplate(async ({ commit, dispatch, rootState }, param) => {
    let accountClause = ''
    if (param.accountUuid) {
      let accountMark = ''
      if (param.type === 'my') {
        accountMark = '='
      } else {
        accountMark = '!='
      }
      accountClause = `and accountUuid${accountMark}'${param.accountUuid}'`
    }
    // let nameClause = ''
    // if (param.name) {
    //   nameClause = `name like '%${param.name}%' and`
    // }
    let zqlConditions = GlobalUtils.translateConditions(param.q)
    if (zqlConditions !== '') {
      zqlConditions = zqlConditions + ' and'
    }
    // query tagPattern where ${nameClause} uuid in (
    let zql = `
query tagPattern where ${zqlConditions} uuid in (
  query accountResourceRef.resourceUuid where 
    resourceType='TagPatternVO' ${accountClause}
)
return with (total)
`

    if (param.sortBy && param.sortDirection) { // update count
      zql = zql + `order by ${param.sortBy} ${GlobalUtils.getLiteralDirection(param.sortDirection)}`
    }

    if (param.limit !== undefined) {
      zql = zql + ` limit ${param.limit}`
    }

    if (param.start !== undefined) {
      zql = zql + ` offset ${param.start}`
    }
    let resp = await rpc.query('zql', {
      zql: encodeURIComponent(zql)
    })
    let tagArray = resp.results[0].inventories
    let tagMap = Utils.arrayToDict(tagArray)
    let tagUuidList = tagArray.map(it => it.uuid)
    let resourceOwnerMap = await Utils.getResourceOwner(tagUuidList, commit, rpc, rootState)
    tagMap = Utils.mergeMap(tagMap, resourceOwnerMap)
    return {
      inventories: tagMap,
      total: resp.results[0].total
    }
  }),
  queryResourceCount: async ({ commit, dispatch, rootState }, param) => {
    let tagUuidList = param
    if (tagUuidList.length <= 0) return
    let zql = `
count usertag where tagPatternUuid in ('${tagUuidList.join('\',\'')}') group by tagPatternUuid
`
    let resp = await rpc.query('zql', {
      zql: encodeURIComponent(zql)
    })
    let tagUuidWithResourceCountList = []
    if (_.isArray(resp.results[0].inventoryCounts)) {
      tagUuidWithResourceCountList = resp.results[0].inventoryCounts
    }
    let tagMap = {}
    tagUuidWithResourceCountList.forEach(item => {
      let uuid = item[0].tagPatternUuid
      tagMap[uuid] = {
        resourceCount: item[1]
      }
    })
    commit('merge', tagMap)
  },
  create: async ({ commit, dispatch, rootState }, { param, progressCb }) => {
    param.value = param.name
    let resp = await api.create(param, progressCb)
    let inventory = resp.inventory
    commit('merge', {
      [inventory.uuid]: inventory
    })
    return resp
  },
  delete: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param
    let resp = await api.delete(uuid, progressCb)
    return resp.inventory
  }),
  update: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let resp = await api.update(param.uuid, param.param, progressCb)
    return resp.inventory
  }),
  attach: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let resp = await api.attach(param.uuid, param.resourceUuidList, progressCb)
    return resp.inventory
  }),
  // attach: (ctx, { param, progressCb }) => {
  //   let paramList = param
  //   let tasks = paramList.map(it => api.attach(it.tagUuid, it.resourceUuidList, progressCb))
  //   return Promise.all(tasks)
  //   // paramList.forEach(it => {
  //   //   api.attachTag(it.tagUuid, it.resourceUuidList, progressCb)
  //   //   .then((param) => {
  //   //     param.resourceUuidList.forEach(vmUuid => {
  //   //       let vm = ctx.state[vmUuid]
  //   //       if (vm.myUserTagUuidList) {
  //   //         let myUserTagUuidList = _.cloneDeep(vm.myUserTagUuidList)
  //   //         myUserTagUuidList.unshift(param.tagUuid)
  //   //         ctx.commit('merge', {
  //   //           [vmUuid]: {
  //   //             myUserTagUuidList
  //   //           }
  //   //         })
  //   //       }
  //   //     })
  //   //     return Promise.resolve()
  //   //   })
  //   // })
  // },
  detach: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let resp = await api.detach(param.uuid, param.resourceUuidList, progressCb)
    return resp.inventory
  })
  // detach: (ctx, { param, progressCb }) => {
  //   let paramList = param
  //   let tasks = paramList.map(it => api.detach(it.tagUuid, it.resourceUuidList, progressCb))
  //   return Promise.all(tasks)
  //   // paramList.forEach(it => {
  //   //   tasks.push(
  //   //     api.detachTag(it.tagUuid, it.resourceUuidList, progressCb)
  //   //     .then((param) => {
  //   //       param.resourceUuidList.forEach((vmUuid) => {
  //   //         let obj = {}
  //   //         let vm = ctx.state[vmUuid]
  //   //         if (vm.myUserTagUuidList) {
  //   //           let myUserTagUuidList = _.cloneDeep(vm.myUserTagUuidList)
  //   //           _.remove(myUserTagUuidList, (uuid) => uuid === param.tagUuid)
  //   //           obj.myUserTagUuidList = myUserTagUuidList
  //   //         }
  //   //         if (vm.otherUserTagUuidList) {
  //   //           let otherUserTagUuidList = _.cloneDeep(vm.otherUserTagUuidList)
  //   //           _.remove(otherUserTagUuidList, (uuid) => uuid === param.tagUuid)
  //   //           obj.otherUserTagUuidList = otherUserTagUuidList
  //   //         }
  //   //         ctx.commit('merge', {
  //   //           [vmUuid]: obj
  //   //         })
  //   //       })
  //   //       return Promise.resolve()
  //   //     })
  //   //   )
  //   // })
  //   // return Promise.all(tasks)
  // }
}



// WEBPACK FOOTER //
// ./src/store/modules/tag/actions.js
