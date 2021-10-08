<template>
   <create-template-no-route>
     <div slot="header">
       <span >{{$t('common.attachCluster')}}</span>
       <span class="create-back" @click="close()">
         <i class="el-icon-back"></i>
         <span style="font-size: 12px;">返回</span>
       </span>
     </div>
     <div slot="body" class="create-body">
       <div class="operation-row">
         <div class="title required">VTEP CIDR</div>
         <input type="text" placeholder="192.168.1.0/24" v-model="cidr" :class="{'is-error': emptycidr}"/>
         <div class="error error-text" v-if="emptycidr && !invalidcidr">VTEP CIDR{{$t('error.noEmpty')}}</div>
         <div class="error error-text" v-if="!emptycidr && invalidcidr">{{$t('error.invalid')}}VTEP CIDR</div>
       </div>
       <div class="operation-row">
         <div class="title required">{{$t('common.cluster')}}</div>
         <add-or-delete-input @open="openSelectCluster" @remove="removeUuid('clusterUuid')"/>
       </div>
     </div>
   </create-template-no-route>
</template>

<script>
  import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";
  import AddOrDeleteInput from "../../../component/AddOrDeleteInput";
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  export default {
    name: "VxlanNetworkPoolAttachCluster",
    components: {AddOrDeleteInput, CreateTemplateNoRoute},
    mixins: [WindowBase],
    props:{
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data(){
      return {
        emptycidr: false,
        invalidcidr: false,
        cidr: '',
        clusterUuid: ''
      }
    },
    created(){
      let self = this
      let hypervisorType = ''
      if (self.param && this.param.uuid) {
        let dataUuid = self.param.uuid
        self.updateWindow({ dataUuid })
          .then(() => {
            self.initVxlanPoolCidr(self.windowData.dataUuid)
          })
      }
      if (self.param && this.param.hypervisorType) {
        hypervisorType = this.param.hypervisorType
      }
      let curSelectZoneUuid = localStorage.getItem('currZoneUuid')
      this.updateWindow({
        cidr: '',
        clusterUuid: '',
        zoneUuid: curSelectZoneUuid,
        hypervisorType
      })
    },
    methods: {
      initVxlanPoolCidr: function (uuid) {
        const self = this
        rpc.query(`l2-networks/vxlan-pool/${uuid}`)
          .then((resp) => {
            if (resp.inventories.length > 0) {
              if (resp.inventories[0].attachedClusterUuids.length > 0) {
                let cidr = resp.inventories[0].attachedCidrs[resp.inventories[0].attachedClusterUuids[0]]
                self.updateWindow({ cidr })
              }
            }
          })
      },
      openSelectCluster(){

      },
      removeUuid(uuid){

      }
    }
  }
</script>

<style scoped>

</style>
