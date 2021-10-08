<template>
  <div>
    <component :key="dlg.windowId" :class="{ 'legacy-dialog-panel': !(index === dialogList.length - 1) }" v-for="(dlg, index) in dialogList" :is="dlg.class" :assigned-id="dlg.windowId" :param="dlg.param" :style="{ 'z-index': dlg.zIndex }"/>
  </div>
</template>

<script>
  let dialogClass = {};
  import ConfirmDlg from 'src/dialog/ConfirmDlg';
  import UsbMultiSelectListDlg from 'src/dialog/multiselect/UsbMultiSelectListDlg';
  import CreateTagDlg from 'src/dialog/tag/CreateTagDlg';
  import AttachTagDlg from 'src/dialog/tag/AttachTagDlg';
  import VmSingleSelectListDlg from 'src/dialog/vm/VmSingleSelectListDlg';
  import VmInstanceMultiSelectListDlg from 'src/dialog/vm/VmInstanceMultiSelectListDlg';
  import RemindMigrateVolumeConfirmDlg from 'src/dialog/volume/RemindMigrateVolumeConfirmDlg';
  import ImageSingleSelectListDlg from 'src/dialog/volume/ImageSingleSelectListDlg';
  import SharetoAllConfirmDlg from 'src/dialog/image/SharetoAllConfirmDlg';
  import BackupStorageSelectListConfirmDlg from 'src/dialog/image/BackupStorageSelectListConfirmDlg';
  import ChangeResourceOwnerToAccountProjectSingleSelectListDlg from 'src/dialog/account/ChangeResourceOwnerToAccountProjectSingleSelectListDlg';
  import AccountListDlg from 'src/dialog/account/AccountListDlg';
  import ShareResourceToAccountProjectMultiSelectListConfirm from 'src/dialog/account/ShareResourceToAccountProjectMultiSelectListConfirm';
  import SharedSelectList from 'src/dialog/account/SharedSelectList';
  import UpdateStrategyForHostDlg from 'src/dialog/instanceOffering/UpdateStrategyForHostDlg';
  import DeleteZoneConfirmDlg from 'src/dialog/zone/DeleteZoneConfirm';
  import DisableZoneConfirmDlg from 'src/dialog/zone/DisableZoneConfirm';
  import DeleteClusterConfirm from 'src/dialog/cluster/DeleteClusterConfirm';
  import DisableClusterConfirm from 'src/dialog/cluster/DisableClusterConfirm';
  import LoadBalancerSingleSelectDlg from 'src/dialog/loadBalancer/LoadBalancerSingleSelectDlg';
  import LoadBalancerListenerMultiSelectListDlg from 'src/dialog/loadBalancerListener/MultiSelectList';
  import L3NetworkSingleSelectListDlg from 'src/dialog/l3NetWork/SingleSelectListDlg';
  import L2NetworkSingleSelectListDlg from 'src/dialog/l2NetWork/SingleSelectListDlg';
  import SingleSelectListForL3CreatingDlg from 'src/dialog/l2NetWork/SingleSelectListForL3CreatingDlg';
  import SubNetworkSingleSelectListDlg from 'src/dialog/ipsec/SubNetworkSingleSelectListDlg';
  import SubNetworkMultiSelectListDlg from 'src/dialog/ipsec/SubNetworkMultiSelectListDlg';
  import VMChangeImageConfirmDlg from 'src/dialog/vm/VMChangeImageConfirmDlg';

  import VpcVRouterSingleSelectListDlg from 'src/dialog/vpcVRouter/SingleSelectListDlg';
  import VipSingleSelectListDlg from 'src/dialog/vip/SingleSelectListDlg';
  import VirtualRouterImageListSingleSelectDlg from 'src/dialog/image/SingleSelectListDlg';
  import VirtualRouterInstanceOfferingListSingleSelectDlg from 'src/dialog/virtualRouterOffering/SingleSelectListDlg';
  import BackupStorageSingleSelectListDlg from 'src/dialog/backupStorage/SingleSelectListDlg';
  import ZwatchEndPointerMultiSelectListDlg from 'src/dialog/zwatchEndPoint/MultiSelectListDlg';
  import SecurityGroupSingleSelectListDlg from 'src/dialog/securityGroup/SecurityGroupSingleSelectListDlg';
  import PrimaryStorageAttachClusterDlg from 'src/dialog/zone/PrimaryStorageAttachClusterDlg';
  import ClusterSelectListDlg from 'src/dialog/cluster/ClusterSelectListDlg';
  import ClusterAttachPrimaryStorageDlg from 'src/dialog/cluster/ClusterAttachPrimaryStorageDlg';
  import UpdateCpuModelDlg from 'src/dialog/cluster/UpdateCpuModelDlg';
  import SanStorageMultiSelectListDlg from 'src/dialog/cluster/SanStorageMultiSelectListDlg';
  import UpdateUsbDeviceNameDlg from 'src/dialog/cluster/UpdateUsbDeviceNameDlg';
  import CheckAddHostFileConfirmDlg from 'src/dialog/host/CheckAddHostFileConfirmDlg';
  import LunMultiSelectListDlg from 'src/dialog/webStorage/LunMultiSelectListDlg';
  import ModifyPasswordDlg from 'src/dialog/account/ModifyPasswordDlg';
  import LdapEntryMultiSelectListDlg from  'src/dialog/adLdapEntry/LdapEntryMultiSelectListDlg';
  import ChangeUserPassWordDlg from 'src/dialog/user/ChangeUserPassWordDlg';
  import UserSelectConfirmDlg from 'src/dialog/user/UserSelectConfirmDlg';
  import VMBillingDetailDlg from 'src/dialog/billing/VMBillingDetailDlg';
  import DeleteBillingSettingsConfirmDlg from 'src/dialog/billingSettings/DeleteBillingSettingsConfirmDlg';
  import ChangeTimerConfDlg from 'src/dialog/timer/ChangeTimerConfDlg';
  import UpdateStartTimeDlg from  'src/dialog/timer/UpdateStartTimeDlg';
  import AttachSchedulerJobDlg from 'src/dialog/scheduler/AttachSchedulerJobDlg';
  import VolumeSelectListForJob from 'src/dialog/scheduler/VolumeSelectListForJob';
  import UpdateAppPluginDlg from 'src/dialog/appcenter/UpdateAppPluginDlg';
  import DeleteLoadBalancerConfirm from 'src/network/loadBalancer/dialog/DeleteLoadBalancerConfirm';
  import SetConsoleProxyIpDlg from 'src/dialog/consoleProxy/SetConsoleProxyIpDlg';

  import DeleteEipConfirmDlg from 'src/dialog/eip/DeleteEipConfirmDlg';
  import  HostListMultiSelectDlg from 'src/dialog/host/HostListMultiSelectDlg';
  import L3NetworkMultiSelectListDlg from 'src/dialog/l3NetWork/L3NetworkMultiSelectListDlg';
  import VirtualRouterListMultiSelectDlg from  'src/dialog/performance/VirtualRouterListMultiSelectDlg';
  import BackupStorageListMultiSelectListDlg from 'src/dialog/performance/BackupStorageListMultiSelectListDlg';
  import VIPMultiSelectList from 'src/dialog/performance/VIPMultiSelectList';
  import MetricListsDlg from 'src/dialog/zwatchalarm/MetricListsDlg';
  import PrimaryStorageListSingleSelectList from 'src/dialog/zwatchalarm/PrimaryStorageListSingleSelectList';
  import HostListSingleSelectList from 'src/dialog/zwatchalarm/HostListSingleSelectList';
  import RouterSingleSelectListDlg from  'src/dialog/zwatchalarm/RouterSingleSelectListDlg';
  import RouterMultiSelectListDlg from  'src/dialog/zwatchalarm/RouterMultiSelectListDlg';
  import PrimaryStorageListMultiSelectList from 'src/dialog/zwatchalarm/PrimaryStorageListMultiSelectList';
  import ZwatchAlaramMultiSelectDlg from 'src/dialog/zwatchEndPoint/ZwatchAlaramMultiSelect';
  import EmailServerSingleSelectDlg from 'src/dialog/email/EmailServerSingleSelectDlg';
  import EditAtPersonPhoneNumberDlg from 'src/dialog/zwatchEndPoint/EditAtPersonPhoneNumberDlg';
  import VolumeSingleSelectListDlg  from 'src/dialog/volume/VolumeSingleSelectListDlg';
  import VirtualRouterImageAndImageSingleSelectListDlg from 'src/dialog/image/SingleSelectList';
  import AffinityGroupListSingleSelectList from 'src/dialog/affinityGroup/SingleSelectDlg';
  import InstanceOfferingListSingleSelectDlg from 'src/dialog/instanceOffering/SingleSelectList';
  import VolumeOfferingListSingleSelectList from 'src/dialog/VolumeOffering/SingleSelectList';
  import ZoneListSingleSelectList from 'src/dialog/zone/SingleSelectList';
  import PrivateAndPublicL3NetworkSingleSelectListDlg from 'src/dialog/l3NetWork/PrivateAndPublicL3NetworkSingleSelectListDlg';
  import VirtualRouterVmInstanceListSingleSelectDlg from  'src/dialog/virtualRouter/SingleSelectList';
  import TemplateEditorDlg from 'src/dialog/resourceStack/TemplateEditorDlg';
  import  PreviewResourceStackDlg from 'src/dialog/resourceStack/PreviewResourceStackDlg';
  import ResourceStackTemplateSingleSelect from 'src/dialog/resourceTemplate/ResourceStackTemplateSingleSelect';
  import ClusterAttachVxlanPoolInputCidrPopupDlg from 'src/dialog/cluster/ClusterAttachVxlanPoolInputCidrPopupDlg';
  import L2NetWorkMultiSelectListDlg from 'src/dialog/l2NetWork/MultiSelectListDlg';
  import SetAlarmStrategyDlg from 'src/dialog/zwatchalarm/SetAlarmStrategyDlg';
  import ChooseWizardDlg from 'src/dialog/wizard/ChooseWizardDlg';
  import SimpleConfirmDlg from 'src/dialog/SimpleConfirmDlg';
  import vCenterPrivateAndPublicMultiSelectListConfirmDlg from 'src/dialog/vCenter/vCenterPrivateAndPublicMultiSelectListConfirmDlg'
  import NormalVmInstanceConfirmDlg from 'src/dialog/vCenterVmInstance/NormalVmInstanceConfirm';
  import VolumeMultiSelectListDlg  from 'src/dialog/volume/VolumeMultiSelectListDlg';
  import SetHaLevelDlg from 'src/dialog/vm/SetHaLevelDlg';
  import ModifyVmConsolePasswordConfirmDlg from 'src/dialog/vCenterVmInstance/ModifyVmConsolePasswordConfirmDlg';
  import AddDNSDlg from 'src/dialog/vCenterNetwork/AddDNSDlg';
  import CephPoolSingleDlg from 'src/dialog/ceph/CephPoolSingleSelect';
  import SetDefaultCDRomDlg from 'src/dialog/vm/SetDefaultCDRomDlg';
  import ZWatchEndPointSelect from 'src/dialog/zwatchEndPoint/ZWatchEndPointSelect';
  import RouterMultiSelectList from 'src/dialog/virtualRouter/RouterMultiSelectListDlg';
  import EipToVmListSingleSelectList from 'src/dialog/eip/EipToVmListSingleSelectList';
  import PortForwardingVmNicSingleSelect from 'src/dialog/portforwarding/PortForwardingVmNicSingleSelect';
  import LoadBalancerListenerVmNicSelect from 'src/dialog/loadBalancerListener/LoadBalancerListenerVmNicSelect';
  import ModifyMonDlg from 'src/dialog/webStorage/ModifyMonDlg';
  import SetPoolAliasNameDlg from 'src/dialog/webStorage/SetPoolAliasNameDlg';
  import ClearBsMessageDlg from 'src/dialog/backupStorage/ClearBsMessageDlg';
  import SecurityGroupMultiSelect from 'src/dialog/securityGroup/SecurityGroupMultiSelect';
  import BackUpDataBaseDataSelect from 'src/dialog/backupStorage/BackUpDataBaseDataSelect';
  import HybridAliCloudDataCenterSingleSelect from 'src/dialog/aliCloudDataCenter/HybridAliCloudDataCenterSingleSelect';
  import HybridAliCloudDataCenterMultiSelect from 'src/dialog/aliCloudDataCenter/HybridAliCloudDataCenterMultiSelect';
  import EditGlobalConfigDlg from 'src/dialog/hybridConfig/EditGlobalConfigDlg';
  import DeleteEcsInstaneDlg from 'src/dialog/hybridEcsInstance/DeleteEcsInstanceDlg';
  import HybridAliCloudImageSingleSelect from 'src/dialog/hybridAliCloudImage/HybridAliCloudImageSingleSelect';
  import HybridAliCloudSingleSelect from 'src/dialog/hybridAliCloudSecurity/HybridAliCloudSingleSelect';
  import HybridAliCloudSwitchSingleSelect from 'src/dialog/hybridAliCloudSwitch/HybridAliCloudSwitchSingleSelect';
  import HybridAliCloudInstanceOfferingSingleSelect from 'src/dialog/hybridAliCloudInstanceOffering/SingleSelectList';
  import DeleteBackupDataConfirm from 'src/dialog/volume/DeleteBackupDataConfirm';
  import HybridAliCloudVpcSingSelectList from 'src/dialog/hybridAliCloudVpc/SingleSelectList';
  import HybridModifyConsolePassword from 'src/dialog/hybridEcsInstance/HybridModifyConsolePassword';
  import HybridModifyRootPassword from 'src/dialog/hybridEcsInstance/HybridModifyRootPassword';
  import HybridAliCloudDiskMultiSelectList from 'src/dialog/hybridAliCloudDisk/MultiSelectList';
  import HybridAliCloudIdentityZoneSingleSelect from 'src/dialog/hybridAliCloudIdentityZone/SingleSelect';
  import HybridAliCloudEcsMultiSelect from 'src/dialog/hybridEcsInstance/MultiSelectList';
  import HybridAliCloudEcsSingleSelect from 'src/dialog/hybridEcsInstance/SingleSelect';
  import BaremetalClusterListMultiSelectList from 'src/dialog/cluster/BaremetalClusterListMultiSelectList';
  import BaremetalClusterListSingleSelectList from 'src/dialog/cluster/BaremetalClusterListSingleSelectList';
  import CreateBaremetalClusterDlg from  'src/dialog/cluster/CreateBaremetalClusterDlg';
  import ModifyVpcVRouterDlg from 'src/dialog/vpcVRouter/ModifyVpcVRouterDlg';
  import HybridAliCloudVpnGatewaySingleSelectList from 'src/dialog/hybridAliCloudVpnGateway/SingleSelectList';
  import HybridAliCloudUserVpnGatewaySingleSelectList from 'src/dialog/hybridAliCloudVpnVpcUserGateway/SingleSelectList';
  import AddRemoteNetWorkDlg from 'src/dialog/ipsec/AddRemoteNetWorkDlg';
  import HybridAliCloudVirtualBorderRouterSingleSelect from 'src/dialog/hybridAliCloudVirtualBorder/SingleSelectList';
  import HybridAliCloudAccessPointSingleSelect from 'src/dialog/hybridAliCloudAccessPoint/SingleSelectList';
  import HybridAliCloudVirtualRouterSingleSelect from 'src/dialog/hybridAliCloudVirtualRouter/SingleSelectList';
  import hybridAliCloudVirtualRouterInterfaceSelect from 'src/dialog/hybridAliCloudVirtualRouterInterface/SingleSelectList';
  import GpuDeviceMultiSelectListDlg from 'src/dialog/GpuDevice/GpuDeviceMultiSelectListDlg';

  //腾讯云
  import HybridTencentDataCenterSingleSelect from 'src/dialog/hybridTencentDataCenter/SingleSelect';
  import HybridTencentIdentityZoneSelect from 'src/dialog/hybridTencentIdentityZone/SingleSelect';
  import HybridTencentVpcSingleSelect from 'src/dialog/hybridTencentVpc/SingleSelectList';
  import HybridTencentInstanceOfferingSingleSelect from 'src/dialog/hybridTencentInstanceOffering/SingleSelectList';
  import HybridTencentImageSingleSelect from 'src/dialog/hybridTencentImage/SingleSelectList';
  import HybridTencentSecurityGroupSingleSelect from 'src/dialog/hybridTencentSecurityGroup/SingleSelectList';
  import HybridTencentSubNetsSingleSelect from 'src/dialog/hybridTencentSubNet/SingleSelectList';
  import HybridTencentEcsInstanceSingleSelect from 'src/dialog/hybridTencentEcs/SingleSelectList';
  import HybridTencentEcsInstanceMultiSelect from 'src/dialog/hybridTencentEcs/MultiSelectList';
  import HybridTencentEipSingleSelect from 'src/dialog/hybridTencentEip/SingleSelectList';
  import HybridTencentVpcVpnGateWaySingleSelect from 'src/dialog/hybridTencentVpn/SingleSelectList';
  import HybridTencentDiskMultiSelectList from 'src/dialog/hybridTencentDisk/MultiSelectList';
  import HybridTencentVpcVpnUserGateWaySelectList from 'src/dialog/hybridTencentUserVpnGateWay/SingleSelectList';

  //华为云
  import HybridHuaweiDataCenterSingleSelect from 'src/dialog/hybridHuaweiDataCenter/SingleSelectList';
  import UpdateHuaweiEcsRootPasswordDlg from 'src/dialog/hybridHuaweiEcs/UpdateHuaweiEcsRootPasswordDlg';
  import HybridHuaweiImageSingleSelect from 'src/dialog/hybridHuaweiImage/SingleSelectList';
  import HybridHuaweiSecurityGroupSingleSelect from 'src/dialog/hybridHuaweiSecurityGroup/SingleSelectList';
  import HybridHuaweiIdentityZoneSingleSelect from 'src/dialog/hybridHuaweiIdentityZone/SingleSelectList';
  import HybridHuaweiSubNetSelect from 'src/dialog/hybridHuaweiSubNet/SingleSelectList';
  import HybridHuaweiInstanceOfferingSelect from 'src/dialog/hybridHuaweiInstanceOffering/SingleSelectList';
  import HybridHuaweiEcsInstanceSingleSelect from 'src/dialog/hybridHuaweiEcs/SingleSelectList';
  import HybridHuaweiVpcSingleSelect from 'src/dialog/hybridHuaweiVpc/SingleSelect';

  dialogClass.ConfirmDlg = ConfirmDlg;
  dialogClass.UsbMultiSelectListDlg = UsbMultiSelectListDlg;
  dialogClass.CreateTagDlg = CreateTagDlg;
  dialogClass.AttachTagDlg = AttachTagDlg;
  dialogClass.VmSingleSelectListDlg = VmSingleSelectListDlg;
  dialogClass.VmInstanceMultiSelectListDlg = VmInstanceMultiSelectListDlg;
  dialogClass.RemindMigrateVolumeConfirmDlg = RemindMigrateVolumeConfirmDlg;
  dialogClass.ImageSingleSelectListDlg = ImageSingleSelectListDlg;
  dialogClass.SharetoAllConfirmDlg = SharetoAllConfirmDlg;
  dialogClass.BackupStorageSelectListConfirmDlg = BackupStorageSelectListConfirmDlg;
  dialogClass.DeleteZoneConfirmDlg=DeleteZoneConfirmDlg;
  dialogClass.DisableZoneConfirmDlg=DisableZoneConfirmDlg;
  dialogClass.ChangeResourceOwnerToAccountProjectSingleSelectListDlg = ChangeResourceOwnerToAccountProjectSingleSelectListDlg;
  dialogClass.AccountListDlg = AccountListDlg;
  dialogClass.ShareResourceToAccountProjectMultiSelectListConfirm = ShareResourceToAccountProjectMultiSelectListConfirm;
  dialogClass.SharedSelectList = SharedSelectList;
  dialogClass.UpdateStrategyForHostDlg = UpdateStrategyForHostDlg;
  dialogClass.DeleteClusterConfirm = DeleteClusterConfirm;
  dialogClass.DisableClusterConfirm = DisableClusterConfirm;
  dialogClass.LoadBalancerSingleSelectDlg = LoadBalancerSingleSelectDlg;
  dialogClass.LoadBalancerListenerMultiSelectListDlg = LoadBalancerListenerMultiSelectListDlg;
  dialogClass.L3NetworkSingleSelectListDlg = L3NetworkSingleSelectListDlg;
  dialogClass.L2NetworkSingleSelectListDlg = L2NetworkSingleSelectListDlg;
  dialogClass.SubNetworkSingleSelectListDlg = SubNetworkSingleSelectListDlg;
  dialogClass.VpcVRouterSingleSelectListDlg = VpcVRouterSingleSelectListDlg;
  dialogClass.VipSingleSelectListDlg = VipSingleSelectListDlg;
  dialogClass.SingleSelectListForL3CreatingDlg = SingleSelectListForL3CreatingDlg;
  dialogClass.ZwatchEndPointerMultiSelectListDlg = ZwatchEndPointerMultiSelectListDlg;
  dialogClass.SecurityGroupSingleSelectListDlg = SecurityGroupSingleSelectListDlg;
  dialogClass.PrimaryStorageAttachClusterDlg = PrimaryStorageAttachClusterDlg;
  dialogClass.ClusterSelectListDlg = ClusterSelectListDlg;
  dialogClass.VirtualRouterInstanceOfferingListSingleSelectDlg = VirtualRouterInstanceOfferingListSingleSelectDlg;
  dialogClass.ClusterAttachPrimaryStorageDlg = ClusterAttachPrimaryStorageDlg;
  dialogClass.UpdateCpuModelDlg = UpdateCpuModelDlg;
  dialogClass.SanStorageMultiSelectListDlg = SanStorageMultiSelectListDlg;
  dialogClass.UpdateUsbDeviceNameDlg = UpdateUsbDeviceNameDlg;
  dialogClass.CheckAddHostFileConfirmDlg = CheckAddHostFileConfirmDlg;
  dialogClass.LunMultiSelectListDlg = LunMultiSelectListDlg;
  dialogClass.ModifyPasswordDlg = ModifyPasswordDlg;
  dialogClass.LdapEntryMultiSelectListDlg = LdapEntryMultiSelectListDlg;
  dialogClass.ChangeUserPassWordDlg = ChangeUserPassWordDlg;
  dialogClass.UserSelectConfirmDlg = UserSelectConfirmDlg;
  dialogClass.VirtualRouterImageListSingleSelectDlg = VirtualRouterImageListSingleSelectDlg;
  dialogClass.BackupStorageSingleSelectListDlg = BackupStorageSingleSelectListDlg;
  dialogClass.VMBillingDetailDlg = VMBillingDetailDlg;
  dialogClass.DeleteBillingSettingsConfirmDlg = DeleteBillingSettingsConfirmDlg;
  dialogClass.ChangeTimerConfDlg = ChangeTimerConfDlg;
  dialogClass.UpdateStartTimeDlg = UpdateStartTimeDlg;
  dialogClass.AttachSchedulerJobDlg = AttachSchedulerJobDlg;
  dialogClass.VolumeSelectListForJob = VolumeSelectListForJob;
  dialogClass.UpdateAppPluginDlg = UpdateAppPluginDlg;
  dialogClass.DeleteLoadBalancerConfirm = DeleteLoadBalancerConfirm;
  dialogClass.DeleteEipConfirmDlg = DeleteEipConfirmDlg;
  dialogClass.SetConsoleProxyIpDlg = SetConsoleProxyIpDlg;
  dialogClass.HostListMultiSelectDlg = HostListMultiSelectDlg;
  dialogClass.L3NetworkMultiSelectListDlg = L3NetworkMultiSelectListDlg;
  dialogClass.VirtualRouterListMultiSelectDlg = VirtualRouterListMultiSelectDlg;
  dialogClass.BackupStorageListMultiSelectListDlg = BackupStorageListMultiSelectListDlg;
  dialogClass.VIPMultiSelectList = VIPMultiSelectList;
  dialogClass.MetricListsDlg = MetricListsDlg;
  dialogClass.PrimaryStorageListSingleSelectList = PrimaryStorageListSingleSelectList;
  dialogClass.HostListSingleSelectList = HostListSingleSelectList;
  dialogClass.RouterSingleSelectListDlg = RouterSingleSelectListDlg;
  dialogClass.RouterMultiSelectListDlg = RouterMultiSelectListDlg;
  dialogClass.PrimaryStorageListMultiSelectList = PrimaryStorageListMultiSelectList;
  dialogClass.ZwatchAlaramMultiSelectDlg = ZwatchAlaramMultiSelectDlg;
  dialogClass.EmailServerSingleSelectDlg = EmailServerSingleSelectDlg;
  dialogClass.EditAtPersonPhoneNumberDlg = EditAtPersonPhoneNumberDlg;
  dialogClass.VolumeSingleSelectListDlg = VolumeSingleSelectListDlg;
  dialogClass.VirtualRouterImageAndImageSingleSelectListDlg = VirtualRouterImageAndImageSingleSelectListDlg;
  dialogClass.AffinityGroupListSingleSelectList = AffinityGroupListSingleSelectList;
  dialogClass.InstanceOfferingListSingleSelectDlg = InstanceOfferingListSingleSelectDlg;
  dialogClass.VolumeOfferingListSingleSelectList  = VolumeOfferingListSingleSelectList;
  dialogClass.ZoneListSingleSelectList  = ZoneListSingleSelectList;
  dialogClass.PrivateAndPublicL3NetworkSingleSelectListDlg = PrivateAndPublicL3NetworkSingleSelectListDlg;
  dialogClass.VirtualRouterVmInstanceListSingleSelectDlg = VirtualRouterVmInstanceListSingleSelectDlg;
  dialogClass.TemplateEditorDlg = TemplateEditorDlg;
  dialogClass.PreviewResourceStackDlg = PreviewResourceStackDlg;
  dialogClass.ResourceStackTemplateSingleSelect = ResourceStackTemplateSingleSelect;
  dialogClass.ClusterAttachVxlanPoolInputCidrPopupDlg = ClusterAttachVxlanPoolInputCidrPopupDlg;
  dialogClass.L2NetWorkMultiSelectListDlg = L2NetWorkMultiSelectListDlg;
  dialogClass.SetAlarmStrategyDlg = SetAlarmStrategyDlg;
  dialogClass.ChooseWizardDlg = ChooseWizardDlg;
  dialogClass.SimpleConfirmDlg = SimpleConfirmDlg;
  dialogClass.vCenterPrivateAndPublicMultiSelectListConfirmDlg = vCenterPrivateAndPublicMultiSelectListConfirmDlg;
  dialogClass.NormalVmInstanceConfirmDlg = NormalVmInstanceConfirmDlg;
  dialogClass.VolumeMultiSelectListDlg = VolumeMultiSelectListDlg;
  dialogClass.SetHaLevelDlg = SetHaLevelDlg;
  dialogClass.ModifyVmConsolePasswordConfirmDlg = ModifyVmConsolePasswordConfirmDlg;
  dialogClass.AddDNSDlg = AddDNSDlg;
  dialogClass.CephPoolSingleDlg = CephPoolSingleDlg;
  dialogClass.SetDefaultCDRomDlg = SetDefaultCDRomDlg;
  dialogClass.ZWatchEndPointSelect = ZWatchEndPointSelect;
  dialogClass.RouterMultiSelectList = RouterMultiSelectList;
  dialogClass.EipToVmListSingleSelectList = EipToVmListSingleSelectList;
  dialogClass.PortForwardingVmNicSingleSelect = PortForwardingVmNicSingleSelect;
  dialogClass.LoadBalancerListenerVmNicSelect = LoadBalancerListenerVmNicSelect;
  dialogClass.ModifyMonDlg = ModifyMonDlg;
  dialogClass.SetPoolAliasNameDlg = SetPoolAliasNameDlg;
  dialogClass.ClearBsMessageDlg = ClearBsMessageDlg;
  dialogClass.SecurityGroupMultiSelect = SecurityGroupMultiSelect;
  dialogClass.BackUpDataBaseDataSelect = BackUpDataBaseDataSelect;
  dialogClass.HybridAliCloudDataCenterSingleSelect = HybridAliCloudDataCenterSingleSelect;
  dialogClass.EditGlobalConfigDlg = EditGlobalConfigDlg;
  dialogClass.DeleteEcsInstaneDlg = DeleteEcsInstaneDlg;
  dialogClass.HybridAliCloudImageSingleSelect = HybridAliCloudImageSingleSelect;
  dialogClass.HybridAliCloudSingleSelect = HybridAliCloudSingleSelect;
  dialogClass.HybridAliCloudSwitchSingleSelect = HybridAliCloudSwitchSingleSelect;
  dialogClass.HybridAliCloudInstanceOfferingSingleSelect = HybridAliCloudInstanceOfferingSingleSelect;
  dialogClass.DeleteBackupDataConfirm = DeleteBackupDataConfirm;
  dialogClass.HybridAliCloudVpcSingSelectList = HybridAliCloudVpcSingSelectList;
  dialogClass.HybridModifyConsolePassword = HybridModifyConsolePassword;
  dialogClass.HybridModifyRootPassword = HybridModifyRootPassword;
  dialogClass.HybridAliCloudDiskMultiSelectList = HybridAliCloudDiskMultiSelectList;
  dialogClass.HybridAliCloudIdentityZoneSingleSelect = HybridAliCloudIdentityZoneSingleSelect;
  dialogClass.HybridAliCloudEcsMultiSelect = HybridAliCloudEcsMultiSelect;
  dialogClass.HybridAliCloudEcsSingleSelect = HybridAliCloudEcsSingleSelect;
  dialogClass.BaremetalClusterListMultiSelectList = BaremetalClusterListMultiSelectList;
  dialogClass.BaremetalClusterListSingleSelectList = BaremetalClusterListSingleSelectList;
  dialogClass.CreateBaremetalClusterDlg = CreateBaremetalClusterDlg;
  dialogClass.ModifyVpcVRouterDlg = ModifyVpcVRouterDlg;
  dialogClass.HybridAliCloudVpnGatewaySingleSelectList = HybridAliCloudVpnGatewaySingleSelectList;
  dialogClass.HybridAliCloudUserVpnGatewaySingleSelectList = HybridAliCloudUserVpnGatewaySingleSelectList;
  dialogClass.AddRemoteNetWorkDlg = AddRemoteNetWorkDlg;
  dialogClass.SubNetworkMultiSelectListDlg = SubNetworkMultiSelectListDlg;
  dialogClass.HybridAliCloudDataCenterMultiSelect = HybridAliCloudDataCenterMultiSelect;
  dialogClass.HybridAliCloudVirtualBorderRouterSingleSelect = HybridAliCloudVirtualBorderRouterSingleSelect;
  dialogClass.HybridAliCloudAccessPointSingleSelect = HybridAliCloudAccessPointSingleSelect;
  dialogClass.HybridAliCloudVirtualRouterSingleSelect = HybridAliCloudVirtualRouterSingleSelect;
  dialogClass.hybridAliCloudVirtualRouterInterfaceSelect = hybridAliCloudVirtualRouterInterfaceSelect;
  dialogClass.GpuDeviceMultiSelectListDlg = GpuDeviceMultiSelectListDlg;
  dialogClass.VMChangeImageConfirmDlg = VMChangeImageConfirmDlg;

  //腾讯云
  dialogClass.HybridTencentDataCenterSingleSelect = HybridTencentDataCenterSingleSelect;
  dialogClass.HybridTencentIdentityZoneSelect = HybridTencentIdentityZoneSelect;
  dialogClass.HybridTencentVpcSingleSelect = HybridTencentVpcSingleSelect;
  dialogClass.HybridTencentInstanceOfferingSingleSelect = HybridTencentInstanceOfferingSingleSelect;
  dialogClass.HybridTencentImageSingleSelect = HybridTencentImageSingleSelect;
  dialogClass.HybridTencentSecurityGroupSingleSelect = HybridTencentSecurityGroupSingleSelect;
  dialogClass.HybridTencentSubNetsSingleSelect = HybridTencentSubNetsSingleSelect;
  dialogClass.HybridTencentEcsInstanceSingleSelect = HybridTencentEcsInstanceSingleSelect;
  dialogClass.HybridTencentEipSingleSelect = HybridTencentEipSingleSelect;
  dialogClass.HybridTencentVpcVpnGateWaySingleSelect = HybridTencentVpcVpnGateWaySingleSelect;
  dialogClass.HybridTencentDiskMultiSelectList = HybridTencentDiskMultiSelectList;
  dialogClass.HybridTencentVpcVpnUserGateWaySelectList = HybridTencentVpcVpnUserGateWaySelectList;
  dialogClass.HybridTencentEcsInstanceMultiSelect = HybridTencentEcsInstanceMultiSelect;

  //华为云
  dialogClass.HybridHuaweiDataCenterSingleSelect =   HybridHuaweiDataCenterSingleSelect;
 // dialogClass.UpdateHuaweiEcsRootPasswordDlg = UpdateHuaweiEcsRootPasswordDlg;
  dialogClass.HybridHuaweiImageSingleSelect = HybridHuaweiImageSingleSelect;
  dialogClass.HybridHuaweiSecurityGroupSingleSelect = HybridHuaweiSecurityGroupSingleSelect;
  dialogClass.HybridHuaweiIdentityZoneSingleSelect = HybridHuaweiIdentityZoneSingleSelect;
  dialogClass.HybridHuaweiSubNetSelect = HybridHuaweiSubNetSelect;
  dialogClass.HybridHuaweiInstanceOfferingSelect = HybridHuaweiInstanceOfferingSelect;
  dialogClass.HybridHuaweiEcsInstanceSingleSelect = HybridHuaweiEcsInstanceSingleSelect;
  dialogClass.HybridHuaweiVpcSingleSelect = HybridHuaweiVpcSingleSelect;

  export default {
    name: 'DialogManager',
    created: function () {
    },
    data: function () {
      return {
      }
    },
    computed: {
      dialogList: function () {
        const self = this;
        let list = [];
        this.$store.state.dialogManager.windowIdList.forEach((windowId) => {
          list.push({
            windowId,
            class: dialogClass[self.$store.state.dialogManager.windows[windowId].className],
            param: self.$store.state.dialogManager.windows[windowId].param.windowParam,
            zIndex: self.$store.state.dialogManager.windows[windowId].zIndex
          })
        });
        return list
      }
    }
  }
</script>

<style scoped>
</style>
