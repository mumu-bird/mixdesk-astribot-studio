
void __ZN2dj12UnpackThread3runEv(long param_1)

{
  int iVar1;
  undefined8 uVar2;
  int *local_80;
  undefined8 local_78;
  undefined8 local_70;
  int *local_68;
  undefined8 local_60;
  undefined8 local_58;
  undefined1 auStack_50 [16];
  undefined1 auStack_40 [16];
  
  __ZN14LibarchiveUtilC1EPFvfPvES0_(auStack_40,__ZN2dj12UnpackThread13progress_funcEfPv,param_1);
  __ZN5QFileC1ERK7QString(auStack_50,param_1 + 0x10);
  uVar2 = __ZNK5QFile4sizeEv(auStack_50);
  __ZN7QString13toUtf8_helperERKS_(&local_68,param_1 + 0x10);
  if ((local_68 == (int *)0x0) || (1 < *local_68)) {
    __ZN10QByteArray11reallocDataExN10QArrayData16AllocationOptionE(&local_68,local_58,1);
  }
  __ZN7QString13toUtf8_helperERKS_(&local_80,param_1 + 0x28);
  if ((local_80 == (int *)0x0) || (1 < *local_80)) {
    __ZN10QByteArray11reallocDataExN10QArrayData16AllocationOptionE(&local_80,local_70,1);
  }
  uVar2 = __ZN14LibarchiveUtil11extractUtf8EPcS0_x(auStack_40,local_60,local_78,uVar2);
  __ZN2dj12UnpackThread14UploadFinishedEb(param_1,uVar2);
  if (local_80 != (int *)0x0) {
    LOAcquire();
    iVar1 = *local_80;
    *local_80 = iVar1 + -1;
    LORelease();
    if (iVar1 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_80,1,8);
    }
  }
  if (local_68 != (int *)0x0) {
    LOAcquire();
    iVar1 = *local_68;
    *local_68 = iVar1 + -1;
    LORelease();
    if (iVar1 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_68,1,8);
    }
  }
  __ZN7QThread4exitEi(param_1,0);
  __ZN5QFileD1Ev(auStack_50);
  __ZN14LibarchiveUtilD1Ev(auStack_40);
  return;
}

