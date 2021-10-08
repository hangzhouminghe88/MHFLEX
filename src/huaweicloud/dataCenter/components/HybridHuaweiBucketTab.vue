<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-left">
          <span class="text">Obs桶: &nbsp;&nbsp;</span>
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a style="padding-top: 12px" :class="{'disabled-text': isSelected}" @click="!isSelected && goToCreate()">创建Obs桶</a>
                <a :class="{'disabled-text': !isSelected}" @click="isSelected && pageAttach()">{{$t('common.attach')}}</a>
                <a :class="{'disabled-text': !isSelected}" @click="isSelected && pageDelete()">{{$t('common.destroy')}}</a>
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
      </el-row>
    </div>
    <div class="page-table-content">
      <mh-table :dataSource="dataSource" :loading="windowData.loading"></mh-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.availableCount > 0"
                       :page-size="windowData.pageSize"
                       :page-sizes="[10, 20, 50, 100]"
                       :current-page="windowData.pageIndex"
                       :current-change="pageCurrentChange"
                       :size-change="pageSizeChange"
                       layout="total, sizes, prev, pager, next, jumper, ->"
                       :total="windowData.availableCount"></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import HybridHuaweiObsList from 'src/huaweicloud/hybridHuaweiObs/List';
import MultiSelectList from "src/windows/Base/MultiSelectList";
import WindowBase from "src/windows/Window";

export default {
  name: "HybridHuaweiBucketTab",
  mixins: [MultiSelectList, WindowBase,HybridHuaweiObsList],
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
      selectVal: "bucketName",
      searchStr: "",
      itemList: [],
      conditionNameList: [
        {
          name: "common.name",
          value: "bucketName"
        },
        {
          name: "common.uuid",
          value: "uuid"
        }
      ],
      dataSource: {
        getItemList: () => _this.itemList,
        handleSelection: _this.handleSelect,
        handleSort: _this.handleSort,
        type: "selection",
        fields: [
          {
            getContent: item => _this.getField("bucketName", item),
            getHeaderContent: _this.$t('hybridbucket.bucketName'),
            onClick: item => {},
            tooltip: true,
            sortable: true,
            className: "link"
          },
          {
            getContent: item => _this.getField("regionId", item),
            getHeaderContent: _this.$t('hybridbucket.regionId'),
            tooltip: true,
          },
          {
            getContent: item => _this.getField("regionName", item),
            getHeaderContent: _this.$t('hybridbucket.region'),
            tooltip: true,
          },
          {
            getContent: item => _this.getField("current", item),
            getHeaderContent: _this.$t('common.default'),
            tooltip: true,
          },
          {
            getContent: item => _this.getField("createDate", item),
            getHeaderContent: _this.$t('common.createDate'),
            tooltip: true,
            sortable: true
          }
        ]
      }
    };
  },

  created() {
    let _this = this,
      dataUuid = "";
    dataUuid = _this.param.uuid ? _this.param.uuid : "";
    _this.updateWindow({
      dataUuid,
      pageIndex: 1,
      pageSize: 10,
      sortBy: "createDate",
      sortDirection: "-",
      selectedUuidList: [],
      loading: false,
      methods: {
        query: _this.queryList
      }
    }).then(() => {
      _this.queryList();
    });
  },

  methods: {
    getField(field, item) {},

    getCondition() {
      let _this = this, conditionList = [];
      if(_this.param.conditions) conditionList = conditionList.concat(_this.param.conditions);
      if(_this.selectVal !== '' || _this.searchStr !== '') {
        conditionList = conditionList.concat(`${_this.selectVal}~=${_this.searchStr}`);
      }
      return conditionList;
    },
    goToCreate() {
      let _this = this;
      _this.param.setCreateBucketParam({
        dataCenterUuid: _this.windowData.dataUuid,
        ok: (msg) =>{
          return _this.create(msg);
        }
      })
      _this.param.openCreateBucket();
    },
  }
};
</script>

<style lang="less" scoped>
</style>
