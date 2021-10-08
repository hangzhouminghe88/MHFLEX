<template>
  <div :class="{'flex-div': isLeft, 'is-double': isDouble}" class="ratio-content">
    <div v-show="isLoad" class="body-title">{{ title ? $t(`home.${title}`) : '' }}</div>
    <div v-show="isLoad" class="list-body" v-if="!isDouble" style="padding:20px 40px;">
      <div v-for="(item, index) in dataList">
        <div v-if="item.used != undefined" style="position: relative; padding-bottom: 10px;" :style="{'padding-top': index > 0 ? '10px' : 0}">
          <div>
            <span class="title">{{ $t(`home.${item.name}`) }}</span>
            <span class="ratio">{{ item.total > 0 ? `${item.used}/${item.total}` : $t('common.empty') }}</span>
          </div>
          <div class="total">
            <div class="tooltips" :style="{ 'top': index > 0 ? '-40px' : '-50px' }">
              <div class="value-row">
                <span class="enable-ratio"></span>
                <span class="eanble-description">{{ $t("home.used") }}</span>
                <span class="value">{{ item.used }}</span>
              </div>
              <div class="value-row">
                <span class="disable-ratio"></span>
                <span class="disable-description">{{ $t("home.total") }}</span>
                <span class="value">{{ item.total }}</span>
              </div>
              <div class="angle"></div>
            </div>
            <div v-show="item.total > 0" class="enable" :style="{'width': (item.used / item.total) * 100 + '%' }"></div>
          </div>
        </div>
        <div v-else class="bashed-div">
          <span class="title">{{ $t(`home.${item.name}`) }}</span>
          <span class="spliter"></span>
          <span class="ratio">{{ item.total}}</span>
        </div>
      </div>
    </div>
    <div v-show="isLoad" class="list-body" v-else style="display: flex;">
      <div class="list-body-left">
        <div v-for="(item, index) in dataList[0]">
          <div v-if="item.used != undefined" style="position: relative; padding-bottom: 10px;" :style="{'padding-top': index > 0 ? '10px' : 0}">
            <div>
              <span class="title">{{ $t(`home.${item.name}`) }}</span>
              <span class="ratio">{{ item.total > 0 ? `${item.used}/${item.total}` : $t('common.empty') }}</span>
            </div>
            <div class="total">
              <div class="tooltips" :style="{ 'top': index > 0 ? '-40px' : '-50px' }">
                <div class="value-row">
                  <span class="enable-ratio"></span>
                  <span class="eanble-description">{{ $t("home.used") }}</span>
                  <span class="value">{{ item.used }}</span>
                </div>
                <div class="value-row">
                  <span class="disable-ratio"></span>
                  <span class="disable-description">{{ $t("home.total") }}</span>
                  <span class="value">{{ item.total }}</span>
                </div>
                <div class="angle"></div>
              </div>
              <div v-show="item.total > 0" class="enable" :style="{'width': (item.used / item.total) * 100 + '%' }"></div>
            </div>
          </div>
          <div v-else class="bashed-div">
            <span class="title">{{ $t(`home.${item.name}`) }}</span>
            <span class="spliter"></span>
            <span class="ratio">{{ item.total}}</span>
          </div>
        </div>
      </div>
      <div class="list-body-right">
        <div v-for="(item, index) in dataList[1]">
          <div v-if="item.used != undefined" style="position: relative; padding-bottom: 10px;" :style="{'padding-top': index > 0 ? '10px' : 0}">
            <div>
              <span class="title">{{ $t(`home.${item.name}`) }}</span>
              <span class="ratio">{{ item.total > 0 ? `${item.used}/${item.total}` : $t('common.empty') }}</span>
            </div>
            <div class="total">
              <div class="tooltips" :style="{ 'top': index > 0 ? '-40px' : '-50px' }">
                <div class="value-row">
                  <span class="enable-ratio"></span>
                  <span class="eanble-description">{{ $t("home.used") }}</span>
                  <span class="value">{{ item.used }}</span>
                </div>
                <div class="value-row">
                  <span class="disable-ratio"></span>
                  <span class="disable-description">{{ $t("home.total") }}</span>
                  <span class="value">{{ item.total }}</span>
                </div>
                <div class="angle"></div>
              </div>
              <div v-show="item.total > 0" class="enable" :style="{'width': (item.used / item.total) * 100 + '%' }"></div>
            </div>
          </div>
          <div v-else class="bashed-div">
            <span class="title">{{ $t(`home.${item.name}`) }}</span>
            <span class="spliter"></span>
            <span class="ratio">{{ item.total}}</span>
          </div>
        </div>
      </div>
    </div>
    <loding v-show="!isLoad" :color="'#00c1de'"></loding>
  </div>
</template>

<script>
  import _ from 'lodash'
  import Loading from 'src/component/Loading'

  export default {
    name: 'BarRatioList',
    props: ['param'],
    components: {
       'loding': Loading
    },
    created: function () {
      this.init(this.param.data)
    },
    destroyed: function () {
    },
    data () {
      return {
        isLoad: false,
        dataList: [],
        isLeft: false,
        isDouble: false,
        title: ''
      }
    },
    methods: {
      init (data) {
        if (data.title) this.title = data.title
        if (data.isLeft) this.isLeft = data.isLeft
        let dataList = []
        if (_.has(data, 'dataList')) {
          this.isLoad = true
          dataList = Array.from(data.dataList)
        }
        if (dataList) {
          if (dataList.length > 5) {
            let data = []
            data[0] = dataList.slice(0, 5)
            data[1] = dataList.slice(5, dataList.length)
            this.dataList = data
            this.isDouble = true
          } else {
            this.dataList = dataList
            this.isDouble = false
          }
        }
      }
    },
    watch: {
      'param.data': function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return
        this.init(newValue)
      }
    }
  }
</script>

<style scoped>
  .flex-div {
    display: flex;
  }

  .flex-div .body-title {
    flex: 1 1 auto;
    width: 0;
  }

  .flex-div .list-body {
    flex: 3 3 auto;
    width: 0;
  }

  .body-title {
    margin-bottom: 30px;
    font-size: 20px;
    font-family: PingFangSC-Regular;
    color: #1A2736;
    padding: 20px 26px;
  }

  .ratio-content {
    width: 100%;
    height: 100%;
    position: relative;
    margin-bottom: 20px;
  }

  .ratio-content:hover{
    box-shadow: 1px 1px 1px #dae0e6, -1px -1px 1px #dae0e6;
  }

  .ratio-content .title {
    font-family: PingFangSC-Regular;
    font-size: 20px;
    color: #1A2736;
    letter-spacing: 0;
  }

  .list-body .title {
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #5E6978;
    letter-spacing: 0;
    display: inline-block;
  }

  .list-body .ratio {
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #1A2736;
    letter-spacing: 0;
    position: absolute;
    right: 0;
  }

  .list-body .total {
    width: 100%;
    height: 6px;
    background: #EEF3F7;
    border-radius: 100px;
    margin: 10px 0 0;
    overflow: hidden;
    font-size: 0;
  }

  .list-body .total:hover .tooltips {
    display: block;
  }

  .list-body .total .enable {
    background-image: linear-gradient(90deg, #007FDF 0%, #1AA6FF 100%);
    height: 6px;
    transition: width 0.2s;
    margin-right: 1px;
    display: inline-block;
  }

  .list-body .total .disabled {
    background: #FFB412;
    height: 6px;
    transition: width 0.2s;
    display: inline-block;
    border: none;
  }

  .list-body .spliter {
    border-top: 2px dashed #EEF3F7;
    width: 100%;
    display: inline-block;
    position: absolute;
    height: 0;
    top: 26px;
  }

  .bashed-div {
    position: relative;
    overflow: hidden;
    padding: 18px 0;
  }

  .bashed-div .title {
    padding-right: 20px;
    background: #ffffff;
  }

  .bashed-div .ratio {
    padding-left: 20px;
    background: #ffffff;
  }

  .flex-div .list-body {
    flex: 3 3 auto;
    width: 0;
    padding: 20px 40px;
  }

  .list-body .list-body-left {
    flex: 1;
    padding-right: 5%;
  }

  .list-body .list-body-right {
    flex: 1;
    padding-left: 5%;
  }

  .tooltips {
    width: 140px;
    height: 66px;
    position: absolute;
    background: #FFFFFF;
    border: 1px solid #E8EFF4;
    box-shadow: 0 2px 4px 0 rgba(217,225,233,0.40);
    border-radius: 2px;
    left: 50%;
    top: -30px;
    margin-left: -70px;
    padding: 10px;
    display: none;
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

  .tooltips .disable-description {
    color: #F2AB13;
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
    width: 10px;
    height: 10px;
    background-color: #ffffff;
    position: relative;
    transform: rotate(45deg);
    box-shadow: 0 2px 4px 0 rgba(217,225,233,0.40);
    left: 50%;
    margin-left: -5px;
  }

  .is-double .list-body {
    display: flex;
    padding: 20px 60px;
  }
</style>
