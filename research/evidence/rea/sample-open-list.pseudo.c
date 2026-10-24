
undefined8
__ZN2dj5audio11BassSample314openSampleListE5QListI7QStringE(long param_1,undefined8 *param_2)

{
  int *piVar1;
  uint uVar2;
  int iVar3;
  undefined1 uVar4;
  bool bVar5;
  int iVar6;
  undefined8 uVar7;
  int *piVar8;
  undefined8 *puVar9;
  long lVar10;
  undefined8 uVar11;
  long lVar12;
  long lVar13;
  int *local_318;
  int *local_310;
  undefined8 uStack_308;
  undefined8 local_300;
  int *local_2f0;
  undefined8 uStack_2e8;
  undefined8 local_2e0;
  undefined1 uStack_2d5;
  undefined4 local_2d4;
  undefined4 local_2d0 [2];
  undefined8 local_2c8;
  undefined8 uStack_2c0;
  undefined8 uStack_2b8;
  undefined8 uStack_2b0;
  undefined8 local_2a8;
  undefined8 uStack_2a0;
  undefined8 uStack_298;
  undefined8 uStack_290;
  undefined8 local_288;
  undefined8 uStack_280;
  undefined8 uStack_278;
  undefined8 uStack_270;
  undefined8 local_268;
  undefined8 uStack_260;
  undefined8 uStack_258;
  undefined8 uStack_250;
  undefined8 local_248;
  undefined8 uStack_240;
  undefined8 uStack_238;
  undefined8 uStack_230;
  undefined8 local_228;
  undefined8 uStack_220;
  undefined8 uStack_218;
  undefined8 uStack_210;
  undefined8 local_208;
  undefined8 uStack_200;
  undefined8 uStack_1f8;
  undefined8 uStack_1f0;
  undefined8 local_1e8;
  undefined8 uStack_1e0;
  undefined8 uStack_1d8;
  undefined4 uStack_1d0;
  undefined4 local_1cc;
  undefined4 uStack_1c8;
  undefined8 uStack_1c4;
  undefined8 local_1b8;
  undefined8 uStack_1b0;
  undefined4 local_1a8;
  undefined1 auStack_1a0 [24];
  undefined8 local_188;
  undefined8 uStack_180;
  undefined8 local_178;
  undefined4 local_170;
  undefined8 local_16c;
  undefined8 local_160;
  undefined8 uStack_158;
  undefined8 local_150;
  undefined1 local_148;
  undefined8 local_140;
  undefined8 uStack_138;
  undefined8 uStack_130;
  undefined4 uStack_128;
  undefined4 local_124;
  undefined4 uStack_120;
  undefined8 uStack_11c;
  undefined8 local_114;
  undefined8 local_108;
  undefined8 local_100;
  undefined8 local_f8;
  int *piStack_f0;
  undefined8 uStack_e8;
  undefined8 uStack_e0;
  undefined1 local_d8;
  undefined4 local_d4;
  int *piStack_d0;
  undefined8 uStack_c8;
  undefined8 local_c0;
  undefined4 local_b8;
  int *local_b0;
  undefined8 *local_a8;
  long local_a0;
  undefined1 local_98;
  undefined4 local_90;
  undefined4 uStack_8c;
  undefined8 uStack_88;
  uint local_80;
  undefined4 uStack_7c;
  long local_78;
  
  local_78 = *(long *)PTR____stack_chk_guard_10172c568;
  uVar2 = *(uint *)(param_1 + 0xd0);
  if ((int)uVar2 < 0) goto LAB_10015b7ac;
  uVar4 = *(undefined1 *)(param_1 + 0xbe9);
  *(undefined1 *)(param_1 + 0xbe9) = 0;
  if ((long)(ulong)uVar2 < (long)param_2[2]) {
    piVar8 = (int *)*param_2;
    if ((piVar8 == (int *)0x0) || (1 < *piVar8)) {
      FUN_100015064(param_2,0,0,0);
      piVar8 = (int *)*param_2;
      if (piVar8 != (int *)0x0) goto LAB_10015b6c4;
LAB_10015b6d0:
      FUN_100015064(param_2,0,0,0);
    }
    else {
LAB_10015b6c4:
      if (1 < *piVar8) goto LAB_10015b6d0;
    }
    puVar9 = (undefined8 *)(param_2[1] + (ulong)uVar2 * 0x18);
    uStack_2e8 = puVar9[1];
    local_2f0 = (int *)*puVar9;
    local_2e0 = puVar9[2];
    uVar11 = 0;
    if (local_2f0 != (int *)0x0) {
      LOAcquire();
      iVar6 = *local_2f0;
      *local_2f0 = iVar6 + 1;
      uVar11 = CONCAT44((int)((ulong)local_2f0 >> 0x20),iVar6);
      LORelease();
    }
    __ZN2dj5audio11BassSample34openE7QStringibb
              (uVar11,param_1,&local_2f0,*(undefined4 *)(param_1 + 0xd0),0,0);
    if (local_2f0 != (int *)0x0) {
      LOAcquire();
      iVar6 = *local_2f0;
      *local_2f0 = iVar6 + -1;
      LORelease();
      if (iVar6 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_2f0,2,8);
      }
    }
  }
  bVar5 = *(char *)(param_1 + 0xbe9) != '\x01';
  if (bVar5) {
    lVar10 = 0xb4;
  }
  else {
    *(undefined1 *)(param_1 + 0x11f) = 1;
    lVar10 = 0x11c;
  }
  *(bool *)(param_1 + lVar10) = !bVar5;
  iVar6 = *(int *)(param_1 + 0xb0);
  iVar3 = *(int *)(param_1 + 0x118);
  __ZN8QVariantC1Ei(local_2d0,0);
  __ZN2dj5audio11BassSample323sample_property_changedENS_9AUDIOEnumEi8QVariant
            (param_1,0x2a,iVar3 + iVar6 * 1000,local_2d0);
  __ZN8QVariantD1Ev(local_2d0);
  *(undefined1 *)(param_1 + 0xbe9) = uVar4;
LAB_10015b7ac:
  uVar7 = param_2[1];
  piVar8 = (int *)*param_2;
  uVar11 = param_2[2];
  if (piVar8 != (int *)0x0) {
    LOAcquire();
    *piVar8 = *piVar8 + 1;
    LORelease();
  }
  piVar1 = *(int **)(param_1 + 0xb8);
  puVar9 = *(undefined8 **)(param_1 + 0xc0);
  *(undefined8 *)(param_1 + 0xc0) = uVar7;
  *(int **)(param_1 + 0xb8) = piVar8;
  lVar10 = *(long *)(param_1 + 200);
  *(undefined8 *)(param_1 + 200) = uVar11;
  if (piVar1 != (int *)0x0) {
    LOAcquire();
    iVar6 = *piVar1;
    *piVar1 = iVar6 + -1;
    LORelease();
    if (iVar6 == 1) {
      if (lVar10 != 0) {
        lVar10 = lVar10 * 0x18;
        do {
          piVar8 = (int *)*puVar9;
          if (piVar8 != (int *)0x0) {
            LOAcquire();
            iVar6 = *piVar8;
            *piVar8 = iVar6 + -1;
            LORelease();
            if (iVar6 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(*puVar9,2,8);
            }
          }
          puVar9 = puVar9 + 3;
          lVar10 = lVar10 + -0x18;
        } while (lVar10 != 0);
      }
      __ZN10QArrayData10deallocateEPS_xx(piVar1,0x18,8);
    }
  }
  lVar10 = 0;
  do {
    if (lVar10 < (long)param_2[2]) {
      uVar7 = __ZN2dj5dbase17HPlaylistDatabase11getInstanceEv();
      puVar9 = (undefined8 *)(param_2[1] + lVar10 * 0x18);
      uStack_308 = puVar9[1];
      local_310 = (int *)*puVar9;
      local_300 = puVar9[2];
      uVar11 = 0;
      if (local_310 != (int *)0x0) {
        LOAcquire();
        iVar6 = *local_310;
        *local_310 = iVar6 + 1;
        uVar11 = CONCAT44((int)((ulong)local_310 >> 0x20),iVar6);
        LORelease();
      }
      local_318 = (int *)0x0;
      piVar8 = (int *)__Znwm(uVar11,0x28);
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
      puVar9 = (undefined8 *)__Znam(0xa0);
      puVar9[1] = 1;
      *puVar9 = 0x90;
      puVar9[0x12] = 0;
      *(undefined2 *)(puVar9 + 0x13) = 0;
      puVar9[5] = 0xffffffffffffffff;
      puVar9[4] = 0xffffffffffffffff;
      puVar9[7] = 0xffffffffffffffff;
      puVar9[6] = 0xffffffffffffffff;
      puVar9[9] = 0xffffffffffffffff;
      puVar9[8] = 0xffffffffffffffff;
      puVar9[0xb] = 0xffffffffffffffff;
      puVar9[10] = 0xffffffffffffffff;
      puVar9[0xd] = 0xffffffffffffffff;
      puVar9[0xc] = 0xffffffffffffffff;
      puVar9[0xf] = 0xffffffffffffffff;
      puVar9[0xe] = 0xffffffffffffffff;
      puVar9[0x11] = 0xffffffffffffffff;
      puVar9[0x10] = 0xffffffffffffffff;
      puVar9[3] = 0xffffffffffffffff;
      puVar9[2] = 0xffffffffffffffff;
      *(undefined8 **)(piVar8 + 8) = puVar9 + 2;
      uVar11 = __ZN9QHashSeed10globalSeedEv();
      *(undefined8 *)(piVar8 + 6) = uVar11;
      local_2d4 = 0;
      local_318 = piVar8;
      FUN_1000a48dc(&local_318,&local_2d4,&uStack_2d5);
      local_2d4 = 1;
      FUN_1000a48dc(&local_318,&local_2d4,&uStack_2d5);
      local_2d4 = 2;
      FUN_1000a48dc(&local_318,&local_2d4,&uStack_2d5);
      local_2d4 = 3;
      FUN_1000a48dc(&local_318,&local_2d4,&uStack_2d5);
      local_2d4 = 4;
      FUN_1000a48dc(&local_318,&local_2d4,&uStack_2d5);
      local_2d4 = 5;
      FUN_1000a48dc(&local_318,&local_2d4,&uStack_2d5);
      __ZN2dj5dbase17HPlaylistDatabase12GetMediaInfoE7QStringbiNS_17enAnalyzePriorityE4QSetINS_11AnalyzeTypeEE
                (local_2d0,uVar7,&local_310,0,0xffffffff,0,&local_318);
      lVar12 = param_1 + 0x1f8 + lVar10 * 600;
      FUN_10008eca4(lVar12,local_2d0);
      *(undefined8 *)(lVar12 + 0x1c8) = local_108;
      if (piStack_d0 != (int *)0x0) {
        LOAcquire();
        *piStack_d0 = *piStack_d0 + 1;
        LORelease();
      }
      piVar8 = *(int **)(lVar12 + 0x200);
      *(undefined8 *)(lVar12 + 0x208) = uStack_c8;
      *(int **)(lVar12 + 0x200) = piStack_d0;
      *(undefined8 *)(lVar12 + 0x210) = local_c0;
      if (piVar8 != (int *)0x0) {
        LOAcquire();
        iVar6 = *piVar8;
        *piVar8 = iVar6 + -1;
        LORelease();
        if (iVar6 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(piVar8,0x20,8);
        }
      }
      *(undefined8 *)(lVar12 + 0x1d0) = local_100;
      __ZN7QStringaSERKS_(lVar12 + 0x1e0,&piStack_f0);
      *(undefined8 *)(lVar12 + 0x1d8) = local_f8;
      *(undefined4 *)(lVar12 + 0x1fc) = local_d4;
      *(undefined4 *)(lVar12 + 0x218) = local_b8;
      *(undefined1 *)(lVar12 + 0x238) = local_98;
      *(undefined8 *)(lVar12 + 0x248) = uStack_88;
      *(ulong *)(lVar12 + 0x240) = CONCAT44(uStack_8c,local_90);
      *(ulong *)(lVar12 + 0x250) = CONCAT44(uStack_7c,local_80);
      if (local_b0 != (int *)0x0) {
        LOAcquire();
        iVar6 = *local_b0;
        *local_b0 = iVar6 + -1;
        LORelease();
        if (iVar6 == 1) {
          if (local_a0 != 0) {
            lVar12 = local_a0 * 0x58;
            puVar9 = local_a8;
            do {
              piVar8 = (int *)puVar9[6];
              if (piVar8 != (int *)0x0) {
                LOAcquire();
                iVar6 = *piVar8;
                *piVar8 = iVar6 + -1;
                LORelease();
                if (iVar6 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(puVar9[6],2,8);
                }
              }
              piVar8 = (int *)*puVar9;
              if (piVar8 != (int *)0x0) {
                LOAcquire();
                iVar6 = *piVar8;
                *piVar8 = iVar6 + -1;
                LORelease();
                if (iVar6 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(*puVar9,2,8);
                }
              }
              puVar9 = puVar9 + 0xb;
              lVar12 = lVar12 + -0x58;
            } while (lVar12 != 0);
          }
          __ZN10QArrayData10deallocateEPS_xx(local_b0,0x58,8);
        }
      }
      if (piStack_d0 != (int *)0x0) {
        LOAcquire();
        iVar6 = *piStack_d0;
        *piStack_d0 = iVar6 + -1;
        LORelease();
        if (iVar6 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(piStack_d0,0x20,8);
        }
      }
      if (piStack_f0 != (int *)0x0) {
        LOAcquire();
        iVar6 = *piStack_f0;
        *piStack_f0 = iVar6 + -1;
        LORelease();
        if (iVar6 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(piStack_f0,2,8);
        }
      }
      FUN_10009f554(local_2d0);
      piVar8 = local_318;
      if ((local_318 != (int *)0x0) && (*local_318 != -1)) {
        LOAcquire();
        iVar6 = *local_318;
        *local_318 = iVar6 + -1;
        LORelease();
        if ((iVar6 == 1) && (local_318 != (int *)0x0)) {
          lVar12 = *(long *)(local_318 + 8);
          if (lVar12 != 0) {
            lVar13 = lVar12 + -0x10;
            if (*(long *)(lVar12 + -8) != 0) {
              lVar12 = *(long *)(lVar12 + -8) * 0x90;
              do {
                if (*(long *)(lVar13 + lVar12) != 0) {
                  __ZdaPv();
                  *(undefined8 *)(lVar13 + lVar12) = 0;
                }
                lVar12 = lVar12 + -0x90;
              } while (lVar12 != 0);
            }
            __ZdaPv(lVar13);
          }
          __ZdlPv(piVar8);
        }
      }
      if (local_310 != (int *)0x0) {
        LOAcquire();
        iVar6 = *local_310;
        *local_310 = iVar6 + -1;
        LORelease();
        if (iVar6 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_310,2,8);
        }
      }
    }
    else {
      local_2d0[0] = 0;
      uStack_2c0 = 0;
      local_2c8 = 0;
      uStack_2b0 = 0;
      uStack_2b8 = 0;
      uStack_2a0 = 0;
      local_2a8 = 0;
      uStack_290 = 0;
      uStack_298 = 0;
      uStack_280 = 0;
      local_288 = 0;
      uStack_270 = 0;
      uStack_278 = 0;
      uStack_260 = 0;
      local_268 = 0;
      uStack_250 = 0;
      uStack_258 = 0;
      uStack_240 = 0;
      local_248 = 0;
      uStack_230 = 0;
      uStack_238 = 0;
      uStack_220 = 0;
      local_228 = 0;
      uStack_210 = 0;
      uStack_218 = 0;
      uStack_200 = 0;
      local_208 = 0;
      uStack_1f0 = 0;
      uStack_1f8 = 0;
      uStack_1e0 = 0;
      local_1e8 = 0;
      uStack_1d0 = 0;
      uStack_1d8 = 0;
      uStack_1c4 = 0;
      local_1cc = 0;
      uStack_1c8 = 0;
      local_1b8 = 0;
      uStack_1b0 = 0;
      local_1a8 = 0;
      __ZN6QImageC1Ev(auStack_1a0);
      local_188 = 0;
      uStack_180 = 0;
      local_178 = 0;
      local_170 = 0xffffffff;
      local_16c = 0;
      local_160 = 0;
      uStack_158 = 0;
      local_150 = 0;
      local_148 = 0;
      uStack_138 = 0;
      local_140 = 0;
      uStack_128 = 0;
      uStack_130 = 0;
      uStack_11c = 0;
      local_124 = 0;
      uStack_120 = 0;
      local_114 = 0xc61c3c00;
      local_108 = 0x4056800000000000;
      local_100 = 0xffffffffffffffff;
      local_a8 = (undefined8 *)0x0;
      local_a0 = 0;
      local_b0 = (int *)0x0;
      local_d8 = 0;
      piStack_f0 = (int *)0x0;
      local_f8 = 0;
      uStack_e0 = 0;
      uStack_e8 = 0;
      local_98 = 1;
      local_90 = 0xffffffff;
      uStack_88 = 0xbff0000000000000;
      local_80 = local_80 & 0xffffff00;
      lVar12 = param_1 + 0x1f8 + lVar10 * 600;
      uStack_7c = 0;
      FUN_10008eca4(lVar12,local_2d0);
      *(undefined8 *)(lVar12 + 0x1c8) = local_108;
      if (piStack_d0 != (int *)0x0) {
        LOAcquire();
        *piStack_d0 = *piStack_d0 + 1;
        LORelease();
      }
      piVar8 = *(int **)(lVar12 + 0x200);
      *(undefined8 *)(lVar12 + 0x208) = uStack_c8;
      *(int **)(lVar12 + 0x200) = piStack_d0;
      *(undefined8 *)(lVar12 + 0x210) = local_c0;
      if (piVar8 != (int *)0x0) {
        LOAcquire();
        iVar6 = *piVar8;
        *piVar8 = iVar6 + -1;
        LORelease();
        if (iVar6 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(piVar8,0x20,8);
        }
      }
      *(undefined8 *)(lVar12 + 0x1d0) = local_100;
      __ZN7QStringaSERKS_(lVar12 + 0x1e0,&piStack_f0);
      *(undefined8 *)(lVar12 + 0x1d8) = local_f8;
      *(undefined4 *)(lVar12 + 0x1fc) = local_d4;
      *(undefined4 *)(lVar12 + 0x218) = local_b8;
      *(undefined1 *)(lVar12 + 0x238) = local_98;
      *(undefined8 *)(lVar12 + 0x248) = uStack_88;
      *(ulong *)(lVar12 + 0x240) = CONCAT44(uStack_8c,local_90);
      *(ulong *)(lVar12 + 0x250) = CONCAT44(uStack_7c,local_80);
      if (local_b0 != (int *)0x0) {
        LOAcquire();
        iVar6 = *local_b0;
        *local_b0 = iVar6 + -1;
        LORelease();
        if (iVar6 == 1) {
          if (local_a0 != 0) {
            lVar12 = local_a0 * 0x58;
            puVar9 = local_a8;
            do {
              piVar8 = (int *)puVar9[6];
              if (piVar8 != (int *)0x0) {
                LOAcquire();
                iVar6 = *piVar8;
                *piVar8 = iVar6 + -1;
                LORelease();
                if (iVar6 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(puVar9[6],2,8);
                }
              }
              piVar8 = (int *)*puVar9;
              if (piVar8 != (int *)0x0) {
                LOAcquire();
                iVar6 = *piVar8;
                *piVar8 = iVar6 + -1;
                LORelease();
                if (iVar6 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(*puVar9,2,8);
                }
              }
              puVar9 = puVar9 + 0xb;
              lVar12 = lVar12 + -0x58;
            } while (lVar12 != 0);
          }
          __ZN10QArrayData10deallocateEPS_xx(local_b0,0x58,8);
        }
      }
      if (piStack_d0 != (int *)0x0) {
        LOAcquire();
        iVar6 = *piStack_d0;
        *piStack_d0 = iVar6 + -1;
        LORelease();
        if (iVar6 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(piStack_d0,0x20,8);
        }
      }
      if (piStack_f0 != (int *)0x0) {
        LOAcquire();
        iVar6 = *piStack_f0;
        *piStack_f0 = iVar6 + -1;
        LORelease();
        if (iVar6 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(piStack_f0,2,8);
        }
      }
      FUN_10009f554(local_2d0);
    }
    lVar10 = lVar10 + 1;
  } while (lVar10 != 4);
  if (*(long *)PTR____stack_chk_guard_10172c568 == local_78) {
    return 1;
  }
                    /* WARNING: Subroutine does not return */
  ___stack_chk_fail();
}

