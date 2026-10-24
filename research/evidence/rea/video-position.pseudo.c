
void __ZN5Video11setPositionExix(long param_1,long param_2,uint param_3,undefined8 param_4)

{
  long lVar1;
  
  if (param_3 < 2) {
    param_1 = param_1 + (ulong)param_3 * 0x58;
    if (*(long *)(param_1 + 0x58) == -0x8000000000000000) {
      *(undefined8 *)(param_1 + 0x78) = 0x7fffffffffffffff;
    }
    lVar1 = (long)(double)param_2;
    *(undefined8 *)(param_1 + 0x58) = param_4;
    *(long *)(param_1 + 0x60) = lVar1;
    if (*(long *)(param_1 + 0x50) == lVar1) {
      *(int *)(param_1 + 0x48) = *(int *)(param_1 + 0x48) + 1;
      return;
    }
    *(undefined4 *)(param_1 + 0x48) = 1;
    *(long *)(param_1 + 0x50) = lVar1;
  }
  return;
}

