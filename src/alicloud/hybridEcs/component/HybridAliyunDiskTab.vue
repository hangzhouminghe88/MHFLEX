<template>
  <div class="container">
    <div slot="page-toolbar" class="page-toolbar-container" style="display: flex;">
      <div class="page-toolbar-left">
        <span class="title">{{$t('common.volume') + $t('common.colon')}}</span>
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.actions')}}</span>
          </span>
          <span slot="content">
           <div class="dropdown-content">
             <a style="padding-top: 12px;" @click="$router.push({name: 'createHybridAliCloudDisk'})">{{$t('common.create')}}</a>
              <a  :class="{'disabled-text': isSingleSelected}" @click="!isSingleSelected && pageAttach(windowData.dataUuid)">{{$t('common.attach')}}</a>
              <a style="padding-bottom: 12px;" :class="{'disabled-text': !canDetach()}" @click="canDetach() && pageDetach()">{{$t('common.detach')}}</a>
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
        <el-pagination v-if="windowData.total > 0"
                       :page-sizes="[5, 10]"
                       :page-size="5"
                       :total="windowData.total"
                       class="page-table-pagination"
                       layout="total, sizes, prev, pager, next"
                       @current-change="pageCurrentChange"
                       @size-change="pageSizeChange"
                       :current-page="windowData.pageIndex"></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import List from 'src/alicloud/hybridDisk/List';
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';

  export default {
    name: "HybridAliyunDiskTab",

    mixins: [WindowBase, MultiSelectList, PageBase, List],

    props: {
      param: {
        type: Object,
        default: () => {
          return {}
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
          queryList: self.queryList
        }
      }).then(() => {
        self.queryList();
      })
    },

    data() {
      let self = this;
      return {
        currTab: 'available',
        itemList: [],
        searchStr:  "",
        selectVal: 'name',
        conditionNameList: [{
          name: 'common.name',
          value: 'name'
        }, {
          name: 'common.uuid',
          value: 'uuid'
        }],
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              field: 'name',
              onClick: (item) => {
                self.$router.push({name: 'detailHybridAliCloudDisk', params: {uuid: item.uuid}})
              },
              className: 'link',
              sortable: true
            },
            {
              getContent: item => self.getField('diskId', item),
              getHeaderContent: self.$t('hybridAliyunDisk.diskId'),
              field: 'diskId',
              sortable: true
            },
            {
              getContent: item => self.getField('diskCategory', item),
              getHeaderContent: self.$t('hybridAliyunDisk.diskCategory'),
              field: 'diskCategory',
              sortable: true
            },
            {
              getContent: item => self.getField('sizeWithGB', item),
              getHeaderContent: self.$t('common.size'),
              field: 'sizeWithGB',
              sortable: true
            },
            {
              getContent: item => self.getField('diskChargeType', item),
              getHeaderContent: self.$t('hybridAliyunDisk.billingMethod'),
              field: 'diskChargeType',
              sortable: true
            },
            {
              getContent: item => self.getField('diskType', item),
              getHeaderContent: self.$t('hybridAliyunDisk.diskType'),
              field: 'diskType',
              sortable: true
            },
            {
              getContent: item => self.getField('identityZoneName', item),
              getHeaderContent: self.$t('common.hybrididentityzone'),
              field: 'identityZoneName',
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate',
              sortable: true
            }
          ]
        }
      }
    },

    methods: {
      getField(field, item) {
        let self = this, normalFields = ['diskId', 'identityZoneName'];
        if(_.includes(normalFields, field)) return item[field];
        if(field  === 'name') return item[field].replace(/ZStack-/ig,  '');
        if(field === 'diskCategory') return self.$t(`hybridAliyunDisk.${(item.diskCategory).toLowerCase()}`);
        if(field === 'sizeWithGB') return `${item[field]}G`;
        if(field === 'diskChargeType') return item[field] ? self.$t(`hybridAliyunDisk.${item[field]}`) : self.$t('hybridAliyunDisk.afterPayment');
        if(field === 'diskType') return self.$t(`hybridAliyunDisk.${item[field]}`);
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },

      getCondition() {
        let conditionList = []
        let conditions = this.param && this.param.conditions ? this.param.conditions : []
        conditionList = conditionList.concat(conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },

      pageDetach () {
        let self = this
        if (!self.isSelected || self.selectedList.length <= 0) return
        let uuidList = []
        self.selectedList.forEach((uuid) => {
          if (self.dbData.hybridAliyunDisk[uuid].diskType === 'data') uuidList.push(uuid)
        })
        if (uuidList.length <= 0) return
        self.openDialog('ConfirmDlg', {
          uuidList: uuidList,
          title:'hybridAliyunDisk.detach',
          description: 'hybridAliyunDisk.detachDisk',
          icon: 'volume_popupico',
          getName: (uuid) => {
            return self.dbData.hybridAliyunDisk[uuid].name;
          },
          ok: () => {
            self.detach(self.selectedList)
              .then(() => {
                self.queryList()
              })
          }
        })
      },

      pageAttach(uuid) {
        let self = this;
        self.openDialog('HybridAliCloudDiskMultiSelectList', {
          conditions: [`ecsInstanceUuid%20is%20null`, `identityZoneUuid=${self.dbData.hybridEcsInstance[uuid].identityZoneUuid}`],
          select: (diskUuidList) => {
            self.attach(uuid, diskUuidList)
              .then(() => {
                self.queryList()
              })
          }
        })
      },

      canDetach() {
        let self = this;
        if(!self.isSelected) {
          return false;
        }
        for (let i = self.selectedList.length - 1; i >= 0; i--) {
          if (self.dbData.hybridAliyunDisk[self.selectedList[i]].diskType === 'system') {
            return false
          }
        }
        return true
      }
    }
  }
</script>

<style scoped>

</style>
