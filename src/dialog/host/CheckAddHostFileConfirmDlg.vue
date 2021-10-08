<template>
  <dialog-template style="font-size: 16px;">
    <span slot="title" class="modal-plain-header">
      <span id="common-destroyHost">{{$t("host.checkFile")}}</span>
      <span class="el-icon-close dialog-close" @click="cancel"></span>
    </span>
    <div slot="body">
      <div v-if="!showError" class="body-content">
        <div class="running state-item" v-if="state === 'running'">
          <span class="icon" />
          <span class="text" :title="$t('host.checkFileing')">{{ $t("host.checkFileing") }}</span>
        </div>
        <div class="success state-item" v-if="state === 'success'">
          <span class="icon" />
          <span class="text" :title="$t('host.checkFileSuccess')">{{ $t("host.checkFileSuccess") }}</span>
        </div>
        <div class="fail" v-if="state === 'fail'">
          <span class="icon" />
          <span class="text" :title="$t('host.checkFileFail')">{{ $t("host.checkFileFail") }}</span>
          <div class="error-list">
            <div class="error-item" v-for="item in errorList">
              <div class="line">{{ item.line ? $t("common.line", {line: item.line }) : '' }}</div>
              <div class="error-message">{{ item.description }}</div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="body-content">
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <div id="common-cancel" class="btn-confirm" style="margin-top: 15px;" @click="cancel">
        {{$t("common.ok")}}
      </div>
    </div>
  </dialog-template>
</template>


<script>
  import rpc from 'src/utils/rpc'
  import WindowBase from 'src/windows/Window'
  import GBK from 'gbk.js'

  export default {
    name: 'CheckAddHostFileConfirmDlg',
    mixins: [WindowBase],
    data () {
      return {
        state: 'running',
        showError: false
      }
    },
    created () {
      let self = this
      this.scrollContainerSelector = '.container'
      this.scrollElementSelector = '.body'
      if (this.dialogData.param.fileInfo) {
        let byteArray = GBK.decode(new Uint8Array(this.dialogData.param.fileInfo))
        let blob = new window.Blob([byteArray], {
          type: 'text/plain'
        })
        let reader = new window.FileReader()
        let fileInfo
        reader.onload = function (e) {
          fileInfo = e.target.result
          self.checkFile(fileInfo)
        }
        reader.readAsText(blob)
      }
    },
    methods: {
      checkFile: function (fileInfo) {
        rpc.create('hosts/kvm/from-file/check', {
          hostInfo: window.btoa(unescape(encodeURIComponent(fileInfo)))
        })
          .then((resp) => {
            if (resp.success) this.state = 'success'
            else this.state = 'error'
          }, (error) => {
            this.state = 'fail'
            let msg = error.body
            msg = JSON.parse(msg)
            if (msg.error.details.indexOf('line') === -1) {
              this.errorList = [{
                line: '',
                description: msg.error.details
              }]
              return
            }
            let msgList = msg.error.details.split('line ')
            let errorList = []
            msgList.forEach((item, index) => {
              if (item && index > 0) {
                let text = item.split(':')
                errorList.push({
                  line: text[0],
                  description: text[1]
                })
              }
            })
            this.errorList = errorList
          })
      },
      cancel: function () {
        this.closeDialog(this.windowId)
      },
      ok: function () {
        this.dialogData.param.ok()
        this.closeDialog(this.windowId)
      }
    }
  }
</script>

<style scoped>
  .body-content {
    height: 400px;
    padding-left: 60px;
  }

  .state-item {
    display: inline-block;
    line-height: 40px;
    position: relative;
    top: 50%;
    margin-top: -20px;
  }

  .icon {
    height: 20px;
    width: 20px;
    display: inline-block;
    position: relative;
    margin-right: 20px;
  }

  .success .icon {
    top: 6px;
    background-image: url('~assets/notification_success.svg');
    background-repeat: no-repeat;
  }

  .fail {
    padding-top: 60px;
  }

  .fail .icon {
    top: 5px;
    background-image: url('~assets/notification_error.svg');
    background-repeat: no-repeat;
  }

  .running .icon {
    top: 6px;
    height: 18px;
    background-image: url('~assets/notification_running.svg');
    animation:run 2s linear infinite;
    background-repeat: no-repeat;
  }

  .line {
    position: relative;
    padding-top: 20px;
    width: 100px;
    color: #5E6978;
    font-size: 14px;
    display: inline-block;
    float: left;
  }

  .error-message {
    display: inline-block;
    color: rgb(236, 89, 96);
    white-space: pre-wrap;
    font-size: 14px;
    padding-top: 20px;
    width: calc(100% - 106px);
    word-wrap: break-word;
  }

  .error-item {
    margin-bottom: 20px;
  }

  .running .text {
    color: #5E6978;
  }

  @keyframes run {
    　from {
      transform:rotate(0deg);
    } to {
        transform:rotate(360deg);
      }
  }
</style>
