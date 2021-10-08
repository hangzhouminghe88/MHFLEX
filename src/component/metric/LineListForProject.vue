<template>
  <div class="body" style="padding: 26px 0 0 30px;">
    <div class="title">{{ $t(`home.vm`)}}</div>
    <div class="content">
      <div class="item">
        <div class="col-name">{{ $t("home.used") }}</div>
        <div class="col-value" :style="{color: stateColorList[0]}">
          {{data.used}}
        </div>
        <div class="total">
          <div class="tooltips" :style="{ 'top': '-30px' }">
            <div class="value-row">
              <!--  <span class="enable-ratio"></span> -->
              <span class="eanble-description">KVM {{ $t("home.used") }}</span>
              <span class="value">{{ data.used - data.vcenterVM }}</span>
            </div>
            <div class="value-row">
              <!-- <span class="enable-ratio"></span> -->
              <span class="eanble-description">ESX {{ $t("home.used") }}</span>
              <span class="value">{{ data.vcenterVM }}</span>
            </div>
            <div class="value-row">
              <!--  <span class="disable-ratio"></span> -->
              <span class="disable-description">{{ $t("home.total") }}</span>
              <span class="value">{{ data.total }}</span>
            </div>
            <div class="angle"></div>
          </div>
          <div v-show="total > 0" class="enable" :style="{'width': (data.used / data.total) * 100 + '%', 'background-image': colorList[0]}"></div>
        </div>
      </div>
      <div class="item">
        <div class="col-name">{{ $t("home.running")}}</div>
        <div class="col-value" :style="{color: stateColorList[1]}">
          {{data.running}}
        </div>
        <div class="total">
          <div class="tooltips" :style="{ 'top': '-30px' }" style="width: 190px; margin-left: -95px;">
            <div class="value-row">
              <!--               <span class="enable-ratio"></span> -->
              <span class="running-description">KVM {{ $t("home.running") }}</span>
              <span class="value">{{ isNaN(data.running - data.vcenterVmRunning) ? 0 : data.running - data.vcenterVmRunning }}</span>
            </div>
            <div class="value-row">
              <!--  <span class="enable-ratio"></span> -->
              <span class="running-description">ESX {{ $t("home.running") }}</span>
              <span class="value">{{ data.vcenterVmRunning }}</span>
            </div>
            <div class="value-row">
              <!-- <span class="disable-ratio"></span> -->
              <span class="disable-description">{{ $t("home.runningTotal") }}</span>
              <span class="value">{{ data.runningTotal }}</span>
            </div>
            <div class="angle"></div>
          </div>
          <div v-show="total > 0" class="enable" :style="{'width': (data.running / data.runningTotal) * 100 + '%', 'background': colorList[1]}"></div>
        </div>
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
        used: 5,
        total: 10,
        data: {},
        stateColorList: ['#007FDF', '#45BB79'],
        colorList: [' linear-gradient(90deg, #1AA6FF 0%, #007FDF 100%)', '#45BB79']
      }
    },
    methods: {
      init (data) {
        if (!_.has(data, 'running')) return
        this.data = data
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
    /*white-space: nowrap;*/
    text-align: left;
    border-right: 1px solid rgba(255,255,255,0.25);
    margin-right: 40px;
    position: relative;
  }

  @media (max-width: 1680px) {
    .body .title {
      font-size: 28px;
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
    margin-bottom: 50px;
  }

  .col-name {
    font-family: PingFangSC-Regular;
    font-size: 12px;
    color: #5E6978;
    letter-spacing: 0;
    margin-bottom: 7px;
  }

  .col-text {
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #1A2736;
    letter-spacing: 0;
  }

  .col-value {
    font-family: PingFangSC-Regular;
    font-size: 24px;
    letter-spacing: 0;
  }

  .total {
    width: 100%;
    height: 6px;
    background: #EEF3F7;
    border-radius: 100px;
    margin: 10px 0 0;
    overflow: hidden;
    font-size: 0;
  }

  .total:hover .tooltips {
    display: block;
  }

  .total .enable {
    height: 6px;
    transition: width 0.2s;
    margin-right: 1px;
    display: inline-block;
  }

  .tooltips {
    width: 140px;
    height: 86px;
    position: absolute;
    background: #FFFFFF;
    border: 1px solid #E8EFF4;
    box-shadow: 0 2px 4px 0 rgba(217,225,233,0.40);
    border-radius: 2px;
    left: 50%;
    top: -50px;
    margin-left: -70px;
    padding: 10px;
    display: none;
  }

  .tooltips::after {
    display: block;
    content: '';
    width: 0;
    height: 0;
    border: 10px solid transparent;
    border-top: 10px solid #ffffff;
    position: absolute;
    left: 50%;
    margin-left: -10px;
    top: 99%;
  }

  .tooltips .value-row {
    margin-bottom: 6px;
    font-family: PingFangSC-Regular;
    font-size: 12px;
  }

  .tooltips .enable-ratio,
  .tooltips .disable-ratio {
    width: 10px;
    height: 10px;
    border-radius: 5px;
    display: inline-block;
    margin-right: 8px;
  }

  .tooltips .enable-ratio {
    background: #007FDF;
  }

  .tooltips .disable-ratio {
    background: #FFB412;
  }

  .tooltips .eanble-description {
    color: #007FDF;
  }

  .tooltips .running-description {
    color: rgb(69, 187, 121);
  }

  .tooltips .disable-description {
    color: #5e6978;
  }

  .tooltips .value {
    float: right;
    font-family: PingFangSC-Regular;
    font-size: 12px;
    color: #1A2736;
    letter-spacing: 0;
    line-height: 16px;
  }

  .tooltips .angle {
    /*  width: 20px;
      height: 20px;*/
    width: 0;
    height: 0;
    border: 10px solid transparent;
    border-top: 10px solid #E8EFF4;
    position: absolute;
    left: 50%;
    margin-left: -10px;
    top: 100%;
  }

  .tooltips .hide-div {
    width: 30px;
    height: 16px;
    position: relative;
    background-color: #ffffff;
    top: -8px;
    left: 38px;
    z-index: 899;
  }
</style>
