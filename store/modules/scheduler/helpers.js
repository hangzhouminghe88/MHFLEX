import api from "./apis";

export default {
  async normalQuery(param){
    let realParam = _.cloneDeep(param)
    realParam.replyWithCount = true
    if (param.sortDirection && param.sortBy) {
      realParam.sort = `${param.sortDirection}${param.sortBy}`
    }
    let resp = await api.query(realParam)
    return {
      schedulerArray: resp.inventories,
      total: resp.total
    }
  },
  //查询定时任务资源名以及资源类型
  async queryResources(commit, dispatch, rootState, param){
    let resourceRes = null;
       if(param)
       resourceRes = await api.queryResources({uuids: [`${param.targetResourceUuid}`]});
      if(resourceRes.inventories.length) {
        commit('merge', {
          [param.uuid]: {
            resourceName: resourceRes.inventories[0].resourceName,
            resourceUuid: resourceRes.inventories[0].uuid
          }
        })
      }
  },
  async queryTrigger(commit, dispatch, rootState, param){
    let triggerRes = null;
    triggerRes = await  api.queryTrigger(param.uuid)
      if(triggerRes.inventories.length){
        let resourceName = triggerRes.inventories[0].name;
        let startTime = triggerRes.inventories[0].startTime;
        commit('mergeDbRow', {tableName: 'schedulerA', id: param.uuid, data: triggerRes.inventories[0]}, {root: true})
        commit('merge', {
          [param.uuid]: {
            timerResourceName: resourceName,
            timerStartTime: startTime
          }
        });
        commit('mergeDbRow', {tableName: 'timer', id: triggerRes.inventories[0].uuid, data: triggerRes.inventories[0]}, {root: true})
      }
  },
  async queryEvents(commit, dispatch, rootState, param){
    let eventRes = null;
    if(param)
    eventRes = await api.queryEvents({
      q: `conditions=resourceId=${param.uuid}`,
      limit: 1
    });
      if (eventRes.events.length > 0) {
        let data = eventRes.events[0]
        delete data.resourceName
        commit('merge', {
          [param.uuid]: {
            events:data
          }
        });
      }
  }
}
