<template>
  <div class="body" style="padding: 30px 0 0 30px;">
    <div class="title">{{ projectName }}</div>
    <div class="sub-title">{{$t("home.title.myrole")}}{{$t("common.colon")}} {{$t(`home.${data.role}`)}}</div>
    <div class="user-name">
      <img src="~assets/user.svg" class="img">
      <span>{{data.name}}</span>
    </div>
    <div class="content">
      <div class="item">
        <div class="col-name" :title="$t('home.productPrincipal')">{{ $t("home.productPrincipal") }}</div>
        <div class="col-text" :title="data.projectAdmin ? data.projectAdmin : ''">{{ data.projectAdmin ? data.projectAdmin : ''}} </div>
      </div>
      <div class="item">
        <div class="col-name" :title="$t('home.memberNum')">{{ $t("home.memberNum")}}</div>
        <div class="col-text" :title="data.memberNum">{{ data.memberNum }} </div>
      </div>
      <div class="item" style="flex: 5; border-right: none;">
        <div class="col-name" :title="$t('home.projectCycle')">{{ $t("home.projectCycle") }}</div>
        <div class="col-text" v-if="data.projectExpiredDate === 'noLimit'" :title="$t('common.nolimit')">{{ $t("common.nolimit") }}</div>
        <div class="col-text" v-else :title="data.projectCreateDate ? `${timeFormatter(data.projectCreateDate)} ${$t('common.to')} ${timeFormatter(data.projectExpiredDate)}` : ''">{{ data.projectCreateDate ? `${timeFormatter(data.projectCreateDate)} ${$t("common.to")} ${timeFormatter(data.projectExpiredDate)}` : ''}} </div>
      </div>
    </div>
  </div>
</template>

<script>
  import _ from 'lodash'
  import Utils from 'src/utils/utils'

  export default {
    name: 'BarRatio',
    props: ['param'],
    created: function () {
      this.init(this.param.data)
    },
    destroyed: function () {
    },
    data () {
      return {
        data: {},
        projectName: ''
      }
    },
    methods: {
      init (data) {
        if (!_.has(data, 'memberNum')) return
        this.data = data
        this.projectName = window.localStorage.getItem('currProjectName')
      },
      timeFormatter (value) {
        let date = new Date(value)
        return date.getFullYear() + '/' + this.appendzero(date.getMonth() + 1) + '/' + this.appendzero(date.getDate())
      },
      appendzero (value) {
        if (value < 10) return '0' + value
        else return value
      },
      ...Utils
    },
    watch: {
      'param.data': function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return
        this.init(newValue)
        this.$forceUpdate()
      }
    }
  }
</script>

<style scoped>
  .body {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-image: url('~assets/sys_project_member_bg.svg');
    position: relative;
  }

  .body .title {
    font-family: PingFangSC-Regular;
    font-size: 24px;
    color: #FFFFFF;
    letter-spacing: 0;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    margin-bottom: 10px;
  }

  .content {
    width: 100%;
    display: flex;
    height: 40px;
    position: absolute;
    bottom: 40px;
  }

  .content .item{
    flex: 2;
    width: 0;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #5E6978;
    letter-spacing: 0;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    text-align: left;
    border-right: 1px solid rgba(255,255,255,0.25);
    margin-right: 30px;
  }

  @media (max-width: 1680px) {
    .body .title {
      font-size: 28px;
    }

    .body .item.time {
      flex: 2;
    }
  }

  .sub-title {
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #FFFFFF;
    letter-spacing: 0;
    margin-bottom: 200px;
  }

  .col-name {
    opacity: 0.8;
    font-family: PingFangSC-Regular;
    font-size: 12px;
    color: #FFFFFF;
    letter-spacing: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .col-text {
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #FFFFFF;
    letter-spacing: 0;
    margin-top: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-name span {
    font-family: PingFangSC-Regular;
    font-size: 24px;
    color: #FFFFFF;
    position: relative;
    top: 8px;
  }

  .user-name {
    margin-bottom: 50px;
  }

  .img {
    width: 60px;
    vertical-align: middle;
    margin-right: 20px;
  }
</style>
