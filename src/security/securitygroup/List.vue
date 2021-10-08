<script>
  import SecurityGroupMethods from './Methods'
  import rpc from 'src/utils/rpc'

  export default {
    mixins: [SecurityGroupMethods],
    computed:{

    },
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
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.securitygroup[uuid])
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.securitygroup[uuid]
          }
        )
      },
      getCandidateSecurityGroup: async function () {
        let noL3NetworksecurityGroupUuidList = []
        let securityGroupUuidList = []
        let taskList = []
        let p = rpc.query('security-groups', {
          q: 'l3Network.uuid+not+null',
          fields: 'uuid'
        }).then((resp) => {
          noL3NetworksecurityGroupUuidList = noL3NetworksecurityGroupUuidList.concat(resp.inventories.map(it => it.uuid))
          return rpc.query('security-groups', {
            q: `uuid!?=${noL3NetworksecurityGroupUuidList.join()}`,
            fields: 'uuid'
          }).then((resp) => {
            securityGroupUuidList = securityGroupUuidList.concat(resp.inventories.map(it => it.uuid))
          })
        })
        taskList.push(p)

        p = rpc.query('security-groups', {
          q: `l3Network.zoneUuid=${window.localStorage.getItem('currZoneUuid')}`,
          fields: 'uuid'
        }).then((resp) => {
          securityGroupUuidList = securityGroupUuidList.concat(resp.inventories.map(it => it.uuid))
        })
        taskList.push(p)
        return Promise.all(taskList).then(() => {
          return securityGroupUuidList
        })
      }
    }
  }
</script>
