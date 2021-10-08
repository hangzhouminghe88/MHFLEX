import _ from 'lodash'
import Utf8Base64 from 'src/utils/utf8Base64'
import rpc from 'src/utils/rpc'
import api from './apis'
import systemTagApi from '../systemTag/apis'
import systemTagHelper from '../systemTag/helpers'

export default {
  getMergedObject (rootState, uuid) {
    let obj = _.cloneDeep(rootState.db.autoScalingGroup[uuid])
    if (rootState.db.autoScalingGroupA) {
      obj = _.extend(obj, rootState.db.autoScalingGroupA[uuid])
    }
    return obj
  },
  buildSystemTag (param) {
    let systemTags = []
    if (param.consolePassword !== '' && param.consolePassword !== undefined) systemTags.push(`consolePassword::${param.consolePassword}`)
    if (param.sshKey !== '' && param.sshKey !== undefined) systemTags.push(`sshkey::${param.sshkey}`)
    if (param.userData !== '' && param.userData !== undefined) systemTags.push(`userData::${Utf8Base64.encode(param.userData)}`)
    return systemTags
  },
  async queryAutoScalingVmTemplate (autoScalingGroupUuid, commit) {
    let uuid = autoScalingGroupUuid
    let resp = await rpc.query('autoscaling/vmtemplate', {
      q: `autoScalingGroup.uuid=${uuid}`
    })
    let list = resp.inventories
    if(list && list[0]) {
      let systemTagResp = await systemTagApi.get([list[0].uuid])
      let systemTagMap = systemTagHelper.normalizeResp(systemTagResp.inventories)

      if (systemTagMap[list[0].uuid]) delete systemTagMap[list[0].uuid].uuid
      commit('mergeDbTable', {tableName: 'autoScalingVmTemplate', list}, { root: true })
      commit('merge', {
        [uuid]: {
          uuid,
          vmTemplates: {
            ...list[0],
            ...systemTagMap[list[0].uuid]
          },
          ...systemTagMap[list[0].uuid]
        }
      })
    }
  },
  async getAutoScalingGroupInstance (autoScalingGroupUuid, commit) {
    let uuid = autoScalingGroupUuid
    let zql = "count AutoScalingGroupInstance where scalingGroupUuid='" + `${uuid}` + "' and healthStatus='Healthy';query AutoScalingGroupInstance where scalingGroupUuid='" + `${uuid}` + "' return with (total);count AutoScalingGroupInstance where scalingGroupUuid='" + `${uuid}` + "' and healthStatus!='Healthy'"
    let resp = await rpc.query('/zql', {
      zql: encodeURIComponent(zql)
    })
    let vmInstanceUuidList = []
    let healthyVmInstanceNum = resp.results[0].total || 0
    let totalVmInstanceNum = resp.results[1].total || 0
    let unHealthyVmInstanceNum = resp.results[2].total || 0
    let vmList = []
    resp.results[1].inventories.forEach(item => {
      vmInstanceUuidList.push(item.instanceUuid)
      vmList.push({
        uuid: item.instanceUuid,
        healthStatus: item.healthStatus
      })
    })
    // vmInstanceUuidList = resp.results[1].inventories.map(it => it.instanceUuid)
    commit('mergeDbTable', {tableName: 'vm', list: vmList}, { root: true })
    commit('merge', {
      [uuid]: {
        uuid,
        'healthyVmInstanceNum': healthyVmInstanceNum,
        'totalVmInstanceNum': totalVmInstanceNum,
        'unHealthyVmInstanceNum': unHealthyVmInstanceNum,
        'vmInstanceUuidList': vmInstanceUuidList
      }
    })
  },
  async queryAutoScalingRuleAndAlarmAndEndpoint (autoScalingGroupUuid, commit) {
    let uuid = autoScalingGroupUuid
    let resp = await rpc.query('autoscaling/groups/rules', {
      q: `scalingGroupUuid=${uuid}`
    })
    let list = resp.inventories
    let addingNewInstanceRule = {}
    let removalInstanceRule = {}
    addingNewInstanceRule = list.filter(it => it.type === 'AddingNewInstanceRule')[0] || {}
    removalInstanceRule = list.filter(it => it.type === 'RemovalInstanceRule')[0] || {}
    let autoScalingRuleTriggerResp = await api.queryAutoScalingRuleTriggerByAutoScalingGroupUuid(uuid)
    let autoScalingRuleTriggerList = autoScalingRuleTriggerResp.results[0].inventories
    let alarmUuidList = []
    autoScalingRuleTriggerList.forEach(item => {
      alarmUuidList.push(item.alarmUuid)
      if (addingNewInstanceRule.uuid === item.ruleUuid) {
        addingNewInstanceRule.ruleUuid = item.ruleUuid
        addingNewInstanceRule.alarmUuid = item.alarmUuid
      }
      if (removalInstanceRule.uuid === item.ruleUuid) {
        removalInstanceRule.ruleUuid = item.ruleUuid
        removalInstanceRule.alarmUuid = item.alarmUuid
      }
    })
    let alarmResp = await api.queryAlarmByAlarmUuidList(alarmUuidList)
    let actionUuidList = []
    alarmResp.inventories.forEach(item => {
      if (item.uuid === addingNewInstanceRule.alarmUuid) {
        delete item.uuid
        delete item.name
        actionUuidList = actionUuidList.concat(item.actions.map(it => it.actionUuid))
        addingNewInstanceRule = Object.assign(addingNewInstanceRule, item)
      }
      if (item.uuid === removalInstanceRule.alarmUuid) {
        delete item.uuid
        delete item.name
        actionUuidList = actionUuidList.concat(item.actions.map(it => it.actionUuid))
        removalInstanceRule = Object.assign(removalInstanceRule, item)
      }
    })
    let zwatchEndpoint = await api.querySNSHttpEndpointByConditions([`topics.uuid?=${actionUuidList}`])
    commit('mergeDbTable', {tableName: 'autoScalingRuleTrigger', list: autoScalingRuleTriggerList}, { root: true })
    commit('mergeDbTable', {tableName: 'autoScalingRule', list}, { root: true })
    commit('merge', {
      [uuid]: {
        uuid,
        addingNewInstanceRule: addingNewInstanceRule,
        removalInstanceRule: removalInstanceRule,
        zwatchEndpoint: zwatchEndpoint.inventories
      }
    })
  },
  async queryLoadBalancerAndLoadBalancerListener (autoScalingGroupUuid, commit) {
    let uuid = autoScalingGroupUuid
    let zql = "query systemTag.tag where tag like 'loadBalancerListenerUuids::%' and resourceUuid in (query AutoScalingVmTemplate.uuid where autoScalingGroup.uuid='" + `${uuid}` + "')"
    let resp = await rpc.query('/zql', {
      zql: encodeURIComponent(zql)
    })
    let loadBalancerListenerUuids = ''
    let loadBalancerName = '',  loadBalancerUuid = ''
    if (resp.results && resp.results.length > 0 && resp.results[0].inventories && resp.results[0].inventories.length > 0) {
      loadBalancerListenerUuids = resp.results[0].inventories[0].tag.split('::')[1]
    }
    if (loadBalancerListenerUuids) {
      let listener = await rpc.query('load-balancers/listeners', {
        q: `uuid?=${loadBalancerListenerUuids}`
      })
      let listenerList = listener.inventories
      commit('mergeDbTable', {tableName: 'loadBalancerListener', list: listenerList}, { root: true })
      let loadBalancer = await rpc.query('load-balancers', {
        q: `listeners.uuid?=${loadBalancerListenerUuids}`
      })
      let loadBalancerList = loadBalancer.inventories
      loadBalancerName = loadBalancer.inventories.length > 0 ? loadBalancer.inventories[0].name : ''
      loadBalancerUuid = loadBalancer.inventories.length > 0 ? loadBalancer.inventories[0].uuid : ''
      commit('mergeDbTable', {tableName: 'loadBalancer', list: loadBalancerList}, { root: true })
    }
    commit('merge', {
      [uuid]: {
        uuid,
        'loadBalancerName': loadBalancerName,
        'loadBalancerUuid':  loadBalancerUuid
      }
    })
  }
}



// WEBPACK FOOTER //
// ./src/store/modules/autoScalingGroup/helpers.js
