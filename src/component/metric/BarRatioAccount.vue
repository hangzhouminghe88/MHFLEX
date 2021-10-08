<template>
  <div class="body">
    <div class="title">{{ title ? $t(`home.${title}`) : '' }}</div>
    <div class="data-line" v-show="isLoad">
      <div class="total">{{ `${data.used} / ${data.total}` }}</div>
    </div>
    <div class="total-bar" v-show="isLoad">
      <div class="enable" v-show="data.total" :style="{'width': (data.used/data.total) * 100 + '%' }"></div>
    </div>
    <div class="data-state" v-show="isLoad">
      <div class="state" style="color: #007FDF;">{{ $t("home.used") }}</div>
      <div class="state" style="text-align: right; color: #5E6978;">{{ $t("home.total") }}</div>
    </div>
    <!--<loding v-show="!isLoad" style="position: relative; top: 25%;"></loding>-->
  </div>
</template>

<script>
  import _ from 'lodash'
  // import Loading from 'src/components/Loding'

  export default {
    name: 'BarRatio',
    props: ['param'],
    components: {
      // 'loding': Loading
    },
    created: function () {
      if (_.has(this.param.data, 'total')) {
        this.data = this.param.data
        this.title = this.param.data.title
        this.total = this.param.data.total
        this.dataList = [{
          state: 'used',
          num: this.data.used
        }, {
          state: 'total',
          num: this.data.total
        }]
      }
    },
    destroyed: function () {
    },
    data () {
      return {
        data: [],
        total: 0,
        title: null,
        isLoad: false,
        colorList: {
          'used': '#1AA6FF',
          'total': '#EEF3F7'
        }
      }
    },
    methods: {
      init (data) {
        if (_.has(this.param.data, 'title')) {
          this.title = this.param.data.title
        }
        if (_.has(this.param.data, 'total')) {
          this.isLoad = true
          this.data = this.param.data
          this.title = this.param.data.title
          this.total = this.param.data.total
        }
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

<style scoped>
  .title {
    font-family: PingFangSC-Regular;
    font-size: 20px;
    color: #1A2736;
    letter-spacing: 0;
    padding-left: 30px;
    padding-top: 26px;
  }

  .data-line {
    width: 100%;
    height: 50px;
    display: flex;
    padding: 0 30px;
    margin: 50px 0 10px;

  }

  .data-state {
    width: 100%;
    height: 20px;
    display: flex;
    padding: 0 30px;
    margin-top: 10px;
    font-size: 12px;
    font-family: PingFangSC-Regular;
  }

  .data-state .state {
    font-family: PingFangSC-Regular;
    font-size: 12px;
    letter-spacing: 0;
    flex: 1;
  }

  .name {
    font-family: PingFangSC-Regular;
    font-size: 12px;
    color: #5E6978;
    letter-spacing: 0;
    padding-left: 34px;
    margin-bottom: 10px;
  }

  .data-line .total {
    font-family: PingFangSC-Light;
    font-size: 36px;
    color: #1A2736;
    letter-spacing: 0;
    position: relative;
    flex: 1;
    text-align: right;
  }

  .data-line .data-list {
    font-size: 12px;
    flex: 1 1 auto;
    margin-top: 20px;
  }

  .data-line .data-list .item {
    display: flex;
    margin-bottom: 10px;
    align-items: baseline;
  }

  .data-line .data-list .point {
    width: 10px;
    height: 10px;
    border-radius: 5px;
    border: 1px solid #36B16C;
  }

  .data-line .data-list .state-name {
    color: #5E6978;
    font-family: PingFangSC-Regular;
    flex: 3 1 auto;
  }

  .data-line .data-list .state-num {
    color: #1A2736;
    font-family: PingFangSC-Regular;
    flex: 2 1 auto;
    text-align: right;
  }

  .data-bar {
    width: calc(100% - 60px);
    height: 6px;
    border-radius: 4px;
    margin-top: 20px;
    margin-left: 30px;
    overflow: hidden;
  }

  .total-bar {
    width: calc(100% - 60px);
    height: 6px;
    background: #EEF3F7;
    border-radius: 100px;
    margin: 10px 0 0;
    overflow: hidden;
    font-size: 0;
    cursor: pointer;
    margin-left: 30px;
  }

  .total-bar .enable {
    background-image: linear-gradient(90deg, #007FDF 0%, #1AA6FF 100%);
    height: 6px;
    transition: width 0.2s;
    margin-right: 1px;
    display: inline-block;
  }

  .text-right {
    text-align: right;
  }
</style>
