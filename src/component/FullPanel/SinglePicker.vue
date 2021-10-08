<template>
  <div>
    <div v-if="!isDisabled">
      <div class="full-panel-item-title">
        <span v-if="canShowStar()" style="color:#F56C6C">*</span>
        {{ $t(param.getTitle()) }}
        <help-trigger style="top: 1px;" v-if="param.doc" :name="param.doc"></help-trigger>
      </div>
      <div class="selector-content" :class="classList" @click="onClickItem()">
        {{ param.getValue() }}
        <div class="add" v-if="showAdd"></div>
        <div class="delete" v-if="showDelete" @click="deleteResource($event)"></div>
      </div>
      <span class="error-msg" v-if="!isValid">{{ errorMsg }}</span>
    </div>
    <div v-else style="display: flex;">
      <div class="full-panel-item-title-disabled">
        {{ $t(param.getTitle()) }}:
        <!-- <span v-if="canShowStar()">*</span> -->
      </div>
      <div class="selector-content" style="cursor: initial;" :class="classList">
        <span  style="cursor: pointer;" @click="onClickItem()">{{ param.getValue() }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import Root from 'src/windows/Root';

export default {
  name: 'FullPanelSinglePicker',
  mixins: [Root],
  props: ['param'],
  data () {
    return {
      focused: false
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
    onClickItem () {
      if (this.isDisabled) {
        if (this.param.getIsLink && this.param.getIsLink()) {
          return this.param.onClickLink()
        }
      }
      this.param.open()
    },
    deleteResource ($event) {
      $event.stopPropagation()
      this.param.delete()
    },
    onWindowClick (event) {
      let currElm = event.target
      while (currElm &&
             currElm.className.indexOf('operation-body-container') < 0 &&
             currElm.className.indexOf('page-header') < 0 &&
             currElm.className.indexOf('operation-header') < 0) {
        currElm = currElm.parentElement
      }
      // if don't click on full panel, ignore it.
      if (!currElm) {
        return
      }
      if (this.$el.contains(event.target)) {
        this.focused = true
      } else {
        this.focused = false
      }
    }
  },
  computed: {
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
      if (this.isDisabled) {
        if (this.param.getIsLink && this.param.getIsLink()) {
          return 'disabled link'
        } else {
          return 'disabled'
        }
      } else if (!this.isValid) {
        ret = 'error'
      } else if (this.focused) {
        ret = 'focused'
      }
      return ret
    }
  },
  watch: {
  }
}
</script>
<style scoped>
.full-panel-item-title {
  position: relative;
  font-size: 14px;
  color: #5e6978;
  margin-bottom: 10px;
}
.full-panel-item-title-disabled {
  font-size: 14px;
  color: #5e6978;
  white-space: nowrap;
  line-height: 40px;
}

.disabled-title {
  display: inline-block;
}
.selector-content {
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  color: #333;
  width: calc(100% - 10px);
  border: 1px solid #dae0e6;
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 10px;
}
.focused {
  border-color: #0088EF;
}
.add {
  position: absolute;
  background-image: url('~assets/add.svg');
  background-repeat: no-repeat;
  height: 23px;
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

.add.disabled {
  background-image: url('~assets/add_disable.svg');
  background-repeat: no-repeat;
  cursor: initial;
}

.delete {
  position: absolute;
  background-image: url('~assets/delete.svg');
  background-repeat: no-repeat;
  height: 22px;
  width: 22px;
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
.error {
  border-color: #ec5960;
  padding-top: 0;
}
.error-msg {
  font-size: 12px;
  color: #EC5960;
  padding-top: 5px;
  width: 100%;
  display: inline-block;
  text-align: right;
}

.link {
  color: #3C73B9;
}
</style>
