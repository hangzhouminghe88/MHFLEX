<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import Utils from 'src/utils/utils'
  import sha512 from 'crypto-js/sha512'
  let justUpdateResource = false;
  import {mapGetters, mapState} from 'vuex';
  export default {
    name: 'AccountMethods',
    computed: {
      ...mapGetters({
        get: 'account/getList'
      }),
      ...mapState({
        account: state => state.account
      }),
    },
    methods: {
      getCondition: function () {
        let conditionList = []
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },
      queryList: function () {
        let self = this;
        this.windowData.loading = true;
        return self.dispatchAction('account/query', {
          start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
            limit: self.windowData.pageSize,
            replyWithCount: true,
            q: self.getCondition(),
            sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`
        }).then((resp)=>{
          return this.updateWindow({
            uuidList: resp.uuidList,
            table: Utils.createTableObjFromUuidList(resp.uuidList),
            total: resp.total
          })
        }).then(() =>{
          this.windowData.loading = false;
          setTimeout(() => {
            self.itemList = self.get(self.windowData.uuidList);
          }, 100)
        })
      },
      create: function (param) {
        let  self = this,event = self.createEvent('account.action.create', param.name)
        rpc.create('accounts', param, event)
          .then(() => {
            self.queryList()
            self.incEventSuccess(event)
          }, () => self.incEventFail(event))
      },
      delete: function (uuidList, fn) {
        const self = this
        return self.dispatchActionWithEvent('account/delete', uuidList).then(() => {
          self.queryList();
        })
      },
      changePassword: function (accountUuid) {
        // if (this.dbData.account) await this.queryIdentity()
        let self = this;
        console.log(self.account[accountUuid].name)
        this.openDialog('ModifyPasswordDlg', {
          accountName: self.account[accountUuid].name,
          ok: (msg) => {
            let event = self.createEvent('account.action.changePassword', self.account[accountUuid].name, 1)
            rpc.put(`accounts/${accountUuid}`, {
              updateAccount: {
                password: sha512(msg).toString()
              }
            }, event)
              .then((resp) => {
                this.incEventSuccess(event)
                if (resp.success === false) return
              }, () => {
                this.incEventFail(event)
              })
          }
        })
      },
      createLadpBind: function (accountUuid, ldapUid) {
        let self = this
        let event = self.createEvent('account.action.attachLdap', self.dbData.account[accountUuid].name)
        return rpc.post('ldap/bindings', {
          '': {
            accountUuid: accountUuid,
            ldapUid: ldapUid
          }
        }, event)
          .then((resp) => {
            self.incEventSuccess(event)
          }, () => self.incEventFail(event))
      },
      createLdapBinding: function (params) {
        const self = this
        let event = self.createEvent('account.action.attachLdap', self.dbData.account[params.accountUuid].name, params.ldapUidList.length)
        let tasks = []
        let p = null
        params.ldapUidList.forEach(function (ldapUid) {
          ((ldapUid) => {
            let msg = {}
            msg.accountUuid = params.accountUuid
            msg.ldapUid = ldapUid
            p = rpc.post('ldap/bindings', { '': msg }, event)
              .then((resp) => {
                self.incEventSuccess(event)
              }, () => self.incEventFail(event))
            tasks.push(p)
          })(ldapUid)
        })
        return Promise.all(tasks)
      },
      deleteLdapBinding: function (accountUuid, uuidList) {
        const self = this
        let account = _.cloneDeep(this.dbData.account[accountUuid])
        let event = self.createEvent('account.action.detachLdap', uuidList.length === 1 ? account.name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc._delete(`ldap/bindings/${uuid}`, null, event)
              .then((resp) => {
                self.incEventSuccess(event)
              }, () => self.incEventFail(event))
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      genAssistantIfNoLdap: async function () {
        let self = this
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${self.genUniqueId()}`
          self.createAssistant({
            id,
            title: 'accountTitle',
            operation,
            hide: false,
            ownerId: self.windowData.id,
            content: `lackOf${resourceName}`,
            handler: () => {
              self.openFullMainWindow('AddAdLdapServerDlg',
                {
                  ok: (param) => {
                    self['AddAdLdapServerDlg'](param)
                      .then(() => {
                      }, () => {
                        self.queryForAssistant()
                      })
                  },
                  cancel: () => {
                    self.queryForAssistant()
                  }
                }
              )
              // return self.$router.push('/main/adldapserver')
            }
          })
        }
        let resp = await rpc.query('ldap/servers', {count: true})
        if (resp.total === 0) {
          newAssistant('LDAP', 'add')
          return false
        }
        return true
      },
      deleteLadpBind: function (accountUuid) {
        let self = this
        let account = _.cloneDeep(this.dbData.account[accountUuid])
        let event = self.createEvent('account.action.detachLdap', account.name)
        return rpc._delete(`ldap/bindings/${account.ldap.uuid}`, null, event)
          .then((resp) => {
            delete self.dbData.account[accountUuid]
            delete account.ldap
            self.updateDbRow({
              tableName: 'account',
              id: account.uuid,
              data: account
            })
            self.incEventSuccess(event)
          }, () => self.incEventFail(event))
      },
      updateResources: function (resourceType, actionName, propName, tabName, value) {
        if (justUpdateResource) return
        justUpdateResource = true
        setTimeout(() => {
          justUpdateResource = false
        }, 100)
        let obj = {}
        let self = this
        if (propName === 'name' && !String(value).trim()) return
        if (this.dbData[tabName][this.windowData.dataUuid][propName] === value) return
        obj[actionName] = {}
        obj[actionName][propName] = value
        let event = self.createEvent('common.updateInfo', self.$t('common.' + propName))
        rpc.put(`${resourceType}/${this.windowData.dataUuid}`, obj, event)
          .then((resp) => {
            self.incEventSuccess(event)
            this.updateDbRow({
              tableName: tabName,
              id: self.windowData.dataUuid,
              data: resp.inventory
            })
          }, () => self.incEventFail(event))
      },
      updateCount: function () {
        rpc.query('accounts', {
          replyWithCount: true,
          q: this.getCondition(),
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
        })
          .then((resp) => {
            this.updateWindow({
              availableCount: resp.total
            })
          })
      },
      pageDeleteLdapBinding: function (accountUuid) {
        let self = this
        if (!accountUuid) return
        self.openDialog('LdapEntryMultiSelectListDlg', {
          conditions: [`accountUuid=${accountUuid}`],
          select: (ldapUidList) => {
            self.openDialog('ConfirmDlg', {
              title: 'ldap.detach',
              description: 'ldap.info.detachConfirm',
              icon: 'account_popupico',
              getName(uuid){
                return dbData.ldapBinding[uuid].ldapUid
              },
              uuidList: ldapUidList,
              accountUuid: accountUuid,
              ok: () => {
                self.deleteLdapBinding(accountUuid, ldapUidList).then(() => self.queryList())
              }
            })
          }
        })
      },
      ...Utils
    }
  }
</script>

