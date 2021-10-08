<template>
  <div class="detail-row editable">
    <div class="detail-title">
      <span v-permission="param.permission">{{ param.getTitle() }}{{$t("common.colon")}}</span>
      <help-trigger v-if="param.doc"
                    :name="param.doc"
                    style="
          position: relative;
          top: 0;
          display: inline-block;
          vertical-align: middle;
          left: 0;"/>
    </div>
    <div class="detail-container">
       <span class="detail-content" v-show="!editing">
          <span class="text">{{ optionList[param.getIndex()] }}</span>
        </span>
      <span v-show="showEditingIcon" v-permission="param.permission" class="edit-icon" @click.stop="editing = true;">
        <i class="el-icon-edit"></i>
      </span>
      <div v-show="editing" class="dropdown-container" @click="showDropdown = !showDropdown">
          <span class="text">
            <span class="title">{{ optionList[param.getIndex()] }}</span>
            <span class="icon">
              <i class="el-icon-arrow-down" v-if="!showDropdown"></i>
              <i class="el-icon-arrow-up" v-if="showDropdown"></i>
            </span>
          </span>
        <ul class="dropdown" v-show="showDropdown">
          <li v-for="(item, index) in optionList" :key="index" @click.stop="getItem(index)"
              :class="{'is-active': index === param.getIndex()}">{{item}}
          </li>
        </ul>
        <div class="prop" v-show="showDropdown"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import Root from 'src/windows/Root'

  export default {
    name: "Dropdown",
    mixins: [Root],
    props: {
      param: {
        type: Object,
        default: {}
      }
    },
    data() {
      return {
        editing: false,
        showDropdown: false
      }
    },
    methods: {
      getItem(index) {
        let self = this;
        if (self.param.getIndex() !== index) {
          self.param.setIndex(index)
        }
        self.editing = false;
        self.showDropdown = false;
      },
      onclickWindow(event) {
        let self = this;
        let target = event.target;
        if (target.tagName === 'HTML') {
          return
        }
        if (target.className === 'text' || target.className === 'icon'
          || target.className === 'el-icon-arrow-down'
          || target.className === 'el-icon-arrow-up'
          || target.className === 'title') return;
        self.editing = false;
        self.showDropdown = false;
      }
    },
    destroyed() {
      let self = this;
      window.removeEventListener('click', self.onclickWindow, true);
    },
    mounted() {
      let self = this;
      window.addEventListener('click', self.onclickWindow, true);
    },
    computed: {
      isDisabled() {
        let self = this;
        if (!self.param.getDisabled) return false
        return self.param.getDisabled()
      },
      showEditingIcon() {
        let self = this;
        let editing = self.editing
        let showIcon = self.param.showIcon
        if (showIcon !== undefined) return !editing && showIcon
        return !editing
      },
      optionList() {
        let self = this;
        if (!self.param.getOptionList) return []
        return self.param.getOptionList()
      }
    }
  }
</script>

<style scoped lang="less">
  .dropdown {
    width: 100%;
    position: absolute;
    text-align: center;
    right: 0px;
    z-index: 333;
    margin-top: 10px;
    box-shadow: 1px 1px 1px #ccc, -1px -1px 1px #ccc;
    background: #fff;
    animation: showdropdown 0.2ms;
    overflow: auto;

    li {
      height: 30px;
      line-height: 30px;
      cursor: pointer;

      &:hover {
        background: #409EFF;
        color: #fff;
      }
    }
  }

  .dropdown-container {
    position: relative;
    border: 1px solid #e1e4e5;
    width: 180px;

    .text {
      height: 40px;
      line-height: 40px;
      text-align: center;
      display: inline-block;
      width: 100%;
      position: relative;

      .icon {
        position: absolute;
        right: 5px;
        vertical-align: middle;
        display: inline-block;
      }
    }
  }

  @keyframes showdropdown {
    0% {
      height: 0px;
    }
    100% {
      height: 100%;
    }
  }

  .prop:after {
    position: absolute;
    display: inline-block;
    content: '';
    width: 10px;
    height: 10px;
    border: 1px solid #ccc;
    border-bottom: 0;
    border-right: 0;
    background-color: #fff;
    transform: rotate(45deg);
    left: 66px;
    top: 18px;
    bottom: 0;
    margin: auto;
  }

  .prop {
    position: relative;
  }

  .is-active {
    color: #409EFF;
  }
</style>
