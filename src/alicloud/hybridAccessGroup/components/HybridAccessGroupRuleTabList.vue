<template>
  <div class="container">
    <div class="page-toolbar-container">
      <div class="toolbar-left">
        <div class="title">{{$t('common.rule') + $t('common.colon')}}</div>
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a
                style="padding-top: 12px;"
                :class="{'disabled-text': isSelected}"
                @click="!isSelected && pageCreate()"
              >{{$t('hybridSecurityGroupRule.action.addRule')}}</a>
              <a
                :class="{'disabled-text': !isSelected}"
                @click="isSelected && pageDelete()"
                style="padding-bottom: 12px;"
              >{{$t('common.destroy')}}</a>
            </div>
          </span>
        </drop-down>
      </div>
      <div class="toolbar-right"></div>
    </div>
    <div class="page-table">
      <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
      <div class="page-table-pagination">
        <el-pagination
          v-if="windowData.availableCount > 0"
          :page-size="windowData.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          @current-change="pageCurrentChange"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="pageSizeChange"
          :current-page="windowData.pageIndex"
          :total="windowData.availableCount"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import MultiSelectList from "src/windows/Base/MultiSelectList";
import { formatDatetime } from "../../../utils/utils";
import PageBase from "src/windows/PageBase";
import WindowBase from "src/windows/Window";

export default {
  name: "HybridAliCloudSecurityGroupRuleTab",

  mixins: [WindowBase, MultiSelectList, PageBase],

  props: {
    param: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },

  data() {
    let self = this;
    return {
      selectVal: "portRange",
      searchStr: "",
      currSelectTab: "ingress",
      itemList: [],
      dataSource: {
        getItemList: () => self.itemList,
        handleSelection: self.handleSelect,
        handleSort: self.handleSort,
        type: "selection",
        fields: [
          {
            getContent: item => self.getField("sourceCidr", item),
            getHeaderContent: self.$t("nasAccessGroupRule.info.sourceCidr"),
            field: "sourceCidr",
            tooltip: true,
            sortable: true
          },
          {
            getContent: item => self.getField("rule", item),
            getHeaderContent: self.$t("nasAccessGroupRule.info.rw"),
            field: "rule"
          },
          {
            getContent: item => self.getField("priority", item),
            getHeaderContent: self.$t("nasAccessGroupRule.info.priority"),
            field: "priority"
          },
          {
            getContent: item => self.getField("createDate", item),
            getHeaderContent: self.$t("common.createDate"),
            field: "createDate",
            tooltip: true,
            sortable: true
          }
        ]
      }
    };
  },

  created() {
    let self = this,
      dataUuid = "";
    dataUuid = self.param.uuid ? self.param.uuid : "";
    self
      .updateWindow({
        dataUuid,
        loading: false,
        pageIndex: 1,
        pageSize: 10,
        sortBy: "createDate",
        sortDirection: "-",
        selectedUuidList: [],
        methods: {
          query: self.queryRule
        }
      })
      .then(() => {
        self.queryRule();
      });
  },

  methods: {
    queryRule() {
      self.windowData.loading = true;
      self.dispatchEvent("hybridAliCloudAccessGroupRule/basicQuery", {
          q: [`uuid=${windowData.dataUuid}`]
        })
        .then((resp) => {
          let rules = resp.inventories[0].rules;
          for (let row of rules) {
            this.tableData[row.uuid] = row;
            this.tableData[row.uuid].name = row.sourceCidr;
          }
          let uuidList = rules.map(item => item.uuid);
          this.updateDbTable({
            tableName: "nasAccessGroupRule",
            list: rules
          }).then(() => {
             self.windowData.loading = false;
            this.itemList = list;
          })
        });
    },
    changeCurrTab(tabName) {
      let self = this;
      if (tabName && tabName === self.currSelectTab) return;
      self.currSelectTab = tabName;
      self
        .updateWindow({
          pageIndex: 1,
          pageSize: 10,
          sortBy: "createDate",
          sortDirection: "-",
          selectedUuidList: []
        })
        .then(() => {
          self.queryList();
        });
    },
    getField(field, item) {
      if (!item[field]) return;
      let self = this,
        normalFields = ["sourceCidr", "rule", "priority", "priority"];
      if (normalFields.includes(field)) return item[field];
      if (field === "createDate") return formatDatetime(new Date(item[field]));
    },
    //删除权限组规则
    pageDelete() {
      let selectedUuidList = this.selectedList
      if (selectedUuidList.length === 0) return
      this.openDialog('ConfirmDlg',{
        title: 'nasAccessGroupRule.delete',
        description: 'nasAccessGroupRule.deleteConfirm',
        icon: 'pop_access_group_rule_n',
        uuidList: selectedUuidList,
        ok: () => {
          let event = self.createEvent('nasAccessGroupRule.action.create', selectedUuidList.length === 1 ? this.dbData.nasAccessGroupRule[selectedUuidList[0]].name : '', selectedUuidList.length);
          self.dispatchEventAction('hybridAliCloudAccessGroupRule/delete', selectedUuidList, null, event)
          .then((resp) => {
            this.queryRule()
          });
        },
        getName(uuid) {
          return this.dbData.nasAccessGroupRule[uuid].name;
        }
       })
    },
    pageCreate() {
      let self = this;
      self.param.pageCreateRule({
        accessGroupUuid: self.windowData.dataUuid,
        ok: msg => {
          let event = self.createEvent('nasAccessGroupRule.action.create', param.sourceCidrIp);
          return self.dispatchEventAction('hybridAliCloudAccessGroupRule/create', msg, null, event);
        }
      });
    }
  }
};
</script>

<style scoped>
.toolbar-left {
  flex: 1 1 auto;
}

.title {
  display: inline-flex;
  font-size: 14px;
  padding-right: 5px;
}
.page-toolbar-container {
  display: flex;
  justify-content: space-between;
}
</style>
