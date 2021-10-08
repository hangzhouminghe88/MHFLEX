<template>
  <div>
    <component v-for="(item, index) of getComponentList()" :key="item.id" :is="item.ctrl" :param="item.param" v-show="canShow(item)" />
    <div class="addItem">
      <span class="addMore" @click="canAdd && addMore()" :class="{ 'disable': !canAdd }">{{ $t("vm.cdRom.createMore") }}</span>
    </div>
  </div>
</template>
<script>
  import CardForCDRom from './CardForCDRom'
  import CDRomItemList from './CDRomItemList'
  import _ from 'lodash'

  export default {
    name: 'CDRomForCreateVmInStance',
    props: ['param'],
    methods: {
      addMore () {
        this.tempItemList.forEach((it, index) => {
          this.param.add(it)
          this.param.remove(index, true)
        })
        let configuredLen = this.itemList.length
        let tempLen = this.tempItemList.length
        let len = configuredLen + tempLen
        this.param.add({
          cdRom: `CDROM-${len + 1}`,
          isoUuid: ''
        }, true)
      },
      onWindowClick ($event) {
        let target = $event.target
        let container = this.$el
        if (!container.contains(target)) this.addMore()
      },
      canShow (item) {
        if (this.itemList.length === 0 && item.id === 'configuredCDRom') return false
        return true
      },
      updateItem (index, isTemp) {
        let item = isTemp ? this.tempItemList[index] : this.itemList[index]
        let itemList = this.itemList.concat(this.tempItemList).sort((a, b) => a.cdRom - b.cdRom)
        let curIndex = parseInt(item.cdRom.split('-')[1])
        itemList.forEach((item, j) => {
          if (j + 1 > curIndex) {
            let temp = _.includes(this.tempItemList, item)
            let tempIndex = temp ? this.itemList.indexOf(item) : this.tempItemList.indexOf(item)
            item.cdRom = `CDROM-${j}`
            this.param.update(item, tempIndex, temp)
          }
        })
      },
      getComponentList () {
        return [
          {
            id: 'configuredCDRom',
            param: {
              remove: index => {
                this.updateItem(index)
                this.param.remove(index)
              },
              getItemList: () => this.itemList
            },
            ctrl: CardForCDRom
          },
          {
            id: 'CDRomItemList',
            param: {
              getItemList: () => this.tempItemList,
              removeItem: index => {
                this.updateItem(index, true)
                this.param.remove(index, true)
                if (this.itemList.length === 0 && this.tempItemList === 0) this.param.remove(0)
              },
              getAllItemList: () => this.itemList.concat(this.tempItemList),
              removeISO: index => this.param.remove(index, true),
              setISO: (index, item) => this.param.update(item, index, true)
            },
            ctrl: CDRomItemList
          }
        ]
      }
    },
    computed: {
      itemList () {
        return this.param.getList()
      },
      tempItemList () {
        let isTemp = true
        return this.param.getList(isTemp)
      },
      canAdd () {
        let configuredLen = this.itemList.length
        let tempLen = this.tempItemList.length
        let len = configuredLen + tempLen
        let limit = this.param.getLimit()
        if (len >= limit) return false
        return true
      }
    }
  }
</script>
<style scoped>
  .addItem {
    margin-top: 25px;
    height: auto;
  }

  .addMore {
    color: #3C73B9;
    cursor: pointer;
    opacity: 1;
    font-size: 12px;
    font-face: PingFangSC-Regular;
    character: 0px;
  }

  .disable {
    color: #97A4B6;
    cursor: not-allowed;
  }

</style>

