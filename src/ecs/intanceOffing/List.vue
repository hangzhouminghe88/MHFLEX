<script>
  import Root from 'src/windows/Root';
  import InstanceOfferingMethods from './Methods'
  import Utils from 'src/utils/utils'
  import { mapGetters, mapState } from 'vuex'
  export default {
    name: "InstanceOffingList",
    mixins: [Root, InstanceOfferingMethods],
    computed: {
      ...mapState({
        instanceOffering: state => state.instanceOffering
      }),
      ...mapGetters({
        getList: 'instanceOffering/getList'
      }),
    },
    watch: {
      'windowData.pageSize': function(newVal, oldVal){
        let self = this;
        if(newVal !== oldVal){
          self.queryList();
        }
      },
      'windowData.pageIndex': function(newVal, oldVal){
        let self = this;
        if(newVal !== oldVal){
          self.queryList();
        }
      }
    },
    data() {
      return {
        isAdmin: localStorage.getItem('isAdmin') === 'true'
      }
    },
    methods: {
      ...Utils,
      queryList(){
        let self = this;
        self.windowData.loading = true;
        return this.dispatchAction('instanceOffering/batchQuery',{
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: this.getCondition(),
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
        }).then(resp => {
          self.windowData.loading = false;
          this.updateWindow({
            uuidList: resp.uuidList,
            table: Utils.createTableObjFromUuidList(resp.uuidList),
            pageCount: Utils.computePageCount(resp.total, this.windowData.pageSize),
            total: resp.total
          })
        }).catch(() => {
          self.windowData.loading = false;
        }).then(() => {
          self.itemList = self.getList(this.windowData.uuidList)
        })
      },
      pageStart () {
        let uuidList = [], self = this;
        self.selectedList.forEach((uuid, index) => {
          if (self.dbData.instanceOffering[uuid].state !== 'Enabled') uuidList.push(uuid)
        })
        // if (uuidList.length > 0) this.start(uuidList)
        if (uuidList.length <= 0) return
        self.dispatchActionWithEvent('instanceOffering/enable', uuidList).then ( () => self.queryList())
      },
      pageStop: function () {
        let uuidList = [], self = this;
        self.selectedList.forEach((uuid, index) => {
          if (self.dbData.instanceOffering[uuid].state !== 'Disabled') uuidList.push(uuid)
        })
        // if (uuidList.length > 0) this.stop(uuidList)
        if (uuidList.length <= 0) return
        this.dispatchActionWithEvent('instanceOffering/disable', uuidList).then ( () => self.queryList())
      },
      pageDelete(){
        let uuidList = [], self = this;
        uuidList = self.selectedList;
        self.openDialog('ConfirmDlg',{
          title: 'common.destroyInstanceOffering',
          description: 'instanceOffering.delete',
          icon: 'instance_offering_popupico',
          uuidList,
          ok: () => {
            self.dispatchActionWithEvent('instanceOffering/delete', uuidList)
              .then(() => {
                this.queryList()
              })
          },
          getName: (uuid) => {
            return self.dbData.instanceOffering[uuid].name;
          }
        })
      },

      inStates () {
        let self = this, states = [];
        for (let arg in arguments) {
          states.push(arguments[arg]);
        }
        let instate = self.selectedList.every( (uuid) => {
          return states.some( (state) => {
            return self.dbData.instanceOffering[uuid].state === state;
          })
        })
        return instate;
      }
    },
  }
</script>

