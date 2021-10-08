<template>
  <div>
    <transition name="slide">
      <div v-if="assistantList.length && show" class="assistant-container">
        <div class="triangle"></div>
        <div class="assistant-title" style="width: 340px; padding-right: 20px;">
          {{ title }}
        </div>
        <div class="assistant-list" v-if="!isLicenseTitle">
          <div v-for="(item, index) in assistantList">
            <span class="index" v-if="item.data.hideIndex" ></span>
            <span class="index" v-if="!item.data.hideIndex" >{{ index + 1 }} .</span>
            <assistant-item :item="item" />
          </div>
        </div>
        <temp-license-manager v-if="isLicenseTitle" class="assistant-list" :data="assistantList[0]"/>
      </div>
    </transition>
    <transition name="fade" v-on:after-enter="afterEnter" v-on:after-leave="beforeLeave">
      <div v-if="assistantList.length" class="assistant-logo" @click="show = !show"></div>
    </transition>
  </div>
</template>


<script>
import WindowBase from 'src/windows/Window'
import Utils from 'src/utils/utils'
import _ from 'lodash'
import TempLicenseManager from 'src/component/AssistantTempManager'
import AssistantItem from './components/AssistantItem'

export default {
  name: 'assistantManager',
  mixins: [WindowBase],
  data: function () {
    return {
      show: false,
      isLicenseTitle: false,
      reminderTitles: ['vmMultiNetTitle']
    }
  },
  components: {
    'assistant-item': AssistantItem,
    'temp-license-manager': TempLicenseManager
  },
  methods: {
    afterEnter () {
      this.show = true
    },
    beforeLeave () {
      this.show = false
    },
    ...Utils
  },
  computed: {
    title () {
      return _.uniq(this.assistantList.map(item => item.data.getTitle()))[0]
    },
    assistantList: function () {
      let list = []
      if (this.dbData.common.isOpensource) return list
      let assistants = Object.keys(this.$store.state.assistantManager.assistants)
      assistants.forEach(_id => {
        list.push(this.$store.state.assistantManager.assistants[_id])
      })
      list = _.uniqBy(list, (item) => {
        return item.data.getContent(item)
      })
      list.sort((a, b) => {
        return a.data.priority - b.data.priority
      })
      if (list.length === 1 && (list[0].data.restriction === 'License' || list[0].data.restriction === 'Project')) {
        this.isLicenseTitle = true
      } else {
        this.isLicenseTitle = false
      }
      return list
    }
  }
}
</script>

<style scoped>

.assistant-container {
  position: absolute;
  z-index: 1887;
  width: 340px;
  right: 30px;
  bottom: 135px;
  background: #FFFFFF;
  border: 1px solid #3C73B9;
  box-shadow: 0 3px 20px 0 rgba(226,232,240,0.50);
  border-radius: 2px;
}

.assistant-title {
  font-family: MicrosoftYaHei;
  color: #1A2736;
  line-height: 20px;
  font-size: 16px;
  word-break: break-word;
  padding: 20px 30px;
  border-bottom: 1px solid #DAE0E6;
}

.assistant-list {
  position: relative;
  padding: 10px 30px;
  background: #fff;
  /*z-index: 6000;*/
}

.index {
  font-size: 14px;
  position: relative;
  top: 10px;
  vertical-align: top;
  display: inline-block;
}

.slide-fade-enter-active {
  transition: all 1s ease;
}
.slide-fade-leave-active {
  transition: all 1s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to {
  transform: translateY(30px);
  transition: transform 1s ease;
  opacity: 0;
}

.assistant-container .triangle {
  content: '';
  width: 20px;
  display: block;
  height: 20px;
  position: absolute;
  border: 0.7px solid #3C73B9;
  right: 25px;
  bottom: -5px;
  transform: rotate(45deg);
  box-shadow: 0 3px 20px 0 rgba(226,232,240,0.50);
  background-color: #fff;
}

/*.assistant {
  position: relative;
  margin-top: 10px;
  font-family: MicrosoftYaHei;
  font-size: 14px;
  color: #1A2736;
  letter-spacing: 0;
  line-height: 20px;
  margin-bottom: 10px;
}*/

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.assistant-logo {
  cursor: pointer;
  position: absolute;
  margin-top: 20px;
  right: 10px;
  bottom: 20px;
  width: 110px;
  height: 110px;
  z-index: 1887;
  background-size: contain;
  background-image: url('~assets/assistant.png');
  background-position: center;
  background-repeat: no-repeat;
}

</style>

