<style scoped lang="less">
  @prefixCls: ~'messageNotification';
  .@{prefixCls}{
    height: 400px;
    overflow-y:auto;
    margin:0px 30px;
    &-top{
      padding: 20px;
    }
    .copy{
      width: 100px;
      height: 28px;
      line-height: 28px;
      border: 1px solid #ccc;
      border-radius: 2px;
      display: inline-block;
      text-align: center;
      &:hover{
        cursor: pointer;
      }
    }
    .type{
      flex: 1 1 14%;
      position: relative;
      width: 100px;
      color: #5e6978;
      font-size: 14px;
    }
    .content{
      display: flex;
      flex-direction: row;
      width: 100%;
      padding: 10px 0px;
    }
    .content-text{
      flex: 1 1 86%;
      color: #1a2736;
      white-space: pre-wrap;
      font-size: 14px;
      width: calc(100% - 100px);
      word-wrap: break-word;
    }
    &-bottom{
      width: 93%;
    }
  }
</style>

<template>
  <div :class="prefixCls">
      <div :class="`${prefixCls}-top`">
        <img src="~assets/detail_operation_log.svg"/>
        <div style="font-size: 24px; color: #1A2736; padding-top: 30px;">
          <span v-if="itemData && itemData.count === 1 && itemData.name !== undefined" class="message-name-text">{{ $t(itemData.action, message) }}</span>
          <span v-if="itemData && (itemData.count > 1 || itemData.name === undefined)" class="message-name-text">{{ $t(itemData.action, { name: '' }) }}</span>
        </div>
      </div>
      <div :class="`${prefixCls}-center`">
        <div class="overview">
        <span class="left">
          <i class="el-icon-s-order icon"></i>
          <span>{{$t('common.overview')}}</span>
        </span>
          <span class="right">
          <span class="copy" @click="copy">
            {{$t('common.copy')}}
          </span>
        </span>
        </div>
      </div>
      <div :class="`${prefixCls}-bottom`">
        <div ref="valueElm">
          <div v-if="message.subType === 'NotApiCall'">
            <div v-if="itemData.failCount > 0">
              <div >
                {{ $t(itemData.action, message) + ' ' + $t('common.failed') }}
              </div>
              <div>
                {{ $t('common.errorMessage') }}{{$t("common.colon")}}
              </div>
              <p style="color: #EC5960;">{{ itemData.content }}</p>
            </div>
            <div v-else>
              <div id="common-success">
                {{ $t(itemData.action, message) + ' ' + $t('common.success') }}
              </div>
            </div>
          </div>
          <div v-if="message.subType !== 'NotApiCall'">
            <div  class="content">
              <div id="common-createTime" class="type">
                {{$t('operationLog.createTime')}}{{$t("common.colon")}}
              </div>
              <span class="content-text">{{ itemData && itemData.time && formatDatetime(new Date(itemData.time)) }}</span>
            </div>
            <div class="content" style="padding-top: 0px;">
              <div id="common-finishTime" class="type">
                {{$t('operationLog.finishTime')}}{{$t("common.colon")}}
              </div>
              <span class="content-text">{{ itemData && itemData.endTime && formatDatetime(new Date(itemData.endTime)) }}</span>
            </div>
          </div>
          <div v-if="message.subType !== 'NotApiCall'" v-for="(apiCall, index) in itemData.apiList">
            <hr />
            <div class="content">
              <div id="common-request" class="type">
                {{$t('common.request')}}{{$t("common.colon")}}
              </div>
              <span class="content-text item">{{ apiCall.req && JSON.stringify(JSON.parse(apiCall.req.replace(/password.*?([,}$])/,'password":"******"$1')), null, 4) }}</span>
            </div>
            <hr style="border-bottom: 1px dashed #DAE0E6; border-top: none;" />
            <div class="content error-text" v-if="apiCall.resp && JSON.parse(apiCall.resp).error && JSON.parse(apiCall.resp).error.details">
              <div id="common-errorMessage" class="type">
                {{$t('common.errorMessage')}}{{$t("common.colon")}}
              </div>
              <span class="content-text" style="color: #EC5960;">{{ JSON.parse(apiCall.resp).error.details }}</span>
            </div>
            <div class="content">
              <div id="common-response" class="type">
                {{$t('common.response')}}{{$t("common.colon")}}
              </div>
              <span style="line-height: 15px;"class="content-text" :style="{color: apiCall.resp && JSON.parse(apiCall.resp).success ? '#1A2736' : '#EC5960'}">{{ apiCall.resp && JSON.stringify(JSON.parse(apiCall.resp), null, 4) }}</span>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
  import Utils from 'src/utils/utils';
  const prefixCls = 'messageNotification';
  export default {
    name: "MessageNotificationDetail",
    props: {
      message:{
        type: Object,
        default: {}
      }
    },
    data() {
      return{
        prefixCls: prefixCls,
        itemData: {}
      }
    },
    created() {
      let self = this;
      self.queryItemData(self.message.id);
    },
    methods: {
      copy: function () {
        if (typeof InstallTrigger !== 'undefined') { // firefox
          var range = document.createRange()
          range.selectNode(this.$refs.valueElm)
          window.getSelection().addRange(range)
          document.execCommand('copy')
          window.getSelection().removeAllRanges()
        } else {
          this.$nextTick(() => {
            var range = document.createRange()
            range.selectNode(this.$refs.valueElm)
            window.getSelection().removeAllRanges()
            this.$nextTick(() => {
              // var range = document.createRange()
              range.selectNode(this.$refs.valueElm)
              window.getSelection().addRange(range)
              document.execCommand('copy')
              window.getSelection().removeAllRanges()
            })
          })
        }
      },
      queryItemData: async function (itemId) {
        let self = this;
        self.itemData = {};
        self.itemData = await self.getAction(itemId);
      },
      ...Utils
    },
    watch: {
      message(newVal, oldVal){
        let self = this;
        if(_.isEqual(newVal, oldVal)) return;
        self.queryItemData(newVal.id);
      }
    }
  }
</script>
