<template>
  <div class="container">
    <div class="page-toolbar-container">
      <div class="page-toolbar-left">
        <span>Bucket:&nbsp&nbsp</span>
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('hybridbucket.BucketActions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="padding-top: 12px;" @click="pageCreate()">
                {{$t('common.create')}}
              </a>
              <a :class="{'disabled-text': !isSelected || canAttach()}" @click="isSelected && !canAttach() && pageAttach()">
                {{$t('common.setDefault')}}
              </a>
              <a style="padding-bottom: 12px" :class="{'disabled-text': !isSelected}" @click="isSelected && pageDelete ()">
                {{$t('common.destroy')}}
              </a>
            </div>
          </span>
        </drop-down>
      </div>
      <div class="page-toolbar-right">
        <div class="search">
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
        </div>

        <div class="btn-refresh" @click="refresh">
          <span class="refresh-icon"></span>
        </div>
      </div>
    </div>

    <div class="page-table">
      <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
    </div>
  </div>
</template>

<script>

  import MultiSelectList from 'src/windows/Base/MultiSelectList';
   import TencentBucketList from 'src/tencent/bucket/List'
  import { formatDatetime } from "src/utils/utils";
  import PageBase from 'src/windows/PageBase';
  import WindowBase from 'src/windows/Window';

  export default {
    name: "HybridTencentBucketTab",

    mixins: [MultiSelectList, WindowBase, PageBase, TencentBucketList],

    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },

    data() {
      let self = this;
      return {
        searchStr: '',
        selectVal: 'bucketName',
        conditionNameList: [
          {name: 'common.name', value: 'bucketName'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        itemList: [],
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('bucketName', item),
              getHeaderContent: self.$t('hybridbucket.bucketName'),
              onClick: (item) => {
                self.param.detailBucket({uuid: item.uuid, refresh: self.queryList})
              },
              className: 'link',
              tooltip: true,
              sortable: true,
              field: 'bucketName'
            },
            {
              getContent: item => self.getField('regionId', item),
              getHeaderContent: self.$t('hybridbucket.regionId'),
              tooltip: true,
              field: 'regionId'
            },
            {
              getContent: item => self.getField('regionName', item),
              getHeaderContent: self.$t('hybridbucket.region'),
              tooltip: true,
              field: 'region'
            },
            {
              getContent: item => self.getField('current', item),
              getHeaderContent: self.$t('common.default'),
              tooltip: true
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              tooltip: true,
              sortable: true,
              field: 'createDate'
            }
          ]
        }
      }
    },

      created() {
        let self = this, dataUuid = '';
        dataUuid = self.param.uuid ? self.param.uuid : '';
        self.updateWindow({
          dataUuid,
          pageIndex: 1,
          pageSize: 10,
          sortBy: 'createDate',
          sortDirection: '-',
          selectedUuidList: [],
          loading: false,
          methods: {
            query: self.queryList
          }
        }).then( () => {
          self.queryList();
        })
      },

      methods: {
        //查询条件
        getCondition () {
          let conditionList = []
          let conditions = this.param && this.param.conditions ? this.param.conditions : []
          conditionList = conditionList.concat(conditions)
          if (this.selectVal !== '' && this.searchStr !== '') {
            conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
          }
          return conditionList
        },
        //填充表格数据
        getField(field, item) {
          let self = this, normalFields = ['bucketName', 'regionName', 'regionId'];
          if(!item[field]) return '';
          if(_.includes(normalFields, field)) return item[field];
          if(field === 'current') return (item[field] && item[field] === 'true') ? self.$t('hybridKey.currentTrue') : self.$t('hybridKey.currentFalse');
          if(field === 'createDate') return formatDatetime(new Date(item[field]));
        },
        //创建Bucket
        pageCreate(dataCenterUuid = this.windowData.dataUuid) {
          let self = this;
          self.param.createBucket({
            dataCenterUuid: dataCenterUuid,
            ok: (param) =>{
              self.create(param).then(() => {
              self.queryList().then(() => {
                self.updateCount()
               })
             })
            }
          });
        },
      }
  }
</script>

<style scoped>
 .page-toolbar-container{
   display: flex;
   justify-content: space-between;
 }

  .refresh-icon{
    height: 11px;
    width: 11px;
    border-radius: 100%;
    border: 1px solid #ccc;
    display: inline-block;
  }
  .refresh-icon:before{
    height: 10px;
    width: 10px;
    border-radius: 100%;
    border: 1px solid #ccc;
    display: inline-block;
  }

  .search{
    display: inline-block;
    padding-right: 10px;
  }

  .btn-refresh{
    border: 1px solid #DCDFE6;
    padding: 11px 13px;
  }
</style>
