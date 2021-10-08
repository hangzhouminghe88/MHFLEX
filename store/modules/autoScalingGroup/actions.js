// import rpc from 'src/utils/rpc'
// import _ from 'lodash'
import { arrayToDict, mergeObj, mergeMap, emptyPromise, createActionTemplate, createBatchActionTemplate, createQueryTemplate, createBatchQueryTemplate } from '../../utils'
import helper from './helpers'
import api from './apis'
// import accountResourceApi from '../accountResource/apis'
import systemTagApi from '../systemTag/apis'
import systemTagHelper from '../systemTag/helpers'

const tableName = 'autoScalingGroup'
let queryTemplate = createQueryTemplate(tableName)
let batchQueryTemplate = createBatchQueryTemplate(tableName)
let actionTempalte = createActionTemplate(tableName)
let batchActionTemplate = createBatchActionTemplate(tableName)

export default {
  batchQuery: batchQueryTemplate(async ({ commit, rootState }, param) => {
    let resp = await api.query(param)
    let uuidList = resp.inventories.map(it => it.uuid)
    let mainMap = arrayToDict(resp.inventories)
    let systemTagResp = await systemTagApi.get(uuidList)
    let systemTagMap = systemTagHelper.normalizeResp(systemTagResp.inventories)
    mainMap = mergeMap(mainMap, systemTagMap)
    // if (rootState.db.common.isAdmin) {
    //   let list = await accountResourceApi.getSharedToPubliceResource(uuidList)
    //   let accountResourceMap = arrayToDict(list)
    //   mainMap = mergeMap(mainMap, accountResourceMap)
    // }
    let vmInstanceResp = await api.queryAutoScalingGroupInstanceByAutoScalingGroupUuidList(uuidList)
    let autoScalingGroupA = {}
    uuidList.forEach(uuid => {
      autoScalingGroupA[uuid] = {
        uuid: uuid,
        healthyVmInstanceNum: 0,
        totalVmInstanceNum: 0,
        vmInstanceUuidList: []
      }
    })
    vmInstanceResp.inventories.forEach(it => {
      // if (!autoScalingGroupA[it.scalingGroupUuid]) {
      //   autoScalingGroupA[it.scalingGroupUuid] = {
      //     uuid: it.scalingGroupUuid,
      //     healthyVmInstanceNum: 0,
      //     totalVmInstanceNum: 0,
      //     vmInstanceUuidList: []
      //   }
      // }
      autoScalingGroupA[it.scalingGroupUuid].vmInstanceUuidList.push(it.instanceUuid)
      autoScalingGroupA[it.scalingGroupUuid].totalVmInstanceNum ++
      if (it.healthStatus === 'Healthy') {
        autoScalingGroupA[it.scalingGroupUuid].healthyVmInstanceNum ++
      }
    })
    mainMap = mergeMap(mainMap, autoScalingGroupA)

    return {
      total: resp.total,
      inventories: mainMap
    }
  }),
  query: queryTemplate(async ({ commit, rootState }, uuid) => {
    let item = await api.queryByUuid(uuid)
    let extraData = await api.queryExtraData(uuid, rootState.db.common.isAdmin)
    helper.queryAutoScalingVmTemplate(uuid, commit)
    helper.getAutoScalingGroupInstance(uuid, commit)
    helper.queryAutoScalingRuleAndAlarmAndEndpoint(uuid, commit)
    helper.queryLoadBalancerAndLoadBalancerListener(uuid, commit)
    // let autoScalingRule = await api.queryAutoScalingRuleByAutoScalingGroupUuid(uuid)
    item = mergeObj(item, extraData)
    // if (autoScalingRule.inventories && autoScalingRule.inventories.length > 0) {
    //   let obj = {
    //     'AddingNewInstanceRule': 'addingNewInstanceRule',
    //     'RemovalInstanceRule': 'removalInstanceRule'
    //   }
    //   for (let i = autoScalingRule.inventories.length - 1; i >= 0; i--) {
    //     let ruleObj = {}
    //     ruleObj[obj[autoScalingRule.inventories[i].type]] = autoScalingRule.inventories[i]
    //     let alarmObj = {}
    //     if (autoScalingRule.inventories[i].ruleTriggers && autoScalingRule.inventories[i].ruleTriggers.length > 0) {
    //       let triggerResp = await api.queryAutoScalingRuleTriggerByTriggerUuid(autoScalingRule.inventories[i].ruleTriggers[0].uuid)
    //       let alarmResp
    //       if (triggerResp.inventories && triggerResp.inventories.length > 0) {
    //         alarmResp = await api.queryAlarmByAlarmUuid(triggerResp.inventories[0].alarmUuid)
    //       }
    //       if (alarmResp.inventories && alarmResp.inventories.length > 0) {
    //         alarmObj.alarmUuid = alarmResp.inventories[0].uuid
    //         alarmObj = mergeObj(alarmObj, alarmResp.inventories[0])
    //         delete alarmObj.uuid
    //       }
    //       ruleObj[obj[autoScalingRule.inventories[i].type]] = mergeObj(ruleObj[obj[autoScalingRule.inventories[i].type]], alarmObj)
    //     }
    //     item = mergeObj(item, ruleObj)
    //   }
    //
    // }
    // let autoScalingRuleTrigger = await api.queryAutoScalingRuleTriggerByAutoScalingGroupUuid(uuid)
    // let alarmUuidList = autoScalingRuleTrigger.results[0].inventories.map(it => it.alarmUuid)
    // let alarmR = await api.queryAlarmByAlarmUuidList(alarmUuidList)
    // let actionUuidList = []
    // if (alarmR.inventories && alarmR.inventories.length > 0) {
    //   let actionObj = {}
    //   for (let i = alarmR.inventories.length - 1; i >= 0; i--) {
    //     if (alarmR.inventories[i].actions && alarmR.inventories[i].actions.length > 0) {
    //       for (let j = alarmR.inventories[i].actions.length - 1; j >= 0; j--) {
    //         if (!actionObj[alarmR.inventories[i].actions[j].actionUuid]) {
    //           actionUuidList.push(alarmR.inventories[i].actions[j].actionUuid)
    //         }
    //         actionObj[alarmR.inventories[i].actions[j].actionUuid] = true
    //       }
    //     }
    //   }
    // }
    // let zwatchEndpoint = await api.querySNSHttpEndpointByConditions([`topics.uuid?=${actionUuidList}`])
    // item = mergeObj(item, {'zwatchEndpoint': zwatchEndpoint.inventories})
    //
    // console.log(item)
    // commit('merge', {
    //   [uuid]: {
    //     uuid,
    //     ...item
    //   }
    // })
    return {
      [uuid]: {
        ...item
      }
    }
  }),
  update: actionTempalte(async (ctx, { param, progressCb }) => {
    let resp = await api.update(param.uuid, param.value, progressCb)
    let objMap = {
      [param.uuid]: resp.inventory
    }
    return emptyPromise(objMap)
  }),
  enable: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param
    let msg = await api.enable(uuid, progressCb)
    return msg.inventory
  }),
  disable: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param
    let msg = await api.disable(uuid, progressCb)
    return msg.inventory
  }),
  create: async ({ commit, state }, { param, progressCb }) => {
    // CreateAutoScalingGroup
    let createAutoScalingGroupMsg = {
      name: param.name,
      description: param.description || undefined,
      scalingResourceType: param.scalingResourceType,
      minResourceSize: param.minResourceSize,
      maxResourceSize: param.maxResourceSize,
      removalPolicy: 'OldestInstance',
      defaultCooldown: param.defaultCooldown || 0,
      defaultEnable: param.defaultEnable,
      systemTags: param.autoScalingSystemTags
    }
    let resp = await api.create(createAutoScalingGroupMsg, progressCb)
    debugger;
    // createAutoScalingVmTemplate
    let createAutoScalingVmTemplateMsg = {
      name: param.name,
      description: param.description || undefined,
      vmInstanceName: param.vmInstanceName,
      vmInstanceDescription: param.vmInstanceDescription || undefined,
      vmInstanceOfferingUuid: param.instanceOfferingUuid,
      imageUuid: param.imageUuid,
      l3NetworkUuids: param.l3NetworkUuids,
      defaultL3NetworkUuid: param.l3NetworkUuid,
      dataDiskOfferingUuids: param.dataDiskOfferingUuids.length > 0 ? param.dataDiskOfferingUuids : undefined,
      securityGroupUuid: param.securityGroupUuid,
      strategy: param.strategy,
      type: param.type,
      systemTags: param.vmTemplateSystemTags
    }
    let vmTemplate = await api.createAutoScalingVmTemplate(createAutoScalingVmTemplateMsg, progressCb)

    // AttachAutoScalingTemplateToGroup
    await api.attachAutoScalingTemplateToGroup(vmTemplate.inventory.uuid, resp.inventory.uuid, progressCb)

    // CreateAutoScalingGroupAddingNewInstanceRule
    let createAutoScalingGroupAddingNewInstanceRuleMsg = {
      autoScalingGroupUuid: resp.inventory.uuid,
      name: param.name,
      description: param.description || undefined,
      cooldown: param.cooldown_add,
      adjustmentType: param.adjustmentType,
      adjustmentValue: param.adjustmentValue_add
    }
    let addingRule = await api.createAutoScalingGroupAddingNewInstanceRule(createAutoScalingGroupAddingNewInstanceRuleMsg, progressCb)

    // CreateAlarm
    console.log('create alarm')
    let createZwatchResourceExpansionStrategyAlarmMsg = {
      namespace: param.namespace,
      metricName: param.metricName_add,
      name: param.name + '-Expansion-Strategy-Alarm',
      description: param.description || undefined,
      period: param.period_add,
      threshold: param.threshold_add,
      repeatInterval: param.repeatInterval_add || undefined,
      comparisonOperator: param.comparisonOperator_add,
      actions: param.actions,
      labels: param.labels,
      type: 'Average'
    }
    let expansionStrategyAlarm = await api.createZwatchResourceAlarm(createZwatchResourceExpansionStrategyAlarmMsg, progressCb)

    // CreateAutoScalingRuleAlarmTrigger
    let createRuleTriggerForAddNewInstanceRuleMsg = {
      name: param.name + '-Expansion-Strategy-Alarm-Rule',
      ruleUuid: addingRule.inventory.uuid,
      alarmUuid: expansionStrategyAlarm.inventory.uuid
    }
    await api.createAutoScalingRuleAlarmTrigger(createRuleTriggerForAddNewInstanceRuleMsg.alarmUuid, createRuleTriggerForAddNewInstanceRuleMsg.ruleUuid, createRuleTriggerForAddNewInstanceRuleMsg, progressCb)

    // CreateAutoScalingGroupRemovalInstanceRule
    let createAutoScalingGroupRemovalInstanceRuleMsg = {
      autoScalingGroupUuid: resp.inventory.uuid,
      name: param.name,
      description: param.description || undefined,
      cooldown: param.cooldown_remove,
      adjustmentType: param.adjustmentType,
      adjustmentValue: param.adjustmentValue_remove,
      removalPolicy: param.removalPolicy
    }
    let removalRule = await api.createAutoScalingGroupRemovalInstanceRule(createAutoScalingGroupRemovalInstanceRuleMsg, progressCb)

    // CreateAlarm
    console.log('create alarm')
    let createZwatchResourceShrinkageStrategyAlarmMsg = {
      namespace: param.namespace,
      metricName: param.metricName_remove,
      name: param.name + '-Shrinkage-Strategy-Alarm',
      description: param.description || undefined,
      period: param.period_remove,
      threshold: param.threshold_remove,
      repeatInterval: param.repeatInterval_remove || undefined,
      comparisonOperator: param.comparisonOperator_remove,
      actions: param.actions,
      labels: param.labels,
      type: 'Average'
    }
    let shrinkageStrategyAlarm = await api.createZwatchResourceAlarm(createZwatchResourceShrinkageStrategyAlarmMsg, progressCb)

    // CreateAutoScalingRuleAlarmTrigger
    let createRuleTriggerForRemovalInstanceRuleMsg = {
      name: param.name + '-Shrinkage-Strategy-Alarm-Rule',
      ruleUuid: removalRule.inventory.uuid,
      alarmUuid: shrinkageStrategyAlarm.inventory.uuid
    }
    return await api.createAutoScalingRuleAlarmTrigger(createRuleTriggerForRemovalInstanceRuleMsg.alarmUuid, createRuleTriggerForRemovalInstanceRuleMsg.ruleUuid, createRuleTriggerForRemovalInstanceRuleMsg, progressCb)
  },
  delete: batchActionTemplate(async (ctx, { param, progressCb }) => {
    let uuid = param
    await api.delete(uuid, progressCb)
    ctx.commit('delete', uuid)
  })
}



// WEBPACK FOOTER //
// ./src/store/modules/autoScalingGroup/actions.js
