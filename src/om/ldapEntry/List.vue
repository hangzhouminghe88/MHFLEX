<script>
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import LdapEntryMethods from './Methods'

  export default {
    mixins: [LdapEntryMethods],
    created: function () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: ''
      })
    },
    data () {
      return {
        itemList: []
      }
    },
    methods: {
      queryList: function () {
        // if (this.windowData.conditions === undefined) this.windowData.conditions = []
        return rpc.query('ldap/entry', {
          ldapFilter: this.getCondition()
        }).then((resp) => {
          let pageCount = resp.inventories.length === 0 ? 1 : Math.ceil(resp.inventories.length / this.windowData.pageSize)
          this.updateWindow({
            availableCount: resp.inventories.length,
            pageCount: pageCount
          })
          let uuidList = resp.inventories.map((item, index) => {
            item.uuid = item.dn + '-' + index
            item.attributes.forEach(function (it) {
              ((it) => {
                item[it.id] = it.values.toString()
              })(it)
            })
            // let otherList = _.difference(Object.keys(item.attributes), ['cn', 'name', 'objectclass'])
            // item.otherString = ''
            // otherList.forEach(function (it) {
            //   item.otherString = item.otherString + it + ': ' + item.attributes[it].values.toString() + ';\n'
            // })
            return item.uuid
          })
          let list = _.chunk(uuidList, this.windowData.pageSize)
          let table = {}
          uuidList.forEach((uuid) => {
            table[uuid] = {
              selected: false
            }
          })
          this.updateDbTable({
            tableName: 'ldapEntry',
            list: resp.inventories
          })
          this.updateWindow({
            uuidList: list[this.windowData.pageIndex - 1],
            table,
            total: list.length
          }).then(() => {
            this.itemList = this.getItemList();
          })
        })
      },
      getItemList(){
        let self = this;
        return self.windowData.uuidList.map((uuid) =>{
          return self.ldapEntry[uuid];
        })
      }
    },
    watch: {
      'windowData.pageSize': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList() // skip init status
      },
      'windowData.pageIndex': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList() // skip init status
      }
    }
  }
</script>

