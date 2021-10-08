export const topMenuList = [
  {
    path: '/ecs/ecsInstance',
    title: '计算'
  },
  {
    path: '/network/vxlanpool',
    title: '网络'
  },
  {
    path: '/storage/primarystorage',
    title: '存储'
  },
  {
    path: '/security/securitygroup',
    title: '安全'
  },
  {
    path: '/om/zone',
    title: '平台运维'
  },
  // {
  //   path: '/database/oracle',
  //   title: '数据库'
  // },
  {
    path: '/vcenter/resource',
    title: 'vCenter'
  },
  {
    path: '/alicloud/hybridkeysecret',
    title: '阿里云'
  },
  {
    path: '/tencentcloud/hybridtencentkeysecret',
    title: '腾讯云'
  },
  {
    path: '/huaweicloud/hybridhuaweiaccountkey',
    title: '华为云'
  }
]

export const vpcMenuList = [
  {
    path: 'vpcInstance',
    title: 'vpc实例'
  }
]

export const ecsMenuList = [
  // {
  //   path: 'ecs/home',
  //   title: '首页',
  //   type: 'link',
  //   icon: 'el-icon-caret-right',
  //   children: []
  // },
  {
    path: 'ecs/vm',
    title: '云主机',
    type: 'link',
    icon: 'icon-yunzhuji',
    children: []
  },
  {
    path: 'ecs/volume',
    title: '云盘',
    type: 'link',
    icon: 'icon-yunpan01',
    children: []
  },
  {
    path: 'ecs/image',
    title: '镜像',
    type: 'link',
    icon: 'icon-jingxiang',
    children: []
  },
  {
    path: 'ecs/affinitygroup',
    title: '亲和组',
    type: 'link',
    icon: 'icon-fuwuqizu',
    children: []
  },
  {
    path: 'ecs/instanceoffering',
    title: '计算规格',
    type: 'link',
    icon: 'icon-guigejijia',
    children: []
  },
  {
    path: 'ecs/volumeoffering',
    title: '云盘规格',
    type: 'link',
    icon: 'icon-guige',
    children: []
  },
  {
    path: 'ecs/autoscalinggroup',
    title: '弹性伸缩组',
    type: 'link',
    icon: 'icon-essdanxingshensuo',
    children: []
  }
]

export const netWorkMenuList = [
  // {
  //   path: '',
  //   title: '网络拓扑',
  //   type: 'link',
  //   icon: 'el-icon-tickets',
  //   children: []
  // },
  {
    path: 'network',
    title: '二层网络资源',
    type: 'button',
    icon: 'icon-wangluo-',
    children: [
      {
        path: 'network/vxlanpool',
        type: 'link',
        title: 'VXLAN Pool',
        icon: 'icon-erji-yunziyuanchi',
        children: []
      },
      {
        path: 'network/l2network',
        type: 'link',
        title: '二层网络',
        icon: 'icon-wangluo-',
        children: []
      }
    ]
  },
  {
    path: 'network',
    title: ' 三层网络',
    type: 'button',
    icon: 'icon-wangluo-1',
    children: [
      {
        path: 'network/publicnetwork',
        type: 'link',
        title: '公有网络',
        icon: 'icon-xunisiyouwangluoVPC',
        children: []
      },
      {
        path: 'network/privatenetwork',
        type: 'link',
        title: '私有网络',
        icon: 'icon-wangluo-1',
        children: []
      },
      {
        path: 'network/systemnetwork',
        type: 'link',
        title:'系统网络',
        icon: 'icon-xitongwangluo',
        children: []
      }
    ]
  },
  {
    path: 'network',
    title: '云路由资源',
    type: 'button',
    icon: 'icon-ziyuan',
    children: [
      {
        path: 'network/virtualrouter',
        title: '云路由器',
        type: 'link',
        icon: 'icon-luyouqi',
        children: []
      },
      {
        path: 'network/virtualrouterimage',
        title: "云路由镜像",
        type: 'link',
        icon: 'icon-jingxiang',
        children: []
      },
      {
        path: 'network/virtualrouteroffering',
        title: '云路由规格',
        type: 'link',
        icon: 'icon-guige',
        children: []
      },
      {
        path: 'network/vrouterroutetable',
        title: '路由表',
        type: 'link',
        icon: 'icon-luyoubiao',
        children: []
      }
    ]
  },
  {
    path: 'network',
    title: 'vpc',
    type: 'button',
    icon: 'icon-xunisiyouwangluoVPC',
    children: [
      {
        path: 'network/vpcvrouter',
        title:  'VPC路由器',
        type: 'link',
        icon: 'icon-luyouqi-',
        children: []
      },
      {
        path: 'network/vpcnetwork',
        title: 'VPC网络',
        type: 'link',
        icon: 'icon-xunisiyouwangluoVPC',
        children: []
      }
    ]
  },
  {
    path: 'network',
    title: '网络服务',
    type: 'button',
    icon: 'icon-wangluo-',
    children: [
      {
        path: 'network/vip',
        title: '虚拟IP',
        type: 'link',
        icon: 'icon-neiwangxuniIP',
        children: []
      },
      {
        path: 'network/eip',
        title: '弹性IP',
        type: 'link',
        icon: 'icon-danxingIP',
        children: []
      },
      {
        path: 'network/portforwarding',
        title: '端口转发',
        type: 'link',
        icon: 'icon-gongxiangtubiao_baojingduankoushezhi',
        children: []
      }
    ]
  },
  {
    path: '/',
    title: '负载均衡',
    type: 'button',
    icon: 'icon-fuzaijunheng',
    children: [
      {
        path: 'network/loadbalancer',
        title: '负载均衡',
        type: 'link',
        icon: "icon-fuzaijunheng",
        children: []
      },
      {
        path: 'network/loadbalancerlistener',
        title: '监听器',
        type: 'link',
        icon: 'icon-jiantingqi',
        children: []
      },
      {
        path: 'network/ipsec',
        title: 'IPsec隧道',
        type: 'link',
        icon: 'icon-suidao',
        children: []
      }
    ]
  }
]

export const securityMenuList = [
  {
    path: 'security/securitygroup',
    title: '安全组',
    type: 'link',
    icon: 'icon-icon_anquan',
    children: []
  },
  // {
  //   path: '',
  //   title: '主机安全',
  //   type: 'link',
  //   icon: 'el-icon-tickets',
  //   children: []
  // },
  // {
  //   path: '',
  //   title: 'DDOS防护',
  //   type: 'link',
  //   icon: 'el-icon-tickets',
  //   children: []
  // },
  // {
  //   path: '',
  //   title: '证书安全',
  //   type: 'link',
  //   icon: 'el-icon-tickets',
  //   children: []
  // },
  // {
  //   path: '',
  //   title: '安全组',
  //   type: 'link',
  //   icon: 'el-icon-tickets',
  //   children: []
  // }
]

export const storageMenuList = [
  {
    path: 'storage/primarystorage',
    title: '主存储',
    type: 'link',
    icon: 'icon-duixiangcunchu',
    children: []
  },
  {
    path: 'storage/backupstorage',
    title: '镜像服务器',
    type: 'link',
    icon: 'icon-fuwuqi',
    children: []
  },
  {
    path: 'storage/sanstorage',
    title: 'SAN存储',
    type: 'link',
    icon: 'icon-cunchurongliang',
    children: []
  }
]

export const omMenuList = [
  {
    path: 'om/zone',
    title: '区域',
    type: 'link',
    icon: 'icon-winfo-icon-quyusaomiao',
    children: []
  },
  {
    path: 'om/cluster',
    title: '集群',
    type: 'link',
    icon: 'icon-jiqunguanli',
    children: []
  },
  {
    path: 'om/host',
    title: '物理机',
    type: 'link',
    icon: 'icon-wuliji',
    children: []
  },
  {
    path: 'om/',
    title: '用户管理',
    type: 'button',
    icon: 'icon-yonghuguanli',
    children: [
      {
        path: 'om/account',
        title: '账户',
        type: 'link',
        icon: 'icon-account',
        children: []
      },
      {
        path: 'om/user',
        title: '用户',
        type: 'link',
        icon: 'icon-yonghu',
        children: []
      },
      {
        path: 'om/groupuser',
        title: '用户组',
        type: 'link',
        icon: 'icon-yonghuzu',
        children: []
      }
    ]
  },
  {
    path: 'om/',
    title: '计费管理',
    type: 'button',
    icon: 'icon-jifeiguanli',
    children: [
      {
        path: 'om/billing',
        title: '账单',
        type: 'link',
        icon: 'el-icon-tickets',
        children: []
      },
      {
        path: 'om/billingsettings',
        title: '计费设置',
        type: 'link',
        icon: 'icon-shezhi',
        children: []
      },
    ]
  },
  {
    path: 'om/',
    title: '定时',
    type: 'button',
    icon: 'icon-dingshi_l',
    children: [
      {
        path: 'om/timer',
        title: '定时器',
        type: 'link',
        icon: 'icon-timer',
        children: []
      },
      {
        path: 'om/schedulerjob',
        title: '定时任务',
        type: 'link',
        icon: 'icon-dingshi_l',
        children: []
      },
      {
        path: 'om/tag',
        title: '标签',
        type: 'link',
        icon: 'icon-tag',
        children: []
      },
      {
        path: 'om/appcenter',
        title: '应用中心',
        type: 'link',
        icon: 'icon-yingyongzhongxin',
        children: []
      },
      {
        path: 'om/emailserversetting',
        title: '邮箱服务器',
        type: 'link',
        icon: 'icon-fuwuqi',
        children: []
      },
      {
        path: 'om/adldapserver',
        title: 'AD/LDAP',
        type: 'link',
        icon: 'icon-ad',
        children: []
      },
      {
        path: 'om/consoleproxy',
        title: '控制台代理',
        type: 'link',
        icon: 'icon-icon_xinyong_xianxing_jijin-',
        children: []
      },
      {
        path: 'om/certificate',
        title: '证书',
        type: 'link',
        icon: 'icon-fafangzhengshu',
        children: []
      },
      {
        path: 'om/accesskey',
        title: 'AccessKey',
        type: 'link',
        icon: 'icon-miyao',
        children: []
      },
    ]
  },
  {
    path: 'om/performance',
    title: '性能分析',
    type: 'link',
    icon: 'icon-xingneng',
    children: []
  },
  {
    path: 'om/performancehomepage',
    title: 'top5',
    type: 'link',
    icon: 'icon-top',
    children: []
  },
  {
    path: 'om/',
    title: 'Mwatch',
    type: 'button',
    icon: 'icon-shoudongbaojingqi',
    children: [
      {
        path: 'om/zwatchalarm',
        title: '报警器',
        type: 'link',
        icon: 'icon-shoudongbaojingqi',
        children: []
      },
      {
        path: 'om/zwatchsnstexttemplate',
        title: '报警信息模板',
        type: 'link',
        icon: 'icon-iconfontmoban',
        children: []
      }
    ]
  },
  {
    path: 'om/',
    title: '通知服务',
    type: 'button',
    icon: 'icon-tongzhi',
    children: [
      {
        path: 'om/zwatchendpoint',
        title: '接收端',
        type: 'link',
        icon: 'icon-jieshouguanli-xiugai',
        children: []
      },
      {
        path: 'om/messagecenter',
        title: '消息中心',
        type: 'link',
        icon: 'icon-xiaoxizhongxin',
        children: []
      },
      {
        path: 'om/operationlog',
        title: '操作日志',
        type: 'link',
        icon: 'icon-caozuorizhi',
        children: []
      }
    ]
  },
  {
    path: 'om/',
    title: '资源编排',
    type: 'button',
    icon: 'icon-ziyuan',
    children: [
      {
        path: 'om/resourcestack',
        title: '资源栈',
        type: 'link',
        icon: 'icon-dashuju',
        children: []
      },
      {
        path: 'om/resourcestacktemplate',
        title: '资源栈模板',
        type: 'link',
        icon: 'icon-moban',
        children: []
      },
      {
        path: 'om/sysresourcestacktemplate',
        title: '资源栈示例模板',
        type: 'link',
        icon: 'icon-beiwanglushili',
        children: []
      },
      // {
      //   path: '',
      //   title: '资源栈编辑模板',
      //   type: 'link',
      //   icon: 'el-icon-tickets',
      //   children: []
      // }
    ]
  },
  {
    path: 'om/globalsettings',
    title: '全局设置',
    type: 'link',
    icon: 'icon-shezhi',
    children: []
  }
]

export const databaseMenuList = [
  {
    path: 'database/oracle',
    title: 'Oracle',
    type: 'link',
    icon: 'el-icon-tickets',
    children: []
  },
  {
    path: 'database/oracle',
    title: 'Sqlserver',
    type: 'link',
    icon: 'el-icon-tickets',
    children: []
  },
  {
    path: 'database/oracle',
    title: 'Mysql',
    type: 'link',
    icon: 'el-icon-tickets',
    children: []
  }
]

export const vCenterMenuList = [
  {
    path: 'vcenter/resource',
    title: '基础资源',
    type: 'link',
    icon: 'icon-ziyuan',
    children: []
  },
  {
    path: 'vcenter/vcentervminstance',
    title: '云主机',
    type: 'link',
    icon: 'icon-yunzhuji2',
    children: []
  },
  {
    path: 'vcenter/vcenternetwork',
    title: '网络',
    type: 'link',
    icon: 'icon-wangluo-',
    children: []
  },
  {
    path: 'vcenter/vcentervolume',
    title: '云盘',
    type: 'link',
    icon: 'icon-yunpan01',
    children: []
  },
  {
    path: 'vcenter/vcenterimage',
    title: '镜像',
    type: 'link',
    icon: 'icon-jingxiang',
    children: []
  },
  {
    path: 'vcenter/vcentermessage',
    title: '事件消息',
    type: 'link',
    icon: 'icon-event',
    children: []
  }
]


export const aliCloudMenuList = [
  {
    path: '',
    title: '同步数据',
    type: 'button',
    icon: 'icon-tongbu',
    children: []
  },
  {
    path: 'alicloud/hybridkeysecret',
    title: 'AccessKey',
    type: 'link',
    icon: 'icon-miyao',
    children: []
  },
  {
    path: 'alicloud/',
    title: '产品',
    type: 'button',
    icon: 'icon-chanpinguanli',
    children: [
      {
        path: 'alicloud/hybridalicloudecs',
        title: 'ECS云主机',
        type: 'link',
        icon: 'icon-yunzhuji2',
        children: []
      },
      {
        path: 'alicloud/hybridaliclouddisk',
        title: '云盘',
        type: 'link',
        icon: 'icon-qiyeyunpan',
        children: []
      },
      {
        path: 'alicloud/hybridalicloudimage',
        title: '镜像',
        type: 'link',
        icon: 'icon-jingxiang',
        children: []
      },
      {
        path: 'alicloud/hybridalicloudsecuritygroup',
        title: '安全组',
        type: 'link',
        icon: 'icon-icon_anquan',
        children: []
      },
      {
        path: 'alicloud/hybridalicloudvpc',
        title: '专有网络VPC',
        type: 'link',
        icon: 'icon-vpc',
        children: []
      },
      {
        path: 'alicloud/hybridalicloudeip',
        title: '弹性公网IP',
        type: 'link',
        icon: 'icon-danxingIP',
        children: []
      },
      // {
      //   path: '',
      //   title: '灾备数据',
      //   type: 'link',
      //   icon: 'el-icon-tickets',
      //   children: []
      // }
    ]
  },
  {
    path: 'alicloud/',
    title: 'VPN',
    type: 'button',
    icon: 'icon-VPN',
    children: [
      {
        path: 'alicloud/hybridalicloudvpcvpngateway',
        title: 'VPN网关',
        type: 'link',
        icon: 'icon-VPNwangguan',
        children: []
      },
      {
        path: 'alicloud/hybridalicloudvpcuservpngateway',
        title: 'VPN用户网关',
        type: 'link',
        icon: 'icon-VPNwangguan1',
        children: []
      },
      {
        path: 'alicloud/hybridalicloudvpcvpnconnection',
        title: 'VPN连接',
        type: 'link',
        icon: 'icon-lianjie',
        children: []
      }
    ]
  },
  {
    path: 'alicloud/',
    title: '高速通道',
    type: 'button',
    icon: 'icon-ly_kuaisutongdao',
    children: [
      {
        path: 'alicloud/hybridalicloudvirtualrouterinterface',
        title: '路由器接口',
        type: 'link',
        icon: 'icon-luyouqi1',
        children: []
      },
      {
        path: 'alicloud/hybridalicloudvirtualborderrouter',
        title: '边界路由器',
        type: 'link',
        icon: 'icon-bijiben-',
        children: []
      }
    ]
  },
  {
    path: '/alicloud/',
    title: '阿里云NAS',
    type: 'button',
    icon: 'icon-naswenjiancunchuNAS',
    children: [
      {
        path: 'alicloud/hybridalicloudfilesystem',
        title: '文件系统',
        type: 'link',
        icon: 'icon-gongxiangwenjianxitong',
        children: []
      },
      {
        path: 'alicloud/hybridalicloudaccessgroup',
        title: '权限组',
        type: 'link',
        icon: 'icon-quanxianweihu',
        children: []
      }
    ]
  },
  {
    path: '/alicloud/',
    title: '数据中心',
    type: 'button',
    icon: 'icon-dashuju',
    children: [
      {
        path: 'alicloud/hybridaliclouddatacenter',
        title: '地域',
        type: 'link',
        icon: 'icon-diyu',
        children: []
      },
      {
        path: 'alicloud/hybridalicloudidentityzone',
        title: '可用区',
        type: 'link',
        icon: 'icon-usedarea',
        children: []
      },
      // {
      //   path: '',
      //   title: '灾备服务器',
      //   type: 'link',
      //   icon: 'el-icon-tickets',
      //   children: []
      // }
    ]
  },
  {
    path: 'alicloud/hybridalicloudconfig',
    title: '设置',
    type: 'link',
    icon: 'icon-shezhi',
    children: []
  },
  // {
  //   path: 'alicloud/hybridalicloudabout',
  //   title: '关于',
  //   type: 'link',
  //   icon: 'el-icon-tickets',
  //   children: []
  // }
]

export const tencentCloudMenuList = [
  {
    path: '',
    title: '同步数据',
    type: 'button',
    icon: 'icon-tongbu',
    children: []
  },
  {
    path: 'tencentcloud/hybridtencentkeysecret',
    title: 'SecretKey',
    type: 'link',
    icon: 'icon-miyao',
    children: []
  },
  {
    path: 'tencentcloud/',
    title: '产品',
    type: 'button',
    icon: 'icon-chanpinguanli',
    children: [
      {
        path: 'tencentcloud/hybridtencentecs',
        title: 'CVM云主机',
        type: 'link',
        icon: 'icon-yunzhuji2',
        children: []
      },
      {
        path: 'tencentcloud/hybridtencentdisk',
        title: '云盘',
        type: 'link',
        icon: 'icon-qiyeyunpan',
        children: []
      },
      {
        path: 'tencentcloud/hybridtencentimage',
        title: '镜像',
        type: 'link',
        icon: 'icon-jingxiang',
        children: []
      },
      {
        path: 'tencentcloud/hybridtencentsecuritygroup',
        title: '安全组',
        type: 'link',
        icon: 'icon-icon_anquan',
        children: []
      },
      {
        path: 'tencentcloud/hybridtencentvpc',
        title: '专有网络VPC',
        type: 'link',
        icon: 'icon-vpc',
        children: []
      },
      {
        path: 'tencentcloud/hybridtencenteip',
        title: '弹性公网IP',
        type: 'link',
        icon: 'icon-danxingIP',
        children: []
      }
    ]
  },
  {
    path: '',
    title: 'VPN',
    type: 'button',
    icon: 'icon-VPN',
    children: [
      {
        path: 'tencentcloud/hybridtencentvpcvpngateway',
        title: 'VPN网关',
        type: 'link',
        icon: 'icon-VPNwangguan',
        children: []
      },
      {
        path: 'tencentcloud/hybridtencentvpnusergateway',
        title: '对端网关',
        type: 'link',
        icon: 'icon-VPNwangguan1',
        children: []
      },
      {
        path: 'tencentcloud/hybridtencentvpnconnection',
        title: 'VPN连接',
        type: 'link',
        icon: 'icon-lianjie',
        children: []
      }
    ]
  },
  {
    path: '/tencentcloud/',
    title: '数据中心',
    type: 'button',
    icon: 'icon-dashuju',
    children: [
      {
        path: 'tencentcloud/hybridtencentdatacenter',
        title: '地域',
        type: 'link',
        icon: 'icon-diyu',
        children: []
      },
      {
        path: 'tencentcloud/hybridtencentidentityzone',
        title: '可用区',
        type: 'link',
        icon: 'icon-usedarea',
        children: []
      },
      // {
      //   path: '',
      //   title: '灾备服务器',
      //   type: 'link',
      //   icon: 'el-icon-tickets',
      //   children: []
      // }
    ]
  },
  // {
  //   path: '',
  //   title: '设置',
  //   type: 'link',
  //   icon: 'el-icon-tickets',
  //   children: []
  // },
  // {
  //   path: '',
  //   title: '关于',
  //   type: 'link',
  //   icon: 'el-icon-tickets',
  //   children: []
  // }
]

export const huaweiCloudMenuList = [
  {
    path: '',
    title: '同步数据',
    type: 'button',
    icon: 'icon-tongbu',
    children: []
  },
  {
    path: 'huaweicloud/hybridhuaweiaccountkey',
    title: 'AccountKey',
    type: 'link',
    icon: 'icon-miyao',
    children: []
  },
  {
    path: 'huaweicloud/',
    title: '产品',
    type: 'button',
    icon: 'icon-chanpinguanli',
    children: [
      {
        path: 'huaweicloud/hybridhuaweiecs',
        title: 'ECS云主机',
        type: 'link',
        icon: 'icon-yunzhuji2',
        children: []
      },
      {
        path: 'huaweicloud/hybridhuaweidisk',
        title: '云盘',
        type: 'link',
        icon: 'icon-qiyeyunpan',
        children: []
      },
      {
        path: 'huaweicloud/hybridhuaweiimage',
        title: '镜像',
        type: 'link',
        icon: 'icon-jingxiang',
        children: []
      },
      {
        path: 'huaweicloud/hybridhuaweisecuritygroup',
        title: '安全组',
        type: 'link',
        icon: 'icon-icon_anquan',
        children: []
      },
      {
        path: 'huaweicloud/hybridhuaweivpc',
        title: '专有网络VPC',
        type: 'link',
        icon: 'icon-vpc',
        children: []
      },
      {
        path: 'huaweicloud/hybridhuaweieip',
        title: '弹性公网IP',
        type: 'link',
        icon: 'icon-danxingIP',
        children: []
      }
    ]
  },
  {
    path: '',
    title: '数据中心',
    type: 'button',
    icon: 'icon-dashuju',
    children: [
      {
        path: 'huaweicloud/hybridhuaweidatacenter',
        title: '地域',
        type: 'link',
        icon: 'icon-diyu',
        children: []
      },
      {
        path: 'huaweicloud/hybridhuaweiidentityzone',
        title: '可用区',
        type: 'link',
        icon: 'icon-usedarea',
        children: []
      }
    ]
  }
]
