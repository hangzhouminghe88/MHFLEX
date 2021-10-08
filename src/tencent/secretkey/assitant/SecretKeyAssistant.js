import rpc from 'src/utils/rpc';
import { genUniqueId } from 'src/utils/utils'

export  function  checkAccessKey (that) {
  let self = that;
  let newAssistant = (resourceName, operation) => {
    let id = `assistant-${genUniqueId()}`
    let handler = () => {
      self.$router.push({name: 'createHybridTencentKeySecret'});
    }
    if (operation === 'check') {
      handler = () => {
        self.$router.push({name: 'hybridtencentkeysecret'})
      }
    }
    let params = {
      id,
      title: 'accountKeyTitle',
      content: resourceName,
      operation,
      hide: false,
      handler
    }
    self.newGlobalAssistant(params, 'Hybrid')
  }
  return rpc.query('/hybrid/tencent/key', {
    replyWithCount: true,
  }).then(resp => {
    if (resp.total === 0) {
      self.deleteGlobalAssistant('Hybrid')
      newAssistant(`lackOfHybridTencenKeySecret`, 'add')
      return
    }
    let count = 0
    for (let i = resp.inventories.length - 1; i >= 0; i--) {
      if (resp.inventories[i].current === 'false') {
        count++
      }
    }
    if (count === resp.inventories.length) {
      newAssistant('disabledHybridTencentKeySecret', 'check')
      return
    }
    self.deleteGlobalAssistant('Hybrid')
  })
}
