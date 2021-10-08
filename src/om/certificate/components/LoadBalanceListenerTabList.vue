<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">{{ $t('common.listener') }}{{$t("common.colon")}}</span>
          <drop-down class="detail-dropdown">
              <span slot="title">
                <span id="common-actions" class="text">{{$t('common.actions')}}</span>
              </span>
            <span slot="content">
                <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
                  <a id="certificate-detach" v-permission="'LB_CERT.REMOVE_CERT_FROM_LISTENER'" @click="pageDetach()" :class="{ 'disabled-text': !isSelected}">
                    {{ $t('certificate.detach') }}
                  </a>
                </div>
              </span>
          </drop-down>
        </el-col>
        <el-col :span="10" style="text-align: right">
          <span style="padding: 0 15px;display: inline-block;">
            <el-input :placeholder="$t('common.searchPlaceholder')" v-model="searchStr" @blur="search()"
                      @change="search()">
               <el-select v-model="selectVal" slot="prepend" :placeholder="$t('common.searchLabelPlaceholder')"
                          style="width: 105px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </el-col>
      </el-row>
    </div>
    <el-table
    :data="itemList">
       <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
      <el-table-column type="selection"></el-table-column>
      <el-table-column :label="$t('common.name')" prop="name" sortable>
        <template slot-scope="scope">
          {{scope.row.name}}
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.protocol')" porp="protocol" sortable></el-table-column>
      <el-table-column :label="$t('common.certificate')" porp="protocol" sortable></el-table-column>
      <el-table-column :label="$t('loadbalancer.loadBalancerPort')" porp="loadBalancerPort" sortable></el-table-column>
      <el-table-column :label="$t('loadbalancer.instancePort')" porp="instancePort" sortable></el-table-column>
      <el-table-column :label="$t('common.createDate')" porp="createDate" sortable>
        <template slot-scope="scope">
          {{formatDatetime(new Date(scope.row.createDate))}}
        </template>
      </el-table-column>
    </el-table>
    <div class="page-table-pagination">
      <el-pagination v-if="windowData.availableCount > 0"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="windowData.pageSize"
        layout="sizes, prev, pager, next, jumper"
        :total="windowData.availableCount"
        class="page-table-pagination"
        @current-change="pageCurrentChange"
        @size-change="pageSizeChange"
        :current-page="windowData.pageIndex">
      </el-pagination>
    </div>
  </div>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import Utils from 'src/utils/utils';
  import {mapGetters} from 'vuex';
  import WindowBase from 'src/windows/Window';

  export default {
    name: "LoadBalanceListenerTabList",
    mixins: [MultiSelectList, WindowBase],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data(){
      return{
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name:  'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        itemList: []
      }
    },
    computed: {
      ...mapGetters({
        get: 'loadBalancerListener/getList'
      })
    },
    created(){
      let self = this, dataUuid = '';
      dataUuid = self.param.uuid ? self.param.uuid : '';
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        dataUuid
      })
        .then(() => {
          self.queryList();
        })
    },
    methods: {
      ...Utils,
      getCondition: function () {
        let conditionList = [],self = this;
        conditionList.push(`certificate.certificateUuid=${this.windowData.dataUuid}`)
        if (self.selectVal !== '' && self.searchStr !=='') {
          conditionList = conditionList.concat(`${self.selectVal} ~=%25${encodeURIComponent(self.searchStr)}%25`)
        }
        return conditionList
      },
      queryList(){
        let self = this;
        return self.dispatchAction('loadBalancerListener/query',{
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: this.getCondition(),
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
        }).then((resp) => {
          this.updateWindow({
            uuidList: resp.uuidList,
            table: Utils.createTableObjFromUuidList(resp.uuidList),
            pageCount: Utils.computePageCount(resp.total, this.windowData.pageSize),
            availableCount: resp.total
          })
        })
          .then(() => {
            self.itemList = self.get(self.windowData.uuidList);
          })
      },
      pageDetach() {
        let selectedUuidList = this.selectedList
        if (selectedUuidList.length === 0) return
        let certificateUuid = this.windowData.dataUuid
        this.openDialog('ConfirmDlg', {
          title: 'certificate.detach',
          description: 'certificate.detachConfirm',
          icon: 'certificate_n',
          uuidList: [selectedUuidList],
          ok: () => {
            this.detach(selectedUuidList, certificateUuid)
          },
          getName(uuid){
            let self = this;
            return self.dbData.loadBalancerListener[uuid].name;
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>
