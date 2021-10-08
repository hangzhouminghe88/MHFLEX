<template>
  <el-table :data="itemList" @sort-change="handleSort"
            @selection-change="handleSelection"
            v-loading="load"
            @row-click="handSingleSelect"
            :highlight-current-row="type === 'radio' ? true : false">
    <span slot="empty" class="table-nodata">
       <p class="empty-text" v-text="$t('common.noData')"></p>
    </span>
    <el-table-column :type="tableType" width="50px" v-if="tableType && tableType==='selection'"></el-table-column>
    <el-table-column :type="tableType" width="50px" v-if="tableType && tableType==='radio'">
      <template slot-scope="scope">
        <el-radio :label="scope.row.uuid" v-model="templateRadio">&nbsp</el-radio>
      </template>
    </el-table-column>
    <template  v-for="(item, index) in columns">
       <el-table-column
                     :key="index"
                     :prop="item.field"
                      v-if="item.type!=='slot'"
                     :sortable="item.sortable"
                     :label="item.getHeaderContent"
                     :render-header="item.renderHeader"
                     :show-overflow-tooltip="item.tooltip && item.tooltip"
    >
      <template slot-scope="scope">
        <table-body-item-state v-if="['state', 'status', 'ecsStatus'].includes(item.field)" :state="item.getContent(scope.row)"/>
        <div v-else-if="item.warningLevel && item.warningLevel">
          <base-icon :name="item.getContent && item.getContent(scope.row).icon"
                     style="
                     background-size: 25px;
                     vertical-align: middle;
                     background-position: 100% 35%;"/>
          {{item.getContent &&
          item.getContent(scope.row).content}}
        </div>
        <div v-else-if="item.progress && item.progress">
          <div class="progress-content" v-if="Number(item.getContent(scope.row).used)/Number(item.getContent(scope.row).total) <1">
            <div>{{item.getContent(scope.row).title && item.getContent(scope.row).title}}</div>
            <div class="total">
              <div class="progress-bar">
                  <span class="used" :style="{
                                'width': `${(item.getContent(scope.row) &&
                                Number(item.getContent(scope.row).used)/Number(item.getContent(scope.row).total)*100)}%`
                                }">
                </span>
              </div>
            </div>
            <span class="el-progress__text">{{`${(item.getContent(scope.row) &&
                                Number(item.getContent(scope.row).used)/Number(item.getContent(scope.row).total)*100)}%`}}</span>
          </div>
          <div v-else>
            已完成
          </div>
        </div>
        <div v-else-if="item.render">{{item.render(scope.row)}}</div>
        <span v-else :class="item.className && item.className" @click="item.onClick && item.onClick(scope.row)">{{item.getContent &&
          item.getContent(scope.row)}}
        </span>
      </template>
      </el-table-column>
       <el-table-column v-if="item.type==='slot'"
                      :label="item.getHeaderContent"
                      :key="index">
        <template slot-scope="scope">
          <slot name="tableSlot" :data="scope.row"></slot>
        </template>
      </el-table-column>
    </template>
  </el-table>
</template>

<script>
  import TableBodyItemState from "./TableBodyItemState";
  export default {
    name: "Table",
    components: {TableBodyItemState},
    props: {
      dataSource:{
        type:Object,
        default: () => {
          return {}
        },
        validate:(value) => {
          if(typeof(value) !== 'object'){
            throw new Error('Expend value is object')
          }
        },
        required: true
      },
      loading: {
        type: Boolean,
        default: false
      },
      rowClick: {
        type: Function
      },
      type: {
        type: String,
        default: ''
      }
    },
    computed: {
      itemList () {
        let self = this;
        return self.dataSource.getItemList() || []
      },
      handleSort(){
        let self = this;
        return self.dataSource.handleSort;
      },
      handleSelection(){
        let self = this;
        if(self.dataSource.handleSelection)
        return self.dataSource.handleSelection;
        return () => {}
      },
      tableType(){
        let self = this;
        if(self.type) return self.type;
        return self.dataSource.type;
      },
      columns() {
        let self = this;
        return self.dataSource.fields;
      },
      load(){
        let self = this;
        return self.loading;
      },
      handSingleSelect(){
        let self = this;
        if(self.dataSource.handSingleSelect){
          return self.dataSource.handSingleSelect;
        }
        return () => {}
      },
      templateRadio(){
        let self = this;
        if(self.dataSource.templateRadio)
        return self.dataSource.templateRadio();
      },
      getHeader() {
        return  h('div')
      }
    },
    // watch: {
    //   'dataSource.type': function(newVal, oldVal){
    //     let self = this;
    //     if(newVal !== oldVal)
    //       self.type = newVal
    //   }
    // }
  }
</script>

<style scoped>
  .total {
    height: 5px;
    width: 100%;
    padding-right: 50px;
    margin-right: -55px;
    display: inline-block;
  }
  .used{
    display: inline-block;
    height: 100%;
    background-color: #409EFF;
    border-radius: 100px;
    position: relative;
  }
  .used:before{
    -webkit-animation: animations 1s ease-in infinite;
    background: #fff;
    border-radius: 10px;
    bottom: 0;
    content: "";
    left: 0;
    opacity: 0;
    position: absolute;
    right: 0;
    top: 0
  }
  .progress-content{
    width: 100%;
  }
  .progress-bar{
    background-color: #eef3f7;
    height: 100%;
    border-radius: 100px;
  }

  @keyframes animations {
    from{
      background: #fff;
      width: 0;
      opacity: 0.2;
    }
    to{
      background: #409EFF;
      width: 100%;
      opacity: 1;
    }

  }
  .content{
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
</style>
