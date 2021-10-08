<script>
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import {mapGetters} from 'vuex';
  import CertificateMethods from './Methods';
  export default {
    name: "List",
    mixins: [WindowBase, CertificateMethods],
    computed: {
      ...mapGetters({
        get: 'certificate/getList'
      })
    },
    methods: {
      getCondition: function () {
        let conditionList = [], self = this;
        if (self.selectVal !== '' && self.searchStr !=='' ) {
          conditionList = conditionList.concat(`${self.selectVal}~=${encodeURIComponent(self.searchStr)}`)
        }
        return conditionList
      },
      queryList () {
        let self = this;
        self.windowData.loading = true;
        return self.dispatchAction('certificate/batchQuery', {
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
            .then(() => {
              self.itemList = self.get(self.windowData.uuidList);
              self.windowData.loading = false;
            });
        });
      },
      pageDelete(fn){
        let self = this;
        if(!self.isSelected) return;
        self.openDialog('ConfirmDlg', {
          uuidList: self.selectedList,
          title: 'certificate.delete',
          description: 'certificate.deleteConfirm',
          icon: 'certificate_n',
          getName(uuid){
            return self.dbData.certificate[uuid].name;
          },
          ok(){
            self.delete(self.selectedList, fn);
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>
