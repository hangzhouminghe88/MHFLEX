<template>
  <div class="dropdown" :style="containerStyle" :class="{'disabled': canDiasbled()}" @click="changeDropdown()">
    <span class="title">
       <span class="text">{{param.getIndex && optionsList[param.getIndex()] && $t(`${optionsList[param.getIndex()].name}`)}}</span>
       <i class="el-icon-arrow-down" v-if="!showDropdown"></i>
       <i class="el-icon-arrow-up" v-if="showDropdown"></i>
    </span>
    <ul class="item dropdown-container" v-show="showDropdown" :style="param.dropdownContentStyle">
      <li v-for="(item, index) in optionsList" :title="$t(item.name)" :class="{'is-active': index === param.getIndex()}" :key="index" @click.stop="getItem(index)" class="dropdown-item">{{$t(item.name)}}</li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: "Dropdown",
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data(){
      return {
        showDropdown: false
      }
    },
    computed:{
      containerStyle(){
        let self = this;
        if(self.param && self.param.style){
          return self.param.style;
        }else return 'absolute'
      },
      optionsList(){
        let self = this;
        if(self.param && self.param.getOptionList){
          return self.param.getOptionList();
        }
      }
    },
    mounted(){
      let self = this;
      window.addEventListener('click', self.onWindowClick, true)
      document.querySelectorAll('.dropdown-container').forEach(item => {
        item.addEventListener('mouseleave', self.onMouseLeave, true)
      })
    },
    destroyed(){
      let self = this;
      window.removeEventListener('click', self.onWindowClick, true)
      document.querySelectorAll('.dropdown-container').forEach(item => {
        item.removeEventListener('mouseleave', self.onMouseLeave, true)
      })
    },
    methods: {
      onMouseLeave($event){
        let self = this, result= [];
        var target = $event.target;
        while (target.tagName !== 'BODY' && result.length === 0) {
          var index = target.className.indexOf('dropdown-item')
          if (index !== -1) {
            result.push(target)
          }
          target = target.parentNode
        };
        if (result.length > 0) {
          return
        }
        self.showDropdown = false;
        $event.stopPropagation();
      },
      getItem(index) {
        let self = this;
        if (self.param && self.param.getIndex() !== index) {
          self.param.setIndex(index)
        }
        self.showDropdown = false;
      },
      canDiasbled(){
        let self = this;
        if(self.param && self.param.disabled){
          return self.param.disabled();
        }else{
          return false
        }
      },
      changeDropdown(){
        let self = this;
         let isShow = self.canDiasbled();
        if(!isShow){
          self.showDropdown = true;
        }
      },
      onWindowClick(event) {
        let self = this;
        let target = event.target;
        if (target.tagName === 'HTML') {
          return
        }
        self.showDropdown = false;
      }
    }
  }
</script>

<style scoped lang="less">
 .dropdown{
   width: 100%;
   position: relative;
   border: 1px solid #adb0b8;
   display: inline-block;
   line-height: 40px;
   cursor: pointer;
 }
  .dropdown-container{
    position: absolute;
    z-index: 99;
    width: 100%;
    background: #fff;
    border: 1px solid #adb0b8;
    max-height: 200px;
  }
  .text{
    margin-left: 5px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .title{
    i{
      position: absolute;
      right: 8px;
      top: 13px;
    }
  }
  .dropdown-item{
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    padding-left:  10px;
    &:hover{
      background: #409EFF;
      color: #fff;
    }
  }
  .is-active{
    color: #409EFF;
  }
 .disabled {
   background: #f1f4f7;
   border: 1px solid #dae0e6;
   color: #97a4b6;
 }
</style>
