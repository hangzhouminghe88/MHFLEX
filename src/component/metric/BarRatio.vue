<template>
  <div class="bar-container">
    <div class="title">{{ title ? $t(`home.${title}`) : '' }}</div>
    <div class="data-line" v-show="isLoad">
      <div class="total">{{ total }}</div>
      <div class="data-list">
        <div class="item" v-for="item in dataList">
          <div style="flex: 1 1 auto">
            <div class="point" :style="{'background': colorList[item.state], 'border-color': colorList[item.state]}"></div>
          </div>
          <div class="state-name" :title="$t(`home.${item.state}`)">{{ $t(`home.${item.state}`) }}</div>
          <div class="state-num">{{ item.num }}</div>
        </div>
      </div>
    </div>
    <div class="data-bar" v-show="isLoad" style="display: flex;">
      <div v-for="(it, index) in dataList" class="bar" v-show="it.ratio > 0" :style="{'width': it.ratio + '%', 'background': colorList[it.state], 'border-left': index === 0 || (dataList[index - 1] && dataList[index - 1]. ratio === 0) ? 'none' : '1px solid #ffffff' }"></div>
    </div>
    <div class="data-state" v-show="isLoad">
      <div v-for="(it, index) in dataList" :style="{'min-width': (it.ratio < 10 ? 10 : it.ratio) + '%'}" v-if="it.ratio > 0" class="state-body">
        <div class="state" :class="{'text-right': index === 2}" :style="{'color': colorList[it.state]}">{{ $t(`home.${it.state}`) }}</div>
      </div>
    </div>
    <loding v-show="!isLoad" :color="'#00c1de'"></loding>
  </div>
</template>

<script>
  import _ from 'lodash'
  import Loading from 'src/component/Loading'

  export default {
    name: 'BarRatio',
    props: ['param'],
    components: {
      'loding': Loading
    },
    created: function () {
      let data = this.param.data
      if (_.has(this.param.data, 'running') || _.has(this.param.data, 'connected')) this.isLoad = true
      let dataList = [{
        ratio: _.has(data, 'running') ? (data.running / data.total * 100) : (data.connected / data.total * 100),
        state: _.has(data, 'running') ? 'running' : 'connected',
        num: _.has(data, 'running') ? data.running : data.connected
      }, {
        ratio: _.has(data, 'running') ? (data.stopped / data.total * 100) : (data.disconnected / data.total * 100),
        state: _.has(data, 'running') ? 'stopped' : 'disconnected',
        num: _.has(data, 'running') ? data.stopped : data.disconnected
      }, {
        ratio: (data.unknown / data.total * 100),
        state: 'unknown',
        num: data.unknown
      }]
      this.dataList = dataList
      this.title = data.title
      this.total = data.total
    },
    destroyed: function () {
    },
    data () {
      return {
        isLoad: false,
        dataList: [],
        total: 0,
        title: null,
        colorList: {
          'running': '#45BB79',
          'stopped': '#EC5960',
          'unknown': '#FFB412',
          'connected': '#45BB79',
          'disconnected': '#EC5960'
        }
      }
    },
    methods: {
      init (data) {
        if (_.has(this.param.data, 'running') || _.has(this.param.data, 'connected')) this.isLoad = true
        let dataList = [{
          ratio: _.has(data, 'running') ? Math.round(data.running / data.total * 100) : Math.round(data.connected / data.total * 100),
          state: _.has(data, 'running') ? 'running' : 'connected',
          num: _.has(data, 'running') ? data.running : data.connected
        }, {
          ratio: _.has(data, 'running') ? Math.round(data.stopped / data.total * 100) : Math.round(data.disconnected / data.total * 100),
          state: _.has(data, 'running') ? 'stopped' : 'disconnected',
          num: _.has(data, 'running') ? data.stopped : data.disconnected
        }, {
          ratio: data.unknown > 0 ? (_.has(data, 'running') ? (100 - Math.round(data.running / data.total * 100) - Math.round(data.stopped / data.total * 100)) : (100 - Math.round(data.connected / data.total * 100) - Math.round(data.disconnected / data.total * 100))) : 0,
          state: 'unknown',
          num: data.unknown
        }]
        this.dataList = dataList
        this.title = data.title
        this.total = data.total
      }
    },
    watch: {
      'param.data': function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return
        this.init(newValue)
        this.$forceUpdate()
      }
    }
  }
</script>

<style scoped lang="less">
  .title {
    font-size: 20px;
    font-family:  PingFangSC-Regular;
    color: #1A2736;
    padding-top: 26px;
    margin-left: 30px;
  }

  .data-line {
    height: 80px;
    display: flex;
    padding: 0px 25px;
    margin-top: 20px;
    width: 88%;
  }

  .data-state {
    width: calc(100% - 60px);
    height: 20px;
    display: flex;
    padding: 0 30px;
    margin-top: 10px;
    font-size: 12px;
    font-family: PingFangSC-Regular;
    white-space: nowrap;
  }

  .data-state .state {
    padding-right: 20px;
    display: inline-block;
    overflow: hidden;
    font-size: 12px;
  }

  .data-state .state-body {
    display: inline-block;
  }

  .data-line .total {
    font-size: 60px;
    font-family:  PingFangSC-Regular;
    color: #1A2736;
    position: relative;
    flex: 3 3 auto;
  }

  .data-line .data-list {
    font-size: 12px;
    flex: 1 1 auto;
  }

  .data-line .data-list .item {
    display: flex;
    margin-bottom: 10px;
    align-items: baseline;
  }

  .data-line .data-list .point {
    width: 8px;
    height: 8px;
    border-radius: 5px;
    border: 1px solid #36B16C;
  }

  .data-line .data-list .state-name {
    color: #5E6978;
    font-family: PingFangSC-Regular;
    flex: 1 1 35%;
    flex-wrap: nowrap;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 12px;
  }

  .data-line .data-list .state-num {
    color: #1A2736;
    font-family: PingFangSC-Regular;
    flex: 1 1 30%;
  }

  .data-bar .bar {
    height: 6px;
    display: inline-block;
    border-left: 1px solid #ffffff;
  }

  .data-bar {
    width: calc(100% - 60px);
    height: 6px;
    border-radius: 4px;
    margin-top: 20px;
    margin-left: 30px;
    overflow: hidden;
  }

  .text-right {
    text-align: right;
  }

  .bar-container {
    position: relative;height: 100%;
    transition: all 1s;
    &:hover{
      box-shadow: 0px 3px 4px #ccc;
    }
  }

  .bar-container:hover{
    box-shadow: 1px 1px 1px #dae0e6, -1px -1px 1px #dae0e6;
  }
</style>
