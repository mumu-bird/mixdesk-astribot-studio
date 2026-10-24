
void __ZN2dj5audio11BassSample37setLoopEbi(long param_1,int param_2,uint param_3)

{
  int iVar1;
  int iVar2;
  int iVar3;
  int iVar4;
  
  if (param_3 < 4) {
    iVar4 = *(int *)(param_1 + 0xb58 + (ulong)param_3 * 4);
    iVar1 = iVar4;
    if (iVar4 == 0) {
      iVar1 = 1;
    }
    iVar2 = 3;
    if (iVar4 != 2) {
      iVar2 = iVar1;
    }
    iVar1 = 5;
    if (iVar4 != 4) {
      iVar1 = iVar2;
    }
    iVar2 = iVar4;
    if (iVar4 == 1) {
      iVar2 = 0;
    }
    iVar3 = 2;
    if (iVar4 != 3) {
      iVar3 = iVar2;
    }
    iVar2 = 4;
    if (iVar4 != 5) {
      iVar2 = iVar3;
    }
    if (param_2 != 0) {
      iVar1 = iVar2;
    }
    *(int *)(param_1 + 0xb58 + (ulong)param_3 * 4) = iVar1;
  }
  return;
}

