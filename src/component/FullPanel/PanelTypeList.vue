<template>
    <div class="type-container">
      <span :class="{'active': index === param.getIndex()}" v-for="(item, index) in param.getTypeList()" @click="param.setIndex(index)" v-if="showTab">
        {{$t(`common.${item.typeName}`)}}
      </span>
    </div>
</template>

<script>
  export default {
    name: "PanelTypeList",
    props: {
      param: {
        type: Object,
        default: {}
      }
    },
    mounted(){

    },
    computed: {
      showTab(){
        let self = this;
        if(!self.param.isShow) return true;
        else return self.param.isShow;
      }
    }
  }
</script>

<style scoped lang="less">
  .type-container {
    display: inline-block;
    border-radius: 3px;
    cursor: pointer;
    transition: all ease-out 0.5s;
    margin-right: 20px;
    background-color: #e9edfa;
    span{
      display: inline-block;
      padding: 10px 20px;
      border-radius: 2px;
      font-size: 12px;
      &:last-child{
        border-right: none;
      }
    }
    .active{
      background-color: #5e7ce0;
     transition: background-color cubic-bezier(0.5, 0.8, 0.5, 1) 0.5s,
      background-color ease-in 0.5s;
     color: #fff;
    }
  }
</style>
