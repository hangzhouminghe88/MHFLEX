<template>
  <div class="detail-row">
    <div class="detail-title">
      <span >{{ $t(param.title)}}{{$t("common.colon")}}</span>
    </div>
    <div class="detail-container" v-if="isPermited" :style="_style">
      <span v-if="param.handler && !param.copy && !param.editable" class="link" @click="param.handler" :class="_contentClass">{{ param.content }}</span>
      <span v-if="!param.handler && !param.copy && !param.editable && !param.vHtml" :class="_contentClass">{{ param.content }}</span>
      <div v-if="!param.handler && !param.copy && !param.editable && param.vHtml" v-html="param.content" :class="_contentClass"></div>
      <detail-long-content v-if="param.copy" :value="param.content" :class="_getDetailRowClass" />
      <span v-if="param.editable && param.handler" :class="_contentClass">{{ param.content }}</span>
      <span v-if="param.editable && param.handler" class="edit-icon" @click="param.handler"><i class="el-icon-edit"></i></span>
    </div>
  </div>
</template>

<script>
  import DetailLongContent from 'src/main-component/DetailLongContent';
  import Root from 'src/windows/Root';
  export default {
    name: "RowContent",
    mixins: [Root],
    props: {
      param: {
        type: Object,
        default: {}
      }
    },
    components: {
      DetailLongContent
    },
    computed:{
      //判断是否有字数限制
      isPermited () {
        let result = true, self = this;
        if (self.dbData.common.isOpensource) {
          result = !!self.param.isOpensource
        }
        return result
      },
      _contentClass(){
        let self = this;
        if(self.param.getContentClass){
         return self.param.getContentClass();
        }
      },
      _getDetailRowClass(){
        let self = this;
        if(self.param.getDetailRowClass){
          return self.param.getDetailRowClass();
        }
      },
      _style(){
        let self = this;
        if(self.param.getStyle){
          return self.param.getStyle();
        }
      }
    }
  }
</script>

<style scoped>
  .content-pre{
    white-space: pre-wrap;
    max-width: 300px;
    display: inline-block;
    font-size: 14px;
    width: 100%;
    word-wrap: break-word;
  }
</style>
