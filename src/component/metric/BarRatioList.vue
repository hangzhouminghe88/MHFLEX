<template>
  <div
    :class="{'flex-div': isLeft, 'is-double': isDouble}"
    class="ratio-content"
    style="position:relative;height: 100%;"
  >
    <div class="body-title">{{ title ? $t(`home.${title}`) : '' }}</div>
    <div v-show="isLoad" class="list-body" v-if="!isDouble && !isOpensource">
      <div v-for="(item, index) in dataList">
        <div
          v-if="item.enable != undefined"
          style="position: relative; padding-bottom: 10px;"
          :style="{'padding-top': index > 0 ? '10px' : 0}"
        >
          <div>
            <span class="title">{{ $t(`home.${item.name}`) }}</span>
            <span
              class="ratio"
            >{{ item.total > 0 ? `${item.enable} : ${item.total - item.enable}` : $t('common.empty') }}</span>
          </div>
          <el-popover placement="top" width="150" trigger="hover">
            <div class="tooltips">
              <div class="value-row">
                <span class="enable-ratio"></span>
                <span class="eanble-description">{{ $t("home.enable") }}</span>
                <span class="value">{{ item.enable }}</span>
              </div>
              <div class="value-row">
                <span class="disable-ratio"></span>
                <span class="disable-description">{{ $t("home.disable") }}</span>
                <span class="value">{{ item.total - item.enable }}</span>
              </div>
            </div>
            <div class="total" slot="reference">
              <div
                v-show="item.total > 0"
                class="enable"
                :style="{'width': (item.enable / item.total) * 100 + '%', 'margin-right': item.enable > 0? '1px' : 0 }"
              ></div>
              <div
                v-show="item.total > 0"
                class="disabled"
                :style="{'width': item.enable > 0 ? `calc(${(100 - (item.enable / item.total) * 100) + '%'} - 3px)` : `${(100 - (item.enable / item.total) * 100) + '%'}` }"
              ></div>
            </div>
          </el-popover>
        </div>
        <div v-else class="bashed-div" :style="{'padding-top': index === 0 ? 0 : '18px'}">
          <span class="title">{{ $t(`home.${item.name}`) }}</span>
          <span class="spliter" :style="{'top': index === 0 ? '10px' : '26px'}"></span>
          <span class="ratio">{{ item.total > 0 ? item.total : $t('common.empty') }}</span>
        </div>
      </div>
    </div>
    <div v-show="isLoad" class="list-body" v-if="!isOpensource && isDouble" style="display: flex;">
      <div class="list-body-left">
        <div v-for="(item, index) in dataList[0]">
          <div
            v-if="item.enable != undefined"
            style="position: relative; padding-bottom: 10px;"
            :style="{'padding-top': index > 0 ? '10px' : 0}"
          >
            <div>
              <span class="title">{{ $t(`home.${item.name}`) }}</span>
              <span
                class="ratio"
              >{{ item.total > 0 ? `${item.enable} : ${item.total - item.enable}` : $t('common.empty') }}</span>
            </div>
            <el-popover placement="top" width="150" trigger="hover">
              <div class="tooltips">
                <div class="value-row">
                  <span class="enable-ratio"></span>
                  <span class="eanble-description">{{ $t("home.enable") }}</span>
                  <span class="value">{{ item.enable }}</span>
                </div>
                <div class="value-row">
                  <span class="disable-ratio"></span>
                  <span class="disable-description">{{ $t("home.disable") }}</span>
                  <span class="value">{{ item.total - item.enable }}</span>
                </div>
              </div>
              <div class="total" slot="reference">
                <div
                  v-show="item.total > 0"
                  class="enable"
                  :style="{'width': (item.enable / item.total) * 100 + '%', 'margin-right': item.enable > 0? '1px' : 0 }"
                ></div>
                <div
                  v-show="item.total > 0"
                  class="disabled"
                  :style="{'width': item.enable > 0 ? `calc(${(100 - (item.enable / item.total) * 100) + '%'} - 1px)` : `${(100 - (item.enable / item.total) * 100) + '%'}` }"
                ></div>
              </div>
            </el-popover>
          </div>
          <div v-else class="bashed-div">
            <span class="title">{{ $t(`home.${item.name}`) }}</span>
            <span class="spliter"></span>
            <span class="ratio">{{ item.total > 0 ? item.total : $t('common.empty') }}</span>
          </div>
        </div>
      </div>
      <div class="list-body-right">
        <div v-for="(item, index) in dataList[1]">
          <div
            v-if="item.enable != undefined"
            style="position: relative; padding-bottom: 10px;"
            :style="{'padding-top': index > 0 ? '10px' : 0}"
          >
            <div>
              <span class="title">{{ $t(`home.${item.name}`) }}</span>
              <span
                class="ratio"
              >{{ item.total > 0 ? `${item.enable} : ${item.total - item.enable}` : $t('common.empty') }}</span>
            </div>
            <el-popover placement="top" width="150" trigger="hover">
              <div class="tooltips" :style="{ 'top': index > 0 ? '-40px' : '-50px' }">
                <div class="value-row">
                  <span class="enable-ratio"></span>
                  <span class="eanble-description">{{ $t("home.enable") }}</span>
                  <span class="value">{{ item.enable }}</span>
                </div>
                <div class="value-row">
                  <span class="disable-ratio"></span>
                  <span class="disable-description">{{ $t("home.disable") }}</span>
                  <span class="value">{{ item.total - item.enable }}</span>
                </div>
                <!-- <div class="hide-div"></div> -->
                <div class="angle"></div>
              </div>
              <div class="total" slot="reference">
                <div
                  v-show="item.total > 0"
                  class="enable"
                  :style="{'width': (item.enable / item.total) * 100 + '%', 'margin-right': item.enable > 0? '1px' : 0 }"
                ></div>
                <div
                  v-show="item.total > 0"
                  class="disabled"
                  :style="{'width': item.enable > 0 ? `calc(${(100 - (item.enable / item.total) * 100) + '%'} - 1px)` : `${(100 - (item.enable / item.total) * 100) + '%'}` }"
                ></div>
              </div>
            </el-popover>
          </div>
          <div v-else class="bashed-div">
            <span class="title">{{ $t(`home.${item.name}`) }}</span>
            <span class="spliter"></span>
            <span class="ratio">{{ item.total > 0 ? item.total : $t('common.empty')}}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-show="isLoad" class="list-body" v-if="isOpensource">
      <div class="tip-text">
        {{ $t("common.capabilityTipCurrent") + $t("common.productionName") + $t("about.community") }}{{ $t("common.capabilityTipGetMore") }}
        <a :href="`mailto:${$t('common.salesEmail')}`">{{ $t('common.salesEmail') }}</a>
      </div>
    </div>
    <loding v-show="!isLoad" :color="'#00c1de'"></loding>
  </div>
</template>

<script>
import _ from "lodash";
import Loading from "src/component/Loading";

export default {
  name: "BarRatioList",
  props: ["param"],
  components: {
    loding: Loading
  },
  created: function() {
    this.init(this.param.data);
  },
  destroyed: function() {},
  data() {
    return {
      dataList: [],
      isLeft: false,
      isDouble: false,
      title: "",
      isOpensource: false,
      isLoad: false
    };
  },
  methods: {
    init(data) {
      if (data.title) this.title = data.title;
      if (data.isLeft) this.isLeft = data.isLeft;
      if (_.has(data, "isOpensource")) this.isOpensource = data.isOpensource;
      let dataList = [];
      if (_.has(data, "dataList")) {
        this.isLoad = true;
        dataList = Array.from(data.dataList);
      }
      if (dataList) {
        if (dataList.length > 8) {
          let data = [];
          data[0] = dataList.slice(0, 6);
          data[1] = dataList.slice(6, dataList.length);
          this.dataList = data;
          this.isDouble = true;
        } else if (dataList.length === 8) {
          let data = [];
          data[0] = dataList.slice(0, 4);
          data[1] = dataList.slice(4, dataList.length);
          this.dataList = data;
          this.isDouble = true;
        } else {
          this.dataList = dataList;
          this.isDouble = false;
        }
      }
    }
  },
  watch: {
    "param.data": function(newValue, oldValue) {
      if (_.isEqual(newValue, oldValue)) return;
      this.init(newValue);
    }
  }
};
</script>

<style scoped lang="less">
.flex-div {
  display: flex;
}

.flex-div .body-title {
  flex: 1 1 2%;
  width: 0;
  padding-left: 26px;
  padding-top: 20px;
  padding-bottom: 20px;
}

.flex-div .list-body {
  flex: 3 3 auto;
  width: 0;
}

.is-double .list-body {
  display: flex;
}

.body-title {
  margin-bottom: 20px;
  font-size: 20px;
  font-family: PingFangSC-Regular;
  color: #1a2736;
  padding: 20px 26px;
}

.ratio-content {
  width: 100%;
  transition: all 1s;
  &:hover {
    box-shadow: 0px 3px 4px #ccc;
  }
}

// .ratio-content:hover{
//   box-shadow: 1px 1px 2px #dae0e6, -1px -1px 2px #dae0e6;
// }

.ratio-content .title {
  font-family: PingFangSC-Regular;
  font-size: 20px;
  color: #1a2736;
  letter-spacing: 0;
}

.list-body .title {
  font-family: PingFangSC-Regular;
  font-size: 14px;
  color: #5e6978;
  letter-spacing: 0;
  display: inline-block;
}

.list-body .ratio {
  font-family: PingFangSC-Regular;
  font-size: 14px;
  color: #1a2736;
  letter-spacing: 0;
  position: absolute;
  right: 0;
}

.list-body .total {
  width: 100%;
  height: 6px;
  background: #eef3f7;
  border-radius: 100px;
  margin: 10px 0 0;
  overflow: hidden;
  font-size: 0;
}

.list-body .total:hover .tooltips {
  display: block;
}

.list-body .total .enable {
  background-image: linear-gradient(90deg, #007fdf 0%, #1aa6ff 100%);
  height: 6px;
  transition: width 0.2s;
  margin-right: 1px;
  display: inline-block;
}

.list-body .total .disabled {
  background: #ffb412;
  height: 6px;
  transition: width 0.2s;
  display: inline-block;
  border: none;
}

.list-body .spliter {
  border-top: 2px dashed #eef3f7;
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
  padding-right: 20px;
}

.list-body .list-body-left {
  flex: 1;
  padding-right: 5%;
  padding-left: 5%;
}

.list-body .list-body-right {
  flex: 1;
  padding-left: 5%;
  padding-right: 5%;
}

.tooltips::after {
  display: block;
  content: "";
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
  width: 7px;
  height: 7px;
  border-radius: 100%;
  display: inline-block;
  margin: 3px 8px 3px 0px;
}

.tooltips .enable-ratio {
  background: #007fdf;
}

.tooltips .disable-ratio {
  background: #ffb412;
}

.tooltips .eanble-description {
  color: #007fdf;
}

.tooltips .disable-description {
  color: #f2ab13;
}

.tooltips .value {
  float: right;
  font-family: PingFangSC-Regular;
  font-size: 12px;
  color: #1a2736;
  letter-spacing: 0;
  line-height: 16px;
}

.tooltips .angle {
  /*  width: 20px;
      height: 20px;*/
  width: 0;
  height: 0;
  border: 10px solid transparent;
  border-top: 10px solid #e8eff4;
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

.tip-text {
  flex: 1;
  font-size: 14px;
  font-family: PingFangSC-Regular;
  color: #5e6978;
  line-height: 20px;
}

.tip-text a {
  display: initial;
  text-decoration: initial;
  color: #3c73b9;
}
.list-body {
  padding: 20px 26px;
}
</style>

