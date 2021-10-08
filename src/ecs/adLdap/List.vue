<script>
  import Utils from 'src/utils/utils'

  export default {
    name: "List",
    methods: {
      getCondition: function () {
        let conditionList = []
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },
      queryList() {
        let self = this;
        return self.dispatchAction('adLdap/query', {
          start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
          replayWithCount: true,
          limit: self.windowData.pageSize,
          q: this.getCondition(),
        }).then(resp => {
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
      },
    }
  }
</script>

<style scoped>

</style>
