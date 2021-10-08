import rpc from 'src/utils/rpc';

export default {
  basicQuery(param){
    return rpc.query('consoles/agents', param);
  },
  reconnect(uuid, progressCb){
    return rpc.put('consoles/agents', {
      reconnectConsoleProxyAgent: {
        agentUuids: uuid
      }
    }, progressCb)
  },
  setConsoleProxy(uuid, ip, progressCb){
    return rpc.update('consoles/agents', uuid, {
      updateConsoleProxyAgent: {
        consoleProxyOverriddenIp: ip
      }
    }, progressCb)
  }
}
