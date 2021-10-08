<template>
  <div class="body">
    <div class="title" :title="data.identityName ? `Hello ${data.identityName} !` : 'Hello'">{{ data.identityName ? `Hello ${data.identityName} !` : 'Hello' }}</div>
    <div class="content">
      <div class="item">{{ $t("home.systemTime") }}</div>
      <div class="item time" style="text-align: right;padding-right: 30px;" :title="data.time ? formatDatetime(new Date(data.time)) : ''">{{ data.time ? formatDatetime(new Date(data.time)) : '' }}</div>
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
        if (!_.has(data, 'time')) return
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
    background-image: url("~assets/vm_bg.svg");
    background-size: cover;
  }

  .body:hover{
    box-shadow: 1px 1px 1px #dae0e6, -1px -1px 1px #dae0e6;
  }

  .body .title {
    padding: 30px 0 0 30px;
    font-family: PingFangSC-Regular;
    font-size: 40px;
    color: #FFFFFF;
    letter-spacing: 0;
    margin-bottom: 104px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .content {
    width: 100%;
    display: flex;
  }

  .content .item{
    flex: 1;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #5E6978;
    letter-spacing: 0;
    padding-left: 30px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  @media (max-width: 1680px) {
    .body .title {
      font-size: 28px;
    }

    .body .item.time {
      flex: 2;
    }
  }
</style>

