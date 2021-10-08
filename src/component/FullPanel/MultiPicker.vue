<template>
  <div>
    <div class="full-panel-item-title">
      {{ $t(param.getTitle()) }}:
      <span v-if="canShowStar()">*</span>
      <help-trigger style="top: 1px;" v-if="param.doc" :name="param.doc"></help-trigger>
    </div>
    <div class="selector-content" v-for="(item, index) in param.getValue()">
      {{ item }}
      <div class="delete" @click="deleteItem($event, index)"></div>
    </div>
    <div v-if="canAdd" class="selector-content" :class="classList" @click="param.open()">
      <div class="add"></div>
    </div>
    <span class="error-msg" v-if="!isValid">{{ errorMsg }}</span>
  </div>
</template>

<script>
  import Root from 'src/windows/Root'

  export default {
    name: 'FullPanelMultiPicker',
    mixins: [Root],
    props: ['param'],
    data () {
      return {
      }
    },
    created: function () {
      window.addEventListener('click', this.onWindowClick, true)
    },
    destroyed: function () {
      window.removeEventListener('click', this.onWindowClick, true)
    },
    methods: {
      canShowStar () {
        if (this.param.canShowStar) {
          return this.param.canShowStar()
        }
        return false
      },
      deleteItem ($event, index) {
        $event.stopPropagation()
        this.param.delete(index)
      },
      onWindowClick: function (event) {
      }
    },
    computed: {
      canAdd () {
        if (this.param.limitedNum) {
          if (this.param.getValue().length >= this.param.limitedNum) {
            return false
          }
        }
        return true
      },
      isDisabled () {
        if (!this.param.getDisabled) return false
        return this.param.getDisabled()
      },
      showDelete () {
        if (this.isDisabled) return false
        return !!this.param.getValue()
      },
      showAdd () {
        if (this.isDisabled) return false
        return !this.param.getValue()
      },
      isValid () {
        try {
          return this.param.validator.result.isValid
        } catch (e) {
          return true
        }
      },
      errorMsg () {
        if (this.param.validator && this.param.validator.result) {
          return this.param.validator.result.msg
        }
        return ''
      },
      classList () {
        let ret = ''
        if (!this.isValid) {
          ret = 'error'
        }
        return ret
      }
    }
  }
</script>
<style scoped>
  .full-panel-item-title {
    font-size: 14px;
    color: #5e6978;
  }

  .selector-content {
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    color: #333;
    border: 1px solid #dae0e6;
    padding-left: 10px;
    border-radius: 2px;
    cursor: pointer;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 97%;
    margin: 10px 0;
  }

  .add {
    position: absolute;
    background-image: url('~assets/add.svg');
    background-repeat: no-repeat;
    height: 23px;
    cursor: pointer;
    width: 23px;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }

  .content.focused .add {
    background-image: url('~assets/add_highlight.svg');
    background-repeat: no-repeat;
  }

  .add:hover {
    background-image: url('~assets/add_highlight.svg');
    background-repeat: no-repeat;
    cursor: pointer;
  }

  .add.disable {
    background-image: url('~assets/add_disable.svg');
    background-repeat: no-repeat;
    cursor: initial;
  }

  .delete {
    position: absolute;
    background-image: url('~assets/delete.svg');
    background-repeat: no-repeat;
    height: 23px;
    width: 23px;
    cursor: pointer;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }

  .delete:hover {
    background-image: url('~assets/delete_highlight.svg');
    background-repeat: no-repeat;
    cursor: pointer;
  }

  .error-msg {
    font-size: 12px;
    float: right;
    color: #EC5960;
    padding-top: 5px;
  }

  .error {
    border-color: #ec5960;
  }

</style>

