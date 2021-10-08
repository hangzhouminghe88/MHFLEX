<template>
  <div class="single-select-container">
    <span style="display: inline-block; margin-bottom: 10px;">计算规格:&nbsp&nbsp{{templateRadio? `已选择${selectIOffing}` : ''}}</span>
    <el-table
      height="228px"
      :data="itemList"
      highlight-current-row
      @row-click="handleSingleSelect">
        <span slot="empty" class="table-nodata">
          <p class="empty-text" v-text="$t('common.noData')"></p>
        </span>
      <el-table-column
        width="100">
        <template slot-scope="scope">
          <el-radio :label="scope.row.uuid" v-model="templateRadio">&nbsp</el-radio>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('common.name')"
        prop="name"
      ></el-table-column>
      <el-table-column
        label="CPU"
        prop="cpuNum"></el-table-column>
      <el-table-column
        :label="$t('account.vmmemorySize')"
        prop="">
        <template slot-scope="scope">
          {{bytesToSize(scope.row.memorySize)}}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('instanceOffering.allocatorStrategy')"
        prop="allocatorStrategy">
        <template slot-scope="scope">
          {{$t(`instanceOffering.${scope.row.allocatorStrategy}`)}}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('common.create')"
        prop="createDate">
        <template slot-scope="scope">
          {{scope.row.createDate|dateFormat('yyyy-MM-dd hh:mm:ss')}}
        </template>
      </el-table-column>
      <el-table-column></el-table-column>
    </el-table>
  </div>
</template>

<script>

  import CreateInstanceAssistant from 'src/ecs/ecsInstance/Assistant/CreateInstanceAssistant';
  import Root from 'src/windows/Root';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import {mapGetters, mapState} from 'vuex';

  export default {
    name: "InstanceOfferingSingleSelect",
    mixins: [Root, WindowBase, CreateInstanceAssistant],
    props: {
      param: {
        type: String,
      }
    },
    data() {
      return {
        templateRadio: '',
        itemList: []
      }
    },
    computed: {
      ...mapState({
        instanceOffering: state => state.instanceOffering
      }),
      ...mapGetters({
        getList: 'instanceOffering/getList'
      }),

      selectIOffing(){
        let self = this;
        if(self.instanceOffering[self.templateRadio]){
          return self.dbData.instanceOffering[self.templateRadio].name;
        }
      }
    },
    created(){
      let self  = this;
      self.templateRadio = self.param;
    },
    mounted() {
      let self = this;
      self.queryInstanceOfferingForAssistant()
        .then(() => {
          this.queryIOffering()
        })
    },

    methods: {
      ...Utils,
      queryIOffering() {
        let self = this;
        return this.dispatchAction('instanceOffering/batchQuery', {
          replyWithCount: true,
          q: ['state!=Disabled', 'type=UserVm'],
          sort: `-createDate`
        }).then(resp => {
            this.updateWindow({
              uuidList: resp.uuidList,
              table: Utils.createTableObjFromUuidList(resp.uuidList),
              total: resp.total
            })
          }
        ).then(() => {
          self.itemList = self.getList(self.windowData.uuidList);
        })
      },
      handleSingleSelect(row) {
        this.templateRadio = row.uuid;
        this.$emit('selectInstanceOffering', this.templateRadio);
      },
    },
    watch: {
      'param': function(newVal , oldVal){
        let self = this;
        if(_.isEqual(newVal, oldVal)) return;
        self.templateRadio = newVal;
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
    }
  }
</script>

<style scoped>

</style>
