<template>
  <div :class="prefixCls">
    <div>
      <div class="icon"></div>
      <div class="content">
        <span v-if="content">
          {{ content }}
        </span>
      </div>
      <div class="overview">
        <span class="left">
          <i class="mh-brief_inf">
            <span class="path4"></span>
          </i>
          <span>{{$t('common.overview')}}</span>
        </span>
        <span class="right">
          <span class="copy" @click="copy">
            {{$t('common.copy')}}
          </span>
        </span>
      </div>
    </div>
    <div class="detail">
      <div class="detail-title" style="padding: 10px 0px;">
        <div class="left">{{$t('common.monitoralarm')}}</div>
        <div class="right"></div>
      </div>
      <div class="detail-content" ref="valueElm">
        <div class="left">{{$t('messageCenter.alarmDetail')}}{{$t("common.colon")}}</div>
        <span class="content-text">{{ JSON.stringify(message, null, 4)}}</span>
      </div>
    </div>
  </div>
</template>

<script>
  import Utils from 'src/utils/utils';
  import {cloneDeep} from 'lodash';

  const prefixCls = 'message';
  export default {
    name: "MessageDetail",
    props: ['param'],
    data() {
      let message = cloneDeep(this.param.message)
      let content = message.content
      delete message['content']
      return {
        prefixCls: prefixCls,
        content: content,
        message: message
      }
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
      ...Utils
    },
    'param.message': function (newValue, oldValue) {
      if (_.isEqual(newValue, oldValue)) return
      let message = cloneDeep(this.param.message)
      let content = message.content
      delete message['content']
      this.content = content
      this.message = message
    }
  }
</script>

<style scoped lang="less">
  @prefixCls: ~"message";
  .@{prefixCls} {
    padding: 30px;
    height: 400px;
    overflow-y: auto;
    overflow-x: hidden;

    .icon {
      display: inline-block;
      /*left: -2px;*/
      width: 62px;
      height: 60px;
      background-image: url('../assets/notification_large.svg');
      background-repeat: no-repeat;
    }

    .content {
      font-size: 24px;
      color: #1A2736;
      padding-top: 30px;
    }

    .copy {
      width: 100px;
      height: 28px;
      line-height: 28px;
      border: 1px solid #ccc;
      border-radius: 2px;
      display: inline-block;
      text-align: center;

      &:hover {
        cursor: pointer;
      }
    }

    .detail-content {
      display: flex;
      flex-direction: row;
      line-height: 16px;

      .left {
        display: inline-block;
        flex: 1 1 14%;
      }

      .content-text {
        flex: 1 1 86%;
        color: #1a2736;
        white-space: pre-wrap;
        font-size: 14px;
        width: calc(100% - 100px);
        word-wrap: break-word;
      }
    }
  }
</style>
