
void __ZN2dj20sample_unpack_widget9showEventEP10QShowEvent(long *param_1)

{
  int iVar1;
  undefined8 *puVar2;
  undefined8 uVar3;
  long lVar4;
  int *piVar5;
  long lVar6;
  undefined1 auStack_160 [8];
  undefined1 auStack_158 [8];
  int *local_150;
  long lStack_148;
  long local_140;
  int *local_130;
  long lStack_128;
  long local_120;
  int *local_110;
  undefined8 uStack_108;
  undefined8 local_100;
  int *local_f8 [3];
  int *local_e0;
  undefined8 uStack_d8;
  undefined8 local_d0;
  int *local_c0;
  undefined8 uStack_b8;
  undefined8 local_b0;
  int *local_a0;
  long lStack_98;
  long local_90;
  undefined1 auStack_78 [8];
  undefined1 auStack_70 [8];
  int *local_68 [3];
  int *local_50;
  undefined8 uStack_48;
  undefined8 local_40;
  
  if (param_1[9] != 0) {
    return;
  }
  __ZN2dj25get_sample_pack_directoryEv(local_68);
  __ZN9QFileInfoC1ERK7QString(auStack_70,param_1 + 10);
  __ZN7QString6appendE5QChar(local_68,0x2f);
  __ZNK9QFileInfo8baseNameEv(&local_a0,auStack_70);
  __ZN7QString6appendERKS_(local_68,&local_a0);
  if (local_a0 != (int *)0x0) {
    LOAcquire();
    iVar1 = *local_a0;
    *local_a0 = iVar1 + -1;
    LORelease();
    if (iVar1 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_a0,2,8);
    }
  }
  __ZN7QString6appendE5QChar(local_68,0x2f);
  __ZN4QDirC1ERK7QString(auStack_78,local_68);
  iVar1 = __ZNK4QDir6existsEv();
  if (iVar1 == 0) {
    __ZNK4QDir6mkpathERK7QString(auStack_78,local_68);
  }
  else {
    if ((char)param_1[0x1f] == '\x01') {
      __ZN2dj20sample_unpack_widget14UploadFinishedEb(param_1,1);
      goto LAB_1006ce2a0;
    }
    uVar3 = __ZN11QMessageBoxC1EP7QWidget(&local_a0,param_1);
    __ZN11QMessageBox18setStandardButtonsE6QFlagsINS_14StandardButtonEE(uVar3,0x14000);
    __ZN11QMessageBox15setEscapeButtonENS_14StandardButtonE(&local_a0,0x200000);
    __ZNK11QMetaObject2trEPKcS1_i
              (&local_50,&__ZN2dj20sample_unpack_widget16staticMetaObjectE,"Unpack Samples",0,
               0xffffffff);
    __ZN11QMessageBox14setWindowTitleERK7QString(&local_a0,&local_50);
    if (local_50 != (int *)0x0) {
      LOAcquire();
      iVar1 = *local_50;
      *local_50 = iVar1 + -1;
      LORelease();
      if (iVar1 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_50,2,8);
      }
    }
    __ZN7QString8fromUtf8E14QByteArrayView
              (&local_50,0x251,
               "QDialog {background:#000000;color:#ffffff;}QPushButton { background-color: #191919; border-style: solid; border-width: 1px; border-radius: 1px;  border-color: #60b1d6; padding: 6px; color: #b3b3b3; font-family: \"roboto\"; font-weight: bold; font-size: 12px;}QPushButton:hover { background-color: #2b2b2b; color: #ffffff;}QPushButton:pressed { background-color: #141414; color: #4C4C4C;}QPushButton:disabled { border-color: #111111; color: #4C4C4C; background-color: rgba(38, 38, 38, 50%);}QPushButton::menu-indicator{background: transparent;}QPushButton { height:23; width: 75; color: #ffffff;}"
              );
    uStack_d8 = uStack_48;
    local_e0 = local_50;
    local_d0 = local_40;
    if ((DAT_11a05d219 == '\x01') && (iVar1 = FUN_10001e8fc(&__ZN2dj15global_settingsE), iVar1 != 0)
       ) {
      FUN_10002f408(&__ZN2dj15global_settingsE,&local_e0);
    }
    uStack_b8 = uStack_d8;
    local_c0 = local_e0;
    local_b0 = local_d0;
    uStack_d8 = 0;
    local_d0 = 0;
    local_e0 = (int *)0x0;
    FUN_10001bff4(&__ZN2dj15global_settingsE,&local_c0);
    __ZN7QWidget13setStyleSheetERK7QString(&local_a0,&local_c0);
    __ZNK9QFileInfo8baseNameEv(local_f8,auStack_70);
    FUN_100014ba4(&local_50,local_f8," already exists. Do you want to overwrite it?");
    __ZN11QMessageBox7setTextERK7QString(&local_a0,&local_50);
    if (local_50 != (int *)0x0) {
      LOAcquire();
      iVar1 = *local_50;
      *local_50 = iVar1 + -1;
      LORelease();
      if (iVar1 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_50,2,8);
      }
    }
    if (local_f8[0] != (int *)0x0) {
      LOAcquire();
      iVar1 = *local_f8[0];
      *local_f8[0] = iVar1 + -1;
      LORelease();
      if (iVar1 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_f8[0],2,8);
      }
    }
    iVar1 = __ZN7QDialog4execEv(&local_a0);
    if (iVar1 == 0x10000) {
      (**(code **)(*param_1 + 0x1b0))(param_1,0);
      if (local_c0 != (int *)0x0) {
        LOAcquire();
        iVar1 = *local_c0;
        *local_c0 = iVar1 + -1;
        LORelease();
        if (iVar1 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_c0,2,8);
        }
      }
      __ZN11QMessageBoxD1Ev(&local_a0);
      goto LAB_1006ce2a0;
    }
    if (local_c0 != (int *)0x0) {
      LOAcquire();
      iVar1 = *local_c0;
      *local_c0 = iVar1 + -1;
      LORelease();
      if (iVar1 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_c0,2,8);
      }
    }
    __ZN11QMessageBoxD1Ev(&local_a0);
  }
  __ZNK4QDir12absolutePathEv(&local_50,auStack_78);
  puVar2 = (undefined8 *)__ZN7QString6appendE5QChar(&local_50,0x2f);
  uStack_108 = puVar2[1];
  local_110 = (int *)*puVar2;
  local_100 = puVar2[2];
  if (local_110 != (int *)0x0) {
    LOAcquire();
    *local_110 = *local_110 + 1;
    LORelease();
  }
  __ZN2dj21toUniversalSeparatorsE7QString(&local_a0,&local_110);
  lVar6 = param_1[0xe];
  piVar5 = (int *)param_1[0xd];
  param_1[0xe] = lStack_98;
  param_1[0xd] = (long)local_a0;
  lVar4 = param_1[0xf];
  param_1[0xf] = local_90;
  local_a0 = piVar5;
  lStack_98 = lVar6;
  local_90 = lVar4;
  if (piVar5 != (int *)0x0) {
    LOAcquire();
    iVar1 = *piVar5;
    *piVar5 = iVar1 + -1;
    LORelease();
    if (iVar1 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(piVar5,2,8);
    }
  }
  if (local_110 != (int *)0x0) {
    LOAcquire();
    iVar1 = *local_110;
    *local_110 = iVar1 + -1;
    LORelease();
    if (iVar1 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_110,2,8);
    }
  }
  if (local_50 != (int *)0x0) {
    LOAcquire();
    iVar1 = *local_50;
    *local_50 = iVar1 + -1;
    LORelease();
    if (iVar1 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_50,2,8);
    }
  }
  puVar2 = (undefined8 *)__Znwm(0x40);
  lStack_128 = param_1[0xb];
  local_130 = (int *)param_1[10];
  local_120 = param_1[0xc];
  if (local_130 != (int *)0x0) {
    LOAcquire();
    *local_130 = *local_130 + 1;
    LORelease();
  }
  lStack_148 = param_1[0xe];
  local_150 = (int *)param_1[0xd];
  local_140 = param_1[0xf];
  uVar3 = 0;
  if (local_150 != (int *)0x0) {
    LOAcquire();
    iVar1 = *local_150;
    *local_150 = iVar1 + 1;
    uVar3 = CONCAT44((int)((ulong)local_150 >> 0x20),iVar1);
    LORelease();
  }
  __ZN7QThreadC2EP7QObject(uVar3,puVar2,0);
  *puVar2 = &PTR___ZNK2dj12UnpackThread10metaObjectEv_10174f2e8;
  puVar2[5] = 0;
  puVar2[4] = 0;
  puVar2[7] = 0;
  puVar2[6] = 0;
  puVar2[3] = 0;
  puVar2[2] = 0;
  __ZN7QStringaSERKS_(puVar2 + 2,&local_130);
  __ZN7QStringaSERKS_(puVar2 + 5,&local_150);
  param_1[9] = (long)puVar2;
  if (local_150 != (int *)0x0) {
    LOAcquire();
    iVar1 = *local_150;
    *local_150 = iVar1 + -1;
    LORelease();
    if (iVar1 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_150,2,8);
    }
  }
  if (local_130 != (int *)0x0) {
    LOAcquire();
    iVar1 = *local_130;
    *local_130 = iVar1 + -1;
    LORelease();
    if (iVar1 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_130,2,8);
    }
  }
  __ZN7QObject7connectEPKS_PKcS1_S3_N2Qt14ConnectionTypeE
            (auStack_158,param_1[9],"2statusChanged(float)",param_1,"1receiveUnpackProgress(float)",
             0);
  __ZN11QMetaObject10ConnectionD1Ev(auStack_158);
  __ZN7QObject7connectEPKS_PKcS1_S3_N2Qt14ConnectionTypeE
            (auStack_160,param_1[9],"2UploadFinished(bool)",param_1,"1UploadFinished(bool)",0);
  __ZN11QMetaObject10ConnectionD1Ev(auStack_160);
  __ZN7QThread5startENS_8PriorityE(param_1[9],2);
LAB_1006ce2a0:
  __ZN4QDirD1Ev(auStack_78);
  __ZN9QFileInfoD1Ev(auStack_70);
  if (local_68[0] != (int *)0x0) {
    LOAcquire();
    iVar1 = *local_68[0];
    *local_68[0] = iVar1 + -1;
    LORelease();
    if (iVar1 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_68[0],2,8);
    }
  }
  return;
}

