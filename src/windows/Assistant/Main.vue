<script>
import rpc from 'src/utils/rpc'
import DataCenterMethods from 'src/windows/HybridDataCenter/List'
import HybridIdentityZoneMethods from 'src/windows/HybridIdentityZone/List'
import HybridAliyunKeySecretMethods from 'src/windows/HybridAliyunKeySecret/Methods'

export default {
  name: 'AssistantForMainPage',
  methods: {
    ...{
      createDataCenter: DataCenterMethods.methods.create,
      createHybridIdentityZone: HybridIdentityZoneMethods.methods.create,
      createHybridAliyunKeySecret: HybridAliyunKeySecretMethods.methods.create
    },
    queryLicenseAssistant () {
      const self = this
      const license = self.dbData.common.license
      function newAssistant (getContent, operation) {
        let handler = () => {
          let path = '/main/about'
          if (self.routerData.path.indexOf('hybrid') > -1) {
            path = '/main/hybridabout'
          }
          self.$router.push(path)
        }
        if (operation === 'known') {
          handler = () => {
            self.deleteGlobalAssistant('License')
          }
        }
        let obj = {
          data: {
            id: `assistant-${self.genUniqueId()}`,
            getTitle: () => { return self.$t('assistant.licenseTitle') },
            getContent
          },
          controller: {
            name: operation,
            handler
          }
        }
        self.newGlobalAssistant(obj, 'License')
      }
      let getContent = null
      if (license.expired) {
        getContent = () => { return self.$t('assistant.expired') }
        newAssistant(getContent, 'skipTo')
        return
      }
      let expiredMillionSeconds = new Date(license.expiredDate).getTime()
      let dayDifference = Math.ceil((expiredMillionSeconds - this.currTimeMillion) / (1000 * 60 * 60 * 24))
      if (dayDifference <= 14) {
        getContent = () => { return self.$t(`assistant.willBeExpired`, {dayCount: dayDifference}) }
        newAssistant(getContent, 'known')
      }
    },
    syncDataCenter: function () {
      const self = this
      let newAssistant = (resourceName, operation) => {
        let obj = {
          data: {
            id: `assistant-${self.genUniqueId()}`,
            getTitle: () => { return self.$t('assistant.syncDataTitle') },
            ownerId: self.windowData.id,
            getContent: () => { return self.$t(`assistant.${resourceName}`) }
          },
          controller: {
            name: operation,
            handler: () => {
              self.openFullMainWindow(`Add${resourceName}Dlg`, {
                ok: (param) => {
                  self[`create${resourceName}`](param)
                  .then(() => {
                    self.syncDataCenter()
                  })
                },
                cancel: () => {
                  this.syncDataCenter()
                }
              })
            }
          }
        }
        self.addAssistantItem(obj)
      }
      rpc.query('hybrid/hybrid/key', {count: true}).then(resp => {
        if (resp.total === 0) {
          newAssistant('HybridAliyunKeySecret', 'add')
        }
      })
      rpc.query('hybrid/hybrid/key', {
        q: ['current=true', 'type=aliyun']
      }).then((resp) => {
        if (resp.inventories.length === 1) {
          rpc.query('system-tags', {
            q: ['resourceType=DataCenterVO', `tag=accesskey::${resp.inventories[0].akey}`]
          }).then((resp) => {
            if (resp.inventories.length === 0) {
              newAssistant('HybridIdentityZone', 'add')
              return
            } else {
              let datacenterUuidList = resp.inventories.map((item) => item.resourceUuid)
              rpc.query('hybrid/identity-zone', {
                q: `dataCenterUuid?=${datacenterUuidList}`
              })
              .then((resp) => {
                if (resp.inventories.length === 0) {
                  newAssistant('HybridIdentityZone', 'add')
                  return
                }
                let tasks = []
                let q = null
                let event = self.createEvent('common.update', null, datacenterUuidList.length)
                datacenterUuidList.forEach(function (uuid) {
                  ((uuid) => {
                    q = rpc.put(`hybrid/data-center/${uuid}/sync`, null, event)
                    .then(() => {
                      self.incEventSuccess(event)
                      self.refreshList()
                    }, () => {
                      self.incEventFail(event)
                    })
                    tasks.push(q)
                  })(uuid)
                })
                return Promise.all(tasks)
              })
            }
          })
        }
      })
    }
  }
}
</script>


// WEBPACK FOOTER //
// Main.vue?1c423898