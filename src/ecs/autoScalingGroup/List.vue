<script>
  // import AutoScalingGroupMethods from './Methods'
  import rpc from 'src/utils/rpc'
  import Utils from 'src/utils/utils'
  import { mapGetters, mapState } from 'vuex'
  import WindowBase from 'src/windows/Window';

  export default {
    mixins: [WindowBase],
    created: function () {
      this.isAdmin = localStorage.getItem('isAdmin') === 'true'
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: ''
      })
    },
    data () {
      return {
        isAdmin: true
      }
    },
    computed: {
      ...mapState({
        autoScalingGroup: state => state.autoScalingGroup
      }),
      ...mapGetters({
        getList: 'autoScalingGroup/getList'
      }),
    },
    methods: {
      queryList () {
        this.windowData.loading = true;
        return this.dispatchAction('autoScalingGroup/batchQuery', {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: this.getCondition(),
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
        })
          .then(resp => {
            this.windowData.loading = false;
            this.updateWindow({
              uuidList: resp.uuidList,
              table: Utils.createTableObjFromUuidList(resp.uuidList),
              pageCount: Utils.computePageCount(resp.total, this.windowData.pageSize),
              availableCount: resp.total
            })
          }).catch(() => {
            this.windowData.loading = false;
          })
          .then(() => {
            this.itemList = this.getList(this.windowData.uuidList);
          })
      },
      getCondition () {
        let conditionList = []
        conditionList = conditionList.concat(this.conditions[this.windowData.currTab])
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`);
        }
        return conditionList
      },
      pageEnable() {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          if (this.autoScalingGroup[uuid].state !== 'Enabled') uuidList.push(uuid)
        })
        if (uuidList.length > 0) this.dispatchActionWithEvent('autoScalingGroup/enable', uuidList).then(() => this.queryList())
      },
      pageDisable() {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          if (this.autoScalingGroup[uuid].state !== 'Disabled') uuidList.push(uuid)
        })
        if (uuidList.length > 0) this.dispatchActionWithEvent('autoScalingGroup/disable', uuidList).then(() => this.queryList())
      },
      pageDelete: function () {
        let self = this, uuidList = self.selectedList;
        self.openDialog('ConfirmDlg', {
          description: "autoScaling.info.deleteGroupConfirm",
          title: "autoScaling.deleteGroup",
          uuidList: uuidList,
          icon: 'pop_auto_scaling_n',
          warning: 'autoScaling.warning.deleteAutoScalingGroup',
          ok: () => {
            let zql = "query AutoScalingRuleTrigger where ruleUuid in (query AutoScalingRule.uuid where scalingGroupUuid in ('" + `${uuidList.join("','")}` + "'))"
            rpc.query('/zql', {
              zql: encodeURIComponent(zql)
            }).then((resp) => {
              self.dispatchActionWithEvent('autoScalingGroup/delete', uuidList)
                .then(() => {
                  let alarmUuidList = []
                  if (resp.results && resp.results.length > 0 && resp.results[0].inventories && resp.results[0].inventories.length > 0) {
                    alarmUuidList = resp.results[0].inventories.map(it => it.alarmUuid)
                    alarmUuidList.forEach(function (uuid) {
                      ((uuid) => {
                        rpc._delete(`zwatch/alarms/${uuid}`)
                      })(uuid)
                    })
                  }
                  self.queryList()
                })
            })
          },
          getName(uuid){
            return self.autoScalingGroup[uuid].name
          }
        })
      },
      ...Utils
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
