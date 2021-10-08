<script>
  import Methods from 'src/om/billing/Methods'

  export default {
    mixins: [Methods],
    created: function () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: '',
        sortBy: 'billingTotal',
        sortDirection: '-'
      })
    },
    watch: {
      'windowData.pageSize': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList() // skip init status
      },
      'windowData.pageIndex': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.changePageIndex() // skip init status
      }
    },
    methods: {
      sortForLink: function (details, checkFn) {
        let hasResourceUuid = []
        let noResourceUuid = []
        if (!Array.isArray(details)) return
        if (typeof checkFn !== 'function') return
        details.forEach(item => {
          if (checkFn(item.resourceUuid)) {
            hasResourceUuid.push(item)
          } else {
            noResourceUuid.push(item)
          }
        })
        return noResourceUuid.concat([], hasResourceUuid)
      }
    }
  }
</script>
