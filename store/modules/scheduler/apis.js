import rpc from 'src/utils/rpc';
export default {
  query(param){
    return rpc.query(`scheduler/jobs`, param);
  },
  queryResources(param){
    return rpc.query('resources/names', param);
  },
  queryTrigger(uuid){
    return rpc.query('scheduler/triggers', {
      q: `job.uuid=${uuid}`
    });
  },
  queryEvents(param){
    return rpc.query('zwatch/events', param);
  },
  enabledScheduler(uuid, progressCb){
    return rpc.put(`schedulers/${uuid}`, {
      'changeSchedulerState': {
       'stateEvent': 'enable'
      }
    },progressCb);

  },
  disabledScheduler(uuid, progressCb){
    return rpc.put(`schedulers/${uuid}`, {
      'changeSchedulerState': {
        'stateEvent': 'disable'
      }
    },progressCb);
  },
  deleteScheduler(uuid, progressCb){
    return rpc._delete(`scheduler/jobs/${uuid}`, null, progressCb);
  },
  detachScheduler(uuid, triggerUuid, progressCb){
    return rpc._delete(`scheduler/jobs/${uuid}/scheduler/triggers/${triggerUuid}`, null, progressCb);
  },
  attachTimer(uuid, triggerUuid, progressCb){
    return rpc.create(`scheduler/jobs/${uuid}/scheduler/triggers/${triggerUuid}`, null, progressCb);
  },
  create (msg, progressCb) {
    return rpc.create('scheduler/jobs', msg, progressCb);
  },
  queryByUuid(uuid){
    return rpc.query(`scheduler/jobs/${uuid}`);
  },
  update(uuid, param, progressCb){
    return rpc.update('scheduler/jobs', uuid, {
      "updateSchedulerJob": param
    }, progressCb);
  }
}
