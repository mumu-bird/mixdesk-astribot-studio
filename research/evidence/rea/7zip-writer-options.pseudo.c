
undefined8 FUN_100cdfc84(long param_1,char *param_2,byte *param_3)

{
  int iVar1;
  char *pcVar2;
  long lVar3;
  
  lVar3 = *(long *)(param_1 + 0xd0);
  iVar1 = _strcmp(param_2,"compression");
  if (iVar1 == 0) {
    if ((((param_3 == (byte *)0x0) || (iVar1 = _strcmp((char *)param_3,"copy"), iVar1 == 0)) ||
        (iVar1 = _strcmp((char *)param_3,"COPY"), iVar1 == 0)) ||
       ((iVar1 = _strcmp((char *)param_3,"store"), iVar1 == 0 ||
        (iVar1 = _strcmp((char *)param_3,"STORE"), iVar1 == 0)))) {
      *(undefined4 *)(lVar3 + 0x80) = 0;
      return 0;
    }
    iVar1 = _strcmp((char *)param_3,"deflate");
    if ((iVar1 == 0) || (iVar1 = _strcmp((char *)param_3,"DEFLATE"), iVar1 == 0)) {
      *(undefined4 *)(lVar3 + 0x80) = 0x40108;
      return 0;
    }
    iVar1 = _strcmp((char *)param_3,"bzip2");
    if ((iVar1 == 0) || (iVar1 = _strcmp((char *)param_3,"BZIP2"), iVar1 == 0)) {
      *(undefined4 *)(lVar3 + 0x80) = 0x40202;
      return 0;
    }
    iVar1 = _strcmp((char *)param_3,"lzma1");
    if ((iVar1 != 0) && (iVar1 = _strcmp((char *)param_3,"LZMA1"), iVar1 != 0)) {
      iVar1 = _strcmp((char *)param_3,"lzma2");
      if ((iVar1 != 0) && (iVar1 = _strcmp((char *)param_3,"LZMA2"), iVar1 != 0)) {
        iVar1 = _strcmp((char *)param_3,"ppmd");
        if (((iVar1 == 0) || (iVar1 = _strcmp((char *)param_3,"PPMD"), iVar1 == 0)) ||
           (iVar1 = _strcmp((char *)param_3,"PPMd"), iVar1 == 0)) {
          *(undefined4 *)(lVar3 + 0x80) = 0x30401;
          return 0;
        }
        pcVar2 = "Unknown compression name: `%s\'";
        goto LAB_100cdfe74;
      }
    }
    pcVar2 = "`%s\' compression not supported on this platform";
  }
  else {
    iVar1 = _strcmp(param_2,"compression-level");
    if (iVar1 != 0) {
      return 0xffffffec;
    }
    if (((param_3 != (byte *)0x0) && (*param_3 - 0x30 < 10)) && (param_3[1] == 0)) {
      *(uint *)(lVar3 + 0x84) = *param_3 - 0x30 & 0xff;
      return 0;
    }
    pcVar2 = "Illegal value `%s\'";
  }
LAB_100cdfe74:
  _archive_set_error(param_1,0xffffffff,pcVar2);
  return 0xffffffe7;
}

