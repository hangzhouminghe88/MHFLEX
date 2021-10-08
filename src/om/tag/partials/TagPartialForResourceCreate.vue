<script>
// import _ from 'lodash'
import { mapGetters } from 'vuex'
import TagOperationList from 'src/components/TagOperationList'

export default {
  data () {
    return {
      tagUuidList: []
    }
  },
  mounted () {
  },
  destroyed: function () {
  },
  components: {
    'tag-operation-list': TagOperationList
  },
  computed: {
    ...mapGetters({
      getTag: 'tag/get'
    })
  },
  watch: {
    'windowData.showSearchBox' (val, oldVal) {
      if (val === oldVal) return
      this.$nextTick(() => {
        this.calcTagListWidth()
      })
    }
  },
  methods: {
    getTagOperationListParam () {
      let self = this
      return {
        getTagUuidList () {
          return self.tagUuidList
        },
        openAttachTagPanel: self.openAttachTagPanel,
        setValue (uuidList) {
          self.tagUuidList = uuidList
        }
      }
    },
    openAttachTagPanel () {
      let conditions = []
      if (this.tagUuidList.length > 0) {
        conditions = [`uuid!?=${this.tagUuidList.join(',')}`]
      } else {
        // this condition will be translate to zql so should =''
        conditions = [`uuid!?=''`]
      }
      let accountUuid = window.localStorage.getItem('accountUuid')
      // this.openSidePanel('windows/Tag/panels/MultiSelectListConfirm', {
      //   conditions,
      //   accountUuid,
      //   queryType: 'zql',
      //   ok: (uuidList) => {
      //     this.tagUuidList = this.tagUuidList.concat(uuidList)
      //   }
      // })
    }
  }
}
</script>
