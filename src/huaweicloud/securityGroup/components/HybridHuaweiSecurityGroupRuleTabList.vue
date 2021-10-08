<template>
  <div class="containre">
    <div class="detail-toolbar-container">
      <div class="detail-toolbar-left">
        <span class="tab-title">规则:&nbsp&nbsp</span>
        <span class="tab-container">
          <span
            class="tab-item"
            :class="{'tab-active': currSelectTab === 'ingress'}"
            @click="changeTab('ingress')"
          >入方向</span>
          <span
            class="tab-item"
            :class="{'tab-active': currSelectTab === 'egress'}"
            @click="changeTab('egress')"
          >出方向</span>
        </span>
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a
                v-permission="'SECURITY-GROUP.ADD-RULE'"
                style="padding-top: 12px;"
                @click="!isSelected && goToCreate()"
                :class="{'disabled-text': isSelected}"
              >添加规则</a>
              <a
                style="padding-bottom: 12px"
                @click="isSelected && deleteRules_Dlg()"
                :class="{'disabled-text': !isSelected}"
              >删除规则</a>
            </div>
          </span>
        </drop-down>
      </div>
      <div class="detail-toolbar-right">
        <span style="padding: 0 15px;display: inline-block;">
          <el-input
            placeholder="请输入内容"
            v-model="searchStr"
            @blur="search()"
            @change="search()"
          >
            <el-select
              v-model="selectVal"
              slot="prepend"
              placeholder="请选择"
              style="width: 100px"
            >
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
        <span
          @click="refresh()"
          class="btn-refresh"
        >
          <i class="el-icon-refresh icon"></i>
        </span>
      </div>
    </div>
    <div
      class="page-table"
      style="padding-top: 20px;"
    >
      <mh-table
        :data-source="dataSource"
        :loading="windowData.loading"
      ></mh-table>
    </div>
  </div>
</template>

<script>
import MultiSelectList from "src/windows/Base/MultiSelectList";
import WindowBase from "src/windows/Window";
import { formatDatetime } from 'src/utils/utils';
import rpc from "src/utils/rpc";
export default {
  name: "HybridHuaweiSecurityGroupRuleTabList",
  mixins: [MultiSelectList, WindowBase],
  props: {
    param: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    let _this = this;
    return {
      currSelectTab: "ingress",
      selectVal: "portRange",
      searchStr: "",
      conditionNameList: [
        {
          name: "hybridSecurityGroupRule.portRange",
          value: "portRange"
        },
        {
          name: "CIDR",
          value: "cidrIp"
        }
      ],
      itemList: [],
      dataSource: {
        getItemList: () => _this.itemList,
        handleSelection: _this.handleSelect,
        handleSort: _this.handleSort,
        type: "selection",
        fields: [
          {
            getContent: item => _this.getField("protocol", item),
            getHeaderContent: _this.$t("hybridSecurityGroupRule.protocol"),
            tooltip: true
          },
          {
            getContent: item => _this.getField("portRangeMax", item),
            getHeaderContent: '最大端口',
            tooltip: true
          },
          {
            getContent: item => _this.getField("portRangeMin", item),
            getHeaderContent: '最小端口',
            tooltip: true
          },
          {
            getContent: item => _this.getField("cidrIp", item),
            getHeaderContent: _this.$t("hybridSecurityGroupRule.cidrIp"),
            tooltip: true
          },
          {
            getContent: item => _this.getField("ethertype", item),
            getHeaderContent: 'Ip类型',
            tooltip: true
          },
          {
            getContent: item => _this.getField("createDate", item),
            getHeaderContent: _this.$t("common.createDate"),
            sortable: true,
            tooltip: true
          }
        ]
      }
    };
  },
  created() {
    let _this = this, dataUuid = _this.param.uuid ? _this.param.uuid : '';
    _this
      .updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: "createDate",
        sortDirection: "-",
        selectedUuidList: [],
        loading: false,
        dataUuid
      })
      .then(() => {
        _this.queryList();
      });
  },
  methods: {
    getField(field, item) {
      let _this, normalFields = ['protocol', 'portRangeMax', 'portRangeMin', 'cidrIp'];
      if(normalFields.includes(field)) return item[field] === 'null' || item[field] ? _this.$t('operationLog.all') : item[field];
       if(field === 'cidrIp') return  item[field] === 'null' || item[field] ? '0.0.0.0/0' : item[field];
       if(field === 'createDate') return formatDatetime(new Date(item[field]));
    },
    changeTab(tabName) {
      let _this = this;
      if (tabName === _this.currSelectTab) return;
      _this.currSelectTab = tabName;
    },
    async queryList() {
      const _this = this;
      let resp = await rpc.query("hybrid/huawei/security-group-rule", {
        count: false,
        start: (_this.windowData.pageIndex - 1) * _this.windowData.pageSize,
        limit: _this.windowData.pageSize,
        replyWithCount: true,
        q: _this.getCondition(),
        sort: `${_this.windowData.sortDirection}${_this.windowData.sortBy}`
      });
      let direction = _this.currSelectedTab;
      resp.inventories = resp.inventories.filter(
        item => item.direction === direction
      );
      let totalNum = resp.inventories.length;
      _this.updateWindow({
        pageCount:
          totalNum === 0 ? 1 : Math.ceil(totalNum / _this.windowData.pageSize),
        availableCount: totalNum
      });
      let uuidList = resp.inventories.map(item => item.uuid);
      _this.updateDbTable({
        tableName: "hybridHuaweiSecurityGroupRule",
        list: resp.inventories
      });
      _this.updateWindow({ uuidList, table });
    },

    getCondition() {
      const _this = this;
      let conditionList = [];
      conditionList.push(`ecsSecurityGroupUuid=${_this.windowData.dataUuid}`);
      if (_this.selectVal !== "" && _this.searchStr !== "") {
        conditionList = conditionList.concat(
          `${_this.selectVal}~=%25${encodeURIComponent(_this.searchStr)}%25`
        );
      }
      return conditionList;
    },
    goToCreate() {
      let _this = this;
      _this.param.setAddRuleParam({
        ok: (msg) => {
         return _this.addRule(msg)
          .then(() => _this.queryList())
        }
      })
      _this.param.openCreateSgRule();
    },
    addRule(param) {
      let self = this;
      let event = self.createEvent("hybridSecurityGroupRule.action.addRule");
      let msg = {
        groupUuid: self.windowData.dataUuid,
        ...param
      };
      return rpc.create(`hybrid/huawei/security-group-rule`, msg, event).then(
        resp => {
          let uuidList = this.windowData.uuidList.slice();
          this.updateWindow({ uuidList });
          self.updateDbRow({
            tableName: "hybridHuaweiSecurityGroupRule",
            id: resp.inventory.uuid,
            data: resp.inventory
          });
          self.incEventSuccess(event);
        }
      ).catch(() => {
         self.incEventFail(event);
      });
    }
  },
  watch: {
    'param.uuid':function (newVal, oldVal) {
      if(newVal !== oldVal) {
        this.updateWindow({
          dataUuid: newVal
        })
      }
    }
  }
};
</script>

<style lang="less" scoped>
.detail-toolbar {
  &-container {
    display: flex;
    justify-content: space-between;
  }
  &-right {
    padding: 0px 40px 0px 0px;
  }
}
.tab {
  &-title {
    font-size: 16px;
  }
  &-container {
    display: inline-block;
    border-radius: 3px;
    cursor: pointer;
    transition: all ease-out 0.5s;
    margin-right: 20px;
    background-color: #e9edfa;
  }
  &-item {
    display: inline-block;
    padding: 10px 20px;
    font-size: 12px;
  }
  &-active {
    background-color: #5e7ce0;
    transition: background-color cubic-bezier(0.5, 0.8, 0.5, 1) 0.5s,
      background-color ease-in 0.5s;
    color: #fff;
  }
}
</style>
