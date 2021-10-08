import _ from 'lodash'
import Utils from '../../utils'
import rpc from 'src/utils/rpc'

export default {
  async queryUserTag (param, type, commit) {
    let uuidList = param
    if (_.isString(param)) {
      uuidList = [param]
    }
    let loginType = window.localStorage.getItem('loginType')
    let accountUuid = window.localStorage.getItem('accountUuid')
    if (_.includes(['account', 'user', 'ldap'], loginType)) {
      accountUuid = window.localStorage.getItem('accountUuid')
    } else if (loginType === 'project') {
      accountUuid = window.localStorage.getItem('currProjectUuid')
    }
    let mineInventories = await this._queryUserTag(uuidList, type, accountUuid, true)
    let myUserTagList = mineInventories.map(it => it.tagPattern)
    let myUserTagMap = Utils.arrayToDict(myUserTagList)
    commit('tag/merge', myUserTagMap, {root: true})
    let vmMap = {}
    if(mineInventories.length>0) {
      mineInventories.forEach(it => {
        if (!vmMap[it.resourceUuid]) {
          vmMap[it.resourceUuid] = {
            uuid: it.resourceUuid
          }
        }
        if (!vmMap[it.resourceUuid].myUserTagUuidList) {
          vmMap[it.resourceUuid].myUserTagUuidList = []
        }
        vmMap[it.resourceUuid].myUserTagUuidList.push(it.tagPattern.uuid)
      })
    }

    let otherInventories = await this._queryUserTag(uuidList, type, accountUuid, false)
    let otherUserTagList = otherInventories.map(it => it.tagPattern)
    let otherUserTagMap = Utils.arrayToDict(otherUserTagList)
    commit('tag/merge', Utils.arrayToDict(otherUserTagList), {root: true})
    if(otherInventories.length>0) {
      otherInventories.forEach(it => {
        if (!vmMap[it.resourceUuid]) {
          vmMap[it.resourceUuid] = {
            uuid: it.resourceUuid
          }
        }
        if (!vmMap[it.resourceUuid].otherUserTagUuidList) {
          vmMap[it.resourceUuid].otherUserTagUuidList = []
        }
        vmMap[it.resourceUuid].otherUserTagUuidList.push(it.tagPattern.uuid)
      })
    }
    // make stable tag list order
    if(vmMap){
      _.keys(vmMap).forEach(uuid => {
        let rs = vmMap[uuid]
        if (!rs.myUserTagUuidList) rs.myUserTagUuidList = []
        if (!rs.otherUserTagUuidList) rs.otherUserTagUuidList = []
        rs.myUserTagUuidList = _.orderBy(rs.myUserTagUuidList, tagUuid => myUserTagMap[tagUuid].name)
        rs.otherUserTagUuidList = _.orderBy(rs.otherUserTagUuidList, tagUuid => otherUserTagMap[tagUuid].name)
      })
    }
    return vmMap
  },
  async _queryUserTag (param, type, accountUuid, queryMineTag) {
    let uuidList = param
    if (_.isString(param)) {
      uuidList = [param]
    }
    let sign = '='
    if (queryMineTag) {
      sign = '='
    } else {
      sign = '!='
    }

    let queryStr = `
query userTag where resourceType='${type}' and
  resourceUuid in ('${uuidList.join('\',\'')}') and
  tagPatternUuid in (
    query accountResourceRef.resourceUuid where
      resourceType='TagPatternVO' and
      accountUuid${sign}'${accountUuid}'
  )
`
    let resp = await rpc.query('zql', {
      zql: encodeURIComponent(queryStr)
    })

    return resp.results[0].inventories
    // let resp = await rpc.query('user-tags', {
    //   q: ['resourceType=VmInstanceVO', `resourceUuid?=${uuidList.join(',')}`]
    // })
    // list = resp.inventories
  }
}



// WEBPACK FOOTER //
// ./src/store/modules/tag/partialHelperForResource.js
