
void __ZN2dj25get_sample_pack_directoryEv(undefined8 param_1)

{
  int iVar1;
  int *local_60;
  undefined8 uStack_58;
  undefined8 local_50;
  int *local_40;
  undefined8 uStack_38;
  undefined8 local_30;
  
  __ZN2dj19get_music_directoryEv(&local_60);
  uStack_38 = uStack_58;
  local_40 = local_60;
  local_30 = local_50;
  iVar1 = 0;
  if (local_60 != (int *)0x0) {
    LOAcquire();
    iVar1 = *local_60;
    *local_60 = iVar1 + 1;
    LORelease();
  }
  __ZN7QString6appendE5QChar(iVar1,&local_40,0x2f);
  FUN_100014ba4(param_1,&local_40,"Samples");
  if (local_40 != (int *)0x0) {
    LOAcquire();
    iVar1 = *local_40;
    *local_40 = iVar1 + -1;
    LORelease();
    if (iVar1 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_40,2,8);
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
  return;
}

