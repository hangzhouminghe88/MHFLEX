<template>
    <create-template-no-route>
      <div slot="header">
        <span>
          {{$t('ldapEntry.attachLDAP')}}
        </span>
        <span class="create-back" @click="cancel()"><i class="el-icon-back"></i>回到账户列表</span>
      </div>
      <div slot="body">
        <div class="operation-row">
          <div class="title required">{{$t('ldapEntry.ldapMember')}}</div>
          <div class="network wrapper" v-if="windowData.ldapUidUuidList.length > 0" v-for="uuid in windowData.ldapUidUuidList">
            <add-or-delete-input @open="openAdLdap()" @remove="removeLdapUidList($event, uuid)" :value="dbData.ldapEntry[uuid] && dbData.ldapEntry[uuid].cn"/>
          </div>
          <add-or-delete-input @open="openAdLdap()" @remove="removeLdapUidList($event, uuid)" :class="{'is-error': windowData.emptyldapUidList || windowData.invalidldapUidList}"/>
          <div class="error error-text" v-if="windowData.emptyldapUidList && !windowData.invalidldapUidList">{{$t('ldapEntry.ldapMember')}}{{$t('error.noEmpty')}}</div>
        </div>
      </div>
      <div slot="footer" class="create-footer">
        <div class="btn-confirm" @click="ok()">{{$t('common.ok')}}</div>
        <div class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</div>
      </div>
    </create-template-no-route>
</template>

<script>
    import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";
    import AddOrDeleteInput from "../../../component/AddOrDeleteInput";
    import WindowBase from 'src/windows/Window';
    import {genUniqueId} from 'src/utils/utils';
    import rpc from 'src/utils/rpc';
    export default {
      name: "CreateLdapBinding",
      mixins: [WindowBase],
      components: {AddOrDeleteInput, CreateTemplateNoRoute},
      data(){
        return {
        }
      },
      created(){
        this.deleteAllAssistant()
        let accountUuid = ''
        if (this.param && this.param.accountUuid) {
          accountUuid = this.param.accountUuid
        }
        this.updateWindow({
          accountUuid: accountUuid,
          ldapUid: '',
          ldapUidList: [],
          ldapUidUuidList: [],
          objectclassIsUser: true
        })
        this.queryForAssistant()
      },
      methods: {
        removeLdapUidList: function ($event, uuid) {
          let list = _.cloneDeep(this.windowData.ldapUidUuidList)
          let self = this
          let ldapUidList = []
          let uuidList = list.filter((i) => i !== uuid)
          self.updateWindow({ ldapUidUuidList: uuidList })
          if (uuidList && uuidList.length > 0) {
            uuidList.forEach(uuid => {
              let ldapEntry = _.cloneDeep(self.dbData.ldapEntry[uuid])
              ldapUidList.push(ldapEntry.dn)
            })
          }
          self.updateWindow({ ldapUidList: ldapUidList })
        },
        queryForAssistant () {
          let self = this
          let newAssistant = (resourceName, operation) => {
            let id = `assistant-${genUniqueId()}`
            self.createAssistant({
              id,
              hide: false,
              title: 'ldapServerTitle',
              ownerId: self.windowData.id,
              content: `lackOf${resourceName}`,
              operation,
              handler: () => {
                //self.$router.push('/main/adldapserver')
              }
            })
          }
          rpc.query('ldap/servers', {count: true}).then(resp => {
            if (resp.total === 0) {
              newAssistant('ADLDAPServer', 'add')
            }
          })
        },
        openAdLdap(){
          let self = this;
          let uuidList = _.cloneDeep(self.windowData.ldapUidUuidList)
          let selectedLdapEntry = []
          uuidList.forEach(uuid => {
            let ldapEntry = _.cloneDeep(self.dbData.ldapEntry[uuid])
            selectedLdapEntry.push(ldapEntry.dn.split(',')[0])
          })
          let ldapUidUuidList = []
          let conditionString = ''
          ldapUidUuidList = ldapUidUuidList.concat(selectedLdapEntry)
          ldapUidUuidList = _.uniq(ldapUidUuidList)
          for (let i = ldapUidUuidList.length - 1; i >= 0; i--) {
            conditionString += '(!(' + ldapUidUuidList[i] + '))'
          }
          conditionString = '(&' + conditionString + ')'
          let condition = encodeURIComponent(conditionString)
          self.openDialog('LdapEntryMultiSelectListDlg',{
            conditions: condition,
            conditionString: conditionString,
            select: (ldapUids) => {
              let ldapUidList = []
              ldapUids = ldapUids.concat(_.cloneDeep(self.windowData.ldapUidUuidList))
              ldapUids.forEach(uuid => {
                let ldapEntry = _.cloneDeep(self.dbData.ldapEntry[uuid])
                ldapUidList.push(ldapEntry.dn)
              })
              self.updateWindow({ ldapUidUuidList: ldapUids, ldapUidList: ldapUidList })
            }
          })
        },
        validate (name) {
          let obj = {}
          obj[`empty${name}`] = false
          obj[`invalid${name}`] = false
          if (name === 'ldapUidList' && (this.windowData.ldapUidList.length <= 0)) {
            obj[`empty${name}`] = true
            this.updateWindow(obj)
            return
          }
          this.updateWindow(obj)
        },
        validateAll () {
          let obj = {}
          obj.invalidInput = false
          let props = ['ldapUidList']
          props.forEach(item => this.validate(item))
          let isInvalid = props.some(item => this.windowData[`empty${item}`] || this.windowData[`invalid${item}`])
          if (isInvalid) obj.invalidInput = true
          this.updateWindow(obj)
        },
        cancel () {
          this.deleteAllAssistant()
          this.closeDialog(this.windowId);
          this.$emit('close');
        },
        ok: function () {
          let self = this;
          self.validateAll()
          if (self.windowData.invalidInput) return
          self.createLdapBinding(self.createParam()).then(() => self.queryList())
          self.closeDialog(this.windowId);
          self.$emit('close');
        },
        createParam: function () {
          return {
            accountUuid: this.windowData.accountUuid,
            ldapUidList: this.windowData.ldapUidList
          }
        },
      },
      destroyed(){
        this.deleteAllAssistant()
      },
    }
</script>

<style scoped>

</style>
