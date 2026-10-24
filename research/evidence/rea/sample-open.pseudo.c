
undefined8 __ZN2dj5audio11BassSample34openEi(long param_1,undefined8 param_2)

{
  int iVar1;
  undefined8 uVar2;
  int *piVar3;
  undefined8 *puVar4;
  int *local_50;
  undefined8 uStack_48;
  undefined8 local_40;
  
  if (*(long *)(param_1 + 200) <= (long)(int)param_2) {
    return 0;
  }
  piVar3 = *(int **)(param_1 + 0xb8);
  if ((piVar3 == (int *)0x0) || (1 < *piVar3)) {
    FUN_100015064(param_1 + 0xb8,0,0,0);
    piVar3 = *(int **)(param_1 + 0xb8);
    if (piVar3 != (int *)0x0) goto LAB_10015c0a4;
  }
  else {
LAB_10015c0a4:
    if (*piVar3 < 2) goto LAB_10015c0c4;
  }
  FUN_100015064(param_1 + 0xb8,0,0,0);
LAB_10015c0c4:
  puVar4 = (undefined8 *)(*(long *)(param_1 + 0xc0) + (long)(int)param_2 * 0x18);
  uStack_48 = puVar4[1];
  local_50 = (int *)*puVar4;
  local_40 = puVar4[2];
  uVar2 = 0;
  if (local_50 != (int *)0x0) {
    LOAcquire();
    iVar1 = *local_50;
    *local_50 = iVar1 + 1;
    uVar2 = CONCAT44((int)((ulong)local_50 >> 0x20),iVar1);
    LORelease();
  }
  uVar2 = __ZN2dj5audio11BassSample34openE7QStringibb(uVar2,param_1,&local_50,param_2,0,0);
  if (local_50 != (int *)0x0) {
    LOAcquire();
    iVar1 = *local_50;
    *local_50 = iVar1 + -1;
    LORelease();
    if (iVar1 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_50,2,8);
    }
  }
  return uVar2;
}

