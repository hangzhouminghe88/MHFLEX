<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">{{ $t('common.l3network') }}{{$t("common.colon")}}</span>
          <drop-down class="detail-dropdown">
              <span slot="title">
                <span id="common-actions" class="text">{{$t('common.actions')}}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
                  <a id="securityGroup-attachl3network" style="padding-top: 12px;" @click="!isSelected && attachL3Network()">{{$t("securityGroup.attachl3network")}}</a>
                  <a id="securityGroup-detachl3network" style="padding-bottom:12px;" @click="isSelected && openDetachL3Network()" :class="{'disabled-text': !isSelected}">{{$t("securityGroup.detachl3network")}}</a>
                </div>
              </span>
          </drop-down>
        </el-col>
        <el-col :span="10" style="text-align: right">
          <span style="display: inline-block;">
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
    <div slot="page-table-content" style="max-height: 400px;">
      <el-table :data="itemList" @selection-change="handleSelect">
        <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection" width="55" style="padding-left: 15px;"></el-table-column>
        <el-table-column
                :label="$t('common.name')"
                width="120"
                prop="name"
                show-overflow-tooltip
                >
            <template slot-scope="scope">
              <span class="link" @click="goToDetail(scope.row.uuid)">{{scope.row.name}}</span>
            </template>
        </el-table-column>
        <el-table-column :label="$t('common.networkType')" prop="">
          <template slot-scope="scope">
            {{(dbData.l3network[scope.row.uuid].category === 'Public' || dbData.l3network[scope.row.uuid].category === 'System') ? $t(`common.${dbData.l3network[scope.row.uuid].category}`) : dbData.l3network[scope.row.uuid].networkServiceType ? $t(`l3network.type.${dbData.l3network[scope.row.uuid].networkServiceType}`) : ''}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.state')">
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.state"/>
          </template>
        </el-table-column>

        <el-table-column :label="$t('l3network.current')">
          <template slot-scope="scope">
            {{dbData.l3network[scope.row.uuid] && dbData.l3network[scope.row.uuid].availableCapacity | setCurrent(dbData.l3network[scope.row.uuid].totalCapacity)}}
          </template>
        </el-table-column>

        <el-table-column label="CIDR">
          <template slot-scope="scope">
            {{dbData.l3network[scope.row.uuid].ipRanges.length > 0 ? dbData.l3network[scope.row.uuid].ipRanges[0].networkCidr : void 0}}
          </template>
        </el-table-column>

        <el-table-column prop="createDate" :label="$t('common.createDate')"  sortable>
          <template slot-scope="scope">
            {{scope.row.createDate | dateFormat('yyyy-MM-dd hh:mm:ss')}}
          </template>
        </el-table-column>
      </el-table>
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
  </div>
</template>

<script>
  import WindowBase from 'src/windows/Window'
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import PageTemplate from "../../../component/PageTemplate";
  import Root from 'src/windows/Root';
  import TableBodyItemState from 'src/component/TableBodyItemState'
  import MultiSelectList from 'src/windows/Base/MultiSelectList'
  import L3NetworkList from 'src/network/l3network/List'

  export default {
    name: "L3NetworkTabListForSecurityGroup",
    mixins:[Root,WindowBase,MultiSelectList,L3NetworkList],
    props:['param'],
    components:{
      PageTemplate,
      TableBodyItemState
    },
    created() {
      this.updateWindow({
        dataUuid:this.param.uuid,
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        uuidList:[],
        methods: {
          queryList: this.queryList
        },
        conditions: this.param ? this.param.conditions : []
      }).then(() => this.queryList())

      window.addEventListener('click', this.onWindowClick)
    },
    updated() {
    },
    destroyed() {
      window.removeEventListener('click', this.onWindowClick)
    },
    data(){
      return{
        searchStr: '',
        selectVal: 'name',
        conditionNameList:[
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
    computed:{

    },
    methods:{
      ...Utils,
      getCondition: function () {
        let conditionList = []
        conditionList.push(`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        conditionList = conditionList.concat(this.param.conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      selectL3Network: function (uuidList) {
        let self = this
        let event = self.createEvent('securityGroup.action.attachl3network', uuidList.length > 1 ? '' : this.dbData.l3network[uuidList[0]].name, uuidList.length)
        if (uuidList.length === 0) return
        let tasks = []
        uuidList.forEach((uuid) => {
          let p = rpc.create(`security-groups/${this.windowData.dataUuid}/l3-networks/${uuid}`, null, event)
            .then((resp) => {
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        })
        return Promise.all(tasks).then(() => this.param.refresh().then(() => this.queryList()))
      },
      openDetachL3Network: function () {
        let self = this
        let uuidList = self.selectedList
        this.openDialog('ConfirmDlg', {
          title: 'securityGroup.detachl3network',
          icon: 'l3_popupico',
          description: 'securityGroup.info.detachL3Confirm',
          uuidList,
          ok: () => {
            self.detachL3Network(uuidList)
          },
          getName: (uuid) => {
            return self.dbData.l3network[uuid].name;
          }
        })
      },
      detachL3Network: function (uuidList) {
        const self = this
        let event = self.createEvent('securityGroup.action.detachl3network', uuidList.length > 1 ? '' : self.dbData.l3network[uuidList[0]].name, uuidList.length)
        let tasks = []
        uuidList.forEach((uuid) => {
          let p = rpc._delete(`security-groups/${self.windowData.dataUuid}/l3-networks/${uuid}`, null, event)
            .then((resp) => {
              self.incEventSuccess(event)
              self.queryList();
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        })
        return Promise.all(tasks).then(() => this.param.refresh().then(() => this.queryList()))
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({ showMoreDropdown: !this.windowData.showMoreDropdown })
        $event.stopPropagation()
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({ showMoreDropdown: false })
      },

      attachL3Network(){
        let self = this;
        self.openDialog('L3NetworkMultiSelectListDlg', {
          conditions: ['networkServices.networkServiceType=SecurityGroup', `uuid!?=${self.windowData.uuidList}`, 'system=false'],
          select: (uuidList) => self.selectL3Network(uuidList)
        })
      },

      //跳转到详情页
      goToDetail(uuid) {
        let self = this, router = 'detailPublicNetwork';
        switch(self.dbData.l3network[uuid].category) {
          case 'Public':
            router = 'detailPublicNetwork';
            break;
          case 'System':
            router = 'detailSystemNetwork';
            break;
          case 'Private':
            router = 'detailPrivateNetwork';
            break;
          default:
            router = 'detailPublicNetwork';
        }
        self.$router.push({name:router, params: {uuid}})
      }
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
      },
       setCurrent(available, total) {
         if(available && total) {
           return `${available} / ${total}`
         }
       }
    },
    watch: {
      'param': function (newValue, oldValue) {
        if (!_.isEqual(newValue, oldValue)) {
          this.updateWindow({
            conditions: this.param && this.param.conditions ? this.param.conditions : [],
            dataUuid: this.param && this.param.uuid
          }).then(() => this.queryList())
        }
      }
    }

  }
</script>

<style scoped>
  .dropdown {
    display: inline-block;
    position: relative;
    background: #FFFFFF;
    border: 1px solid #D7DCE2;
    border-radius: 2px;
    top: -2px;
    height: 30px;
    color: #3C73B9;
    padding-left: 10px;
    cursor: pointer;
    font-size: 0;
  }

  .dropdown .text {
    position: relative;
    top: 2px;
    font-size: 14px;
  }
</style>

