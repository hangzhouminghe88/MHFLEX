<template>
  <dialog-template>
    <span slot="title">
      <span>{{ $t("zwatchAlarm.selectMetric") }}</span>
      <span class="el-icon-close dialog-close" @click="cancel()"></span>
    </span>
    <div slot="body">
      <div style="margin: 30px 20px;">
        <div class="tab-content" v-if="showMetricItemType">
          <span class="tab-title">条目类型:</span>
          <span class="tab-item">
            <el-tabs tab-position="bottom" v-model="type" @tab-click="handleTabChange">
              <el-tab-pane
                v-for="(type,index) in metricItemTypes"
                :label="$t(`zwatchAlarm.${type}`)"
                :name="type"
                :key="index"
              ></el-tab-pane>
            </el-tabs>
          </span>
        </div>
        <el-table :data="metrics" @row-click="handleSingleSelect">
           <span slot="empty" class="table-nodata">
            <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
          <el-table-column width="50px;">
            <template slot-scope="scope">
              <el-radio v-model="templateRadio" :label="scope.row">&nbsp</el-radio>
            </template>
          </el-table-column>
          <el-table-column :label="$t('zwatchAlarm.item')">
            <template
              slot-scope="scope"
            >{{$t(`zwatchAlarm.metricName.${getResourceType(dialogData.param.namespace)}.${scope.row}`, {name: ''})}}</template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div slot="footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
import MRTEICS_CAT from "src/om/zwatchalarm/MetricsCat.json";
import METRICS from "src/om/zwatchalarm/Metrics.json";
import WindowBase from "../../windows/Window";
import Methods from "src/om/zwatchalarm/Methods";
export default {
  mixins: [WindowBase],
  name: "MetricListsDlg",
  data() {
    return {
      type: "All",
      templateRadio: "",
      metrics: [],
      showMetricItemType: false
    };
  },
  created() {
    let self = this;
    if (
      this.dialogData.param.namespace === "ZStack/VM" ||
      this.dialogData.param.namespace === "ZStack/Host" ||
      this.dialogData.param.namespace === "ZStack/VRouter"
    ) {
      this.showMetricItemType = true;
      this.metricItemTypes = this.filterCats();
    }
    self.metrics = self.filterMetrics()
  },
  methods: {
    ...{
      getResourceType: Methods.methods.getResourceType
    },
    cancel() {
      let self = this;
      self.closeDialog(self.windowId);
    },
    filterMetrics: function() {
      debugger
      let metrics = Object.keys(METRICS[this.dialogData.param.namespace]);
      if (this.dialogData.param.resource === "") return metrics;
      let resource = this.dialogData.param.resource;
      let obj = {
        vRouter: "VMUuid",
        vm: "VMUuid",
        host: "HostUuid",
        vip: "VipUUID",
        l3network: "L3NetworkUuid",
        backupStorage: "BackupStorageUuid",
        primaryStorage: "PrimaryStorageUuid",
        loadBalancer:"ListenerUuid"
      };
      let filterLabel = obj[resource];
      let filterMetrics = [];
      metrics.forEach(metric => {
        let item = METRICS[this.dialogData.param.namespace][metric];
        let isFilterLabel = item.labelNames.some(item => item === filterLabel);
        if (isFilterLabel) {
          filterMetrics.push(metric);
        }
      });
      return filterMetrics;
    },
    filterCats: function() {
      let cats = Object.keys(MRTEICS_CAT[this.dialogData.param.namespace]);
      cats.unshift("All");
      if (this.dialogData.param.resource === "") return cats;
      cats = cats.filter(item => {
        let metrics = this.filterMetricsForCat(item);
        if (metrics.length === 0) return false;
        return true;
      });
      return cats;
    },
    filterMetricsForCat: function(type) {
      if (type === "All") return METRICS[this.dialogData.param.namespace];
      let metricKeys = MRTEICS_CAT[this.dialogData.param.namespace][type];
      if (this.dialogData.param.resource === "") return metricKeys;
      let filterMetrics = this.filterMetrics();
      let metrics = metricKeys.filter(item =>
        filterMetrics.some(it => it === item)
      );
      return metrics;
    },
    handleTabChange(e) {
      let self = this;
      if (self.type === 'All') {
        this.metrics = self.filterMetrics()
        return
      }
      if (!MRTEICS_CAT[self.dialogData.param.namespace][self.type]) return
      let metrics = self.filterMetricsForCat(self.type)
      self.metrics = metrics
    },
    handleSingleSelect(row){
      let self = this;
      self.templateRadio = row;
    },
    confirm(){
      let self = this;
      if(!self.templateRadio) return;
      self.dialogData.param.ok(self.templateRadio);
      self.closeDialog(self.windowId);
    }
  }
};
</script>

<style scoped>
.tab-item {
  display: inline-block;
}
.tab-title {
  display: inline-block;
  top: -13px;
  position: relative;
  margin-right: 15px;
}
</style>
