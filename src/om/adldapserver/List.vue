<script>
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import AdldapServerMethods from './Methods';
  export default {
    name: "List",
    mixins: [WindowBase, AdldapServerMethods],
    methods: {
      getCondition: function () {
        let conditionList = [], self = this;
        if (self.selectVal !== '' && self.searchStr !=='') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
        }
        return conditionList
      },
      queryList(){
        let self = this;
        return self.dispatchAction('adLdap/query', {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: this.getCondition(),
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
        }).then(resp => {
          let uuidList = resp.uuidList;
          return self
            .updateWindow({
              uuidList,
              table: Utils.createTableObjFromUuidList(resp.uuidList),
              pageCount: Utils.computePageCount(
                resp.total,
                self.windowData.pageSize
              ),
              total: resp.total
            })
        })
      },
      pageDelete () {
        const self = this
        if (!self.isSelected || self.selectedList.length <= 0) return
        self.openDialog('ConfirmDlg', {
          title: 'adLdapServer.delete',
          description: 'adLdapServer.deleteadldap',
          icon: 'ldap_n',
          uuidList: self.selectedList,
          ok: () => {
            self.delete(self.selectedList, self.queryList)
          },
          getName(uuid){
            return self.dbData.adLdapServer[uuid].name;
          }
        })
      },
      pageTest () {
        const self = this
        if (!self.isSelected || self.selectedList.length <= 0) return
        self.test(self.selectedList)
      },
      pageSync () {
        const self = this
        if (!self.isSelected || self.selectedList.length <= 0) return
        self.openDialog('LdapSyncConfirmDlg', {
          title: 'ldap.syncTitle',
          description: 'ldap.info.syncConfirm',
          icon: 'ldap_n',
          uuidList: self.selectedList,
          ok: () => self.sync(self.selectedList),
          getName(uuid){
            return self.dbData.adLdapServer[uuid].name;
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>
