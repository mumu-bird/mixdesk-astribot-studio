
undefined4 FUN_100ca8480(undefined8 param_1,long param_2,ulong *param_3,long *param_4)

{
  byte bVar1;
  int iVar2;
  undefined8 uVar3;
  char *pcVar4;
  ulong uVar5;
  uint uVar6;
  long lVar7;
  
  uVar5 = *param_3;
  *(ulong *)(param_2 + 0x128) = uVar5;
  *(undefined8 *)(param_2 + 0x130) = 0xffffffffffffffff;
  if ((long)uVar5 < 0x3030103) {
    if ((long)uVar5 < 0x30101) {
      if (uVar5 == 0) goto LAB_100ca8580;
LAB_100ca869c:
      if (uVar5 == 3) goto LAB_100ca86b8;
      if (uVar5 == 0x21) goto LAB_100ca86ac;
    }
    else {
      if ((long)uVar5 < 0x40108) {
        if (uVar5 != 0x30101) {
          uVar6 = 0x30401;
          goto LAB_100ca8578;
        }
LAB_100ca86ac:
        pcVar4 = "LZMA codec is unsupported";
        goto LAB_100ca86c4;
      }
      if (uVar5 == 0x40108) goto LAB_100ca8580;
      uVar6 = 0x40202;
LAB_100ca8578:
      if (uVar5 != uVar6) goto LAB_100ca8798;
LAB_100ca8580:
      if (param_4 != (long *)0x0) {
        lVar7 = *param_4;
        if ((lVar7 != 0x3030103) && (lVar7 != 0x303011b)) {
          pcVar4 = "Unsupported filter %lx for %lx";
          goto LAB_100ca86c4;
        }
        *(long *)(param_2 + 0x130) = lVar7;
        *(undefined4 *)(param_2 + 0x4d74) = 0;
        if (lVar7 == 0x3030103) {
          *(undefined8 *)(param_2 + 0x4d88) = 0xffffffffffffffff;
          *(undefined8 *)(param_2 + 0x4d90) = 0x500000000;
        }
      }
      if ((long)uVar5 < 0x30101) {
        if (uVar5 == 0) {
          return 0;
        }
        goto LAB_100ca869c;
      }
      if ((long)uVar5 < 0x40108) {
        if (uVar5 == 0x30101) goto LAB_100ca86ac;
        if (uVar5 == 0x30401) {
          if (*(int *)(param_2 + 0x4d70) != 0) {
            FUN_100c98cac(param_2 + 0x208,&PTR_FUN_119fc4178);
            *(undefined4 *)(param_2 + 0x4d70) = 0;
          }
          if (4 < param_3[3]) {
            bVar1 = *(byte *)param_3[4];
            if ((0xffffffc0 < bVar1 - 0x41) &&
               (iVar2 = *(int *)((byte *)param_3[4] + 1), 0x823 < iVar2 + 0x24U)) {
              FUN_100c98ab0(param_2 + 0x208);
              iVar2 = FUN_100c98c24(param_2 + 0x208,iVar2,&PTR_FUN_119fc4178);
              if (iVar2 == 0) {
                _archive_set_error(param_1,0xc,"Coludn\'t allocate memory for PPMd");
                return 0xffffffe2;
              }
              FUN_100c98ce4(param_2 + 0x208,bVar1);
              FUN_100c98d10(param_2 + 0x4cf8);
              *(undefined4 *)(param_2 + 0x4d70) = 1;
              *(undefined4 *)(param_2 + 0x204) = 0;
              *(undefined4 *)(param_2 + 0x4d68) = 0;
              *(undefined8 *)(param_2 + 0x4d48) = 0;
              *(undefined8 *)(param_2 + 0x4d60) = 0;
              return 0;
            }
          }
          pcVar4 = "Malformed PPMd parameter";
          goto LAB_100ca86c4;
        }
      }
      else {
        if (uVar5 == 0x40108) {
          if (*(int *)(param_2 + 0x200) == 0) {
            iVar2 = _inflateInit2_((z_streamp)(param_2 + 400),-0xf,"1.2.12",0x70);
          }
          else {
            iVar2 = _inflateReset((z_streamp)(param_2 + 400));
          }
          if (iVar2 == 0) {
            *(undefined4 *)(param_2 + 0x200) = 1;
            *(undefined8 *)(param_2 + 0x1a0) = 0;
            *(undefined8 *)(param_2 + 0x1b8) = 0;
            return 0;
          }
          pcVar4 = "Couldn\'t initialize zlib stream.";
          goto LAB_100ca86c4;
        }
        if (uVar5 == 0x40202) {
          if (*(int *)(param_2 + 0x188) != 0) {
            _BZ2_bzDecompressEnd((bz_stream *)(param_2 + 0x138));
            *(undefined4 *)(param_2 + 0x188) = 0;
          }
          iVar2 = _BZ2_bzDecompressInit((bz_stream *)(param_2 + 0x138),0,0);
          if (iVar2 == -3) {
            iVar2 = _BZ2_bzDecompressInit((bz_stream *)(param_2 + 0x138),0,1);
          }
          uVar3 = 0xffffffff;
          if (iVar2 < -2) {
            if ((iVar2 != -9) && (iVar2 == -3)) {
              uVar3 = 0xc;
            }
          }
          else if (iVar2 == 0) {
            *(undefined4 *)(param_2 + 0x188) = 1;
            *(undefined8 *)(param_2 + 0x144) = 0;
            *(undefined8 *)(param_2 + 0x15c) = 0;
            return 0;
          }
          _archive_set_error(param_1,uVar3,"Internal error initializing decompressor: %s");
          *(undefined4 *)(param_2 + 0x188) = 0;
          return 0xffffffe7;
        }
      }
    }
LAB_100ca8798:
    pcVar4 = "Unknown codec ID: %lX";
  }
  else {
    if ((long)uVar5 < 0x3030401) {
      if ((uVar5 == 0x3030103 || uVar5 == 0x303011b) || uVar5 == 0x3030205) goto LAB_100ca86b8;
      goto LAB_100ca8798;
    }
    if ((long)uVar5 < 0x3030701) {
      if (uVar5 != 0x3030401) {
        uVar6 = 0x501;
LAB_100ca8688:
        if (uVar5 != (uVar6 | 0x3030000)) goto LAB_100ca8798;
      }
    }
    else if (uVar5 != 0x3030701) {
      uVar6 = 0x805;
      goto LAB_100ca8688;
    }
LAB_100ca86b8:
    pcVar4 = "Unexpected codec ID: %lX";
  }
LAB_100ca86c4:
  _archive_set_error(param_1,0xffffffff,pcVar4);
  return 0xffffffe7;
}

