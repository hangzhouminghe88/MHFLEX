<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Utils from 'src/utils/utils'
  let justUpdateResource = false
  export default {
    methods: {
      delete (uuidList, fn) {
        const self = this
        let event = self.createEvent('adLdapServer.action.delete', uuidList.length === 1 ? self.dbData.adLdapServer[uuidList[0]].server : '', uuidList.length)
        let tasks = []
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let p = rpc._delete(`ldap/servers/${uuid}`, null, event)
              .then((resp) => {
                if (fn) fn()
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      add: async function (param) {
        let event = this.createEvent('ldap.action.save')
        let obj = {
          name: param.name,
          description: param.description,
          username: param.username,
          url: param.url,
          encryption: param.encryption,
          base: param.base,
          password: param.password,
          systemTags: []
        }
        if (param.LdapServerTypeIsAD) {
          obj.systemTags.push('ldapServerType::WindowsAD')
        } else {
          obj.systemTags.push('ldapServerType::OpenLdap')
        }
        if (param.ldapUseAsLoginName) {
          obj.systemTags.push(`ldapUseAsLoginName::${param.ldapUseAsLoginName}`)
        } else {
          obj.systemTags.push(`ldapUseAsLoginName::cn`)
        }
        let resp
        try {
          resp = await rpc.create('ldap/servers', obj, event)
          this.incEventSuccess(event)
        } catch (e) {
          this.incEventFail(event)
          return
        }

        this.updateDbTable({
          tableName: 'adLdapServer',
          list: [resp.inventory]
        })
        let uuidList = []
        let table = {}
        let row = {}
        row[resp.inventory.uuid] = {}
        row[resp.inventory.uuid].selected = false
        if (this.windowData.uuidList) {
          uuidList = this.windowData.uuidList.slice()
          uuidList.unshift(resp.inventory.uuid)
          table = Object.assign({}, { ...this.windowData.table }, row)
          this.updateCount()
        }
        this.updateWindow({ uuidList, table })
        if (param.ldapCleanBindingFilter !== '') {
          rpc.put(`ldap/servers/${resp.inventory.uuid}`, {
            'updateLdapServer': { systemTags: [`ldapCleanBindingFilter::${param.ldapCleanBindingFilter}`] }
          })
        }
        return resp.inventory.uuid
      },
      updateCount: function () {
        rpc.query('ldap/servers', {
          replyWithCount: true
        })
          .then((resp) => {
            this.updateWindow({
              availableCount: resp.total
            })
          })
      },
      updateLdapCleanBindingFilter: function (uuidList, ldapCleanBindingFilter) {
        if (justUpdateResource) return
        justUpdateResource = true
        setTimeout(() => {
          justUpdateResource = false
        }, 100)
        const self = this
        let tasks = []
        let p = null
        uuidList.forEach(uuid => {
          if ((self.dbData.adLdapServer[uuid].ldapCleanBindingFilter === ldapCleanBindingFilter) || (ldapCleanBindingFilter === '' && self.dbData.adLdapServer[uuid].ldapCleanBindingFilter === undefined)) return
          p = rpc.query('system-tags', {
            q: [`resourceUuid=${uuid}`, 'resourceType=LdapServerVO', `tag~=ldapCleanBindingFilter::%25`],
            fields: 'uuid'
          }).then(resp => {
            let event = self.createEvent('common.updateLdapCleanBindingFilter', uuidList.length)
            let task = null
            if (resp.inventories.length === 0) {
              task = rpc.create('system-tags', {
                resourceType: 'LdapServerVO',
                resourceUuid: uuid,
                tag: `ldapCleanBindingFilter::${ldapCleanBindingFilter}`
              }, event)
            } else {
              if (ldapCleanBindingFilter === '') {
                task = rpc._delete(`tags/${resp.inventories[0].uuid}`, null, event)
              } else {
                task = rpc.update('system-tags', `${resp.inventories[0].uuid}`, {
                  updateSystemTag: {
                    tag: `ldapCleanBindingFilter::${ldapCleanBindingFilter}`
                  }
                }, event)
              }
            }
            return task.then(() => {
              self.incEventSuccess(event)
              let adLdapServer = _.cloneDeep(self.dbData.adLdapServer[uuid])
              adLdapServer.ldapCleanBindingFilter = ldapCleanBindingFilter
              return self.updateDbRow({
                tableName: 'adLdapServer',
                id: uuid,
                data: adLdapServer
              })
            }, () => {
              self.incEventFail(event)
            })
          })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      getAdLdapServer: function (uuid) {
        const self = this
        let value
        try {
          value = self.dbData.adLdapServer[uuid].server
          if (value === undefined) throw new Error('error')
        } catch (e) {
          if (self.checkBounce(`getAdLdapServer-${uuid}`)) return ''
          value = ''
          let adLdapServer = _.cloneDeep(self.dbData.adLdapServer[uuid])
          adLdapServer.server = adLdapServer.url.split('//')[1].split(':')[0]
          return rpc.query('system-tags', {
            q: [`resourceUuid=${uuid}`, 'resourceType=LdapServerVO']
          }).then((respSystemTag) => {
            for (let i = respSystemTag.inventories.length - 1; i >= 0; i--) {
              if (respSystemTag.inventories[i].tag.indexOf('WindowsAD') !== -1) {
                adLdapServer.server = adLdapServer.server + ' (AD)'
                break
              }
              if (respSystemTag.inventories[i].tag.indexOf('OpenLdap') !== -1) {
                adLdapServer.server = adLdapServer.server + ' (LDAP)'
                break
              }
            }
            self.forceUpdateDbRow({
              tableName: 'adLdapServerSystemTag',
              id: uuid,
              data: respSystemTag.inventories
            })
            return self.updateDbRow({
              tableName: 'adLdapServer',
              id: uuid,
              data: adLdapServer
            })
          }).then(() => self.$nextTick(self.$forceUpdate))
        }
        return value
      },
      getAdLdapServerPort: function (uuid) {
        const self = this
        let value
        value = self.dbData.adLdapServer[uuid].url.split('//')[1].split(':')[1]
        return value
      },
      getAdLdapServerUseAsLoginName: function (uuid) {
        const self = this
        let value
        try {
          value = self.dbData.adLdapServer[uuid].ldapUseAsLoginName
          if (value === undefined) throw new Error('error')
        } catch (e) {
          if (self.checkBounce(`getAdLdapServerUseAsLoginName-${uuid}`)) return ''
          value = ''
          let adLdapServer = _.cloneDeep(self.dbData.adLdapServer[uuid])
          return rpc.query('system-tags', {
            q: [`resourceUuid=${uuid}`, 'resourceType=LdapServerVO']
          }).then((respSystemTag) => {
            for (let i = respSystemTag.inventories.length - 1; i >= 0; i--) {
              if (respSystemTag.inventories[i].tag.indexOf('ldapUseAsLoginName::') !== -1) {
                adLdapServer.ldapUseAsLoginName = respSystemTag.inventories[i].tag.split('::')[1]
                break
              }
            }
            self.forceUpdateDbRow({
              tableName: 'adLdapServerSystemTag',
              id: uuid,
              data: respSystemTag.inventories
            })
            return self.updateDbRow({
              tableName: 'adLdapServer',
              id: uuid,
              data: adLdapServer
            })
          }).then(() => self.$nextTick(self.$forceUpdate))
        }
        return value
      },
      getAdLdapServerLdapCleanBindingFilter: function (uuid) {
        const self = this
        let value = ''
        try {
          value = self.dbData.adLdapServer[uuid].ldapCleanBindingFilter
          if (value === undefined) throw new Error('error')
        } catch (e) {
          if (self.checkBounce(`getAdLdapServerLdapCleanBindingFilter-${uuid}`)) return ''
          value = ''
          let adLdapServer = _.cloneDeep(self.dbData.adLdapServer[uuid])
          rpc.query('system-tags', {
            q: [`resourceUuid=${uuid}`, 'resourceType=LdapServerVO', 'tag~=ldapCleanBindingFilter::%25']
          }).then((respSystemTag) => {
            if (respSystemTag.inventories.length <= 0) return ''
            adLdapServer.ldapCleanBindingFilter = respSystemTag.inventories[0].tag.split('::')[1]
            self.forceUpdateDbRow({
              tableName: 'adLdapServerSystemTag',
              id: uuid,
              data: respSystemTag.inventories
            })
            return self.updateDbRow({
              tableName: 'adLdapServer',
              id: uuid,
              data: adLdapServer
            })
          }).then(() => self.$nextTick(self.$forceUpdate))
        }
        return value
      },
      sync: function () {
        let event = this.createEvent('ldap.action.sync')
        rpc.put('ldap/bindings/actions', {
          cleanInvalidLdapBinding: {}
        }, event).then((resp) => {
          this.incEventSuccess(event)
        }, () => this.incEventFail(event))
      },
      test: function (uuidList) {
        const self = this
        if (!uuidList || uuidList.length <= 0) return
        let event = self.createEvent('ldap.action.test')
        let tasks = []
        let p = null
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            let msg = {}
            msg.systemTags = ['ephemeral::validationOnly']
            p = rpc.query(`ldap/servers/${uuid}`)
              .then((resp) => {
                if (resp.inventories.length > 0) {
                  msg.name = resp.inventories[0].name
                  msg.description = resp.inventories[0].description
                  msg.username = resp.inventories[0].username
                  msg.url = resp.inventories[0].url
                  msg.encryption = resp.inventories[0].encryption
                  msg.base = resp.inventories[0].base
                  msg.password = resp.inventories[0].password
                }
              })
            tasks.push(p)
            // p = rpc.query('system-tags', {
            //   q: [`resourceUuid=${uuid}`, 'resourceType=LdapServerVO']
            // }).then((resp) => {
            //   if (resp.inventories.length > 0) {
            //     resp.inventories.forEach(function (item) {
            //       msg.systemTags.push(item.tag)
            //     })
            //   }
            // })
            // tasks.push(p)
            Promise.all(tasks)
              .then(() => {
                rpc.create('ldap/servers', msg, event)
                  .then((resp) => {
                    self.incEventSuccess(event)
                  }, () => self.incEventFail(event))
              })
          })(uuid)
        })
      },
      refresh: function (uuid) {
        this.updateWindow({
          currItemUuid: ''
        })
        this.queryList()
      },
      ...Utils
    }
  }
</script>

