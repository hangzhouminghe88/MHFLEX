<template>
  <div>
    <div class="page-toolbar-container" style="padding: 10px 20px 10px 0px;">
      <el-row>
        <el-col :span="14">
          <component :is="peripheralTabItem.ctrl" :param="peripheralTabItem.param"></component>
          <help-trigger name="hostGpu" :subList="['hostGpu', 'hostUsb']" triangle="top" :style="{ position: 'relative', display: 'inline-block', top: '5px', left: '3px', marginRight: '10px' }"/>
          <slot name="dropdown"></slot>
        </el-col>
        <el-col :span="10" style="text-align: right">
          <span style="padding: 0 32px;display: inline-block;">
            <el-input :placeholder="$t('common.searchPlaceholder')" v-model="searchStr" @blur="search()"
                      @change="search()">
               <el-select v-model="selectVal" slot="prepend" :placeholder="$t('common.searchLabelPlaceholder')"
                          style="width: 105px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </el-col>
      </el-row>
    </div>
    <component v-if="currSelectTab === 'gpu'" :is="GpuTabItem.ctrl" :param="GpuTabItem.param"></component>
    <component v-if="currSelectTab=== 'usbDevice'" :is="UsbTabItem.ctrl" :param="{conditions: windowData.conditions, isCluster: windowData.isCluster, uuid: windowData.dataUuid, searchStr, selectVal}"></component>
    <component v-if="currSelectTab=== 'otherDevice'" :is="OtherItem.ctrl" :param="{conditions: windowData.conditions, isCluster: windowData.isCluster, uuid: windowData.dataUuid }"></component>
  </div>
</template>

<script>
  import PanelTypeList from "../../../component/FullPanel/PanelTypeList";
  import GpuTabList from 'src/om/cluster/components/GpuTabList';
  import UsbDeviceTabList from "src/om/cluster/components/UsbDeviceTabList"
  import rpc from 'src/utils/rpc';
  import WindowBase from 'src/windows/Window';
  import PciDeviceTabList from "src/om/cluster/components/PciDeviceTabList";
  export default {
    name: "PeripheralTabList",
    mixins: [WindowBase],
    components: {PanelTypeList},
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data(){
      let self = this;
      return {
        peripheralTabList: [
          {typeName: 'gpu', value: 'gpu'},
          {typeName: 'usbDevice', value: 'usbDevice'},
          {typeName: 'otherDevice', value: 'otherDevice'}
        ],
        currSelectTab: 'gpu',
        peripheralTabItem:{
          param: {
            getIndex: () =>{
              return _.findIndex(this.peripheralTabList, it => it.value === this.currSelectTab)
            },
            setIndex: (index)=>{
              return this.currSelectTab = this.peripheralTabList[index].value
            },
            getTypeList: () =>{
              return this.peripheralTabList;
            }
          },
          ctrl: PanelTypeList
        },
        conditionNameList:[
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        searchStr: '',
        selectVal: 'name',
        GpuTabItem: {
          param: {
            conditions: self.windowData && self.windowData.conditions,
            isCluster: self.windowData && self.windowData.isCluster,
            uuid: self.windowData && self.windowData.dataUuid
          },
          ctrl:GpuTabList
        },
        UsbTabItem: {
          ctrl: UsbDeviceTabList
        },
        OtherItem: {
          ctrl: PciDeviceTabList
        }
      }
    },
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currSelectTab: 'gpuDevice',
        sortBy: 'createDate',
        sortDirection: '-',
        methods: {
          queryList: self.queryList
        },
        dataUuid: self.param && self.param.uuid,
        isCluster: self.param && self.param.isCluster,
        conditions: self.param && self.param.conditions ? self.param.conditions : []
      }).then(() => {
        return self.getHosts()
      })
    },
    methods: {
      getHosts () {
        if (this.windowData.isCluster) {
          return rpc.query('hosts', {q: `cluster.uuid=${this.param.uuid}`}).then(resp => {
            return this.updateDbTable({
              tableName: 'host',
              list: resp.inventories
            })
          })
        }
      },
    }
  }
</script>

<style scoped>
</style>
