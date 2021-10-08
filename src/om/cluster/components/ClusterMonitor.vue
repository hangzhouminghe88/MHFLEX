<template>
  <div class="container">
    <component :is="typeListItem.ctrl" :param="typeListItem.param" ></component>
    <component v-if="currSelectTab === 'host'" :is="hostMonitorItem.ctrl" :param="{conditions:`cluster.uuid=${windowData.dataUuid}`, uuid: windowData.dataUuid }"></component>
    <component v-if="currSelectTab === 'vm'" :is="vmMonitorItem.ctrl" :param="{conditions:`cluster.uuid=${windowData.dataUuid}`, uuid: windowData.dataUuid }"></component>
  </div>
</template>

<script>
  import PanelTypeList from "../../../component/FullPanel/PanelTypeList";
  import HostMonitTab from "src/om/cluster/components/HostMonitTab";
  import VmMonitorTab from "src/om/cluster/components/VmMonitorTab";
  import WindowBase from 'src/windows/Window';
  export default {
    name: "ClusterMonitor",
    mixins: [WindowBase],
    props: {
      param: {
        type: String,
        default: ''
      }
    },
    data(){
      let self = this;
      return {
        typeTabList: [
          {typeName: 'host', value: 'host'},
          {typeName: 'vm', value: 'vm'},
        ],
        currSelectTab: 'host',
        typeListItem: {
          param: {
            getIndex: () =>{
              return _.findIndex(this.typeTabList, it => it.value === this.currSelectTab)
            },
            setIndex: (index)=>{
              return this.currSelectTab = this.typeTabList[index].value
            },
            getTypeList: () =>{
              return this.typeTabList;
            }
          },
          ctrl: PanelTypeList
        },
        hostMonitorItem:{
          ctrl: HostMonitTab
        },
        vmMonitorItem: {
          ctrl: VmMonitorTab
        }
      }
    },
    created () {
      let self = this;
      self.updateWindow({
        dataUuid: '',
        dialogList: [],
        usedCapacityData: [],
        usedCapacityIntervalIndex: 0,
        usedCapacityIndex: 0
      })
      if (self.param) {
        self.updateWindow({
          dataUuid: self.param,
        })
      }
    },
  }
</script>

<style scoped>

</style>
