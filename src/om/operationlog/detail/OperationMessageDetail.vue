<template>
  <div class="container operation__log-content">
    <div v-if="$route.params.currTab === 'operationLog'">
      <div class="left-header">
        <base-icon name="notification_large"/>
        <div class="after-icon"></div>
        <detail-name class="name" :param="nameParam()"/>
      </div>
      <div class="left-body">
        <div class="detail-block-header" style="margin-top:30px;">
          {{$t('common.overview')}}
          <div class="btn-primary" style="position: absolute;right: 86px;font-size: 12px;padding:4px 20px;"
               @click="copy()">{{$t('common.copy')}}
          </div>
          <div>
          </div>
        </div>
        <div ref="valueElm" class="content">
          <detail-row
            :param="{
              title:  'common.createDate',
              content: formatDatetime(new Date(message.time))
            }"
          />
          <detail-row
            :param="{
              title:  'operationLog.finishTime',
              content: formatDatetime(new Date(message.endTime))
            }"
          />
          <span class="split-line"></span>
          <div v-for="(api, index) in message.apiList" :key="index">
            <detail-row
              :param="{
           title: 'common.request',
           content: getContent(api.req),
           getDetailRowClass: () => 'detail-row-pre',
           getContentClass: () => 'content-pre'
         }"
            />
            <hr style="margin: 15px 80px 15px 0px;border: 0.5px dashed #ddd"/>
            <detail-row
              v-if="!isIE && !getContent(api.resp).success"
              :param="{
                title: '详情',
                content: !isIE && getContent(api.resp).error.details,
                etDetailRowClass: () => 'error-text',
               getContentClass: () => 'error-text'
              }"
            />
            <detail-row
              :param="{
             title: 'common.response',
             content: getContent(api.resp),
             getDetailRowClass: () => {
               if(getContent(api.resp).success) {
                 return 'detail-row-pre';
               }else {
                 return 'detail-row-pre error-text';
               }
             },
             getContentClass: () => {
               if(getContent(api.resp).success) {
                 return 'content-pre';
               }else {
                 return 'content-pre error-text';
               }
             }
            }"
            />
            <span class="split-line"></span>
          </div>
        </div>
      </div>
    </div>
    <div class="detail-body" v-if="$route.params.currTab === 'audit'">
      <div  class="left" style="border-right: none;">
        <div class="left-header">
          <div class="icon"></div>
          <div class="after-icon"></div>
          <detail-name class="name" :param="{getValue(){return message.apiName}, canEdit(){return false}}"/>
        </div>
        <div class="left-body">
          <div style="height: 40px"></div>
          <detail-row
            :param="{
              title:'operationLog.duration',
              content: durationConvert(message.duration),
            }"
          />
          <detail-row
           :param="{
             title:'operationLog.resourceType',
             content: message.resourceType
           }"
          />
          <detail-row
            :param="{
              title: 'operationLog.resourceUuid',
              content: message.resourceUuid
            }"
          />
          <detail-row
            :param="{
              title:'operationLog.accountUuid',
              content: message.operatorAccountUuid
            }"
          />
        </div>
      </div>
      <div class="right" style="border-left: 1px dashed #dae0e6;">
          <div class="detail-block-header" style="margin-top:30px;">
            {{$t('common.moreInformation')}}
            <div class="btn-primary" style="position: absolute;right: 86px;font-size: 12px;padding:4px 20px;"
                 @click="copy()">{{$t('common.copy')}}
            </div>
            <div>
            </div>
          </div>
          <div ref="valueElm" class="content">
            <detail-row
              :param="{
              title:  'common.createDate',
              content: formatDatetime(new Date(message.time))
            }"
            />
            <detail-row
              :param="{
                title: 'operationLog.apiRequestUuid',
                content: message.requestUuid
              }"
            />
            <hr style="margin: 15px 80px 15px 0px;"/>
              <detail-row
                :param="{
           title: 'common.request',
           content: getContent(message.requestDump),
           getDetailRowClass: () => 'detail-row-pre',
           getContentClass: () => 'content-pre'
         }"
              />
            <detail-row
              :param="{
           title: 'operationLog.apiResponseUuid',
           content: message.responseUuid,
         }"
            />
            <detail-row
              :param="{
              title:  'operationLog.finishTime',
              content: formatDatetime(new Date(Number(message.time) + Number(message.duration)))
            }"
            />
              <hr style="margin: 15px 80px 15px 0px;border: 0.5px dashed #ddd"/>
              <detail-row
                :param="{
               title: 'common.response',
               content: getContent(message.responseDump),
               getDetailRowClass: () => 'detail-row-pre',
               getContentClass: () => 'content-pre'
            }"
              />
            </div>
        </div>
      </div>
  </div>
</template>

<script>
  import OperationMessageDetailService from './OperationMessageDetailService';
  export default {
    name: "OperationMessageDetail",
    mixins: [OperationMessageDetailService]
  }
</script>

<style scoped lang="less">
  @import "../../../style/mixins.less";

  .icon {
    .detail-icon("~assets/notification_large.svg")
  }
  .content{
    div:last-child{
      hr{
        &:last-child{
          border: none;
        }
      }
    }
  }

  .operation__log-content{
    width: 100%;
    height: 100%;
    position: relative;
  }
</style>
