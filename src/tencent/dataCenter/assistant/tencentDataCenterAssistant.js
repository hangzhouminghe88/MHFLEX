import {genUniqueId} from 'src/utils/utils';
import rpc from 'src/utils/rpc';

export function checkHybridTencentDataCenterAssistant(self) {
  let newAssistant = (resourceName, operation) => {
    let id = `assistant-${genUniqueId()}`
    let content = `lackOf${resourceName}`
    let hide
    let handler = () => {
      self.$router.push({name: 'createHybridTencentDataCenter'})
    }
    hide = false
    if (operation === 'check' && resourceName === 'HybridTencentKeySecret') {
      content = `disabled${resourceName}`
      handler = () => {
        this.$router.push({name: 'hybridtencentkeysecret'})
        content = `disabled${resourceName}`
      }
    }
    self.createAssistant({
      id,
      hide,
      operation,
      title: 'iZoneTitle',
      ownerId: self.windowData.id,
      content: content,
      handler
    })
  }

  rpc.query('hybrid/tencent/key', {
    count: true,
  }).then(resp => {
    if (resp.total === 0) {
      newAssistant('HybridTencentKeySecret', 'add')
    } else {
      rpc.query('hybrid/tencent/key', {
        q: ['current=true']
      })
        .then((resp) => {
          if (resp.inventories.length === 0) newAssistant('HybridTencentKeySecret', 'check')
        })
    }
  })

  rpc.query('hybrid/tencent/key', {
    q: ['current=true']
  }).then((resp) => {
    if (resp.inventories.length === 1) {
      rpc.query('system-tags', {
        q: ['resourceType=TencentDataCenterVO', `tag=accesskey::${resp.inventories[0].secretId}`]
      }).then((resp) => {
        if (resp.inventories.length === 0) {
          newAssistant('HybridTencentDataCenter', 'add')
        }
      })
    }
  })
}
