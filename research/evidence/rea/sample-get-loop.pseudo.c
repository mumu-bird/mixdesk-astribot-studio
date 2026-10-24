
uint __ZN2dj5audio11BassSample37getLoopEi(long param_1,uint param_2)

{
  uint uVar1;
  uint uVar2;
  
  if (param_2 < 4) {
    uVar2 = *(uint *)(param_1 + (ulong)param_2 * 4 + 0xb58);
    uVar1 = 0;
    if (uVar2 < 5) {
      uVar1 = uVar2 ^ 1;
    }
    return uVar1 & 1;
  }
  return 0;
}

