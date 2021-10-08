<script>
  import ZoneMethods from 'src/om/zone/Methods'
  import Root from "../../windows/Root";
  import {mapState, mapGetters} from 'vuex';

  export default {
    mixins: [ZoneMethods,Root],
    computed:{
      ...mapState({
       zone: state => state.zone
      }),
      ...mapGetters({
        getList: `zone/getList`
       }),
    },
    created () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 10,
        currItemUuid: ''
      })
    },
    watch: {
      'windowData.pageSize': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList()
      },
      'windowData.pageIndex': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList()
      }
    },
    methods: {
      canEnable(){
        let self = this;
        if(self.windowData.selectList.length<=0) return false;
        return self.windowData.selectList.some((item) => item.state === 'Disabled')
      },
      canDisabled(){
        let self = this;
        if(self.windowData.selectList.length<=0) return false;
        return self.windowData.selectList.some((item) => item.state === 'Enabled')
      }
    }
  }
</script>

<style scoped>

</style>
