
void __ZN2dj5audio10BassStream23loadSamplePackInSamplerEi5QListI7QStringE
               (long param_1,undefined8 param_2,undefined8 *param_3)

{
  uint uVar1;
  int iVar2;
  long lVar3;
  int *piVar4;
  undefined8 *puVar5;
  int *local_60;
  undefined8 *puStack_58;
  long local_50;
  
  uVar1 = (int)param_2 - 1;
  if (uVar1 < 4) {
    lVar3 = *(long *)(param_1 + 0x188810 + (ulong)uVar1 * 8);
    if (lVar3 != 0) {
      if (*(int *)(lVar3 + 0x50) != 0) {
        __ZN2dj5audio16BassRecordStream16recordSampleStopEPNS0_11BassSample3Eb
                  (*(undefined8 *)(param_1 + 0x188830),lVar3,1);
        lVar3 = *(long *)(param_1 + 0x188810 + (ulong)uVar1 * 8);
      }
      puStack_58 = (undefined8 *)param_3[1];
      local_60 = (int *)*param_3;
      local_50 = param_3[2];
      if (local_60 != (int *)0x0) {
        LOAcquire();
        *local_60 = *local_60 + 1;
        LORelease();
      }
      __ZN2dj5audio11BassSample314openSampleListE5QListI7QStringE(lVar3,&local_60);
      if (local_60 != (int *)0x0) {
        LOAcquire();
        iVar2 = *local_60;
        *local_60 = iVar2 + -1;
        LORelease();
        if (iVar2 == 1) {
          if (local_50 != 0) {
            lVar3 = local_50 * 0x18;
            puVar5 = puStack_58;
            do {
              piVar4 = (int *)*puVar5;
              if (piVar4 != (int *)0x0) {
                LOAcquire();
                iVar2 = *piVar4;
                *piVar4 = iVar2 + -1;
                LORelease();
                if (iVar2 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(*puVar5,2,8);
                }
              }
              puVar5 = puVar5 + 3;
              lVar3 = lVar3 + -0x18;
            } while (lVar3 != 0);
          }
          __ZN10QArrayData10deallocateEPS_xx(local_60,0x18,8);
        }
      }
      __ZN2dj5audio10BassStream11sendSamplesEi(param_1,param_2);
    }
  }
  return;
}

