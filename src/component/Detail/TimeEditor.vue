<template>
  <div class="detail-time">
    <input class="detail-time-input" type="number" min="0" v-model="newValue" :style="_style" @keydown.enter="changeValue()" @keydown.esc="cancel()"/>
    <drop-down class="detail-time-dropdown" :param="{
                    getOptionList: () => {return timeUnitList},
                    getIndex: () => timeUnitList.findIndex((num) =>{
                    return num.value === unit
                   }),
                  setIndex: (index) => {
                    return unit = timeUnitList[index].value;
                   },
                   style: {width: '80px' , marginLeft: '-2px'}
                  }"></drop-down>
  </div>
</template>

<script>
  import DropDown from 'src/ecs/autoScalingGroup/component/Dropdown';
  export default {
    name: "TimeEditor",
    props: {
      defaultUnit: {
        type: String,
        default: 'second'
      },
      inputStyle: {
        type: Object,
        default: () => {
          return {}
        }
      },
      finish:{
        type: Function,
      },
      value: {
        type: String,
        default: ''
      }
    },
    components: {
      DropDown
    },
    created(){
      let self = this;
      self.unit = self.defaultUnit ? self.defaultUnit :  'second';
      self.newValue = self.value ? self.value : '';
    },
    mounted(){
      let self = this;
      window.addEventListener('click', self.onWindowClick, true);
    },
    destroyed(){
      let self = this;
      window.removeEventListener('click', self.onWindowClick, true);
    },
    data(){
      return {
        timeUnitList:[
          {
            name: 'common.second',
            value: 'second'
          },
          {
            name: 'common.minute',
            value: 'minute'
          },
          {
            name: 'common.hour',
            value: 'hour'
          }
        ],
        newValue: '',
        unit: ''
      }
    },
    computed:{
      _style(){
        let self = this;
        if(self.inputStyle){
          return self.inputStyle;
        }else{
          return {}
        }
      },
    },
    methods: {
      changeValue(){
        let self = this;
        let S = 60
        //1H = 60 * 60s
        let H = S * S
        let M = S

        let sizeMap = {
          'second': 1,
          'minute': M,
          'hour': H,
        }
        self.finish(self.newValue * sizeMap[self.unit])
      },
      cancel(){
        let self = this;
        self.finish(self.value);
      },
      onWindowClick(event){
        var target = event.target
        if (target.tagName === 'HTML') {
          return
        }
        var result = []
        //当鼠标在input容器上点击时不隐藏input
        while (target.tagName !== 'BODY' && result.length === 0) {
          var index = target.className.indexOf('detail-time')
          if (index !== -1) {
            result.push(target)
          }
          target = target.parentNode
        }
        if (result.length > 0) {
          return
        }
        this.changeValue()
      }
    },
    watch: {
      defaultUnit(newVal , oldVal){
        let self = this;
        if(newVal !== oldVal){
          self.unit = newVal;
        }
      }
    }
  }
</script>

<style scoped lang="less">
 .detail-time{
   display: inline-flex;
   &-input{
     flex: 1 2 auto;
     width: 60% !important;
    }
   &-dropdown{
     flex: 1 1 auto;
   }
 }
</style>
