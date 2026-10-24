
uint __ZN2dj5audio11BassSample319getCurrentLoopStateEv(long param_1)

{
  uint uVar1;
  ulong uVar2;
  
  uVar2 = (ulong)*(uint *)(param_1 + 0x100);
  if ((int)*(uint *)(param_1 + 0x100) < 0) {
    uVar2 = (ulong)*(int *)(param_1 + 0xd0);
  }
  uVar1 = *(uint *)(param_1 + 0xb58 + uVar2 * 4);
  if (uVar1 < 5) {
    return (uVar1 ^ 1) & 1;
  }
  return 0;
}

