<template>
  <page-template>
    <div slot="page-header" style="height: 60px; line-height: 60px;">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{$t('common.zone')}}</span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs v-model="currTab">
            <el-tab-pane :label="`${$t('common.available')}(${windowData.availableCount?windowData.availableCount:'0'})`" name="available"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex" justify="space-between">
        <el-col :span="10">
          <span class="btn-success" @click="openCreateZone"><i class="el-icon-plus icon"></i> {{ $t("zone.create")}} </span>
          <span class="btn-primary" :class="{'disabled':!canEnable()}" @click.stop="canEnable() && pageEnable()"><i class="el-icon-caret-right icon"></i> {{ $t("common.enable")}} </span>
          <span class="btn-primary" :class="{'disabled':!canDisabled()}" @click.stop="canDisabled() && pageDisable()"><i class="el-icon-remove-outline icon"></i> {{ $t("common.disable") }} </span>
          <span class="btn-primary" :class="{'disabled':windowData.selectList.length<=0}" @click.stop="pageDelete()"><i class="el-icon-remove icon"></i> {{ $t("common.destroy") }} </span>
        </el-col>
        <el-col :span="10" style="text-align: right">
          <span style="padding: 0 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
          <span class="btn-refresh" @click="refresh()"><i class="el-icon-refresh icon"></i></span>
        </el-col>
      </el-row>
    </div>
    <div slot="page-table-content" style="max-height: 400px;">
      <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
      <el-pagination v-if="windowData.availableCount > 0"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="windowData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="windowData.availableCount"
        class="page-table-pagination"
        @current-change="pageCurrentChange"
        @size-change="pageSizeChange"
        :current-page="windowData.pageIndex">
      </el-pagination>
    </div>
  </page-template>
</template>

<script>
    import PageTemplate from "../../component/PageTemplate";
    import ZoneList from './List'
    import WindowBase from 'src/windows/Window';
    import Utils from 'src/utils/utils';

    export default {
      name: "ZoneListPage",
      mixins:[ZoneList,WindowBase],
      components: {
        PageTemplate,
      },
      created: function () {
        this.updateWindow({
          pageIndex: 1,
          pageCount: 1,
          pageSize: 10,
          currItemUuid: '',
          sortBy: 'createDate',
          sortDirection: '-',
          selectList:[],
          loading: false,
          methods: {
            queryList: this.queryList
          }
        })
          .then(() => {
            this.queryList()
          })
      },
      data(){
        return {
          searchStr: '',
          selectVal: "name",
          currTab:'available',
          availableCount:0,
          showDownLoadOption: false,
          conditionNameList: [
            {
              name: 'common.name',
              value: 'name'
            },
            {
              name: 'common.uuid',
              value: 'uuid'
            }
          ],
          itemList: [],
          dataSource: {
            getItemList: () => this.itemList,
            handleSelection: this.handleSelection,
            handleSort: this.handleSort,
            type: 'selection',
            fields: [
              {
                getContent: item => this.getField('name', item),
                className: 'link',
                onClick: item => { this.$router.push({name: 'detailZone', params: {uuid: item.uuid}}) },
                getHeaderContent: this.$t('common.name'),
                field: 'name',
                sortable: true
              },
              {
                getContent: item => this.getField('state', item),
                getHeaderContent: this.$t('common.state'),
                field: 'state',
              },
              {
                getContent: item => this.getField('createDate', item),
                getHeaderContent: this.$t('common.createDate'),
                field: 'createDate',
                sortable: true
              },
            ]
          },
        }
      },
      methods: {
        ...Utils,
        getField (field, item) {
          if (_.isUndefined(item)) return ''
          let normalFields = ['name', 'state','name']
          if (_.includes(normalFields, field)) return item[field]
          if (field === 'createDate') return this.formatDatetime(new Date(item[field]))
        },
        pageSizeChange(val) {
          this.updateWindow({
            pageSize: val
          })
        },
        pageCurrentChange(val) {
          this.updateWindow({
            pageIndex: val
          })
        },
        handleSelection(val) {
          this.selectList = val;
          this.updateWindow({
            selectList: this.selectList
          })
        },
        handleSelectAll(val) {
          this.selectList = [];
          this.selectList = val;
          this.updateWindow({
            selectList: this.selectList
          })
        },
        handleSort(e) {
          if (e.order === 'ascending') {
            this.updateWindow({
              sortBy: e.prop,
              sortDirection: '+'
            })
          } else {
            this.updateWindow({
              sortBy: e.prop,
              sortDirection: '-'
            })
          }
          this.queryList();
        },
        refresh: function (uuid) {
          this.updateWindow({
            pageIndex: 1,
            searchStr:'',
            currItemUuid: '',
          })
          this.queryList()
          this.updateWindow()
        },
        search() {
          let self = this;
          self.selectList = [];
          self.updateWindow({
            pageIndex: 1,
            searchConditionList: `${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`
          }).then(() => {
            self.queryList();
          })
        },
      },
      filters: {
        dateFormat(val, fmt) { //author: meizz
          let value = new Date(val);
          var o = {
            "M+": value.getMonth() + 1,                 //月份
            "d+": value.getDate(),                    //日
            "h+": value.getHours(),                   //小时
            "m+": value.getMinutes(),                 //分
            "s+": value.getSeconds(),                 //秒
            "q+": Math.floor((value.getMonth() + 3) / 3), //季度
            "S": value.getMilliseconds()             //毫秒
          };
          if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (value.getFullYear() + "").substr(4 - RegExp.$1.length));
          for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
              fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
          return fmt;
        }
      }
    }
</script>

<style scoped>

</style>
