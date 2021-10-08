<template>
  <div class="content" @click.stop="$emit('open')" :class="{'disabled':disabled}">
    <div style="padding-left: 10px;" :class="valueClass">{{value}}</div>
    <div class="add" v-if="!value"></div>
    <div class="delete" v-if="value" @click="$emit('remove',$event)"></div>
  </div>
</template>

<script>
  export default {
    name: "AddOrDeleteInput",
    props: {
      value: {
        type: String,
        default: ''
      },
      disabled: {
        type: Boolean,
        default: false
      },
      valueClass: {
        type: String,
        default: ''
      }
    }
  }
</script>

<style scoped lang="less">

  .content {
    height: 40px;
    font-size: 14px;
    color: #333;
    width: 100%;
    padding: 0px;
    border: 1px solid #adb0b8;
    margin-top: 10px;
    border-radius: 4px;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: initial;
    display: inline-block;
    line-height: 40px;

    img {
      vertical-align: middle;
    }
  }

  .delete {
    position: absolute;
    background-image: url('~assets/delete.svg');
    height: 21px;
    width: 21px;
    cursor: pointer;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }

  .add {
    position: absolute;
    height: 23px;
    width: 23px;
    top: 50%;
    background-image: url("~assets/add.svg");
    background-repeat: no-repeat;
    transform: translateY(-50%);
    right: 8px;
    background-repeat: no-repeat;
  }

  .helper {
    display: inline-block;
    position: absolute;
    right: -35px;
    top: 23px;
  }
  .value-class{
    padding-left: 30px!important;
  }
</style>
