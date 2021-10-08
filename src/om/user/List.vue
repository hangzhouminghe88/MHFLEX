<script>
  import UserMethods from 'src/om/user/Methods';
  import WindowBase from 'src/windows/Window';
  import sha512 from 'crypto-js/sha512';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  export default {
    name: "List",
    mixins: [WindowBase, UserMethods],
    watch: {
      'windowData.pageIndex': function(newVal , oldVal){
        let self = this;
        if(newVal !== oldVal){
          self.queryList();
        }
      },
      'windowData.pageSize': function(newVal, oldVal){
        let self = this;
        if(newVal !== oldVal){
          self.queryList();
        }
      }
    },
    methods: {
      getCondition: function () {
        let conditionList = [], self = this;
        // conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
        if (self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
        }
        return conditionList
      },
      queryList(){
        let self = this;
        self.windowData.loading = true;
        return self.dispatchAction('user/query', {
          start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
          limit: self.windowData.pageSize,
          sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`,
          q: self.getCondition(),
          replyWithCount: true
        }).then((resp) => {
          return this.updateWindow({
            uuidList: resp.uuidList,
            table: Utils.createTableObjFromUuidList(resp.uuidList),
            total: resp.total
          })
        })
          .then(() =>  {
            self.itemList = self.get(self.windowData.uuidList);
            self.windowData.loading = false;
          })
      },
      pageModifyPsw(){
        let self = this, userUuid;
        userUuid = self.selectedList[0];
        self.openDialog('ChangeUserPassWordDlg', {
          ok(msg){
            let event = self.createEvent('user.action.changeUserPassword', self.user[userUuid].name, 1)
            rpc.put(`accounts/users/actions`, {
              updateUser: {
                uuid: userUuid,
                password: sha512(msg).toString()
              }
            }, event)
              .then((resp) => {
                self.incEventSuccess(event)
                if (resp.success === false) return
              }, () => {
                self.incEventFail(event)
              })
          }
        })
      },
      pageDelete(){
        let self = this;
        if(!self.isSelected) return;
        self.openDialog('ConfirmDlg', {
          uuidList: self.selectedList,
          title:  'user.deleteUser',
          description: 'common.confirmForDeleteOperation',
          icon: 'user_popupico',
          getName(uuid){
            return self.user[uuid].name
          },
          ok(){
            self.delete(self.selectedList)
              .then(() => {
                if(self.$route.name === 'detailUser') self.$router.push({name: 'user'})
                self.queryList();
              })
          }
        })
      },
      goToCreatePage(){
        let self = this;
        self.$router.push({name: 'createUser'})
      },
      canChangePassword (uuid) {
        if (this.dbData.common.isAdmin) return true
        else return this.isSelfUser([uuid])
      },
    }
  }
</script>

<style scoped>

</style>
