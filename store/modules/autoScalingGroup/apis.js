import rpc from 'src/utils/rpc'
import _ from 'lodash'

export default {
  async query (param) {
    return await rpc.query('autoscaling/groups', param)
  },
  async queryByUuid (uuid) {
    let resp = await rpc.query(`autoscaling/groups/${uuid}`)
    return resp.inventories[0]
  },
  async queryExtraData (uuid, isAdmin) {
    let respSystemTags = await rpc.query('system-tags', {
      q: `resourceUuid=${uuid}`
    })

    let objA = {}
    respSystemTags.inventories.forEach((item) => {
      let val = item.tag.split('::')
      objA[val[0]] = val[1]
    })
    return objA
  },
  queryAutoScalingVmTemplateByAutoScalingGroupUuid (autoScalingGroupUuid) {
    return rpc.query('autoscaling/vmtemplate', {
      q: `autoScalingGroup.uuid=${autoScalingGroupUuid}`
    })
  },
  queryAutoScalingGroupInstanceByAutoScalingGroupUuidList (autoScalingGroupUuidList) {
    if (!autoScalingGroupUuidList) return
    if (!_.isArray(autoScalingGroupUuidList)) {
      autoScalingGroupUuidList = [autoScalingGroupUuidList]
    }
    return rpc.query('autoscaling/groups/instances', {
      q: `scalingGroupUuid?=${autoScalingGroupUuidList}`
    })
  },
  queryAutoScalingRuleByAutoScalingGroupUuid (autoScalingGroupUuid) {
    return rpc.query('autoscaling/groups/rules', {
      q: `scalingGroupUuid=${autoScalingGroupUuid}`
    })
  },
  queryAutoScalingRuleTriggerByTriggerUuid (triggerUuid) {
    return rpc.query('autoscaling/groups/rules/trigger', {
      q: `uuid=${triggerUuid}`
    })
  },
  queryAutoScalingRuleTriggerByAutoScalingGroupUuid (autoScalingGroupUuid) {
    let zql = "query AutoScalingRuleTrigger where ruleUuid in (query AutoScalingRule.uuid where scalingGroupUuid='" + `${autoScalingGroupUuid}` + "')"
    return rpc.query('/zql', {
      zql: encodeURIComponent(zql)
    })
  },
  queryAlarmByAlarmUuid (alarmUuid) {
    return rpc.query('zwatch/alarms', {
      q: `uuid=${alarmUuid}`
    })
  },
  queryAlarmByAlarmUuidList (alarmUuidList) {
    return rpc.query('zwatch/alarms', {
      q: `uuid?=${alarmUuidList}`
    })
  },
  querySNSHttpEndpointByConditions (conditions) {
    if (!conditions) return
    if (!_.isArray(conditions)) {
      conditions = [conditions]
    }
    return rpc.query('sns/application-endpoints', {
      q: conditions
    })
  },
  update (uuid, obj, progressCb) {
    return rpc.update('autoscaling/groups', uuid, {
      'updateAutoScalingGroup': obj
    }, progressCb)
  },
  enable (uuid, progressCb) {
    return rpc.update('autoscaling/groups', uuid, {
      'changeAutoScalingGroupState': {
        'stateEvent': 'enable'
      }
    }, progressCb)
  },
  disable (uuid, progressCb) {
    return rpc.update('autoscaling/groups', uuid, {
      'changeAutoScalingGroupState': {
        'stateEvent': 'disable'
      }
    }, progressCb)
  },
  create (msg, progressCb) {
    return rpc.create('autoscaling/groups', msg, progressCb)
  },
  createAutoScalingVmTemplate (msg, progressCb) {
    return rpc.create('autoscaling/vmtemplate', msg, progressCb)
  },
  attachAutoScalingTemplateToGroup (vmtemplateUuid, groupUuid, progressCb) {
    return rpc.create(`autoscaling/template/${vmtemplateUuid}/groups/${groupUuid}`, null, progressCb)
  },
  createAutoScalingGroupAddingNewInstanceRule (msg, progressCb) {
    return rpc.create('autoscaling/rules/adding-new-instance', msg, progressCb)
  },
  createAutoScalingGroupRemovalInstanceRule (msg, progressCb) {
    return rpc.create('autoscaling/rules/removal-instance', msg, progressCb)
  },
  createZwatchResourceAlarm (msg, progressCb) {
    return rpc.create('zwatch/alarms', msg, progressCb)
  },
  createAutoScalingRuleAlarmTrigger (alarmUuid, ruleUuid, msg, progressCb) {
    return rpc.create(`zwatch/alarms/${alarmUuid}/autoscaling/rules/${ruleUuid}`, msg, progressCb)
  },
  delete (uuid, progressCb) {
    return rpc._delete(`autoscaling/groups/${uuid}`, null, progressCb)
  }
}



// WEBPACK FOOTER //
// ./src/store/modules/autoScalingGroup/apis.js