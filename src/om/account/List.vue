<script>
  import Methods from 'src/om/account/Methods'
  import rpc from 'src/utils/rpc';
  import sha512 from 'crypto-js/sha512';

  export default {
    mixins: [Methods],
    name: 'AccountList',
    created: function () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: ''
      })
    },
    watch: {
      'windowData.pageSize': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList() // skip init status
      },
      'windowData.pageIndex': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList() // skip init status
      }
    },
    methods: {
      pageCreateLdapBinding: async function () {
        let self = this
        if (!self.isSingleSelected) return
        self.createLdapParam = {
          accountUuid: self.selectedList[0],
          ok: (params) => {
            self.createLdapBinding(params).then(() => self.queryList())
          }
        }
        self.showCreateLdap = true;
      },
      canDetachLdap () {
        if (!this.isSingleSelected) return false
        let account = this.dbData.account[this.selectedList[0]]
        if (!account) return
        return this.dbData.common.isAdmin && account.attachedLdap
      },
      closeModifyPswDlg(param){
        let self = this;
        if(param){

        }
        self.showModifyPswDlg = false;
      },
      openModifyDlg(accountUuid){
        let self = this;
        let uuid = accountUuid;
        if(!self.isSingleSelected) return;
        self.openDialog('ModifyPasswordDlg',{
          accountName: this.dbData.account[uuid].name,
          ok: (msg) => {
            let event = this.createEvent('account.action.changePassword', this.dbData.account[uuid].name, 1)
            rpc.put(`accounts/${uuid}`, {
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
      createAccount(){
        let self = this;
        self.$router.push({name: 'createAccount'})
      },
      pageDelete(){
        let self = this, uuidList = [];
        if(!self.isSelected) return;
        uuidList = self.selectedList;
        self.openDialog('ConfirmDlg', {
          title: 'account.deleteAccount',
          description: 'common.confirmForDeleteOperation',
          icon: 'account_popupico',
          uuidList,
          warning: 'account.deleteTip',
          getName(uuid){
            return self.dbData.account[uuid].name;
          },
          ok(){
            self.delete(uuidList)
          }
        })
      }
    }
  }
</script>
