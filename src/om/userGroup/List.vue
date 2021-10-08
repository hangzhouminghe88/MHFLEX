<script>
  import {mapGetters} from 'vuex';
  import Utils from 'src/utils/utils';
  import UserGroupMethods from './Methods';
  export default {
    name: "List",
    mixins: [UserGroupMethods],
    computed: {
      ...mapGetters({
        get: 'userGroup/getList'
      })
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
        return self.dispatchAction('userGroup/query', {
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
      goToCreatePage(){
        let self = this;
        self.$router.push({name: 'createGroupUser'})
      },
      pageDelete(){
        let self = this;
        if(!self.isSelected) return;
        self.openDialog('ConfirmDlg', {
          uuidList: self.selectedList,
          title: 'usergroup.delete',
          description: 'usergroup.info.deleteConfirm',
          icon: 'user_group_popupico',
          getName(uuid){
            return self.userGroup[uuid].name
          },
          ok(){
            self.delete(self.selectedList).then(() => {self.queryList()});
          }
        })
      },
      attachUser(){
        let self = this;
        let selectedUuidList = self.selectedList
        self.openDialog('UserSelectConfirmDlg', {
          uuid: selectedUuidList[0],
          select: (uuidList) => {
            self.addUser(uuidList,selectedUuidList[0]);
          }
        });
      }
    }
  }
</script>

<style scoped>

</style>
