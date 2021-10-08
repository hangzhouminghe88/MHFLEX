<script>
  import LoadBalancerMethods from './Methods';
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils';
  import {mapGetters} from 'vuex';
  import _ from 'lodash'

  export default {
    name: "List",
    mixins: [LoadBalancerMethods, WindowBase, Root],
    computed: {
      ...mapGetters({
        getList: 'loadBalancer/getList'
      }),
      // itemList(){
      //   let self = this;
      //   return this.getList(self.windowData.uuidList);
      // }
    },
    created: function () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: ''
      })
    },
    methods: {
      getCondition: function () {
        let conditionList = []
        conditionList.push(`vip.l3Network.zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      pageDelete: function () {
        const self = this
        let uuidList = []
        uuidList = self.selectedList;
        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            uuidList,
            title: 'loadbalancer.deleteLoadBalancer',
            description: 'loadbalancer.info.deleteConfirm',
            icon: 'load_banlance_popupico',
            ok: () => {
              self.delete(uuidList).then(() => {
                self.queryList()
              })
            },
            getName: (uuid) => {
              return self.dbData.loadBalancer[uuid].name;
            }
          })
        }
      },
      pageDeleteThis(uuid) {
        const self = this
        let uuidList = []
        uuidList.push(uuid)

        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            uuidList,
            title: 'loadbalancer.deleteLoadBalancer',
            description: 'loadbalancer.info.deleteConfirm',
            icon: 'load_banlance_popupico',
            ok: () => {
              self.delete(uuidList).then(() => {
                self.$router.push({name: 'loadbalancer'})
              })
            },
            getName: (uuid) => {
              return self.dbData.loadBalancer[uuid].name;
            }
          })

        }
      }
    }
  }
</script>

<style scoped>

</style>
