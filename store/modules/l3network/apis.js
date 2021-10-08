import rpc from 'src/utils/rpc';
export default{
  query(params){
    return rpc.query('l3-networks', params);
  },
  queryNetworkServiceType(params){
    return rpc.query(`network-services/providers`, params)
  },
  queryL2Network(uuidList) {
   return rpc.query('l2-networks', {
     q: `uuid?=${uuidList.join(',')}`
   })
  },
  queryAccountRefs(params){
    return rpc.query('accounts/resources/refs',params);
  },
  queryAccount(params){
    return rpc.query('accounts', params)
  },
  async queryHypervisorType(resourceUuid, uuid){
    let list = []
    let resp = await rpc.query('hosts', {
      q: `cluster.l2Network.uuid=${uuid}`
    })
    if (resp.inventories.length === 0) return ''
    resp.inventories.forEach((item) => {
      list.push({
        uuid: resourceUuid,
        hypervisorType: item.hypervisorType
      })
    })
    return list
  },
  queryIpAddressCapacity(uuid){
    return rpc.query('ip-capacity',  {
      'l3NetworkUuids': uuid
    })
  },
  queryL3NetWorkDhcpIpAddress(uuid){
    return rpc.query(`system-tags`, {
      q: `resourceUuid=${uuid}`
    })
  },
  queryVirtualRouterOffering(uuid){
    return rpc.query('system-tags', {
      q: ['resourceType=InstanceOfferingVO', `tag=guestL3Network::${uuid}`]
    })
  }
}
