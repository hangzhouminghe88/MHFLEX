<template>
  <div class="container">
    <div class="tab-title">{{$t('resourcestack.resourceStackContent')}}{{$t('common.colon')}}</div>
    <div class="tab-container" v-if="param.showTab">
      <span class="tab-item" :class="{'active': currSelectTab === 'template'}" @click="changeTab('template')">{{ $t('resourcestack.template') }}</span>
      <span class="tab-item" :class="{'active': currSelectTab === 'paramete'}" @click="changeTab('paramete')">{{ $t('resourcestack.param') }}</span>
    </div>
    <div v-show="currSelectTab === 'template'" id="detail-json-editor" class="template-editor json-editor detail-resource-stack"></div>
    <div v-if="currSelectTab === 'paramete'">
      <ul class="header">
        <li v-for="(key,index) in ['Key', 'Value']" :class="`column${index}`">{{key}}</li>
      </ul>
      <ul class="body" v-for="(item, index) in parametesPair" :key="index">
        <li class="column0">{{item.key}}</li>
        <li class="column1">{{item.value}}</li>
      </ul>
    </div>
  </div>
</template>

<script>
  import ResourceStackContentService from './ResourceStackContentService';

  export default {
    name: "ResourceStackContent",
    mixins: [ResourceStackContentService],
  }
</script>

<style scoped lang="less">
 .container{
   width: 100%;
   height: 100%;
 }
  #detail-json-editor{
    width: 100%;
    position: absolute;
    top: 90px;
    left: 0;
    right: -130px;
    bottom: 0;
    box-shadow: 0px -1.5px 1px #ddd;
  }
  .tab-container{
    display: inline-block;
    border-radius: 3px;
    cursor: pointer;
    transition: all ease-out 0.5s;
    margin-right: 20px;
    background-color: #e9edfa;
  }
  .tab-item{
    display: inline-block;
    padding: 10px 20px;
    border-radius: 2px;
  }
  .tab-title{
    display: inline-block;
    font-size: 12px;
  }
  .active{
     background-color: #5e7ce0;
     transition: background-color cubic-bezier(0.5, 0.8, 0.5, 1) 0.5s,
      background-color ease-in 0.5s;
     color: #fff;
  }
 .header,.body {
   display: inline-block;
   border-bottom: 1px solid #dae0e6;
   width: 97%;
   font-size: 16px;
 li {
   list-style: none;
   display: inline-block;
   vertical-align: top;
   padding: 20px 0px;
 }
 }

 .column0 {
   width: 49%;
 }

 .column1 {
   width: 49%;
 }
 .pre-content{
   word-break: break-word;
   white-space: pre-wrap;
 }
</style>
