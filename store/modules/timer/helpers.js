import api from './apis';
export default {
	async basicQuery(param){
		let realParam = _.cloneDeep(param)
    realParam.replyWithCount = true
    if (param.sortDirection && param.sortBy) {
      realParam.sort = `${param.sortDirection}${param.sortBy}`
    }
    let resp = await api.query(realParam)
    return {
      timerArray: resp.inventories,
      total: resp.total
    }
	},
	async querySchedulerJob(commit, dispatch, rootState){
		let resp = await api.querySchedulerJob();
		commit('mergeDbTable', {tableName: 'scheduler', list: resp.inventories}, {root: true})
	},
	async queryVolume(commit, dispatch, rootState){
		let resp = await api.queryVolume();
		commit('mergeDbTable', {tableName: 'volume', list: resp.inventories}, {root: true})
	},
	async queryVm(commit, dispatch, rootState){
		let resp = await api.queryVm();
		commit('mergeDbTable', {tableName: 'vm', list: resp.inventories}, {root: true})
	}
}
