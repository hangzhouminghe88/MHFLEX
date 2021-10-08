<template>
  <div class="icon" :style="style"></div>
</template>

<script>
  import {requireAll2Obj} from 'src/utils/utils';
  let svgs = requireAll2Obj(require.context('../assets/', true, /\.svg$/))//加载所有图片
  export default {
    name: "BaseIcon",
    props: {
      name: {
        type: String,
        required: true,
        validator: function (value) {
          let svgNames = Object.keys(svgs)
          //展示图片名称等于当前名称的图片
          return svgNames.some((item) => item === value)
        }
      },
      styles: Object
    },
    computed: {
      style() {
        let style = {
          backgroundImage: `url(${svgs[this.name]})`
        }
        return Object.assign(style, this.styles)
      }
    }
  }
</script>

<style scoped>
  .icon {
    display: inline-block;
    height: 36px;
    width: 36px;
    margin-right: 10px;
    background-repeat: no-repeat;
  }
</style>
