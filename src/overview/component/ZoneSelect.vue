<template>
  <div class="container">
    <img class="top-left-corner" src="~assets/overview-top-left.svg" />
    <img class="bottom-left-corner" src="~assets/overview-bottom-left.svg" />
    <img class="top-right-corner" src="~assets/overview-top-right.svg" />
    <img class="bottom-right-corner" src="~assets/overview-bottom-right.svg" />
    <div class="left" @click="toggleHypervisorDropDown" style="position: relative; cursor: pointer;">
      <span class="zone-name">{{hypervisorType }}</span>
      <i class="arrow-down"></i>
      <div class="dropdown" :style="{display: data.getHypervisorTypeDropdownStatus() ? 'block' : 'none'}">
        <a @click="selectHypervisorType($event, hypervisorType)" v-for="(hypervisorType, index) in hypervisorTypeList" :key="index">{{hypervisorType}}</a>
      </div>
    </div>
    <div class="right" @click="toggleDropDown">
      <span class="zone-name">{{ getZoneName(selectedZone) }}</span>
      <i class="arrow-down"></i>
      <div class="dropdown" :style="{display: data.getDropdownStatus() ? 'block' : 'none'}">
        <a @click="selectZone($event, zone.uuid)" v-for="(zone, index) in zoneList" :key="index">{{ zone.uuid === 'all' ? $t(zone.name) : zone.name }}</a>
      </div>
    </div>
  </div>
</template>
<script>
import rpc from 'src/utils/rpc'
import _ from 'lodash'
export default {
  name: 'ZoneSelectList',
  props: ['data'],
  data () {
    return {
      zoneList: [],
      selectedZone: this.data.getCurrZone(),
      hypervisorTypeList: [
        'KVM',
        'vCenter'
      ],
      hypervisorType: 'KVM'
    }
  },
  created () {
    this.initZoneList()
  },
  methods: {
    toggleDropDown (e) {
      let dropdownStatus = this.data.getDropdownStatus()
      this.data.setDropdownStatus(!dropdownStatus)
      e.stopPropagation()
    },
    toggleHypervisorDropDown(e){
      let dropdownStatus = this.data.getHypervisorTypeDropdownStatus()
      this.data.setHypervisorTypeDropdownStatus(!dropdownStatus)
      e.stopPropagation()
    },
    getZoneName () {
      if (!this.selectedZone) {
        return this.$t('home.allZone')
      } else {
        let zoneIndex = _.findIndex(this.zoneList, zone => zone.uuid === this.selectedZone)
        return this.zoneList[zoneIndex].name
      }
    },
    initZoneList () {
      return rpc.query('zones').then(resp => {
        let list = resp.inventories
        list.sort((a, b) => {
          if (!a.name && b.name) return -1
          if (a.name && !b.name) return 1
          if (!a.name && !b.name) return 0
          return a.name.localeCompare(b.name)
        })
        list.unshift({name: 'home.allZone', uuid: 'all'})
        this.$data.zoneList = list
      })
    },
    selectZone (e, uuid) {
      e.stopPropagation()
      if (this.selectedZone !== uuid) {
        this.selectedZone = uuid
      }
      if (uuid === 'all') {
        this.selectedZone = ''
      }
      this.data.setCurrZone(this.selectedZone)
      this.data.setDropdownStatus(false)
    },
    selectHypervisorType(e, hypervisorType){
      let self = this;
      this.data.setHypervisorType(hypervisorType);
      self.hypervisorType  = hypervisorType;
      this.data.setHypervisorTypeDropdownStatus(false);
      e.stopPropagation();
    }
  }
}
</script>
<style scoped>
.container {
  flex: 1;
  position: relative;
  width: 100%;
  border: 1px solid #0059D8;
  margin-bottom: 18px;
  height: 58px;
}
.top-left-corner {
  position: absolute;
  left: -2px;
  top: -2px;
}
.left span {
  display: inline-block;
  text-align: center;
  font-family: PingFangSC-Regular;
  font-size: 18px;
  line-height: 58px;
  color: #2CDAFF;
  letter-spacing: 0
}
.left i {
  display: inline-block;
  vertical-align: middle;
  height: 12px;
  width: 16px;
  position: absolute;
  top: 20px;
  margin-left: 22%;
  right: 15%;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-image: url(~assets/overview_arrow_down.svg);
}
.dropdown {
  display: block;
  position: absolute;
/*  left: 30%;*/
  margin-top: 62px;
  margin-left: -2px;
  width: calc(100% + 10px);
  background: #0D1984;
  padding-top: 10px;
  padding-bottom: 10px;
  border: 1px solid #0059D8;
  opacity: 1;
  z-index: 9999;
  box-shadow: inset 0 0 19px 0 rgba(0,88,197, 1);
}
.dropdown a {
  display: block;
  text-align: center;
  margin: 0 auto;
  line-height: 40px;
  height: 40px;
  color: #2CDAFF;
  font-family: PingFangSC-Regular;
  font-size: 18px;
}
.dropdown a:hover {
  color: #fff;
}
.zone-name {
  display: inline-block;
  text-align: center;
  float: right;
  font-family: PingFangSC-Regular;
  font-size: 18px;
  margin-right: 45%;
  line-height: 58px;
  color: #2CDAFF;
  letter-spacing: 0
}
.right i.arrow-down {
  background-image: url(~assets/overview_arrow_down.svg);
  height: 12px;
  width: 16px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  vertical-align: middle;
  right: 30%;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}
.left {
  height: 100%;
  width: 30%;
  float: left;
  display: inline-block;
  border-right: 1px solid #0059D8;
}
.right {
  display: inline-block;
  position: relative;
  width: 68%;
  cursor: pointer;
}
.bottom-left-corner {
  position: absolute;
  left: -2px;
  bottom: -2px;
}

.top-right-corner {
  position: absolute;
  right: -2px;
  top: -2px;
}

.bottom-right-corner {
  position: absolute;
  right: -2px;
  bottom: -2px;
}
</style>
