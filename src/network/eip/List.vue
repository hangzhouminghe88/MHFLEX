<script>
  import WindowBase from 'src/windows/Window'
  import EipMethods from './Methods'
  import _ from 'lodash'

  export default {
    mixins: [WindowBase, EipMethods],
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
      getData(){
        let self = this;
        if (!_.isArray(this.windowData.uuidList)) return []
        // sometimes, uuid will not exist. so should be excluded firstly.
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.eip[uuid])
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.eip[uuid]
          }
        )
      },
      pageDelete: function () {
        let uuidList = this.selectedList
        let self = this
        if (uuidList.length > 0) {
          self.openDialog('DeleteEipConfirmDlg',{
            title: 'eip.deleteEip',
            description: 'eip.delete',
            uuidList: uuidList,
            icon: 'eip_popupico',
            ok: (deleteVip) => {
              self.delete(uuidList, deleteVip).then(() => {
                self.queryList()
              })
            },
            getName: (uuid) => {
              return self.dbData.eip[uuid].name;
            }
          })
        }
      },
      canChangeResourseOwner: function () {
        const self = this
        let value = true
        let vip = null
        let eip = null
        if (!self.isSelected || self.selectedList.length <= 0) return false
        for (let i = self.selectedList.length - 1; i >= 0; i--) {
          eip = _.cloneDeep(self.dbData.eip[self.selectedList[i]])
          vip = _.cloneDeep(self.dbData.vip[eip.vipUuid])
          if (vip && self.dbData.l3NetworkOfHost[vip.l3NetworkUuid] && self.dbData.l3NetworkOfHost[vip.l3NetworkUuid][0].hypervisorType === 'ESX') {
            value = false
            break
          }
        }
        return value
      }
    }
  }
</script>

