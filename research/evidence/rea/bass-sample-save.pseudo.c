
void __ZN2dj5audio11BassSample310saveSampleE7QString(long param_1,undefined8 *param_2)

{
  int iVar1;
  int *piVar2;
  undefined8 *puVar3;
  long lVar4;
  undefined8 *puVar5;
  undefined8 uVar6;
  int *local_150;
  undefined8 uStack_148;
  undefined8 local_140;
  int *local_130;
  undefined8 uStack_128;
  undefined8 local_120;
  int *local_110;
  undefined8 uStack_108;
  undefined8 local_100;
  int *local_f0;
  undefined8 uStack_e8;
  undefined8 local_e0;
  int *local_d0;
  undefined8 uStack_c8;
  long local_c0;
  int *local_b8 [3];
  int *local_a0;
  undefined8 uStack_98;
  long local_90;
  int *local_80;
  undefined8 uStack_78;
  long local_70;
  undefined1 auStack_68 [8];
  int *local_60;
  undefined8 uStack_58;
  long local_50;
  
  lVar4 = *(long *)(param_1 + 0x30);
  if (lVar4 == 0) {
    puVar5 = (undefined8 *)(param_1 + 0xb8);
    piVar2 = (int *)*puVar5;
    iVar1 = *(int *)(param_1 + 0xd0);
    if ((piVar2 == (int *)0x0) || (1 < *piVar2)) {
      FUN_100015064(puVar5,0,0,0);
      piVar2 = (int *)*puVar5;
      if (piVar2 != (int *)0x0) goto LAB_10015f31c;
LAB_10015f328:
      FUN_100015064(puVar5,0,0,0);
    }
    else {
LAB_10015f31c:
      if (1 < *piVar2) goto LAB_10015f328;
    }
    puVar3 = (undefined8 *)(*(long *)(param_1 + 0xc0) + (long)iVar1 * 0x18);
    uStack_108 = puVar3[1];
    local_110 = (int *)*puVar3;
    local_100 = puVar3[2];
    if (local_110 != (int *)0x0) {
      LOAcquire();
      *local_110 = *local_110 + 1;
      LORelease();
    }
    uStack_128 = param_2[1];
    local_130 = (int *)*param_2;
    local_120 = param_2[2];
    uVar6 = 0;
    if (local_130 != (int *)0x0) {
      LOAcquire();
      iVar1 = *local_130;
      *local_130 = iVar1 + 1;
      uVar6 = CONCAT44((int)((ulong)local_130 >> 0x20),iVar1);
      LORelease();
    }
    __ZN9FileUtils8moveFileE7QStringS0_(uVar6,&local_110,&local_130);
    if (local_130 != (int *)0x0) {
      LOAcquire();
      iVar1 = *local_130;
      *local_130 = iVar1 + -1;
      LORelease();
      if (iVar1 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_130,2,8);
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
    iVar1 = *(int *)(param_1 + 0xd0);
    piVar2 = *(int **)(param_1 + 0xb8);
    if ((piVar2 == (int *)0x0) || (1 < *piVar2)) {
      FUN_100015064(puVar5,0,0,0);
      piVar2 = (int *)*puVar5;
      if (piVar2 != (int *)0x0) goto LAB_10015f418;
LAB_10015f424:
      FUN_100015064(puVar5,0,0,0);
    }
    else {
LAB_10015f418:
      if (1 < *piVar2) goto LAB_10015f424;
    }
    __ZN7QStringaSERKS_(*(long *)(param_1 + 0xc0) + (long)iVar1 * 0x18,param_2);
  }
  else {
    if ((lVar4 == param_2[2]) &&
       (iVar1 = __ZN9QtPrivate14compareStringsE11QStringViewS0_N2Qt15CaseSensitivityE
                          (lVar4,*(undefined8 *)(param_1 + 0x28),lVar4,param_2[1],1), iVar1 == 0)) {
      __ZN9QFileInfoC1ERK7QString(auStack_68,param_2);
      __ZNK9QFileInfo8fileNameEv(&local_60);
      __ZNK7QString5rightEx(&local_80,&local_60,local_50 + -1);
      lVar4 = local_50;
      uVar6 = uStack_58;
      piVar2 = local_60;
      uStack_58 = uStack_78;
      local_60 = local_80;
      uStack_78 = uVar6;
      local_80 = piVar2;
      local_50 = local_70;
      local_70 = lVar4;
      if (piVar2 != (int *)0x0) {
        LOAcquire();
        iVar1 = *piVar2;
        *piVar2 = iVar1 + -1;
        LORelease();
        if (iVar1 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(piVar2,2,8);
        }
      }
      __ZNK9QFileInfo12absolutePathEv(local_b8,auStack_68);
      FUN_100014ba4(&local_a0,local_b8,"/");
      uStack_78 = uStack_98;
      local_80 = local_a0;
      local_70 = local_90;
      iVar1 = 0;
      if (local_a0 != (int *)0x0) {
        LOAcquire();
        iVar1 = *local_a0;
        *local_a0 = iVar1 + 1;
        LORelease();
      }
      __ZN7QString6appendERKS_(iVar1,&local_80,&local_60);
      __ZN7QStringaSERKS_(param_2,&local_80);
      if (local_80 != (int *)0x0) {
        LOAcquire();
        iVar1 = *local_80;
        *local_80 = iVar1 + -1;
        LORelease();
        if (iVar1 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_80,2,8);
        }
      }
      if (local_a0 != (int *)0x0) {
        LOAcquire();
        iVar1 = *local_a0;
        *local_a0 = iVar1 + -1;
        LORelease();
        if (iVar1 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_a0,2,8);
        }
      }
      if (local_b8[0] != (int *)0x0) {
        LOAcquire();
        iVar1 = *local_b8[0];
        *local_b8[0] = iVar1 + -1;
        LORelease();
        if (iVar1 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_b8[0],2,8);
        }
      }
      if (local_60 != (int *)0x0) {
        LOAcquire();
        iVar1 = *local_60;
        *local_60 = iVar1 + -1;
        LORelease();
        if (iVar1 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_60,2,8);
        }
      }
      __ZN9QFileInfoD1Ev(auStack_68);
      lVar4 = *(long *)(param_1 + 0x30);
    }
    uStack_c8 = *(undefined8 *)(param_1 + 0x28);
    local_d0 = *(int **)(param_1 + 0x20);
    if (local_d0 != (int *)0x0) {
      LOAcquire();
      *local_d0 = *local_d0 + 1;
      LORelease();
    }
    uStack_e8 = param_2[1];
    local_f0 = (int *)*param_2;
    local_e0 = param_2[2];
    uVar6 = 0;
    if (local_f0 != (int *)0x0) {
      LOAcquire();
      iVar1 = *local_f0;
      *local_f0 = iVar1 + 1;
      uVar6 = CONCAT44((int)((ulong)local_f0 >> 0x20),iVar1);
      LORelease();
    }
    local_c0 = lVar4;
    __ZN9FileUtils8moveFileE7QStringS0_(uVar6,&local_d0,&local_f0);
    if (local_f0 != (int *)0x0) {
      LOAcquire();
      iVar1 = *local_f0;
      *local_f0 = iVar1 + -1;
      LORelease();
      if (iVar1 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_f0,2,8);
      }
    }
    if (local_d0 != (int *)0x0) {
      LOAcquire();
      iVar1 = *local_d0;
      *local_d0 = iVar1 + -1;
      LORelease();
      if (iVar1 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_d0,2,8);
      }
    }
    puVar5 = (undefined8 *)(param_1 + 0xb8);
    piVar2 = (int *)*puVar5;
    iVar1 = *(int *)(param_1 + 0xd0);
    if ((piVar2 == (int *)0x0) || (1 < *piVar2)) {
      FUN_100015064(puVar5,0,0,0);
      piVar2 = (int *)*puVar5;
      if (piVar2 != (int *)0x0) goto LAB_10015f250;
LAB_10015f25c:
      FUN_100015064(puVar5,0,0,0);
    }
    else {
LAB_10015f250:
      if (1 < *piVar2) goto LAB_10015f25c;
    }
    __ZN7QStringaSERKS_(*(long *)(param_1 + 0xc0) + (long)iVar1 * 0x18,param_2);
    __ZN7QString8fromUtf8E14QByteArrayView(&local_60,0,&DAT_1016afb6c);
    uVar6 = *(undefined8 *)(param_1 + 0x28);
    piVar2 = *(int **)(param_1 + 0x20);
    *(undefined8 *)(param_1 + 0x28) = uStack_58;
    *(int **)(param_1 + 0x20) = local_60;
    lVar4 = *(long *)(param_1 + 0x30);
    *(long *)(param_1 + 0x30) = local_50;
    local_60 = piVar2;
    uStack_58 = uVar6;
    local_50 = lVar4;
    if (piVar2 != (int *)0x0) {
      LOAcquire();
      iVar1 = *piVar2;
      *piVar2 = iVar1 + -1;
      LORelease();
      if (iVar1 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(piVar2,2,8);
      }
    }
  }
  puVar5 = (undefined8 *)(param_1 + 0xb8);
  piVar2 = (int *)*puVar5;
  iVar1 = *(int *)(param_1 + 0xd0);
  if ((piVar2 == (int *)0x0) || (1 < *piVar2)) {
    FUN_100015064(puVar5,0,0,0);
    piVar2 = (int *)*puVar5;
    if (piVar2 != (int *)0x0) goto LAB_10015f484;
  }
  else {
LAB_10015f484:
    if (*piVar2 < 2) goto LAB_10015f4a4;
  }
  FUN_100015064(puVar5,0,0,0);
LAB_10015f4a4:
  puVar5 = (undefined8 *)(*(long *)(param_1 + 0xc0) + (long)iVar1 * 0x18);
  uStack_148 = puVar5[1];
  local_150 = (int *)*puVar5;
  local_140 = puVar5[2];
  uVar6 = 0;
  if (local_150 != (int *)0x0) {
    LOAcquire();
    iVar1 = *local_150;
    *local_150 = iVar1 + 1;
    uVar6 = CONCAT44((int)((ulong)local_150 >> 0x20),iVar1);
    LORelease();
  }
  __ZN2dj5audio11BassSample310updateNameE7QString(uVar6,param_1,&local_150);
  if (local_150 != (int *)0x0) {
    LOAcquire();
    iVar1 = *local_150;
    *local_150 = iVar1 + -1;
    LORelease();
    if (iVar1 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_150,2,8);
    }
  }
  return;
}

