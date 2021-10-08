<template>
  <div class="detail-size">
    <input type="number" v-model="newValue" :placeholder="placeholder" :class="inputClass" :style="inputStyle" @keydown.enter.stop="changeValue()" @blur.stop="changeValue()"/>
    <span class="unit" @click="showDropdown=!showDropdown" :style="inputStyle">
      <span class="text">{{size + unit}}</span>
      <i class="el-icon-arrow-down" v-if="!showDropdown"></i>
      <i class="el-icon-arrow-up" v-if="showDropdown"></i>
    </span>
    <ul class="dropdown dropdown-container" v-show="showDropdown">
      <li v-for="(item, index) in sizeList" :key="index" @click.stop="getUnit(item)" :class="{'is-active': size === item}" class="dropdown-item">{{item + unit}}</li>
    </ul>
  </div>
</template>

<script>
  import Utils from 'src/utils/utils';
  export default {
    name: "SizeEditor",
    props: {
      sizeList:{
        type: Array,
        default: []
      },
      unit:{
        type: String,
        default:''
      },
      finish: {
        type: Function,
      },
      defaultsize: {
        type: String,
        default: ''
      },
      inputStyle:{
        type: String,
        default: ''
      },
      inputClass:{
        type: Object,
        default: () => {
          return {}
        }
      },
      placeholder:{
        type: String,
        default: ''
      }
    },
    data(){
      return {
        showDropdown: false,
        newValue: '',
        size: ''
      }
    },
    mounted(){
      let self = this;
      if(self.defaultsize) this.size = self.defaultsize;
      if (parseInt(this.value) >= 1024) this.size = value[value.length - 1];
      window.addEventListener('click', self.onWindowClick, true);
      document.querySelectorAll('.dropdown-container').forEach((item) =>{
        item.addEventListener('mouseleave', self.onMouseLeave, true)
      })
    },
    destroyed(){
      let self = this;
      //取消事件监听
      window.removeEventListener('click', self.onWindowClick, true);
      document.querySelectorAll('.dropdown-container').forEach((item) =>{
        item.removeEventListener('mouseleave', self.onMouseLeave, true)
      })
    },
    methods: {
      cancel(){
        let self = this;
        self.finish(self.value);
      },
      changeValue(){
        let self = this;
        //1k=1024
        let K = 1024
        //1M=1024 * 1024
        let M = K * K
        let G = M * K
        let T = G * K
        let P = T * K

        let sizeMap = {
          'K': K,
          'M': M,
          'G': G,
          'T': T,
          'P': P
        }
        self.finish(parseInt(self.newValue) * sizeMap[self.size])
      },
      getUnit(size){
        let self = this;
        if(size){
          self.size = size;
        }else{
          self.size = self.defaultsize
        };
        self.changeValue();
        self.showDropdown = !self.showDropdown;
      },
      onWindowClick(event){
        var target = event.target
        if (target.tagName === 'HTML') {
          return
        }
        var result = []
        //当鼠标在input容器上点击时不隐藏input
        while (target.tagName !== 'BODY' && result.length === 0) {
          var index = target.className.indexOf('detail-size')
          if (index !== -1) {
            result.push(target)
          }
          target = target.parentNode
        }
        if (result.length > 0) {
          return
        }
        this.showDropdown = false
      },
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
      }
    }
  }
</script>

<style scoped lang="less">
  .unit{
    display: inline-block;
    width: 50px;
    height: 40px;
    line-height: 40px;
    border: 1px solid #adb0b8;
    margin-left: -7px;
    border-left: none;
    text-align: center
  }
  .detail-size{
    width: 228px;
    position: relative;
  }
  .dropdown{
    width: 50px;
    position: absolute;
    text-align: center;
    right: 0px;
    z-index: 333;
    border:1px solid #adb0b8;
    background: #fff;
    li{
      height: 30px;
      line-height: 30px;
      cursor: pointer;
      &:hover{
        background: #409EFF;
        color: #fff;
      }
    }
    .is-active{
      color: #409EFF;
    }
  }
</style>
