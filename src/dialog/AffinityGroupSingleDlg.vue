<template>
  <el-dialog :visible.async="visiabled" @close="close">
    <div slot="title">{{$t("affinityGroup.select")}}</div>
    <div style="padding:30px;overflow-y: hidden;">
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
        highlight-current-row
        @row-click="handleSingleSelect"
        :data="affinitygroupList">
         <span slot="empty" class="table-nodata">
              <p class="empty-text" v-text="$t('common.noData')"></p>
            </span>
        <el-table-column>
          <template slot-scope="scope">
            <el-radio :label="scope.row.uuid" v-model="templateRadio">&nbsp</el-radio>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          :label="$t('common.name')"></el-table-column>
        <el-table-column
          prop=""
          :label="$t('affinityGroup.affinityGroup')">
          <template slot-scope="scope">
            {{$t(`affinityGroup.${dbData.affinitygroup[scope.row.uuid].policy}`)}}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('affinityGroup.vmNums')">
          <template slot-scope="scope">
            {{scope.row.usages.length}}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.status')"></el-table-column>
        <el-table-column
          :label="$t('visualizationEditor.Type')"
          prop="type"></el-table-column>
        <el-table-column
          :label="$t('common.owner')">
          <template slot-scope="scope">
            {{dbData.affinitygroupA[scope.row.uuid].accountName}}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.createDate')">
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.createDate))}}
          </template>
        </el-table-column>
      </el-table>
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
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirmDlg">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
    </div>
  </el-dialog>
</template>

<script>
  import AffinityGroupList from 'src/ecs/affinityGroup/List';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';

  export default {
    name: "AffinityGroupSingleDlg",
    mixins: [WindowBase, AffinityGroupList],
    props: {
      model: {
        type: Boolean,
        default: false
      },
      message: {
        type: Object,
        default: ''
      }
    },
    data() {
      return {
        visiabled: false,
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        templateRadio: '',
        affinitygroupSelectList: [],
        affinitygroupList: []
      }
    },
    computed: {

    },
    methods: {
      ...Utils,
      handleSingleSelect(row) {
        this.templateRadio = row.uuid;
        this.affinitygroupSelectList = row;
      },
      close() {
        this.visiabled = false;
        this.$emit('close');
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
      confirmDlg() {
        let self = this;
        self.$emit('close', this.templateRadio);
      },
      getCondition: function () {
        let conditionList = []
        conditionList.push(`appliance=customer`)
        if (this.message.conditions && this.message.conditions) conditionList = conditionList.concat(this.message.conditions)
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}=${this.searchStr}`)
        }
        return conditionList
      },
      search() {
        let self = this;
        self.updateWindow({
          pageIndex: 1
        })
        this.queryList();
      }
    },
    mounted() {
      let self = this;
      self.visiabled = self.model;
      this.updateWindow({
        loading: false,
        sortBy: 'createDate',
        sortDirection: '-',
        pageIndex: 1,
        pageSize: 5
      }).then(() => {
        this.queryList();
        this.$forceUpdate()
      })
    },
    watch: {
      model(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.visiabled = newVal;
        }
      }
    }
  }
</script>

<style scoped>

</style>
