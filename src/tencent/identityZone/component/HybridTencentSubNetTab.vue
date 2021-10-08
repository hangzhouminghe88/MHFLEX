<template>
  <div class="container">
    <div slot="page-toolbar" class="page-toolbar-container" style="display: flex;">
      <div class="page-toolbar-left">
        <span class="title">{{$t('common.hybridVSwitch') + $t('common.colon')}}</span>
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="padding-top: 12px;" @click="pageCreate()">{{$t('common.create')}}</a>
              <a
                style="padding-bottom: 12px;"
                :class="{'disabled-text': !isSelected}"
                @click="isSelected && pageDelete()"
              >{{$t('common.destroy')}}</a>
            </div>
          </span>
        </drop-down>
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
    </div>

    <div slot="page-table-content">
      <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
      <div class="page-table-pagination">
        <el-pagination
          v-if="windowData.availableCount > 0"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="windowData.pageSize"
          :total="windowData.availableCount"
          class="page-table-pagination"
          layout="total, sizes, prev, pager, next"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          :current-page="windowData.pageIndex"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import MultiSelectList from "src/windows/Base/MultiSelectList";
import VsubNetList from "src/tencent/hybridSubNet/List";
import { formatDatetime } from "src/utils/utils";
import PageBase from "src/windows/PageBase";
import WindowBase from "src/windows/Window";

export default {
	name: 'HybridTencnetSubNetTab',

  mixins: [MultiSelectList, PageBase, WindowBase, VsubNetList],

  props: {
    param: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },

  created() {
    let self = this,
      dataUuid = "";
    dataUuid = self.param.uuid ? self.param.uuid : "";
    self
      .updateWindow({
        dataUuid,
        pageIndex: 1,
        pageSize: 10,
        sortBy: "createDate",
        sortDirection: "-",
        loading: true,
        selectedUuidList: [],
        methods: {
          query: self.queryList
        }
      })
      .then(() => {
        self.queryList();
      });
  },

  data() {
    let self = this;
    return {
      selectVal: "name",
      searchStr: "",
      itemList: [],
      conditionNameList: [
        {
          name: "common.name",
          value: "name"
        },
        {
          name: "common.uuid",
          value: "uuid"
        }
      ],
      dataSource: {
        getItemList: () => self.itemList,
        handleSelection: self.handleSelect,
        handleSort: self.handleSort,
        type: "selection",
        fields: [
          {
            getContent: item => self.getField("name", item),
            getHeaderContent: self.$t("common.name"),
            field: "name",
            sortable: true,
            className: "link",
            onClick: item => {
              self.param.goToAliCloudVSwitch({ uuid: item.uuid });
            },
            tooltip: true
          },
          {
            getContent: item => self.getField("izoneName", item),
            getHeaderContent: self.$t("hybridvswitch.identityZone"),
            field: "identityZone",
            tooltip: true
          },
          {
            getContent: item => self.getField("vpcName", item),
            getHeaderContent: self.$t("hybridvswitch.vpc"),
            field: "ecsVpcUuid",
            tooltip: true
          },
          {
            getContent: item => self.getField("vSwitchId", item),
            getHeaderContent: self.$t("hybridvswitch.vSwitchId"),
            field: "vSwitchId",
            tooltip: true
          },
          {
            getContent: item => self.getField("cidrBlock", item),
            getHeaderContent: self.$t("hybridvswitch.cidr"),
            field: "cidr",
            tooltip: true
          },
          {
            getContent: item => self.getField("availableIpAddressCount", item),
            getHeaderContent: self.$t("hybridvswitch.availableIpAddressCount"),
            field: "availableIpAddressCount"
          },
          {
            getContent: item => self.getField("createDate", item),
            getHeaderContent: self.$t("common.createDate"),
            field: "createDate",
            sortable: true,
            tooltip: true
          }
        ]
      }
    };
  },

  methods: {
    getCondition() {
      let conditionList = [];
      let conditions =
        this.param && this.param.conditions ? this.param.conditions : [];
      conditionList = conditionList.concat(conditions);
      if (this.selectVal !== "" && this.searchStr !== "") {
        conditionList = conditionList.concat(
          `${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`
        );
      }
      return conditionList;
    },

    getField(field, item) {
      let self = this,
        normalFields = [
          "name",
          "vSwitchId",
          "cidrBlock",
					"availableIpAddressCount",
          "izoneName",
          "vpcName"
        ];
      if (_.includes(normalFields, field)) return item[field];
      if (field === "createDate") return formatDatetime(new Date(item[field]));
    },

    pageCreate() {
      let self = this;
      let vpcUuid = self.windowData.dataUuid;
      self.param.pageCreateVSwitch({
        vpcUuid: vpcUuid,
        ok: param => {
          return self.create(param).then(() => {
            self.queryList();
          });
        }
      });
    }
  }
};
</script>