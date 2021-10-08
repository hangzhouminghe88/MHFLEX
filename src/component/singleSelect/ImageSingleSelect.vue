<template>
  <div class="single-select-container">
    <span class="single-select-title">镜像:&nbsp&nbsp{{templateRadio? `已选择${selectImage.name}` : ''}}</span>
    <div class="single-select-search">
     <div class="left">
       <el-radio-group v-model="currentImageType" @change="changeImageType">
         <el-radio-button label="Legacy"></el-radio-button>
         <el-radio-button label="UEFI"></el-radio-button>
       </el-radio-group>
     </div>
      <div class="right">
        <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
          <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
            <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index" :value="item.value"></el-option>
          </el-select>
          <span slot="append"><i class="el-icon-search icon"></i></span>
        </el-input>
      </div>
    </div>
    <el-table
      height="228px"
      :data="imageItemList"
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
        :label="$t('common.backupstorage')"
        prop="cpuNum">
        <template slot-scope="scope">
          {{dbData.image[scope.row.uuid].backupStorageRefs && dbData.image[scope.row.uuid].backupStorageRefs.length > 0 && dbData.backupstorage[dbData.image[scope.row.uuid].backupStorageRefs[0].backupStorageUuid] && dbData.backupstorage[dbData.image[scope.row.uuid].backupStorageRefs[0].backupStorageUuid].name}}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('image.imageType')"
        prop="mediaType">
        <template slot-scope="scope">
          {{dbData.image[scope.row.uuid].mediaType === 'DataVolumeTemplate' ? $t('image.volumeImage') : $t('image.systemImage')}}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('image.mediaType')"
        prop="format">
      </el-table-column>
      <el-table-column
        :label="$t('common.platform')"
        prop="platform">
      </el-table-column>
      <el-table-column
       :label="$t('volumeoffering.diskSize')"
        prop="size">
        <template slot-scope="scope">
          {{bytesToSize(scope.row.size)}}
        </template>
      </el-table-column>
      <el-table-column
      :label="$t('common.createDate')">
        <template slot-scope="scope">
          {{scope.row.createDate | dateFormat('yyy-MM-dd hh:mm:ss')}}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>

  import CreateInstanceAssistant from 'src/ecs/ecsInstance/Assistant/CreateInstanceAssistant';
  import {mapGetters} from 'vuex';
  import WindowBase from  'src/windows/Window';
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils';

  export default {
    name: "ImageSingleSelect",
    mixins: [WindowBase, Root, CreateInstanceAssistant],
    props: ['param'],
    data() {
      return {
        templateRadio: '',
        selectImage: {},
        currentImageType: 'Legacy',
        conditionNameList: [
          {name: 'common.name', value:'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        searchStr: '',
        selectVal: '',
        imageItemList: []
      }
    },
    computed: {
      ...mapGetters({
        getList: 'image/getList'
      }),
    },
    mounted() {
      let self = this;
      self.init
      self.queryImageForAssistant()
        .then(() => {
          this.queryImage()
      })
    },
    methods: {
      ...Utils,
      search(){
        let self = this;
        self.selectList = [];
        self.updateWindow({
          searchConditionList: `${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`
        }).then(()=>{
          self.queryImage();
        })
      },

      getCondition () {
        let conditionList = []
        let { conditions, withTab } = this.param;
        let { currSelectTab, searchConditionList } = this.windowData
        conditionList = conditionList.concat(conditions)
        conditionList.push('__systemTag__!=remote')
        if (true) {
          let isLegacy = this.currentImageType === 'Legacy'
          let tag = isLegacy ? '__systemTag__!=bootMode::UEFI' : '__systemTag__=bootMode::UEFI'
          conditionList.push(tag)
        }
        if (conditions && _.isArray(conditions)) {
          conditionList = conditionList.concat(conditions)
        }
        if (searchConditionList && searchConditionList.length > 0) {
          conditionList = conditionList.concat(searchConditionList)
        }
        return conditionList
      },
      changeImageType(){
        this.queryImage();
      },
      queryImage(){
        let self = this;
        return this.dispatchAction('image/query', {
          replyWithCount: true,
          sort: `-createDate`,
          q: this.getCondition()
        }).then(resp => {
            this.updateWindow({
              uuidList: resp.uuidList,
              table: Utils.createTableObjFromUuidList(resp.uuidList),
              total: resp.total
            })
          }
        ).then(() => {
          self.imageItemList = self.getList(self.windowData.uuidList)
        })
      },
      handleSingleSelect(row) {
        this.templateRadio = row.uuid;
        this.selectImage = row;
        this.$emit('selectImage', this.templateRadio);
      },
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
      }
    }
  }
</script>

<style scoped>

</style>
