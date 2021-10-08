import api from './apis'
import Utils, {arrayToDict} from "../../utils";
import rpc from "../../../src/utils/rpc";
import systemTag from "../systemTag/apis";

export default {
  async normalQuery(param) {
    let realParam = _.cloneDeep(param)
    realParam.replyWithCount = true
    if (param.sortDirection && param.sortBy) {
      realParam.sort = `${param.sortDirection}${param.sortBy}`
    }
    let resp = await api.query(realParam)
    return {
      l3NetworkArray: resp.inventories,
      total: resp.total
    }
  },
  async queryNetworkServiceType(l3NetworkUuidList, commit, rpc, rootState) {
    let resp = await api.queryNetworkServiceType(l3NetworkUuidList)
    let list = _.values(resp.inventories);
    commit('mergeDbTable', {tableName: 'networkServiceType', list: list}, {root: true})
  },
  async queryL2Network(commit, dispatch, rootState ,params) {
    let resp = await api.queryL2Network(params);
    let list = _.values(resp.inventories);
    commit('mergeDbTable', {tableName: 'l2network', list: list}, {root: true})
  },
  async queryHypervisorType(resourceUuid, l2NetworkUuid, commit, dispatch, rootState) {
     let resp = await  api.queryHypervisorType(resourceUuid, l2NetworkUuid), hypervisorTypeMap = {};
    hypervisorTypeMap = arrayToDict(resp)
     commit('merge',{
       [resourceUuid]:  {
         hypervisorType: hypervisorTypeMap[resourceUuid].hypervisorType
       }
     })
  },
  async getIpAddressCapacity(item, commit, dispatch, rootState){
    let resp = await api.queryIpAddressCapacity(item.uuid);
    commit('merge',{
      [item.uuid]: {
        availableCapacity: resp.availableCapacity,
        totalCapacity: resp.totalCapacity
      }
    })
  },
  async getL3NetworkDhcpIpAddress(item, commit, dispatch, rootState){
    let resp = await api.queryL3NetWorkDhcpIpAddress(item.uuid);
    resp.inventories.forEach((item) => {
      if (item.tag.indexOf('DhcpServer::') > -1) {
        let dhcpip = item.tag.split('::')[2]
        commit('merge', {
          [item.uuid]: {
            dhcpip: dhcpip.replace(/--/, '::')
          }
        })
      }
    })
  },
  async getVirtualRouterOffering(item, commit, dispatch, rootState){
    let resp = await api.queryVirtualRouterOffering(item.uuid);
    if (resp.inventories.length > 0) {
      commit('merge', {
        [item.uuid]: {
          virtualRouterOfferingUuid: resp.inventories[0].resourceUuid,
          tagForVirtualRouterOfferingUuid: resp.inventories[0].uuid
        }
      })
    } else {
      commit('merge', {
        [item.uuid]: {
          virtualRouterOfferingUuid: '',
          tagForVirtualRouterOfferingUuid: ''
        }
      })
    }
  },
  getNetworkServiceTypeName(item, commit, dispatch, rootState){
    if (item.networkServices.length === 0) return false
    let networkServices = item.networkServices.filter((item) => item.networkServiceType !== 'SecurityGroup')
    if (networkServices.length === 0) return false
    // let networkServiceProviderUuid = networkServices[0].networkServiceProviderUuid
    let networkServiceProviderUuid = null
    let flag = false // true = vrouter
    let type = ''
    networkServices.forEach(function (it) {
      ((it) => {
        // if (item.networkServiceType === 'Eip') networkServiceProviderUuid = item.networkServiceProviderUuid
        networkServiceProviderUuid = it.networkServiceProviderUuid
        if (rootState.db.networkServiceType[networkServiceProviderUuid]) {
          if (rootState.db.networkServiceType[networkServiceProviderUuid].type === 'vrouter' || rootState.db.networkServiceType[networkServiceProviderUuid].type === 'VirtualRouter') {
            flag = true
            type = 'vrouter'
          }
          if (rootState.db.networkServiceType[networkServiceProviderUuid].type === 'Flat') {
            type = 'Flat'
          }
        }
      })(it)
    })
    if (flag) {
      return 'vrouter'
    } else {
      return type
    }
  }
}
