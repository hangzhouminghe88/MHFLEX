<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{$t('common.timer')}}</span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs v-model="currTab" @tab-click="changeCurrTab">
            <el-tab-pane :label="`${$t('common.available')}(${windowData.availableCount ? windowData.availableCount : '0'})`" name="available"></el-tab-pane>
            <el-tab-pane :label="`${$t('operationLog.completed')}(${windowData.doneCount ? windowData.doneCount : '0'})`" name="done"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex" justify="between-space">
        <div class="page-toolbar-left">
          <span class="btn-success" v-permission="'TIMER.ADD'" @click="goToCreate()">
            <i class="el-icon-plus icon"></i>
            {{ $t("timer.create")}}
          </span>
          <drop-down
            class="dropdown btn-primary more"
            :enabled="isSelected"
            :class="{'disabled': !isSelected}"
          >
            <span slot="title">
              <i class="el-icon-more"></i>
              <span class="text">{{ $t("common.moreActions") }}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
								<a style="height: 25px; line-height: 25px;"
								 v-if="isSingleSelected && currTab !== 'done'"
                 @click="createSchedulerJob(selectedList[0])">{{$t('timer.action.createJob')}}</a>
                <a style="height: 25px; line-height: 25px;"
                  :class="{'disabled-text': !isSelected}"
                  @click="isSelected && pageDelete(selectedList)">{{$t('common.destroy')}}</a>
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
    <div slot="page-table-content">
      <el-table
			:data="itemList"
			@selection-change="handleSelect"
      v-loading="windowData.loading"
      >
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="$t('common.name')">
					<template slot-scope="scope">
						<span class="link" @click="goToDetail(scope.row.uuid)">{{scope.row.name}}</span>
					</template>
				</el-table-column>
        <el-table-column :label="$t('timer.strategy')">
					<template slot-scope="scope">
						{{$t('timer.execute', {length: scope.row.repeatCount})}}
					</template>
				</el-table-column>
        <el-table-column :label="$t('timer.startTime')">
					<template slot-scope="scope">
						{{scope.row.startTime && formatDatetime(new Date(scope.row.startTime))}}
					</template>
				</el-table-column>
        <el-table-column :label="$t('timer.cycle')">
					<template slot-scope="scope">
						{{showInterval(scope.row.schedulerInterval)}}
					</template>
				</el-table-column>
        <el-table-column :label="$t('timer.timerState')">
					<template slot-scope="scope">
					  <table-body-item-state slot="item" :state="timerIsDone(scope.row.uuid) ? 'Done' : 'Running'"/>
					</template>
				</el-table-column>
        <el-table-column :label="$t('common.createDate')">
					<template slot-scope="scope">
						{{scope.row.createDate && formatDatetime(new Date(scope.row.createDate))}}
					</template>
				</el-table-column>
      </el-table>
			 <div class="page-table-pagination">
        <el-pagination v-if="windowData.total > 0"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="windowData.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="windowData.total"
          class="page-table-pagination"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          :current-page="windowData.pageIndex"
        ></el-pagination>
      </div>
    </div>
  </page-template>
</template>

<script>
import TableBodyItemState from 'src/component/TableBodyItemState';
import PageTemplate from "src/component/PageTemplate";
import SchedulerList from 'src/om/timer/List';
import WindowBase from 'src/windows/Window';
import PageBase from 'src/windows/PageBase';
import Utils from 'src/utils/utils';
export default {
	name: "TimerPage",
	mixins: [PageBase, WindowBase, SchedulerList],
  components: {
		PageTemplate,
		TableBodyItemState
	},
	created(){
		let self = this;
		self.updateWindow({
			pageIndex: 1,
			pageSize: 10,
			sortBy: 'createDate',
			sortDirection: '-',
      selectedUuidList: [],
      loading: false,
			methods: {
				queryList: self.queryList
			}
		})
		.then(() => {
			self.queryList()
		})
	},
	computed: {
		isSelected(){
			let self = this;
			return self.windowData.selectedUuidList.length >= 1;
		},
		isSingleSelected(){
			let self = this;
			return self.windowData.selectedUuidList.length === 1;
		},
		selectedList(){
			let self = this;
			return self.windowData.selectedUuidList;
		}
	},
  data() {
    return {
      currTab: "available",
      selectVal: "name",
      searchStr: "",
      conditionNameList: [
        { name: "common.name", value: "name" },
        { name: "common.uuid", value: "uuid" }
			],
			itemList: []
    };
  },
  methods: {
		...Utils,
    search() {
			let self = this;
			self.updateWindow({
				pageIndex: 1
			})
			.then(()=> {
				self.queryList();
			})
		},
		refresh() {
			let self = this;
			self.updateWindow({
				pageIndex: 1
			})
			.then(()=> {
				self.queryList();
			})
		},
		pageSizeChange(val) {
      this.updateWindow({
        pageSize: val
      });
    },
    pageCurrentChange(val) {
      this.updateWindow({
        pageIndex: val
      });
		},
		changeCurrTab(e){
			let self = this;
			self.queryList();
		},
		handleSelect(rows){
			let self = this, uuidList = [];
			uuidList = rows.map((row) => {
				return row.uuid;
			})
			self.updateWindow({
				selectedUuidList: uuidList
			})
		},
		goToDetail(uuid){
			let self = this;
			self.$router.push({name: 'detailTimer', params: {uuid}});
		}
  }
};
</script>

