<template>
  <div style="width: 100%; height: 100%;position: relative;">
    <div class="performance-container" style="position: relative;height:100%;">
      <div class="page-body" @scroll="onScroll">
        <div class="page-header">
          <el-row :gutter="10" type="flex" justify="between-space">
            <el-col :span="23">
              <el-tabs v-model="currTab">
                <el-tab-pane :label="$t('common.host')" name="host"></el-tab-pane>
                <el-tab-pane :label="$t('common.vm')" name="vm"></el-tab-pane>
                <el-tab-pane :label="$t('common.vrouterPerf')" name="vrouterPerf"></el-tab-pane>
                <el-tab-pane :label="$t('common.vip')" name="vip"></el-tab-pane>
                <el-tab-pane :label="$t('common.l3network')" name="l3network"></el-tab-pane>
              </el-tabs>
            </el-col>
            <el-col :span="2">
              <el-select v-model="getTime" style="padding: 10px 0px;">
                <el-option v-for="(item, index) in timeIntervalList"
                           :value="item.value"
                           :key="index"
                           :label="$t(item.name)"></el-option>
              </el-select>
            </el-col>
          </el-row>
        </div>
        <div class="page-container" v-if="currTab === 'host'">
          <host-tab-page :param="{time: timeIntervalList[intervalIndex]}"/>
        </div>
        <div class="page-container" v-if="currTab === 'vm'">
          <vm-tab-page :param="{time: timeIntervalList[intervalIndex]}"/>
        </div>
        <div class="page-container" v-if="currTab === 'vrouterPerf'">
          <vrouter-perf-tab-page :param="{time: timeIntervalList[intervalIndex]}"/>
        </div>
        <div class="page-container" v-if="currTab === 'vip'">
          <vip-tab-page :param="{time: timeIntervalList[intervalIndex]}"/>
        </div>
        <div class="page-container" v-if="currTab === 'l3network'">
          <l3-network-tab-page :param="{time: timeIntervalList[intervalIndex]}"/>
        </div>
      </div>
      <div class="scrollbar" v-show="showScrollbar" :style="{ top: scrollTop + 'px', height: scrollLength + 'px' }" @mousedown="onScrollBarMouseDown($event)"></div>
    </div>
  </div>
</template>

<script>
  import DropDown from 'src/ecs/autoScalingGroup/component/Dropdown';
  import HostTabPage from "./page/HostTabPage";
  import VmTabPage from "./page/VmTabPage";
  import VrouterPerfTabPage from "./page/VrouterPerfTabPage";
  import VipTabPage from "./page/VipTabPage";
  import L3NetworkTabPage from "./page/L3NetworkTabPage";
  import ScrollBar from 'src/component/scoller/ScrollBar';

  export default {
    name: "PerformancePage",
    mixins: [ScrollBar],
    components: {
      L3NetworkTabPage,
      VipTabPage,
      VrouterPerfTabPage,
      VmTabPage,
      HostTabPage,
      'drop-down': DropDown
    },
    data() {
      return {
        intervalIndex: 0,
        currTab: 'host',
        timeIntervalList: [
          {
            name: 'common.1m',
            index: 0,
            value: 60,
            period: 6
          },
          {
            name: 'common.1h',
            index: 1,
            value: 60 * 60,
            period: 100
          },
          {
            name: 'common.1d',
            index: 2,
            value: 24 * 60 * 60,
            period: 2400
          },
          {
            name: 'common.1w',
            index: 3,
            value: 7 * 24 * 60 * 60,
            period: 2400 * 7
          },
          {
            name: 'common.1moon',
            index: 4,
            value: 30 * 24 * 60 * 60,
            period: 2400 * 30
          }
        ],
      }
    },
    mounted(){
     this.scrollContainerSelector = '.performance-container'
     this.scrollElementSelector = '.page-body'
    },
    computed:{
      getTime:{
        get(){
          let self = this;
          return self.$t(self.timeIntervalList[self.intervalIndex].name);
        },
        set(val){
          let self = this;
          self.intervalIndex = self.timeIntervalList.findIndex((item) => {
            return val === item.value;
          })

        }
      }
    }
  }
</script>

<style scoped lang="less">
  .page-header {
    height: 60px;
    top: -48px;
    display: inline-block;
    width: 100%;
  }

  .container {
    position: relative;
    width: 100%;
    height: 100%;
    .page-container {
      height: 100%;
      width: 100%;
    }
  }

  .detail-dropdown {
    display: inline-block;
    position: relative;
    background: #fff;
    border: 1px solid #409EFF;
    border-radius: 2px;
    height: 30px;
    line-height: 30px;
    color: #3c73b9;
    padding-left: 14px;
    padding-right: 8px;
    cursor: pointer;
    font-size: 0;

    .title {
      height: 100% !important;
      display: inline-block !important;
    }
  }

  .dropdown {
    position: relative;
    top: 10px;
    height: 29px;
    line-height: 29px;
    border: 1px solid #39f;
    background: #f2faff;
    padding: 5px 0px;
  }

  .dropdown .dropdown-container {
    background: #39f !important;
    color: #fff;
  }
  .page-body{
    position: absolute;
    width: 96%;
    padding: 0 60px 0 40px;
    overflow-y: auto;
    overflow-x: hidden;
    top: 0;
    left: 0;
    right: -20px;
    bottom: 0;
    margin-bottom: 20px;
  }
</style>
