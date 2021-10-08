// Warning: 不要修改代码格式，反引号会保留原有字符的格式
export default {
  help: {
    certificateInCreateListener: {
      head: '证书',
      content: `当监听协议为HTTPS，需绑定证书使用，支持上传证书和证书链。`
    },
    dhcpInRange: {
      head: 'DHCP IP',
      content: `1. 若首次创建三层网络并启用DHCP服务，或对已启用DHCP服务的三层网络添加首个网络段，支持自定义设置DHCP IP；
2. 若三层网络已存在DHCP IP，添加网络段不允许自定义设置DHCP IP；
3. DHCP IP可以在添加的IP范围之内或之外，但必须在添加的IP范围所属的CIDR内，且未被占用；
4. 若留空不填，将由系统在添加的IP范围内随机指定。`
    },
    dhcpInCIDR: {
      head: 'DHCP IP',
      content: `1. 若首次创建三层网络并启用DHCP服务，或对已启用DHCP服务的三层网络添加首个网络段，支持自定义设置DHCP IP；
2. 若三层网络已存在DHCP IP，添加网络段不允许自定义设置DHCP IP；
3. DHCP IP可以在添加的IP范围之内或之外，但必须在添加的IP范围所属的CIDR内，且未被占用；
4. 若留空不填，将由系统在添加的IP范围内随机指定；
5. CIDR内首个IP地址已被默认为网关，不可作为DHCP IP。`
    },
    cdrom: {
      head: '虚拟光驱',
      content: `1. 显示了当前云主机已添加的虚拟光驱列表；
2. 请先将云主机关机，再进行创建光驱或删除光驱的操作；
3. 云主机允许添加的最大虚拟光驱数量可在全局设置中修改。`
    },
    intelEpt: {
      head: 'Intel EPT硬件辅助',
      content: `1. 默认不勾选，表示开启Intel EPT硬件辅助功能；
2. 若因服务器CPU型号过旧，导致无法创建云主机或者创建的云主机不能显示控制台界面，可勾选此项，关闭Intel EPT硬件辅助功能。
注意：该功能仅针对Intel CPU生效。`
    },
    backupPolicy: {
      head: '执行策略',
      content: `1. 备份任务将按照设置的执行策略进行数据备份；
2. 执行策略包括：增量备份、全量备份（可选）、备份保留策略、创建后立即备份（可选）。`
    },
    backupCycle: {
      head: '备份周期',
      content: `1. 可选择按周/天/小时进行备份，基于所选的备份周期，需设置更细粒度的备份任务执行时间，精确到分钟级；
2. 备份任务最小执行间隔时间为1小时；
3. 若选择按小时备份，从备份任务创建时刻起，按整点进行备份。`
    },
    incrementBackup: {
      head: '增量备份',
      content: `1. 可选择按周/天/小时进行备份，基于所选的备份周期，需设置更细粒度的备份任务执行时间，精确到分钟级；
2. 备份任务最小执行间隔时间为1小时；
3. 若选择按小时备份，从备份任务创建时刻起按整点进行备份。`
    },
    fullBackup: {
      head: '全量备份',
      content: `1. 默认不勾选，表示仅执行定时增量备份策略；
2. 若勾选，需设置定时全量备份策略，可选择按周/天进行备份，基于所选的备份周期，需设置更细粒度的备份任务执行时间，精确到分钟级；
3. 若某时刻增量备份任务和全量备份任务同时触发，将以队列依次执行。`
    },
    retentionPolicy: {
      head: '备份保留策略',
      content: `1. 选择设置备份数据的保留数量，必须为整数，最小允许保留1份备份数据；
2. 选择设置备份数据的保留时间，单位包括：天/周/月，最小允许保留1天备份数据。`
    },
    createSnapshot: {
      head: '创建快照',
      content: `在Shared Block主存储上创建的共享云盘，不支持创建快照。`
    },
    createVolumeImage: {
      head: '创建云盘镜像',
      content: `在Shared Block主存储上创建的共享云盘，请先将已挂载的云主机全部关机，再创建云盘镜像。`
    },
    blockDevice: {
      head: '块设备',
      content: `1. 显示了SAN存储直接透传给当前云主机的块设备；
2. 一台云主机可加载多个块设备，一个块设备也可加载到多台云主机。`
    },
    backupQoS: {
      head: 'QoS',
      content: `1. 支持对本地云主机/云盘的备份任务设置网络QoS和磁盘QoS，不填写则默认无限制；
2. QoS设置建议与物理环境网络带宽相匹配，也需额外考虑并发备份的任务量。`
    },
    VmInstanceVolumeTagsAdminProjectManagement: {
      head: '标签',
      content: `1. 支持对资源定制化创建标签，可通过标签类型及标签名称快速过滤出所需资源；
2. 标签分为管理员标签和租户标签两种类型；
3. 管理员标签：由管理员（admin/平台管理员）创建，归管理员所有；
4. 租户标签：由租户（普通账户/项目）创建，归租户所有；
5. 普通账户可将自己的标签绑定到所分配的资源；
6. 归属于项目的标签，项目内所有人（项目负责人/项目管理员/项目成员）均可见可操作；
7. 管理员可将管理员标签/租户标签绑定到租户资源，并可解绑/删除租户标签。`
    },
    VmInstanceVolumeTagsAdminNotProjectManagement: {
      head: '标签',
      content: `1. 支持对资源定制化创建标签，可通过标签类型及标签名称快速过滤出所需资源；
2. 标签分为管理员标签和租户标签两种类型；
3. 管理员标签：由管理员（admin）创建，归管理员所有；
4. 租户标签：由租户（普通账户）创建，归租户所有；
5. 租户可将自己的标签绑定到所分配的资源；
6. 管理员可将管理员标签/租户标签绑定到租户资源，并可解绑/删除租户标签。`
    },
    VmInstanceVolumeTagsNormalAccountProjectManagement: {
      head: '标签',
      content: `1. 支持对资源定制化创建标签，可通过标签名称快速过滤出所需资源；
2. 租户标签：由租户（普通账户/项目）创建，归租户所有；
3. 普通账户可将自己的标签绑定到所分配的资源；
4. 归属于项目的标签，项目内所有人（项目负责人/项目管理员/项目成员）均可见可操作。`
    },
    VmInstanceVolumeTagsNormalAccountNotProjectManagement: {
      head: '标签',
      content: `支持对资源定制化创建标签，可通过标签名称快速过滤出所需资源。`
    },
    TagsAdminProjectManagement: {
      head: '标签',
      content: `1. 支持对资源定制化创建标签，可通过标签类型及标签名称快速过滤出所需资源；
2. 标签分为管理员标签和租户标签两种类型；
3. 管理员标签：由管理员（admin/平台管理员）创建，归管理员所有；
4. 租户标签：由租户（普通账户/项目）创建，归租户所有；
5. 普通账户可将自己的标签绑定到所分配的资源；
6. 归属于项目的标签，项目内所有人（项目负责人/项目管理员/项目成员）均可见可操作；
7. 管理员可解绑/删除租户标签。`
    },
    TagsAdminNotProjectManagement: {
      head: '标签',
      content: `1. 支持对资源定制化创建标签，可通过标签类型及标签名称快速过滤出所需资源；
2. 标签分为管理员标签和租户标签两种类型；
3. 管理员标签：由管理员（admin）创建，归管理员所有；
4. 租户标签：由租户（普通账户）创建，归租户所有；
5. 租户可将自己的标签绑定到所分配的资源；
6. 管理员可解绑/删除租户标签。`
    },
    TagsNormalAccountProjectManagement: {
      head: '标签',
      content: `1. 支持对资源定制化创建标签，可通过标签名称快速过滤出所需资源；
2. 租户标签：由租户（普通账户/项目）创建，归租户所有；
3. 普通账户可将自己的标签绑定到所分配的资源；
4. 归属于项目的标签，项目内所有人（项目负责人/项目管理员/项目成员）均可见可操作。`
    },
    TagsNormalAccountNotProjectManagement: {
      head: '标签',
      content: `支持对资源定制化创建标签，可通过标签名称快速过滤出所需资源。`
    },
    backupQoSNetworkInbound: {
      head: '网络下行速度',
      content: '设置网络下行速度上限，单位：Kbps/Mbps/Gbps，取值范围：8Kbps~30Gbps，注意：bps = bit per second。'
    },
    backupQoSNetworkOutbound: {
      head: '网络上行速度',
      content: '设置网络上行速度上限，单位：Kbps/Mbps/Gbps，取值范围：8Kbps~30Gbps，注意：bps = bit per second。'
    },
    backupQoSVolumeReadRate: {
      head: '磁盘读取速度',
      content: '设置磁盘读取速度上限，单位：MB/s、GB/s，取值范围：1MB/s~100GB/s，注意：B/s = Byte per Second。'
    },
    backupQoSVolumeWirteRate: {
      head: '磁盘写入速度',
      content: '设置磁盘写入速度上限，单位：MB/s、GB/s，取值范围：1MB/s~100GB/s，注意：B/s = Byte per Second。'
    },
    ept: {
      head: 'Intel EPT硬件辅助',
      content: `表示Intel EPT硬件辅助虚拟化功能的状态。
注意：
1. 物理机处于维护模式时，才能修改该设置；
2. 修改后需启用物理机，该设置才能生效。`
    },
    iSCSIServer: {
      head: 'iSCSI服务器',
      content: `1. 在UI界面上添加iSCSI服务器，无需进入每个物理机进行配置，即可登录iSCSI服务器；
2. 添加iSCSI服务器后，通过同步数据，可在UI界面上实时展示其上所有块设备，并支持块设备透传给云主机使用。`
    },
    fiberChannelController: {
      head: 'FC存储',
      content: `1. 部署FC存储后，云平台支持在UI界面上实时展示FC存储与所有块设备，并支持块设备透传给云主机使用；
2. 支持检查块设备所在的集群状态，如果所有物理机与块设备连接正常，支持将该块设备添加为SharedBlock主存储。`
    },
    zoneOnRemoteBackupStorage: {
      head: '区域',
      content: `1. 支持对远端备份服务器加载或卸载区域;
2. 从远端备份服务器卸载区域后，该区域内本地备份服务器上的备份数据将无法继续同步至远端，远端备份数据也无法还原到该区域。`
    },
    autoScalingGroup: {
      head: '弹性伸缩组',
      content: `1. 弹性伸缩组是一组具有相同应用场景的云主机集合，可根据用户业务变化自动实现弹性伸缩或弹性自愈；
2. 弹性伸缩包括：弹性扩容、弹性缩容，前者在业务增长时自动增加云主机，后者在业务下降时自动减少云主机；
3. 提供ZWatch监控报警触发弹性伸缩，可自定义接收端类型，包括：邮箱、钉钉、HTTP应用；
4. 弹性自愈：通过监控伸缩组内云主机的健康状态，自动移除不健康云主机并创建新的云主机，确保组内健康云主机数不低于设置的最小值；
5. 提供两种健康检查机制触发弹性自愈：负载均衡健康检查、云主机健康检查，若伸缩组配置了负载均衡功能，建议选择负载均衡器自带的健康检查机制；
<b>注意：</b>
弹性伸缩会自动释放云主机，建议不要对伸缩组内云主机手动挂载云盘、网卡、安全组等，若组内云主机保存有状态信息，相关数据将会丢失！`
    },
    autoScalingGroupConfig: {
      head: '伸缩组设置',
      content: `1. 弹性扩容时组内云主机数不能高于设置的最大值，弹性缩容时不能低于设置的最小值，初次创建伸缩组时组内云主机数为设置的初始值；
2. 可为伸缩组配置负载均衡功能，实现基于负载均衡的云主机弹性伸缩，此时建议选择负载均衡器自带的健康检查机制；
3. 选择负载均衡器后，必须选择监听器，若选多个监听器，将分别通过不同端口或端口组对同一组云主机进行监听；
4. 目前支持云路由网络/VPC网络场景的云主机弹性伸缩；
5. 伸缩组支持配置ZWatch监控报警机制触发弹性伸缩，可自定义接收端类型，包括：邮箱、钉钉、HTTP应用。`
    },
    autoScalingGroupBasicConfigInfoMinVmInstanceNum: {
      head: '最小云主机数量',
      content: `弹性缩容时，组内云主机数不能低于设置的最小值。`
    },
    autoScalingGroupBasicConfigInfoMaxVmInstanceNum: {
      head: '最大云主机数量',
      content: `弹性扩容时，组内云主机数不能高于设置的最大值。`
    },
    autoScalingGroupBasicConfigInfonumberofInitialInstance: {
      head: '起始云主机数量',
      content: `初次创建伸缩组时，组内云主机数为设置的初始值。`
    },
    autoScalingGroupBasicConfigInfoLoadBalancer: {
      head: '负载均衡器',
      content: `1. 可为伸缩组配置负载均衡功能，实现基于负载均衡的云主机弹性伸缩；
2. 此时建议选择负载均衡器自带的健康检查机制。`
    },
    autoScalingGroupBasicConfigInfoLoadBalancerListener: {
      head: '监听器',
      content: `1. 选择负载均衡器后，必须选择监听器；
2. 若选多个监听器，将分别通过不同端口对同一组云主机进行监听。`
    },
    autoScalingGroupBasicConfigL3Network: {
      head: '三层网络',
      content: `目前支持云路由网络/VPC网络场景的云主机弹性伸缩。`
    },
    healthCheck: {
      head: '健康检查',
      content: `提供两种健康检查机制：
<b>1. 负载均衡健康检查</b>
负载均衡器自带的健康检查机制，通过监控云主机健康状态触发弹性自愈，需设置健康检查宽限时间。
<b>2. 云主机健康检查</b>
实时检查云主机健康状态，若检测到云主机处于不健康状态（包括：停止状态、未知状态、已删除状态），将自动移除不健康云主机并创建新的云主机，确保组内健康云主机数不低于设置的最小值。`
    },
    autoScalingGroupBasicConfigHealthCheckGraceTime: {
      head: '健康检查宽限时间',
      content: `伸缩组内云主机创建启动后的一段时间，在该时间内，云主机相关应用服务可能仍在启动中，伸缩组不进行负载均衡健康检查，超过该时间，将用于负载均衡健康检查机制监控云主机健康状态。`
    },
    autoScalingGroupBasicConfigEnableAlarmNotification: {
      head: '报警通知',
      content: `伸缩组支持配置ZWatch监控报警机制触发弹性伸缩，可自定义接收端类型，包括：邮箱、钉钉、HTTP应用。`
    },
    autoScalingGroupConfigVmInstanceInfo: {
      head: '伸缩配置',
      content: `1. 伸缩配置定义了伸缩组内云主机的模板配置信息；
2. 若将模板配置中的资源删除（例如计算规格、镜像、网络等），将导致伸缩组创建失败，请谨慎操作。`
    },
    autoScalingGroupConfigVmInstanceName: {
      head: '云主机名称',
      content: `组内云主机统一命名规则：“asg-伸缩组名称-云主机名称-云主机UUID前5位”，其中asg是autoscaling group的缩写。`
    },
    autoScalingGroupConfigVmInstanceImage: {
      head: '镜像',
      content: `弹性伸缩场景下，云主机镜像目前支持添加qcow2格式和raw格式。`
    },
    scalingConfig: {
      head: '伸缩配置',
      content: `1. 伸缩配置定义了伸缩组内云主机的模板配置信息；
2. 组内云主机统一命名规则：“asg-伸缩组名称-云主机名称-云主机UUID前5位”，其中asg是autoscaling group的缩写；
3. 云主机镜像目前支持添加qcow2格式和raw格式；
4. 若将模板配置中的资源删除（例如计算规格、镜像、网络等），将导致伸缩组创建失败，请谨慎操作。`
    },
    expansionStrategy: {
      head: '扩容策略',
      content: `1. 在业务增长时，伸缩组自动增加云主机进行扩容，避免访问延时和资源超负荷运行；
2. 通过设置ZWatch监控报警机制触发弹性扩容；
3. 例如：当监测到伸缩组内全部云主机的平均内存使用率在一段时间内持续突破80%，将自动创建合适数量的云主机，使伸缩组重新达到合理的负载均衡。`
    },
    shrinkageStrategy: {
      head: '缩容策略',
      content: `1. 在业务下降时，伸缩组自动减少云主机进行缩容，避免资源浪费；
2. 通过设置ZWatch监控报警机制触发弹性缩容；
3. 例如：当监测到伸缩组内全部云主机的平均内存使用率在一段时间内持续低于20%，将自动移除合适数量的云主机，使伸缩组重新达到合理的负载均衡。`
    },
    autoScalingGroupConfigConfigScalingPolicyCoolDownTime: {
      head: '冷却时间',
      content: `伸缩组执行完成一次伸缩活动后的一段时间，在该时间内，伸缩组处于锁定状态，不执行其它伸缩活动。`
    },
    autoScalingGroupConfigConfigScalingPolicyIncreaseInQuantityEachTime: {
      head: '每次增加云主机数量',
      content: `1. 伸缩组执行一次扩容活动允许增加的云主机数量；
2. 伸缩组每次扩容最小允许增加1台云主机，该数值设置过大可能导致扩容活动失败。`
    },
    autoScalingGroupConfigConfigScalingPolicyTriggerEntry: {
      head: '触发条目',
      content: `设置缩容策略时，触发条目不可选择，与扩容时触发条目保持一致。`
    },
    autoScalingGroupConfigConfigScalingPolicyReduceQuantityEveryTime: {
      head: '每次减少云主机数量',
      content: `1. 伸缩组执行一次缩容活动允许减少的云主机数量；
2. 伸缩组每次缩容最小允许减少1台云主机，该数值设置过大可能导致缩容活动失败。`
    },
    privateNetworkInterface: {
      head: '私有网络接口IP',
      content: `1. 在云路由网路场景下，可通过设置私有网络接口IP为云路由器配置双网关，从而实现更好的分布流量，提高网络灵活性和稳定性；
2. 该私有网络接口IP不能与上述基本设置中的IP范围有重叠，但要与基本设置中的网关能互通；
3. 设置私有网络接口IP后，还需在交换机上配置相应的策略路由，该场景才可正常工作。`
    },
    autoScalingRecord: {
      head: '伸缩记录',
      content: `界面显示了伸缩组进行伸缩活动的记录信息，请调整合适的时间段进行搜索。`
    },
    dataNetwork: {
      head: '数据网络',
      content: `1. 如果已部署本地灾备单独使用的网络，需填写数据网络CIDR；
2. 本地云主机/云盘/数据库备份到本地备份服务器、以及本地备份数据从本地备份服务器还原至本地，均使用该数据网络；
3. 如果不设置，本地灾备将默认使用管理网络。`
    },
    vmBackup: {
      head: '整机备份',
      content: `1. 支持对带云盘的云主机进行整机备份；
2. 若云主机带共享云盘，不支持整机备份。`
    },
    affinityGroupPolicy: {
      head: `亲和组策略`,
      content: `1. 反亲和组(非强制)：将亲和组内的云主机尽量分配到不同物理机上，当没有更多物理机可分配时，回归普通分配策略；
2. 反亲和组(强制)：将亲和组内的云主机严格分配到不同物理机上，当没有更多物理机可分配时，则分配失败。`
    },
    remoteBackupStorage: {
      head: '远端备份服务器',
      content: `1. 位于异地机房/公有云上的存储服务器，用于存放本地云主机、云盘的备份数据；
2. 备份数据仅可从本地备份服务器同步至远端备份服务器；
3. 仅允许添加一个远端备份服务器；
4. 备份到远端备份服务器上的备份数据可在详情页中查看。`
    },
    localBackupStorage: {
      head: '本地备份服务器',
      content: `1. 位于本地机房的存储服务器，用于存放本地云主机、云盘的备份数据；
2. 可以接使用本地机房已部署的镜像仓库作为本地备份服务器，也可部署新的本地备份服务器。`
    },
    createResourceBackupTask: {
      head: '创建备份任务',
      content: `1. 将本地云主机、云盘定时备份到指定的本地备份服务器；
2. 当选择多个本地备份服务器时，若一个备份服务器发生故障，备份任务会自动切换到剩下的备份服务器上去做备份；
3. 备份数据支持同步到远端服务器；
4. 需设置备份任务的执行策略。`
    },
    createDatabaseBackup: {
      head: '创建备份任务',
      content: `1. 将管理节点数据库定时备份到指定的本地备份服务器；
2. 当选择多个本地备份服务器时，若一个备份服务器发生故障，备份任务会自动切换到剩下的备份服务器上去做备份；
3. 备份数据支持同步到远端服务器；
4. 需设置备份任务的执行策略。 `
    },
    backupTaskResourceType: {
      head: '备份对象',
      content: `1. 支持对云主机、云盘创建备份任务；
2. 云主机需处于开机状态，才可创建备份任务；
3. 云盘需挂载到开机状态的云主机，才可创建备份任务。`
    },
    backupData: {
      head: '本地备份数据',
      content: `1. 备份在本地备份服务器中的本地云主机、云盘、数据库的备份数据；
2. 备份数据可还原至本地，或同步到远端备份服务器中。`
    },
    recoverBackup: {
      head: '还原策略',
      content: `1. 新建资源：保留原始资源的同时创建新资源;
2. 覆盖原始资源：在原始资源存在的前提下将其覆盖。`
    },
    zone: {
      head: `区域`,
      content: `1. 一般对应了数据中心的一个机房；
2. 包含集群、二层网络、主存储等资源。
规划区域时，需注意：
1. 同一个物理二层广播域中的物理机应该在同一个区域；
2. 同一个物理二层广播域应规划为单个区域的二层网络；
3. 同一个主存储不应跨越多个区域。`
    },
    cluster: {
      head: `集群`,
      content: `1. 一组物理机的逻辑集合，一个集群一般对应了一个机架。
规划集群时，需注意：
1. 集群内所有物理机须拥有相同的操作系统；
2. 集群内所有物理机须拥有相同的网络配置；
3. 集群内所有物理机须能够访问相同的主存储；
4. 集群需挂载主存储、二层网络后，才可提供云主机服务。`
    },
    checkCpuModel: {
      head: '物理机CPU模式设置',
      content: `1. 默认选择"使用全局设置"，检查集群物理机CPU模式由全局设置中的“物理机CPU型号检测”决定；
2. 若选择"检查"，系统将检查新添加到集群的物理机CPU类型，只允许集群内添加同一CPU类型的物理机；
3. 若选择"不检查"，表示不限制集群中物理机的CPU类型；
4. 集群内物理机CPU类型的统一，从前提上确保了云主机迁移成功的可能性。`
    },
    cpuModel: {
      head: '指定云主机CPU模式',
      content: `1. 默认选择"None"，集群内云主机的CPU模式由全局设置中的"云主机CPU模式"决定；
2. 若选择某一特定的CPU类型，集群内云主机将统一配置为该CPU类型；
3. 若选择"host-passthrough"，集群内云主机CPU的类型特性与物理机CPU的类型特性一致，但可能会导致从云主机内部和从云主机所在物理机查看云主机CPU使用率数值不一致。`
    },
    host: {
      head: `物理机`,
      content: `1. 为云主机实例提供计算、网络或存储的物理主机；
2. 添加物理机需输入物理机的IP、SSH端口、用户名和密码。
需注意：
1. 需使用定制版ISO安装CentOS系统；
2. BIOS需打开Intel VMX或AMD SVM的硬件虚拟化支持；
3. 需确保IP地址、用户名、密码正确，用户名有sudo权限；
4. 管理节点的IP可达物理机的SSH端口以部署软件和代理程序；
5. 请确保在添加物理机完成后，再创建，删除L2网络。`
    },
    backupStorage: {
      head: `镜像服务器`,
      content: `用于存储云主机的镜像模板（含ISO）。支持以下类型：
ImageStore：
1. 企业版支持，增量存储，支持在线快照、在线创建镜像、在线克隆；
2. 需输入镜像服务器的IP、URL、SSH端口、用户名和密码。
Sftp：
1. 开源版支持，文件存储，支持关机快照、关机创建镜像；
2. 需输入镜像服务器的IP、URL、SSH端口、用户名和密码。
Ceph：
1. 采用Ceph分布式块存储，支持在线快照，关机克隆；
2. 需输入监控节点的Mon IP、SSH端口、用户名和密码。`
    },
    clearBackUpStorage: {
      head: `数据清理`,
      content: `1.清理镜像服务器中已被彻底删除的无效数据，释放存储空间;
2. 仅ImageStore镜像服务器支持该操作。`
    },
    clearLocalBackUpStorage: {
      head: `数据清理`,
      content: `清理本地备份服务器中已被彻底删除的无效备份数据，释放存储空间。`
    },
    clearRemoteBackUpStorage: {
      head: `数据清理`,
      content: `清理远端备份服务器中已被彻底删除的无效备份数据，释放存储空间。`
    },
    backupStoragePoolName: {
      head: `镜像存储池名`,
      content: `1. 可对镜像存储指定特定的存储池，可选项,默认会自动创建；
2. 如果指定，则需提前在Ceph存储集群自行创建存储池。`
    },
    backupStorageImportImages: {
      head: `获取已有镜像`,
      content: `1. 若勾选，可获取该镜像服务器中URL路径下的已有镜像文件；
2. ImageStore类型的镜像服务器支持该操作。`
    },
    syncImageNetwork: {
      head: `镜像同步网络`,
      content: `1. 如果已部署镜像同步单独使用的网络，需填写镜像同步网络CIDR；
2. 如果不设置，镜像同步时默认使用管理网络；
3. 如果源镜像仓库和目标镜像仓库均设置镜像同步网络，起作用的是目标镜像仓库的镜像同步网络。`
    },
    primaryStorageInfoNotHybrid: {
      head: '主存储',
      content: `1. 用于存储云主机的磁盘文件（根云盘、数据云盘、快照、镜像缓存等）；
2. 支持以下类型：LocalStorage、NFS、SharedMountPoint、Ceph、SharedBlock；
3. 注意：
a. 需确保IP地址、用户名、密码正确，用户名有sudo权限；
b. NFS或者SharedMountPoint提供的目录需提供读写权限；
c. 管理节点的IP可达对应的SSH端口以部署软件和代理程序。`
    },
    LocalStorageUrl: {
      head: 'URL',
      content: `1. 如果输入的目录不存在系统将会自动创建该目录；
2. 不能使用以下/、 /dev/、/proc/、/sys/、/usr/bin、/bin等系统目录；
3. 使用系统目录可能会导致物理机异常。`
    },
    NFSUrl: {
      head: 'URL',
      content: `1. 输入NFS Server的共享目录URL，输入格式为：NFS_Server_IP:/NFS_Share_folder；
2. 请提前在NFS Server端设置相应目录的访问权限；
3. 为保证在NFS Server端的安全控制，建议配置相应安全规则，进行访问控制；
4. 不能使用以下/、 /dev/、/proc/、/sys/、/usr/bin、/bin等系统目录；
5. 使用系统目录可能会导致物理机异常。`
    },
    SharedMountPointUrl: {
      head: 'URL',
      content: `1. 输入物理机已挂载的共享存储目录URL；
2. 不能使用以下/、 /dev/、/proc/、/sys/、/usr/bin、/bin等系统目录；
3. 使用系统目录可能会导致物理机异常。`
    },
    AliyunNASMount: {
      head: '挂载路径',
      content: `1. 挂载路径是物理机上的目录以供挂载阿里云NAS文件系统的挂载点；
2. 如果输入的目录不存在系统将会自动创建该目录；
3. 不能使用以下/、 /dev/、/proc/、/sys/、/usr/bin、/bin等系统目录；
4. 使用系统目录可能会导致物理机异常。`
    },
    AliyunEBSUrl: {
      head: 'URL',
      content: `1. 输入Ocean API的endpoint，输入格式为：http://Ocean_Server_Domain:Port/ocean/api；
2. AliyunEBS主存储通过该URL向Ocean Server端发送请求。`
    },
    AliyunEBSTdcConfig: {
      head: 'TDC配置内容',
      content: `1. TDC是安装在计算节点上的程序，用于与阿里云存储节点通信（例如Nuwa)，TDC配置是计算节点访问存储节点的相关配置；
2. TDC配置参数包括：物理机访问TDC服务的端口、TDC Region、两组River Master（包括URL、Server IP、代理IP）、阿里云EBS所在集群，请按实际情况配置。`
    },
    backupStorageInfoNotHybrid: {
      head: '镜像服务器',
      content: `1. 用于存储云主机的镜像模板（含ISO）；
2. 支持以下类型：ImageStor、Sftp（社区版支持）、Ceph。`
    },
    backupStorageInfoHybrid: {
      head: '镜像服务器',
      content: `1. 用于存储云主机的镜像模板（含ISO）；
2. 支持以下类型：ImageStor、Ceph、AliyunEBS。`
    },
    AliyunEBSBackupStorageUrl: {
      head: 'URL',
      content: `1. 输入Ocean API的endpoint，输入格式为：http://Ocean_Server_Domain:Port/ocean/api；
2. AliyunEBS镜像服务器通过该URL向Ocean Server端发送请求。`
    },
    primaryStorageInfoHybrid: {
      head: '主存储',
      content: `1. 用于存储云主机的磁盘文件（根云盘、数据云盘、快照、镜像缓存等）；
2. 支持以下类型：LocalStorage、NFS、SharedMountPoint、Ceph、SharedBlock、AliyunNAS、AliyunEBS；
3. 注意：
a. 需确保IP地址、用户名、密码正确，用户名有sudo权限；
b. NFS或者SharedMountPoint提供的目录需提供读写权限；
c. 管理节点的IP可达对应的SSH端口以部署软件和代理程序。`
    },
    primaryStorageTypeNotHybrid: {
      head: '主存储类型',
      content: `<b>LocalStorage</b>
使用各物理机的本地硬盘目录作为主存储，匹配镜像仓库或Sftp镜像服务器，容量由各物理机的目录容量累加。
<b>NFS</b>
使用网络文件系统作为主存储，匹配镜像仓库或Sftp镜像服务器，会在所有物理机上自动挂载此目录。
<b>SharedMountPoint</b>
使用共享文件系统存储，支持SAN，格式化为GlusterFS，OCFS2，GFS2，匹配镜像仓库或Sftp镜像服务器，需在各物理机提前挂载存储到相同目录。
<b>Ceph</b>
使用Ceph分布式块存储，匹配同一Ceph存储集群的镜像服务器。
<b>SharedBlock</b>
使用共享块设备作为主存储，匹配镜像仓库，支持添加一个或多个共享块设备，需输入磁盘唯一标识，例如：磁盘UUID、WWN、WWID。`
    },
    primaryStorageTypeHybrid: {
      head: '主存储类型',
      content: `<b>LocalStorage</b>
使用各物理机的本地硬盘目录作为主存储，匹配镜像仓库或Sftp镜像服务器，容量由各物理机的目录容量累加。
<b>NFS</b>
使用网络文件系统作为主存储，匹配镜像仓库或Sftp镜像服务器，会在所有物理机上自动挂载此目录。
<b>SharedMountPoint</b>
使用共享文件系统存储，支持SAN，格式化为GlusterFS，OCFS2，GFS2，匹配镜像仓库或Sftp镜像服务器，需在各物理机提前挂载存储到相同目录。
<b>Ceph</b>
使用Ceph分布式块存储，匹配同一Ceph存储集群的镜像服务器。
<b>SharedBlock</b>
使用共享块设备作为主存储，匹配镜像仓库，支持添加一个或多个共享块设备，需输入磁盘唯一标识，例如：磁盘UUID、WWN、WWID。
<b>AliyunNAS</b>
1. 使用阿里云NAS文件系统作为主存储，匹配镜像仓库；
2. 需提前在混合云界面进行相关配置，包括：设置阿里云服务网关、添加相应AK、创建阿里云NAS文件系统，以及创建权限组和权限规则，为文件系统设置访问白名单机制。
<b>AliyunEBS</b>
1. 使用阿里云EBS分布式块存储系统作为主存储，匹配AliyunEBS类型镜像服务器；
2. 需提前在混合云界面进行相关配置，包括：添加相应AK、添加地域和可用区、添加相应地域下的OSS Bucket。 `
    },
    backupStorageTypeNotHybrid: {
      head: '镜像服务器类型',
      content: `<b>ImageStore</b>
企业版支持，增量存储，支持在线快照、在线创建镜像、在线克隆。
<b>Sftp</b>
开源版支持，文件存储，支持关机快照、关机创建镜像。
<b>Ceph</b>
采用Ceph分布式块存储，支持在线快照，在线创建镜像、在线克隆。`
    },
    backupStorageTypeHybrid: {
      head: '镜像服务器类型',
      content: `<b>ImageStore</b>
企业版支持，增量存储，支持在线快照、在线创建镜像、在线克隆。
<b>Sftp</b>
开源版支持，文件存储，支持关机快照、关机创建镜像。
<b>Ceph</b>
采用Ceph分布式块存储，支持在线快照，在线创建镜像、在线克隆。
<b>AliyunEBS</b>
1. 采用阿里云EBS分布式块存储，支持在线快照，在线创建镜像、在线克隆；
2. 需提前在混合云界面进行相关配置，包括：添加相应AK、添加地域和可用区、添加相应地域下的OSS Bucket。`
    },
    primaryStorage: {
      head: `主存储`,
      content: `用于存储云主机的磁盘文件(根云盘、数据云盘、快照、镜像缓存等)。
支持以下类型：
本地存储：
1. 使用各物理机的本地硬盘目录作为主存储，需输入URL；
2. 匹配镜像仓库或Sftp镜像服务器，容量由各物理机的目录容量累加。
NFS：
1. 使用网络文件系统作为主存储，需输入NFS共享文件目录；
2. 匹配镜像仓库或Sftp镜像服务器，会在所有物理机上自动挂载此目录；
3. NFS挂载参数，为可选项，需NFS Server端支持。
Shared Mount Point：
1. 使用共享文件系统存储，支持SAN，格式化为GlusterFS，OCFS2，GFS2；
2. 匹配镜像仓库或Sftp镜像服务器，需在各物理机提前挂载存储到相同目录，需输入挂载目录。
Ceph：
1. 使用Ceph分布式块存储，匹配同一Ceph存储集群的镜像服务器；
2. 需输入监控节点的Mon IP、SSH端口、用户名和密码。
SharedBlock：
1. 使用共享块设备作为主存储，匹配镜像仓库；
2. 支持添加一个或多个共享块设备，需输入磁盘唯一标识，例如：磁盘UUID、WWN、WWID

添加主存储，需注意：
1. 需确保IP地址、用户名、密码正确，用户名有sudo权限；
2. NFS或者Shared Mount Point提供的目录需提供读写权限；
3. 管理节点的IP可达对应的SSH端口以部署软件和代理程序。`
    },
    diskUuid: {
      head: '共享块',
      content: `1. 需确保计算节点已正常连接存储设备，且已添加到云平台；
2. 支持添加一个或多个共享块设备。`
    },
    nfsMount: {
      head: '挂载参数',
      content: `1. 挂载参数为可选项，需NFS Server端支持；
2. 参数以逗号隔开。例如：输入nfsvers=3,sec=sys,tcp,intr,timeo=5，表示：NFS Server端的版本为3，采用标准的unix验证机制，采用tcp作为传输协议，允许通知中断一个nfs调用，设置超时时间为0.5秒（5/10）；
3. NFS的mount参数可以参考mount的-o选项里的内容；
4. 可根据常用的客户端mount命令参数进行设置，如果设置的参数与NFS Server端冲突，则以Server端为准。`
    },
    primaryStorageUrl: {
      head: '注意:',
      content: `1. 挂载路径是物理机上的目录以供挂载阿里云NAS的挂载点，如果输入的目录不存在系统将会自动创建该目录；
2. 不能使用以下/、 /dev/、/proc/、/sys/、/usr/bin、/bin等系统目录;
3. 使用系统目录可能会导致物理机异常。`
    },
    backupStorageUrl: {
      head: '注意:',
      content: `1. 建议提前为此URL挂载大容量存储，输入此目录的绝对路径；
2. 不能使用以下/、 /dev/、/proc/、/sys/、/usr/bin、/bin等系统目录;
3. 使用系统目录可能会导致物理机异常。`
    },
    primaryStorage_storageNetworkCidr: {
      head: '存储网络CIDR',
      content: `1. 用于表示共享存储指定的存储网络，可与节点的管理网络共用；
 2. 如果存在单独的存储网络，需填写存储网络CIDR；
 3. 使用此存储网络来判断云主机健康状态。`
    },
    protocol: {
      head: '协议',
      content: `1.选择协议类型，包括：TCP、UDP；
2. TCP：支持0-65535端口；
3. UDP：支持0-65535端口。`
    },
    port: {
      head: '端口',
      content: `1.支持两种端口映射方法，包括：单个端口到单个端口的映射、端口区间的映射；
2.指定端口：①源起始端口：可从0-65535端口之间选择一个端口作为源端口；②源结束端口：系统自动填写，默认与源起始端口一致；③云主机起始端口：可从0-65535端口之间选择一个端口作为云主机端口；④云主机结束端口：系统自动填写，默认与云主机起始端口一致；⑤例如：源端口选择24，云主机端口选择22，表示对公网IP的24端口访问会转发到云主机的22端口；
3. 端口区间：①源起始端口：可从0-65535端口之间选择一个端口作为源起始端口；②源结束端口：可从0-65535端口之间选择一个端口作为源结束端口；③云主机起始端口：系统自动填写，默认与源起始端口一致；④云主机结束端口：系统自动填写，默认与源结束端口一致；⑤例如：源端口区间选择22-80，云主机端口区间也默认为22-80，表示对公网IP的22-80端口访问会转发到云主机的22-80端口。`
    },
    allowedCidr: {
      head: '允许CIDR',
      content: `可选项，仅允许指定的CIDR才可通过，可留空不填。`
    },
    nocephx: {
      head: `CEPHX`,
      content: `1. CEPHX代表Ceph密钥认证；
2. 如果存储节点和计算节点的网络较安全，可关闭此项，以避免Ceph的认证失败；
3. 需确保Ceph存储的密钥认证和此选项一致，如果Ceph存储未关闭cephx，此处关闭cephx可能导致创建云主机失败，反之亦然 ;
4. 此选项默认开启。`
    },
    forceWipe: {
      head: `清理块设备`,
      content: `勾选后将强制清理块设备中的文件系统、RAID或分区表中的签名，请谨慎选择。`
    },
    storagePoolName: {
      head: `存储池名`,
      content: `1. 可对镜像缓存、根云盘、数据云盘指定特定的存储池，可选项,默认会自动创建；
2. 如果指定，则需提前在Ceph存储集群自行创建存储池。`
    },
    instanceOffering: {
      head: `计算规格`,
      content: `1. 定义了云主机的CPU、内存、磁盘网络带宽的数量或大小规格；
2. 计算规格的内存需大于16M，过低的规格会无法启动云主机；
3. 磁盘网络带宽均为可选项，限制了过低的带宽，可能导致云主机工作异常；
4. 首次创建，可按照默认的1CPU-1G内存来配置。`
    },
    image: {
      head: `镜像`,
      content: `1. 云主机使用的镜像模板，包括ISO和Image，其中Image支持qcow2和raw；
2. 镜像保存在镜像服务器上，首次创建云主机时，会下载到主存储上作为镜像缓存。`
    },
    platform: {
      head: `平台类型`,
      content: `决定创建虚拟机时是否使用KVM virtio驱动（包括磁盘驱动和网卡驱动）。
1. Linux: 使用virtio；
2. WindowsVirtio: 使用virtio驱动，请确保镜像已安装virio磁盘和网卡驱动；
3. Paravirtualization: 使用virtio驱动。镜像可以是已安装virtio驱动的任何操作系统；
4. Windows：不使用virtio。镜像操作系统是未安装virtio的Windows；
5. Other：不使用virtio。镜像操作系统可以是任何操作系统。`
    },
    platformAdmin: {
      head: `平台管理员`,
      content: `1. 平台管理员主要是带有区域属性的管理员；
2. Admin可划分不同区域给不同平台管理员来管控不同区域的数据中心；
3. 新建的平台管理员，未划分区域前，默认可管控所有区域；
4. 平台管理员需从项目登录入口登录云平台。`
    },
    IAM2VirtualID: {
      head: `用户`,
      content: `1. 用户是企业管理中的最基本单位；
2. 管理员可创建用户，并基于用户建立相应的组织架构；
3. 创建用户时，需指定姓名和用户名，且用户名作为登录名需全局唯一；
4. 用户需从项目登录入口登录云平台。`
    },
    organization: {
      head: `组织`,
      content: `1. 组织是企业管理中组织架构的基本单位；
2. 管理员可创建用户，并基于用户建立相应的组织架构；
3. 组织可分为顶级部门和部门，顶级部门是组织架构的一级部门，其下可创建多级部门；
4. 创建组织，需指定相应的用户作为部门负责人。`
    },
    encryptType: {
      head: `加密类型`,
      content: `1. 支持对邮箱服务器端口设置加密连接；
2. 默认选择STARTTLS加密类型，端口25；
3. 选择SSL/TLS加密类型时，端口默认465；
4. 若SMTP服务器不使用加密连接，可选择NONE。`
    },
    iam2VirtualID: {
      head: `成员`,
      content: `1. 成员作为项目的基本组成人员，由admin/平台管理员/项目负责人/项目管理员添加进入项目；
2. 项目成员的权限可由admin/平台管理员/项目负责人/项目管理员进行相应控制；
3. 如需项目成员通过工单申请方式创建云主机，请对成员赋予“云主机管理（禁止创建）”权限，同时取消“云主机管理”权限；
4. 项目负责人可指定一个或多个成员作为项目管理员；
5. 项目成员需从项目登录入口登录云平台。`
    },
    chargeRoleTip: {
      head: `权限`,
      content: `如需项目成员通过工单流程申请开通云主机，请移除”云主机管理“权限，保留”云主机管理（禁止创建）“权限。`
    },
    systemRoleTip: {
      head: `系统权限`,
      content: `如需项目成员通过工单流程申请开通云主机，请移除”云主机管理“权限，保留”云主机管理（禁止创建）“权限。`
    },
    RetirePolicy: {
      head: `回收策略`,
      content: `用于指定项目过期后，相应的控制策略。
1. 禁止登录：过期后，项目相关人员均禁止此项目，项目内云主机仍将正常运行；
2. 停止资源：过期后，项目内云主机会被停止，项目仍可正常登录；
3. 删除项目：过期后，项目会被删除，处于“已删除”状态，项目禁止登录，云主机会被停止。`
    },
    IAM2Project: {
      head: `项目`,
      content: `1. 用于表示在特定时间、资源、计算下指定相关人员完成特定目标的任务；
2. 基于组织内的用户，创建项目，需指定资源配额，指定项目周期，指定项目负责人及成员等；
3. 云平台内的基本资源（计算规格、镜像、网络等），建议提前共享或创建。`
    },
    IAM2ProjectTemplate: {
      head: `项目模板`,
      content: `1. 主要用于标识各个资源配额的模板，在创建项目时，可直接使用模板定义的配额来配置项目；
2. 可直接将已有项目生成模板。`
    },
    IAM2VirtualIDGroup: {
      head: `成员组`,
      content: `1. 项目负责人/项目管理员可在项目中创建成员组，对成员进行分组管理；
2. 可以成员组为单位进行权限控制。`
    },
    ticket_commited: {
      head: `已提交`,
      content: `1. 可创建工单向admin提出资源操作申请。
2. 可将已提交工单撤回，再重新提交或删除。`
    },
    ticket_pending: {
      head: `待办事项 `,
      content: `1. 请及时处理工单申请，可审批通过或驳回申请；
2. 审批通过后会自动部署，该项目下的资源会立即生效。`
    },
    ticket_archive: {
      head: `已归档`,
      content: `记录项目成员已删除的工单信息。`
    },
    vCenter_image_platform: {
      head: `平台类型`,
      content: `决定创建虚拟机时的镜像类型。
1. Linux: 表示Linux系统；
2. Windows：表示Windows系统；
3. Other：表示其他类型的操作系统。`
    },
    url: {
      head: `镜像路径`,
      content: `支持两种方法：
1. URL，采用指定的URL路径来添加镜像。支持以下两种格式：
a. HTTP/HTTPS/FTP/SFTP 格式，例如： http://cdn.mhflex.io/product_downloads/images/mhflex-image.qcow2、ftp://[user:password@]hostname[:port]/path/file、sftp://user[:password]@hostname[:port]/path/file
b. 镜像服务器上的绝对路径，支持Sftp镜像服务器和镜像仓库。例如： file:///opt/mhflex-dvd/mhflex-image-1.4.qcow2
2. 本地文件，表示选择当前浏览器可访问的镜像直接上传，支持镜像仓库。
注意：
1. 输入URL时，需确保可被镜像服务器访问，且存在此镜像文件;
2. 请选择与所选镜像格式匹配的文件;
3. SFTP不指定密码时要提前确保ssh可以免密登录指定的物理机。`
    },
    qemu: {
      head: `Qemu guest agent`,
      content: `勾选表示镜像已安装了qemu-guest-agent，创建出的云主机默认支持在线修改密码。`
    },
    l2network_wizard: {
      head: `二层网络`,
      content: `1. 二层网络对应了二层广播域，进行二层相关的隔离，一般以设备编号进行识别。
支持选择以下类型 ：
L2NoVlanNetwork：
1. 表示相关的物理机对应的网络设备不设置Vlan；
2. 如果交换机端口设置了Vlan，则需在交换机端配置Access模式；
3. 如果交换机端口没有设置Vlan, 则无须特别设置；
4. 创建二层网络，会根据输入的网络设备号创建网桥设备。
L2VlanNetwork：
1. 表示相关的物理机对应的网络设备需设置Vlan；
2. 需在物理机接入的交换机端进行trunk设置；
3. 从逻辑上划分虚拟局域网，支持1- 4094个子网；
4. 创建二层网络，会根据输入的网络设备号创建VLAN设备，并基于此VLAN设备创建网桥。
创建二层网络，需注意：
1. 创建二层网络，集群内的物理机需存在此网络设备。`
    },
    l2network: {
      head: `二层网络`,
      content: `1. 二层网络对应了二层广播域，进行二层相关的隔离，一般以设备编号进行识别。
支持选择以下类型 ：
L2NoVlanNetwork：
1. 表示相关的物理机对应的网络设备不设置Vlan；
2. 如果交换机端口设置了Vlan，则需在交换机端配置Access模式；
3. 如果交换机端口没有设置Vlan, 则无须特别设置；
4. 创建二层网络，会根据输入的网络设备号创建网桥设备。
L2VlanNetwork：
1. 表示相关的物理机对应的网络设备需设置Vlan；
2. 需在物理机接入的交换机端进行trunk设置；
3. 从逻辑上划分虚拟局域网，支持1- 4094个子网；
4. 创建二层网络，会根据输入的网络设备创建VLAN设备，并基于此VLAN设备创建网桥。
VxlanNetwork：
1. 表示使用VxlanNetworkPool指定的Vni来创建VXLAN网络；
2. 需基于VxlanNetworkPool创建VxlanNetwork；
3. 每个VxlanNetwork对应了VxlanNetworkPool里面的一个Vni；
4. 可用于创建三层网络。
创建二层网络，需注意：
1. 创建NoVlan或Vlan二层网络，挂载的集群内物理机需存在此网络设备；
2. 创建VxlanNetworkPool，挂载的集群内物理机需存在VTEP IP。`
    },
    VxlanNetworkPool: {
      head: `Vxlan Pool`,
      content: `1. 表示使用UDP进行报文封装的VXLAN类型集合，基于IP网络组建的大二层网络；
2. 使用VXLAN网络前需先建立Vxlan Pool，Vni范围支持1-16777214；
3. 挂载的集群内的物理机在指定的CIDR应有IP作为VTEP；
4. 不能用于创建三层网络，只表示VXLAN网络的集合。`
    },
    vCenterl2network: {
      head: `二层网络`,
      content: `1. 二层网络对应了二层广播域，进行二层相关的隔离，一般以设备编号进行识别。
支持选择以下类型 ：
L2NoVlanNetwork：
1. 表示相关的物理机对应的网络设备不设置Vlan；
2. 如果交换机端口设置了Vlan，则需在交换机端配置Access模式；
3. 如果交换机端口没有设置Vlan, 则无须特别设置；
4. 创建二层网络，会根据输入的网络设备号创建网桥设备。
L2VlanNetwork：
1. 表示相关的物理机对应的网络设备需设置Vlan；
2. 需在物理机接入的交换机端进行trunk设置；
3. 从逻辑上划分虚拟局域网，支持1- 4094个子网；
4. 创建二层网络，会根据输入的网络设备创建VLAN设备，并基于此VLAN设备创建网桥。`
    },
    l3network: {
      head: `三层网络`,
      content: `1. 定义了云主机使用的网络配置，包含了IP地址范围、网关、DNS、网络服务等；
2. 三层网络属于二层网络的子资源，创建时默认选择了已创建的二层网络；
3. 初始化界面的网络配置默认采用扁平网络，可实现云主机和物理机直接互通；
4. 系统会根配置DHCP、弹性IP、安全组、UserData等网络服务；
5. 添加三层网络的网络段可使用IP范围和CIDR（无类别域间路由）两种方式；
6. DNS用于设置三层网络的DNS解析服务，例如，指定223.5.5.5。`
    },
    closeDHCPServer: {
      head: `DHCP服务`,
      content: `1. 默认不勾选，表示启用DHCP服务，为云主机提供自动分配IP，DHCP IP支持自定义设置，也可由系统随机指定；
2. 勾选后，表示关闭DHCP服务，使用此网络的云主机将无法自动获取IP，需手动配置，此时DHCP IP不支持自定义设置，也不可由系统随机指定。`
    },
    closevCenterDHCPServer: {
      head: `DHCP网络服务`,
      content: `1. vCenter公有网络暂不支持DHCP服务，默认为关闭状态；
2. vCenter扁平网络暂不支持DHCP服务，默认为关闭状态；
3. 需手动配置，建议与预设的IP一致。`
    },
    selectNetwork: {
      head: `选择网络`,
      content: `1. 支持选择“IPv4/IPv6/双栈”三种网络地址类型；
2. 若选择“IPv4/IPV6”类型，需选择至少一个网络，加号可选择多个网络；支持为使用该网络的云主机网卡设置静态IP和自定义MAC；
3. 若选择“双栈”类型，需选择至少一个网卡，加号可选择多个网卡，每个网卡允许绑定一个IPv4网络和一个IPv6网络，且该IPv4网络和IPv6网络必须在同一个二层网络；支持为该网卡自定义MAC，以及为该网卡下的每个网络分别设置静态IP。`
    },
    consolePassword: {
      head: `控制台密码`,
      content: `设置后，打开控制台需输入控制台密码。`
    },
    sshKey: {
      head: `SSH 公钥`,
      content: `1. SSH Key注入需镜像提前安装cloud-init；
2. CentOS可执行yum install cloud-init 来安装Cloud-init；
3. 需输入指定主机的用户公钥，公钥由ssh-keygen命令生成，存放在~/.ssh/id_rsa.pub；
4. 安装cloud-init后，ssh密码认证默认关闭，需将/etc/cloud/cloud.cfg的ssh_pwauth选项设置为1才能开启。`
    },
    userData: {
      head: `User Data`,
      content: `1. User Data注入需云主机镜像提前安装cloud-init;
2. 输入样例，此脚本实现以下功能：
a. 创建云主机时，创建用户test, 使用ssh-key;
b. 开机写入文件/etc/hosts，创建/tmp/temp目录，并创建文件写入内容;
c. 设置hostname, 开启root用户，允许ssh密码登录，修改root密码;
d. 执行echo ls -l /命令。
#cloud-config
users:
 - name: test
   shell: /bin/bash
   groups: users
   sudo: ['ALL=(ALL) NOPASSWD:ALL']
   ssh-authorized-keys:
       - ssh-rsa AAAAB3NzaC1LXCJfjroD1lT root@10-0-0-18
bootcmd:
 - mkdir /tmp/temp
write_files:
 - path: /tmp/mhflex_config
   content: |
       Hello,world!
   permissions: '0755'
hostname: Perf-test
disable_root: false
ssh_pwauth: yes
chpasswd:
  list: |
      root:word
  expire: False
runcmd:
 - echo ls -l / >/root/list.sh`
    },
    VtoPCPUBind: {
      head: `CPU绑定`,
      content: `将云主机的虚拟CPU(vCPU)与物理机的物理CPU(pCPU)严格关联，可给云主机分配特定的vCPU，提高云主机性能。

格式说明：
1. 在左侧文本框中输入vCPU范围，在右侧文本框中输入pCPU范围，范围格式为含整数、"-"、"^" 的逗号分隔列表；
2. 例如，左侧文本框中输入"1"，右侧文本框中输入"0-3,^2"，表示vCPU 1与pCPU 0、1、3严格关联，其中，"^"表示不包含；
3. vCPU范围取决于所选云主机计算规格；
4. pCPU范围取决于所选集群或是所选物理机的pCPU数量。`
    },
    usbRedirect: {
      head: `USB 重定向`,
      content: `1. 将VDI客户端的USB设备重定向给云主机使用;
2. 重启后生效。`
    },
    qga: {
      head: `QGA`,
      content: `1. 开启前需确保云主机已安装并运行qemu-guest-agent；
2. 开启后云主机默认支持在线修改密码。`
    },
    qgaImagePage: {
      head: `QGA`,
      content: `1. 开启QGA前，需确保该镜像已安装并运行qemu-guest-agent；
2. 开启QGA后，该镜像创建的云主机默认支持在线修改密码。`
    },
    rdp: {
      head: `RDP`,
      content: `针对VDI用户界面，选择RDP模式后，默认以RDP模式打开控制台。`
    },
    snapshot: {
      head: `快照`,
      content: `对根云盘或数据云盘在特定时间点上的数据进行备份。可在数据丢失时，有效恢复数据。`
    },
    vmGpu: {
      head: `云主机GPU设备`,
      content: `物理机直接透传给当前云主机的GPU设备列表。`
    },
    selectGpu: {
      head: 'GPU设备',
      content: `1. 创建云主机时，可直接加载物理机透传的GPU设备；
2. 需提前在物理机BIOS中开启Intel VT-d或AMD IOMMU，且在物理机内核开启IOMMU支持，确保物理机可正常使用GPU设备透传功能。
3. 支持加载多个不同类型的GPU设备到云主机；
4. 不能跨物理机加载GPU设备到云主机。 `
    },
    vmUsb: {
      head: '云主机USB设备',
      content: `1. 显示了物理机直接透传给当前云主机的USB设备；
2. 一台云主机最多可挂载1个USB1.x设备、6个USB2.x设备和4个USB3.x设备。`
    },
    scheduler: {
      head: `定时任务`,
      content: `1. 可对云主机进行定时开机、关机、重启、快照等任务；
2. 可对云盘进行定时快照任务；
3. 定时器与定时任务解耦；
4. 定时任务的开始时间、执行策略、执行周期由其所挂载的定时器决定。`
    },
    virtioScsi: {
      head: `VirtioSCSI`,
      content: `1. 采用VirtioSCSI总线，创建的SCSI类型数据云盘；
2. 支持IO多队列，可以通过唯一识别ID（WWN）识别。`
    },
    sharedVolume: {
      head: `共享云盘`,
      content: `1. Ceph主存储以及SharedBlock主存储支持共享云盘，同一云盘可被多个云主机挂载识别；
2. 基于精简置备的ShareBlock主存储不支持共享云盘；
3. 共享云盘属于VirtioSCSI类型，需先勾选VirtioSCSI选项。`
    },
    volumeOffering: {
      head: `云盘规格`,
      content: `1. 定义了云盘的大小规格；
2. ISO安装系统创建根云盘或创建数据云盘使用。`
    },
    hostGpu: {
      head: `GPU设备`,
      content: `1. 显示了物理机上的GPU设备，设备可直接透传给云主机使用;
2. 需物理机BIOS中开启Intel VT-d或AMD IOMMU，且使物理机内核开启IOMMU支持;
3. 确保物理机IOMMU为就绪状态才可正常使用GPU设备透传。`
    },
    hostUsb: {
      head: 'USB设备',
      content: `1. 显示物理机上的USB设备，可直接透传给云主机使用；
2. 一台云主机最多可挂载1个USB1.0设备、6个USB2.0设备和4个USB3.0设备。`
    },
    iommuSetting: {
      head: `物理机IOMMU`,
      content: `1. 扫描物理机的IOMMU设备，以支持GPU设备透传；
2. 勾选此项后，会遍历物理机可用的GPU设备；
3. 扫描后，需重启物理机以使得IOMMU配置在内核生效；
4. 需BIOS开启VT-d或IOMMU。`
    },
    iommuState: {
      head: `IOMMU启用状态`,
      content: `1. 表示IOMMU设备直通的状态，勾选表示已在内核启用IOMMU配置，需系统重启后生效;
2. 需确保物理机BIOS已开启Intel VT-d或AMD IOMMU选项。`
    },
    moreHosts: {
      head: `添加多个物理机`,
      content: `1. 点击加号可以添加多个物理机；
2. 默认会采用相同的用户名、密码；
3. 如果用户名、密码不一致，可自定义输入。`
    },
    poolName: {
      head: `存储池`,
      content: `1. 针对数据云盘指定的特定存储池；
2. 可添加或创建存储集群存储池；
3. 可针对不同场景，添加不同性能的存储池。`
    },
    pxeService: {
      head: `PXE服务`,
      content: `1. 在管理节点部署了PXE服务，配置TFTP和DHCP服务，远程引导安装裸金属主机系统；
2. 管理节点用于裸金属主机安装的二层网络，不能存在其他DHCP服务器，以免冲突；
3. 管理节点上提供PXE服务的网卡，需配置IP地址；
4. 管理节点需存在IPMI网络，可通过IPMI远程管理物理机；
5. 裸金属主机的启动项是硬盘优先，系统会自动配置PXE启动，安装系统后会从硬盘引导；
6. 裸金属主机的安装网络与管理节点的DHCP监听网卡应在同一个二层，可获取DHCP服务。`
    },
    dhcp: {
      head: `DHCP侦听网卡`,
      content: `1. 部署服务器上连通部署网络的网卡设备编号；
2. 要求此网卡连接到裸金属设备部署网络，且已配置IP地址；
3. 该监听网卡所在网络不能存在已有的DHCP服务。`
    },
    ip: {
      head: `起始IP/结束IP`,
      content: `1. 用于定义遍历DHCP服务的IP地址范围；
2. 可留空不填，系统将根据此网卡IP侦测并过滤已用的IP地址作为IP范围。`
    },
    baremetal: {
      head: `裸金属主机`,
      content: `1. 使用IPMI进行远程管理裸金属主机，需提前配置IPMI，输入IPMI的用户名、密码；
2. 裸金属主机的安装网络与管理节点的DHCP监听网卡应在同一个二层，可获取DHCP服务。`
    },
    baremetal_reboot: {
      head: `重启裸金属设备`,
      content: `1. 勾选后，会进行裸金属设备重启，可自动获取裸金属设备的硬件信息；
2. 默认不勾选，需手动重启获取裸金属设备硬件信息。`
    },
    baremetalCreateCluster: {
      head: '裸金属集群',
      content: `1. 为裸金属设备提供单独的集群管理；
2. 必须挂载部署服务器，才能为集群中的裸金属主机提供PXE服务；
3. 可挂载二层网络，为集群中裸金属主机提供网络服务。`
    },
    baremetalCreateChassis: {
      head: '裸金属设备',
      content: `1. 要求管理节点连接到IPMI网络，通过IPMI远程控制裸金属设备；
2. 要求裸金属设备配备远程控制卡，配置IPMI地址、端口、用户名、密码，并连接至IPMI网络；
3. 要求裸金属设备的PXE启动网卡连接至部署网络；
4. 裸金属设备的其他网卡按需连接至相应的二层网络。`
    },
    baremetalCreatePXE: {
      head: '部署服务器',
      content: `1. 可单独指定服务器作为部署服务器，为裸金属设备提供PXE服务和控制台代理服务；
2. 要求部署服务器挂载到裸金属集群中；
3. 要求部署服务器有足够的存储空间，保存用于PXE部署的镜像；
4. 要求部署服务器连接到管理网络，与管理节点连通；
5. 要求部署服务器连接到部署网络，与裸金属设备连通；
6. 要求部署服务器上的DHCP监控网卡连接到部署网络，并保证该部署网络上不存在其他DHCP服务，以免冲突。`
    },
    baremetalIso: {
      head: '镜像',
      content: `支持RHEL/CentOS系列 6.X和7.X 版本ISO（非LiveCD）。`
    },
    vnc: {
      head: `启用VNC`,
      content: `建议选择是，表示启用VNC界面，可打开裸金属主机控制台查看安装过程。`
    },
    unattended: {
      head: `启用无人值守`,
      content: `1. 选择是，表示进行自动分区模式，全盘默认LVM分区，大部分容量分配至根分区；
2. 选择否，表示需自定义分区，在安装界面需人工干预，自定义配置安装选项。`
    },
    cloneIso: {
      head: `下载ISO`,
      content: `选择是，表示将ISO拷贝至目标服务器的/opt/mhflex-dvd/目录下，并创建YUM本地源。`
    },
    bondNic: {
      head: `网卡绑定`,
      content: `1. 可选项，可在安装系统时，对网卡进行Bonding配置；
2. 模式1表示平衡轮询策略，模式4表示动态链路聚合模式；
3. 双网卡设置模式4，需在安装系统后，在交换机端配置LACP。`
    },
    publicNetwork: {
      head: `公有网络`,
      content: `1. 表示可直接连通互联网的网络；
2. 在云路由网络/VPC中可以提供网络服务；
3. 可用于扁平网络创建使用公网的云主机；
4. 可用于云路由网络环境/VPC环境，单独创建使用公网的云主机。`
    },
    privateNetwork: {
      head: `私有网络`,
      content: `1. 云主机使用的私有网络，用于创建云主机，一般为内网；
2. 如果使用扁平网络，此网络可与物理机网络直通，也可直接访问互联网；
3. 如果使用云路由网络，则此私有网络可通过云路由器访问互联网。`
    },
    systemNetwork: {
      head: `系统网络`,
      content: `1. 表示管理节点用于特定用途的网络；
2. 可用于部署配置相关资源的管理网络，例如部署物理机、主存储、镜像服务器、云路由等资源；
3. 也可用于云主机迁移的迁移网络；
4. 如果网络资源不足，可与公有网络共用；
5. 独立的系统网络仅用于特定用途，不能用于创建普通云主机。`
    },
    networkType: {
      head: `网络类型`,
      content: `扁平网络
支持DHCP、弹性IP、安全组、UserData等网络服务。

云路由网络
支持DHCP、DNS、SNAT、弹性IP、端口转发、负载均衡、IPsec、安全组等网络服务。`
    },
    vCenternetworkType: {
      head: `网络类型`,
      content: `扁平网络
无网络服务。

云路由网络
支持DHCP、DNS、SNAT、弹性IP、端口转发、负载均衡、IPsec、安全组等网络服务。`
    },
    networkRange: {
      head: `添加网络段`,
      content: `1. IP范围：可填写类似172.20.12.2到172.20.12.255，子网掩码填写255.255.0.0，网关填写172.20.0.1；
2. CIDR：无类别域间路由，可填写192.168.1.0/24。
注意：
1. 不可将网关（例如：xxx.xxx.xxx.1）、广播地址（例如：xxx.xxx.xxx.255）和网络地址（例如：xxx.xxx.xxx.0）等包含在添加的IP段中；
2. 私有网络网络段，不可与云路由规格里的公有网络或管理网络重叠。`
    },
    ipv6NetworkRange: {
      head: `添加网络段`,
      content: `1. IP范围： 提供一种IP地址分配方式：Stateful-DHCP，可填写类似
2000:910A:2222:5498:8475:1111:3900:2002到2000:910A:2222:5498:8475:1111:3900:200f，前缀长度填写64，网关填写2000:910A:2222:5498:8475:1111:3900:2001；
2. CIDR：无类别域间路由，提供三种IP地址分配方式：Stateful-DHCP、Stateless-DHCP、SLAAC，可填写234E:2457:3D::/64。
 注意：
1. 采用Stateless-DHCP和SLAAC分配方式时，用户需手动修改云主机的IP地址生成方式为EUI64；
2. 前缀长度范围为64~126，若设置值小于64，将导致云主机创建失败；
3. 不可将网关（xxxx::1）包含在添加的IP段中。`
    },
    dns: {
      head: `DNS`,
      content: `用于设置三层网络的DNS解析服务，例如，指定223.5.5.5。`
    },
    ipv6Dns: {
      head: `DNS`,
      content: `用于设置三层网络的DNS解析服务，例如，指定240c::6666。`
    },
    ipv4FlatNetworkRange: {
      head: `添加网络段`,
      content: `1. IP范围：可填写类似172.20.12.2到172.20.12.255，子网掩码填写255.255.0.0，网关填写172.20.0.1；
2. CIDR：无类别域间路由，可填写192.168.1.0/24。
注意：
1. 不可将网关（例如：xxx.xxx.xxx.1）、广播地址（例如：xxx.xxx.xxx.255）和网络地址（例如：xxx.xxx.xxx.0）等包含在添加的IP段中；
2. 私有网络网络段，不可与云路由规格里的公有网络或管理网络重叠。`
    },
    ipv6FlatNetworkRange: {
      head: `添加网络段`,
      content: `1. IP范围： 提供一种IP地址分配方式：Stateful-DHCP，可填写类似
3000:910A:2222:5498:8475:1111:3900:4002到3000:910A:2222:5498:8475:1111:3900:400f，前缀长度填写64，网关填写3000:910A:2222:5498:8475:1111:3900:4001；
2. CIDR：无类别域间路由，提供三种IP地址分配方式：Stateful-DHCP、Stateless-DHCP、SLAAC，可填写236C:347A:4D::/64。
 注意：
1. 采用Stateless-DHCP和SLAAC分配方式时，用户需手动修改云主机的IP地址生成方式为EUI64。
2. 前缀长度范围为64~126，若设置值小于64，将导致云主机创建失败；
3. 不可将网关（xxxx::1）包含在添加的IP段中。`
    },
    vrouterNetworkRange: {
      head: `添加网络段`,
      content: `1. IP范围：可填写类似172.20.12.2到172.20.12.255，子网掩码填写255.255.0.0，网关填写172.20.0.1；
2. CIDR：无类别域间路由，可填写192.168.1.0/24。
注意：
1. 不可将网关（例如：xxx.xxx.xxx.1）、广播地址（例如：xxx.xxx.xxx.255）和网络地址（例如：xxx.xxx.xxx.0）等包含在添加的IP段中；
2. 私有网络网络段，不可与云路由规格里的公有网络或管理网络重叠。`
    },
    flatNetworkDns: {
      head: `DNS`,
      content: `对于扁平网络，在添加、删除DNS以后需要重启云主机才生效。`
    },
    flatNetworkDnsForPublic: {
      head: `DNS`,
      content: `在添加、删除DNS以后需要重启云主机才生效。`
    },
    virtualRouter: {
      head: `云路由器`,
      content: `1. 特殊的云主机，为其他云主机提供云路由网络的各种网络服务；
2. 随着使用此网络的第一个云主机一同创建，需一直保持运行可连接状态。`
    },
    virtualRouterImage: {
      head: `云路由镜像`,
      content: `1. 云路由器使用的镜像，封装了多种网络服务；
2. 只为创建云路由提供服务，不能直接用于创建云主机。`
    },
    virtualRouterOffering: {
      head: `云路由规格`,
      content: `1. 定义云路由器使用的CPU、内存、云路由镜像、系统网络、公有网络等配置；
2. 需确保选择正确的系统网络和公有网络，二者可用合并。`
    },
    virtualRouterOffering_managementNetwork: {
      head: `管理网络`,
      content: `1. 表示管理节点部署配置相关资源的网络，例如部署物理机、云路由器等；
2. 如果存在系统网络来管理物理资源，则应选择此系统网络；
3. 如果使用共用的公有网络来管理物理资源，则应选择此公有网络。`
    },
    virtualRouterOffering_publicNetwork: {
      head: `公有网络`,
      content: `1. 表示可直接连通互联网的网络；
2. 应从公有网络列表选择可用的网络。`
    },
    virtualRouterTable: {
      head: `路由表`,
      content: `针对特殊场景，可对云路由器创建路由表并设置路由条目。`
    },
    virtualRouterEntry: {
      head: `路由条目`,
      content: `1. 设置目标网段，并输入下一跳的地址，确保下一跳可达；
2. 路由类型一般设置静态路由，为防止环路，可设置黑洞路由，丢弃匹配的数据包；
3. 路由优先级数字越大，表示优先级越低。`
    },
    flatNetworkRouterEntry: {
      head: `路由条目`,
      content: `1. 设置目标网段，并输入下一跳的地址，确保下一跳可达；
2. 路由条目只对默认网卡所在的三层网络生效 ；
3. 已经存在的云主机，在三层网络中添加路由条目后，需要重启云主机才可以将路由条目添加到云主机中。`
    },
    securityGroup: {
      head: `安全组`,
      content: `1. 表示给云主机提供三层网络防火墙控制，控制TCP/UDP/ICMP等数据包进行有效过滤；
2. 对指定网络的指定云主机按照指定的安全规则进行有效控制；
3. 支持白名单机制，即设置的所有规则均为允许机制；
4. 一旦对指定端口设置了允许机制，那么没有被允许的端口就无法通过。`
    },
    securityGroupRules: {
      head: `安全组规则`,
      content: `1. 类型: 流量方向。 Ingress: 入口流量； Egress: 出口流量；
2. 协议: 网络协议类型。ALL：用于设置组内互通，也支持TCP、UDP、ICMP协议；
3. 开始/结束端口: 可指定0-65535；
4. CIDR: 可选项，可指定192.168.12.0/24；
5. 源安全组：表示仅允许指定全组内的云主机才可通过。
注意：
1. 如果设置Ingress，TCP，192.168.12.0/24，端口22，表示只允许源地址为192.168.12.0/24的TCP流量访问22端口；
2. 如果设置Egress，TCP，192.168.12.0/24，端口22，表示出口流量只允许访问IP地址为192.168.12.0/24的22端口；
3. 如果没有任何安全组规则时，默认所有的外部访问均禁止进入安全组内的云主机，安全组内云主机访问外部不受限制；
4. 新建安全组时，默认配置了两条规则（即：协议类型为ALL的进口规则和出口规则），用于设置组内互通。用户可以删除这两条默认规则，取消组内互通。`
    },
    vip: {
      head: `虚拟IP`,
      content: `1. 可用于提供弹性IP、端口转发、负载均衡、IPsec隧道等网络服务，数据包会被发送到虚拟IP，再路由至私有网络；
2. 扁平网络下的虚拟IP服务仅用于弹性IP网络服务；
3. 云路由网络下的虚拟IP服务可用于弹性IP、端口转发、负载均衡、IPsec隧道等网络服务。`
    },
    eip: {
      head: `弹性IP`,
      content: `1. 弹性IP定义了通过公有网络访问内部私有网络的方法；
2. 公有网络需选择可以连接外网的公有网络，请确保此公有网络可以连接外部网络；
3. 内部私有网络是隔离的网络空间，不能直接被外部网络访问；
4. 通过访问公有网络的IP可以直接访问到内部私有网络的IP。`
    },
    portForwarding: {
      head: `端口转发`,
      content: `1. 基于云路由提供的三层转发服务，实现端口到端口的映射；
2. 可将指定公有网络的IP地址端口流量转发到云主机私有网络IP的对应协议端口。
注意：
1. 要求云主机内部的防火墙策略对指定的转发端口开放；
2. 同一虚拟IP，可对同一个三层网络上的多个云主机网卡的不同端口提供端口转发服务；
3. 支持端口转发区间，端口区间在虚拟IP和云主机网卡需一一对应。`
    },
    loadBalance: {
      head: `负载均衡`,
      content: `1. 将公网IP的访问流量分发到一组私网云主机上，并自动检测并隔离不可用的云主机；
2. 根据实际，动态调整负载均衡监听器中的云主机来调整服务能力；
3. 一个负载均衡器可对应多个监听器；`
    },
    loadBalanceListener: {
      head: `负载均衡监听器`,
      content: `1. 支持TCP、HTTP、HTTPS和UDP四种协议，需指定公网端口和云主机端口；
2. 当监听协议为HTTPS，需绑定证书使用，支持上传证书和证书链；
3. 负载均衡算法支持轮询、最少连接、源地址哈希算法；
4.需加载云主机网卡至监听器。`
    },
    listenerAdvancedSetting: {
      head: `监听器高级`,
      content: `1. 空闲连接超时：没有数据传输时，触发负载均衡器终止服务器和客户端连接的超时时间，默认为60秒；
2. 健康检查阈值：对不健康的云主机，如果连续检查成功次数超过阈值，则认定其健康，默认为2次；
3. 健康检查协议：当监听协议为TCP/HTTP/HTTPS，健康检查协议显示为TCP，当监听协议为UDP，健康检查协议显示为UDP；
4. 健康检查端口：默认为default，表示与所选云主机端口一致，也可指定其它端口；
5. 非健康检查阈值：对云主机健康检查失败次数超过阈值，则认定其不健康，默认为2次；
6. 健康检查间隔：对云主机进行检查的时间间隔，默认为5秒；
7. 最大连接数量：设置监听器最大的连接数量，默认为5000条；
8. 负载均衡算法：支持轮询、最少连接、源地址哈希算法。`
    },
    ipsec: {
      head: `IPsec隧道`,
      content: `1. 使用IPsec隧道协议实现站点到站点的虚拟私有网络（VPN）的连接；
2. 需双向互相配置IPsec隧道，分别指向对方的公有网络IP和私有网络CIDR；
3. 高级配置涉及的各种算法及认证密钥在两端配置时需完全一致。`
    },
    ipsecPeerCidr: {
      head: `远端网络CIDR`,
      content: `注意：不能和云路由的管理网络和公有网络段重叠`
    },
    vCenter: {
      head: `添加vCenter`,
      content: `1. 支持管理Vcenter 5.5、6.0和6.5，默认使用HTTPS加密访问协议；
2. 需输入vCenter域名、端口号、用户和密码。
要求：
1. vCenter建立数据中心->集群->物理主机的资源结构；
2. 支持已添加的本地存储和共享存储，包括FC、iSCSI和NFS存储；
3. 暂不支持存储集群（Datastore Cluster ）模式，建议分离使用；
4. 已有的模板虚拟机，需转换为模板类型。`
    },
    vCenterNetwork: {
      head: `vCenter网络`,
      content: `1. 支持公有网络和私有网络，私有网络支持扁平网络和云路由网络；
2. 二层网络和三层网络在同一界面创建；
3. 创建云路由网络时需在云路由界面添加云路由镜像和云路由规格；
4. 创建的扁平网络无DHCP服务，用扁平网络创建的云主机需要手动配置IP。`
    },
    Switch: {
      head: `Switch`,
      content: `1. 支持vCenter中dvSwitch/vSwitch交换机；
2. 需填写正确dvSwitch/vSwitch的名称。`
    },
    vCenterImage: {
      head: `vCenter镜像`,
      content: `1. 支持vmdk镜像，暂不支持添加ISO。`
    },
    url_vCenterImage: {
      head: `URL`,
      content: `支持
1. HTTP/HTTPS URL，系统会使用wget下载该镜像。例如：
http://cdn.mhflex.io/product_downloads/images/mhflex-image.vmdk`
    },
    performance: {
      head: `性能统计`,
      content: `1. 显示了运行中的云主机、路由器、物理机的CPU、内存、磁盘、网络的平均利用率；
2. 可选择时间间隔1分钟、1小时、1天、2周，并可按照资源利用率进行排序；
3. 如果存在多个CPU，CPU利用率可能会超过100%；
4. 磁盘IO为读写速度总和，网络IO为上下行速度总和。`
    },
    monitorAlarm: {
      head: `监控报警`,
      content: `1. 可对物理机或云主机的CPU、内存、磁盘、网络等资源使用监控报警;
2. 需提前建立邮箱服务器；
3. 在资源使用率在指定时间段内达到阈值后，即会触发报警邮件。`
    },
    monitorRules: {
      head: `监控规则`,
      content: `1. CPU利用率可设置为80，表示CPU利用率超过80%会触发；
2. 内存利用率可设置为0.7，表示内存利用率超过70%会触发；
3. 磁盘IO可设置读写方向和IOPS或带宽方式，计算所有磁盘IO的总和；
4. 网络IO可设置上行下行方向，计算所有网卡IO的总和。`
    },
    billing: {
      head: `计费信息`,
      content: `1. 显示了所有账户按计费单价和使用时间来统计资源费用信息；
2. 可选择不同的时间间隔来计费，精准至秒级；
3. 以使用时长作为服务使用记录，对不同账户进行计费。`
    },
    billingProject: {
      head: `计费信息`,
      content: `1. 显示了所有项目按计费单价和使用时间来统计资源费用信息；
2. 可选择不同的时间间隔来计费，支持秒级粒度；
3. 以使用时长作为服务使用记录，对不同项目进行计费。`
    },
    billingAccount: {
      head: `计费信息`,
      content: `1. 显示了所有账户按计费单价和使用时间来统计资源费用信息；
2. 可选择不同的时间间隔来计费，支持秒级粒度；
3. 以使用时长作为服务使用记录，对不同账户进行计费。`
    },
    CPUbillingsettings: {
      head: `设置处理器单价`,
      content: `支持对处理器以资源的规格（默认单核）和时间作为基本计费单位。`
    },
    CPUbilling: {
      head: `计费设置`,
      content: `1. 计费信息的显示需提前对处理器设置计费单价；
2. 资源首行代表当前使用的价格，其他行代表特定时间段内使用的价格。`
    },
    Memorybillingsettings: {
      head: `设置内存单价`,
      content: `支持对内存以资源的规格和时间作为基本计费单位。`
    },
    Memorybilling: {
      head: `计费设置`,
      content: `1. 计费信息的显示需提前对内存设置计费单价；
2. 资源首行代表当前使用的价格，其他行代表特定时间段内使用的价格。`
    },
    RootVolumebillingsettings: {
      head: `设置根云盘单价`,
      content: `支持对根云盘以资源的规格和时间作为基本计费单位。`
    },
    RootVolumebilling: {
      head: `计费设置`,
      content: `1. 计费信息的显示需提前对根云盘设置计费单价；
2. 资源首行代表当前使用的价格，其他行代表特定时间段内使用的价格。`
    },
    Datebillingsettings: {
      head: `设置数据云盘单价`,
      content: `支持对数据云盘以资源的规格和时间作为基本计费单位。`
    },
    Datebilling: {
      head: `计费设置`,
      content: `1. 计费信息的显示需提前对数据云盘设置计费单价；
2. 资源首行代表当前使用的价格，其他行代表特定时间段内使用的价格。`
    },
    GPUbillingsettings: {
      head: `设置GPU设备单价`,
      content: `支持对GPU设备以资源的规格（类型和型号）和时间作为基本计费单位。`
    },
    GPUbilling: {
      head: `计费设置`,
      content: `1. 计费信息的显示需提前对GPU设备设置计费单价；
2. 支持筛选查看某型号的GPU设备的计费信息，首行代表当前使用的价格，其他行代表特定时间段内使用的价格。`
    },
    PublicIPbillingsettings: {
      head: '设置公网IP单价',
      content: `1. 支持对公网IP以带宽规格和时间作为基本计费单位；
2. 支持对公网IP的上行带宽和下行带宽分别计费；
3. 公网IP需设置QoS才可进行计费；
4. 若虚拟IP为IPv6类型，暂不支持计费。`
    },
    PublicIPbilling: {
      head: '计费设置',
      content: `1. 计费信息的显示需提前对公网IP设置计费单价；
2. 支持分别查看公网IP的上行带宽和下行带宽的计费信息；
3. 公网IP需设置QoS才可进行计费；
4. 对于相同类型的计费信息，首行代表当前使用的价格，其他行代表特定时间段内使用的价格。`
    },
    timer: {
      head: `定时器`,
      content: `1. 定时器与定时任务解耦；
2. 定时器支持重复执行和选择次数执行；
3. 执行周期可选每分，每小时、每天。`
    },
    consoleProxy: {
      head: `控制台代理`,
      content: `显示了云主机控制台代理服务的状态，可重连，需保持可用连接状态。`
    },
    account: {
      head: `账户`,
      content: `1. 提供对账户、用户组、用户的管理；
2. admin创建普通账户，名称唯一不可重复，普通账户创建普通用户；
3. 普通账户创建用户组对普通用户权限进行约束控制；
4. admin需共享计算规格、云盘规格、网络、镜像给普通账户。`
    },
    userGroup: {
      head: `用户组`,
      content: `1. 普通账户支持创建用户组，admin不支持；
2. 用户加入用户组后，拥有用户组内的所有权限。`
    },
    user: {
      head: `用户`,
      content: `需在用户界面或已加入的用户组开通权限后，才可执行相关操作。`
    },
    billingConfig: {
      head: `计费设置`,
      content: `1. 计费信息的显示需先对各资源创建计费单价；
2. 支持对CPU、内存、云盘、GPU设备等资源以资源的规格和时间作为基本计费单位；
3. 每个资源的首行代表当前使用的价格，其他行代表特定时间段内使用的价格。`
    },
    ldapConfig: {
      head: `AD/LDAP设置`,
      content: `1. 无缝接入AD/LDAP统一认证协议，支持基于自定义规则添加AD/LDAP服务器，并获取成员列表；
2. AD/LDAP成员绑定普通账户后，可以使用成员登录属性直接登录云平台；
3. 添加AD/LDAP服务器需要输入IP或域名，AD/LDAP端口信息（默认端口为389）；
4. 需要输入检查绑定成员的基准DN；
5. 需要指定AD/LDAP服务器的登录属性，作为绑定后的登录名。为确保登录成功，请使用登录名唯一的登录属性；
6. 只允许添加一个AD/LDAP服务器。`
    },
    ldapOperation: {
      head: `AD/LDAP操作`,
      content: `1. 测试：使用输入信息尝试连接AD/LDAP服务器，检查连通性和基准检索DN权限；
2. 保存：将保存AD/LDAP连接信息，建议保存前先进行测试，确保连接成功；
3. 同步：当AD/LDAP服务器发生变化时，可进行同步，清除本系统中无效的AD/LDAP绑定信息。`
    },
    emailSetting: {
      head: `邮箱服务器`,
      content: `1. 邮箱服务器配合监控报警使用，用于设置监控报警的发件人信息；
2. 需填写正确的smtp邮件服务器、端口和用户名密码。`
    },
    accessKey: {
      head: `AccessKey`,
      content: `1. 用于调用阿里云API的凭证，需在阿里云端的访问控制RAM创建；
2. 被设为默认的AccessKey可使用此AK调用阿里云API来控制对应账户的云资源。`
    },
    dahoAccessKey: {
      head: `AccessKey`,
      content: `1. 用于调用大河云联API的凭证，需在大河云联的访问控制平台创建；
2. 被设为默认的AccessKey可使用此AK调用大河云联API来控制对应账户的云资源。`
    },
    hybirdImage: {
      head: `镜像`,
      content: `镜像可选择阿里云系统镜像和自定义镜像。`
    },
    hybirdInstanceOffering: {
      head: `计算规格`,
      content: `计算规格为从阿里云端同步可用的CPU、大小配置等信息。`
    },
    hybirdConsolePassword: {
      head: `控制台密码`,
      content: `访问ECS控制台需输入的密码。`
    },
    hybirdRootPassword: {
      head: `系统用户密码`,
      content: `1. 用于设置云主机的系统用户密码；
2. Linux 默认系统用户为root；
3. Windows 默认系统用户为administrator。`
    },
    vpcCidr: {
      head: `VPC CIDR`,
      content: `阿里云支持10.0.0.0/8、172.16.0.0/12、192.168.0.0/16的三个网络段。`
    },
    vSwitchCidr: {
      head: `虚拟交换机CIDR`,
      content: `虚拟交换机CIDR应是专有网络VPC CIDR的一个子网段。`
    },
    initRules: {
      head: `初始规则`,
      content: `1. 禁止所有：所有端口的出入规则方向都是拒绝；
2. 允许所有：所有端口的出入规则方向都是允许；
3. 禁止部分易受攻击的端口：只拒绝135/137/139/42/445等端口的入方向；
4. 允许基本常用端口：只接受22/23/3389/443/80/6379/8080/3306/1433等端口的入方向（协议为UDP和TCP）。`
    },
    setRules: {
      head: `设置规则`,
      content: `1. 规则方向：安全组规则适用的数据流方向，入或出；
2. 授权策略：选择授权策略，拒绝或允许；
3. 协议：支持ALL、TCP、UDP、ICMP、GRE。ALL可用于完全互信的场景；
4. 端口区间：表示规则约束的端口范围；
5. 授权对象：规则约束的网络段，0.0.0.0/0表示全部网段；
6. 优先级：数值越大，优先级越低。`
    },
    uploadImage: {
      head: `上传镜像`,
      content: `1. 上传镜像前需要添加Bucket并设为默认；
2. 镜像需支持在线修改密码（Qemu-guest-agent）；
3. 镜像不支持EFI、LVM分区格式；
4. 需选择上传的地域。`
    },
    vpnGateway: {
      head: `VPN网关`,
      content: `1. 基于互联网建立加密隧道进行私有网络之间的通信；
2. 需在阿里云端购买VPN网关。`
    },
    userVpnGateway: {
      head: `VPN用户网关`,
      content: `对应了本地数据中心云路由网络中的虚拟IP。`
    },
    vpnConnection: {
      head: `VPN连接`,
      content: `1. 需选择本地数据中心可用的云路由器和私有网络；
2. 需选择阿里云的VPC网络和其下的VPN网关；
3. 需选择已创建的阿里云VPN用户网关；
4. 需输入IKE 共享密钥；
5. 高级选项，建议选择默认，默认选项可以连通双边私网。`
    },
    routerInterface: {
      head: `路由器接口`,
      content: `1. 可对VPC路由器或边界路由器创建路由器接口；
2. 用于搭建通信通道并控制工作状态；
3. 在高速通道两侧均需创建路由器接口，并进行互联，使得两个路由器使用通道进行互通。`
    },
    virtualBorderRouter: {
      head: `边界路由器`,
      content: `1. 物理专线接入交换机的产品映射，CPE客户端设备和阿里云VPC之间的路由器；
2. 作为私有云和阿里云中间的路由器，交换数据包。`
    },
    region: {
      head: `地域`,
      content: `1. 对应了阿里云的地域，与当前AccessKey对应；
2. 需添加，才可同步当前AccessKey对应账户的地域下的资源。`
    },
    identityZone: {
      head: `可用区`,
      content: `1. 对应了阿里云的可用区，与当前AccessKey对应；
2. 需添加，才可同步当前AccessKey对应账户的可用区下的资源。`
    },
    bucket: {
      head: `Bucket`,
      content: `1. 上传镜像依赖OSS对象存储的Bucket作为中转，再上传至阿里云作为自定义镜像；
2. 可创建或者添加已存在的Bucket。`
    },
    bucketName: {
      head: `Bucket命名规范`,
      content: `1. 只能包含小写字母，数字和短横线;
2. 必须以小写字母和数字开头和结尾;
3. bucketName的长度限制在3-63之间。`
    },
    setDefaultBucket: {
      head: `设为默认`,
      content: `一个地域中有且只能有一个默认的Bucket。`
    },
    cpeIp: {
      head: `CPE IP`,
      content: `1. 代表物理专线接入本地数据中心的客户端设备IP地址；
 2. 对应的边界路由器，应由运营商创建并配置路由。`
    },
    screenNum: {
      head: `屏幕数量`,
      content: `VDI设备最多支持的屏幕数量，支持spice模式。`
    },
    enableAutoSnapshot: {
      head: `自动创建快照`,
      content: `1. 云盘是否执行自动快照策略（前提是用户整体的自动快照策略已经开启）；
2. 停用：表示这块云盘不执行自动快照策略；
3. 启用：表示这块云盘执行自动快照策略。`
    },
    deleteWithInstance: {
      head: `随主机删除`,
      content: `1. 云盘是否随ECS云主机删除（前提是该云盘已经挂载到ECS云主机上）；
2. 停用：删除ECS云主机时，这块磁盘保留不释放；
3. 启用：删除ECS云主机时，这块磁盘随ECS云主机一起删除。`
    },
    vdiNetwork: {
      head: `VDI 网络`,
      content: `1. 如果用户已部署VDI单独使用的网络，需填写VDI网络CIDR;
2. 如果此设置不生效，VDI将默认使用管理网络。`
    },
    migrateNetworkCidr: {
      head: `迁移网络`,
      content: `1. 迁移云主机所用的网络，需填写迁移网络CIDR;
2. 如果不设置，迁移云主机时默认使用管理网络。`
    },
    imageStorageMigrate: {
      head: `存储迁移`,
      content: `1. 支持跨Ceph镜像存储的数据迁移；
2. 对于跨Ceph镜像存储的数据迁移，要求两个Ceph镜像存储的MON节点之间网络互通。`
    },
    syncImage: {
      head: `镜像同步网络`,
      content: `1. 如果已部署镜像同步单独使用的网络，需填写镜像同步网络CIDR，设置后立即生效；
2. 如果不设置，镜像同步时默认使用管理网络；
3. 如果源镜像仓库和目标镜像仓库均设置镜像同步网络，起作用的是目标镜像仓库的镜像同步网络。`
    },
    synchronousMirroring: {
      head: `同步镜像`,
      content: `1.同一管理节点下，支持将一个/多个镜像仓库中的镜像同步至指定镜像仓库；
2.目前仅ImageStore 类型的镜像服务器中的镜像支持该操作。`
    },
    volumeStorageMigrate: {
      head: `存储迁移`,
      content: `1. 支持跨Ceph主存储，跨NFS主存储或跨SharedBlock主存储的数据盘迁移；
2. Ceph和NFS主存储数据盘要求没有被挂载在任何云主机上；
3. SharedBlock主存储数据盘可以挂载在停止的云主机上迁移；
3. 对于跨Ceph主存储的数据迁移，要求两个Ceph主存储的MON节点之间网络互通；
4. 对于跨NFS主存储的数据迁移，要求目标NFS主存储能够被挂载到待迁移数据盘所在集群；
5. 对于跨SharedBlock主存储的数据迁移，要求目标SharedBlock主存储能够被挂载到待迁移数据盘所在集群。`
    },
    vmStorageMigrate: {
      head: `存储迁移`,
      content: `1. 支持跨Ceph主存储，跨NFS主存储或跨SharedBlock主存储的云主机冷迁移；
2. Ceph和NFS主存储要求云主机在迁移前必须关机，并卸载掉所有数据盘；
3. SharedBlock主存储要求云主机在迁移前必须关机，支持整机迁移；
4. 要求目标主存储所挂载集群能够满足云主机的网络需求；
5. 对于跨Ceph主存储的数据迁移，要求两个Ceph主存储的MON节点之间网络互通；
6. 对于跨NFS主存储的数据迁移，要求目标NFS主存储能够被挂载到待迁移云主机所在集群；
7. 对于跨SharedBlock主存储的数据迁移，要求目标SharedBlock主存储能够被挂载到待迁移云主机所在集群。`
    },
    ecs_securityGroup: {
      head: `安全组`,
      content: `1. 用于设置ECS采用的安全防护规则；
2. 创建ECS需指定安全组进行防火墙控制。`
    },
    ecs_publicNetworkIp: {
      head: `公网IP`,
      content: `1. 表示ECS是否采用弹性公网IP；
2. 如果指定，则需指定公网带宽，默认为1Mbps。`
    },
    haLevel: {
      head: `高可用级别`,
      content: `1. 支持None和NeverStop两种模式；
2. None模式：云主机关闭高可用功能，NeverStop模式：云主机开启高可用功能。<br>
注意：
1. 可通过<b>“云主机高可用全局开关”</b>开启或关闭云主机高可用功能，默认为true；
2. 如果关闭此选项， 则云主机不支持设置高可用，云主机详情也不会显示高可用信息；
3. 如果关闭此选项，将全局禁用高可用功能，请谨慎操作！`
    },
    consoleMode: {
      head: `控制台模式`,
      content: `1. 表示可单独设置云主机的控制台模式；
2. 创建云主机时，默认会根据全局设置来配置；
3. 单独设置与全局设置不一致时，单独设置优先生效；
4. 重启后生效。`
    },
    hybridVolumeName: {
      head: `磁盘名称`,
      content: `1. 长度为[2, 128]个大小写英文或中文字符，必须以大小写字母或中文开头，含数字，下划线（_）或连字符（-）;
2. 磁盘名称会展示在控制台；
3. 不能以http://和https://开头；
4. 不填则为空，默认值：空。`
    },
    vpcVRouter: {
      head: `VPC路由器`,
      content: `1. VPC的核心，基于云路由规格可直接创建，拥有公有网络和管理网络；
2. 需创建路由规格所需的公有网络和管理网络、云路由镜像资源；
3. 可灵活挂载或卸载VPC网络或其他公有网络；
4. 云路由规格定义的公有网络和管理网络，不可卸载；
5. 公有网络作为默认网络，用于提供网络服务。`
    },
    vpcNetwork: {
      head: `VPC网络`,
      content: `1. 作为VPC的私有网络，可挂载至VPC路由器；
2. 需先创建二层网络，用于创建三层的VPC网络；
3. 创建时需指定待挂载的路由器；
4. 如有云主机使用此网络，不支持从路由器卸载;
5. 新建的网络段不可与VPC路由器内任一网络的网络段重叠。`
    },
    vpcEip: {
      head: `弹性IP`,
      content: `1. 弹性IP定义了通过公有网络访问内部私有网络的方法；
2. 公有网络需选择可以连接外网的公有网络，请确保此公有网络可以连接外部网络；
3. 内部私有网络是隔离的网络空间，不能直接被外部网络访问；
4. 通过访问公有网络的IP可以直接访问到内部私有网络的IP。`
    },
    vpcVip: {
      head: `虚拟IP`,
      content: `1. 可用于提供弹性IP、端口转发、负载均衡、IPsec隧道等网络服务，数据包会被发送到虚拟IP，再路由至私有网络；
2. 扁平网络下的虚拟IP服务仅用于弹性IP网络服务；
3. 云路由网络下的虚拟IP服务可用于弹性IP、端口转发、负载均衡、IPsec隧道等网络服务。`
    },
    backup: {
      head: `创建灾备数据`,
      content: `1. 本地云主机、镜像和云盘可备份到灾备服务器中；
2.云主机、镜像均以镜像备份进行保存；
3.云盘以云盘备份进行保存。`
    },
    disasterBackup: {
      head: `灾备数据`,
      content: `1. 备份在云灾备服务器中的灾备数据可还原至本地；
2. 备份的云主机、镜像和云盘均还原为镜像。`
    },
    disasterBackupStorage: {
      head: `灾备服务器`,
      content: `1. 用于存储灾备数据，备份的数据可在发生灾难时恢复；
2. 支持异地、公有云增量备份；
3. 需使用Mhflex定制版ISO安装系统。`
    },
    volume: {
      head: `云盘`,
      content: `1. 采用Virtio类型的存储扩展盘;
2. 主流Linux，CentOS6/7系列已集成Virtio驱动;
3. Windows云主机需安装Virtio类型驱动，驱动可从http://fedoraproject.org/wiki/Windows_Virtio_Drivers下载最新稳定版本，在设备管理器，针对scsi控制器安装驱动;
4. 创建云盘时，如未选择主存储或挂载云主机，则生成“未实例化云盘”；未实例化云盘的总数量在KVM和vCenter环境中共享。`
    },
    resizeRootVolume: {
      head: '系统扩容',
      content: `增量不得小于4MB。
      `
    },
    resizeVolume: {
      head: '云盘扩容',
      content: `增量不得小于4MB。
      `
    },
    consoleProxyOverriddenIp: {
      head: '控制台代理地址',
      content: `1. 控制台代理地址可填写：管理节点公网IP地址、NAT地址、域名；
2. 无需重启管理节点，直接生效。`
    },
    monIp: {
      head: 'Mon IP',
      content: `ceph监控节点的IP地址。
      `
    },
    monHostIp: {
      head: '节点管理IP',
      content: `管理节点连接ceph存储的IP地址。
      `
    },
    uiSettings: {
      head: '自定义UI',
      content: `设置或者重置成功后，请手动刷新页面。`
    },
    audit: {
      head: '审计',
      content: `界面最多显示300条审计信息，请调整合适的时间段进行搜索。`
    },
    vCenterMessage: {
      head: '事件消息',
      content: `界面最多显示300条事件消息，请调整合适的时间段进行搜索。`
    },
    vpcDistributeVRouter: {
      head: '分布式路由',
      content: `1. 默认关闭，开启后会尝试优化东西向流量；
2. 开启后，无须重启，立刻生效。`
    },
    localCidrSetting: {
      head: '本地子网设置',
      content: `只有VPC路由器的IPsec可以动态修改本地子网。`
    },
    peerCidrSetting: {
      head: '远端网络CIDR设置',
      content: `只有VPC路由器的IPsec可以动态修改远端网络CIDR。`
    },
    configMac: {
      head: 'MAC地址',
      content: `1. 请填写有效的MAC地址格式，例如：xx:xx:xx:xx:xx:xx；
2. 不与平台中已有的MAC地址重复。`
    },
    mac: {
      head: 'MAC地址',
      content: `1. 必须是有效的MAC地址；
2. 在Mhflex中没有被占用；
3. 添加云主机方法为多个时，不可设置MAC地址。`
    },
    staticIp: {
      head: '静态IP',
      content: `1. 填写的静态IP需在所选网络的网络段内；
2. 下拉菜单会帮助显示5个可用的静态IP，如果当前网络段可用的静态IP数量不足5个，则显示全部可用静态IP。`
    },
    allocatorStrategy: {
      head: '物理机分配策略',
      content: `1. 创建云主机时采用此计算规格，则执行对应选择的物理机分配策略，默认策略为“运行云主机数量最少”策略；
2. 运行云主机数量最少策略：优先选择虚拟机最少的物理机来创建云主机；
3. CPU使用率最低策略：优先选择CPU使用率最低的物理机来创建云主机；
4. 内存使用率最低策略：优先选择内存使用率最低的物理机来创建云主机；
5. 运行云主机最大数量策略：用户先指定一台物理机最多允许运行云主机的数量，系统会筛选出满足此要求的物理机来创建云主机。如果没有满足条件的物理机，则会创建失败；
6. CPU使用率最低和内存使用率最低策略，可以在平台“全局设置”中配置CPU使用率和内存使用率的采集时长。`
    },
    strategyPattern: {
      head: '策略模式',
      content: `1. 分配策略(非强制)：若查询不到物理机负载信息，则随机分配资源足够的物理机创建云主机;
2. 分配策略(强制)：若查询不到物理机负载信息，则无法创建云主机。`
    },
    zwatchsnstexttemplate: {
      head: '报警消息模板',
      content: `报警器或事件向SNS系统的主题发送消息时使用的文本模板。
1. 目前报警消息模板支持邮箱和钉钉两种接收端平台。使用报警消息模板，可将通知邮件或钉钉消息以统一格式发出。
2. 系统自带一个默认模板，若用户没有创建模板，系统将使用自带模板。
3. 用户可以创建多个模板，但只能指定一个为默认模板，发送消息时只会使用默认模板格式化信息。
4. 模板中可以通过\\$\\{\\}引用报警器或事件提供的变量。`
    },
    AlarmRange: {
      head: '报警范围',
      content: `支持对批量资源创建报警器，其中任一资源满足报警条件，即可触发报警。`
    },
    zwatchendpoint: {
      head: '接收端',
      content: `用户可以用选择不同类型的接收端，包括：邮箱、钉钉、HTTP应用。
创建邮箱类型接收端：
1. 报警消息都会以邮件方式通过邮箱服务器发送到指定的邮箱地址。
2. 用户可提前创建报警消息模板，或使用系统自带模板，将通知邮件以统一格式发出。
3. 需提前在当下区域内添加邮箱服务器，并测试邮箱服务器可用。
创建钉钉类型接收端：
1. 发送到接收端的消息都会以钉钉方式发送到指定的钉钉机器人地址，若指定对象，会通过@电话号码通知相应的钉钉成员。
2. 用户可提前创建报警消息模板，或使用系统自带模板，将钉钉消息以统一格式发出。
创建HTTP应用类型接收端：
1. 发送到接收端的消息都会以HTTP POST方式发送到指定的HTTP地址。
2. 若指定的HTTP应用已设置了用户名和密码才可访问，需按实填写用户名和密码。`
    },
    certificate: {
      head: `证书`,
      content: `1. 目前证书仅用于负载均衡服务，当负载均衡监听器使用HTTPS协议，需绑定证书使用；
2. 需提前准备好证书，可使用相关工具生成自签证书，也可购买正规CA签发证书；
3. 将准备好的证书上传到云平台，支持上传证书和证书链；
4. 只支持PEM格式，上传前确保证书、私有密钥和证书链符合格式要求。`
    },
    certificateText: {
      head: '证书正文',
      content: `1. 将准备好的证书内容传入。
2. 只支持PEM格式，上传前确保证书符合格式要求。
3. 证书内容不能包含空格。
4. 证书正文示例：
----BEGIN CERTIFICATE----
#end-user证书#
----END CERTIFICATE----`
    },
    certificatePrivateKey: {
      head: '私有密钥',
      content: `1. 将准备好的私有密钥传入。
2. 只支持PEM格式，上传前确保私有密钥符合格式要求。
3. 私有密钥内容不能包含空格。
4. 私有密钥示例：
----BEGIN PRIVATE KEY----
#私有密钥#
----END PRIVATE KEY----`
    },
    certificateChain: {
      head: '证书链',
      content: `1. 可选项，若有多份证书需要上传，需将root证书、intermediates证书合并在一起上传。
2. root证书放在第一位，intermediates证书从第二位开始依次排列，证书之间不能有空行。
3. 证书内容不能包含空格。
4. 证书链示例：
----BEGIN CERTIFICATE----
#root证书#
----END CERTIFICATE----
----BEGIN CERTIFICATE----
#intermediates证书#
----END CERTIFICATE----
----BEGIN CERTIFICATE----
#intermediates证书#
----END CERTIFICATE----`
    },
    appCenter: {
      head: '应用',
      content: `1. 支持添加各类第三方应用入口URL，便于用户集中管理以及快速打开应用。
2. 目前可选应用类型包括：存储、数据库、安全、IaaS、PaaS、SaaS。
3. 可对应用设置共享权限，使该应用仅管理员可见或所有人均可见。`
    },
    dnsForCreatingVpcVRouter: {
      head: `DNS`,
      content: `用于设置VPC路由器的DNS解析服务，例如，指定223.5.5.5。`
    },
    dnsForVpcVRouter: {
      head: 'DNS',
      content: `1. 对于VPC路由器，在添加、删除DNS以后实时生效。
2. 对于已添加的DNS，按添加时间的先后顺序自顶向下依次排列生效。`
    },
    role: {
      head: '权限',
      content: `1. 项目负责人/项目管理员可对成员赋予权限，获得权限的成员可调用相关API进行资源操作；
2. 项目负责人/项目管理员不可对自身进行权限赋予或取消；
3. 如需项目成员通过工单申请方式创建云主机，项目负责人/项目管理员应对成员赋予“云主机管理（禁止创建）”权限，同时取消“云主机管理”权限；
4. 系统默认提供15条权限，可按场景需求添加更多权限。`
    },
    roleContent: {
      head: '权限内容',
      content: `1. 权限内容采用JSON结构定义，语法规则如下：
<div style="font-size: 12px;">{
   "name": "权限名称，可为null",
   "effect": "效果，Allow为允许，Deny为拒绝",
   "actions": [
     "API表达式.**"
   ]
}</div>
2. 举例说明：
<div style="font-size: 12px;">{
   "name": "Example1",
   "effect": "Allow",
   "actions": [
     "org.mhflex.header.vm.**"
   ]
} #获得该权限的成员可以调用所有云主机相关的API</div>
3. 添加权限所需的API表达式可查阅《开发手册》获取。`
    },
    resourceStackTemplate: {
      head: '资源栈示例模板',
      content: `云平台提供了常用的示例模板，用户可基于已有示例模板创建资源栈。 `
    },
    resourceStackTemplateStructure: {
      head: '资源栈模板结构',
      content: `<div style="font-size: 12px;">{
    "ROSTemplateFormatVersion" : "YYYY-MM-DD",
    "Description" : "模板描述信息，可用于说明模板的适用场景、架构说明等。",
    "Parameters" : {
      // 定义创建资源栈时，用户可以定制化的参数。
    },
    "Mappings" : {
      // 定义映射信息表，映射信息是一种多层的Map结构。
    },
    "Resources" : {
      // 所需资源的详细定义，包括资源间的依赖关系、配置细节等。
    },
    "Outputs" : {
      // 用于输出一些资源属性等有用信息，可以通过API获取输出的内容。
  }</div>`
    },
    createResourceStackTemplate: {
      head: '创建资源栈模板',
      content: `1. 基于资源栈模板可快速创建资源栈；
2. 创建资源栈模板方式：
    上传文件：可直接上传已定义的UTF8编码格式的模板文件创建；
    文本：可在文件编辑器编辑创建。`
    },
    createResourceStack: {
      head: '创建资源栈',
      content: `1. 通过创建资源栈可实现资源自动编排；
2. 创建资源栈方式：
    资源栈模板：可选择自定义模板或系统模板创建；
    上传文件：可上传已定义的目标文件创建；
    文本：可在文件编辑器编辑创建。`
    },
    createResourceStackTimeout: {
      head: '超时设置',
      content: `1. 用于设定创建资源栈的超时时限，超时将失败；
2. 默认勾选回滚，失败后将清理已创建的资源。`
    },
    visualizationEditor: {
      head: '可视化编辑器',
      content: `使用可视化方式，通过拖曳连线直观呈现云资源间的关系，高效编排云资源。`
    },
    v2v: {
      head: '迁移任务',
      content: `1. 通过创建迁移任务，可将已接管的vCenter云主机迁移至当前云平台；
2. 用户可对云主机进行批量的V2V迁移，并对迁移的目标云主机进行自定义配置；
3. 迁移的源vCenter平台版本支持：5.5、6.0、6.5、6.7；
4. 迁移的源vCenter云主机系统支持：RHEL/CentOS 5.x/6.x/7.x、SLES 11/12/15、Ubuntu 12/14/16/18、Windows 7/2003/2008/2012/2016；
5. 云主机在V2V迁移过程中将强制关闭，注意业务影响；
6. 迁移的目标主存储支持Shared Block类型以及Ceph类型。`
    },
    v2vConversionHost: {
      head: '迁移任务',
      content: `1. V2V迁移需要指定目标集群内的一个物理机作为迁移服务器；
2. 迁移服务器必须有足够的硬件资源，包括：网络带宽、磁盘空间等。`
    },
    cloneVm: {
      head: '克隆',
      content: `1. 支持一键克隆带数据云盘的云主机，同时保证业务连续性；
2. 若云主机挂载共享云盘，暂不支持带云盘克隆。 `
    },
    ticketProcessOperator: {
      head: '代理人',
      content: '指定项目后，工单流程的处理人将从该项目中选择。'
    },
    addhost: {
      head: '添加方式：',
      content: `1. 支持手动添加和模板导入两种方式，最大允许一次性批量添加500台物理机；
2. 手动添加方式：可指定单个IP逐台添加物理机，也可指定IP范围批量添加物理机；
3. 模板导入方式：需先下载csv格式的配置模板文件，按规定格式填写物理机配置信息后上传文件，并进行语法检查，文件格式说明如下：
  a.标星号参数均为必填项，但若"名称"和"SSH端口"未填
  写，系统将默认"名称"为"HOST-物理机IP地址"，"SSH
  端口"为22；
  b."物理机IP"可指定单个IP逐台添加物理机，也可指定IP
  范围批量添加物理机，若填写多段IP范围，请用逗号隔
  开，"^"表示不包含：
    127.0.0.1-127.0.0.10,^127.0.0.2-127.0.0.3
  c."扫描物理机IOMMU"为可选参数，若填写"NO/No/no/N/
  n"或留空不填，则关闭该功能，若填写"YES/Yes/yes/Y/
  y"，则开启该功能；
  d. "关闭Intel EPT硬件辅助"为可选参数，若填写"NO/No/
  no/N/n"或留空不填，则开启Intel EPT硬件辅助虚拟化功
  能，若填写"YES/Yes/yes/Y/y"，则关闭Intel EPT硬件辅
  助虚拟化功能。
`
    },
    addBaremetalChassis: {
      head: '添加方式：',
      content: `1. 支持手动添加和模板导入两种方式，最大允许一次性批量添加500台裸金属设备；
2. 手动添加方式：可指定单个IPMI地址逐台添加裸金属设备，也可指定IPMI地址范围批量添加裸金属设备；
3. 模板导入方式：需先下载csv格式的配置模板文件，按规定格式填写裸金属设备的配置信息后上传文件，并进行语法检查，文件格式说明如下：
  a. 标星号参数均为必填项；
  b. "IPMI地址"可指定单个IPMI地址逐台添加裸金属设备，也可指定IPMI范围批量添加裸金属设备，若填写多段IPMI地址范围，请用逗号隔开，"^"表示不包含：
    127.0.0.1-127.0.0.10,^127.0.0.2-127.0.0.3
  c. "重启裸金属设备"为可选参数，若填写"NO/No/no/N/n"或留空不填，则需手动重启裸金属设备以获取硬件信息，若填写"YES/Yes/yes/Y/y"，系统将自动重启裸金属设备以获取硬件信息。`
    },
    bootMode: {
      head: 'BIOS模式',
      content: `1. 对于qcow2或raw格式的镜像，请选择与封装时一致的BIOS模式；
2. 对于iso格式的镜像，可自行选择BIOS模式，系统将基于所选模式引导安装。`
    },
    isNotSetUEFIbootMode: {
      head: 'BIOS模式',
      content: `1. 对于qcow2或raw格式的镜像，请选择与封装时一致的BIOS模式；
2. 对于iso格式的镜像，可自行选择BIOS模式，系统将基于所选模式引导安装；
3. 在c72集群内建议选择Legacy模式，确保使用稳定。`
    },
    bootModeDetail: {
      head: 'BIOS模式',
      content: `1. 云主机继承其镜像的BIOS模式；
2. 对于qcow2或raw格式的镜像，请选择与封装时一致的BIOS模式；
3.  对于iso格式的镜像，可自行选择BIOS模式，系统将基于所选模式引导安装；
4. 请谨慎修改，模式不匹配可能导致云主机无法正常工作；
5. 重启后生效。`
    },
    isNotSetUEFIbootModeDetail: {
      head: 'BIOS模式',
      content: `1. 云主机继承其镜像的BIOS模式；
2. 对于qcow2或raw格式的镜像，请选择与封装时一致的BIOS模式；
3.  对于iso格式的镜像，可自行选择BIOS模式，系统将基于所选模式引导安装；
4. 在c72集群内建议选择Legacy模式，确保使用稳定；
5. 请谨慎修改，模式不匹配可能导致云主机无法正常工作；
6. 重启后生效。`
    },
    editCPUPinning: {
      head: '编辑CPU绑定',
      content: `1. 支持修改CPU绑定策略，重启后生效；
2. 如果删除所有策略，将不再支持修改操作。`
    },
    v2vConvertStrategy: {
      head: '压缩模式',
      content: `1. 默认使用压缩模式，可有效压缩迁移数据缓存，提高迁移服务器的缓存空间利用率；
2. 若目标主存储为Ceph类型，使用压缩模式可能导致迁移效率下降。`
    },
    l3NetworkMode: {
      head: '分配IP模式',
      content: `Stateful-DHCP（默认）：有状态地址DHCP配置。接口地址以及其他参数全部通过DHCP协议配置。
Stateless-DHCP： 无状态地址DHCP配置。接口地址通过路由通告的前缀自动推导出来，其他参数通过DHCP协议配置。
SLAAC：无状态地址自动配置。接口地址通过路由通告的前缀自动推导出来，其他参数也附带在路由通告中。`
    },
    zwatchSnsTemplatePlatform: {
      head: '平台',
      content:`1. 支持邮箱和钉钉两种接收端平台。使用报警消息模板，可将通知邮件或钉钉消息以统一格式发出；
2. 设置钉钉类型的报警消息模板需遵循Markdown语法，目前钉钉只支持Markdown语法的子集。`
    },
    nicConfig: {
      head: '指定IP',
      content:`<div>1. 填写的指定IP需在所选网络的网络段内；
2. 下拉菜单会帮助显示5个可用的指定IP，如果当前网络段可用的指定IP数量不足5个，则显示全部可用指定IP。</div>
<div>
<h1>MAC地址</h1>
<div>
 1. 必须是有效的MAC地址；
2. 在Mhflex中没有被占用；
3. 添加云主机方式为多个时，不可设置MAC地址
</div>
</div>`,
    },
    hybridTencentRootPassword:{
      head: `系统用户密码`,
      content: `1. 用于设置云主机的系统用户密码；
2. Linux 默认系统用户为root；
3. Windows 默认系统用户为administrator。；
4. Linux机器密码需8到16位，至少包括两项（[a-z,A-Z],[0-9]和[()\`~!@#$%^&*-+=_|{}[]:;'<>,.?/]的特殊符号）；
5. Windows机器密码需12到16位，至少包括三项（[a-z],[A-Z],[0-9]和[()\`~!@#$%^&*-+=_|{}[]:;'<>,.?/]的特殊符号）`
    },
    vpnTencentGateway: {
      head: `VPN网关`,
      content: `1. 基于互联网建立加密隧道进行私有网络之间的通信；
  2. 需在腾讯云端购买VPN网关。`
    },
    tencentUserGateWayIp: {
      head: `腾讯云对端Ip`,
      content: `对端IDC的公网IP.`
    },
    tencentIKEpsk: {
      head: 'IKEpsk',
      content: 'Unicode 字符串，本端和对端须使用相同的预共享密钥。'
    },
    vpnTencentConnection: {
      head: `VPN连接`,
      content: `1. 需选择本地数据中心可用的云路由器和私有网络；
2. 需选择腾讯云的VPC网络和其下的VPN网关；
3. 需选择已创建的腾讯云VPN用户网关；
4. 需输入IKE 共享密钥；
5. 高级选项，建议选择默认，默认选项可以连通双边私网。`
    },
    tencentDH: {
      head:`dhGroup`,
      content: `密钥交换的安全性随着 DH 组的扩大而增大，但交换的时间也会增加`
    },
    huaweiAccessKey:{
      head: `Account`,
      content: `1. 用于调用华为云API的凭证，需在华为云端的访问控制RAM创建；
2. 被设为默认的AccessKey可使用此AK调用华为云API来控制对应账户的云资源。`
    },
    hybridHuaweiRootPassword: {
      head: `系统用户密码`,
      content: `1. 用于设置云主机的系统用户据密码；
2. Linux 默认系统用户为root；
3. Windows 默认系统用户为administrator,Windows系统密码不能包含用户名或用户名的逆序，不能包含用户名中超过两个连续字符的部分`
    },
    ecs_HuaweisecurityGroup: {
      head: `安全组`,
      content: `1. 用于设置ECS采用的安全防护规则；
2. 创建ECS需指定安全组进行防火墙控制。`
    },
    hybirdHuaweiInstanceOffering: {
      head: `計算規格`,
      content: `計算規格為從腾讯雲端同步可用的CPU、大小配置等信息。`
    },
    hybirdHuaweiImage: {
      head: `镜像`,
      content: `镜像可选择华为云系统镜像和自定义镜像。`
    },
    ecs_huaweiidentityZone: {
      head: `可用区`,
      content: `1. 对应了华为云的可用区，与当前Account对应；
2. 需添加，才可同步当前Account对应账户的可用区下的资源。`
    },
    ecs_huaweiSubNets:{
      head: `子网`,
      content: `1. 用来分配cidr；
2. 如果没有子网需在私有网络VPC的详情页面创建（备注：两者必需在同一个可用区里）`
    },
    ecs_huaweiBucketName: {
      head: `桶`,
      content:`命名规则:
- 需全局唯一，不能与已有的任何桶名称重复。
- 长度范围为3到63个字符，支持小写字母、数字、中划线（-）、英文句号（.）。
- 禁止两个英文句号（.）或英文句号（.）和中划线（-）相邻，禁止以英文句号（.）和中划线（-）开头或结尾。
- 禁止使用IP地址。
- 如果名称中包含英文句号（.），访问桶或对象时可能会进行安全证书校验。`
    },
    vpcHuaweiCidr: {
      head: `VPC CIDR`,
      content: `请避免不同VPC的网段重叠，以免后续无法使用VPC互通服务。 建议使用网段: 10.0.0.0/8-24 (选择)172.16.0.0/12-24 (选择)192.168.0.0/16-24 (选择)`
    }
  }
}
