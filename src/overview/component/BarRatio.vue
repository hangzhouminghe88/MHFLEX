<template>
  <div class="left-item">
    <div class="left-item-header">
      <img src="~assets/overview_vm.svg" class="overview-icon" />
      {{ $t(`${metricParam.title}`) }}
      <img src="~assets/top5.svg" />
    </div>
    <div v-if="metricParam.isConnected" class="left-item-container">
      <div class="left-subitem" v-for="it in metricParam.dataList">
        <div class="left-subitem-left">
          <div v-if="!it.empty" class="list-text-item">
            {{it.name}}
          </div>
          <div v-else class="list-text-item"></div>
        </div>
        <div class="ratio-bar-container">
          <div class="ratio-bar-background"></div>
          <div class="ratio-bar progress-image" :style="{'width': `${it[`${metricParam.type}Data`]}%`, 'background-color': getColorByRatio(it[`${metricParam.type}Data`])}"></div>
        </div>
        <div class="left-subitem-right">
          <span v-if="!it.empty" class="list-text-item">{{it[`${metricParam.type}Data`]}}%</span>
        </div>
      </div>
    </div>
    <div class="nodate-left" v-else>
      <div class="nodeta-text">
        <img src="~assets/nodate.svg">
        <p>
          {{ $t("overview.noData") }}
        </p>
        </img>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "BarRatio",
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data(){
      return {
        metricParam: null
      }
    },
    created(){
      let self = this;
      self.metricParam = self.param;
    },
    methods: {
      getColorByRatio: function (ratio) {
        if (ratio >= 80.0) return '#E04A17'
        if (ratio >= 60.0) return '#DBBF0F'
        return '#15DDAA'
      },
    },
    watch: {
      'param': function(newVal, oldVal){
        let self = this;
        if(newVal === oldVal) return;
        self.metricParam = newVal;
      }
    }
  }
</script>

<style scoped>
  .left-item {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding-bottom: 17px;
  }

  .left-item-header {
    position: relative;
    width: 100%;
    height: 40px;
    line-height: 40px;
    font-size: 16px;
    color: #fff;
  }

  .left-item-header img {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }

  .left-item-header .overview-icon {
    position: relative;
    left: 0;
    margin-right: 20px;
  }

  .left-item-container {
    display: block;
    flex-direction: column;
    flex: 1;
  }

  .left-subitem {
    position: relative;
    height: 33px;
    width: 100%;
  }

  .left-subitem-left {
    display: inline-block;
    position: relative;
    height: 33px;
    width: calc(100% - 50px);
    float: left;
  }

  .left-subitem-right {
    display: inline-block;
    position: relative;
    height: 100%;
    width: 50px;
    float: right;
    text-align: right;
  }

  .left-subitem-right .list-text-item {
    color: #fff;
  }

  .ratio-bar-container {
    position: absolute;
    bottom: 0;
    width: 100%;
    /*padding: 0 25px 0 25px*/
  }

  .ratio-bar-background {
    position: relative;
    top: 50%;
    height: 5px;
    background: #eef3f7;;
  }

  .ratio-bar {
    position: absolute;
    top: 0;
    height: 100%;
    background: #fff;
    transition: width 0.6s ease;
    border-radius: 5px;
  }

  .list-text-item {
    position: absolute;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: #97BEFF;
  }

  .progress-image{
    background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);
    -webkit-background-size: 40px 40px;
    background-size: 40px 40px;
    animation: reverse progress-bar-stripes 0.40s linear infinite, animate-positive 2s;
  }

  @-webkit-keyframes animate-positive{
    0% { width: 0; }
  }
  @keyframes animate-positive{
    0% { width: 0; }
  }
  @keyframes progress-bar-stripes{
    from{background-position:40px 0}
    to{background-position:0 0}
  }
</style>
