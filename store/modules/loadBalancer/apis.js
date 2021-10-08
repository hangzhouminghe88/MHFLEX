import rpc from 'src/utils/rpc';
export default {
  queryLoadBalancerListenerstener(uuidList) {
    return rpc.query('load-balancers/listeners', {
      q: `loadBalancerUuid?=${uuidList.join()}`
    })
  },
  queryVips(uuid){
    return rpc.query(`vips/${uuid}`)
  },
  async query(param){
    return await rpc.query('load-balancers', param)
  }
}
