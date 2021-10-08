<script>
  import _ from 'lodash'
  import {mapGetters} from 'vuex'
  import TagPartialBase from './TagPartialBase'
  // const tagListButtonsWidth = 180

  export default {
    mixins: [TagPartialBase],
    data () {
      return {
        tagListWidth: 0,
        tagType: 'my',
        tagUuidList: []
      }
    },
    mounted () {
      window.addEventListener('resize', this.calcTagListWidth);
      this.calcTagListWidth()
    },
    destroyed: function () {
      window.removeEventListener('resize', this.calcTagListWidth)
    },
    computed: {
      ...mapGetters({
        getTag: 'tag/get',
      }),
    },
    watch: {
      'windowData.showSearchBox' (val, oldVal) {
        if (val === oldVal) return;
        this.$nextTick(() => {
          this.calcTagListWidth()
        })
      }
    },
    methods: {
      getTagCondtion () {
        if (!this.tagUuidList) return [];
        return this.tagUuidList.map(uuid => `__tagUuid__=${uuid}`)
      },
      attachTag (resourceUuidList, tagUuidList) {
        if (!tagUuidList || tagUuidList.length <= 0) return;
        let paramList = tagUuidList.map(uuid => {
          return {
            uuid,
            resourceUuidList: []
          }
        });

        // remove already attached tags.
        let resourceList = this.get(resourceUuidList);
        resourceList.forEach(rs => {
          let attachedUuidList = [];
          if (rs.myUserTagUuidList) {
            attachedUuidList = attachedUuidList.concat(rs.myUserTagUuidList)
          }
          if (rs.otherUserTagUuidList) {
            attachedUuidList = attachedUuidList.concat(rs.otherUserTagUuidList)
          }

          let currResourceTagUuidList = _.difference(tagUuidList, attachedUuidList);
          currResourceTagUuidList.forEach(tagUuid => {
            let param = _.find(paramList, param => param.uuid === tagUuid);
            param.resourceUuidList.push(rs.uuid)
          })
        });

        // action.tag.attach is a special event, one api call contains multiple sub actions. I should counting the sub actions for tracking action results.
        let eventCountingNumber = 0;
        paramList.forEach(param => {
          eventCountingNumber += param.resourceUuidList.length
        });

        let event = this.createEvent('action.tag.attach', '', eventCountingNumber);

        return this.dispatchActionWithEvent('tag/attach', paramList, null, event)
      },
      detachTag (resourceUuidList, tagUuidList) {
        let paramList = tagUuidList.map(uuid => {
          return {
            uuid,
            resourceUuidList
          }
        });
        return this.dispatchActionWithEvent('tag/detach', paramList)
      },
      getPageToolbarTagParam () {
        let self = this;
        return {
          tagType: self.tagType,
          onTagChange: (uuidList) => {
            self.tagUuidList = uuidList;
            self.queryList()
          }
        }
      },
      getTagTypeHeaderParam () {
        let self = this;
        let optionList = [
          {
            text: self.$t('tag.admin'),
            value: 'my'
          },
          {
            text: self.$t('tag.other'),
            value: 'other'
          }
        ];
        return {
          getTitle () {
            return `${self.$t('common.tag')}(${_.find(optionList, ['value', self.tagType]).text})`
          },
          getItemList () {
            return optionList
          },
          getPermission () {
            return 'LICENSE_BASIC_PAID'
          },
          onSelect (index) {
            self.tagType = optionList[index].value;
            self.tagUuidList = [];
            self.queryList()
          }
        }
      },
      calcTagListWidth () {
        // this.tagListWidth = tagListButtonsWidth
        // setTimeout(() => {
        //   if (!this.$refs.tagLeftDivider || !this.$refs.tagRightDivider) return
        //   let tagLeftDividerRect = this.$refs.tagLeftDivider.getBoundingClientRect()
        //   let tagRightDividerRect = this.$refs.tagRightDivider.getBoundingClientRect()
        //   this.tagListWidth = tagRightDividerRect.x - tagLeftDividerRect.x
        // }, 100)
      },
      getTagParam (item) {
        return this.getCurrTagList(item)
      },
      openAttachTagPanel () {
        let self = this;
        if (self.selectedList.length <= 0) return;
        let resourceUuidList = self.selectedList;
        self._openAttachTagPanel(resourceUuidList)
      },
      getCurrTagList (item) {
        let currTagList = [];
        if (this.tagType === 'my' && item.myUserTagUuidList) {
          currTagList = item.myUserTagUuidList.map(uuid => this.getTag(uuid))
        } else if (this.tagType === 'other' && item.otherUserTagUuidList) {
          currTagList = item.otherUserTagUuidList.map(uuid => this.getTag(uuid))
        }
        return currTagList
      },
      openDetachTagPanel () {
        if (!this.canDetachTag()) return;
        if (this.selectedList.length <= 0) return;
        let resourceUuidList = this.selectedList;
        this._openDettachTagPanel(resourceUuidList);
      },
      _canDetachTag (res) {
        if ((res && res.myUserTagUuidList && res.myUserTagUuidList.length > 0) ||
          (res && res.otherUserTagUuidList && res.otherUserTagUuidList.length > 0)) {
          return true
        }
        return false
      }
    }
  }
</script>
