
void __ZN2dj18sample_pack_widget12exportToFileE7QString(long param_1,undefined8 param_2)

{
  int iVar1;
  undefined8 uVar2;
  long lVar3;
  int *piVar4;
  undefined8 *puVar5;
  undefined8 *puVar6;
  long lVar7;
  undefined1 auStack_2e0 [8];
  undefined1 auStack_2d8 [8];
  int *local_2d0;
  undefined8 uStack_2c8;
  undefined8 local_2c0;
  undefined4 local_2b0 [2];
  undefined1 auStack_2a8 [456];
  undefined4 local_e0;
  int *local_d8;
  undefined8 *puStack_d0;
  long local_c8;
  int *local_c0;
  undefined8 uStack_b8;
  undefined8 local_b0;
  undefined4 local_a8;
  undefined1 local_a4;
  undefined1 auStack_a0 [8];
  int *local_98;
  undefined8 uStack_90;
  undefined8 local_88;
  int *local_80;
  undefined8 uStack_78;
  undefined8 local_70;
  
  __ZN14QStandardPaths16writableLocationENS_16StandardLocationE(&local_98,7);
  FUN_100014ba4(&local_80,&local_98,"/djuced.djz/");
  if (local_98 != (int *)0x0) {
    LOAcquire();
    iVar1 = *local_98;
    *local_98 = iVar1 + -1;
    LORelease();
    if (iVar1 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_98,2,8);
    }
  }
  local_98 = (int *)0x0;
  uStack_90 = 0;
  local_88 = 0;
  __ZN4QDirC1ERK7QString(auStack_a0,&local_98);
  if (local_98 != (int *)0x0) {
    LOAcquire();
    iVar1 = *local_98;
    *local_98 = iVar1 + -1;
    LORelease();
    if (iVar1 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_98,2,8);
    }
  }
  __ZNK4QDir6mkpathERK7QString(auStack_a0,&local_80);
  if (*(long *)(param_1 + 0x90) == 0) {
    uVar2 = __Znwm(0x250);
    local_2b0[0] = *(undefined4 *)(param_1 + 0x98);
    FUN_10009fac8(auStack_2a8,param_1 + 0xa0);
    local_e0 = *(undefined4 *)(param_1 + 0x268);
    puStack_d0 = *(undefined8 **)(param_1 + 0x278);
    local_d8 = *(int **)(param_1 + 0x270);
    local_c8 = *(long *)(param_1 + 0x280);
    if (local_d8 != (int *)0x0) {
      LOAcquire();
      *local_d8 = *local_d8 + 1;
      LORelease();
    }
    uStack_b8 = *(undefined8 *)(param_1 + 0x290);
    local_c0 = *(int **)(param_1 + 0x288);
    local_b0 = *(undefined8 *)(param_1 + 0x298);
    if (local_c0 != (int *)0x0) {
      LOAcquire();
      *local_c0 = *local_c0 + 1;
      LORelease();
    }
    local_a8 = *(undefined4 *)(param_1 + 0x2a0);
    local_a4 = *(undefined1 *)(param_1 + 0x2a4);
    uStack_2c8 = uStack_78;
    local_2d0 = local_80;
    local_2c0 = local_70;
    iVar1 = 0;
    if (local_80 != (int *)0x0) {
      LOAcquire();
      iVar1 = *local_80;
      *local_80 = iVar1 + 1;
      LORelease();
    }
    __ZN2dj10PackThreadC2ENS_13AUDIOPackInfoE7QString(iVar1,uVar2,local_2b0,&local_2d0);
    *(undefined8 *)(param_1 + 0x90) = uVar2;
    if (local_2d0 != (int *)0x0) {
      LOAcquire();
      iVar1 = *local_2d0;
      *local_2d0 = iVar1 + -1;
      LORelease();
      if (iVar1 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_2d0,2,8);
      }
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
    if (local_d8 != (int *)0x0) {
      LOAcquire();
      iVar1 = *local_d8;
      *local_d8 = iVar1 + -1;
      LORelease();
      if (iVar1 == 1) {
        if (local_c8 != 0) {
          puVar6 = puStack_d0 + local_c8 * 3;
          puVar5 = puStack_d0;
          do {
            piVar4 = (int *)*puVar5;
            if (piVar4 != (int *)0x0) {
              LOAcquire();
              iVar1 = *piVar4;
              *piVar4 = iVar1 + -1;
              LORelease();
              if (iVar1 == 1) {
                if (puVar5[2] != 0) {
                  lVar3 = puVar5[1];
                  lVar7 = puVar5[2] * 0xd0;
                  do {
                    lVar3 = FUN_1000a1558(lVar3);
                    lVar3 = lVar3 + 0xd0;
                    lVar7 = lVar7 + -0xd0;
                  } while (lVar7 != 0);
                }
                __ZN10QArrayData10deallocateEPS_xx(*puVar5,0xd0,8);
              }
            }
            puVar5 = puVar5 + 3;
          } while (puVar5 != puVar6);
        }
        __ZN10QArrayData10deallocateEPS_xx(local_d8,0x18,8);
      }
    }
    FUN_10009f554(auStack_2a8);
    __ZN7QStringaSERKS_(*(long *)(param_1 + 0x90) + 0x10,param_2);
    __ZN7QThread5startENS_8PriorityE(*(undefined8 *)(param_1 + 0x90),2);
    __ZN7QObject7connectEPKS_PKcS1_S3_N2Qt14ConnectionTypeE
              (auStack_2d8,*(undefined8 *)(param_1 + 0x90),"2statusChanged(float)",param_1,
               "1receiveUnpackProgress(float)",0);
    __ZN11QMetaObject10ConnectionD1Ev(auStack_2d8);
    __ZN7QObject7connectEPKS_PKcS1_S3_N2Qt14ConnectionTypeE
              (auStack_2e0,*(undefined8 *)(param_1 + 0x90),"2UploadFinished(bool)",param_1,
               "1UploadFinished(bool)",0);
    __ZN11QMetaObject10ConnectionD1Ev(auStack_2e0);
  }
  __ZN4QDirD1Ev(auStack_a0);
  if (local_80 != (int *)0x0) {
    LOAcquire();
    iVar1 = *local_80;
    *local_80 = iVar1 + -1;
    LORelease();
    if (iVar1 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_80,2,8);
    }
  }
  return;
}

