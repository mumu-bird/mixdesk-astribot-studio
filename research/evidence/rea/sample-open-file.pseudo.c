
undefined8
__ZN2dj5audio11BassSample34openE7QStringibb
          (long param_1,undefined8 *param_2,int param_3,undefined8 param_4,ulong param_5)

{
  undefined *puVar1;
  undefined *puVar2;
  int iVar3;
  int iVar4;
  long lVar5;
  ulong uVar6;
  undefined8 uVar7;
  int *piVar8;
  undefined8 uVar9;
  int *piVar10;
  int *piVar11;
  long lVar12;
  undefined8 uVar13;
  undefined8 *puVar14;
  uint uVar15;
  uint uVar16;
  double dVar17;
  int *local_720;
  ulong uStack_718;
  int *local_710;
  undefined8 uStack_708;
  undefined8 local_700;
  int *local_6f0;
  undefined8 uStack_6e8;
  undefined8 local_6e0;
  int *local_6d8;
  int *local_6d0;
  undefined8 uStack_6c8;
  undefined8 local_6c0;
  undefined1 auStack_6b0 [480];
  int *local_4d0;
  int *local_4b0;
  int *local_490;
  undefined8 *local_488;
  long local_480;
  int *local_458;
  int *local_450;
  undefined8 uStack_448;
  undefined8 local_440;
  int *local_438 [3];
  int *local_420;
  int *piStack_418;
  ulong local_410;
  int *local_400;
  int *piStack_3f8;
  ulong local_3f0;
  int *local_3e0;
  undefined8 uStack_3d8;
  undefined8 local_3d0;
  int *local_3c0;
  undefined *local_3b8;
  undefined8 local_3b0;
  undefined1 auStack_3a8 [8];
  undefined4 local_3a0;
  int iStack_39c;
  int *piStack_398;
  ulong uStack_390;
  int *local_388;
  undefined8 uStack_380;
  undefined8 local_378;
  undefined8 uStack_370;
  undefined8 local_368;
  undefined8 uStack_360;
  undefined8 local_358;
  undefined8 uStack_350;
  undefined8 local_348;
  undefined8 uStack_340;
  undefined8 local_338;
  undefined8 uStack_330;
  undefined8 local_328;
  undefined8 uStack_320;
  undefined8 local_318;
  undefined8 uStack_310;
  undefined8 local_308;
  undefined8 uStack_300;
  undefined8 local_2f8;
  undefined8 uStack_2f0;
  undefined8 local_2e8;
  undefined8 uStack_2e0;
  undefined8 local_2d8;
  undefined8 uStack_2d0;
  undefined8 local_2c8;
  undefined8 uStack_2c0;
  undefined8 local_2b8;
  undefined8 uStack_2b0;
  undefined8 uStack_2a8;
  undefined4 uStack_2a0;
  undefined4 local_29c;
  undefined4 uStack_298;
  undefined8 uStack_294;
  undefined8 local_288;
  undefined8 uStack_280;
  undefined4 local_278;
  undefined1 auStack_270 [24];
  undefined8 local_258;
  undefined8 uStack_250;
  undefined8 local_248;
  undefined8 local_240;
  undefined4 local_238;
  undefined8 local_230;
  undefined8 local_228;
  undefined8 uStack_220;
  undefined1 local_218;
  undefined8 local_210;
  undefined8 uStack_208;
  undefined8 uStack_200;
  undefined4 uStack_1f8;
  undefined4 local_1f4;
  undefined4 uStack_1f0;
  undefined8 uStack_1ec;
  undefined8 local_1e4;
  undefined8 local_1d8;
  undefined8 local_1d0;
  undefined8 local_1c8;
  int *piStack_1c0;
  undefined8 uStack_1b8;
  undefined8 uStack_1b0;
  undefined1 local_1a8;
  undefined4 local_1a4;
  undefined4 uStack_1a0;
  undefined4 uStack_19c;
  undefined4 uStack_198;
  undefined4 uStack_194;
  undefined4 local_190;
  undefined4 uStack_18c;
  undefined4 local_188;
  int *local_180;
  undefined8 *puStack_178;
  long local_170;
  undefined1 local_168;
  undefined4 local_160;
  undefined4 uStack_15c;
  undefined8 uStack_158;
  uint local_150;
  undefined4 uStack_14c;
  int *local_140;
  undefined8 uStack_138;
  undefined8 local_130;
  undefined1 auStack_128 [32];
  undefined1 auStack_108 [32];
  undefined1 auStack_e8 [32];
  undefined1 auStack_c8 [32];
  undefined1 auStack_a8 [32];
  long local_88;
  
  local_88 = *(long *)PTR____stack_chk_guard_10172c568;
  uStack_138 = param_2[1];
  local_140 = (int *)*param_2;
  local_130 = param_2[2];
  uVar13 = 0;
  if (local_140 != (int *)0x0) {
    LOAcquire();
    iVar4 = *local_140;
    *local_140 = iVar4 + 1;
    uVar13 = CONCAT44((int)((ulong)local_140 >> 0x20),iVar4);
    LORelease();
  }
  FUN_10009f7e0(uVar13,auStack_128,&local_140);
  if (local_140 != (int *)0x0) {
    LOAcquire();
    iVar4 = *local_140;
    *local_140 = iVar4 + -1;
    LORelease();
    if (iVar4 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_140,2,8);
    }
  }
  if (param_2[2] == 0) {
    puVar14 = (undefined8 *)(param_1 + 0xb8);
    piVar11 = (int *)*puVar14;
    if ((piVar11 == (int *)0x0) || (1 < *piVar11)) {
      FUN_100015064(puVar14,0,0,0);
      piVar11 = (int *)*puVar14;
      if (piVar11 != (int *)0x0) goto LAB_100159574;
LAB_100159580:
      FUN_100015064(puVar14,0,0,0);
    }
    else {
LAB_100159574:
      if (1 < *piVar11) goto LAB_100159580;
    }
    __ZN7QStringaSERKS_(*(long *)(param_1 + 0xc0) + (long)param_3 * 0x18,param_2);
    uStack_294 = 0;
    uStack_298 = 0;
    uStack_390 = 0;
    piStack_398 = (int *)0x0;
    uStack_380 = 0;
    local_388 = (int *)0x0;
    uStack_370 = 0;
    local_378 = 0;
    uStack_360 = 0;
    local_368 = 0;
    uStack_350 = 0;
    local_358 = 0;
    uStack_340 = 0;
    local_348 = 0;
    uStack_330 = 0;
    local_338 = 0;
    uStack_320 = 0;
    local_328 = 0;
    uStack_310 = 0;
    local_318 = 0;
    uStack_300 = 0;
    local_308 = 0;
    uStack_2f0 = 0;
    local_2f8 = 0;
    uStack_2e0 = 0;
    local_2e8 = 0;
    uStack_2d0 = 0;
    local_2d8 = 0;
    uStack_2c0 = 0;
    local_2c8 = 0;
    uStack_2b0 = 0;
    local_2b8 = 0;
    uStack_2a0 = 0;
    local_29c = 0;
    uStack_2a8 = 0;
    uStack_280 = 0;
    local_288 = 0;
    local_3a0 = 0;
    local_278 = 0;
    __ZN6QImageC1Ev(auStack_270);
    uStack_250 = 0;
    local_258 = 0;
    local_248 = 0;
    local_240 = 0xffffffff;
    local_238 = 0;
    uStack_220 = 0;
    local_228 = 0;
    local_230 = 0;
    local_218 = 0;
    uStack_1ec = 0;
    uStack_1f0 = 0;
    uStack_208 = 0;
    local_210 = 0;
    uStack_1f8 = 0;
    local_1f4 = 0;
    uStack_200 = 0;
    local_1e4 = 0xc61c3c00;
    local_1d8 = 0x4056800000000000;
    local_1d0 = 0xffffffffffffffff;
    local_170 = 0;
    puStack_178 = (undefined8 *)0x0;
    local_180 = (int *)0x0;
    piStack_1c0 = (int *)0x0;
    local_1c8 = 0;
    uStack_1b0 = 0;
    uStack_1b8 = 0;
    local_1a8 = 0;
    uStack_19c = 0;
    uStack_198 = 0;
    local_1a4 = 0;
    uStack_1a0 = 0;
    uStack_18c = 0;
    local_188 = 0;
    uStack_194 = 0;
    local_190 = 0;
    local_168 = 1;
    local_160 = 0xffffffff;
    uStack_158 = 0xbff0000000000000;
    local_150 = local_150 & 0xffffff00;
    param_1 = param_1 + (long)param_3 * 600;
    uStack_14c = 0;
    FUN_100094010(param_1 + 0x1f8,&local_3a0);
    *(undefined8 *)(param_1 + 0x3c0) = local_1d8;
    piVar11 = (int *)CONCAT44(uStack_19c,uStack_1a0);
    if (piVar11 != (int *)0x0) {
      LOAcquire();
      *piVar11 = *piVar11 + 1;
      LORelease();
    }
    piVar8 = *(int **)(param_1 + 0x3f8);
    *(ulong *)(param_1 + 0x400) = CONCAT44(uStack_194,uStack_198);
    *(int **)(param_1 + 0x3f8) = piVar11;
    *(ulong *)(param_1 + 0x408) = CONCAT44(uStack_18c,local_190);
    if (piVar8 != (int *)0x0) {
      LOAcquire();
      iVar4 = *piVar8;
      *piVar8 = iVar4 + -1;
      LORelease();
      if (iVar4 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(piVar8,0x20,8);
      }
    }
    *(undefined8 *)(param_1 + 0x3c8) = local_1d0;
    __ZN7QStringaSERKS_(param_1 + 0x3d8,&piStack_1c0);
    *(undefined8 *)(param_1 + 0x3d0) = local_1c8;
    *(undefined4 *)(param_1 + 0x3f4) = local_1a4;
    *(undefined4 *)(param_1 + 0x410) = local_188;
    *(undefined1 *)(param_1 + 0x430) = local_168;
    *(undefined8 *)(param_1 + 0x440) = uStack_158;
    *(ulong *)(param_1 + 0x438) = CONCAT44(uStack_15c,local_160);
    *(ulong *)(param_1 + 0x448) = CONCAT44(uStack_14c,local_150);
    if (local_180 != (int *)0x0) {
      LOAcquire();
      iVar4 = *local_180;
      *local_180 = iVar4 + -1;
      LORelease();
      if (iVar4 == 1) {
        if (local_170 != 0) {
          lVar5 = local_170 * 0x58;
          puVar14 = puStack_178;
          do {
            piVar11 = (int *)puVar14[6];
            if (piVar11 != (int *)0x0) {
              LOAcquire();
              iVar4 = *piVar11;
              *piVar11 = iVar4 + -1;
              LORelease();
              if (iVar4 == 1) {
                __ZN10QArrayData10deallocateEPS_xx(puVar14[6],2,8);
              }
            }
            piVar11 = (int *)*puVar14;
            if (piVar11 != (int *)0x0) {
              LOAcquire();
              iVar4 = *piVar11;
              *piVar11 = iVar4 + -1;
              LORelease();
              if (iVar4 == 1) {
                __ZN10QArrayData10deallocateEPS_xx(*puVar14,2,8);
              }
            }
            puVar14 = puVar14 + 0xb;
            lVar5 = lVar5 + -0x58;
          } while (lVar5 != 0);
        }
        __ZN10QArrayData10deallocateEPS_xx(local_180,0x58,8);
      }
    }
    piVar11 = (int *)CONCAT44(uStack_19c,uStack_1a0);
    if (piVar11 != (int *)0x0) {
      LOAcquire();
      iVar4 = *piVar11;
      *piVar11 = iVar4 + -1;
      LORelease();
      if (iVar4 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(CONCAT44(uStack_19c,uStack_1a0),0x20,8);
      }
    }
    if (piStack_1c0 != (int *)0x0) {
      LOAcquire();
      iVar4 = *piStack_1c0;
      *piStack_1c0 = iVar4 + -1;
      LORelease();
      if (iVar4 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(piStack_1c0,2,8);
      }
    }
    FUN_10009f554(&local_3a0);
  }
  else {
    *(undefined1 *)(param_1 + 0x11f) = 0;
    if (*(int *)(param_1 + 0xd0) == param_3) {
      puVar14 = (undefined8 *)(param_1 + 0xb8);
      piVar11 = (int *)*puVar14;
      if ((piVar11 == (int *)0x0) || (1 < *piVar11)) {
        FUN_100015064(puVar14,0,0,0);
        piVar11 = (int *)*puVar14;
        if (piVar11 != (int *)0x0) goto LAB_100159028;
LAB_100159034:
        FUN_100015064(puVar14,0,0,0);
      }
      else {
LAB_100159028:
        if (1 < *piVar11) goto LAB_100159034;
      }
      lVar12 = *(long *)(param_1 + 0xc0) + (long)param_3 * 0x18;
      lVar5 = *(long *)(lVar12 + 0x10);
      if ((((lVar5 == param_2[2]) &&
           (iVar4 = __ZN9QtPrivate14compareStringsE11QStringViewS0_N2Qt15CaseSensitivityE
                              (lVar5,*(undefined8 *)(lVar12 + 8),lVar5,param_2[1],1), iVar4 == 0))
          && ((uint)(*(long *)(param_1 + 0x30) == 0) != (uint)param_4)) &&
         ((*(long *)(param_1 + 0xe0) != 0 && ((param_5 & 1) == 0)))) {
        if (*(char *)(param_1 + 0xb4) != '\x01') {
          __ZN2dj5audio11BassSample34playEv(param_1);
          uVar13 = 1;
          goto LAB_100159a40;
        }
        if ((*(uint *)(param_1 + (long)*(int *)(param_1 + 0xd0) * 4 + 0xb58) & 0xfffffffe) != 4) {
          uVar13 = 1;
          *(undefined1 *)(param_1 + 0x11c) = 1;
          goto LAB_100159a40;
        }
        __ZN2dj5audio11BassSample34stopEv(param_1);
        goto LAB_100159a3c;
      }
    }
    lVar5 = __ZNK7QString5utf16Ev(param_2);
    if (lVar5 != 0) {
      __ZN9QFileInfoC1ERK7QString(auStack_3a8,param_2);
      __ZNK9QFileInfo6suffixEv(&local_3a0,auStack_3a8);
      __ZN7QString14toLower_helperERS_(&local_3c0,&local_3a0);
      piVar11 = (int *)CONCAT44(iStack_39c,local_3a0);
      if (piVar11 != (int *)0x0) {
        LOAcquire();
        iVar4 = *piVar11;
        *piVar11 = iVar4 + -1;
        LORelease();
        if (iVar4 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(CONCAT44(iStack_39c,local_3a0),2,8);
        }
      }
      puVar2 = PTR___ZN7QString6_emptyE_10172c3d0;
      puVar1 = PTR___ZN7QString6_emptyE_10172c3d0;
      if (local_3b8 != (undefined *)0x0) {
        puVar1 = local_3b8;
      }
      iVar4 = __ZN7QString14compare_helperEPK5QCharxPKcxN2Qt15CaseSensitivityE
                        (puVar1,local_3b0,"mpg",0xffffffffffffffff,1);
      if (iVar4 == 0) {
LAB_1001597ec:
        __ZN7QString8fromUtf8E14QByteArrayView(&local_3a0,4,"open");
        local_400 = (int *)CONCAT44(iStack_39c,local_3a0);
        piStack_3f8 = piStack_398;
        local_3f0 = uStack_390;
        __ZN7QString8fromUtf8E14QByteArrayView(&local_3a0,0xf,"BassSample3.cpp");
        local_420 = (int *)CONCAT44(iStack_39c,local_3a0);
        piStack_418 = piStack_398;
        local_410 = uStack_390;
        __ZN2dj5audio14PrintBassErrorE7QStringS1_i(&local_400,&local_420,0x4c0);
        if (local_420 != (int *)0x0) {
          LOAcquire();
          iVar4 = *local_420;
          *local_420 = iVar4 + -1;
          LORelease();
          if (iVar4 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_420,2,8);
          }
        }
        if (local_400 != (int *)0x0) {
          LOAcquire();
          iVar4 = *local_400;
          *local_400 = iVar4 + -1;
          LORelease();
          if (iVar4 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_400,2,8);
          }
        }
        local_388 = (int *)0x0;
        uStack_390 = 0;
        piStack_398 = (int *)0x0;
        uStack_380 = 0x1000;
        local_3a0 = 5;
        __ZNK11QMetaObject2trEPKcS1_i
                  (local_438,&__ZN2dj5audio11BassSample316staticMetaObjectE,
                   "Could not load sample: %1",0,0xffffffff);
        __ZNK7QString3argERKS_i5QChar(&local_720,local_438,param_2,0,0x20);
        uStack_390 = uStack_718;
        piStack_398 = local_720;
        local_720 = (int *)0x0;
        uStack_718 = 0;
        local_388 = local_710;
        local_710 = (int *)0x0;
        if (local_438[0] != (int *)0x0) {
          LOAcquire();
          iVar4 = *local_438[0];
          *local_438[0] = iVar4 + -1;
          LORelease();
          if (iVar4 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_438[0],2,8);
          }
        }
        uStack_380 = CONCAT44(uStack_380._4_4_,0x50);
        iVar4 = *(int *)(param_1 + 0xb0);
        iVar3 = *(int *)(param_1 + 0x118);
        __ZN8QVariantC1E9QMetaTypePKv
                  (auStack_a8,
                   PTR___ZN9QtPrivate25QMetaTypeInterfaceWrapperIN2dj9UIDJErrorEE8metaTypeE_10172d3b0
                   ,&local_3a0);
        __ZN2dj5audio11BassSample312sample_errorENS_11DJErrorEnumEi8QVariant
                  (param_1,5,iVar3 + iVar4 * 1000,auStack_a8);
        __ZN8QVariantD1Ev(auStack_a8);
joined_r0x000100159978:
        if (piStack_398 != (int *)0x0) {
          LOAcquire();
          iVar4 = *piStack_398;
          *piStack_398 = iVar4 + -1;
          LORelease();
          if (iVar4 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(piStack_398,2,8);
          }
        }
        uVar13 = 0;
      }
      else {
        puVar1 = puVar2;
        if (local_3b8 != (undefined *)0x0) {
          puVar1 = local_3b8;
        }
        iVar4 = __ZN7QString14compare_helperEPK5QCharxPKcxN2Qt15CaseSensitivityE
                          (puVar1,local_3b0,"mp4",0xffffffffffffffff,1);
        if (iVar4 == 0) goto LAB_1001597ec;
        puVar1 = puVar2;
        if (local_3b8 != (undefined *)0x0) {
          puVar1 = local_3b8;
        }
        iVar4 = __ZN7QString14compare_helperEPK5QCharxPKcxN2Qt15CaseSensitivityE
                          (puVar1,local_3b0,"m4v",0xffffffffffffffff,1);
        if (iVar4 == 0) goto LAB_1001597ec;
        puVar1 = puVar2;
        if (local_3b8 != (undefined *)0x0) {
          puVar1 = local_3b8;
        }
        iVar4 = __ZN7QString14compare_helperEPK5QCharxPKcxN2Qt15CaseSensitivityE
                          (puVar1,local_3b0,"asf",0xffffffffffffffff,1);
        if (iVar4 == 0) goto LAB_1001597ec;
        puVar1 = puVar2;
        if (local_3b8 != (undefined *)0x0) {
          puVar1 = local_3b8;
        }
        iVar4 = __ZN7QString14compare_helperEPK5QCharxPKcxN2Qt15CaseSensitivityE
                          (puVar1,local_3b0,"wmv",0xffffffffffffffff,1);
        if (iVar4 == 0) goto LAB_1001597ec;
        puVar1 = puVar2;
        if (local_3b8 != (undefined *)0x0) {
          puVar1 = local_3b8;
        }
        iVar4 = __ZN7QString14compare_helperEPK5QCharxPKcxN2Qt15CaseSensitivityE
                          (puVar1,local_3b0,"mov",0xffffffffffffffff,1);
        if (iVar4 == 0) goto LAB_1001597ec;
        if (local_3b8 != (undefined *)0x0) {
          puVar2 = local_3b8;
        }
        iVar4 = __ZN7QString14compare_helperEPK5QCharxPKcxN2Qt15CaseSensitivityE
                          (puVar2,local_3b0,"cda",0xffffffffffffffff,1);
        if (iVar4 == 0) goto LAB_1001597ec;
        uStack_3d8 = param_2[1];
        local_3e0 = (int *)*param_2;
        local_3d0 = param_2[2];
        uVar13 = 0;
        if (local_3e0 != (int *)0x0) {
          LOAcquire();
          iVar4 = *local_3e0;
          *local_3e0 = iVar4 + 1;
          uVar13 = CONCAT44((int)((ulong)local_3e0 >> 0x20),iVar4);
          LORelease();
        }
        uVar13 = __Z16CreateBassStreami7QStringyyjPc(uVar13,0,&local_3e0,0,0,0x80220100,0);
        if (local_3e0 != (int *)0x0) {
          LOAcquire();
          iVar4 = *local_3e0;
          *local_3e0 = iVar4 + -1;
          LORelease();
          if (iVar4 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_3e0,2,8);
          }
        }
        if ((int)uVar13 == 0) goto LAB_1001597ec;
        uVar6 = __ZN2dj5audio18BassCircularBuffer9getLengthEj(uVar13);
        piVar11 = (int *)_BASS_ChannelBytes2Seconds(uVar13,uVar6);
        if ((31.0 < (double)piVar11) || (0x7e02fe00 < uVar6)) {
          local_388 = (int *)0x0;
          uStack_390 = 0;
          piStack_398 = (int *)0x0;
          uStack_380 = 0x1000;
          local_3a0 = 5;
          __ZNK11QMetaObject2trEPKcS1_i
                    (&local_720,&__ZN2dj5audio11BassSample316staticMetaObjectE,
                     "Audio sample too long!",0,0xffffffff);
          uStack_390 = uStack_718;
          piStack_398 = local_720;
          local_388 = local_710;
          iVar4 = *(int *)(param_1 + 0xb0);
          iVar3 = *(int *)(param_1 + 0x118);
          uStack_380 = CONCAT44(uStack_380._4_4_,0x50);
          __ZN8QVariantC1E9QMetaTypePKv
                    (auStack_c8,
                     PTR___ZN9QtPrivate25QMetaTypeInterfaceWrapperIN2dj9UIDJErrorEE8metaTypeE_10172d3b0
                     ,&local_3a0);
          __ZN2dj5audio11BassSample312sample_errorENS_11DJErrorEnumEi8QVariant
                    (param_1,5,iVar3 + iVar4 * 1000,auStack_c8);
          __ZN8QVariantD1Ev(auStack_c8);
          _BASS_StreamFree(uVar13);
          goto joined_r0x000100159978;
        }
        lVar12 = param_1 + 0x1f8 + (long)param_3 * 600;
        lVar5 = *(long *)(lVar12 + 0x18);
        if ((lVar5 != param_2[2]) ||
           (iVar4 = __ZN9QtPrivate14compareStringsE11QStringViewS0_N2Qt15CaseSensitivityE
                              (lVar5,*(undefined8 *)(lVar12 + 0x10),lVar5,param_2[1],1), iVar4 != 0)
           ) {
          uVar7 = __ZN2dj5dbase17HPlaylistDatabase11getInstanceEv();
          uStack_448 = param_2[1];
          local_450 = (int *)*param_2;
          local_440 = param_2[2];
          uVar9 = 0;
          if (local_450 != (int *)0x0) {
            LOAcquire();
            iVar4 = *local_450;
            *local_450 = iVar4 + 1;
            uVar9 = CONCAT44((int)((ulong)local_450 >> 0x20),iVar4);
            LORelease();
          }
          local_458 = (int *)0x0;
          piVar8 = (int *)__Znwm(uVar9,0x28);
          *piVar8 = 1;
          piVar8[4] = 0;
          piVar8[5] = 0;
          piVar8[2] = 0;
          piVar8[3] = 0;
          piVar8[8] = 0;
          piVar8[9] = 0;
          piVar8[6] = 0;
          piVar8[7] = 0;
          piVar8[4] = 0x10;
          piVar8[5] = 0;
          puVar14 = (undefined8 *)__Znam(0xa0);
          puVar14[1] = 1;
          *puVar14 = 0x90;
          puVar14[0x12] = 0;
          *(undefined2 *)(puVar14 + 0x13) = 0;
          puVar14[5] = 0xffffffffffffffff;
          puVar14[4] = 0xffffffffffffffff;
          puVar14[7] = 0xffffffffffffffff;
          puVar14[6] = 0xffffffffffffffff;
          puVar14[9] = 0xffffffffffffffff;
          puVar14[8] = 0xffffffffffffffff;
          puVar14[0xb] = 0xffffffffffffffff;
          puVar14[10] = 0xffffffffffffffff;
          puVar14[0xd] = 0xffffffffffffffff;
          puVar14[0xc] = 0xffffffffffffffff;
          puVar14[0xf] = 0xffffffffffffffff;
          puVar14[0xe] = 0xffffffffffffffff;
          puVar14[0x11] = 0xffffffffffffffff;
          puVar14[0x10] = 0xffffffffffffffff;
          puVar14[3] = 0xffffffffffffffff;
          puVar14[2] = 0xffffffffffffffff;
          *(undefined8 **)(piVar8 + 8) = puVar14 + 2;
          uVar9 = __ZN9QHashSeed10globalSeedEv();
          *(undefined8 *)(piVar8 + 6) = uVar9;
          local_720._0_4_ = 0;
          local_458 = piVar8;
          FUN_1000a48dc(&local_458,&local_720,local_438);
          local_720._0_4_ = 1;
          FUN_1000a48dc(&local_458,&local_720,local_438);
          local_720._0_4_ = 2;
          FUN_1000a48dc(&local_458,&local_720,local_438);
          local_720._0_4_ = 3;
          FUN_1000a48dc(&local_458,&local_720,local_438);
          local_720._0_4_ = 4;
          FUN_1000a48dc(&local_458,&local_720,local_438);
          local_720 = (int *)CONCAT44(local_720._4_4_,5);
          FUN_1000a48dc(&local_458,&local_720,local_438);
          __ZN2dj5dbase17HPlaylistDatabase12GetMediaInfoE7QStringbiNS_17enAnalyzePriorityE4QSetINS_11AnalyzeTypeEE
                    (&local_3a0,uVar7,&local_450,0,0xffffffff,0,&local_458);
          FUN_10008eca4(lVar12,&local_3a0);
          *(undefined8 *)(lVar12 + 0x1c8) = local_1d8;
          piVar8 = (int *)CONCAT44(uStack_19c,uStack_1a0);
          if (piVar8 != (int *)0x0) {
            LOAcquire();
            *piVar8 = *piVar8 + 1;
            LORelease();
          }
          piVar10 = *(int **)(lVar12 + 0x200);
          *(ulong *)(lVar12 + 0x208) = CONCAT44(uStack_194,uStack_198);
          *(int **)(lVar12 + 0x200) = piVar8;
          *(ulong *)(lVar12 + 0x210) = CONCAT44(uStack_18c,local_190);
          if (piVar10 != (int *)0x0) {
            LOAcquire();
            iVar4 = *piVar10;
            *piVar10 = iVar4 + -1;
            LORelease();
            if (iVar4 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(piVar10,0x20,8);
            }
          }
          *(undefined8 *)(lVar12 + 0x1d0) = local_1d0;
          __ZN7QStringaSERKS_(lVar12 + 0x1e0,&piStack_1c0);
          *(undefined8 *)(lVar12 + 0x1d8) = local_1c8;
          *(undefined4 *)(lVar12 + 0x1fc) = local_1a4;
          *(undefined4 *)(lVar12 + 0x218) = local_188;
          *(undefined1 *)(lVar12 + 0x238) = local_168;
          *(undefined8 *)(lVar12 + 0x248) = uStack_158;
          *(ulong *)(lVar12 + 0x240) = CONCAT44(uStack_15c,local_160);
          *(ulong *)(lVar12 + 0x250) = CONCAT44(uStack_14c,local_150);
          if (local_180 != (int *)0x0) {
            LOAcquire();
            iVar4 = *local_180;
            *local_180 = iVar4 + -1;
            LORelease();
            if (iVar4 == 1) {
              if (local_170 != 0) {
                lVar5 = local_170 * 0x58;
                puVar14 = puStack_178;
                do {
                  piVar8 = (int *)puVar14[6];
                  if (piVar8 != (int *)0x0) {
                    LOAcquire();
                    iVar4 = *piVar8;
                    *piVar8 = iVar4 + -1;
                    LORelease();
                    if (iVar4 == 1) {
                      __ZN10QArrayData10deallocateEPS_xx(puVar14[6],2,8);
                    }
                  }
                  piVar8 = (int *)*puVar14;
                  if (piVar8 != (int *)0x0) {
                    LOAcquire();
                    iVar4 = *piVar8;
                    *piVar8 = iVar4 + -1;
                    LORelease();
                    if (iVar4 == 1) {
                      __ZN10QArrayData10deallocateEPS_xx(*puVar14,2,8);
                    }
                  }
                  puVar14 = puVar14 + 0xb;
                  lVar5 = lVar5 + -0x58;
                } while (lVar5 != 0);
              }
              __ZN10QArrayData10deallocateEPS_xx(local_180,0x58,8);
            }
          }
          piVar8 = (int *)CONCAT44(uStack_19c,uStack_1a0);
          if (piVar8 != (int *)0x0) {
            LOAcquire();
            iVar4 = *piVar8;
            *piVar8 = iVar4 + -1;
            LORelease();
            if (iVar4 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(CONCAT44(uStack_19c,uStack_1a0),0x20,8);
            }
          }
          if (piStack_1c0 != (int *)0x0) {
            LOAcquire();
            iVar4 = *piStack_1c0;
            *piStack_1c0 = iVar4 + -1;
            LORelease();
            if (iVar4 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(piStack_1c0,2,8);
            }
          }
          FUN_10009f554(&local_3a0);
          piVar8 = local_458;
          if ((local_458 != (int *)0x0) && (*local_458 != -1)) {
            LOAcquire();
            iVar4 = *local_458;
            *local_458 = iVar4 + -1;
            LORelease();
            if ((iVar4 == 1) && (local_458 != (int *)0x0)) {
              lVar5 = *(long *)(local_458 + 8);
              if (lVar5 != 0) {
                lVar12 = lVar5 + -0x10;
                if (*(long *)(lVar5 + -8) != 0) {
                  lVar5 = *(long *)(lVar5 + -8) * 0x90;
                  do {
                    if (*(long *)(lVar12 + lVar5) != 0) {
                      __ZdaPv();
                      *(undefined8 *)(lVar12 + lVar5) = 0;
                    }
                    lVar5 = lVar5 + -0x90;
                  } while (lVar5 != 0);
                }
                __ZdaPv(lVar12);
              }
              __ZdlPv(piVar8);
            }
          }
          if (local_450 != (int *)0x0) {
            LOAcquire();
            iVar4 = *local_450;
            *local_450 = iVar4 + -1;
            LORelease();
            if (iVar4 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_450,2,8);
            }
          }
        }
        __ZN2dj5audio11BassSample35closeEb(param_1,param_4);
        if ((uint)param_4 == 0) {
          if (*(int *)(param_1 + 0xec) == 0) {
            *(undefined4 *)(param_1 + 0x100) = *(undefined4 *)(param_1 + 0xd0);
          }
          puVar14 = (undefined8 *)(param_1 + 0xb8);
          piVar8 = (int *)*puVar14;
          *(int *)(param_1 + 0xd0) = param_3;
          if ((piVar8 == (int *)0x0) || (1 < *piVar8)) {
            FUN_100015064(puVar14,0,0,0);
            piVar8 = (int *)*puVar14;
            if (piVar8 != (int *)0x0) goto LAB_100159d14;
LAB_100159d20:
            FUN_100015064(puVar14,0,0,0);
          }
          else {
LAB_100159d14:
            if (1 < *piVar8) goto LAB_100159d20;
          }
          lVar5 = *(long *)(param_1 + 0xc0) + (long)param_3 * 0x18;
        }
        else {
          lVar5 = param_1 + 0x20;
        }
        __ZN7QStringaSERKS_(lVar5,param_2);
        lVar5 = param_1 + 0x1f8 + (long)*(int *)(param_1 + 0xd0) * 600;
        if ((*(byte *)(lVar5 + 0x250) & 1) == 0) {
          __ZN7QStringaSERKS_(lVar5 + 8,param_2);
          uVar7 = __ZN2dj5dbase17HPlaylistDatabase11getInstanceEv();
          uStack_6c8 = param_2[1];
          local_6d0 = (int *)*param_2;
          local_6c0 = param_2[2];
          uVar9 = 0;
          if (local_6d0 != (int *)0x0) {
            LOAcquire();
            iVar4 = *local_6d0;
            *local_6d0 = iVar4 + 1;
            uVar9 = CONCAT44((int)((ulong)local_6d0 >> 0x20),iVar4);
            LORelease();
          }
          local_6d8 = (int *)0x0;
          piVar8 = (int *)__Znwm(uVar9,0x28);
          *piVar8 = 1;
          piVar8[4] = 0;
          piVar8[5] = 0;
          piVar8[2] = 0;
          piVar8[3] = 0;
          piVar8[8] = 0;
          piVar8[9] = 0;
          piVar8[6] = 0;
          piVar8[7] = 0;
          piVar8[4] = 0x10;
          piVar8[5] = 0;
          puVar14 = (undefined8 *)__Znam(0xa0);
          puVar14[1] = 1;
          *puVar14 = 0x90;
          puVar14[0x12] = 0;
          *(undefined2 *)(puVar14 + 0x13) = 0;
          puVar14[5] = 0xffffffffffffffff;
          puVar14[4] = 0xffffffffffffffff;
          puVar14[7] = 0xffffffffffffffff;
          puVar14[6] = 0xffffffffffffffff;
          puVar14[9] = 0xffffffffffffffff;
          puVar14[8] = 0xffffffffffffffff;
          puVar14[0xb] = 0xffffffffffffffff;
          puVar14[10] = 0xffffffffffffffff;
          puVar14[0xd] = 0xffffffffffffffff;
          puVar14[0xc] = 0xffffffffffffffff;
          puVar14[0xf] = 0xffffffffffffffff;
          puVar14[0xe] = 0xffffffffffffffff;
          puVar14[0x11] = 0xffffffffffffffff;
          puVar14[0x10] = 0xffffffffffffffff;
          puVar14[3] = 0xffffffffffffffff;
          puVar14[2] = 0xffffffffffffffff;
          *(undefined8 **)(piVar8 + 8) = puVar14 + 2;
          uVar9 = __ZN9QHashSeed10globalSeedEv();
          *(undefined8 *)(piVar8 + 6) = uVar9;
          local_3a0 = 0;
          local_6d8 = piVar8;
          FUN_1000a48dc(&local_6d8,&local_3a0,&local_720);
          local_3a0 = 1;
          FUN_1000a48dc(&local_6d8,&local_3a0,&local_720);
          local_3a0 = 2;
          FUN_1000a48dc(&local_6d8,&local_3a0,&local_720);
          local_3a0 = 3;
          FUN_1000a48dc(&local_6d8,&local_3a0,&local_720);
          local_3a0 = 4;
          FUN_1000a48dc(&local_6d8,&local_3a0,&local_720);
          local_3a0 = 5;
          FUN_1000a48dc(&local_6d8,&local_3a0,&local_720);
          __ZN2dj5dbase17HPlaylistDatabase12GetMediaInfoE7QStringbiNS_17enAnalyzePriorityE4QSetINS_11AnalyzeTypeEE
                    (auStack_6b0,uVar7,&local_6d0,1,0,1,&local_6d8);
          if (local_490 != (int *)0x0) {
            LOAcquire();
            iVar4 = *local_490;
            *local_490 = iVar4 + -1;
            LORelease();
            if (iVar4 == 1) {
              if (local_480 != 0) {
                lVar5 = local_480 * 0x58;
                puVar14 = local_488;
                do {
                  piVar8 = (int *)puVar14[6];
                  if (piVar8 != (int *)0x0) {
                    LOAcquire();
                    iVar4 = *piVar8;
                    *piVar8 = iVar4 + -1;
                    LORelease();
                    if (iVar4 == 1) {
                      __ZN10QArrayData10deallocateEPS_xx(puVar14[6],2,8);
                    }
                  }
                  piVar8 = (int *)*puVar14;
                  if (piVar8 != (int *)0x0) {
                    LOAcquire();
                    iVar4 = *piVar8;
                    *piVar8 = iVar4 + -1;
                    LORelease();
                    if (iVar4 == 1) {
                      __ZN10QArrayData10deallocateEPS_xx(*puVar14,2,8);
                    }
                  }
                  puVar14 = puVar14 + 0xb;
                  lVar5 = lVar5 + -0x58;
                } while (lVar5 != 0);
              }
              __ZN10QArrayData10deallocateEPS_xx(local_490,0x58,8);
            }
          }
          if (local_4b0 != (int *)0x0) {
            LOAcquire();
            iVar4 = *local_4b0;
            *local_4b0 = iVar4 + -1;
            LORelease();
            if (iVar4 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_4b0,0x20,8);
            }
          }
          if (local_4d0 != (int *)0x0) {
            LOAcquire();
            iVar4 = *local_4d0;
            *local_4d0 = iVar4 + -1;
            LORelease();
            if (iVar4 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_4d0,2,8);
            }
          }
          FUN_10009f554(auStack_6b0);
          piVar8 = local_6d8;
          if ((local_6d8 != (int *)0x0) && (*local_6d8 != -1)) {
            LOAcquire();
            iVar4 = *local_6d8;
            *local_6d8 = iVar4 + -1;
            LORelease();
            if ((iVar4 == 1) && (local_6d8 != (int *)0x0)) {
              lVar5 = *(long *)(local_6d8 + 8);
              if (lVar5 != 0) {
                lVar12 = lVar5 + -0x10;
                if (*(long *)(lVar5 + -8) != 0) {
                  lVar5 = *(long *)(lVar5 + -8) * 0x90;
                  do {
                    if (*(long *)(lVar12 + lVar5) != 0) {
                      __ZdaPv();
                      *(undefined8 *)(lVar12 + lVar5) = 0;
                    }
                    lVar5 = lVar5 + -0x90;
                  } while (lVar5 != 0);
                }
                __ZdaPv(lVar12);
              }
              __ZdlPv(piVar8);
            }
          }
          if (local_6d0 != (int *)0x0) {
            LOAcquire();
            iVar4 = *local_6d0;
            *local_6d0 = iVar4 + -1;
            LORelease();
            if (iVar4 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_6d0,2,8);
            }
          }
        }
        uStack_6e8 = param_2[1];
        local_6f0 = (int *)*param_2;
        local_6e0 = param_2[2];
        uVar9 = 0;
        if (local_6f0 != (int *)0x0) {
          LOAcquire();
          iVar4 = *local_6f0;
          *local_6f0 = iVar4 + 1;
          uVar9 = CONCAT44((int)((ulong)local_6f0 >> 0x20),iVar4);
          LORelease();
        }
        __ZN2dj5audio11BassSample310updateNameE7QString(uVar9,param_1,&local_6f0);
        if (local_6f0 != (int *)0x0) {
          LOAcquire();
          iVar4 = *local_6f0;
          *local_6f0 = iVar4 + -1;
          LORelease();
          if (iVar4 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_6f0,2,8);
          }
        }
        _BASS_SetDevice(0);
        uVar9 = _BASS_Mixer_StreamCreate(*(undefined4 *)(param_1 + 0x1dc),2,0x200110);
        _BASS_Mixer_StreamAddChannel(uVar9,uVar13,0xc00000);
        _BASS_ChannelGetInfo(uVar9,&local_3a0);
        while (piVar8 = (int *)(param_1 + 0xec), *piVar8 != 0) {
          if (*piVar8 == 1) {
            *piVar8 = 3;
            goto LAB_10015a108;
          }
          __ZN7QThread6msleepEm(1);
        }
        *piVar8 = 3;
LAB_10015a108:
        if (*(long *)(param_1 + 0xf8) != 0) {
          __ZdlPv();
          *(undefined8 *)(param_1 + 0xf8) = 0;
        }
        dVar17 = (double)_BASS_ChannelBytes2Seconds(uVar13,uVar6);
        uVar15 = (uint)((dVar17 + 1.0) * (double)(long)*(int *)(param_1 + 0x1dc) * 4.0 *
                       (double)iStack_39c);
        *(uint *)(param_1 + 0xf0) = uVar15;
        uVar7 = __Znam(uVar15);
        uVar6 = 0;
        *(undefined8 *)(param_1 + 0xf8) = uVar7;
        do {
          uVar16 = (uint)uVar6;
          iVar4 = _BASS_ChannelGetData(uVar9,*(long *)(param_1 + 0xf8) + uVar6,uVar15 - uVar16);
          if (iVar4 == 0) break;
          uVar15 = *(uint *)(param_1 + 0xf0);
          uVar6 = (ulong)(iVar4 + uVar16);
        } while (uVar16 < uVar15);
        *(uint *)(param_1 + 0xf0) = uVar16;
        _BASS_StreamFree(uVar13);
        _BASS_StreamFree(uVar9);
        if (((*(int *)(param_1 + 0xe8) == 0) || ((param_5 & 1) != 0)) ||
           ((*(byte *)(param_1 + 0xb4) & 1) == 0)) {
          *(undefined4 *)(param_1 + 0xe8) = *(undefined4 *)(param_1 + 0xf0);
          *(undefined8 *)(param_1 + 0xe0) = *(undefined8 *)(param_1 + 0xf8);
          *(undefined4 *)(param_1 + 0xf0) = 0;
          *(undefined8 *)(param_1 + 0xf8) = 0;
          __ZN2dj5audio11BassSample318compute_target_bpmEv(param_1);
          iVar4 = 0;
          *(undefined4 *)(param_1 + 0x100) = 0xffffffff;
        }
        else {
          iVar4 = 1;
        }
        if (*(int *)(param_1 + 0xec) == 3) {
          *(int *)(param_1 + 0xec) = iVar4;
        }
        if ((param_5 & 1) == 0) {
          iVar4 = *(int *)(param_1 + 0xb0);
          iVar3 = *(int *)(param_1 + 0x118);
          __ZN8QVariantC1ERK7QString(auStack_e8,param_2);
          __ZN2dj5audio11BassSample323sample_property_changedENS_9AUDIOEnumEi8QVariant
                    (param_1,8,iVar3 + iVar4 * 1000,auStack_e8);
          __ZN8QVariantD1Ev(auStack_e8);
          local_710 = (int *)0x0;
          uStack_708 = 0;
          local_700 = 0;
          uStack_718 = uStack_718 & 0xffffffffffffff00;
          puVar14 = (undefined8 *)(param_1 + 0xb8);
          piVar8 = (int *)*puVar14;
          iVar4 = *(int *)(param_1 + 0xd0);
          local_720 = piVar11;
          if ((piVar8 == (int *)0x0) || (1 < *piVar8)) {
            FUN_100015064(puVar14,0,0,0);
            piVar8 = (int *)*puVar14;
            if (piVar8 != (int *)0x0) goto LAB_10015a278;
LAB_10015a284:
            FUN_100015064(puVar14,0,0,0);
          }
          else {
LAB_10015a278:
            if (1 < *piVar8) goto LAB_10015a284;
          }
          __ZN7QStringaSERKS_(&local_710,*(long *)(param_1 + 0xc0) + (long)iVar4 * 0x18);
          iVar4 = *(int *)(param_1 + 0xb0);
          iVar3 = *(int *)(param_1 + 0x118);
          __ZN8QVariantC1E9QMetaTypePKv
                    (auStack_108,
                     PTR___ZN9QtPrivate25QMetaTypeInterfaceWrapperIN2dj11AUDIOLengthEE8metaTypeE_10172d270
                     ,&local_720);
          __ZN2dj5audio11BassSample323sample_property_changedENS_9AUDIOEnumEi8QVariant
                    (param_1,1,iVar3 + iVar4 * 1000,auStack_108);
          __ZN8QVariantD1Ev(auStack_108);
          if (local_710 != (int *)0x0) {
            LOAcquire();
            iVar4 = *local_710;
            *local_710 = iVar4 + -1;
            LORelease();
            if (iVar4 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_710,2,8);
            }
          }
        }
        uVar13 = 1;
      }
      if (local_3c0 != (int *)0x0) {
        LOAcquire();
        iVar4 = *local_3c0;
        *local_3c0 = iVar4 + -1;
        LORelease();
        if (iVar4 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_3c0,2,8);
        }
      }
      __ZN9QFileInfoD1Ev(auStack_3a8);
      goto LAB_100159a40;
    }
  }
LAB_100159a3c:
  uVar13 = 0;
LAB_100159a40:
  FUN_10009fa10(auStack_128);
  if (*(long *)PTR____stack_chk_guard_10172c568 != local_88) {
                    /* WARNING: Subroutine does not return */
    ___stack_chk_fail();
  }
  return uVar13;
}

