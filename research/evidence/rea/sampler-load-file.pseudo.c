
undefined8
__ZN2dj5audio10BassStream10loadSampleEii7QString
          (long param_1,undefined8 param_2,undefined8 param_3,undefined8 *param_4)

{
  uint uVar1;
  int iVar2;
  undefined8 uVar3;
  int *piVar4;
  undefined8 *puVar5;
  undefined8 uVar6;
  long lVar7;
  long lVar8;
  int *local_300;
  undefined8 uStack_2f8;
  undefined8 local_2f0;
  int *local_2e8;
  int *local_2e0;
  undefined8 uStack_2d8;
  undefined8 local_2d0;
  undefined1 auStack_2c0 [480];
  int *local_e0;
  int *local_c0;
  int *local_a0;
  undefined8 *local_98;
  long local_90;
  undefined1 uStack_65;
  undefined4 local_64;
  
  uVar3 = __ZN2dj5dbase17HPlaylistDatabase11getInstanceEv();
  uStack_2d8 = *(undefined8 *)(param_1 + 0x188b98);
  local_2e0 = *(int **)(param_1 + 0x188b90);
  local_2d0 = *(undefined8 *)(param_1 + 0x188ba0);
  uVar6 = 0;
  if (local_2e0 != (int *)0x0) {
    LOAcquire();
    iVar2 = *local_2e0;
    *local_2e0 = iVar2 + 1;
    uVar6 = CONCAT44((int)((ulong)local_2e0 >> 0x20),iVar2);
    LORelease();
  }
  local_2e8 = (int *)0x0;
  piVar4 = (int *)__Znwm(uVar6,0x28);
  *piVar4 = 1;
  piVar4[4] = 0;
  piVar4[5] = 0;
  piVar4[2] = 0;
  piVar4[3] = 0;
  piVar4[8] = 0;
  piVar4[9] = 0;
  piVar4[6] = 0;
  piVar4[7] = 0;
  piVar4[4] = 0x10;
  piVar4[5] = 0;
  puVar5 = (undefined8 *)__Znam(0xa0);
  puVar5[1] = 1;
  *puVar5 = 0x90;
  puVar5[0x12] = 0;
  *(undefined2 *)(puVar5 + 0x13) = 0;
  puVar5[5] = 0xffffffffffffffff;
  puVar5[4] = 0xffffffffffffffff;
  puVar5[7] = 0xffffffffffffffff;
  puVar5[6] = 0xffffffffffffffff;
  puVar5[9] = 0xffffffffffffffff;
  puVar5[8] = 0xffffffffffffffff;
  puVar5[0xb] = 0xffffffffffffffff;
  puVar5[10] = 0xffffffffffffffff;
  puVar5[0xd] = 0xffffffffffffffff;
  puVar5[0xc] = 0xffffffffffffffff;
  puVar5[0xf] = 0xffffffffffffffff;
  puVar5[0xe] = 0xffffffffffffffff;
  puVar5[0x11] = 0xffffffffffffffff;
  puVar5[0x10] = 0xffffffffffffffff;
  puVar5[3] = 0xffffffffffffffff;
  puVar5[2] = 0xffffffffffffffff;
  *(undefined8 **)(piVar4 + 8) = puVar5 + 2;
  uVar6 = __ZN9QHashSeed10globalSeedEv();
  *(undefined8 *)(piVar4 + 6) = uVar6;
  local_64 = 0;
  local_2e8 = piVar4;
  FUN_1000a48dc(&local_2e8,&local_64,&uStack_65);
  local_64 = 1;
  FUN_1000a48dc(&local_2e8,&local_64,&uStack_65);
  local_64 = 2;
  FUN_1000a48dc(&local_2e8,&local_64,&uStack_65);
  local_64 = 3;
  FUN_1000a48dc(&local_2e8,&local_64,&uStack_65);
  local_64 = 4;
  FUN_1000a48dc(&local_2e8,&local_64,&uStack_65);
  local_64 = 5;
  FUN_1000a48dc(&local_2e8,&local_64,&uStack_65);
  __ZN2dj5dbase17HPlaylistDatabase12GetMediaInfoE7QStringbiNS_17enAnalyzePriorityE4QSetINS_11AnalyzeTypeEE
            (auStack_2c0,uVar3,&local_2e0,0,0xffffffff,0,&local_2e8);
  FUN_10008eca4(param_1 + 0x188b88,auStack_2c0);
  if (local_a0 != (int *)0x0) {
    LOAcquire();
    iVar2 = *local_a0;
    *local_a0 = iVar2 + -1;
    LORelease();
    if (iVar2 == 1) {
      if (local_90 != 0) {
        lVar7 = local_90 * 0x58;
        puVar5 = local_98;
        do {
          piVar4 = (int *)puVar5[6];
          if (piVar4 != (int *)0x0) {
            LOAcquire();
            iVar2 = *piVar4;
            *piVar4 = iVar2 + -1;
            LORelease();
            if (iVar2 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(puVar5[6],2,8);
            }
          }
          piVar4 = (int *)*puVar5;
          if (piVar4 != (int *)0x0) {
            LOAcquire();
            iVar2 = *piVar4;
            *piVar4 = iVar2 + -1;
            LORelease();
            if (iVar2 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(*puVar5,2,8);
            }
          }
          puVar5 = puVar5 + 0xb;
          lVar7 = lVar7 + -0x58;
        } while (lVar7 != 0);
      }
      __ZN10QArrayData10deallocateEPS_xx(local_a0,0x58,8);
    }
  }
  if (local_c0 != (int *)0x0) {
    LOAcquire();
    iVar2 = *local_c0;
    *local_c0 = iVar2 + -1;
    LORelease();
    if (iVar2 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_c0,0x20,8);
    }
  }
  if (local_e0 != (int *)0x0) {
    LOAcquire();
    iVar2 = *local_e0;
    *local_e0 = iVar2 + -1;
    LORelease();
    if (iVar2 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
    }
  }
  FUN_10009f554(auStack_2c0);
  piVar4 = local_2e8;
  if ((local_2e8 != (int *)0x0) && (*local_2e8 != -1)) {
    LOAcquire();
    iVar2 = *local_2e8;
    *local_2e8 = iVar2 + -1;
    LORelease();
    if ((iVar2 == 1) && (local_2e8 != (int *)0x0)) {
      lVar7 = *(long *)(local_2e8 + 8);
      if (lVar7 != 0) {
        lVar8 = lVar7 + -0x10;
        if (*(long *)(lVar7 + -8) != 0) {
          lVar7 = *(long *)(lVar7 + -8) * 0x90;
          do {
            if (*(long *)(lVar8 + lVar7) != 0) {
              __ZdaPv();
              *(undefined8 *)(lVar8 + lVar7) = 0;
            }
            lVar7 = lVar7 + -0x90;
          } while (lVar7 != 0);
        }
        __ZdaPv(lVar8);
      }
      __ZdlPv(piVar4);
    }
  }
  if (local_2e0 != (int *)0x0) {
    LOAcquire();
    iVar2 = *local_2e0;
    *local_2e0 = iVar2 + -1;
    LORelease();
    if (iVar2 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_2e0,2,8);
    }
  }
  uVar1 = (int)param_2 - 1;
  if (uVar1 < 4) {
    lVar7 = param_1 + 0x188810;
    lVar8 = *(long *)(lVar7 + (ulong)uVar1 * 8);
    if (lVar8 != 0) {
      if (*(int *)(lVar8 + 0x50) != 0) {
        __ZN2dj5audio16BassRecordStream16recordSampleStopEPNS0_11BassSample3Eb
                  (*(undefined8 *)(param_1 + 0x188830),lVar8,1);
        lVar8 = *(long *)(lVar7 + (ulong)uVar1 * 8);
      }
      uStack_2f8 = param_4[1];
      local_300 = (int *)*param_4;
      local_2f0 = param_4[2];
      if (local_300 != (int *)0x0) {
        LOAcquire();
        *local_300 = *local_300 + 1;
        LORelease();
      }
      uVar6 = __ZN2dj5audio11BassSample34openE7QStringibb(lVar8,&local_300,param_3,0,0);
      if (local_300 != (int *)0x0) {
        LOAcquire();
        iVar2 = *local_300;
        *local_300 = iVar2 + -1;
        LORelease();
        if (iVar2 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_300,2,8);
        }
      }
      __ZN2dj5audio11BassSample316changeSampleTypeEiNS_10SampleTypeE
                (*(undefined8 *)(lVar7 + (ulong)uVar1 * 8),param_3,
                 *(undefined4 *)(param_1 + 0x188718));
      __ZN2dj5audio10BassStream11sendSamplesEi(param_1,param_2);
      return uVar6;
    }
  }
  return 0;
}

