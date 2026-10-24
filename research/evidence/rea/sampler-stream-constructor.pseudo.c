
undefined8 *
__ZN2dj5audio10BassStreamC2EiPNS0_16BassRecordStreamEPNS_10TempoClockEPNS0_16TrackLoadManagerERK5QListIiEP7QObject
          (undefined8 *param_1,undefined8 param_2,undefined8 param_3,undefined8 param_4,
          undefined8 param_5,undefined8 param_6,long param_7)

{
  uint uVar1;
  undefined4 uVar2;
  undefined *puVar3;
  undefined *puVar4;
  undefined *puVar5;
  code *pcVar6;
  int *piVar7;
  int iVar8;
  undefined8 *puVar9;
  undefined8 uVar10;
  void *pvVar11;
  ulong uVar12;
  long lVar13;
  undefined4 *puVar14;
  undefined1 auVar15 [16];
  undefined1 auStack_170 [8];
  undefined1 auStack_168 [8];
  undefined1 auStack_160 [8];
  undefined1 auStack_158 [8];
  undefined1 auStack_150 [8];
  undefined1 auStack_148 [8];
  undefined1 auStack_140 [8];
  undefined1 auStack_138 [8];
  undefined1 auStack_130 [8];
  undefined1 auStack_128 [8];
  undefined1 auStack_120 [8];
  undefined1 auStack_118 [8];
  undefined1 auStack_110 [8];
  undefined1 auStack_108 [8];
  undefined1 auStack_100 [8];
  undefined1 auStack_f8 [8];
  undefined1 auStack_f0 [8];
  undefined1 auStack_e8 [8];
  undefined1 auStack_e0 [8];
  undefined1 auStack_d8 [8];
  undefined1 auStack_d0 [8];
  int *local_c8 [3];
  char local_a9;
  code *local_a8;
  undefined8 uStack_a0;
  code *local_90;
  int *local_88;
  undefined8 uStack_80;
  long local_70;
  
  local_70 = *(long *)PTR____stack_chk_guard_10172c568;
  puVar9 = (undefined8 *)__ZN7QObjectC2EPS_(param_1,param_7);
  *puVar9 = &PTR___ZNK2dj19IBeatProgressSource10metaObjectEv_10173f3a8;
  __ZN2dj5audio15SplitterManagerC2Ev(puVar9 + 2);
  __ZN2dj5audio4DeckC2Ev(param_1 + 0xe);
  *param_1 = &PTR___ZNK2dj5audio10BassStream10metaObjectEv_101738540;
  param_1[0xe] = &PTR___ZThn112_N2dj5audio10BassStream13getDeckVolumeEv_101738608;
  param_1[0x11] = &PTR___ZThn136_N2dj5audio10BassStream20receiveBeatFromTrackExd_101738638;
  __ZN2dj5dbase10QOBUZTrackC1Ev(param_1 + 0x12);
  __ZN20QOBUZTrackDownloaderC1Ev(param_1 + 0x34);
  param_1[0x3c] = 0;
  *(undefined1 *)(param_1 + 0x42) = 0;
  param_1[0x3f] = 0;
  param_1[0x40] = 0;
  param_1[0x3e] = 0;
  *(undefined4 *)(param_1 + 0x41) = 0;
  param_1[0x44] = 0;
  param_1[0x43] = 0;
  param_1[0x46] = 0;
  param_1[0x45] = 0;
  param_1[0x48] = 0;
  param_1[0x47] = 0;
  __ZN13AudioPropertyC1Eddd(ZEXT816(0),0x4059000000000000,0x4059000000000000,param_1 + 0x4a);
  __ZN13AudioPropertyC1Eddd(ZEXT816(0xc038000000000000),0x4018000000000000,0,param_1 + 0x54);
  __ZN13AudioPropertyC1Eddd(ZEXT816(0xc028000000000000),0x4028000000000000,0,param_1 + 0x5e);
  *(undefined2 *)(param_1 + 0x68) = 0x101;
  __ZN13AudioPropertyC1Eddd(ZEXT816(0xc059000000000000),0x4059000000000000,0,param_1 + 0x69);
  __ZN13AudioPropertyC1Eddd(ZEXT816(0xc059000000000000),0x4059000000000000,0,param_1 + 0x73);
  __ZN13AudioPropertyC1Eddd(ZEXT816(0xc059000000000000),0x4059000000000000,0,param_1 + 0x7d);
  __ZN13AudioPropertyC1Eddd
            (ZEXT816(0x3f50624de0000000),0x4000000000000000,0x3ff0000000000000,param_1 + 0x87);
  __ZN13AudioPropertyC1Eddd(ZEXT816(0xc02e000000000000),0x4008000000000000,0,param_1 + 0x91);
  __ZN13AudioPropertyC1Eddd(ZEXT816(0xc02e000000000000),0x4008000000000000,0,param_1 + 0x9b);
  __ZN13AudioPropertyC1Eddd(ZEXT816(0xc02e000000000000),0x4008000000000000,0,param_1 + 0xa5);
  __ZN13AudioPropertyC1Eddd(ZEXT816(0xbff0000000000000),0x3ff0000000000000,0,param_1 + 0xaf);
  __ZN13AudioPropertyC1Eddd(ZEXT816(0xbff0000000000000),0x3ff0000000000000,0,param_1 + 0xb9);
  __ZN13AudioPropertyC1Eddd(ZEXT816(0xbff0000000000000),0x3ff0000000000000,0,param_1 + 0xc3);
  param_1[0xe1] = 0;
  *(undefined4 *)(param_1 + 0xe2) = 0;
  param_1[0xe4] = 0;
  param_1[0xe3] = 0;
  param_1[0xcf] = 0;
  param_1[0xce] = 0;
  param_1[0xd1] = 0;
  param_1[0xd0] = 0;
  *(undefined8 *)((long)param_1 + 0x694) = 0;
  *(undefined8 *)((long)param_1 + 0x68c) = 0;
  param_1[0xd5] = 0;
  param_1[0xd4] = 0;
  param_1[0xd7] = 0;
  param_1[0xd6] = 0;
  param_1[0xd9] = 0;
  param_1[0xd8] = 0;
  param_1[0xdb] = 0;
  param_1[0xda] = 0;
  param_1[0xdd] = 0;
  param_1[0xdc] = 0;
  param_1[0xdf] = 0;
  param_1[0xde] = 0;
  *(undefined4 *)(param_1 + 0xe5) = 0x3f800000;
  __ZN13AudioPropertyC1Eddd
            (ZEXT816(0x3fa0000000000000),0x4050000000000000,0x4010000000000000,param_1 + 0xea);
  param_1[0xf5] = param_6;
  param_1[0xf8] = 0;
  param_1[0xf7] = 0;
  uVar10 = __ZN9QDateTime22currentMSecsSinceEpochEv();
  param_1[0xfc] = 0x7ff8000000000000;
  param_1[0x106] = uVar10;
  param_1[0x108] = uVar10;
  param_1[0xff] = 0;
  param_1[0xfe] = 0;
  param_1[0x105] = uVar10;
  param_1[0x107] = uVar10;
  param_1[0x101] = 0;
  param_1[0x100] = 0;
  *(undefined1 *)(param_1 + 0xfb) = 0;
  *(undefined4 *)(param_1 + 0x102) = 0xac44;
  *(undefined1 *)(param_1 + 0x104) = 0;
  uVar10 = __ZN9QDateTime22currentMSecsSinceEpochEv();
  param_1[0x10b] = 0x7ff8000000000000;
  param_1[0x115] = uVar10;
  param_1[0x10d] = 0;
  param_1[0x117] = uVar10;
  param_1[0x114] = uVar10;
  param_1[0x10f] = 0;
  param_1[0x10e] = 0;
  param_1[0x116] = uVar10;
  param_1[0x110] = 0;
  *(undefined1 *)(param_1 + 0x10a) = 0;
  *(undefined4 *)(param_1 + 0x111) = 0xac44;
  *(undefined1 *)(param_1 + 0x113) = 0;
  param_1[0x11c] = 0;
  param_1[0x11e] = 0;
  param_1[0x11d] = 0;
  param_1[0x120] = 0;
  param_1[0x122] = 0;
  param_1[0x121] = 0;
  param_1[0x12d] = 0;
  param_1[300] = 0;
  param_1[0x12e] = 0;
  *(undefined8 *)((long)param_1 + 0x97c) = 1;
  __ZN2dj5audio14ScratcherProxyC1EPNS0_14PositionStructES3_P7QObject
            (param_1 + 0x136,param_1 + 0x10a,param_1 + 0xfb,0);
  __ZN2dj5audio9ScratcherC1EPNS0_14PositionStructE(param_1 + 0x146,param_1 + 0x10a);
  __ZN2dj5audio18BassCircularBufferC1ERK5QListIiERKiP7QObject
            (param_1 + 0x1886b,param_6,(long)param_1 + 0x7c,param_1);
  __ZN2dj5audio9ScratcherC1EPNS0_14PositionStructE(param_1 + 0x18910,param_1 + 0xfb);
  __ZN2dj5audio18BassCircularBufferC1ERK5QListIiERKiP7QObject
            (param_1 + 0x31035,param_6,(long)param_1 + 0x7c,param_1);
  param_1[0x310dd] = 0;
  *(undefined4 *)(param_1 + 0x310de) = 0;
  param_1[0x310ec] = 0;
  param_1[0x310e9] = 0;
  param_1[0x310ea] = 0;
  param_1[0x310e8] = 0;
  __ZN6QTimerC1EP7QObject(param_1 + 0x310fe,param_1);
  *(undefined4 *)((long)param_1 + 0x188884) = 2;
  pvVar11 = (void *)__Znam(0x10);
  param_1[0x3110f] = pvVar11;
  *(undefined4 *)(param_1 + 0x31110) = 0;
  _memset_pattern16(pvVar11,&DAT_1014487f0,0x10);
  param_1[0x31112] = 0x3ff0000000000000;
  param_1[0x31111] = 0x4000000000000000;
  *(undefined2 *)(param_1 + 0x31109) = 0;
  param_1[0x3110b] = 0;
  param_1[0x3110a] = 0;
  param_1[0x3110c] = 0x7ff8000000000000;
  param_1[0x3110e] = 0;
  param_1[0x3110d] = 0;
  param_1[0x3111b] = 0;
  param_1[0x3111d] = 0;
  *(undefined4 *)(param_1 + 0x3111e) = 0;
  param_1[0x3111f] = 0;
  __ZN15QRecursiveMutex7tryLockEi(param_1 + 0x3111d,0xffffffff);
  param_1[0x31122] = 0xffffffffffffffff;
  param_1[0x31123] = 0xffffffffffffffff;
  param_1[0x31121] = 0xffffffffffffffff;
  *(undefined2 *)(param_1 + 0x31120) = 0;
  *(undefined4 *)((long)param_1 + 0x188904) = 0;
  __ZN15QRecursiveMutex6unlockEv(param_1 + 0x3111d);
  param_1[0x31124] = 0;
  *(undefined4 *)(param_1 + 0x31125) = 0;
  param_1[0x31126] = 0;
  __ZN15QRecursiveMutex7tryLockEi(param_1 + 0x31124,0xffffffff);
  param_1[0x31129] = 0xffffffffffffffff;
  param_1[0x3112a] = 0xffffffffffffffff;
  param_1[0x31128] = 0xffffffffffffffff;
  *(undefined2 *)(param_1 + 0x31127) = 0;
  *(undefined4 *)((long)param_1 + 0x18893c) = 0;
  __ZN15QRecursiveMutex6unlockEv(param_1 + 0x31124);
  param_1[0x3112d] = 0;
  param_1[0x3112c] = 0;
  param_1[0x3112b] = 0;
  param_1[0x3113d] = 0;
  param_1[0x3113f] = 0;
  param_1[0x3113e] = 0;
  __ZN13AudioPropertyC1Eddd(ZEXT816(0xbff0000000000000),0x3ff0000000000000,0,param_1 + 0x31141);
  *(undefined4 *)(param_1 + 0x3114c) = 0x3f800000;
  *(undefined1 *)((long)param_1 + 0x188a64) = 0;
  uVar10 = NEON_fmov(0x3f800000,4);
  param_1[0x3114d] = uVar10;
  *(undefined4 *)(param_1 + 0x3114e) = 2;
  *(undefined4 *)((long)param_1 + 0x188a7c) = 0x3f800000;
  *(undefined8 *)((long)param_1 + 0x188a74) = uVar10;
  param_1[0x31150] = 0x3f80000000000002;
  param_1[0x3115e] = 0;
  *(undefined4 *)(param_1 + 0x31163) = 1;
  param_1[0x3116d] = 0;
  param_1[0x3116f] = 0;
  param_1[0x3116e] = 0;
  param_1[0x31165] = 0;
  param_1[0x31164] = 0;
  *(undefined4 *)(param_1 + 0x31166) = 0;
  param_1[0x31168] = 0;
  param_1[0x31167] = 0;
  param_1[0x3116a] = 0;
  param_1[0x31169] = 0;
  param_1[0x3116b] = 0;
  param_1[0x31170] = 2;
  *(undefined4 *)(param_1 + 0x31171) = 0;
  *(undefined8 *)((long)param_1 + 0x188c94) = 0;
  *(undefined8 *)((long)param_1 + 0x188c8c) = 0;
  param_1[0x3118f] = 0;
  param_1[0x3118e] = 0;
  param_1[0x31191] = 0;
  param_1[0x31190] = 0;
  param_1[0x3118b] = 0;
  param_1[0x3118a] = 0;
  param_1[0x3118d] = 0;
  param_1[0x3118c] = 0;
  param_1[0x31187] = 0;
  param_1[0x31186] = 0;
  param_1[0x31189] = 0;
  param_1[0x31188] = 0;
  param_1[0x31183] = 0;
  param_1[0x31182] = 0;
  param_1[0x31185] = 0;
  param_1[0x31184] = 0;
  param_1[0x3117f] = 0;
  param_1[0x3117e] = 0;
  param_1[0x31181] = 0;
  param_1[0x31180] = 0;
  param_1[0x3117b] = 0;
  param_1[0x3117a] = 0;
  param_1[0x3117d] = 0;
  param_1[0x3117c] = 0;
  param_1[0x31177] = 0;
  param_1[0x31176] = 0;
  param_1[0x31179] = 0;
  param_1[0x31178] = 0;
  param_1[0x31173] = 0;
  param_1[0x31172] = 0;
  param_1[0x31175] = 0;
  param_1[0x31174] = 0;
  *(undefined4 *)(param_1 + 0x31196) = 0;
  param_1[0x31195] = 0;
  param_1[0x31194] = 0;
  __ZN6QImageC1Ev(param_1 + 0x31197);
  param_1[0x3119c] = 0;
  param_1[0x3119b] = 0;
  param_1[0x3119a] = 0;
  *(undefined4 *)(param_1 + 0x3119d) = 0xffffffff;
  *(undefined8 *)((long)param_1 + 0x188cec) = 0;
  param_1[0x3119f] = 0;
  param_1[0x311a1] = 0;
  param_1[0x311a0] = 0;
  *(undefined1 *)(param_1 + 0x311a2) = 0;
  param_1[0x311a4] = 0;
  param_1[0x311a3] = 0;
  param_1[0x311a6] = 0;
  param_1[0x311a5] = 0;
  *(undefined8 *)((long)param_1 + 0x188d3c) = 0;
  *(undefined8 *)((long)param_1 + 0x188d34) = 0;
  *(undefined8 *)((long)param_1 + 0x188d44) = 0xc61c3c00;
  param_1[0x311aa] = 0x4056800000000000;
  param_1[0x311ab] = 0xffffffffffffffff;
  param_1[0x311b5] = 0;
  param_1[0x311b7] = 0;
  param_1[0x311b6] = 0;
  param_1[0x311ad] = 0;
  param_1[0x311ac] = 0;
  param_1[0x311af] = 0;
  param_1[0x311ae] = 0;
  *(undefined1 *)(param_1 + 0x311b0) = 0;
  *(undefined8 *)((long)param_1 + 0x188d8c) = 0;
  *(undefined8 *)((long)param_1 + 0x188d84) = 0;
  *(undefined8 *)((long)param_1 + 0x188d9c) = 0;
  *(undefined8 *)((long)param_1 + 0x188d94) = 0;
  *(undefined1 *)(param_1 + 0x311b8) = 1;
  *(undefined4 *)(param_1 + 0x311b9) = 0xffffffff;
  param_1[0x311ba] = 0xbff0000000000000;
  *(undefined1 *)(param_1 + 0x311bb) = 0;
  *(undefined4 *)((long)param_1 + 0x188ddc) = 0;
  *(undefined4 *)((long)param_1 + 0x1886f4) = 0;
  *(undefined4 *)(param_1 + 0x310e4) = 0;
  *(undefined1 *)(param_1 + 0x11b) = 1;
  *(undefined1 *)(param_1 + 0x119) = 0;
  *(undefined2 *)((long)param_1 + 0x8c9) = 0;
  param_1[0x11a] = 0;
  param_1[0xf6] = param_5;
  *(undefined1 *)(param_1 + 0xf9) = 0;
  *(undefined4 *)((long)param_1 + 0x7cc) = 0x42c80000;
  param_1[0xfa] = 0;
  *(undefined4 *)((long)param_1 + 0x7a4) = 0xffffffff;
  *(undefined4 *)(param_1 + 0x310e3) = 0;
  *(undefined1 *)((long)param_1 + 0x8d9) = 0;
  *(undefined1 *)((long)param_1 + 0x18871e) = 0;
  param_1[0x128] = 0;
  param_1[0x127] = 0;
  param_1[0x12a] = 0;
  param_1[0x129] = 0;
  param_1[299] = 0;
  param_1[0x126] = 0x3ff0000000000000;
  *(undefined4 *)(param_1 + 0x135) = 1;
  *(undefined4 *)((long)param_1 + 0x984) = 2;
  *(undefined4 *)(param_1 + 0x31108) = 0;
  *(undefined4 *)(param_1 + 0x31162) = 0;
  param_1[0x31161] = param_4;
  *(undefined4 *)(param_1 + 0x3115c) = 0;
  param_1[0x134] = 0x3ff0000000000000;
  *(undefined1 *)(param_1 + 0x31160) = 1;
  *(undefined4 *)(param_1 + 0xcd) = 0;
  *(undefined4 *)(param_1 + 0xe6) = 0;
  *(undefined2 *)(param_1 + 0x310e1) = 0x100;
  param_1[0x310e2] = 0x4010000000000000;
  *(undefined1 *)(param_1 + 0x49) = 1;
  param_1[0x31113] = 0xffffffffffffffff;
  *(undefined1 *)(param_1 + 0x310df) = 0;
  param_1[0x31] = 0;
  *(undefined4 *)(param_1 + 0x32) = 0;
  uVar1 = DAT_11a05d09c;
  if ((int)DAT_11a05d09c < 0xac45) {
    uVar1 = 0xac44;
  }
  if (param_1[0xe1] != 0) {
    __ZdlPv();
    param_1[0xe1] = 0;
  }
  uVar10 = __Znam((ulong)uVar1 << 2);
  param_1[0xe1] = uVar10;
  *(uint *)(param_1 + 0xe2) = uVar1;
  __ZN7QString6numberEii(&local_a8,param_2,10);
  __ZN7QString8fromUtf8E14QByteArrayView(&local_90,4,"Deck");
  __ZN7QString6appendERKS_(&local_90,&local_a8);
  __ZN7QObject13setObjectNameERK7QString(param_1,&local_90);
  if (local_90 != (code *)0x0) {
    LOAcquire();
    iVar8 = *(int *)local_90;
    *(int *)local_90 = iVar8 + -1;
    LORelease();
    if (iVar8 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_90,2,8);
    }
  }
  if (local_a8 != (code *)0x0) {
    LOAcquire();
    iVar8 = *(int *)local_a8;
    *(int *)local_a8 = iVar8 + -1;
    LORelease();
    if (iVar8 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_a8,2,8);
    }
  }
  *(undefined2 *)(param_1 + 0x3111c) = 0;
  uVar2 = *(undefined4 *)((long)param_1 + 0x7c);
  __ZN8QVariantC1Eb(&local_90,0);
  __ZN2dj5audio10BassStream23stream_property_changedENS_9AUDIOEnumEi8QVariant
            (param_1,7,uVar2,&local_90);
  __ZN8QVariantD1Ev(&local_90);
  param_1[0x310fd] = 0;
  *(undefined2 *)(param_1 + 0x310ed) = 1;
  *(undefined1 *)(param_1 + 0x31137) = 0;
  *(undefined4 *)(param_1 + 0x31140) = 0;
  param_1[0x3115d] = 0xffffffffffffffff;
  param_1[0x31106] = param_3;
  param_1[0x33] = 0;
  *(undefined4 *)(param_1 + 0x31107) = 0;
  param_1[0x3113c] = 0;
  param_1[0x31138] = 0;
  param_1[0x3113a] = 0;
  param_1[0x31139] = 0;
  *(undefined1 *)(param_1 + 0x3113b) = 0;
  *(undefined4 *)(param_1 + 0x310eb) = 0xffffffff;
  param_1[0x3114b] = 0;
  *(int *)((long)param_1 + 0x7c) = (int)param_2;
  param_1[0x3112e] = 0;
  param_1[0x310e7] = 0;
  param_1[0x310e6] = 0;
  param_1[0x310e0] = 0x3ff0000000000000;
  *(undefined4 *)((long)param_1 + 0x188844) = 0x3f800000;
  uVar10 = __ZN2dj16settings_manager8instanceEv();
  __ZN7QString6numberEii(&local_a8,*(undefined4 *)((long)param_1 + 0x7c),10);
  __ZN7QString8fromUtf8E14QByteArrayView(local_c8,10,"zoom_level");
  __ZN7QString6appendERKS_(local_c8,&local_a8);
  __ZN2dj16settings_manager12get_propertyENS_21SettingsCategory_enumE7QString
            (&local_90,uVar10,0xb,local_c8);
  uVar12 = __ZN7QString17toIntegral_helperE11QStringViewPbi(uStack_80,local_88,&local_a9,10);
  if (uVar12 != (long)(int)uVar12) {
    uVar12 = 0;
    local_a9 = '\0';
  }
  if (local_90 != (code *)0x0) {
    LOAcquire();
    iVar8 = *(int *)local_90;
    *(int *)local_90 = iVar8 + -1;
    LORelease();
    if (iVar8 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_90,2,8);
    }
  }
  if (local_c8[0] != (int *)0x0) {
    LOAcquire();
    iVar8 = *local_c8[0];
    *local_c8[0] = iVar8 + -1;
    LORelease();
    if (iVar8 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_c8[0],2,8);
    }
  }
  if (local_a8 != (code *)0x0) {
    LOAcquire();
    iVar8 = *(int *)local_a8;
    *(int *)local_a8 = iVar8 + -1;
    LORelease();
    if (iVar8 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_a8,2,8);
    }
  }
  if (local_a9 == '\x01') {
    if (uVar12 < 9) {
      if (uVar12 < 5) {
        iVar8 = 4 - (int)uVar12;
      }
      else {
        iVar8 = (int)uVar12 + -4;
      }
    }
    else {
      iVar8 = 2;
    }
    *(int *)((long)param_1 + 0x984) = iVar8;
  }
  *(undefined1 *)(param_1 + 0xf) = 0;
  *(undefined4 *)((long)param_1 + 0x188ab4) = 0;
  __ZN6QTimer13setSingleShotEb(param_1 + 0x310fe,1);
  __ZN7QObject7connectEPKS_PKcS1_S3_N2Qt14ConnectionTypeE
            (auStack_d0,param_1 + 0x310fe,"2timeout ()",param_1,"1receive_scratch_timed_out()",0);
  __ZN11QMetaObject10ConnectionD1Ev(auStack_d0);
  auVar15 = NEON_fmov(0xbff0000000000000,8);
  param_1[0x31117] = auVar15._8_8_;
  param_1[0x31116] = auVar15._0_8_;
  param_1[0x31119] = 0;
  param_1[0x31118] = 0;
  auVar15 = NEON_fmov(0x3f800000,4);
  param_1[0x31115] = auVar15._8_8_;
  param_1[0x31114] = auVar15._0_8_;
  *(undefined2 *)(param_1 + 0xd3) = 0;
  *(undefined4 *)(param_1 + 0xe0) = 0;
  *(undefined1 *)((long)param_1 + 0x18871c) = 0;
  param_1[0x31103] = 0;
  param_1[0x31102] = 0;
  param_1[0x31105] = 0;
  param_1[0x31104] = 0;
  __ZN2dj5audio10BassStream11initEffectsEv(param_1);
  *(undefined4 *)(param_1 + 0x3115a) = 0;
  param_1[0x31159] = 0;
  param_1[0x31158] = 0;
  param_1[0x31157] = 0;
  param_1[0x3111a] = 0xffffffffffffffff;
  *(undefined1 *)(param_1 + 0x31101) = 0;
  *(undefined4 *)(param_1 + 0x3112f) = 0;
  param_1[0x31130] = 0;
  param_1[0x31155] = 0;
  *(undefined4 *)(param_1 + 0x31156) = 0;
  *(undefined4 *)(param_1 + 0x3d) = 0;
  param_1[0x31107] = 0;
  *(undefined1 *)((long)param_1 + 0x18871d) = 0;
  uVar2 = *(undefined4 *)((long)param_1 + 0x7c);
  __ZN8QVariantC1Eb(&local_90,0);
  __ZN2dj5audio10BassStream23stream_property_changedENS_9AUDIOEnumEi8QVariant
            (param_1,0x56,uVar2,&local_90);
  __ZN8QVariantD1Ev(&local_90);
  *(undefined1 *)((long)param_1 + 0x994) = *(undefined1 *)((long)param_1 + 0x18871d);
  *(undefined1 *)((long)param_1 + 0x188ad4) = 0;
  param_1[0x3115b] = 0;
  param_1[0x310da] = 0;
  __ZN11QMetaObject14normalizedTypeEPKc(&local_90,"AUDIOEnum");
  FUN_10005866c(&local_90);
  if (local_90 != (code *)0x0) {
    LOAcquire();
    iVar8 = *(int *)local_90;
    *(int *)local_90 = iVar8 + -1;
    LORelease();
    if (iVar8 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_90,1,8);
    }
  }
  uVar10 = __Znwm(0x10);
  __ZN6QTimerC1EP7QObject(uVar10,param_1);
  param_1[0x310e5] = uVar10;
  __ZN7QObject7connectEPKS_PKcS1_S3_N2Qt14ConnectionTypeE
            (auStack_d8,uVar10,"2timeout()",param_1,"1onTimer_pitch_bend_turning_well()",0);
  __ZN11QMetaObject10ConnectionD1Ev(auStack_d8);
  __ZN7QObject7connectEPKS_PKcS1_S3_N2Qt14ConnectionTypeE
            (auStack_e0,&__ZN2dj15global_settingsE,"2settings_changed(SettingsCategory_enum)",
             param_1,"1receiveSettingsChanged(SettingsCategory_enum)",0);
  __ZN11QMetaObject10ConnectionD1Ev(auStack_e0);
  param_1[0x310db] = 0;
  *(undefined4 *)(param_1 + 0x310dc) = 0;
  param_1[0x131] = 0;
  *(undefined1 *)((long)param_1 + 0x994) = 1;
  *(undefined4 *)(param_1 + 0x132) = 0;
  *(undefined4 *)(param_1 + 0x31193) = 0x42b40000;
  *(undefined1 *)(param_1 + 0x123) = 0;
  *(undefined4 *)((long)param_1 + 0x91c) = 0;
  *(undefined1 *)(param_1 + 0x124) = 0;
  *(undefined1 *)(param_1 + 0x125) = 0;
  *(undefined4 *)((long)param_1 + 0x924) = 0;
  __ZN7QObject7connectEPKS_PKcS1_S3_N2Qt14ConnectionTypeE
            (auStack_e8,param_1,"2downloadQOBUZFile(QString, short, int)",param_1 + 0x34,
             "1GetFile(QString, short, int)",0);
  __ZN11QMetaObject10ConnectionD1Ev(auStack_e8);
  if ((param_7 != 0) &&
     (lVar13 = ___dynamic_cast(param_7,PTR___ZTI7QObject_10172c3e0,&__ZTIN2dj5audio11BassControlE,0)
     , lVar13 != 0)) {
    __ZN7QObject7connectEPKS_PKcS1_S3_N2Qt14ConnectionTypeE
              (auStack_f0,param_1 + 0x34,"2fileReady(QString, short, uint, int)",param_7,
               "1received_QOBUZ_File(QString, short, uint, int)",0);
    __ZN11QMetaObject10ConnectionD1Ev(auStack_f0);
    __ZN7QObject7connectEPKS_PKcS1_S3_N2Qt14ConnectionTypeE
              (auStack_f8,param_1 + 0x34,"2sendDownloadProgress(int, int)",param_7,
               "1received_download_progress(int, int)",0);
    __ZN11QMetaObject10ConnectionD1Ev(auStack_f8);
  }
  if (param_1[0xf6] != 0) {
    __ZN7QObject7connectEPKS_PKcS1_S3_N2Qt14ConnectionTypeE
              (auStack_100,param_1[0xf6],"2done(QString, bool, QString)",param_1,
               "1trackLoadedInRAM(QString, bool, QString)",0);
    __ZN11QMetaObject10ConnectionD1Ev(auStack_100);
    __ZN7QObject7connectEPKS_PKcS1_S3_N2Qt14ConnectionTypeE
              (auStack_108,param_1[0xf6],"2progress(QString, float)",param_1,
               "1trackLoadedInRAMProgress(QString, float)",0);
    __ZN11QMetaObject10ConnectionD1Ev(auStack_108);
  }
  *(undefined1 *)(param_1 + 0x12f) = 0;
  __ZN7QObject7connectEPKS_PKcS1_S3_N2Qt14ConnectionTypeE
            (auStack_110,param_1 + 0x1886b,"2sendFileError(DJErrorEnum,QString)",param_1,
             "1receiveFileError(DJErrorEnum,QString)",0);
  __ZN11QMetaObject10ConnectionD1Ev(auStack_110);
  __ZN7QObject7connectEPKS_PKcS1_S3_N2Qt14ConnectionTypeE
            (auStack_118,param_1 + 0x1886b,"2sendStemReady(bool)",param_1,"1receiveStemReady(bool)",
             0);
  __ZN11QMetaObject10ConnectionD1Ev(auStack_118);
  __ZN7QObject7connectEPKS_PKcS1_S3_N2Qt14ConnectionTypeE
            (auStack_120,param_1 + 0x1886b,"2sendStemPosition(qint64)",param_1,
             "1receiveStemPosition(qint64)",0);
  __ZN11QMetaObject10ConnectionD1Ev(auStack_120);
  __ZN2dj5audio14ScratcherProxy16SetPlayScratcherEPNS0_9ScratcherEPNS0_18BassCircularBufferE
            (param_1 + 0x136,param_1 + 0x146,param_1 + 0x1886b);
  __ZN2dj5audio14ScratcherProxy18SetRecordScratcherEPNS0_9ScratcherEPNS0_18BassCircularBufferE
            (param_1 + 0x136,param_1 + 0x18910,param_1 + 0x31035);
  __ZN7QObject7connectEPKS_PKcS1_S3_N2Qt14ConnectionTypeE
            (auStack_128,param_1 + 0x146,"2syncSignal(int)",param_1,"1receiveSyncSignal(int)",0);
  __ZN11QMetaObject10ConnectionD1Ev(auStack_128);
  __ZN7QObject7connectEPKS_PKcS1_S3_N2Qt14ConnectionTypeE
            (auStack_130,param_1 + 0x146,"2signalSlipCooldown(long long)",param_1,
             "1signalSlipCooldown(long long)",0);
  __ZN11QMetaObject10ConnectionD1Ev(auStack_130);
  __ZN19SoundcloudStreaming11getInstanceEv(&local_90);
  pcVar6 = local_90;
  if (local_88 != (int *)0x0) {
    LOAcquire();
    iVar8 = local_88[1];
    local_88[1] = iVar8 + -1;
    LORelease();
    if (iVar8 == 1) {
      (**(code **)(local_88 + 2))(local_88);
    }
    LOAcquire();
    iVar8 = *local_88;
    *local_88 = iVar8 + -1;
    LORelease();
    if (iVar8 == 1) {
      __ZdlPv(local_88);
    }
  }
  local_90 = 
  __ZN2dj5audio10BassStream18getSoundCloudMediaE7QStringiN19SoundcloudStreaming11RequestTypeEb;
  local_88 = (int *)0x0;
  local_a8 = __ZN19SoundcloudStreaming8getMediaE7QStringiNS_11RequestTypeEb;
  uStack_a0 = 0;
  puVar14 = (undefined4 *)__Znwm(0x20);
  *puVar14 = 1;
  *(undefined **)(puVar14 + 2) =
       PTR___ZN9QtPrivate11QSlotObjectIM19SoundcloudStreamingFv7QStringiNS1_11RequestTypeEbENS_4ListIJS2_iS3_bEEEvE4implEiPNS_15QSlotObjectBaseEP7QObjectPPvPb_10172cd48
  ;
  *(code **)(puVar14 + 4) = __ZN19SoundcloudStreaming8getMediaE7QStringiNS_11RequestTypeEb;
  *(undefined8 *)(puVar14 + 6) = 0;
  __ZN7QObject11connectImplEPKS_PPvS1_S3_PN9QtPrivate15QSlotObjectBaseEN2Qt14ConnectionTypeEPKiPK11QMetaObject
            (auStack_138,param_1,&local_90,pcVar6,&local_a8,puVar14,0,0,
             &__ZN2dj5audio10BassStream16staticMetaObjectE);
  __ZN11QMetaObject10ConnectionD1Ev(auStack_138);
  local_90 = __ZN19SoundcloudStreaming16downloadFinishedE7QStringb;
  local_88 = (int *)0x0;
  local_a8 = __ZN2dj5audio10BassStream18soundcloudFinishedE7QStringb;
  uStack_a0 = 0;
  puVar14 = (undefined4 *)__Znwm(0x20);
  *puVar14 = 1;
  puVar4 = 
  PTR___ZN9QtPrivate11QSlotObjectIMN2dj5audio10BassStreamEFv7QStringbENS_4ListIJS4_bEEEvE4implEiPNS_15QSlotObjectBaseEP7QObjectPPvPb_10172d008
  ;
  *(undefined **)(puVar14 + 2) =
       PTR___ZN9QtPrivate11QSlotObjectIMN2dj5audio10BassStreamEFv7QStringbENS_4ListIJS4_bEEEvE4implEiPNS_15QSlotObjectBaseEP7QObjectPPvPb_10172d008
  ;
  *(code **)(puVar14 + 4) = __ZN2dj5audio10BassStream18soundcloudFinishedE7QStringb;
  *(undefined8 *)(puVar14 + 6) = 0;
  __ZN7QObject11connectImplEPKS_PPvS1_S3_PN9QtPrivate15QSlotObjectBaseEN2Qt14ConnectionTypeEPKiPK11QMetaObject
            (auStack_140,pcVar6,&local_90,param_1,&local_a8,puVar14,0,0,
             &__ZN19SoundcloudStreaming16staticMetaObjectE);
  __ZN11QMetaObject10ConnectionD1Ev(auStack_140);
  local_90 = __ZN19SoundcloudStreaming16downloadProgressE7QStringf;
  local_88 = (int *)0x0;
  local_a8 = __ZN2dj5audio10BassStream20soundcloudProgressedE7QStringf;
  uStack_a0 = 0;
  puVar14 = (undefined4 *)__Znwm(0x20);
  *puVar14 = 1;
  puVar5 = 
  PTR___ZN9QtPrivate11QSlotObjectIMN2dj5audio10BassStreamEFv7QStringfENS_4ListIJS4_fEEEvE4implEiPNS_15QSlotObjectBaseEP7QObjectPPvPb_10172d010
  ;
  *(undefined **)(puVar14 + 2) =
       PTR___ZN9QtPrivate11QSlotObjectIMN2dj5audio10BassStreamEFv7QStringfENS_4ListIJS4_fEEEvE4implEiPNS_15QSlotObjectBaseEP7QObjectPPvPb_10172d010
  ;
  *(code **)(puVar14 + 4) = __ZN2dj5audio10BassStream20soundcloudProgressedE7QStringf;
  *(undefined8 *)(puVar14 + 6) = 0;
  __ZN7QObject11connectImplEPKS_PPvS1_S3_PN9QtPrivate15QSlotObjectBaseEN2Qt14ConnectionTypeEPKiPK11QMetaObject
            (auStack_148,pcVar6,&local_90,param_1,&local_a8,puVar14,0,0,
             &__ZN19SoundcloudStreaming16staticMetaObjectE);
  __ZN11QMetaObject10ConnectionD1Ev(auStack_148);
  local_90 = __ZN19SoundcloudStreaming14downloadFailedE7QString;
  local_88 = (int *)0x0;
  local_a8 = __ZN2dj5audio10BassStream16soundcloudFailedE7QString;
  uStack_a0 = 0;
  puVar14 = (undefined4 *)__Znwm(0x20);
  *puVar14 = 1;
  puVar3 = 
  PTR___ZN9QtPrivate11QSlotObjectIMN2dj5audio10BassStreamEFv7QStringENS_4ListIJS4_EEEvE4implEiPNS_15QSlotObjectBaseEP7QObjectPPvPb_10172d000
  ;
  *(undefined **)(puVar14 + 2) =
       PTR___ZN9QtPrivate11QSlotObjectIMN2dj5audio10BassStreamEFv7QStringENS_4ListIJS4_EEEvE4implEiPNS_15QSlotObjectBaseEP7QObjectPPvPb_10172d000
  ;
  *(code **)(puVar14 + 4) = __ZN2dj5audio10BassStream16soundcloudFailedE7QString;
  *(undefined8 *)(puVar14 + 6) = 0;
  __ZN7QObject11connectImplEPKS_PPvS1_S3_PN9QtPrivate15QSlotObjectBaseEN2Qt14ConnectionTypeEPKiPK11QMetaObject
            (auStack_150,pcVar6,&local_90,param_1,&local_a8,puVar14,0,0,
             &__ZN19SoundcloudStreaming16staticMetaObjectE);
  __ZN11QMetaObject10ConnectionD1Ev(auStack_150);
  *(undefined1 *)((long)param_1 + 0x8da) = 0;
  __ZN14TidalStreaming11getInstanceEv(&local_90);
  piVar7 = local_88;
  pcVar6 = local_90;
  if (local_88 != (int *)0x0) {
    LOAcquire();
    iVar8 = local_88[1];
    local_88[1] = iVar8 + -1;
    LORelease();
    if (iVar8 == 1) {
      (**(code **)(local_88 + 2))(local_88);
    }
    LOAcquire();
    iVar8 = *piVar7;
    *piVar7 = iVar8 + -1;
    LORelease();
    if (iVar8 == 1) {
      __ZdlPv(piVar7);
    }
  }
  local_90 = __ZN2dj5audio10BassStream13getTidalMediaE7QStringib;
  local_88 = (int *)0x0;
  local_a8 = __ZN14TidalStreaming8getMediaE7QStringib;
  uStack_a0 = 0;
  puVar14 = (undefined4 *)__Znwm(0x20);
  *puVar14 = 1;
  *(undefined **)(puVar14 + 2) =
       PTR___ZN9QtPrivate11QSlotObjectIM14TidalStreamingFv7QStringibENS_4ListIJS2_ibEEEvE4implEiPNS_15QSlotObjectBaseEP7QObjectPPvPb_10172cd08
  ;
  *(code **)(puVar14 + 4) = __ZN14TidalStreaming8getMediaE7QStringib;
  *(undefined8 *)(puVar14 + 6) = 0;
  __ZN7QObject11connectImplEPKS_PPvS1_S3_PN9QtPrivate15QSlotObjectBaseEN2Qt14ConnectionTypeEPKiPK11QMetaObject
            (auStack_158,param_1,&local_90,pcVar6,&local_a8,puVar14,0,0,
             &__ZN2dj5audio10BassStream16staticMetaObjectE);
  __ZN11QMetaObject10ConnectionD1Ev(auStack_158);
  local_90 = __ZN14TidalStreaming16downloadFinishedE7QStringb;
  local_88 = (int *)0x0;
  local_a8 = __ZN2dj5audio10BassStream13tidalFinishedE7QStringb;
  uStack_a0 = 0;
  puVar14 = (undefined4 *)__Znwm(0x20);
  *puVar14 = 1;
  *(undefined **)(puVar14 + 2) = puVar4;
  *(code **)(puVar14 + 4) = __ZN2dj5audio10BassStream13tidalFinishedE7QStringb;
  *(undefined8 *)(puVar14 + 6) = 0;
  __ZN7QObject11connectImplEPKS_PPvS1_S3_PN9QtPrivate15QSlotObjectBaseEN2Qt14ConnectionTypeEPKiPK11QMetaObject
            (auStack_160,pcVar6,&local_90,param_1,&local_a8,puVar14,0,0,
             &__ZN14TidalStreaming16staticMetaObjectE);
  __ZN11QMetaObject10ConnectionD1Ev(auStack_160);
  local_90 = __ZN14TidalStreaming16downloadProgressE7QStringf;
  local_88 = (int *)0x0;
  local_a8 = __ZN2dj5audio10BassStream15tidalProgressedE7QStringf;
  uStack_a0 = 0;
  puVar14 = (undefined4 *)__Znwm(0x20);
  *puVar14 = 1;
  *(undefined **)(puVar14 + 2) = puVar5;
  *(code **)(puVar14 + 4) = __ZN2dj5audio10BassStream15tidalProgressedE7QStringf;
  *(undefined8 *)(puVar14 + 6) = 0;
  __ZN7QObject11connectImplEPKS_PPvS1_S3_PN9QtPrivate15QSlotObjectBaseEN2Qt14ConnectionTypeEPKiPK11QMetaObject
            (auStack_168,pcVar6,&local_90,param_1,&local_a8,puVar14,0,0,
             &__ZN14TidalStreaming16staticMetaObjectE);
  __ZN11QMetaObject10ConnectionD1Ev(auStack_168);
  local_90 = __ZN14TidalStreaming14downloadFailedE7QString;
  local_88 = (int *)0x0;
  local_a8 = __ZN2dj5audio10BassStream11tidalFailedE7QString;
  uStack_a0 = 0;
  puVar14 = (undefined4 *)__Znwm(0x20);
  *puVar14 = 1;
  *(undefined **)(puVar14 + 2) = puVar3;
  *(code **)(puVar14 + 4) = __ZN2dj5audio10BassStream11tidalFailedE7QString;
  *(undefined8 *)(puVar14 + 6) = 0;
  __ZN7QObject11connectImplEPKS_PPvS1_S3_PN9QtPrivate15QSlotObjectBaseEN2Qt14ConnectionTypeEPKiPK11QMetaObject
            (auStack_170,pcVar6,&local_90,param_1,&local_a8,puVar14,0,0,
             &__ZN14TidalStreaming16staticMetaObjectE);
  __ZN11QMetaObject10ConnectionD1Ev(auStack_170);
  *(undefined1 *)(param_1 + 0x11f) = 0;
  if (*(long *)PTR____stack_chk_guard_10172c568 == local_70) {
    return param_1;
  }
                    /* WARNING: Subroutine does not return */
  ___stack_chk_fail();
}

