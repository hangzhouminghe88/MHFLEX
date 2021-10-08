<script>
  // import _ from 'lodash'
  import Utils from 'src/utils/utils'
  import Methods from './Methods'

  export default {
    mixins: [Methods],
    computed: {

    },
    created () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: '',
        sortBy: 'createDate',
        sortDirection: '-',
        showSearchBox: false,
        methods: {
          queryList: this.queryList
        }
      })
        .then(() => {
          this.queryList()
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
      queryList () {
        this.windowData.loading = true;
        return this.dispatchAction('tag/query', {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          q: this.getCondition(),
          sortDirection: this.windowData.sortDirection,
          sortBy: this.windowData.sortBy,
          replyWithCount: true
        }).then(resp => {
          let uuidList = resp.uuidList
          this.dispatchAction('tag/queryResourceCount', uuidList)
          return this.updateWindow({
            uuidList,
            table: Utils.createTableObjFromUuidList(resp.uuidList),
            pageCount: Utils.computePageCount(resp.total, this.windowData.pageSize),
            availableCount: resp.total
          })
        })
          .then(() => {
            this.itemList = this.getItemList();
            this.windowData.loading = false;
          })
      },
      getItemList () {
        return this.getTag(this.windowData.uuidList)
      },
      getSearchCondition () {
        if (this.selectVal !== '' && this.searchStr !== '') {
          return [`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`]
        }
        return []
      },
      getCondition () {
        let conditionList = []
        conditionList = conditionList.concat(this.getSearchCondition())
        return conditionList
      },
      openCreateTagDlg () {
        let self = this;
        self.openDialog('CreateTagDlg', {
          ok: (name, color, cb) => {
            return this.create({
              name,
              color
            })
              .then(() => {
                this.queryList()
                cb(true)
              }, (error) => {
                cb(error)
              })
          }
        })
      },
      listDelete () {
        let uuidList = this.selectedList
        if (uuidList.length <= 0) return
        let paramObj = {
          title: 'tag.delete',
          description: 'tag.deleteDescription',
          uuidList,
          icon: 'tag_n',
          getName: (uuid) => {
            return this.getTag(uuid).name
          },
          ok: () => {
            this.delete(uuidList)
              .then(() => {
                this.queryList()
              })
          }
        }
        let currOwnerUuid
        if (window.localStorage.getItem('isLoginFromProject') === 'true') {
          if (window.localStorage.getItem('isPlatformAdmin') === 'true') {
            currOwnerUuid = window.localStorage.getItem('accountUuid')
          } else {
            currOwnerUuid = window.localStorage.getItem('currProjectUuid')
          }
        } else {
          currOwnerUuid = window.localStorage.getItem('accountUuid')
        }

        let hasOtherTag = false
        let self = this
        uuidList.forEach(uuid => {
          if (self.getTag(uuid).ownerUuid !== currOwnerUuid) {
            hasOtherTag = true
          }
        })
        if (hasOtherTag) {
          paramObj.warning = 'tag.deleteOtherWarning'
        }
        return this.openDialog('ConfirmDlg', paramObj)
      }
    }
  }
</script>
