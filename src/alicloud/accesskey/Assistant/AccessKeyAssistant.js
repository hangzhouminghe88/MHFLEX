import rpc from 'src/utils/rpc';
import { genUniqueId } from 'src/utils/utils'

export  function  checkAccessKey (type, that) {
  let self = that;
  let newAssistant = (resourceName, operation) => {
    let id = `assistant-${genUniqueId()}`
    let handler = () => {
      self.$router.push({name: 'createHybridkeysecret', params: {type: type}});
    }
    if (operation === 'check') {
      handler = () => {
        self.$router.push({name: 'hybridkeysecret', params: {type: type}})
      }
    }
    let params = {
      id,
      title: 'accessKeyTitle',
      content: resourceName,
      operation,
      hide: false,
      handler
    }
    self.newGlobalAssistant(params, 'Hybrid')
  }
  return rpc.query('hybrid/hybrid/key', {
    replyWithCount: true,
    q: `type=${type}`
  }).then(resp => {
    if (resp.total === 0) {
      self.deleteGlobalAssistant('Hybrid')
      newAssistant(`lackOfHybrid${type.replace(/\b^[a-zA-Z]/, (item) => {
        return item.toUpperCase();
      })}KeySecret`, 'add')
      return
    }
    let count = 0
    for (let i = resp.inventories.length - 1; i >= 0; i--) {
      if (resp.inventories[i].current === 'false') {
        count++
      }
    }
    if (count === resp.inventories.length) {
      newAssistant('disabledAliyunKeySecret', 'check')
      return
    }
    self.deleteGlobalAssistant('Hybrid')
  })
}
