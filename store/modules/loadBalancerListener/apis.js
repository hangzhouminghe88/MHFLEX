import rpc from 'src/utils/rpc';
export default {
  query(param){
    return rpc.query('load-balancers/listeners', param);
  },
  queryNics(uuid){
    return rpc.query('vm-instances/nics', {
      q: `loadBalancerListener.uuid=${uuid}`,
      fields: 'ip'
    })
  },
  queryMetric(uuidList){
    return rpc.query('zwatch/metrics', {
      namespace: 'ZStack/LoadBalancer',
      metricName: 'LoadBalancerBackendStatus',
      offsetAheadOfCurrentTime: 1,
      labels: [`ListenerUuid=~${uuidList.join('%7C')}`]
    })
  }
}
