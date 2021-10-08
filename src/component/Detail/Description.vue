<template>
  <div class="detail-description">
    <span id="common-noDescription" class="no-description" v-show="!editing && !param.getValue()">{{$t("common.noDescription")}}</span>
    <span v-show="!editing" class="description-content" :style="getContentStyle()" :title="param.getValue()">{{ param.getValue() }}</span>
    <span  v-if="canShowEdit" v-permission="permission" @click="onClickEdit()" class="edit-icon" ><i class="el-icon-edit"></i></span>
    <textarea rows="3" class="edit-box"
              v-show="editing"
              type="text"
              :value="newValue"
              @input="onInput($event)"
              ref="input"
              @keydown.ctrl.13="onKeydownEnter()"
              @blur="onBlur()"
              @keydown.esc="editing = false" />
  </div>
</template>

<script>
  import EditorBase from './EditorBase'

  export default {
    name: 'DetailDescription',
    mixins: [EditorBase],
    methods: {
      updateValue () {
        if (!this.editing) return
        if (this.param.setValue) {
          this.param.setValue(this.newValue)
        }
        this.editing = false
      },
      isMultiline () {
        return this.param.getValue().indexOf('13') >= 0
      },
      getContentStyle () {
        if (this.isMultiline) {
          return {
            'white-space': 'pre-wrap'
          }
        }
        return {}
      }
    },
    watch: {
    }
  }
</script>
<style scoped>
  .edit-icon {
    display: none;
    cursor: pointer;
    position: relative;
    left: 5px;
    top: 2px;
  }

  .detail-description {
    min-height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 24px;
    font-size: 0px;
    color: #5e6978;
  }

  .detail-description:hover .edit-icon {
    display: inline-block;
  }

  .description-content {
    width: 100%;
    line-height: 24px;
    font-size: 14px;
  }

  .edit-box {
    position: relative;
    top: 0;
    display: block;
    width: 300px;
    border: 1px solid #adb0b8;
    outline: none;
    line-height: 28px;
    font-size: 14px;
  }

  .no-description {
    /*font-style: italic;*/
    font-size: 14px;
    color: #97A4B6;
    line-height: 24px;
  }

</style>
