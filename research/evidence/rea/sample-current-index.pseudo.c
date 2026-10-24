
int __ZN2dj5audio11BassSample320getCurrentTrackIndexEv(long param_1)

{
  int iVar1;
  
  iVar1 = *(int *)(param_1 + 0x100);
  if (iVar1 == -1) {
    if (((*(int *)(param_1 + 0xec) != 0) || (*(char *)(param_1 + 0xc0c) == '\x01')) &&
       ((*(byte *)(param_1 + 0xbe9) & 1) != 0)) {
      return -1;
    }
    iVar1 = *(int *)(param_1 + 0xd0);
  }
  if (*(char *)(param_1 + 0xb4) == '\0') {
    iVar1 = -1;
  }
  return iVar1;
}

