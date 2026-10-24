
long FUN_100ca45dc(long param_1,undefined8 *param_2,long *param_3,long *param_4)

{
  byte bVar1;
  char cVar2;
  long lVar3;
  uLong uVar4;
  long lVar5;
  long lVar6;
  long lVar7;
  
  lVar7 = **(long **)(param_1 + 0x848);
  if (*(long *)(lVar7 + 0x120) != 0) {
    ___archive_read_consume(param_1);
    *(long *)(lVar7 + 0xf8) = *(long *)(lVar7 + 0xf8) + *(long *)(lVar7 + 0x120);
    *(undefined8 *)(lVar7 + 0x120) = 0;
  }
  *param_4 = *(long *)(lVar7 + 0xb8);
  *param_3 = 0;
  *param_2 = 0;
  if (*(char *)(lVar7 + 0xd0) != '\0') {
    return 1;
  }
  lVar3 = FUN_100ca5fbc(param_1,param_2,*(undefined8 *)(lVar7 + 0xc0),0);
  if (lVar3 < 0) {
    return lVar3;
  }
  if (lVar3 != 0) {
    lVar5 = *(long *)(lVar7 + 0xc0) - lVar3;
    *(long *)(lVar7 + 0xc0) = lVar5;
    if (lVar5 == 0) {
      *(undefined1 *)(lVar7 + 0xd0) = 1;
      bVar1 = *(byte *)(*(long *)(lVar7 + 0xa8) + 0x18);
    }
    else {
      bVar1 = *(byte *)(*(long *)(lVar7 + 0xa8) + 0x18);
    }
    if ((bVar1 >> 3 & 1) == 0) {
      cVar2 = *(char *)(lVar7 + 0xd0);
    }
    else {
      uVar4 = _crc32(*(uLong *)(lVar7 + 200),(Bytef *)*param_2,(uInt)lVar3);
      *(uLong *)(lVar7 + 200) = uVar4;
      cVar2 = *(char *)(lVar7 + 0xd0);
    }
    if (((cVar2 == '\0') || ((*(byte *)(*(long *)(lVar7 + 0xa8) + 0x18) >> 3 & 1) == 0)) ||
       (*(ulong *)(lVar7 + 200) ==
        (ulong)*(uint *)(*(long *)(lVar7 + 0x60) +
                        (ulong)*(uint *)(*(long *)(lVar7 + 0xa8) + 0x14) * 4))) {
      lVar5 = 0;
    }
    else {
      _archive_set_error(param_1,0xffffffff,"7-Zip bad CRC: 0x%lx should be 0x%lx");
      lVar5 = 0xffffffec;
    }
    *param_3 = lVar3;
    lVar6 = *(long *)(lVar7 + 0xb8);
    *param_4 = lVar6;
    *(long *)(lVar7 + 0xb8) = lVar6 + lVar3;
    return lVar5;
  }
  _archive_set_error(param_1,0x4f,"Truncated 7-Zip file body");
  return 0xffffffe2;
}

