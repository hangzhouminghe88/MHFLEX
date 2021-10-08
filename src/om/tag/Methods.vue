<script>
  // import _ from 'lodash'
  // import Utils from 'src/utils/utils'
  import { mapGetters, mapState } from 'vuex'

  export default {
    computed: {
      ...mapState({
        tag: state => state.tag
      }),
      ...mapGetters({
        getTag: 'tag/get',
        get: 'tag/get'
      })
    },
    methods: {
      create (param) {
        return this.dispatchActionWithEvent('tag/create', param)
      },
      delete (param) {
        return this.dispatchActionWithEvent('tag/delete', param)
      }
    }
  }
</script>
