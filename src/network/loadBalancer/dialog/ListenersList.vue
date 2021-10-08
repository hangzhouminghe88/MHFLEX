<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="tablist-title">{{ $t('loadbalancer.listener') }}{{$t("common.colon")}}</span>
          <drop-down class="detail-dropdown">
                        <span slot="title">
                            <span id="common-action" class="text">{{ $t("common.actions") }}</span>
                        </span>
            <span slot="content">
                            <div class="dropdown-content" :class="{'show':windowData.showMoreDropdown}">
                                <a id="loadbalancer-createListener" style="padding-top: 12px;"
                                   v-permission="'LB_LISTENER.CREATE'" :class="{ 'disabled-text': isSelected}"
                                   @click="$router.push({name:'createloadbalancerlistener', params: {portList: getLoadBalancerPort(windowData.dataUuid), vipUuid: dbData.loadBalancer[windowData.dataUuid].vipUuid, uuid: windowData.dataUuid }})">{{ $t('loadbalancer.createListener') }}</a>
                                <a id="loadbalancer-deleteLoadBalancerListener" style="padding-bottom:12px;"
                                   v-permission="'LB_LISTENER.DELETE'" @click="isSelected && pageDelete()"
                                   :class="{ 'disabled-text': !isSelected}">{{ $t('loadbalancer.deleteLoadBalancerListener') }}</a>
                            </div>
                        </span>
          </drop-down>
        </el-col>
        <el-col :span="10" style="text-align: right">
                    <span style="display: inline-block;">
                        <el-input :placeholder="$t('common.searchPlaceholder')" v-model="searchStr" @blur="search()"
                                  @change="search()">
                            <el-select v-model="selectVal" slot="prepend"
                                       :placeholder="$t('common.searchLabelPlaceholder')" style="width: 105px">
                                <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)"
                                           :key="index" :value="item.value"></el-option>
                            </el-select>
                            <span slot="append"><i class="el-icon-search icon"></i></span>
                        </el-input>
                    </span>
        </el-col>
      </el-row>
    </div>
    <el-table :data="itemList" @selection-change="handleSelect">
           <span slot="empty" class="table-nodata">
            <p class="empty-text" v-text="$t('common.noData')"></p>
           </span>
      <el-table-column type="selection" width="55" style="padding-left: 15px;"></el-table-column>
      <el-table-column :label="$t('common.name')" prop="name"></el-table-column>
      <el-table-column prop="protocol" :label="$t('common.protocol')" sortable>
        <template slot-scope="scope">
          {{scope.row.protocol}}
        </template>
      </el-table-column>
      <el-table-column prop="certificate" :label="$t('common.certificate')">
        <template slot-scope="scope">
          {{scope.row.certificate}}
        </template>
      </el-table-column>
      <el-table-column prop="loadBalancerPort" :label="$t('loadbalancer.loadBalancerPort')">
        <template slot-scope="scope">
          {{scope.row.loadBalancerPort}}
        </template>
      </el-table-column>
      <el-table-column prop="instancePort" :label="$t('loadbalancer.instancePort')">
        <template slot-scope="scope">
          {{scope.row.instancePort}}
        </template>
      </el-table-column>
      <el-table-column prop="loadBalancerStatus" :label="$t('loadbalancer.loadBalancerStatus')">
        <template slot-scope="scope">
          {{`${dbData.loadBalancerListenerA[scope.row.uuid].up} /
          ${dbData.loadBalancerListenerA[scope.row.uuid].total}`}}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('common.createDate')"
        prop="createDate">
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
  import LoadBalancerListenerList from 'src/network/loadBalancerListener/List';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window'
  import Utils from 'src/utils/utils'
  import Root from 'src/windows/Root'

  export default {
    name: "ListenersList",
    mixins: [WindowBase, Utils, Root, LoadBalancerListenerList, MultiSelectList],
    props: {
      param: {
        type: String
      }
    },
    data() {
      return {
        searchStr: '',
        selectVal: 'name',
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
        itemList: []
      }
    },
    created() {
      if (this.param) {
        let dataUuid = this.param
        this.updateWindow({
          dataUuid,
          pageIndex: 1,
          pageCount: 1,
          pageSize: 20,
          sortBy: 'protocol',
          sortDirection: '-',
          currItemUuid: '',
          selectedUuidList: [],
          methods: {
            queryList: this.queryList
          }
        })
          .then(() => {
            return this.getIsOpensource()
          })
          .then(() => {
            this.queryList()
          })
      }
      window.addEventListener('click', this.onWindowClick)
    },
    methods: {
      getCondition: function () {
        let conditionList = []
        conditionList.push(`loadBalancerUuid=${this.windowData.dataUuid}`)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.selectVal}%25`);
        }
        return conditionList
      },
      getLoadBalancerPort (uuid) {
        return this.dbData.loadBalancer[uuid].listeners.map((item) => item.loadBalancerPort)
      },
    }
  }
</script>

<style scoped>

</style>
