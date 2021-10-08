<template>
  <div class="detail-name">
    <span v-show="!editing && param.type !== 'password'" class="text" :style="{'font-size': param.fontSize ? param.fontSize : '20px'}" :title="param.getValue()">{{ param.getValue() }}</span>
    <span v-show="!editing && param.type === 'password'" class="text" :style="{'font-size': param.fontSize ? param.fontSize : '20px'}">******</span>
    <span  v-if="canShowEdit" v-permission="permission" @click="onClickEdit()" class="edit-icon" ><i class="el-icon-edit"></i></span>
    <input class="edit-box"
           v-show="editing"
           :type="param.type && param.type==='password' ? 'password' : 'text'"
           v-model="newValue"
           @input="onInput($event)"
           ref="input"
           @keydown.enter="onKeydownEnter()"
           @blur="onBlur()"
           @keydown.esc="editing = false"  :style="{'font-size': param.fontSize ? param.fontSize : '20px'}"/>
  </div>
</template>

<script>
  import EditorBase  from './EditorBase';
  export default EditorBase;
</script>
<style scoped lang="less">
  .edit-icon {
    display: none;
    cursor: pointer;
    position: relative;
    left: 2px;
    top: -4px;
    .el-icon-edit{
      font-size: 20px;
      color: #409EFF;
    }
  }

  .detail-name:hover .edit-icon {
    display: inline-block;
  }

  .text {
    display: inline-block;
    font-size: 20px;
    line-height: 26px;
    height: 26px;
    padding: 0 0 0 1px;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .edit-box {
    position: relative;
    top: -7px;
    display: inline-block;
    font-size: 20px;
    line-height: 26px;
    height: 36px;
    border: 1px solid #adb0b8;
    padding-right: 2px;
    width: 300px;
  }
</style>
