<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2.2">
          <span class="page-header-title">{{$t('common.image')}}</span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs v-model="currTab" @tab-click="handleChangeTab">
            <el-tab-pane
              :label="'私有镜像' + `(${windowData.privateCount ? windowData.privateCount : '0'})`"
              name="Private"
            ></el-tab-pane>
            <el-tab-pane
              :label="'系统镜像' + `(${windowData.goldCount ? windowData.goldCount : '0'})`"
              name="gold"
            ></el-tab-pane>
            <el-tab-pane
              :label="'上传中' + `(${windowData.uploadingCount ? windowData.uploadingCount : '0'})`"
              name="uploding"
            ></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-left">
          <span class="btn-success" v-if="currTab === 'Private'" @click="goToCreate()">
            <i class="el-icon-plus icon"></i>
            <span class="text">私有镜像</span>
          </span>
          <span
            class="btn-primary"
            v-if="['Private', 'gold'].includes(currTab)"
            :class="{'disabled': !isSelected}"
            @click="isSelected && pageDelete()"
          >
            <i class="el-icon-remove icon"></i>
            <span class="text">{{$t('common.destroy')}}</span>
          </span>
        </div>
        <div class="page-toolbar-center"></div>
        <div class="page-toolbar-right">
          <span style="padding: 0 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
              <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                <el-option
                  v-for="(item, index ) in conditionNameList"
                  :label="$t(`${item.name}`)"
                  :key="index"
                  :value="item.value"
                ></el-option>
              </el-select>
              <span slot="append">
                <i class="el-icon-search icon"></i>
              </span>
            </el-input>
          </span>
          <span @click="refresh()" class="btn-refresh">
            <i class="el-icon-refresh icon"></i>
          </span>
        </div>
      </el-row>
    </div>
    <div slot="page-table-content">
      <mh-table
        :data-source="dataSource"
        :loading="windowData.loading"
        v-if="['Private', 'gold'].includes(currTab)"
      ></mh-table>
      <mh-table
        :data-source="uploadDataSource"
        :loading="windowData.loading"
        v-if="!['Private', 'gold'].includes(currTab)"
      ></mh-table>
      <div class="page-table-pagination">
        <el-pagination
          :page-sizes="[10,20.50,1000]"
          v-if="windowData[`${currTab}Count`] > 0"
          :page-size="windowData.pageSize"
          :current-page="windowData.pageIndex"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          :total="windowData[`${currTab}Count`]"
          layout="total, sizes, prev, pager, next, jumper"
        ></el-pagination>
      </div>
    </div>
  </page-template>
</template>

<script>
import MultiSelectList from "src/windows/Base/MultiSelectList";
import { formatDatetime } from "src/utils/utils";
import PageTemplate from "src/component/PageTemplate";
import WindowBase from "src/windows/Window";
import HuaweiImageList from "./List";

export default {
  name: "HybridHuaweiImagePage",
  mixins: [MultiSelectList, WindowBase, HuaweiImageList],
  components: {
    PageTemplate
  },
  data() {
    let self = this;
    return {
      selectVal: "name",
      searchStr: "",
      currTab: "Private",
      conditionNameList: [
        { name: "common.name", value: "name" },
        { name: "common.uuid", value: "uuid" }
      ],
      itemList: [],
      uploadItemList: [],
      dataSource: {
        getItemList: () => self.itemList,
        handleSelection: self.handleSelect,
        handleSort: self.handleSort,
        type: "selection",
        fields: [
          {
            getContent: item => self.getField("name", item),
            getHeaderContent: self.$t("common.name"),
            onClick: item => {
              self.$router.push({
                name: "detailHybridHuaweiImage",
                params: {
                  uuid: item.uuid,
                  currTab: self.currTab
                }
              });
            },
            className: self.currTab !== "uploading" ? "link" : "",
            sortable: true,
            tooltip: true,
            field: "name"
          },
          {
            getContent: item => self.getField("platform", item),
            getHeaderContent: self.$t("common.platform"),
            field: "platform"
          },
          {
            getContent: item => self.getField("type", item),
            getHeaderContent: self.$t("hybridimage.type"),
            field: "type",
            sortable: true
          },
          {
            getContent: item => self.getField("ecsImageSize", item),
            getHeaderContent: self.$t("hybridimage.ecsImageSize"),
            field: "ecsImageSize"
          },
          {
            getContent: item => self.getField("ecsImageId", item),
            getHeaderContent: self.$t("hybridimage.ecsImageId"),
            field: "ecsImageId",
            tooltip: true
          },
          {
            getContent: item => self.getField("dataCenterName", item),
            getHeaderContent: self.$t("hybridimage.dataCenter"),
            field: "dataCenterName"
          },
          {
            getContent: item => self.getField("createDate", item),
            getHeaderContent: self.$t("common.createDate"),
            field: "createDate",
            sortable: true
          }
        ]
      },
      uploadDataSource: {
        getItemList: () => self.uploadItemList,
        handleSelection: self.handleSelect,
        handleSort: self.handleSort,
        type: "normal",
        fields: [
          {
            getContent: item => self.getField("name", item),
            getHeaderContent: self.$t("common.name"),
            sortable: true,
            tooltip: true,
            field: "name"
          },
          {
            getContent: item => self.getField("progress", item),
            getHeaderContent: self.$t("common.state"),
            tooltip: true,
            field: "state"
          },
          {
            getContent: item => self.getField("dataCenterName", item),
            getHeaderContent: self.$t("common.datacenter"),
            sortable: true,
            tooltip: true,
            field: "dataCenterUuid"
          }
        ]
      }
    };
  },
  created() {
    let self = this;
    self
      .updateWindow({
        pageIndex: 1,
        pageSize: 10,
        loading: false,
        selectedUuidList: [],
        sortBy: "createDate",
        sortDirection: "-",
        methods: {
          queryList: self.queryList
        }
      })
      .then(() => {
        self.queryList();
      });
  },
  methods: {
    getCondition() {
      let conditionList = [];
      const self = this;
      if (self.currTab !== "uploding") {
        conditionList = [`type=${self.currTab}`];
      }
      if (self.selectVal !== "" && self.searchStr !== "") {
        conditionList = conditionList.concat(
          `${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}`
        );
      }
      return conditionList;
    },
    //填充镜像数据
    getField(field, item) {
      let self = this,
        normalFields = ["name", "platform", "ecsImageId"];
      if (self.currTab !== "uploading") {
        if (normalFields.includes(field)) return item[field];
        if (field === "createDate")
          return formatDatetime(new Date(item[field]));
        if (field === "dataCenterName") {
          return item[field];
        }
        if (field === "type") return self.$t(`hybridTencentImage.${item.type}`);
        if (field === "ecsImageSize") return `${item.ecsImageSize} GB`;
      }
      if (self.currTab === "uploading") {
        if (field === "name") return item[field];
        if (field === "dataCenterName") {
          return self.getDataCenterName(item.dataCenterUuid);
        }
        if (field === "progress") {
          return {
            used: item["progress"]["progress"].replace("%", ""),
            total: 100
          };
        }
      }
    },
    goToCreate() {
      let _this = this;
      _this.$router.push({ name: "createHybridHuaweiImage" });
    },
    handleChangeTab() {
      let _this = this;
      _this
        .updateWindow({
          pageIndex: 1,
          pageSize: 10,
          sortBy: "createDate",
          sortDirection: "-",
          selectedUuidList: [],
          loading: false,
          methods: {
            queryList: _this.queryList
          }
        })
        .then(() => {
          _this.queryList();
        });
    }
  }
};
</script>

<style scoped>
</style>
