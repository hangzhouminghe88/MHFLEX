<template>
  <div>
    <div class="detail-row" v-if="!param.contentList || param.contentList.length <=0 ">
      <div  class="detail-title" >
        {{$t(`${param.title}`)}}{{$t("common.colon")}}
      </div>
    </div>
    <div class="detail-row"  v-for="(item, index) in param.contentList">
      <div v-if="index === 0 || !param.contentList" class="detail-title" >
        {{$t(`${param.title}`)}}{{$t("common.colon")}}
      </div>
      <div v-else class="detail-title"></div>
      <div class="detail-container" v-if="typeof(item) === 'object'">
         <span v-if="!item.handler && !item.value && !item.canLink" class="link" @click="param.handler(item)">{{ param.getValue(item) }}</span>
        <span v-else-if="item.handler && item.canLink(item)" class="link" @click="item.handler(item)">{{ item.value }}</span>
      </div>
      <div class="detail-container" v-else>
        <div class="detail-container" v-if="isPermited">
          <span v-if="param.handler && !param.copy &&  !param.canEdit && param.canLink && param.canLink(item)" class="link" @click="param.handler(item)">{{ param.getValue(item) }}</span>
          <span v-if="param.handler && !param.copy && !param.canEdit && !param.canLink" class="link" @click="param.handler(item)">{{ item }}</span>
          <span v-if="!param.handler && !param.copy">{{ item }}</span>
          <detail-long-content v-if="param.copy" :value="item" />
          <span v-if="param.handler && !param.copy && param.canEdit">{{ item }}</span>
          <span v-if="index === 0 && param.canEdit" class="edit-icon" @click="param.handler()">
            <i class="el-icon-edit"></i>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Root from 'src/windows/Root';
  import DetailLongContent from 'src/main-component/DetailLongContent';
  export default {
    name: "RowList",
    mixins: ['Root'],
    components: {
      DetailLongContent
    },
    props: {
      param: {
        type: Object,
        default: () =>{
          return {}
        }
      }
    },
    computed:{
      //判断是否有字数限制
      isPermited () {
        let result = true, self = this;
        if (this.param.hide !== undefined) {
          result = !this.param.hide
        }
        return result
      }
    }
  }
</script>

<style scoped>

</style>
