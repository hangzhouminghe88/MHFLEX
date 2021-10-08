<template>
  <div class="body" style="padding: 30px 0 0 30px;">
    <div class="title" :title="$t('home.title.billing')">{{ $t(`home.title.billing`)}}</div>
    <div class="sub-title" :title="`¥ ${decimalsFormatter(data.total)}`">¥ {{decimalsFormatter(data.total)}}</div>
    <div class="content">
      <div class="item">
        <div class="col-name" :title="$t('common.cpu')">{{ $t("common.cpu") }}</div>
        <div class="col-text" :title="decimalsFormatter(data.cpu)">{{ decimalsFormatter(data.cpu) }} </div>
      </div>
      <div class="item">
        <div class="col-name" :title="$t('common.memory')">{{ $t("common.memory")}}</div>
        <div class="col-text" :title="decimalsFormatter(data.memory)">{{ decimalsFormatter(data.memory) }} </div>
      </div>
      <div class="item">
        <div class="col-name" :title="$t('common.rootVolume')">{{ $t("common.rootVolume") }}</div>
        <div class="col-text" :title="decimalsFormatter(data.rootVolume)">{{ decimalsFormatter(data.rootVolume) }} </div>
      </div>
      <div class="item">
        <div class="col-name" :title="$t('common.dataVolume')">{{ $t("common.dataVolume") }}</div>
        <div class="col-text" :title="decimalsFormatter(data.dataVolume)">{{ decimalsFormatter(data.dataVolume) }} </div>
      </div>
      <div class="item" style="border-right: none;">
        <div class="col-name" :title="$t('common.gpuDevice')">{{ $t("gpuDevice.gpuDevice") }}</div>
        <div class="col-text" :title="decimalsFormatter(data.gpuDevice)">{{ decimalsFormatter(data.gpuDevice) }} </div>
      </div>
    </div>
  </div>
</template>

<script>
  import _ from 'lodash'
  import Utils from 'src/utils/utils'

  export default {
    name: 'BarRatio',
    props: ['param'],
    created: function () {
      this.init(this.param.data)
    },
    destroyed: function () {
    },
    data () {
      return {
        data: {}
      }
    },
    methods: {
      init (data) {
        // if (!_.has(data, 'time')) return
        this.data = data
      },
      decimalsFormatter: function (value) {
        if (!value) return 0
        let str = value.toString()
        if (str.indexOf('.') > -1 && str.split('.')[1].length > 3) return value.toFixed(3)
        else return value
      },
      ...Utils
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

<style scoped>
  .body {
    width: 100%;
    height: 100%;
    background: #ffffff;
  }

  .body .title {
    font-family: PingFangSC-Regular;
    font-size: 20px;
    color: #1A2736;
    letter-spacing: 0;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    margin-bottom: 20px;
  }

  .content {
    width: 100%;
    display: flex;
  }

  .content .item{
    flex: 1;
    width: 0;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #5E6978;
    letter-spacing: 0;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    text-align: left;
    border-right: 1px solid #F1F4F7;
    margin-right: 20px;
    height: 20%;
  }

  @media (max-width: 1680px) {
    .body .title {
      font-size: 28px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .body .item.time {
      flex: 2;
    }
  }

  .sub-title {
    font-family: PingFangSC-Regular;
    font-size: 36px;
    color: #1A2736;
    letter-spacing: 0.6px;
    line-height: 40px;
    margin-bottom: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .col-name {
    font-family: PingFangSC-Regular;
    font-size: 12px;
    color: #5E6978;
    letter-spacing: 0;
    margin-bottom: 3%;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .col-text {
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #1A2736;
    letter-spacing: 0;
    text-overflow: ellipsis;
    overflow: hidden;
  }
</style>
