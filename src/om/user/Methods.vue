<script>
  import {mapGetters, mapState} from 'vuex';
  export default {
    name: "Methods",
    computed:{
      ...mapGetters({
        get: 'user/getList'
      }),
      ...mapState({
        user: state => state.user
      })
    },
    methods: {
      delete(uuidList){
        let self = this;
        return self.dispatchActionWithEvent('user/delete', uuidList)
      }
    }
  }
</script>

<style scoped>

</style>
