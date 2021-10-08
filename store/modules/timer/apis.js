import rpc from "src/utils/rpc";

export default {
	query(param){
    return rpc.query(`scheduler/triggers`, param);
	},
	querySchedulerJob(){
		return rpc.query('scheduler/jobs');
	},
	queryVolume(){
		return rpc.query('volumes');
	},
	queryVm(){
		return rpc.query('vm-instances');
	},
	delete(uuid, progressCb){
		return rpc._delete(`scheduler/triggers/${uuid}`, null, progressCb)
	},
	create(param,progressCb){
		return rpc.create(`scheduler/triggers`, param, progressCb);
	},
	detailQuery(uuid){
		return rpc.query(`scheduler/triggers/${uuid}`);
	},
  update(uuid, param, progressCb){
    return rpc.update('scheduler/triggers', uuid, {
      'updateSchedulerTrigger': param
    }, progressCb)
  }
}
