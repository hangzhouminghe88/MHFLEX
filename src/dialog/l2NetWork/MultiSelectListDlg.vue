<template>
  <dialog-template width="900px">
    <div slot="title" class="modal-plain-header">
      <span class="title" v-if="!windowData.vxlanNetworkPool">{{$t("common.selectL2network")}}</span>
      <span class="title" v-if="windowData.vxlanNetworkPool">{{$t("l2network.selectVxlanNetworkPools")}}</span>
      <span class="el-icon-close dialog-close" @click="cancel()"></span>
    </div>
    <div slot="body" class="el-dialog__body">
      <div style="margin: 30px 20px;">
        <div class="radio-group" style="text-align: right">
          <span style="padding: 0 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </div>
        <el-table
          :data="itemList"
          highlight-current-row
          @selection-change="handleSelect">
           <span slot="empty" class="table-nodata">
            <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
          <el-table-column width="50px" type="selection"></el-table-column>
          <el-table-column :label="$t('common.name')" prop="name"></el-table-column>
          <el-table-column :label="$t('common.physicalInterface')" prop="physicalInterface"
                           v-if="dbData.common.isAdmin">
          </el-table-column>
          <el-table-column :label="$t('common.type')" prop="type">
          </el-table-column>
          <el-table-column :label="$t('common.vlan')" prop="vlan">
          </el-table-column>
          <el-table-column :label="$t('common.createDate')">
            <template slot-scope="scope">
              {{new Date(scope.row.createDate) | formatDatetime}}
            </template>
          </el-table-column>
        </el-table>
        <div class="page-table-pagination">
          <el-pagination v-if="windowData.availableCount > 0"
            :page-sizes="[5, 10]"
            :page-size="5"
            :total="windowData.availableCount"
            class="page-table-pagination"
            layout="total, sizes, prev, pager, next"
            @current-change="pageCurrentChange"
            @size-change="pageSizeChange"
            :current-page="windowData.pageIndex"></el-pagination>
        </div>
      </div>
    </div>
    <div slot="footer" class="el-dialog__footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import TableBodyItemState from "../../component/TableBodyItemState";
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import L2NetWorkList from "src/network/l2network/List";
  import WindowBase from 'src/windows/Window';

  export default {
    name: "L2NetWorkMultiSelectDlg",
    components: {TableBodyItemState},
    mixins: [WindowBase, L2NetWorkList, MultiSelectList],
    created() {
      let self = this;
      let networkType = this.dialogData.param.conditions;
      self.networkType = networkType;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: []
      })
        .then(() => {
          this.queryList();
        })
    },
    data() {
      return {
        searchStr: '',
        selectVal: 'name',
        networkType: [],
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        itemList: []
      }
    },
    methods: {
      getCondition() {
        let conditionList = []
        conditionList.push(`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        conditionList = conditionList.concat(this.dialogData.param.conditions)
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }

        return conditionList
      },
      cancel() {
        let self = this;
        self.closeDialog(self.windowId);
      },
      search() {
        let self = this;
        self.updateWindow({
          pageIndex: 1
        }).then(() => {
          self.queryList();
        })
      },
      pageCurrentChange(val) {
        this.updateWindow({
          pageIndex: val
        })
      },
      pageSizeChange(val) {
        this.updateWindow({
          pageSize: val
        })
      },
      confirm() {
        let self = this;
        if(!self.isSelected) return;
        self.dialogData.param.select(self.selectedList);
        self.closeDialog(self.windowId);
      }

    }
  }
</script>

<style scoped>

</style>
