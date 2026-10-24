
void __ZN2dj5audio10BassStream11saveSamplesENS_19SamplePackSave_enumE(long param_1,int param_2)

{
  undefined4 uVar1;
  int iVar2;
  int iVar3;
  long lVar4;
  undefined8 uVar5;
  undefined8 uVar6;
  int *piVar7;
  undefined8 *puVar8;
  long lVar9;
  int *piVar10;
  long lVar11;
  int *piVar12;
  long lVar13;
  long lVar14;
  int *local_690;
  undefined8 uStack_688;
  undefined8 local_680;
  int *local_670;
  int *piStack_668;
  long local_660;
  int *local_650 [3];
  int *local_638 [3];
  int *local_620;
  undefined8 uStack_618;
  undefined8 local_610;
  int *local_600;
  undefined8 uStack_5f8;
  undefined8 local_5f0;
  int *local_5e8 [3];
  int *local_5d0;
  undefined8 uStack_5c8;
  undefined8 local_5c0;
  int *local_5b0;
  undefined8 uStack_5a8;
  undefined8 local_5a0;
  int *local_590;
  undefined8 uStack_588;
  undefined8 local_580;
  int *local_570;
  int *piStack_568;
  int *local_560;
  undefined8 uStack_558;
  undefined8 local_550;
  undefined8 uStack_548;
  undefined8 local_540;
  undefined8 uStack_538;
  undefined8 uStack_530;
  undefined8 uStack_528;
  undefined8 local_520;
  undefined8 uStack_518;
  undefined8 uStack_510;
  undefined8 uStack_508;
  long local_500 [6];
  int *local_4d0;
  undefined8 uStack_4c8;
  undefined8 local_4c0;
  int *piStack_4b8;
  undefined8 uStack_4b0;
  undefined8 local_4a8;
  undefined4 local_4a0;
  float local_49c;
  undefined4 local_498;
  int *local_398;
  int *local_390;
  undefined8 uStack_388;
  undefined8 local_380;
  int *local_370;
  int *piStack_368;
  long local_360;
  undefined8 uStack_358;
  undefined8 uStack_350;
  undefined8 uStack_348;
  undefined8 local_340;
  undefined8 uStack_338;
  undefined8 uStack_330;
  undefined8 uStack_328;
  undefined8 local_320;
  undefined8 uStack_318;
  undefined8 uStack_310;
  undefined8 uStack_308;
  undefined8 local_300;
  undefined8 uStack_2f8;
  undefined8 uStack_2f0;
  undefined8 uStack_2e8;
  undefined8 local_2e0;
  undefined8 uStack_2d8;
  undefined8 uStack_2d0;
  undefined8 uStack_2c8;
  undefined8 local_2c0;
  undefined8 uStack_2b8;
  undefined8 local_2b0;
  undefined8 uStack_2a8;
  undefined8 local_2a0;
  undefined8 uStack_298;
  undefined8 local_290;
  undefined8 uStack_288;
  undefined8 local_280;
  undefined8 uStack_278;
  undefined8 local_270;
  undefined4 uStack_268;
  undefined4 uStack_264;
  undefined4 uStack_260;
  undefined4 uStack_25c;
  undefined4 uStack_258;
  undefined4 uStack_254;
  undefined8 local_250;
  undefined8 local_248;
  undefined4 local_240;
  undefined1 auStack_238 [24];
  undefined8 local_220;
  undefined8 local_218;
  ulong local_210;
  undefined4 local_208;
  undefined8 local_204;
  undefined8 local_1f8;
  undefined8 local_1f0;
  undefined8 local_1e8;
  undefined1 local_1e0;
  undefined8 local_1d8;
  undefined8 uStack_1d0;
  undefined8 uStack_1c8;
  undefined4 uStack_1c0;
  undefined4 local_1bc;
  undefined4 uStack_1b8;
  undefined8 uStack_1b4;
  undefined8 local_1ac;
  undefined4 local_1a0;
  int *local_198;
  int *piStack_190;
  long local_188;
  int *local_180;
  undefined8 local_178;
  int *piStack_170;
  float local_168;
  undefined1 local_164;
  int *local_150;
  undefined8 *local_148;
  long local_140;
  int *local_110;
  undefined8 uStack_108;
  undefined8 local_100;
  int *local_f0;
  undefined8 uStack_e8;
  undefined8 local_e0;
  int *local_d0;
  int *piStack_c8;
  long local_c0;
  int *local_b0 [3];
  undefined1 auStack_98 [32];
  long local_78;
  
  local_78 = *(long *)PTR____stack_chk_guard_10172c568;
  __ZN2dj18get_user_directoryEv(&local_f0);
  FUN_100014ba4(&local_d0,&local_f0,"/song");
  __ZN7QString6numberEii(&local_110,*(undefined4 *)(param_1 + 0x7c),10);
  uStack_558 = piStack_c8;
  local_560 = local_d0;
  local_550 = local_c0;
  iVar2 = 0;
  if (local_d0 != (int *)0x0) {
    LOAcquire();
    iVar2 = *local_d0;
    *local_d0 = iVar2 + 1;
    LORelease();
  }
  __ZN7QString6appendERKS_(iVar2,&local_560,&local_110);
  FUN_100014ba4(local_b0,&local_560,".xml");
  __ZN2dj21toUniversalSeparatorsE7QString(&local_370,local_b0);
  if (local_b0[0] != (int *)0x0) {
    LOAcquire();
    iVar2 = *local_b0[0];
    *local_b0[0] = iVar2 + -1;
    LORelease();
    if (iVar2 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_b0[0],2,8);
    }
  }
  if (local_560 != (int *)0x0) {
    LOAcquire();
    iVar2 = *local_560;
    *local_560 = iVar2 + -1;
    LORelease();
    if (iVar2 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_560,2,8);
    }
  }
  if (local_110 != (int *)0x0) {
    LOAcquire();
    iVar2 = *local_110;
    *local_110 = iVar2 + -1;
    LORelease();
    if (iVar2 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_110,2,8);
    }
  }
  if (local_d0 != (int *)0x0) {
    LOAcquire();
    iVar2 = *local_d0;
    *local_d0 = iVar2 + -1;
    LORelease();
    if (iVar2 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_d0,2,8);
    }
  }
  if (local_f0 != (int *)0x0) {
    LOAcquire();
    iVar2 = *local_f0;
    *local_f0 = iVar2 + -1;
    LORelease();
    if (iVar2 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_f0,2,8);
    }
  }
  __ZN5QFileC1ERK7QString(&local_560,&local_370);
  __ZN5QFile6removeEv(&local_560);
  __ZN5QFileD1Ev(&local_560);
  if (local_370 != (int *)0x0) {
    LOAcquire();
    iVar2 = *local_370;
    *local_370 = iVar2 + -1;
    LORelease();
    if (iVar2 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_370,2,8);
    }
  }
  lVar14 = 0;
  local_d0 = (int *)0x0;
  piStack_c8 = (int *)0x0;
  local_c0 = 0;
  do {
    piStack_368 = (int *)0x0;
    local_370 = (int *)0x0;
    local_360 = 0;
    FUN_1000a6f00(&local_d0,local_c0,&local_370);
    if ((local_d0 == (int *)0x0) || (1 < *local_d0)) {
      FUN_1000a71b8(&local_d0,0,0,0);
    }
    if (local_370 != (int *)0x0) {
      LOAcquire();
      iVar2 = *local_370;
      *local_370 = iVar2 + -1;
      LORelease();
      if (iVar2 == 1) {
        if (local_360 != 0) {
          lVar11 = local_360 * 0xd0;
          piVar7 = piStack_368;
          do {
            lVar4 = FUN_1000a1558(piVar7);
            piVar7 = (int *)(lVar4 + 0xd0);
            lVar11 = lVar11 + -0xd0;
          } while (lVar11 != 0);
        }
        __ZN10QArrayData10deallocateEPS_xx(local_370,0xd0,8);
      }
    }
    lVar11 = *(long *)(param_1 + 0x188810 + lVar14 * 8);
    if ((lVar11 != 0) && (0 < *(long *)(lVar11 + 200))) {
      lVar4 = 0;
      do {
        piStack_4b8 = (int *)0x0;
        local_4c0 = 0;
        local_4a8 = 0;
        uStack_4b0 = 0;
        local_500[5] = 0;
        local_500[4] = 0;
        uStack_4c8 = 0;
        local_4d0 = (int *)0x0;
        local_500[1] = 0;
        local_500[0] = 0;
        local_500[3] = 0;
        local_500[2] = 0;
        uStack_518 = 0;
        local_520 = 0;
        uStack_508 = 0;
        uStack_510 = 0;
        uStack_538 = 0;
        local_540 = 0;
        uStack_528 = 0;
        uStack_530 = 0;
        uStack_558 = 0;
        local_560 = (int *)0x0;
        uStack_548 = 0;
        local_550 = 0;
        uVar5 = __ZN2dj5dbase17HPlaylistDatabase11getInstanceEv();
        piVar7 = *(int **)(lVar11 + 0xb8);
        if ((piVar7 == (int *)0x0) || (1 < *piVar7)) {
          FUN_100015064(lVar11 + 0xb8,0,0,0);
          piVar7 = *(int **)(lVar11 + 0xb8);
          if (piVar7 != (int *)0x0) goto LAB_10008b104;
LAB_10008b110:
          FUN_100015064(lVar11 + 0xb8,0,0,0);
        }
        else {
LAB_10008b104:
          if (1 < *piVar7) goto LAB_10008b110;
        }
        puVar8 = (undefined8 *)(*(long *)(lVar11 + 0xc0) + lVar4 * 0x18);
        uStack_388 = puVar8[1];
        local_390 = (int *)*puVar8;
        local_380 = puVar8[2];
        uVar6 = 0;
        if (local_390 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_390;
          *local_390 = iVar2 + 1;
          uVar6 = CONCAT44((int)((ulong)local_390 >> 0x20),iVar2);
          LORelease();
        }
        local_398 = (int *)0x0;
        piVar7 = (int *)__Znwm(uVar6,0x28);
        *piVar7 = 1;
        piVar7[4] = 0;
        piVar7[5] = 0;
        piVar7[2] = 0;
        piVar7[3] = 0;
        piVar7[8] = 0;
        piVar7[9] = 0;
        piVar7[6] = 0;
        piVar7[7] = 0;
        piVar7[4] = 0x10;
        piVar7[5] = 0;
        puVar8 = (undefined8 *)__Znam(0xa0);
        puVar8[1] = 1;
        *puVar8 = 0x90;
        puVar8[0x12] = 0;
        *(undefined2 *)(puVar8 + 0x13) = 0;
        puVar8[5] = 0xffffffffffffffff;
        puVar8[4] = 0xffffffffffffffff;
        puVar8[7] = 0xffffffffffffffff;
        puVar8[6] = 0xffffffffffffffff;
        puVar8[9] = 0xffffffffffffffff;
        puVar8[8] = 0xffffffffffffffff;
        puVar8[0xb] = 0xffffffffffffffff;
        puVar8[10] = 0xffffffffffffffff;
        puVar8[0xd] = 0xffffffffffffffff;
        puVar8[0xc] = 0xffffffffffffffff;
        puVar8[0xf] = 0xffffffffffffffff;
        puVar8[0xe] = 0xffffffffffffffff;
        puVar8[0x11] = 0xffffffffffffffff;
        puVar8[0x10] = 0xffffffffffffffff;
        puVar8[3] = 0xffffffffffffffff;
        puVar8[2] = 0xffffffffffffffff;
        *(undefined8 **)(piVar7 + 8) = puVar8 + 2;
        uVar6 = __ZN9QHashSeed10globalSeedEv();
        *(undefined8 *)(piVar7 + 6) = uVar6;
        local_f0 = (int *)((ulong)local_f0 & 0xffffffff00000000);
        local_398 = piVar7;
        FUN_1000a48dc(&local_398,&local_f0,&local_110);
        local_f0._0_4_ = 1;
        FUN_1000a48dc(&local_398,&local_f0,&local_110);
        local_f0._0_4_ = 2;
        FUN_1000a48dc(&local_398,&local_f0,&local_110);
        local_f0._0_4_ = 3;
        FUN_1000a48dc(&local_398,&local_f0,&local_110);
        local_f0._0_4_ = 4;
        FUN_1000a48dc(&local_398,&local_f0,&local_110);
        local_f0 = (int *)CONCAT44(local_f0._4_4_,5);
        FUN_1000a48dc(&local_398,&local_f0,&local_110);
        __ZN2dj5dbase17HPlaylistDatabase12GetMediaInfoE7QStringbiNS_17enAnalyzePriorityE4QSetINS_11AnalyzeTypeEE
                  (&local_370,uVar5,&local_390,0,0xffffffff,0,&local_398);
        piVar7 = local_398;
        if ((local_398 != (int *)0x0) && (*local_398 != -1)) {
          LOAcquire();
          iVar2 = *local_398;
          *local_398 = iVar2 + -1;
          LORelease();
          if ((iVar2 == 1) && (local_398 != (int *)0x0)) {
            lVar9 = *(long *)(local_398 + 8);
            if (lVar9 != 0) {
              lVar13 = lVar9 + -0x10;
              if (*(long *)(lVar9 + -8) != 0) {
                lVar9 = *(long *)(lVar9 + -8) * 0x90;
                do {
                  if (*(long *)(lVar13 + lVar9) != 0) {
                    __ZdaPv();
                    *(undefined8 *)(lVar13 + lVar9) = 0;
                  }
                  lVar9 = lVar9 + -0x90;
                } while (lVar9 != 0);
              }
              __ZdaPv(lVar13);
            }
            __ZdlPv(piVar7);
          }
        }
        if (local_390 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_390;
          *local_390 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_390,2,8);
          }
        }
        __ZN7QStringaSERKS_(&local_560,&local_320);
        local_4a0 = uStack_260;
        __ZN7QStringaSERKS_(local_500 + 3,&piStack_368);
        local_498 = __ZN2dj5audio11BassSample313getSampleTypeEi(lVar11,lVar4);
        __ZN7QStringaSERKS_(&uStack_548,&uStack_338);
        __ZN7QStringaSERKS_(&uStack_530,&uStack_308);
        __ZN7QStringaSERKS_(&uStack_518,&uStack_2f0);
        __ZN7QStringaSERKS_(local_500,&uStack_2d8);
        local_49c = (float)(double)CONCAT44(uStack_254,uStack_258);
        __ZN2dj5audio11BassSample314getSampleColorEi(&local_f0,lVar11,lVar4);
        uVar6 = local_4c0;
        uVar5 = uStack_4c8;
        piVar7 = local_4d0;
        uStack_4c8 = uStack_e8;
        local_4d0 = local_f0;
        uStack_e8 = uVar5;
        local_f0 = piVar7;
        local_4c0 = local_e0;
        local_e0 = uVar6;
        if (piVar7 != (int *)0x0) {
          LOAcquire();
          iVar2 = *piVar7;
          *piVar7 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(piVar7,2,8);
          }
        }
        __ZN7QString6numberEii(&local_f0,local_210 & 0xffffffff,10);
        uVar6 = local_4a8;
        uVar5 = uStack_4b0;
        piVar7 = piStack_4b8;
        uStack_4b0 = uStack_e8;
        piStack_4b8 = local_f0;
        uStack_e8 = uVar5;
        local_f0 = piVar7;
        local_4a8 = local_e0;
        local_e0 = uVar6;
        if (piVar7 != (int *)0x0) {
          LOAcquire();
          iVar2 = *piVar7;
          *piVar7 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(piVar7,2,8);
          }
        }
        if ((((local_d0 == (int *)0x0) || (1 < *local_d0)) &&
            (FUN_1000a71b8(&local_d0,0,0,0), local_d0 == (int *)0x0)) || (1 < *local_d0)) {
          FUN_1000a71b8(&local_d0,0,0,0);
        }
        piVar7 = piStack_c8 + lVar14 * 6;
        FUN_1000a7588(piVar7,*(undefined8 *)(piVar7 + 4),&local_560);
        if ((*(int **)piVar7 == (int *)0x0) || (1 < **(int **)piVar7)) {
          FUN_1000a8074(piVar7,0,0,0);
        }
        if (local_150 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_150;
          *local_150 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            if (local_140 != 0) {
              lVar9 = local_140 * 0x58;
              puVar8 = local_148;
              do {
                piVar7 = (int *)puVar8[6];
                if (piVar7 != (int *)0x0) {
                  LOAcquire();
                  iVar2 = *piVar7;
                  *piVar7 = iVar2 + -1;
                  LORelease();
                  if (iVar2 == 1) {
                    __ZN10QArrayData10deallocateEPS_xx(puVar8[6],2,8);
                  }
                }
                piVar7 = (int *)*puVar8;
                if (piVar7 != (int *)0x0) {
                  LOAcquire();
                  iVar2 = *piVar7;
                  *piVar7 = iVar2 + -1;
                  LORelease();
                  if (iVar2 == 1) {
                    __ZN10QArrayData10deallocateEPS_xx(*puVar8,2,8);
                  }
                }
                puVar8 = puVar8 + 0xb;
                lVar9 = lVar9 + -0x58;
              } while (lVar9 != 0);
            }
            __ZN10QArrayData10deallocateEPS_xx(local_150,0x58,8);
          }
        }
        if (piStack_170 != (int *)0x0) {
          LOAcquire();
          iVar2 = *piStack_170;
          *piStack_170 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(piStack_170,0x20,8);
          }
        }
        if (piStack_190 != (int *)0x0) {
          LOAcquire();
          iVar2 = *piStack_190;
          *piStack_190 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(piStack_190,2,8);
          }
        }
        FUN_10009f554(&local_370);
        FUN_1000a1558(&local_560);
        lVar4 = lVar4 + 1;
      } while (lVar4 < *(long *)(lVar11 + 200));
    }
    lVar14 = lVar14 + 1;
    if (lVar14 == 4) {
      FUN_10009fac8(&local_560,param_1 + 0x188b88);
      local_570 = (int *)0x0;
      piStack_568 = (int *)0x0;
      uStack_588 = *(undefined8 *)(param_1 + 0x188b98);
      local_590 = *(int **)(param_1 + 0x188b90);
      local_580 = *(undefined8 *)(param_1 + 0x188ba0);
      if (local_590 != (int *)0x0) {
        LOAcquire();
        *local_590 = *local_590 + 1;
        LORelease();
      }
      __ZN2dj21toUniversalSeparatorsE7QString(&local_f0,&local_590);
      if (local_590 != (int *)0x0) {
        LOAcquire();
        iVar2 = *local_590;
        *local_590 = iVar2 + -1;
        LORelease();
        if (iVar2 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_590,2,8);
        }
      }
      local_110 = (int *)0x0;
      uStack_108 = 0;
      local_100 = 0;
      uVar5 = __ZN2dj5dbase17HPlaylistDatabase11getInstanceEv();
      uStack_5a8 = uStack_e8;
      local_5b0 = local_f0;
      local_5a0 = local_e0;
      iVar2 = 0;
      if (local_f0 != (int *)0x0) {
        LOAcquire();
        iVar2 = *local_f0;
        *local_f0 = iVar2 + 1;
        LORelease();
      }
      iVar2 = __ZN2dj5dbase17HPlaylistDatabase19m_allTracksContainsE7QString(iVar2,uVar5,&local_5b0)
      ;
      if (local_5b0 != (int *)0x0) {
        LOAcquire();
        iVar3 = *local_5b0;
        *local_5b0 = iVar3 + -1;
        LORelease();
        if (iVar3 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_5b0,2,8);
        }
      }
      if (iVar2 != 0) {
        uVar5 = __ZN2dj5dbase17HPlaylistDatabase11getInstanceEv();
        uStack_5c8 = uStack_e8;
        local_5d0 = local_f0;
        local_5c0 = local_e0;
        if (local_f0 != (int *)0x0) {
          LOAcquire();
          *local_f0 = *local_f0 + 1;
          LORelease();
        }
        __ZN2dj5dbase17HPlaylistDatabase16m_allTracksValueE7QString(&local_370,uVar5,&local_5d0);
        piVar12 = piStack_368;
        local_570 = local_370;
        piVar7 = piStack_568;
        piStack_368 = (int *)0x0;
        local_370 = (int *)0x0;
        piStack_568 = piVar12;
        if (piVar7 != (int *)0x0) {
          LOAcquire();
          iVar2 = piVar7[1];
          piVar7[1] = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            (**(code **)(piVar7 + 2))(piVar7);
          }
          LOAcquire();
          iVar2 = *piVar7;
          *piVar7 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZdlPv(piVar7);
          }
        }
        piVar7 = piStack_368;
        if (piStack_368 != (int *)0x0) {
          LOAcquire();
          iVar2 = piStack_368[1];
          piStack_368[1] = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            (**(code **)(piStack_368 + 2))(piStack_368);
          }
          LOAcquire();
          iVar2 = *piVar7;
          *piVar7 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZdlPv(piVar7);
          }
        }
        if (local_5d0 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_5d0;
          *local_5d0 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_5d0,2,8);
          }
        }
        __ZNK2dj5dbase5Track6getTagENS0_6ColumnE(&local_370,local_570,10);
        __ZN7QStringaSERKS_(&local_110,&local_370);
        if (local_370 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_370;
          *local_370 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_370,2,8);
          }
        }
      }
      if (param_2 == -1) {
        __ZN2dj18get_user_directoryEv(local_638);
        FUN_100014ba4(&local_620,local_638,"/samples");
        __ZN7QString6numberEii(local_650,*(undefined4 *)(param_1 + 0x7c),10);
        uStack_5f8 = uStack_618;
        local_600 = local_620;
        local_5f0 = local_610;
        iVar2 = 0;
        if (local_620 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_620;
          *local_620 = iVar2 + 1;
          LORelease();
        }
        __ZN7QString6appendERKS_(iVar2,&local_600,local_650);
        FUN_100014ba4(local_5e8,&local_600,".xml");
        __ZN2dj21toUniversalSeparatorsE7QString(&local_370,local_5e8);
        if (local_5e8[0] != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_5e8[0];
          *local_5e8[0] = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_5e8[0],2,8);
          }
        }
        if (local_600 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_600;
          *local_600 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_600,2,8);
          }
        }
        if (local_650[0] != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_650[0];
          *local_650[0] = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_650[0],2,8);
          }
        }
        if (local_620 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_620;
          *local_620 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_620,2,8);
          }
        }
        if (local_638[0] != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_638[0];
          *local_638[0] = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_638[0],2,8);
          }
        }
        if (local_500[0] == 0) {
          __ZN5QFileC1ERK7QString(&local_600,&local_370);
          __ZN5QFile6removeEv(&local_600);
          __ZN5QFileD1Ev(&local_600);
        }
        else {
          piStack_668 = piStack_368;
          local_670 = local_370;
          local_660 = local_360;
          if (local_370 != (int *)0x0) {
            LOAcquire();
            *local_370 = *local_370 + 1;
            LORelease();
          }
          uStack_688 = uStack_108;
          local_690 = local_110;
          local_680 = local_100;
          iVar2 = 0;
          if (local_110 != (int *)0x0) {
            LOAcquire();
            iVar2 = *local_110;
            *local_110 = iVar2 + 1;
            LORelease();
          }
          __ZN2dj22saveDJSSamplePackToXMLE7QStringPNS_14AudioMediaInfoEP5QListIS3_INS_10SampleInfoEEES0_fbNS_10SampleTypeE
                    (iVar2,(float)*(double *)(param_1 + 0x188710),&local_670,&local_560,&local_d0,
                     &local_690,*(undefined1 *)(param_1 + 0x188709),
                     *(undefined4 *)(param_1 + 0x188718));
          if (local_690 != (int *)0x0) {
            LOAcquire();
            iVar2 = *local_690;
            *local_690 = iVar2 + -1;
            LORelease();
            if (iVar2 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_690,2,8);
            }
          }
          if (local_670 != (int *)0x0) {
            LOAcquire();
            iVar2 = *local_670;
            *local_670 = iVar2 + -1;
            LORelease();
            if (iVar2 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_670,2,8);
            }
          }
        }
        if (local_370 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_370;
          *local_370 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_370,2,8);
          }
        }
      }
      else {
        piStack_368 = (int *)((ulong)piStack_368 & 0xffffffff00000000);
        uStack_25c = 0;
        uStack_258 = 0;
        uStack_260 = 0;
        uStack_358 = 0;
        local_360 = 0;
        uStack_348 = 0;
        uStack_350 = 0;
        uStack_338 = 0;
        local_340 = 0;
        uStack_328 = 0;
        uStack_330 = 0;
        uStack_318 = 0;
        local_320 = 0;
        uStack_308 = 0;
        uStack_310 = 0;
        uStack_2f8 = 0;
        local_300 = 0;
        uStack_2e8 = 0;
        uStack_2f0 = 0;
        uStack_2d8 = 0;
        local_2e0 = 0;
        uStack_2c8 = 0;
        uStack_2d0 = 0;
        uStack_2b8 = 0;
        local_2c0 = 0;
        uStack_2a8 = 0;
        local_2b0 = 0;
        uStack_298 = 0;
        local_2a0 = 0;
        uStack_288 = 0;
        local_290 = 0;
        uStack_278 = 0;
        local_280 = 0;
        uStack_268 = 0;
        uStack_264 = 0;
        local_270 = 0;
        local_248 = 0;
        local_250 = 0;
        local_240 = 0;
        __ZN6QImageC1Ev(auStack_238);
        local_218 = 0;
        local_220 = 0;
        local_210 = 0;
        local_208 = 0xffffffff;
        local_204 = 0;
        local_1e8 = 0;
        local_1f8 = 0;
        local_1f0 = 0;
        local_1e0 = 0;
        uStack_1d0 = 0;
        local_1d8 = 0;
        uStack_1c0 = 0;
        uStack_1c8 = 0;
        uStack_1b4 = 0;
        local_1bc = 0;
        uStack_1b8 = 0;
        local_1ac = 0xc61c3c00;
        piStack_190 = (int *)0x0;
        local_198 = (int *)0x0;
        local_180 = (int *)0x0;
        local_188 = 0;
        piStack_170 = (int *)0x0;
        local_178 = 0;
        local_1a0 = 0;
        local_168 = 1.0;
        local_164 = 1;
        local_370 = (int *)CONCAT44(local_370._4_4_,param_2);
        FUN_100094010(&piStack_368,&local_560);
        lVar14 = local_188;
        piVar7 = piStack_190;
        piVar12 = local_198;
        if (local_d0 != (int *)0x0) {
          LOAcquire();
          *local_d0 = *local_d0 + 1;
          LORelease();
        }
        piStack_190 = piStack_c8;
        local_198 = local_d0;
        local_188 = local_c0;
        if (piVar12 != (int *)0x0) {
          LOAcquire();
          iVar2 = *piVar12;
          *piVar12 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            if (lVar14 != 0) {
              puVar8 = (undefined8 *)((long)piVar7 + lVar14 * 3 * 8);
              do {
                piVar10 = *(int **)piVar7;
                if (piVar10 != (int *)0x0) {
                  LOAcquire();
                  iVar2 = *piVar10;
                  *piVar10 = iVar2 + -1;
                  LORelease();
                  if (iVar2 == 1) {
                    if (*(long *)((long)piVar7 + 0x10) != 0) {
                      lVar14 = *(long *)((long)piVar7 + 8);
                      lVar11 = *(long *)((long)piVar7 + 0x10) * 0xd0;
                      do {
                        lVar14 = FUN_1000a1558(lVar14);
                        lVar14 = lVar14 + 0xd0;
                        lVar11 = lVar11 + -0xd0;
                      } while (lVar11 != 0);
                    }
                    __ZN10QArrayData10deallocateEPS_xx(*(undefined8 *)piVar7,0xd0,8);
                  }
                }
                piVar7 = (int *)((long)piVar7 + 0x18);
              } while (piVar7 != (int *)puVar8);
            }
            __ZN10QArrayData10deallocateEPS_xx(piVar12,0x18,8);
          }
        }
        __ZN7QStringaSERKS_(&local_180,&local_110);
        local_168 = (float)*(double *)(param_1 + 0x188710);
        local_164 = *(undefined1 *)(param_1 + 0x188709);
        local_1a0 = *(undefined4 *)(param_1 + 0x188718);
        uVar1 = *(undefined4 *)(param_1 + 0x7c);
        __ZN8QVariantC1E9QMetaTypePKv
                  (auStack_98,
                   PTR___ZN9QtPrivate25QMetaTypeInterfaceWrapperIN2dj13AUDIOPackInfoEE8metaTypeE_10172d2b0
                   ,&local_370);
        __ZN2dj5audio10BassStream23stream_property_changedENS_9AUDIOEnumEi8QVariant
                  (param_1,0x87,uVar1,auStack_98);
        __ZN8QVariantD1Ev(auStack_98);
        if (local_180 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_180;
          *local_180 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_180,2,8);
          }
        }
        if (local_198 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_198;
          *local_198 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            if (local_188 != 0) {
              piVar12 = piStack_190 + local_188 * 6;
              piVar7 = piStack_190;
              do {
                piVar10 = *(int **)piVar7;
                if (piVar10 != (int *)0x0) {
                  LOAcquire();
                  iVar2 = *piVar10;
                  *piVar10 = iVar2 + -1;
                  LORelease();
                  if (iVar2 == 1) {
                    if (*(long *)(piVar7 + 4) != 0) {
                      lVar14 = *(long *)(piVar7 + 2);
                      lVar11 = *(long *)(piVar7 + 4) * 0xd0;
                      do {
                        lVar14 = FUN_1000a1558(lVar14);
                        lVar14 = lVar14 + 0xd0;
                        lVar11 = lVar11 + -0xd0;
                      } while (lVar11 != 0);
                    }
                    __ZN10QArrayData10deallocateEPS_xx(*(undefined8 *)piVar7,0xd0,8);
                  }
                }
                piVar7 = piVar7 + 6;
              } while (piVar7 != piVar12);
            }
            __ZN10QArrayData10deallocateEPS_xx(local_198,0x18,8);
          }
        }
        FUN_10009f554(&piStack_368);
      }
      if (local_110 != (int *)0x0) {
        LOAcquire();
        iVar2 = *local_110;
        *local_110 = iVar2 + -1;
        LORelease();
        if (iVar2 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_110,2,8);
        }
      }
      if (local_f0 != (int *)0x0) {
        LOAcquire();
        iVar2 = *local_f0;
        *local_f0 = iVar2 + -1;
        LORelease();
        if (iVar2 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_f0,2,8);
        }
      }
      piVar7 = piStack_568;
      if (piStack_568 != (int *)0x0) {
        LOAcquire();
        iVar2 = piStack_568[1];
        piStack_568[1] = iVar2 + -1;
        LORelease();
        if (iVar2 == 1) {
          (**(code **)(piStack_568 + 2))(piStack_568);
        }
        LOAcquire();
        iVar2 = *piVar7;
        *piVar7 = iVar2 + -1;
        LORelease();
        if (iVar2 == 1) {
          __ZdlPv(piVar7);
        }
      }
      FUN_10009f554(&local_560);
      if (local_d0 != (int *)0x0) {
        LOAcquire();
        iVar2 = *local_d0;
        *local_d0 = iVar2 + -1;
        LORelease();
        if (iVar2 == 1) {
          if (local_c0 != 0) {
            piVar12 = piStack_c8 + local_c0 * 6;
            piVar7 = piStack_c8;
            do {
              piVar10 = *(int **)piVar7;
              if (piVar10 != (int *)0x0) {
                LOAcquire();
                iVar2 = *piVar10;
                *piVar10 = iVar2 + -1;
                LORelease();
                if (iVar2 == 1) {
                  if (*(long *)(piVar7 + 4) != 0) {
                    lVar14 = *(long *)(piVar7 + 2);
                    lVar11 = *(long *)(piVar7 + 4) * 0xd0;
                    do {
                      lVar14 = FUN_1000a1558(lVar14);
                      lVar14 = lVar14 + 0xd0;
                      lVar11 = lVar11 + -0xd0;
                    } while (lVar11 != 0);
                  }
                  __ZN10QArrayData10deallocateEPS_xx(*(undefined8 *)piVar7,0xd0,8);
                }
              }
              piVar7 = piVar7 + 6;
            } while (piVar7 != piVar12);
          }
          __ZN10QArrayData10deallocateEPS_xx(local_d0,0x18,8);
        }
      }
      if (*(long *)PTR____stack_chk_guard_10172c568 != local_78) {
                    /* WARNING: Subroutine does not return */
        ___stack_chk_fail();
      }
      return;
    }
  } while( true );
}

