<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters({
      getTag: 'tag/get'
    })
  },
  methods: {
    attachTag (resourceUuidList, tagUuidList) {
      if (!tagUuidList || tagUuidList.length <= 0) return
      let paramList = tagUuidList.map(uuid => {
        return {
          uuid,
          resourceUuidList
        }
      })
      return this.dispatchActionWithEvent('tag/attach', paramList)
    },
    detachTag (resourceUuidList, tagUuidList) {
      let paramList = tagUuidList.map(uuid => {
        return {
          uuid,
          resourceUuidList
        }
      })
      return this.dispatchActionWithEvent('tag/detach', paramList)
    }
  }
}
</script>


// WEBPACK FOOTER //
// TagPartialForResourceMethods.vue?5ba1c7e0