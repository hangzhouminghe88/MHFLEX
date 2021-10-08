import api from "./apis";
import Utils from '../../utils';

export default {
  async queryBindings(commit, rpc, rootState, uuid){
    let resp = await api.queryBindings(uuid);
    commit('merge',{
      [uuid]:{
        attachedLdap: resp.total > 0 ? true : false
      }
    })
  },
  async queryUsages(commit, rpc, rootState, uuid){
    let resp = await  api.queryUsages(uuid);
    let volumeNum = resp.usages.filter((i) => i.name === 'volume.data.num')[0].used;
    commit('merge',{
      [uuid]:{
        volumeNum: volumeNum
      }
    })
  },
  async normalQuery(param){
    let realParam = _.cloneDeep(param)
    realParam.replyWithCount = true
    if (param.sortDirection && param.sortBy) {
      realParam.sort = `${param.sortDirection}${param.sortBy}`
    }
    let resp = await api.query(realParam)
    return {
      accountArray: resp.inventories,
      total: resp.total
    }
  },
   getAccountVmTotalNum(accountUuid,accountArray,commit,rpc,rootState){
    let p = null, tasks = [], accountMap = Utils.arrayToDict(accountArray);
    let zql = "count vminstance where type='UserVm' and hypervisorType='KVM' and uuid in (query accountResourceRef.resourceUuid where resourceType='VmInstanceVO' and accountUuid='" + `${accountUuid}` + "')";
    p = api.queryAccountVmTotalNum(zql)
      .then((resp) => {
        let vmNum = 0
        if (resp.results && resp.results.length > 0) {
          vmNum = resp.results[0].total
        }
        commit('merge', {
          [accountUuid]: {
            vmNum: vmNum
          }
        })
      });
    tasks.push(p)
    return Promise.all(tasks)
  },
  async queryVmResource(commit, rootState, uuid) {
    let resp = await api.queryVmResource(uuid);
    let uuidList = _.uniq(resp.inventories.map(item => item.resourceUuid))
    commit('merge', {
      [uuid]: {
        vmNum: (resp.total > 0) ? resp.total : 0,
        vmUuidList: uuidList
      }
    })
  },
  async queryVolumeResource(commit, rootState, uuid) {
    let resp = await api.queryVolumeResource(uuid);
    let uuidList = _.uniq(resp.inventories.map(item => item.resourceUuid))
    let respVolume = await api.queryVolume(uuidList);
    let volumeUuidList = _.uniq(respVolume.inventories.map(item => item.uuid))
    let volumeCount = (respVolume.total > 0) ? respVolume.total : 0
    commit('merge', {
      [uuid]:{
        volumeNum: volumeCount,
        volumeUuidList: volumeUuidList.length >0 ? volumeUuidList : []
      }
    })
  },
  async queryDetailUsages(commit, dispatch, rootState, uuid){
    let resp = await api.queryUsages(uuid);
      let usages = {}
      for (let i = 0; i < resp.usages.length; ++i) {
        usages[`${resp.usages[i].name}.used`] = resp.usages[i].used
        usages[`${resp.usages[i].name}`] = resp.usages[i].total
     }
      commit('merge', {
        [uuid]: {
          usages: usages
        }
      })
  }
}
