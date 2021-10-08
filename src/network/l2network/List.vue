<script>
  import Vue from 'vue'
  // import rpc from 'src/utils/rpc'
  import WindowBase from 'src/windows/Window';
  import L2NetworkMethods from './Methods'

  export default {
    mixins: [WindowBase, L2NetworkMethods],
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
    computed: {
      
    },
    methods: {
      pageRecallL2NetworkFromAll: function () {
        const self = this
        if (!self.isSelected || self.selectedList.length <= 0) return false
        let uuidList = self.selectedList

        self.openDialog('ConfirmDlg',{
          title: 'common.recallFromAll',
          description: 'account.recall',
          uuidList:uuidList,
          icon: 'vm_plain',
          ok: () => {
            self.recallFromAll(uuidList)
          },
          getName: (uuid) => {
            return self.dbData.l2network[uuid].name;
          }
        })
      },
      pageShareL2NetworkToAll: function () {
        const self = this
        if (!self.isSelected || self.selectedList.length <= 0) return false
        let uuidList = self.selectedList

        self.openDialog('ConfirmDlg',{
          title: 'common.shareToAll',
          uuidList:uuidList,
          description: 'instanceOffering.shareToAllText',
          icon: 'vm_plain',
          ok: () => {
            self.shareL2NetworkToAll(uuidList)
          },
          getName: (uuid) => {
            return self.dbData.l2network[uuid].name;
          }
        })
      }
    }
  }
</script>
