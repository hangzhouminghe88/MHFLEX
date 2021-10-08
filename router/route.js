import MainPage from '../src/Main.vue';
import hybridTencentSecurityGroup from '../store/modules/hybridTencentSecurityGroup';

const Login  = () => import(/* webpackChunkName: "Login" */'../src/login/Login');
//ecs相关路由
const EcsPage = () => import(/*webpackChunkName: "ECS"*/ '../src/ecs/EcsMain');
const EcsInstancePage = () => import(/*webpackChunkName: "ECSINSTANCEPAGE"*/'../src/ecs/ecsInstance/EcsInstancePage');
const CreateInstancePage = () => import(/*webpackChunkName: "CRATEINTANCEPAGE"*/'../src/ecs/ecsInstance/CreateInstancePage');
const AboutPage = () => import(/*webpackChunkName: 'ABOUT'*/'../src/ecs/about/AboutPage');
const Eip = () => import(/*webpackChunkName: "EIP"*/'../src/ecs/ecsInstance/Eip');
const VMDetailPage = () => import(/*webpackChunkName: 'VMDETAILPAGE'*/'../src/ecs/ecsInstance/vmdetail/VMDetailPage');
const VolumePage = () => import(/*webpackChunkName: 'VOLUMEPAGE'*/'../src/ecs/volume/VolumePage');
const CreateVolumePage = () => import(/*webpackChunkName: 'CREATEVOLUMEPAGE'*/'../src/ecs/volume/CreateVolumePage');
const VolumeDetailPage = () => import(/*webpackChunkName: 'VOLUMEDETAILPAGE'*/'../src/ecs/volume/detail/VolumeDetailPage');
const ImagePage = () => import(/*webpackChunkName: 'IMAGEPAGE'*/'../src/ecs/image/ImagePage');
const CreateImagePage = () => import(/*webpackChunkName: 'CREATEIMAGEPAGE'*/'../src/ecs/image/CreateImagePage');
const ImageDetailPage = () => import(/*webpackChunkName: 'IMAGEDETAILPAGE'*/'../src/ecs/image/detail/ImageDetailPage');
const AffinitygroupPage = () => import(/*webpackChunkName: 'AFFINITYGROUPPAGE'*/'../src/ecs/affinityGroup/AffinitygroupPage')
const CreateAffinityGroupPage = () => import(/*webpackChunkName: 'CREATEAFFINITYGROUPPAGE'*/'../src/ecs/affinityGroup/CreateAffinityGroupPage');
const AffinityGroupDetailPage = () => import(/*webpackChunkName: 'AFFINITYGROUPDETAILPAGE'*/'../src/ecs/affinityGroup/detail/AffinityGroupDetailPage');
const InstanceOfferingPage = () => import(/*webapckChunkName: 'INSTANCEOFFERINGPAGE'*/'src/ecs/intanceOffing/InstanceOfferingPage');
const CreateInstanceOfferingPage = () => import(/*webpackChunkName: 'CREATEINSTANCEOFFERINGPAGE'*/'src/ecs/intanceOffing/CreateInstanceOfferingPage');
const InstanceOfferingDetailPage = () => import(/*webpackChunkName*: 'INSTANCEOFFERINGDETAILPAGE'*/'src/ecs/intanceOffing/detail/InstanceOfferingDetailPage');
const VolumeOfferingPage = () => import(/*webpackChunkName: 'VOLUMEOFFERINGPAGE'*/'src/ecs/volumeOffering/VolumeOfferingPage');
const CreateVolumeOfferingPage = () =>  import(/*webpackChunkName: 'CREATEVOLUMEOFFERINGPAGE'*/'src/ecs/volumeOffering/CreateVolumeOfferingPage');
const VolumeOfferingDetailPage = () => import(/*webpackChunkName: 'VOLUMEOFFERINGDETAILPAGE'*/'src/ecs/volumeOffering/detail/VolumeOfferingDetailPage');
const AutoScalingGroupPage = () => import(/*webpackChunkName: 'AUTOSCALINGGROUPPAGE'*/'src/ecs/autoScalingGroup/AutoScalingGroupPage');
const CreateAutoScalingGroupPage = () => import(/*webpackChunkName: 'CREATEAUTOSCALINGGROUPPAGE'*/'src/ecs/autoScalingGroup/CreateAutoScalingGroupPage');
const AutoScalingGroupDetailPage = () => import(/*webpackChunkName: 'AUTOSCALINGGROUPDETAILPAGE'*/'src/ecs/autoScalingGroup/detail/AutoScalingGroupDetailPage');
const WizardPage = () => import(/*webpackChunkName: 'WIZARDPAGE'*/'src/ecs/wizard/WizardPage');
const DbBackupWizard = () => import(/*webpackChunkName: 'DBBACKUPWIZARD'*/'src/ecs/wizard/component/DbBackupWizard');

//网络相关路由
const NetWorkPage = () => import(/*webpackChunkName: "NETWORK"*/'../src/network/NetWorkMain');
const VxlanPoolPage = () => import(/*webpackChunkName: "VXLANPOOLPAGE"*/'../src/network/vxlanpool/VxlanpoolPage')
const VxlanPoolDetailPage = () => import(/*webpackChunkName: "VXLANPOOLDETAILPAGE"*/'../src/network/vxlanpool/VxlanPoolDetailPage')
const CreateVxlanPoolPage = () => import(/*webpackChunkName: "CREATEVXLANPOOLPAGE"*/'../src/network/vxlanpool/CreateVxlanpoolPage');
const VxlanNetworkPoolAttachCluster = () => import(/*webpackChunkName: "VXLANPOOLATTACHPAGE"*/'../src/network/vxlanpool/VxlanNetworkPoolAttachCluster');

const L2NetworkPage = () => import(/*webpackChunkName: "L2NETWORKPAGE"*/'../src/network/l2network/L2NetworkPage');
const CreateL2NetworkPage = () => import(/*webpackChunkName: "CREATEL2NETWORKPAGE"*/'../src/network/l2network/CreateL2NetworkPage');
const L2NetworkDetailPage = () => import(/*webpackChunkName: "L2NETWORKDETAILPAGE"*/'../src/network/l2network/L2NetworkDetailPage');

const PublicNetworkPage = () => import(/*webpackChunkName:"PUBLICNETWORK"*/'../src/network/l3network/PublicNetworkPage');
const SystemNetworkPage = () => import(/*webpackChunkName:"PUBLICNETWORK"*/'../src/network/l3network/SystemNetworkPage');
const PrivateNetworkPage = () => import(/*webpackChunkName:"PUBLICNETWORK"*/'../src/network/l3network/PrivateNetworkPage');
const CreatePublicNetworkPage = () => import(/*webpackChunkName: "VXLANPOOLPAGE"*/'../src/network/l3network/CreatePublicNetworkPage');
const CreateSystemNetworkPage = () => import(/*webpackChunkName: "VXLANPOOLPAGE"*/'../src/network/l3network/CreateSystemNetworkPage');
const CreatePrivateNetworkPage = () => import(/*webpackChunkName: "VXLANPOOLPAGE"*/'../src/network/l3network/CreatePrivateNetworkPage');
const L3NetworkDetailPage = () => import(/*webpackChunkName: "VXLANPOOLPAGE"*/'../src/network/l3network/L3NetworkDetailPage');

const VirtualRouterPage = () => import(/*webpackChunkName:"VIRTUALROUTE"*/'../src/network/virtualRouter/VirtualRouterPage');
const DetailVirtualRouterPage = () => import(/*webpackChunkName: 'DETAILVIRTUALROUTERPAGE'*/'../src/network/virtualRouter/detail/DetailVirtualRouterPage');

const VirtualRouterTablePage = () => import(/*webpackChunkName:"VIRTUALROUTE"*/'../src/network/virtualRouterTable/VirtualRouterTablePage');
const VirtualRouterTableDetailPage = () => import(/*webpackChunkName:"VIRTUALROUTE"*/'../src/network/virtualRouterTable/VirtualRouterTableDetailPage');
const CreateVirtualRouterTablePage = () => import(/*webpackChunkName:"VIRTUALROUTE"*/'../src/network/virtualRouterTable/CreateVirtualRouterTablePage');

const VirtualRouterOfferingPage = () => import(/*webpackChunkName:"PUBLICNETWORK"*/'../src/network/virtualRouterOffering/VirtualRouterOfferingPage');
const VirtualRouterOfferingDetailPage = () => import(/*webpackChunkName:"PUBLICNETWORK"*/'../src/network/virtualRouterOffering/VirtualRouterOfferingDetailPage');
const CreateVirtualRouterOfferingPage = () => import(/*webpackChunkName:"PUBLICNETWORK"*/'../src/network/virtualRouterOffering/CreateVirtualRouterOfferingPage');

const VirtualRouterImagePage = () => import(/*webpackChunkName:"PUBLICNETWORK"*/'../src/network/virtualRouterImage/VirtualRouterImagePage');
const VirtualRouterImageDetailPage = () => import(/*webpackChunkName:"PUBLICNETWORK"*/'../src/network/virtualRouterImage/VirtualRouterImageDetailPage');
const CreateVirtualRouterImagePage = () => import(/*webpackChunkName:"PUBLICNETWORK"*/'../src/network/virtualRouterImage/CreateVirtualRouterImagePage');

const VpcVRouterPage = () => import(/*webpackChunkName:"PUBLICNETWORK"*/'../src/network/vpcVRouter/VpcVRouterPage');
const CreateVpcVRouterPage = () => import(/*webpackChunkName:"PUBLICNETWORK"*/'../src/network/vpcVRouter/CreateVpcVRouterPage');
const DetailVpcVRouterPage = () => import(/*webpackChunkName:"DETAILVPCVROUTERPAGE"*/'../src/network/vpcVRouter/detail/DetailVpcVRouterPage');
const VpcNetworkPage = () => import(/*webpackChunkName:"PUBLICNETWORK"*/'../src/network/vpcNetwork/VpcNetworkPage');
const VpcNetworkDetailPage = () => import(/*webpackChunkName:"PUBLICNETWORK"*/'../src/network/vpcNetwork/VpcNetworkDetailPage');
const CreateVpcNetworkPage = () => import(/*webpackChunkName:"PUBLICNETWORK"*/'../src/network/vpcNetwork/CreateVpcNetworkPage');

const VipPage = () => import(/*webpackChunkName:"PUBLICNETWORK"*/'../src/network/vip/VipPage');
const VipDetailPage = () => import(/*webpackChunkName:"PUBLICNETWORK"*/'../src/network/vip/VipDetailPage');
const CreateVipPage = () => import(/*webpackChunkName:"PUBLICNETWORK"*/'../src/network/vip/CreateVipPage');

const EipPage = () => import(/*webpackChunkName:"PUBLICNETWORK"*/'../src/network/eip/EipPage');
const EipDetailPage = () => import(/*webpackChunkName:"PUBLICNETWORK"*/'../src/network/eip/EipDetailPage');
const CreateEipPage = () => import(/*webpackChunkName:"PUBLICNETWORK"*/'../src/network/eip/CreateEipPage');

const PortForwardingPage = () => import(/*webpackChunkName:"PUBLICNETWORK"*/'../src/network/portforwarding/PortForwardingPage');
const PortForwardingDetailPage = () => import(/*webpackChunkName:"PUBLICNETWORK"*/'../src/network/portforwarding/PortForwardingDetailPage');
const CreatePortForwardingPage = () => import(/*webpackChunkName:"PUBLICNETWORK"*/'../src/network/portforwarding/CreatePortForwardingPage');

const Home = () => import(/*webpackChunkName:'Home'*/'../src/ecs/home/Home');


const IPsecPage = () =>import(/*webpackChunkName:"IPSECPAGE"*/'../src/network/IPsec/IPsecPage')
const CreateIPsecPage = () =>import(/*webpackChunkName:"IPSECPAGE"*/'../src/network/IPsec/CreateIPsecPage');
const DetailIPsecPage = () => import(/*webpackChunkName: 'DETAILIPSECPAGE'*/'../src/network/IPsec/detail/DetailIPsecPage');

//存储相关路由
const StoragePage = () => import(/*webpackChunkName:'STORAGEPAGE'*/'../src/storage/StorageMain');
const PrimaryStoragePage = () => import(/*webpackChunkName: 'PRIMARRYSTORAGEPAGE'*/'../src/storage/primarystorage/PrimaryStoragePage');
const PrimaryStorageDetailPage = () => import(/*webpackChunkName: 'PRIMARRYSTORAGEDETAILPAGE'*/'../src/storage/primarystorage/PrimaryStorageDetailPage');

const BackupStoragePage = () => import(/*webpackChunkName: 'BACKUPSTORAGEPAGE'*/'../src/storage/backupstorage/BackupStoragePage');
const BackupStorageDetailPage = () => import(/*webpackChunkName: 'BACKUPSTORAGEDETAILPAGE'*/'../src/storage/backupstorage/BackupStorageDetailPage');

const SanStoragePage = () => import(/*webpackChunkName: 'SANSTORAGEPAGE'*/'../src/storage/sanstorage/SanStoragePage');
const SanStorageDetailPage = () => import(/*webpackChunkName: 'SANSTORAGEDETAILPAGE'*/'../src/storage/sanstorage/SanStorageDetailPage');

const CreateIscsiSanStoragePage = () => import(/*webpackChunkName: 'CREATEISCSISANSTORAGEPAGE'*/'../src/storage/sanstorage/CreateIscsiSanStoragePage');
const CreatePrimaryStoragePage = () => import(/*webpackChunkName: 'CREATEPRIMARYSTORAGEPAGE'*/'../src/storage/primarystorage/CreatePrimaryStoragePage');
const CreateBackupStoragePage = () => import(/*webpackChunkName: 'CREATEBACKUPSTORAGEPAGE'*/'../src/storage/backupstorage/CreateBackupStoragePage');
const SecurityPage = () => import(/*webpackChunkName: 'SECURITYPAGE'*/'../src/security/SecurityPage');
const SecurityGroupPage = () => import(/*webpackChunkName: 'SECURITYGROUPPAGE'*/'../src/security/securitygroup/SecurityGroupPage');
const SecurityGroupDetailPage = () => import(/*webpackChunkName: 'SECURITYGROUPPAGE'*/'../src/security/securitygroup/SecurityGroupDetailPage');
const CreateSecurityGroupPage = () => import(/*webpackChunkName: 'CREATESECURITYGROUPPAGE'*/'../src/security/securitygroup/CreateSecurityGroupPage');
//om管理运维相关路由
const OMPage = () => import(/*webpackChunkName:'OMPAGE'*/'../src/om/OMMain');
const ZonePage = () => import(/*webpackChunkName: 'ZONEPAGE'*/'../src/om/zone/ZonePage');
const OpenZoneDetailPage =() => import('../src/om/zone/detail/ZoneDetailPage');
const OpenCreateZonePage =() => import('../src/om/zone/CreateZonePage')
const CreateSchedulerPage = () => import(/*webpackChunkName: 'CREATESCHEDULERPAGE'*/'src/om/schedulerjob/CreateScheduler');
const ClusterPage = () => import(/*webpackChunkName: 'CLUSTERPAGE'*/ '../src/om/cluster/ClusterPage');
const OpenCreateClusterPage = () => import(/*webpackChunkName: 'CLUSTERCREATEPAGE'*/  'src/om/cluster/CreateClusterPage');
const ClusterDetailpage = () => import(/*webpackChunkName: 'CLUSTERDETAILPAGE'*/ 'src/om/cluster/detail/ClusterDetailPage');
const HostPage = () => import(/*webpackChunkName: 'HOSTPAGE'*/'src/om/host/HostPage');
const CreateHostPage = () => import(/*webpackChunkName: 'CREATEHOSTPAGE'*/'src/om/host/CreateHostPage');
const HostDetailPage = () => import(/*webpackChunkName: 'HOSTDETAILPAGE'*/'src/om/host/detail/HostDetailPage');
const AccountPage = () => import(/*webpackChunkName: 'ACCOUNT'*/'src/om/account/AccountPage');
const createAccountPage = () => import(/*webpackChunkName: 'CREATEACCOUNTPAGE'*/'src/om/account/createAccountPage');
const AccountDetailPage = () => import(/*webpackChunkName: 'ZONEDETAILPAGE'*/'src/om/account/detail/AccountDetailPage');
const UserPage = () => import(/*webpackChunkName: 'USERPAGE'*/'src/om/user/UserPage');
const CreateUserPage = () =>  import(/*webpackChunkName: 'CREATEUSERPAGE'*/'src/om/user/CreateUserPage');
const UserDetailPage = () => import(/*webpackChunkName: 'USERDETAILPAGE'*/'src/om/user/detail/UserDetailPage');
const UserGroupPage = () => import(/*webpackChunkName: 'USERGROUPPAGE'*/'src/om/userGroup/UserGroupPage');
const CreateUserGroupPage = () => import(/*webpackChunkName: 'CREATEUSERGROUPPAGE'*/'src/om/userGroup/CreateUserGroupPage');
const GroupUserDetailPage = () => import(/*webpackChunkName: 'GroupUserDetailPage'*/'src/om/userGroup/detail/GroupUserDetailPage');
const BillingPage = () => import(/*webpackChunkName: 'BILLINGPAGE'*/'src/om/billing/BillingPage');
const BillingDetailPage = () => import(/*webpackChunkName: 'BILLINGDETAILPAGE'*/'src/om/billing/detail/BillingDetailPage');
const BillingSettingsPage = () => import(/*webpackChunkName: 'BILLINGSETTINGSPAGE'*/'src/om/billingSettings/BillingSettingsPage');
const CreateBillingSettingsPage = () => import(/*webpackChunkName:'CREATEBILLINGSETTINGPAGE'*/'src/om/billingSettings/CreateBillingSettingsPage');
const TimerPage = () => import(/*webpackChunkName: 'IIMERPAGE'*/'src/om/timer/TimerPage');
const CreateTimerPage = () => import(/*webpackChunkName: 'CREATETIMERPAGE'*/'src/om/timer/CreateTimerPage');
const TimerDetailPage = () => import(/*webpackChunkName: 'TIMERDETAILPAGE'*/'src/om/timer/detail/TimerDetailPage');
const SchedulerJobPage = () =>  import(/*webpackChunkName: 'SCHEDULERJOBPAGE'*/'src/om/schedulerjob/SchedulerJobPage');
const SchedulerJobDetailPage = () => import(/*webpackChunkName: 'SCHEDULERJOBDETAILPAGE'*/'src/om/schedulerjob/detail/SchedulerJobDetailPage');
const TagPage = () => import(/*webpackChunkName:'TAGPAGE'*/'src/om/tag/TagPage');
const TagDetailPage = () => import(/*webpackChunkName: 'TAGDETAILPAGE'*/'src/om/tag/detail/TagDetailPage');
const AppCenterPage = () => import(/*webpackChunkName: 'APPCENTERPAGE'*/'src/om/appcenter/AppCenterPage');
const CreateAppCenterPage = () => import(/*webpackChunkName: 'CREATEAPPCENTERPAGE'*/'src/om/appcenter/CreateAppCenterPage');
const EmailServerSettingPage = () => import(/*webpackChunkName: 'EMAILSERVERSETTINGPAGE'*/'src/om/email/EmailServerSettingPage');
const CreateEmailServerSettingPage = ()=> import(/*webpackChunkName:'CREATEEMAILSERVERSETTINGPAGE'*/'src/om/email/CreateEmailServerSettingPage');
const EmailServerSettingDetailPage = () => import(/*webpackChunkName: 'EMAILSERVERSETTINGDETAILPAGE'*/'src/om/email/detail/EmailServerSettingDetailPage');
const CertificatePage = () => import(/*webpackChunkName: 'CERTIFICATEPAGE'*/'src/om/certificate/CertificatePage');
const CreateCertificatePage = () => import(/*webpackChunkName:'CREATECERTIFICATEPAGE'*/'src/om/certificate/CreateCertificatePage');
const CertificateDetailPage = () => import(/*webpackChunkName:'CERTIFICATEDETAILPAGE'*/'src/om/certificate/detail/CertificateDetailPage');
const AdldapServerPage = () => import(/*webpackChunkName: 'ADLDAPSERVERPAGE'*/'src/om/adldapserver/AdldapServerPage');
const CreateAdldapServerPage =  () => import(/*webpackChunkName: 'CREATEADLDAPSERVERPAGE'*/'src/om/adldapserver/CreateAdldapServerPage');
const ConsoleProxy = () => import(/*webpackChunkName: 'CONSOLEPROXY'*/'src/om/consoleProxy/ConsoleProxyPage');
const AccessKeyPage = () => import(/*webpackChunkName: 'ACCESSKEYPAGE'*/'src/om/accessKey/AccessKeyPage');
const PerformanceHomePage = () => import(/*webpackChunkName: 'PERFORMACEHOMEPAGE'*/'src/om/performanceHome/PerformancePage');
const PerformancePage = () => import(/*webpackChunkName: 'PERFORMANCEPAGE'*/'src/om/performance/PerformancePage');
const ZwatchAlarmPage = () => import(/*webpackChunkName: 'ZWATCHALARMPAGE'*/'src/om/zwatchalarm/ZwatchAlarmPage');
const CreateZwatchAlaramResourcePage = () => import(/*webpackChunkName: 'CREATEZWATCHALARMRESOURCEPAGE'*/'src/om/zwatchalarm/CreateZwatchAlaramResourcePage');
const CreateZwatchEventPage = () => import(/*webpackChunkName: 'CREATEZWATCHEVENTPAGE'*/'src/om/zwatchalarm/CreateZwatchEventPage');
const ZwatchAlarmDetailPage = () => import(/*webpackChunkName: 'ZWATCHALARMDETAILPAGE'*/'src/om/zwatchalarm/detail/ZwatchAlarmDetailPage');
const ZwatchSNSTextTemplatePage = () =>  import(/*webpackChunkName：'ZWATCHSNSTEXTTEMPLATEPAGE'*/'src/om/zwatchsnstexttemplate/ZwatchSNSTextTemplatePage') ;
const CreateZwatchSNSTextTemplatePage = () => import(/*webpackChunkName: 'CREATEZWATCHSNSTEXTTEMPLATEPAGE'*/'src/om/zwatchsnstexttemplate/CreateZwatchSNSTextTemplatePage');
const ZwatchSNSTextTemplateDetailPage = () => import(/*webpackChunkName: 'ZWATCHSNSTEXTTEMPLATEDETAILPAGE'*/'src/om/zwatchsnstexttemplate/detail/ZwatchSNSTextTemplateDetailPage');
const ZwatchEndPointPage = () => import(/*webpackChunkName: 'ZWATCHENDPOINTPAGE'*/'src/om/zwatchEndPoint/ZwatchEndPointPage');
const CreateZwatchEndPointPage = () => import(/*webpackChunkName: 'CREATEZWATCHENDPOINTPAGE'*/'src/om/zwatchEndPoint/CreateZwatchEndPointPage');
const ZwatchEndPointDetailPage = () => import(/*webpackChunkName: 'ZWATCHENDPOINTDETAILPAGE'*/'src/om/zwatchEndPoint/detail/ZwatchEndPointDetailPage');
const MessageCenterPage = () => import(/*webpackChunkName: 'MESSAGECENTERPAGE'*/'src/om/messageCenter/MessageCenterPage');
const MessageCenterDetailPage = () => import(/*webpackChunkName: 'MESSAGECENTERDETAILPAGE'*/'src/om/messageCenter/detail/MessageCenterDetailPage');
const OperationLogPage = () => import(/*webpackChunkName: 'OPERATIONLOGPAGE'*/'src/om/operationlog/OperationLogPage');
const OperationLogDetailPage = () => import(/*webpackChunkName: 'OPERATIONLOGDETAILPAGE'*/'src/om/operationlog/detail/OperationLogDetailPage');
const ResourceStackPage = () => import(/*webpackChunkName: 'RESOURCESTACKPAGE'*/'src/om/resourceStack/ResourceStackPage');
const CreateResourceStackPage = () => import(/*webpackChunkName: 'CREATERESOURCESTACKPAGE'*/'src/om/resourceStack/create/CreateResourceStackPage');
const ResourceStackDetailPage = () => import(/*webpackChunkName: 'RESOURCESTACKDETAILPAGE'*/'src/om/resourceStack/detail/ResourceStackDetailPage');
const ResourceTemplatePage = () => import(/*webpackChunkName: 'RESOURCETEMPLATEPAGE'*/'src/om/resourceTemplate/ResourceTemplatePage');
const CreateResourceTemplatePage = () => import(/*webpackChunkName: 'CREATERESOURCETEMPLATEPAGE'*/'src/om/resourceTemplate/create/CreateResourceTemplatePage');
const ResourceTemplateDetailPage = () => import(/*webpackChunkName: 'RESOURCETEMPLATEDETAILPAGE'*/'src/om/resourceTemplate/detail/ResourceTemplateDetailPage');
const SysResourceStackTemplatePage = () => import(/*webpackChunkName: 'SYSRESOURCESTACKTEMPLATEPAGE'*/'src/om/sysResourceStackTemplate/SysResourceStackTemplatePage');
const SysResourceStackTemplateDetailPage = () => import(/*webpackChunkName: 'SYSRESOURCESTACKTEMPLATEDETAILPAGE'*/'src/om/sysResourceStackTemplate/detail/SysResourceStackTemplateDetailPage');

const DataBasePage = () => import(/*webpackChunkName: 'DATABASEPAGE'*/'../src/database/DatabaseMain');
const OraclePage  = () => import(/*webpackChunkName: 'ORACLEPAGE'*/'../src/database/oracle/OraclePage');
//vCenter
const VcenterPage = () => import(/*webpackChunkName:'VCENTERPAGE'*/'../src/vcenter/VcenterMain');
const ResourcePage = () => import(/*webpackChunkName:'RESCOURCEPAGE'*/'../src/vcenter/resource/ResourcePage');
const CreateResourcePage = () => import(/*webpackChunkName: 'CREATERESOURCEPAGE'*/'../src/vcenter/resource/create/CreateResourcePage');
const ResourceDetailPage = () => import(/*webpackChunkName: 'RESOURCEDETAILPAGE'*/'../src/vcenter/resource/detail/ResourceDetailPage');
const VCenterVmInstancePage = () => import(/*webpackChunkName: 'VCENTERVMINSTANCEPAGE'*/'../src/vcenter/vCenterVmInstance/VCenterVmInstancePage');
const CreateVcenterVmInstancePage = () => import(/*webpackChunkName: 'CREATEVCENTERVMINSTANCEPAGE'*/'../src/vcenter/vCenterVmInstance/create/CreateVcenterVmInstancePage');
const vCenterVmInstanceDetailPage = () => import(/*webpackChunkName: 'VCENTERVMINSTANCEDETAILPAGE'*/'../src/vcenter/vCenterVmInstance/detail/vCenterVmInstanceDetailPage');
const vCenterNetWorkPage = () => import(/*webpackChunkName:'VCENTERNETWORKPAGE'*/'../src/vcenter/vCenterNetWork/vCenterNetWorkPage');
const CreatevCenterNetWorkPage = () => import(/*webpackChunkName: 'CREATEVCENTERNETWORKPAGE'*/'../src/vcenter/vCenterNetWork/create/CreatevCenterNetWorkPage')
const vCenterNetworkDetailPage = () => import(/*webpackChunkName: 'VCENTERNETWORKDETAILPAGE'*/'../src/vcenter/vCenterNetWork/detail/vCenterNetworkDetailPage');
const vCenterVolumePage = () => import(/*webpackChunkName:'VCENTERVOLUMEPAGE'*/'../src/vcenter/vCenterVolume/vCenterVolumePage');
const CreatevCenterVolumePage = () => import(/*webpackChunkName: 'CREATEVCENTERVOLUMEPAGE'*/'../src/vcenter/vCenterVolume/create/CreatevCenterVolumePage');
const vCenterVolumeDetailPage = () => import(/*webpackChunkName: 'VCENTERVOLUMEDETAILPAGE'*/'../src/vcenter/vCenterVolume/detail/vCenterVolumeDetailPage');
const vCenterImagePage = () => import(/*webpackChunkName: 'VCENTERIAMGEPAGE'*/'../src/vcenter/vCenterImage/vCenterImagePage');
const CreatevCenterImagePage  = () => import(/*webpackChunkName: 'CREATEVCENTERIMAGEPAGE'*/'../src/vcenter/vCenterImage/create/CreatevCenterImagePage');
const vCenterImageDetailPage = () => import(/*webpackChunkName: 'VCENTERDETAILPAGE'*/'../src/vcenter/vCenterImage/detail/vCenterImageDetailPage');
const vCenterMessagePage = () => import(/*webpackChunkName: 'VCENTERMESSAGEPAGE'*/'../src/vcenter/vCenterMessage/vCenterMessagePage');

const AliCloudPage = () => import(/*webpackChunkName: 'ALICLOUDPAGE'*/'../src/alicloud/AlicloudMain');
const HybridkeysecretPage = () => import(/*webpackChunkName: 'HYBRIDKEYSECRETPAGE'*/'../src/alicloud/accesskey/HybridkeysecretPage');
const TencentPage = () => import(/*webpackChunkName: 'TENCENTPAGE'*/'../src/tencent/TencentMain');
const SecretkeyPage = () => import(/*webpackChunkName: 'SECRETKEYPAGE'*/'../src/tencent/secretkey/SecretkeyPage');
const HuaweiPage = () => import(/*webpackChunkName: 'HUAWEIPAGE'*/'../src/huaweicloud/HuaweiCloudMain');

//LoadBalacne
const LoadBalancerPage = () =>import(/*webpackChunkName:"LOADBALANCERPAGE"*/'../src/network/loadBalancer/LoadBalancerPage')
const CreateLoadBalancerPage = () => import(/*webpackChunkName:"CREATELOADBALANCERPAGE"*/'src/network/loadBalancer/CreateLoadBalancer.vue')
const LoadBalancerDetail = () => import(/*webpackChunkName:"LOADBALANCERDETAIL"*/'src/network/loadBalancer/Detail.vue')

const LoadBalancerListener = ()  =>  import(/*webpackChunkName:"LOADBALANCERLISTENER"*/ 'src/network/loadBalancerListener/LoadBalancerListenerPage.vue')
const LoadBalancerListenerDetail = ()  =>  import(/*webpackChunkName:"LOADBALANCERLISTENER"*/ 'src/network/loadBalancerListener/LoadBalancerListenerDetailPage.vue')
const CreateLoadBalancerListener = ()  =>  import(/*webpackChunkName:"LOADBALANCERLISTENER"*/ 'src/network/loadBalancerListener/CreateLoadBalancerListenerPage.vue')

//大屏监控
const OverviewPage = () => import(/*webpackChunkName: 'OVERVIEWPAGE'*/'src/overview/OverviewPage');

//阿里云
const CreateAliCloudAccessKey = () =>  import(/*webpackChunkName: "CREATEALICLOUDACCESSKEY"*/'../src/alicloud/accesskey/create/CreateAliCloudAccessKey');
const DetailHybridKeySecretPage = () => import(/*webpackChunkName: "DETAILHYBRIDKEYSECRETPage"*/'../src/alicloud/accesskey/detail/DetailHybridkeySecret');
const HybridAliCloudDataCenterPage = () => import(/*webpackChunkName: "HYBRIDALICLOUDDATACENTERPAGE"*/'../src/alicloud/dataCenter/HybridAliCloudDataCenterPage');
const HybridAliCloudDataCenterCreatePage = () => import(/*webpackChunkName: "HYBRIDALICLOUDATACENTERCREATEPAGE"*/'../src/alicloud/dataCenter/create/HybridAliCloudDataCenterCreatePage');
const HybridAliCloudDataCenterDetailPage = () => import(/*webpackChunkName: "HYBIRDALICLOUDDATACENTERDETAILPAGE"*/'../src/alicloud/dataCenter/detail/HybridAliCloudDataCenterDetailPage');
const HybridAliCloudIdentityZonePage = () => import(/*webpackChunkName: "HYBIRDALICLOUDIDENTITYZONEPAGE"*/'../src/alicloud/identityZone/HybridAliCloudIdentityZonePage');
const HybridAliCloudIdentityZoneCreatePage = () => import(/*webpackChunkName: 'HYBRIDALICLOUDIDENTITYZONECREATEPAGE'*/'../src/alicloud/identityZone/HybridAliCloudIdentityZoneCreatePage');
const HybridAliCloudIdentityZoneDetailPage = () => import(/*webpackChunkName: 'HYBRIDALICLOUDIDENTITYZONEDETAILPAGE'*/'../src/alicloud/identityZone/detail/HybridAliCloudIdentityZoneDetailPage');
const HybridAliCloudConfigPage = () => import(/*webpackChunkName:'HYBRIDALICLOUDCONFIGPAGE'*/'../src/alicloud/hybridConfig/HybridAliCloudConfigPage');
const HybridAliCloudAboutPage = () => import(/*webpackChunkName: 'HYBRIDALICLOUDABOUTPAGE'*/'../src/alicloud/hybridAbout/HybridAliCloudAboutPage');
const HybridAliCloudEcsPage = () => import(/*webpackChunkName: 'HYBRIDALICLOUDECSPAGE'*/'../src/alicloud/hybridEcs/HybridAliCloudEcsPage');
const CreateHybridAliCloudEcsPage = () => import(/*webpackChunkName: 'CREATEHYBRIDALICLOUDESCPAGE'*/'../src/alicloud/hybridEcs/CreateHybridAliCloudEcsPage');
const HybirdAliCloudImagePage = () => import(/*webpackChunkName: 'HYBRIDALICLOUDIMAGEPAGE'*/'../src/alicloud/hybridImage/HybridAliCloudImagePage');
const HybridAliCloudSecurityGroupPage = () => import(/*webpackChunkName: 'HYBRIDALICLOUDSECURITYGROUPPAGE'*/'../src/alicloud/hybridAliCloudSecurityGroup/HybridAliCloudSecurityGroupPage');
const CreateHybridAliCloudImagePage = () => import(/*webpackChunkName: 'CREATEHYBIRDALICLOUDIMAGEPAGE'*/'../src/alicloud/hybridImage/create/CreateHybridAliCloudImagePage');
const DetailHybridAliCloudImagePage = () => import(/*webpackChunkName: 'DETAILHYBRIDALICLOUDIMAGEPAGE'*/'../src/alicloud/hybridImage/detail/DetailHybridAliCloudImagePage');
const CreateHybridAliCloudSecurityGroupPage = () => import(/*webpackChunkName: 'CREATEHYBRIDALICLOUDSECURITYGROUPPAGE'*/'../src/alicloud/hybridAliCloudSecurityGroup/create/CreateHybridAliCloudSecurityGroupPage');
const DetailHybridAliCloudSecurityGroupPage = () => import(/*webpackChunkName: 'DETAILHYBRIDALICLOUDSECURITYGROUPPAGE'*/'../src/alicloud/hybridAliCloudSecurityGroup/detail/DetailHybridAliCloudSecurityGroupPage');
const HybridAliCloudDiskPage = () => import(/*webpackChunkName:'HYBRIDALICLOUDDISKPAGE'*/'../src/alicloud/hybridDisk/HybridAliCloudDiskPage');
const HybridAliCloudVpcPage = () => import(/*webpackChunkName: 'HYBRIDALICLOUDVPCPAGE'*/'../src/alicloud/hybridVpc/HybridAliCloudVpcPage');
const DetailHybridAliCloudEcsPage = () => import(/*webpackChunkName: 'DETAILHYBRIDALICLOUDESPAGE'*/'../src/alicloud/hybridEcs/detail/DetailHybridAliCloudEcsPage');
const CreateHybridAliCloudDiskPage = () => import(/*webpackChunkName: 'CREATEHYBRIDALICLOUDDISKPAGE'*/'../src/alicloud/hybridDisk/create/CreateHybridAliCloudDiskPage');
const HybridAliCloudDiskDetailPage = () => import(/*webpackChunkName: 'HYBIRDALICLOUDDISKDETIALPAGE'*/'../src/alicloud/hybridDisk/detail/HybridAliCloudDiskDetailPage');
const CreateHybridAliCloudVpcPage = () => import(/*webpackChunkName: 'CREATEHYBRIDALICLOUDVPCPAGE'*/'../src/alicloud/hybridVpc/create/CreateHybridAliCloudVpcPage');
const DetailHybridAliCloudVpcPage = () => import(/*webpackChunkName: 'DETAILHYBRIDALICLOUDVPCPAGE'*/'../src/alicloud/hybridVpc/detail/DetailHybridAliCloudVpcPage');
const HybridAliCloudEipPage = () => import(/*webpackChunkName: 'HYBRIDALICLOUDEIPPAGE'*/'../src/alicloud/hybridEip/HybridAliCloudEipPage');
const CreateHybridAliCloudEipPage = () => import(/*webpackChunkName: 'CREATEHYBRIDALICLOUDEIPPAGE'*/'../src/alicloud/hybridEip/create/CreateHybridAliCloudEipPage');
const DetailHybridAliCloudEipPage = () => import(/*webpackChunkName: 'DETAILHYBRIDALICLOUDEIPPAGE'*/'../src/alicloud/hybridEip/detail/DetailHybridAliCloudEipPage');
const HybridAliCloudVpcVpnGatewayPage = () => import(/*webpackChunkName: 'HYBRIDALICLOUDVPCVPNGATEWAYPAGE'*/'../src/alicloud/hybridVpcGateway/HybridAliCloudVpnGatewayPage');
const HybridAliCloudUserVpcVpnGatewayPage = () => import(/*webpackChunkName: 'HYBRIDALICLOUDUSERVPCVPNGATEWAYPAGE'*/'../src/alicloud/hybridUserVpnGateway/HybridAliCloudUserVpcVpnGatewayPage');
const CreateHybridAliCloudUserVpcVpnGatewayPage = () => import(/*webpackChunkName: 'CREATEHYBRIDALICLOUDUSERVPCVPNGATEWAYPAGE'*/'../src/alicloud/hybridUserVpnGateway/create/CreateHybridAliCloudUserVpcVpnGatewayPage');
const DetailHybridAliCloudUserVpcVpnGatewayPage = () => import(/*webpackChunkName: 'DETAILHYBRIDALICLOUDUSERVPCVPNGATEWAYPAGE'*/'../src/alicloud/hybridUserVpnGateway/detail/DetailHybridAliCloudUserVpcVpnGatewayPage');
const HybridAliCloudVpcVpnConnectionPage = () => import(/*webpackChunkName: 'HYBRIDALICLOUDVPCVPNCONNECTIONPAGE'*/'../src/alicloud/hybridVpnConnection/HybridVpnAliCloudConnectionPage');
const CreateHybridAliCloudVpcVpnConnectionPage = () => import(/*webpackChunkName: 'CREATEHYBRIDALICLOUDVPCVPNCONNECTIONPAGE'*/'../src/alicloud/hybridVpnConnection/create/CreateHybridVpnAliCloudConnectionPage');
const DetailHybridAliCloudVpnGatewayPage = () => import(/*webpackChunkName: 'DETAILHYBRIDALICLOUDVPNGATEWAYPAGE'*/'../src/alicloud/hybridVpcGateway/detail/DetailHybridAliCloudVpnGatewayPage');
const DetailHybridAliCloudVpcVpnConnectionPage = () => import(/*webpackChunkName: 'DETAILHYBRIDALICLOUDVPCVPNCONNECTIONPAGE'*/'../src/alicloud/hybridVpnConnection/detail/DetailHybridVpnAliCloudConnectionPage');
const HybridAliCloudVirtualBorderRouterPage = () => import(/*webpackChunkName: 'HYBRIDALICLOUDVIRTUALBORDERROUTERPAGE'*/'../src/alicloud/hybridVirtualBorderRouter/HybridAliCloudVirtualBorderRouterPage');
const DetailHybridAliCloudVirtualBorderRouterPage = () => import(/*webpackChunkName: 'DETAILHYBRIDALICLOUDVIRTUALBORDERROUTERPAGE'*/'../src/alicloud/hybridVirtualBorderRouter/detail/DetailHybridAliCloudVirtualBorderRouterPage');
const HybridAliCloudVirtualRouterInterfacePage = () => import(/*webpackChunkName:'HYBRIDALICLOUDVIRTUALROUTERINTERFACEPAGE'*/'../src/alicloud/hybridVirtualRouterInterface/HybridAliCloudVirtualRouterInterfacePage');
const DetailHybridAliCloudVirtualRouterInterfacePage = () => import(/*webpackChunkName: 'DETAILHYBRIDALICLOUDVIRTUALROUTERINTERFACEPAGE'*/ '../src/alicloud/hybridVirtualRouterInterface/detail/DetailHybridAliCloudVirtualRouterInterfacePage');
const CreateHybridAliCloudVirtualRouterInterfacePage = () => import(/*webpackChunkName: 'CREATEHYBRIDALICLOUDVIRTUALROUTERINTERFACEPAGE'*/ '../src/alicloud/hybridVirtualRouterInterface/create/CreateHybridAliCloudVirtualRouterInterfacePage');
const HybridAliCloudFileSystemPage = () => import(/*webpackChunkName: 'HYBRIDALICLOUDFILESYSTEMPAGE'*/'../src/alicloud/hybridFileSystem/HybridAliCloudFileSystemPage');
const CreateHybridAliCloudFileSystemPage = () => import(/*webpackChunkName: 'CREATEHYBRIDALICLOUDFILESYSTEMPAGE'*/'../src/alicloud/hybridFileSystem/create/CreateHybridAliCloudFileSystemPage');
const HybridAliCloudFileSystemDetailPage = () => import(/*webpackChunkName: 'CREATEHYBRIDALICLOUDFILESYSTEMDETAILPAGE'*/'../src/alicloud/hybridFileSystem/detail/HybridAliCloudFileSystemDetailPage');
const HybridAliCloudAccessGroupPage = () => import(/*webpackChunkName:'HYBRIDALICLOUDACCESSGROUPPAGE'*/'../src/alicloud/hybridAccessGroup/HybridAliCloudAccessGroupPage');
const CreateHybridAliCloudAccessGroupPage = () => import(/*webpackChunkName:'CREATEHYBRIDALICLOUDACCESSGROUPPAGE'*/'../src/alicloud/hybridAccessGroup/create/CreateHybridAliCloudAccessGroupPage');

//腾讯云
const CreateTencentSecretKeyPage = () => import(/*webpackChunkName: 'CREATETENCENTSECRETKEYPAGE'*/'../src/tencent/secretkey/create/CreateTencentSecretKeyPage');
const DetailTencentSecretKeyPage = () => import(/*webpackChunkName: 'DETAILTENCENTSECRETKEYPAGE'*/'../src/tencent/secretkey/detail/DetailTencentSecretKeyPage');
const HybridTencentDataCenterPage = () => import(/*webpackChunkName: 'HYBRIDTENCENTDATACENTERPAGE'*/'../src/tencent/dataCenter/HybridTencentDataCenterPage');
const CreateHybridTencentDataCenterPage = () => import(/*webpackChunkName: 'CREATEHYBRIDTENCENTDATACENTERPAGE'*/'../src/tencent/dataCenter/create/CreateHybridTencentDataCenterPage');
const DetailHybridTencentDataCenterPage = () => import(/*webpackChunkNmae: 'DETAILHYBRIDTENCENTDATACENTERPAGE'*/'../src/tencent/dataCenter/detail/DetailHybridTencentDataCenterPage');
const HybridTencentIdentityZonePage =  () => import(/*webpackChunkName: 'HYBRIDTENCENTIDENGITYZONEPAGE'*/'../src/tencent/identityZone/HybridTencentIdentityZonePage');
const CreateHybridTencentIdentityZonePage = () => import(/*webpackChunkName: 'CREATEHYBRIDTENCENTIDENGITYZONEPAGE'*/'../src/tencent/identityZone/create/CreateHybridTencentIdentityZonePage');
const DetailHybridTencentIdentityZonePage = () => import(/*webpackChunkName: 'DETAILHYBRIDTENCENTIDENTITYZONEPAGE'*/'../src/tencent/identityZone/detail/DetailHybridTencentIdentityZonePage');
const HybridTencentDiskPage = () => import(/*webpackChunkName: 'HYBRIDTENCENTDISKPAGE'*/'../src/tencent/disk/HybridTencentDiskPage');
const CreateHybridTencentDiskPage = () => import(/*webpackChunkName: 'CREATEHYHBRIDTENCENTDISKPAGE'*/'../src/tencent/disk/create/CreateHybridTencentDiskPage');
const DetailHybridTencentDiskPage = () => import(/*webpackChunkName: 'DETAILTENCENTDISKPAGE'*/'../src/tencent/disk/detail/DetailHybridTencentDiskPage');
const HybridTencentVirtualPrivateCloudPage = () => import(/*webpackChunkName: 'HYBRIDTENCENTVIRTUALPRIVATECLOUDPAGE'*/'../src/tencent/vpc/HybridTencentVirtualPrivateCloudPage');
const CreateHybridTencentVirtualPrivateCloudPage = () => import(/*webpackChunkName: 'CREATEHYBRIDTENCENTVIRTUALPRIVATECLOUDPAGE'*/'../src/tencent/vpc/create/CreateHybridTencentVirtualPrivateCloudPage');
const DetailHybridTencentVirtualPrivateCloudPage = () => import(/*webpackChunkName: 'DETAILHYBRIDTENCENTVIRTUALPRIVATECLOUDPAGE'*/'../src/tencent/vpc/detail/DetialHybridTencentVirtualPrivateCloudPage');
const HybridTenCentImagePage = () => import(/*webpackChunkName: 'HYBRIDTENCENTIMAGEPAGE'*/'../src/tencent/hybridImage/HybridTencentImagePage');
const HybridTencentSecurityGroupPage = () => import(/*webpackChunkName: 'HYBRIDTENCENTSECURITYGROUPPAGE'*/'../src/tencent/securityGroup/HybridTencentSecurityGroupPage');
const CreateHybridTencentSecurityGroupPage = () => import(/*webpackChunkName: 'CREATEHYBRIDTENCENTSECURITYGROUPPAGE'*/'../src/tencent/securityGroup/create/CreateHybridTencentSecurityGroupPage');
const DetailHybridTencentSecurityGroupPage = () => import(/*webpackChunkName: 'DETAILHYBRIDTENCENTSECURITYGROUPPAGE'*/'../src/tencent/securityGroup/detail/DetailHybridTencentSecrityGroupPage');
const HybridTencentEcsPage = () => import(/*webpackChunkName: 'HYBRIDTENCENTECSPAGE'*/'../src/tencent/ecs/HybridTencentEcsPage');
const CreateHybridTencentEcsPage = () => import(/*webpackChunkName: 'CREATEHYBRIDTENCENTECSPAGE'*/'../src/tencent/ecs/create/CreateHybridTencentEcsPage');
const DetailHybridTencentEcsPage = () => import(/*webpackChunkName: 'DETAILHYBRIDTENCENTECSPAGE'*/'../src/tencent/ecs/detail/DetailHybridTencentEcsPage');
const HybridTencentEipPage = () => import(/*webpackChunkName: 'HYBRIDTENCENTEIPPAGE'*/'../src/tencent/eip/HybridTencentEipPage');
const CreateHybridTencentEipPage = () => import(/*webpackChunkName: 'CREATEHYBRIDTENCENTEIPPAGE'*/'../src/tencent/eip/create/CreateHybridTencentEipPage');
const DetialHybridTencentEipPage = () => import(/*webpackChunkName: 'DETAILHYBRIDTENCENTEIPPAGE'*/'../src/tencent/eip/detail/DetailHybridTencentEipPage');
const HybridTencentVpcVpnGateWayPage =  () => import(/*webpackChunkName: 'HYBRIDTENCENTVPCVPNGATEWAYPAGE'*/'../src/tencent/vpnGateWay/HybridTencentVpnGateWayPage');
const DetailHybridTencentVpcVpnGateWayPage =  () => import(/*webpackChunkName: 'DETAILHYBRIDTENCENTVPCVPNGATEWAYPAGE'*/'../src/tencent/vpnGateWay/detail/DetailHybridTencentVpnGateWayPage');
const CreateTencentImagePage = () => import(/*webpackChunkName: 'CREATETENCENTIMAGEPAGE'*/'../src/tencent/hybridImage/create/CreateTencentImagePage');
const DetailTencentImagePage = () => import(/*webpackChunkName: 'DETAILTENCENTIMAGEPAGE'*/'../src/tencent/hybridImage/detail/DetailHybridTencentImagePage');
const HybridTencentVpnUserGateWay = () => import(/*webpackChunkName: 'HYBRIDTENCENTVPNUSERGATEWAY'*/'../src/tencent/vpnUserGateWay/HybridTencentVpnUserGateWayPage');
const CreateHybridTencentVpnUserGateWay = () => import(/*webpackChunkName: 'CREATEHYBRIDTENCENTVPNUSERGATEWAY'*/'../src/tencent/vpnUserGateWay/create/CreateHybridTencentVpnGateWayPage');
const DetailHybridTencentVpnUserGateWay = () => import(/*webpackChunkName: 'DETAILHYBRIDTENCENTVPNUSERGATEWAY'*/'../src/tencent/vpnUserGateWay/detail/DetailHybridTencentVpnUserGateWayPage');
const HybridTencentVpnConnectionPage = () => import(/*webpackChunkName: 'HYBRIDTENCENTVPNCONNECTIONPAGE'*/'../src/tencent/vpnConnection/HybridTencentVpnConnectionPage');
const CreateHybridTencentVpnConnectionPage = () => import(/*webpackChunkName: 'CREATEHYBRIDTENCENTVPNCONNECTIONPAGE'*/'../src/tencent/vpnConnection/create/CreateHybridTencentVpnConnectionPage');
const DetailHybridTencentVpnConnectionPage = () => import(/*webpackChunkName: 'DETAILHYBRIDTENCENTVPNCONNECTIONPAGE'*/'../src/tencent/vpnConnection/detail/DetailHybridTencentVpnConnectionPage');
const GlobalSettingsPage = () => import(/*webpackChunkName: 'GLOBALSETTINGSPAGE'*/'../src/om/globalSettings/GlobalSettingsPage');


//华为云
/* aksk
* */
const HuaweiAccountPage = () => import(/*webpackChunkName: 'HUAWEICLOUD'*/'../src/huaweicloud/account/AccountPage');
//添加华为云AccontKey
const CreateHuaweiAccountPage = () => import(/*webpackChunkName:'HUAWEICLOUD'*/'../src/huaweicloud/account/create/CreateHuaweiAccountPage');
//AccountKey详情
const DetailHybridHuaweiAccountPage = () => import(/*webpackChunkName: 'HUAWEICLOUD'*/'../src/huaweicloud/account/detail/DetailHuaweiCloudAccountPage');
//地域列表
const HuaweiDataCenterPage = () => import(/*webpackChunkName: 'HUAWEIDATACENTERPAGE'*/'../src/huaweicloud/dataCenter/HuaweiDataCenterPage');
//添加华为云地域
const CreateHuaweiDataCenterPage = () => import(/*webpackChunkName: 'CREATEHUAWEIDATACENTERPAGE'*/'../src/huaweicloud/dataCenter/create/CreateHuaweiDataCenterPage');
//华为云地域详情
const DetailHuaweiDataCenterPage = () => import(/*webpackChunkName: 'DETAILHUAWEIDATACENTERPAGE'*/'../src/huaweicloud/dataCenter/detail/DetailHuaweiDataCenterPage');
//华为云可用区列表
const HybridHuaweiIdentityZonePage = () => import(/*webpackChunkName: 'HYBRIDHUAWEIIDENTITYZONEPAGE'*/'../src/huaweicloud/identityzone/HybridHuaweiIdentityZonePage');
//华为云添加可用区
const CreateHybridHuaweiIdentityZonePage = () => import(/*webpackChunkName: 'CREATEHYBRIDHUAWEIIDENTITYZONEPAGE'*/'../src/huaweicloud/identityzone/create/CreateHuaweiIdentityZonePage');
//可用区详情
const DetailHybridHuaweiIdentityZonePage = () => import(/*webpackChunkName: 'DETAILHYBRIDHUAWEIIDENTITYZONEPAGE'*/'../src/huaweicloud/identityzone/detail/DetailHybridHuaweiIdentityZonePage');
//华为云云主机
const HybridHuaweiEcsPage = () => import(/*webpackChunkName: 'HYBRIDHUAWEIECSPAGE'*/'../src/huaweicloud/ecsInstance/HybridHuaweiEcsPage');
//创建华为云云主机
const CreateHybridHuaweiEcsPage = () => import(/*webpackChunkName: 'CREATEHYBRIDHUAWEIECSPAGE'*/'../src/huaweicloud/ecsInstance/create/CreateHybridHuaweiEcsPage');
//华为云ECS详情
const DetailHybridHuaweiEcsPage = () => import(/*webpackChunkName: 'DETAILHYBRIDHUAWEIECSPAGE'*/'../src/huaweicloud/ecsInstance/detail/DetailHybridHuaweiEcsPage');
//华为云云盘列表
const HybridHuaweiDiskPage = () => import(/*webpackChunkName: 'HYBRIDHUAWEIDISKPAGE'*/'../src/huaweicloud/disk/HybridHuaweiDiskPage');
//华为云创建云盘
const CreateHybridHuaweiDiskPage =  () => import(/*webpackChunkName: 'CREATEHYBRIDHUAWEIDISKPAGE'*/'../src/huaweicloud/disk/create/CreateHybridHuaweiDiskPage');
//华为云云盘详情
const DetailHybridHuaweiDiskPage = () => import(/*webpackChunkName: 'DETAILHYBRIDHUAWEIDISKPAGE'*/'../src/huaweicloud/disk/detail/DetailHybridHuaweiDiskPage');
//华为云镜像
const HybridHuaweiImagePage = () => import(/*webpackChunkName: 'HYBRIDHUAWEIIMAGEPAGE'*/'../src/huaweicloud/image/HybridHuaweiImagePage');
//创建华为云镜像
const CreateHybridHuaweiImagePage = () => import(/*webpackChunkName: 'CREATEhYBRIDHUAWEIIMAGEPAGE'*/'../src/huaweicloud/image/create/CreateHybridHuaweiImagePage');
//华为云安全组列表
const HybridHuaweiSecurityGroupPage = () => import(/*webpackChunkName: 'HYBRIDHUAWEISECURITYGROUPPAGE'*/'../src/huaweicloud/securityGroup/SecurityGroupPage');
//华为云安全组创建
const CreateHybridHuaweiSecurityGroupPage = () => import(/*webpackChunkName: 'CREATEHYBRIDHUAWEISECURITYGROUPPAGE'*/'../src/huaweicloud/securityGroup/create/CreateSecurityGroupPage');
//华为云安全组详情
const DetailHybridHuaweiSecurityGroupPage = () => import(/*webpackChunkName: 'DETAILHYBRIDHUAWEISECURITYGROUPPAGE'*/'../src/huaweicloud/securityGroup/detail/HybridHuaweiSecurityGroupDetailPage');
//华为云vpc
const HybridHuaweiCloudVpcPage = () => import(/*webapckChunkName: 'HYBRIDHUAWEICLOUDVPCPAGE'*/'../src/huaweicloud/vpc/HybridHuaweiCloudVpcPage');
//创建华为云vpc
const CreateHybridHuaweiCloudVpcPage = () => import(/*webapckChunkName: 'CREATEHYBRIDHUAWEICLOUDVPCPAGE'*/'../src/huaweicloud/vpc/create/CreateHybridHuaweiCloudVpcPage');
//华为云vpc详情
const HybridHuaweiCloudVpcDetailPage = () => import(/*webpackChunkName: 'DETAILHYBRIDHUAWEICLOUDVPCDETAILPAGE'*/'../src/huaweicloud/vpc/detail/HybridHuaweiCloudVpcDetailPage.vue');
//华为云弹性EIp列表
const HybridHuaweiEipPage = () => import(/*webapckChunkName: 'HYBRIDHUAWEIEIPPAGE'*/'../src/huaweicloud/eip/HybridHuaweiEipPage.vue');
//添加华为云弹性Eip
const CreateHybridHuaweiEipPage = () => import(/*webapckChunkName: 'CREATEHYBRIDHUAWEIEIPPAGE'*/'../src/huaweicloud/eip/create/CreateHybridHuaweiEipPage.vue');
//华为云弹性EIp详情
const DetailHybridHuaweiEipPage = () => import(/*webapckChunkName: 'DETAILHYBRIDHUAWEIEIPPAGE'*/'../src/huaweicloud/eip/detail/HybridHuaweiEipDetailPage.vue');
//华为云镜像详情
const HybridHuaweiImageDetailPage = () => import(/*webpackChunkName: 'HYBRIDHUAWEIIMAGEDETAILPAGE'*/'../src/huaweicloud/image/detail/HybridHuaweiImageDetialPage.vue');

const ecsMenus =  [
  {
    path: 'vm',
    name: 'vm',
    component: EcsInstancePage,
    meta: {
      title: '云主机'
    }
  },
  {
    path: 'detailVm/:uuid',
    name: 'detailVm',
    component: VMDetailPage,
    meta: {
      title:'云主机详情'
    }
  },
  {
    path: "createvm",
    name: "createvm",
    component: CreateInstancePage,
    meta: {
      title:'创建云主机'
    }
  },
  {
    path: 'home',
    name: 'home',
    component: Home,
    meta: {
      title:'首页'
    }
  },
  {
    path: 'about',
    name: 'about',
    component: AboutPage,
    meta: {
      title: '关于'
    }
  },
  {
    path: 'volume',
    name: 'volume',
    component: VolumePage,
    meta: {
      title: '云盘'
    }
  },
  {
    path: 'createvolume',
    name: 'createvolume',
    component: CreateVolumePage,
    meta: {
      title: '创建云盘'
    }
  },
  {
    path: 'detailVolume/:uuid',
    name: 'detailVolume',
    component: VolumeDetailPage,
    meta: {
      title: '云盘详情'
    }
  },
  {
    path: 'image',
    name: 'image',
    component: ImagePage,
    meta: {
      title: '镜像列表'
    }
  },
  {
    path: 'createImage',
    name: 'createImage',
    component: CreateImagePage,
    meta: {
      title: '创建镜像'
    }
  },
  {
    path: 'detailImage/:uuid/:currTab',
    name: 'detailImage',
    component: ImageDetailPage,
    meta: {
      title: '镜像详情'
    }
  },
  {
    path: 'affinitygroup',
    name: 'affinitygroup',
    component: AffinitygroupPage,
    meta: {
      title: '亲和组'
    }
  },
  {
    path: 'createAffinityGroup',
    name: 'createAffinityGroup',
    component: CreateAffinityGroupPage,
    meta: {
      title: '创建亲和组'
    }
  },
  {
    path: 'detailAffinityGroup/:uuid',
    name: 'detailAffinityGroup',
    component: AffinityGroupDetailPage,
    meta: {
      title: '亲和组详情'
    }
  },
  {
    path: 'instanceoffering',
    name: 'instanceoffering',
    component: InstanceOfferingPage,
    meta: {
      title: '计算规格'
    }
  },
  {
    path: 'createInstanceOffering',
    name: 'createInstanceOffering',
    component: CreateInstanceOfferingPage,
    meta: {
      title: '创建计算规格'
    }
  },
  {
    path: 'detailInstanceOffering/:uuid',
    name: 'detailInstanceOffering',
    component: InstanceOfferingDetailPage,
    meta: {
      title: '计算规格详情'
    }
  },
  {
    path: 'volumeoffering',
    name: 'volumeoffering',
    component: VolumeOfferingPage,
    meta: {
      title: '云盘规格'
    }
  },
  {
    path: 'createVolumeOffering',
    name: 'createVolumeOffering',
    component: CreateVolumeOfferingPage,
    meta: {
      title: '创建云盘规格'
    }
  },
  {
    path: 'detailVolumeOffering/:uuid',
    name: 'detailVolumeOffering',
    component: VolumeOfferingDetailPage,
    meta: {
      title: '云盘规格详情'
    }
  },
  {
    path: 'autoscalinggroup',
    name: 'autoscalinggroup',
    component: AutoScalingGroupPage,
    meta: {
      title: '弹性伸缩组'
    }
  },
  {
    path: 'createAutoScalingGroup',
    name: 'createAutoScalingGroup',
    component: CreateAutoScalingGroupPage,
    meta: {
      title: '创建弹性伸缩组'
    }
  },
  {
    path: 'detailAutoScalingGroup/:uuid',
    name: 'detailAutoScalingGroup',
    component: AutoScalingGroupDetailPage,
    meta: {
      title: '弹性伸缩组详情'
    }
  },
  {
    path: 'wizard',
    name: 'wizard',
    component: WizardPage,
    meta: {
      title: '向导'
    }
  },
  {
    path: 'dbbackupwizard',
    name: 'dbbackupwizard',
    component: DbBackupWizard,
    meta: {
      title: '数据库恢复向导'
    }
  }
]

const networkMenus = [
  {
    path: 'vxlanpool',
    name: 'vxlanpool',
    component: VxlanPoolPage,
    meta: {
      title: 'Vxlanpool'
    }
  },
  {
    path: 'createvxlanpool',
    name: 'createvxlanpool',
    component: CreateVxlanPoolPage,
    meta: {
      title: 'CreateVxlanpool'
    }
  },
  {
    path:'detailvxlanpool/:uuid',
    name:'detailvxlanpool',
    component:VxlanPoolDetailPage,
    meta:{
      title:'vxlan pool详情'
    }
  },
  {
    path: 'vxlanpoolattachcluster',
    name: 'vxlanpoolattachcluster',
    component: VxlanNetworkPoolAttachCluster,
    meta: {
      title: '加载集群'
    }
  },
  {
    path: 'l2network',
    name: 'l2network',
    component: L2NetworkPage,
    meta: {
      title: '二层网络'
    }
  },
  {
    path: 'createl2network',
    name: 'createl2network',
    component: CreateL2NetworkPage,
    meta: {
      title: '创建二层网络'
    }
  },
  {
    path: 'detaill2network/:uuid',
    name: 'detaill2network',
    component: L2NetworkDetailPage,
    meta: {
      title: '二层网络详情'
    }
  },
  {
    path: 'publicnetwork',
    name: 'publicnetwork',
    component: PublicNetworkPage,
    meta: {
      title: '公有网络'
    }
  },
  {
    path: 'createpublicnetwork',
    name: 'createpublicnetwork',
    component: CreatePublicNetworkPage,
    meta: {
      title: '创建公有网络'
    }
  },
  {
    path: 'detailPublicNetwork/:uuid',
    name: 'detailPublicNetwork',
    component: L3NetworkDetailPage,
    meta: {
      title: '三层网络详情'
    }
  },
  {
    path: 'detailPrivateNetwork/:uuid',
    name: 'detailPrivateNetwork',
    component: L3NetworkDetailPage,
    meta: {
      title: '三层网络详情'
    }
  },
  {
    path: 'detailSystemNetwork/:uuid',
    name: 'detailSystemNetwork',
    component: L3NetworkDetailPage,
    meta: {
      title: '三层网络详情'
    }
  },
  {
    path: 'systemnetwork',
    name: 'systemnetwork',
    component: SystemNetworkPage,
    meta: {
      title: '系统网络'
    }
  },
  {
    path: 'createsystemnetwork',
    name: 'createsystemnetwork',
    component: CreateSystemNetworkPage,
    meta: {
      title: '创建系统网络'
    }
  },
  {
    path: 'privatenetwork',
    name: 'privatenetwork',
    component: PrivateNetworkPage,
    meta: {
      title: '私有网络'
    }
  },
  {
    path: 'createprivatenetwork',
    name: 'createprivatenetwork',
    component: CreatePrivateNetworkPage,
    meta: {
      title: '创建私有网络'
    }
  },
  {
    path: 'virtualrouter',
    name: 'virtualrouter',
    component: VirtualRouterPage,
    meta: {
      title: '云路由器'
    }
  },
  {
    path: 'detailVirtualRouter/:uuid',
    name: 'detailVirtualRouter',
    component: DetailVirtualRouterPage,
    meta: {
      title: '云路由详情'
    }
  },
  {
    path: 'vrouterroutetable',
    name: 'vrouterroutetable',
    component: VirtualRouterTablePage,
    meta: {
      title: '路由表'
    }
  },
  {
    path: 'createvrouterroutetable',
    name: 'createvrouterroutetable',
    component: CreateVirtualRouterTablePage,
    meta: {
      title: '创建路由表'
    }
  },
  {
    path: 'detailvrouterroutetable/:uuid',
    name: 'detailvrouterroutetable',
    component: VirtualRouterTableDetailPage,
    meta: {
      title: '路由表详情'
    }
  },
  {
    path: 'virtualrouteroffering',
    name: 'virtualrouteroffering',
    component: VirtualRouterOfferingPage,
    meta: {
      title: '云路由规格'
    }
  },
  {
    path: 'createvirtualrouteroffering',
    name: 'createvirtualrouteroffering',
    component: CreateVirtualRouterOfferingPage,
    meta: {
      title: '创建云路由规格'
    }
  },
  {
    path: 'detailvirtualrouteroffering/:uuid',
    name: 'detailvirtualrouteroffering',
    component: VirtualRouterOfferingDetailPage,
    meta: {
      title: '云路由规格详情'
    }
  },
  {
    path: 'virtualrouterimage',
    name: 'virtualrouterimage',
    component: VirtualRouterImagePage,
    meta: {
      title: '云路由镜像'
    }
  },
  {
    path: 'createvirtualrouterimage',
    name: 'createvirtualrouterimage',
    component: CreateVirtualRouterImagePage,
    meta: {
      title: '创建云路由镜像'
    }
  },
  {
    path: 'detailvirtualrouterimage/:uuid',
    name: 'detailvirtualrouterimage',
    component: VirtualRouterImageDetailPage,
    meta: {
      title: '云路由镜像详情'
    }
  },
  {
    path: 'vpcvrouter',
    name: 'vpcvrouter',
    component: VpcVRouterPage,
    meta: {
      title: 'VPC路由器'
    }
  },
  {
    path: 'createvpcvrouter',
    name: 'createvpcvrouter',
    component: CreateVpcVRouterPage,
    meta: {
      title: '创建VPC路由器'
    }
  },
  {
    path: 'detailVpcVRouter/:uuid',
    name: 'detailVpcVRouter',
    component: DetailVpcVRouterPage,
    meta: {
      title: 'VPC路由器详情'
    }
  },
  {
    path: 'vpcnetwork',
    name: 'vpcnetwork',
    component: VpcNetworkPage,
    meta: {
      title: 'VPC网络'
    }
  },
  {
    path: 'createvpcnetwork',
    name: 'createvpcnetwork',
    component: CreateVpcNetworkPage,
    meta: {
      title: '创建VPC网络'
    }
  },
  {
    path: 'detailvpcnetwork/:uuid',
    name: 'detailvpcnetwork',
    component: VpcNetworkDetailPage,
    meta: {
      title: 'VPC网络详情'
    }
  },
  {
    path: 'vip',
    name: 'vip',
    component: VipPage,
    meta: {
      title: '虚拟IP'
    }
  },
  {
    path: 'createvip',
    name: 'createvip',
    component: CreateVipPage,
    meta: {
      title: '创建虚拟IP'
    }
  },
  {
    path: 'detailvip/:uuid',
    name: 'detailvip',
    component: VipDetailPage,
    meta: {
      title: '虚拟IP详情'
    }
  },
  {
    path: 'eip',
    name: 'eip',
    component: EipPage,
    meta: {
      title: '弹性IP'
    }
  },
  {
    path: 'createeip',
    name: 'createeip',
    component: CreateEipPage,
    meta: {
      title: '创建弹性IP'
    }
  },
  {
    path: 'detaileip/:uuid',
    name: 'detaileip',
    component: EipDetailPage,
    meta: {
      title: '弹性IP详情'
    }
  },
  {
    path: 'portforwarding',
    name: 'portforwarding',
    component: PortForwardingPage,
    meta: {
      title: '端口转发'
    }
  },
  {
    path: 'createportforwarding',
    name: 'createportforwarding',
    component: CreatePortForwardingPage,
    meta: {
      title: '创建端口转发'
    }
  },
  {
    path: 'detailportforwarding/:uuid',
    name: 'detailportforwarding',
    component: PortForwardingDetailPage,
    meta: {
      title: '端口转发详情'
    }
  },
  {
    path:'loadbalancer',
    name:'loadbalancer',
    component:LoadBalancerPage,
    meta:{
      title:'负载均衡器'
    }
  },
  {
    path:'createloadbalancer',
    name:'createloadbalancer',
    component:CreateLoadBalancerPage,
    meta:{
      title:'创建负载均衡器'
    }
  },
  {
    path:'detailloadbalancer/:uuid',
    name:'detailloadbalancer',
    component:LoadBalancerDetail,
    meta:{
      title:'负载均衡详情'
    }
  },
  {
    path:'loadbalancerlistener',
    name:'loadbalancerlistener',
    component:LoadBalancerListener,
    meta:{
      title:'监听器'
    }
  },
  {
    path:'createloadbalancerlistener',
    name:'createloadbalancerlistener',
    component:CreateLoadBalancerListener,
    meta:{
      title:'创建监听器'
    }
  },
  {
    path:'detailloadbalancerlistener/:uuid',
    name:'detailloadbalancerlistener',
    component:LoadBalancerListenerDetail,
    meta:{
      title:'监听器详情'
    }
  },
  {
    path:'ipsec',
    name:'ipsec',
    component:IPsecPage,
    meta:{
      title:'IPsec隧道'
    }
  },
  {
    path:'createipsec',
    name:'createipsec',
    component:CreateIPsecPage,
    meta:{
      title:'创建IPsec隧道'
    }
  },
  {
    path: 'detailIPsec/:uuid',
    name: 'detailIPsec',
    component: DetailIPsecPage,
    meta: {
      title: 'IPsec详情'
    }
  }
]

const StorageMenus = [
  {
    path: 'primarystorage',
    name: 'primarystorage',
    component: PrimaryStoragePage,
    meta: {
      title: '主存储'
    }
  },
  {
    path: "createprimarystorage",
    name: "createprimarystorage",
    component: CreatePrimaryStoragePage,
    meta: {
      title:'创建主存储'
    }
  },
  {
    path: 'detailprimarystorage/:uuid',
    name: 'detailprimarystorage',
    component: PrimaryStorageDetailPage,
    meta: {
      title:  '主存储详情'
    }
  },
  {
    path: 'backupstorage',
    name: 'backupstorage',
    component: BackupStoragePage,
    meta: {
      title: '镜像服务器'
    }
  },
  {
    path: "createbackupstorage",
    name: "createbackupstorage",
    component: CreateBackupStoragePage,
    meta: {
      title:'创建镜像服务器'
    }
  },
  {
    path: 'detailbackupstorage/:uuid',
    name: 'detailbackupstorage',
    component: BackupStorageDetailPage,
    meta: {
      title:  '镜像服务器详情'
    }
  },
  {
    path: 'sanstorage',
    name: 'sanstorage',
    component: SanStoragePage,
    meta: {
      title: 'SAN存储'
    }
  },
  {
    path: "createsanstorage",
    name: "createsanstorage",
    component: CreateIscsiSanStoragePage,
    meta: {
      title:'添加iSCSI服务器'
    }
  },
  {
    path: 'detailsanstorage/:uuid',
    name: 'detailsanstorage',
    component: SanStorageDetailPage,
    meta: {
      title:  'SAN存储详情'
    }
  }
]

const SecurityMenus = [
  {
    path: 'securitygroup',
    name: 'securitygroup',
    component: SecurityGroupPage,
    meta: {
      title: '安全组'
    }
  },
  {
    path: "createsecuritygroup",
    name: "createsecuritygroup",
    component: CreateSecurityGroupPage,
    meta: {
      title:'创建安全组'
    }
  },
  {
    path: "detailsecuritygroup/:uuid",
    name: "detailsecuritygroup",
    component: SecurityGroupDetailPage,
    meta: {
      title:'安全组详情'
    }
  }
]

const OMMenus = [
  {
    path: 'zone',
    name: 'zone',
    component: ZonePage,
    meta: {
      title: '区域'
    }
  },
  {
    path:'cluster',
    name:'cluster',
    component:ClusterPage,
    meta:{
      title:'集群'
    }
  },
  {
    path: 'createSchedulerJob/:resourceType/:resourceUuid',
    name: 'createSchedulerJob',
    component: CreateSchedulerPage,
    meta: {
      title:  '定时任务'
    }
  },
  {
    path: 'createSchedulerJob',
    name: 'createSchedulerJob',
    component: CreateSchedulerPage,
    meta: {
      title:  '定时任务'
    }
  },
  {
    path: 'detailZone/:uuid',
    name: 'detailZone',
    component: OpenZoneDetailPage,
    meta: {
      title:  '区域详情'
    },
  },
  {
    path: 'createzone',
    name: 'createzone',
    component: OpenCreateZonePage,
    meta: {
      title:  '创建区域'
    },
  },
  {
    path:'createCluster',
    name:'createCluster',
    component:OpenCreateClusterPage,
    meta:{
      title:'创建集群'
    }
  },
  {
    path: 'detailCluster/:uuid',
    name: 'detailCluster',
    component: ClusterDetailpage,
    meta: {
      title:  '集群详情'
    },
  },
  {
    path: 'host',
    name: 'host',
    component: HostPage,
    meta: {
      title: '物理机'
    }
  },
  {
    path: 'createHost',
    name: 'createHost',
    component: CreateHostPage,
    meta: {
      title: '创建物理机'
    }
  },
  {
    path: 'detailHost/:uuid',
    name: 'detailHost',
    component: HostDetailPage,
    meta: {
      title: '物理机详情'
    }
  },
  {
    path: 'account',
    name: 'account',
    component: AccountPage,
    meta: {
      title: '账户'
    }
  },
  {
    path: 'createAccount',
    name: 'createAccount',
    component: createAccountPage,
    meta: {
      title: '创建账户'
    }
  },
  {
    path:  'detailAccount/:uuid',
    name: 'detailAccount',
    component: AccountDetailPage,
    meta: {
      title: '账户详情'
    }
  },
  {
    path: 'user',
    name: 'user',
    component: UserPage,
    meta: {
      title:'用户列表'
    }
  },
  {
    path: 'createUser',
    name: 'createUser',
    component: CreateUserPage,
    meta: {
      title: '创建用户'
    }
  },
  {
    path: 'detailUser/:uuid',
    name: 'detailUser',
    component: UserDetailPage,
    meta: {
      title: '用户详情'
    }
  },
  {
    path: 'groupuser',
    name: 'groupuser',
    component: UserGroupPage,
    meta: {
      title: '用户组'
    }
  },
  {
    path: 'createGroupUser',
    name: 'createGroupUser',
    component: CreateUserGroupPage,
    meta: {
      title: '创建用户组'
    }
  },
  {
    path: 'detailGroupUser/:uuid',
    name: 'detailGroupUser',
    component: GroupUserDetailPage,
    meta: {
      title: '用户组详情'
    }
  },
  {
    path: 'billing',
    name: 'billing',
    component: BillingPage,
    meta: {
      title: '账单'
    }
  },
  {
    path: 'detailBilling/:uuid',
    name: 'detailBilling',
    component: BillingDetailPage,
    meta: {
      title: '账单详情'
    }
  },
  {
    path: 'billingsettings',
    name: 'billingsettings',
    component: BillingSettingsPage,
    meta: {
      title: '计费设置'
    }
  },
  {
    path: 'createBillingSettings/:type/:gpuModels',
    name: 'createBillingSettings',
    component: CreateBillingSettingsPage,
    meta: {
      title: '创建计费设置'
    }
  },
  {
    path: 'timer',
    name: 'timer',
    component: TimerPage,
    meta: {
      title: '定时器'
    }
  },
  {
    path: 'createTimer',
    name: 'createTimer',
    component: CreateTimerPage,
    meta: {
      title: '创建定时器'
    }
  },
  {
    path: 'detailTimer/:uuid',
    name: 'detailTimer',
    component: TimerDetailPage,
    meta: {
      title: '定时器详情'
    }
  },
  {
    path: 'schedulerjob',
    name: 'schedulerjob',
    component: SchedulerJobPage,
    meta: {
      title: '定时任务'
    }
  },
  {
    path: 'detailSchedulerJob/:uuid',
    name: 'detailSchedulerJob',
    component: SchedulerJobDetailPage,
    meta: {
      title: '定时任务详情'
    }
  },
  {
    path: 'tag',
    name: 'tag',
    component: TagPage,
    meta: {
      title: '标签'
    }
  },
  {
    path: 'detailTag/:uuid',
    name: 'detailTag',
    component: TagDetailPage,
    meta: {
      title: '标签详情'
    }
  },
  {
    path: 'appcenter',
    name: 'appcenter',
    component: AppCenterPage,
    meta: {
      title: '应用中心'
    }
  },
  {
    path: 'createAppCenter',
    name:  'createAppCenter',
    component: CreateAppCenterPage,
    meta: {
      title: '添加应用'
    }
  },
  {
    path: 'emailserversetting',
    name: 'emailserversetting',
    component: EmailServerSettingPage,
    meta: {
      title: '邮箱服务器'
    }
  },
  {
    path: 'createEmailServerSetting',
    name: 'createEmailServerSetting',
    component: CreateEmailServerSettingPage,
    meta: {
      title: '创建邮箱服务器'
    }
  },
  {
    path: 'detailEmailServerSetting/:uuid',
    name: 'detailEmailServerSetting',
    component: EmailServerSettingDetailPage,
    meta: {
      title: '邮箱服务器详情'
    }
  },
  {
    path: 'certificate',
    name: 'certificate',
    component: CertificatePage,
    meta: {
      title: '证书'
    }
  },
  {
    path: 'createCertificate',
    name: 'createCertificate',
    component: CreateCertificatePage,
    meta: {
      title: '创建证书'
    }
  },
  {
    path: 'detailCertificate/:uuid',
    name: 'detailCertificate',
    component: CertificateDetailPage,
    meta: {
      title: '证书详情'
    }
  },
  {
    path: 'adldapserver',
    name: 'adldapserver',
    component: AdldapServerPage,
    meta: {
      title: 'AD/LDAP'
    }
  },
  {
    path: 'createAdldapServer',
    name: 'createAdldapServer',
    component: CreateAdldapServerPage,
    meta: {
      title: '添加AD/LDAP'
    }
  },
  {
    path: 'consoleproxy',
    name: 'consoleproxy',
    component: ConsoleProxy,
    meta: {
      title: '控制台代理'
    }
  },
  {
    path: 'accesskey',
    name: 'accesskey',
    component: AccessKeyPage,
    meta: {
      title: 'Access Key'
    }
  },
  {
    path: 'performancehomepage',
    name: 'performancehomepage',
    component: PerformanceHomePage,
    meta: {
      title: 'top5'
    }
  },
  {
    path: 'performance',
    name: 'performance',
    component: PerformancePage,
    meta: {
       title: '性能分析'
    }
  },
  {
    path: 'zwatchalarm',
    name: 'zwatchalarm',
    component: ZwatchAlarmPage,
    meta: {
      title: '报警器'
    }
  },
  {
    path: 'createZwatchalarm',
    name: 'createZwatchalarm',
    component: CreateZwatchAlaramResourcePage,
    meta: {
      title: '创建资源报警器'
    }
  },
  {
    path: 'createZwatchalarmdetail',
    name: 'createZwatchalarmdetail',
    component: CreateZwatchEventPage,
    meta: {
      title: '创建时间报警器'
    }
  },
  {
    path: 'detailZwatchAlarm/:uuid/:currTab',
    name: 'detailZwatchAlarm',
    component: ZwatchAlarmDetailPage,
    meta: {
      title: '报警器详情'
    }
  },
  {
    path: 'zwatchsnstexttemplate',
    name: 'zwatchsnstexttemplate',
    component: ZwatchSNSTextTemplatePage,
    meta: {
      title: '告警模板'
    }
  },
  {
    path: 'createZwatchSNSTextTemplate',
    name: 'createZwatchSNSTextTemplate',
    component: CreateZwatchSNSTextTemplatePage,
    meta: {
      title: '创建模板'
    }
  },
  {
    path: 'detailZwatchSNSTextTemplate/:uuid',
    name: 'detailZwatchSNSTextTemplate',
    component: ZwatchSNSTextTemplateDetailPage,
    meta: {
      title: '告警模板详情'
    }
  },
  {
    path: 'zwatchendpoint',
    name: 'zwatchendpoint',
    component: ZwatchEndPointPage,
    meta: {
      title: '接收端'
    }
  },
  {
    path: 'createZwatchEndPoint',
    name: 'createZwatchEndPoint',
    component: CreateZwatchEndPointPage,
    meta: {
      title: '创建接收端'
    }
  },
  {
    path: 'detailZwatchEndpoint/:uuid',
    name: 'detailZwatchEndpoint',
    component: ZwatchEndPointDetailPage,
    meta: {
      title: '接收端详情'
    }
  },
  {
    path: 'messagecenter',
    name: 'messagecenter',
    component: MessageCenterPage,
    meta: {
      title: '消息中心'
    }
  },
  {
    path: 'detailMessageCenter/:uuid',
    name: 'detailMessageCenter',
    component: MessageCenterDetailPage,
    meta: {
      title: '消息中心详情'
    }
  },
  {
    path: 'operationlog',
    name: 'operationlog',
    component: OperationLogPage,
    meta: {
      title: '操作日志'
    }
  },
  {
    path: 'detailOperationLog/:uuid/:currTab',
    name: 'detailOperationLog',
    component: OperationLogDetailPage,
    meta: {
      title: '操作日志详情'
    }
  },
  {
    path: 'resourcestack',
    name: 'resourcestack',
    component: ResourceStackPage,
    meta: {
      title: '资源栈'
    }
  },
  {
    path: 'createResourceStack',
    name: 'createResourceStack',
    component: CreateResourceStackPage,
    meta: {
      title: '创建资源栈'
    }
  },
  {
    path: 'detailResourceStack/:uuid',
    name: 'detailResourceStack',
    component: ResourceStackDetailPage,
    meta: {
      title: '资源栈详情'
    }
  },
  {
    path: 'resourcestacktemplate',
    name: 'resourcestacktemplate',
    component: ResourceTemplatePage,
    meta:{
      title: '资源栈模板'
    }
  },
  {
    path: 'createResourceStackTemplate',
    name: 'createResourceStackTemplate',
    component: CreateResourceTemplatePage,
    meta: {
      title:  '创建资源栈模板'
    }
  },
  {
    path: 'detailResourceStackTemplate/:uuid',
    name: 'detailResourceStackTemplate',
    component: ResourceTemplateDetailPage,
    meta: {
      title:  '资源栈模板详情'
    }
  },
  {
    path: 'sysresourcestacktemplate',
    name: 'sysresourcestacktemplate',
    component: SysResourceStackTemplatePage,
    meta: {
      title: '资源栈示例模板'
    }
  },
  {
    path: 'detailSysResourceStackTemplate/:uuid',
    name:  'detailSysResourceStackTemplate',
    component: SysResourceStackTemplateDetailPage,
    meta: {
      title: '资源栈详情'
    }
  },
  {
    path: 'globalsettings',
    name: 'globalsettings',
    component: GlobalSettingsPage,
    meta: {
      title: '全局设置'
    }
  }

]


const DataBaseMenus =[
  {
    path: 'oracle',
    name: 'oracle',
    component: OraclePage,
    meta: {
      title: 'oracle'
    }
  }
];

const vcenterMenus = [
  {
    path: 'resource',
    name: 'resource',
    component: ResourcePage,
    meta: {
      title: '基础资源'
    }
  },
  {
    path: 'createResource',
    name: 'createResource',
    component: CreateResourcePage,
    meta: {
      title: '添加基础资源'
    }
  },
  {
    path: 'detailResource/:uuid',
    name: 'detailResource',
    component: ResourceDetailPage,
    meta: {
      title: '基础资源详情'
    }
  },
  {
    path: 'vcentervminstance',
    name: 'vcentervminstance',
    component: VCenterVmInstancePage,
    meta: {
      title: '云主机'
    }
  },
  {
    path: 'createVCenterVmInstance',
    name: 'createVCenterVmInstance',
    component: CreateVcenterVmInstancePage,
    meta: {
      title: '创建vCenter云主机'
    }
  },
  {
    path:'detailVCenterVmInstance/:uuid',
    name: 'detailVCenterVmInstance',
    component: vCenterVmInstanceDetailPage,
    meta: {
      title: 'vCenter云主机详情'
    }
  },
  {
    path: 'vcenternetwork',
    name: 'vcenternetwork',
    component: vCenterNetWorkPage,
    meta: {
      title: 'vCenter网络'
    }
  },
  {
    path: 'createvCenterNetwork',
    name: 'createvCenterNetwork',
    component: CreatevCenterNetWorkPage,
    meta: {
      title: '创建vCenter网络'
    }
  },
  {
    path: 'detailvCenterNetwork/:uuid',
    name: 'detailvCenterNetwork',
    component: vCenterNetworkDetailPage,
    meta: {
      title: 'vCenter网络详情'
    }
  },
  {
    path: 'vcentervolume',
    name: 'vcentervolume',
    component: vCenterVolumePage,
    meta: {
      title: 'vCenter云盘'
    }
  },
  {
    path: 'createvCenterVolume',
    name: 'createvCenterVolume',
    component: CreatevCenterVolumePage,
    meta: {
      title: '创建vCenter云盘'
    }
  },
  {
    path: 'detailvCenterVolume/:uuid',
    name: 'detailvCenterVolume',
    component: vCenterVolumeDetailPage,
    meta: {
      title: 'vCenter云盘详情'
    }
  },
  {
    path: 'vcenterimage',
    name: 'vcenterimage',
    component: vCenterImagePage,
    meta: {
      title: 'vCenter镜像'
    }
  },
  {
    path: 'createvCenterImage',
    name: 'createvCenterImage',
    component: CreatevCenterImagePage,
    meta: {
      title: '创建vCenter镜像'
    }
  },
  {
    path: 'detailvCenterImage/:uuid/:currTab',
    name: 'detailvCenterImage',
    component: vCenterImageDetailPage,
    meta: {
      title: 'vCenter镜像详情'
    }
  },
  {
    path: 'vcentermessage',
    name: 'vcentermessage',
    component: vCenterMessagePage,
    meta: {
      title: 'vCenter消息中心'
    }
  }

];

const aliCloudMenus = [
  {
    path: 'hybridkeysecret',
    name: 'hybridkeysecret',
    component: HybridkeysecretPage,
    meta: {
      title: 'Accesskey'
    }
  },
  {
    path: 'createHybridkeysecret/:type',
    name: 'createHybridkeysecret',
    component: CreateAliCloudAccessKey,
    meta: {
      title: '添加AccessKey'
    }
  },
  {
    path: 'detailHybridKeySecret/:uuid/:type',
    name: 'detailHybridKeySecret',
    component: DetailHybridKeySecretPage,
    meta: {
      title: 'Secretkey详情'
    }
  },
  {
    path: 'hybridaliclouddatacenter',
    name: 'hybridaliclouddatacenter',
    component: HybridAliCloudDataCenterPage,
    meta: {
      title: '阿里云数据中心'
    }
  },
  {
    path: 'createHybridAliCloudDataCenter',
    name: 'createHybridAliCloudDataCenter',
    component: HybridAliCloudDataCenterCreatePage,
    meta: {
      title: '创建阿里云数据中心'
    }
  },
  {
    path: 'detailHybridAliCloudDataCenter/:uuid',
    name:  'detailHybridAliCloudDataCenter',
    component: HybridAliCloudDataCenterDetailPage,
    meta: {
      title: '阿里云数据中心详情'
    }
  },
  {
    path: 'hybridalicloudidentityzone',
    name: 'hybridalicloudidentityzone',
    component: HybridAliCloudIdentityZonePage,
    meta: {
      title: "阿里云可用区"
    }
  },
  {
    path: 'createHybridAliCloudIdentityZone',
    name: 'createHybridAliCloudIdentityZone',
    component: HybridAliCloudIdentityZoneCreatePage,
    meta: {
      title: '创建可用区'
    }
  },
  {
    path: 'detailHybridAliCloudIdentityZone/:uuid',
    name: 'detailHybridAliCloudIdentityZone',
    component: HybridAliCloudIdentityZoneDetailPage,
    meta: {
      title: '可用区详情'
    }
  },
  {
    path: 'hybridalicloudconfig',
    name: 'hybridalicloudconfig',
    component: HybridAliCloudConfigPage,
    meta: {
      title: '阿里云设置'
    }
  },
  {
    path: 'hybridalicloudabout',
    name: 'hybridalicloudabout',
    component: HybridAliCloudAboutPage,
    meta: {
      title: '阿里云关于'
    }
  },
  {
    path: 'hybridalicloudecs',
    name: 'hybridalicloudecs',
    component: HybridAliCloudEcsPage,
    meta: {
      title: '阿里云Ecs云主机'
    }
  },
  {
    path: 'createHybridAliCloudEcs',
    name: 'createHybridAliCloudEcs',
    component: CreateHybridAliCloudEcsPage,
    meta: {
      title: '创建阿里云Ecs云主机'
    }
  },
  {
    path: 'detailHybridAliCloudEcs/:uuid',
    name: 'detailHybridAliCloudEcs',
    component: DetailHybridAliCloudEcsPage,
    meta: {
      title: '阿里云Ecs云主机详情'
    }
  },
  {
    path: 'hybridalicloudimage',
    name: 'hybridalicloudimage',
    component: HybirdAliCloudImagePage,
    meta: {
      title:'阿里云镜像'
    }
  },
  {
    path: 'createHybridAliCloudImage',
    name: 'createHybridAliCloudImage',
    component: CreateHybridAliCloudImagePage,
    meta: {
      title: '创建阿里云镜像'
    }
  },
  {
    path: 'detailHybridAliCloudImage/:uuid/:currTab',
    name: 'detailHybridAliCloudImage',
    component: DetailHybridAliCloudImagePage,
    meta: {
      title: '阿里云镜像详情'
    }
  },
  {
    path: 'hybridalicloudsecuritygroup',
    name: 'hybridalicloudsecuritygroup',
    component: HybridAliCloudSecurityGroupPage,
    meta: {
      title: '安全组'
    }
  },
  {
    path: 'createHybridAliCloudSecurityGroup',
    name: 'createHybridAliCloudSecurityGroup',
    component: CreateHybridAliCloudSecurityGroupPage,
    meta: {
      title: '创建阿里云安全组'
    }
  },
  {
    path: 'detailHybridAliCloudSecurityGroup/:uuid',
    name: 'detailHybridAliCloudSecurityGroup',
    component: DetailHybridAliCloudSecurityGroupPage,
    meta: {
      title: '阿里云安全组详情'
    }
  },
  {
    path: 'hybridaliclouddisk',
    name: 'hybridaliclouddisk',
    component: HybridAliCloudDiskPage,
    meta: {
      title: '阿里云云盘'
    }
  },
  {
    path: 'createHybridAliCloudDisk',
    name: 'createHybridAliCloudDisk',
    component: CreateHybridAliCloudDiskPage,
    meta: {
      title:'创建阿里云云盘'
    }
  },
  {
    path: 'detailHybridAliCloudDisk/:uuid',
    name: 'detailHybridAliCloudDisk',
    component: HybridAliCloudDiskDetailPage,
    meta: {
      title:'阿里云云盘详情'
    }
  },
  {
    path: 'hybridalicloudvpc',
    name: 'hybridalicloudvpc',
    component: HybridAliCloudVpcPage,
    meta: {
      title: '阿里云虚拟网络'
    }
  },
  {
    path: 'createHybridAliCloudVpc',
    name: 'createHybridAliCloudVpc',
    component: CreateHybridAliCloudVpcPage,
    meta: {
      title: '创建阿里云虚拟网络'
    }
  },
  {
    path: 'detailHybridAliCloudVpc/:uuid',
    name: 'detailHybridAliCloudVpc',
    component: DetailHybridAliCloudVpcPage,
    meta: {
      title: '阿里云Vpc详情'
    }
  },
  {
    path: 'hybridalicloudeip',
    name: 'hybridalicloudeip',
    component: HybridAliCloudEipPage,
    meta: {
      title: '阿里云弹性公网Ip'
    }
  },
  {
    path: 'createHybridAliCloudEip',
    name: 'createHybridAliCloudEip',
    component: CreateHybridAliCloudEipPage,
    meta: {
      title: '创建阿里云弹性公网Ip'
    }
  },
  {
    path: 'detailHybridAliCloudEip/:uuid',
    name: 'detailHybridAliCloudEip',
    component: DetailHybridAliCloudEipPage,
    meta: {
      title: '阿里云公网Ip详情'
    }
  },
  {
    path: 'hybridalicloudvpcvpngateway',
    name: 'hybridalicloudvpcvpngateway',
    component: HybridAliCloudVpcVpnGatewayPage,
    meta: {
      title: '阿里云vpn网关'
    }
  },
  {
    path: 'detailHybridAliCloudVpcVpnGateway/:uuid',
    name: 'detailHybridAliCloudVpcVpnGateway',
    component: DetailHybridAliCloudVpnGatewayPage,
    meta: {
      title: '阿里云vpn网关详情'
    }
  },
  {
    path: 'hybridalicloudvpcuservpngateway',
    name: 'hybridalicloudvpcuservpngateway',
    component: HybridAliCloudUserVpcVpnGatewayPage,
    meta: {
      title: '阿里云用户网关'
    }
  },
  {
    path: 'createHybridAliCloudVpcUserVpnGateway',
    name: 'createHybridAliCloudVpcUserVpnGateway',
    component: CreateHybridAliCloudUserVpcVpnGatewayPage,
    meta: {
      title: '创建阿里云用户网关'
    }
  },
  {
    path: 'detailHybridAliCloudVpcUserVpnGateway/:uuid',
    name: 'detailHybridAliCloudVpcUserVpnGateway',
    component: DetailHybridAliCloudUserVpcVpnGatewayPage,
    meta: {
      title: '创建阿里云用户网关'
    }
  },
  {
    path: 'hybridalicloudvpcvpnconnection',
    name: 'hybridalicloudvpcvpnconnection',
    component: HybridAliCloudVpcVpnConnectionPage,
    meta: {
      title: '阿里云vpn连接'
    }
  },
  {
    path: 'createHybridAliCloudVpcVpnConnection',
    name: 'createHybridAliCloudVpcVpnConnection',
    component: CreateHybridAliCloudVpcVpnConnectionPage,
    meta: {
      title: '创建阿里云vpn连接'
    }
  },
  {
    path: 'detailHybridAliCloudVpcVpnConnection/:uuid',
    name: 'detailHybridAliCloudVpcVpnConnection',
    component: DetailHybridAliCloudVpcVpnConnectionPage,
    meta: {
      title: '阿里云vpn连接详情'
    }
  },
  {
    path: 'hybridalicloudvirtualborderrouter',
    name: 'hybridalicloudvirtualborderrouter',
    component: HybridAliCloudVirtualBorderRouterPage,
    meta: {
      title: '阿里云边界路由器'
    }
  },
  {
    path: 'detailHybridAliCloudVirtualBorderRouter/:uuid',
    name: 'detailHybridAliCloudVirtualBorderRouter',
    component: DetailHybridAliCloudVirtualBorderRouterPage,
    meta: {
      title: '阿里云边界路由器'
    }
  },
  {
    path: 'hybridalicloudvirtualrouterinterface',
    name: 'hybridalicloudvirtualrouterinterface',
    component: HybridAliCloudVirtualRouterInterfacePage,
    meta: {
      title: '阿里云路由器接口'
    }
  },
  {
    path: 'detailhybridalicloudvirtualrouterinterface/:uuid/:currTab',
    name: 'detailhybridalicloudvirtualrouterinterface',
    component: DetailHybridAliCloudVirtualRouterInterfacePage,
    meta: {
      title: '阿里云路由器接口详情'
    }
  },
  {
    path: 'createHybridAliCloudVirtualRouterInterface/:currTab',
    name: 'createHybridAliCloudVirtualRouterInterface',
    component: CreateHybridAliCloudVirtualRouterInterfacePage,
    meta: {
      title: '创建阿里云路由器接口'
    }
  },
  {
    path: 'hybridalicloudfilesystem',
    name: 'hybridalicloudfilesystem',
    component: HybridAliCloudFileSystemPage,
    meta: {
      title: '文件系统'
    }
  },
  {
    path: 'createHybridAliCloudFileSystem',
    name: 'createHybridAliCloudFileSystem',
    component: CreateHybridAliCloudFileSystemPage,
    meta: {
      title: '创建阿里云文件系统'
    }
  },
  {
    path: 'detailHybridAliCloudFileSystem/:uuid',
    name: 'detailHybridAliCloudFileSystem',
    component: HybridAliCloudFileSystemDetailPage,
    meta: {
      title: '创建阿里云文件系统'
    }
  },
  {
    path: 'hybridalicloudaccessgroup',
    name: 'hybridalicloudaccessgroup',
    component: HybridAliCloudAccessGroupPage,
    meta: {
      title: '阿里云权限组'
    }
  },
  {
    path: 'createHybridAliCloudAccessgroup',
    name: 'createHybridAliCloudAccessgroup',
    component: CreateHybridAliCloudAccessGroupPage,
    meta: {
      title: '创建阿里云权限组'
    }
  }
];

const huaweicloudMenus = [
  {
    path: 'hybridhuaweiaccountkey',
    name: 'hybridhuaweiaccountkey',
    component: HuaweiAccountPage,
    meta: {
      title: 'AccountKey'
    }
  },
  {
    path: 'createHybridHuaWeiAccountKey',
    name: 'createHybridHuaWeiAccountKey',
    component: CreateHuaweiAccountPage,
    meta: {
      title: '添加华为云AccountKey'
    }
  },
  {
    path: 'detailHybridHuaWeiAccountKey/:uuid',
    name: 'detailHybridHuaWeiAccountKey',
    component: DetailHybridHuaweiAccountPage,
    meta: {
      title: '华为云AccountKey详情'
    }
  },
  {
    path: 'hybridhuaweidatacenter',
    name: 'hybridhuaweidatacenter',
    component: HuaweiDataCenterPage,
    meta: {
      title: '华为云地域'
    }
  },
  {
    path: 'createHybridHuaweiDataCenter',
    name: 'createHybridHuaweiDataCenter',
    component: CreateHuaweiDataCenterPage,
    meta: {
      title: '添加华为云地域'
    }
  },
  {
    path: 'detailHybridHuaweiDataCenter/:uuid',
    name: 'detailHybridHuaweiDataCenter',
    component: DetailHuaweiDataCenterPage,
    meta: {
      title: '华为云地域详情'
    }
  },
  {
    path: 'hybridhuaweiidentityzone',
    name: 'hybridhuaweiidentityzone',
    component: HybridHuaweiIdentityZonePage,
    meta: {
      title: '华为云可用区'
    }
  },
  {
    path: 'createHybridHuaweiIdentityZone',
    name: 'createHybridHuaweiIdentityZone',
    component: CreateHybridHuaweiIdentityZonePage,
    meta: {
      title: '添加华为云可用区'
    }
  },
  {
    path: 'detailHybridHuaweiIdentityZone/:uuid',
    name: 'detailHybridHuaweiIdentityZone',
    component: DetailHybridHuaweiIdentityZonePage,
    meta: {
      title: '可用区详情'
    }
  },
  {
    path: 'hybridhuaweiecs',
    name: 'hybridhuaweiecs',
    component: HybridHuaweiEcsPage,
    meta: {
       title: '华为云Ecs云主机'
    }
  },
  {
    path: 'createHybridHuaweiEcs',
    name: 'createHybridHuaweiEcs',
    component: CreateHybridHuaweiEcsPage,
    meta: {
      title: '华为云ecs云主机'
    }
  },
  {
    path: 'detailHybridHuaweiEcs/:uuid',
    name: 'detailHybridHuaweiEcs',
    component: DetailHybridHuaweiEcsPage,
    meta: {
      title: '华为云ecs云主机'
    }
  },
  {
    path: 'hybridhuaweidisk',
    name: 'hybridhuaweidisk',
    component: HybridHuaweiDiskPage,
    meta: {
      title: '华为云云盘'
    }
  },
  {
    path: 'createHybridHuaweiDisk',
    name: 'createHybridHuaweiDisk',
    component: CreateHybridHuaweiDiskPage,
    meta: {
      title: '创建华为云云盘'
    }
  },
  {
    path: 'detailHybridHuaweiDisk/:uuid',
    name: 'detailHybridHuaweiDisk',
    component: DetailHybridHuaweiDiskPage,
    meta: {
      title: '华为云云盘详情'
    }
  },
  {
    path: 'hybridhuaweiimage',
    name: 'hybridhuaweiimage',
    component: HybridHuaweiImagePage,
    meta: {
      title: '华为云镜像 '
    }
  },
  {
    path: 'createHybridHuaweiImage',
    name: 'createHybridHuaweiImage',
    component: CreateHybridHuaweiImagePage,
    meta: {
      title: '创建华为云镜像'
    }
  },
  {
    path: 'detailHybridHuaweiImage/:uuid/:currTab',
    name: 'detailHybridHuaweiImage',
    component: HybridHuaweiImageDetailPage,
    meta: {
      title: '华为云镜像详情'
    }
  },
  {
    path: 'hybridhuaweisecuritygroup',
    name: 'hybridhuaweisecuritygroup',
    component: HybridHuaweiSecurityGroupPage,
    meta: {
      title: '华为云安全组列表'
    }
  },
  {
    path: 'createHybridHuaweiSecuritygroup',
    name: 'createHybridHuaweiSecuritygroup',
    component: CreateHybridHuaweiSecurityGroupPage,
    meta: {
      title: '华为云安全组列表'
    }
  },
  {
    path: 'detailHybridHuaweiSecurityGroup/:uuid',
    name: 'detailHybridHuaweiSecurityGroup',
    component: DetailHybridHuaweiSecurityGroupPage,
    meta: {
      title: '华为云安全组详情'
    }
  },
  {
    path: 'hybridhuaweivpc',
    name: 'hybridhuaweivpc',
    component: HybridHuaweiCloudVpcPage,
    meta: {
      title: '华为云专有网络vpc'
    }
  },
  {
    path: 'detailHybridHuaweiVpc/:uuid',
    name: 'detailHybridHuaweiVpc',
    component: HybridHuaweiCloudVpcDetailPage,
    meta: {
      title: '华为云专有网络vpc'
    }
  },
  {
    path: 'createHybridHuaweiVpc',
    name: 'createHybridHuaweiVpc',
    component: CreateHybridHuaweiCloudVpcPage,
    meta: {
      title: '华为云专有网络vpc'
    }
  },
  {
    path: 'hybridhuaweieip',
    name: 'hybridhuaweieip',
    component: HybridHuaweiEipPage,
    meta: {
      title: '华为云弹性Eip'
    }
  },
  {
    path: 'createHybridHuaweiEip',
    name: 'createHybridHuaweiEip',
    component: CreateHybridHuaweiEipPage,
    meta: {
      title: '创建华为云Eip'
    }
  },
  {
    path: 'detailHybridHuaweiEip/:uuid',
    name: 'detailHybridHuaweiEip',
    component: DetailHybridHuaweiEipPage,
    meta: {
      title: '华为云Eip详情'
    }
  }
];

const tencentCloudMenus = [
  {
    path: 'hybridtencentkeysecret',
    name: 'hybridtencentkeysecret',
    component: SecretkeyPage,
    meta: {
      title: 'SecretKey'
    }
  },
  {
    path: 'createHybridTencentKeySecret',
    name: 'createHybridTencentKeySecret',
    component: CreateTencentSecretKeyPage,
    meta: {
      title: '添加腾讯云SecretKey'
    }
  },
  {
    path: 'detailHybridTencentKeySecret/:uuid',
    name: 'detailHybridTencentKeySecret',
    component: DetailTencentSecretKeyPage,
    meta: {
      title: '腾讯云SecretKey详情'
    }
  },
  {
    path: 'hybridtencentdatacenter',
    name: 'hybridtencentdatacenter',
    component: HybridTencentDataCenterPage,
    meta: {
      title: '腾讯云地域'
    }
  },
  {
    path: 'createHybridTencentDataCenter',
    name: 'createHybridTencentDataCenter',
    component: CreateHybridTencentDataCenterPage,
    meta: {
      title: '创建腾讯云地域'
    }
  },
  {
    path: 'detailHybridTencentDataCenter/:uuid',
    name: 'detailHybridTencentDataCenter',
    component: DetailHybridTencentDataCenterPage,
    meta: {
      title: '腾讯云地域详情'
    }
  },
  {
    path: 'hybridtencentidentityzone',
    name: 'hybridtencentidentityzone',
    component: HybridTencentIdentityZonePage,
    meta: {
      title: '腾讯云可用区'
    }
  },
  {
    path: 'createHybridTencentIdentityZone',
    name: 'createHybridTencentIdentityZone',
    component: CreateHybridTencentIdentityZonePage,
    meta: {
      title: '添加腾讯云可用区'
    }
  },
  {
    path: 'detailHybridTencentIdentityZone/:uuid',
    name: 'detailHybridTencentIdentityZone',
    component: DetailHybridTencentIdentityZonePage,
    meta: {
      title: '腾讯云可用区详情'
    }
  },
  {
    path: 'hybridtencentdisk',
    name: 'hybridtencentdisk',
    component: HybridTencentDiskPage,
    meta: {
      title: '腾讯云云盘'
    }
  },
  {
    path: 'createHybridTencentDisk',
    name: 'createHybridTencentDisk',
    component: CreateHybridTencentDiskPage,
    meta: {
      title: '创建腾讯云云盘'
    }
  },
  {
    path: 'detailHybridTencentDisk/:uuid',
    name: 'detailHybridTencentDisk',
    component: DetailHybridTencentDiskPage,
    meta: {
      title: '腾讯云云盘详情'
    }
  },
  {
    path: 'hybridtencentvpc',
    name: 'hybridtencentvpc',
    component: HybridTencentVirtualPrivateCloudPage,
    meta: {
      title: '腾讯云Vpc'
    }
  },
  {
    path: 'createHybridTencentVpc',
    name: 'createHybridTencentVpc',
    component: CreateHybridTencentVirtualPrivateCloudPage,
    meta: {
      title: '创建腾讯云Vpc'
    }
  },
  {
    path: 'detailHybridTencentVpc/:uuid',
    name: 'detailHybridTencentVpc',
    component: DetailHybridTencentVirtualPrivateCloudPage,
    meta: {
      title: '腾讯云Vpc详情'
    }
  },
  {
    path: 'hybridtencentimage',
    name: 'hybridtencentimage',
    component: HybridTenCentImagePage,
    meta: {
      title: "腾讯云镜像"
    }
  },
  {
    path: 'createHybridTencentImage',
    name: 'createHybridTencentImage',
    component: CreateTencentImagePage,
    meta: {
      title: '创建腾讯云镜像'
    }
  },
  {
    path: 'detailHybridTencentImage/:uuid/:currTab',
    name: 'detailHybridTencentImage',
    component: DetailTencentImagePage,
    meta: {
      title: '腾讯云镜像详情'
    }
  },
  {
    path: 'hybridtencentsecuritygroup',
    name: 'hybridtencentsecuritygroup',
    component: HybridTencentSecurityGroupPage,
    meta: {
      title: '腾讯云安全组'
    }
  },
  {
    path: 'createHybridTencentSecurityGroup',
    name: 'createHybridTencentSecurityGroup',
    component: CreateHybridTencentSecurityGroupPage,
    meta: {
      title: '创建腾讯云安全组'
    }
  },
  {
    path: 'detailHybridTencentSecurityGroup/:uuid',
    name: 'detailHybridTencentSecurityGroup',
    component: DetailHybridTencentSecurityGroupPage,
    meta: {
      title: '腾讯云安全组详情'
    }
  },
  {
    path: 'hybridtencentecs',
    name: 'hybridtencentecs',
    component: HybridTencentEcsPage,
    meta: {
      title: '腾讯云CVM云主机'
    }
  },
  {
    path: 'createHybridTencentEcs',
    name: 'createHybridTencentEcs',
    component: CreateHybridTencentEcsPage,
    meta: {
      title: '创建腾讯云CVM云主机'
    }
  },
  {
    path: 'detailHybridTencentEcs/:uuid',
    name: 'detailHybridTencentEcs',
    component: DetailHybridTencentEcsPage,
    meta: {
      title: "腾讯云CVM详情"
    }
  },
  {
    path: 'hybridtencenteip',
    name: 'hybridtencenteip',
    component: HybridTencentEipPage,
    meta: {
      title: '腾讯云Eip'
    }
  },
  {
    path: 'createHybridTencentEip',
    name: 'createHybridTencentEip',
    component: CreateHybridTencentEipPage,
    meta: {
      title: '创建腾讯云公网Ip'
    }
  },
  {
    path: 'detailHybridTencentEip/:uuid',
    name: 'detailHybridTencentEip',
    component: DetialHybridTencentEipPage,
    meta: {
      title: '腾讯云公网Ip详情'
    }
  },
  {
    path: 'hybridtencentvpcvpngateway',
    name: 'hybridtencentvpcvpngateway',
    component: HybridTencentVpcVpnGateWayPage,
    meta: {
      title: '腾讯云vpn网关'
    }
  },
  {
    path: 'detailHybridTencentVpcVpnGateway/:uuid',
    name: 'detailHybridTencentVpcVpnGateway',
    component: DetailHybridTencentVpcVpnGateWayPage,
    meta: {
      title: '腾讯云vpn网关'
    }
  },
  {
    path: 'hybridtencentvpnusergateway',
    name: 'hybridtencentvpnusergateway',
    component: HybridTencentVpnUserGateWay,
    meta: {
      title: '腾讯云对端网关'
    }
  },
  {
    path: 'createHybridTencentVpnUsergateWay',
    name: 'createHybridTencentVpnUsergateWay',
    component: CreateHybridTencentVpnUserGateWay,
    meta: {
      title: '创建腾讯云对端网关'
    }
  },
  {
    path: 'detailHybridTencentVpnUsergateWay/:uuid',
    name: 'detailHybridTencentVpnUsergateWay',
    component: DetailHybridTencentVpnUserGateWay,
    meta: {
      title: '创建腾讯云对端网关'
    }
  },
  {
    path: 'hybridtencentvpnconnection',
    name: 'hybridtencentvpnconnection',
    component: HybridTencentVpnConnectionPage,
    meta: {
      title: '腾讯云vpn连接'
    }
  },
  {
    path: 'createHybridTencentVpnConnection',
    name: 'createHybridTencentVpnConnection',
    component: CreateHybridTencentVpnConnectionPage,
    meta: {
      title: '创建腾讯云vpn连接'
    }
  },
  {
    path: 'detailHybridTencentVpnConnection/:uuid',
    name: 'detailHybridTencentVpnConnection',
    component: DetailHybridTencentVpnConnectionPage,
    meta: {
      title: '腾讯云vpn详情'
    }
  }
]

export const routes = [
  {
    path: '*', redirect: '/login'
  },
  {
    path: '/main/', redirect: '/main/ecs/home'
  },
  {
    path: '/main/ecs/', redirect: '/main/ecs/home'
  },
  {
    path: '/main/network/', redirect: '/main/network/vxlanpool'
  },
  {
    path: '/main/storage/', redirect: '/main/storage/primarystorage'
  },
  {
    path: '/main/security/', redirect: '/main/security/securitygroup'
  },
  {
    path: '/main/om/', redirect: '/main/om/zone'
  },
  {
    path: '/main/vcenter/', redirect: '/main/vcenter/resource'
  },
  {
    path: '/main/alicloud/', redirect: '/main/alicloud/hybridkeysecret'
  },
  {
    path: '/main/tencentcloud/', redirect: '/main/tencentcloud/hybridtencentkeysecret'
  },
  {
    path: '/main/huaweicloud/', redirect: '/main/huaweicloud/hybridhuaweiaccountkey'
  },
  {
    path: '/login',
    component: Login,
    name: 'login',
    meta: {
      title: 'Login'
    }
  },
  {
    path: '/overview',
    component: OverviewPage,
    name: 'overview',
    meta: {
      title: '大屏监控'
    }
  },
  {
    path: '/main',
    component: MainPage,
    name: 'main',
    meta: {
      title:'主页'
    },
    children: [
      {
        path: 'ecs',
        component: EcsPage ,
        name: 'ecs',
        meta: {
          title: '计算'
        },
        children: ecsMenus
      },
      {
        path: 'network',
        component: NetWorkPage,
        name: 'network',
        meta: {
          title:'网络'
        },
        children: networkMenus
      },
      {
        path: 'storage',
        name: 'storage',
        meta: {
          title:'存储'
        },
        component: StoragePage,
        children: StorageMenus
      },
      {
        path: 'security',
        name: 'security',
        meta: {
          title: '安全'
        },
        component: SecurityPage,
        children: SecurityMenus
      },
      {
        path: 'om',
        name: 'om',
        meta: {
          title: "平台运维"
        },
        component: OMPage,
        children: OMMenus,
      },
      {
        path: 'database',
        name: 'database',
        meta: {
          title: '数据库'
        },
        component: DataBasePage,
        children: DataBaseMenus
      },
      {
        path: 'vcenter',
        name: 'vcenter',
        component: VcenterPage,
        children: vcenterMenus
      },
      {
        path: 'alicloud',
        name: 'alicloud',
        component: AliCloudPage,
        children: aliCloudMenus
      },
      {
        path: 'tencentcloud',
        name: 'tencentcloud',
        component: TencentPage,
        children: tencentCloudMenus
      },
      {
        path: 'huaweicloud',
        name: 'huaweicloud',
        component: HuaweiPage,
        children: huaweicloudMenus
      }
    ]
  }
]
