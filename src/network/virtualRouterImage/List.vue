<script>

  import WindowBase from 'src/windows/Window';
  import VirtualRouterImageMethods from 'src/network/virtualRouterImage/Methods'

  export default {
    mixins: [WindowBase, VirtualRouterImageMethods],
    created: function () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: ''
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
      getData(){
        let self = this;
        if (!_.isArray(this.windowData.uuidList)) return []
        // sometimes, uuid will not exist. so should be excluded firstly.
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.image[uuid])
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.image[uuid]
          }
        )
      },
    }
  }
</script>
