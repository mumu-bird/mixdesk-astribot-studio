
ulong __ZN2dj5audio10BassStream14loadSamplePackE7QString(long param_1,undefined8 *param_2)

{
  long lVar1;
  undefined4 uVar2;
  int iVar3;
  ulong uVar4;
  undefined8 uVar5;
  undefined8 uVar6;
  undefined8 *puVar7;
  int *piVar8;
  undefined8 *puVar9;
  long lVar10;
  long lVar11;
  long lVar12;
  long lVar13;
  long lVar14;
  int *local_4d0;
  undefined8 uStack_4c8;
  undefined8 local_4c0;
  int *local_4b8;
  int *local_4b0;
  undefined8 uStack_4a8;
  undefined8 local_4a0;
  int *local_490;
  int *piStack_488;
  undefined8 local_480;
  undefined8 local_478;
  undefined8 local_2c8;
  undefined8 local_2c0;
  undefined8 local_2b8;
  int *local_2b0 [3];
  undefined4 local_294;
  int *local_290;
  undefined8 uStack_288;
  undefined8 local_280;
  undefined4 local_278;
  int *local_270;
  undefined8 *local_268;
  long local_260;
  undefined1 local_258;
  int *local_230;
  undefined8 *puStack_228;
  long local_220;
  int *local_210;
  int *local_208;
  undefined8 uStack_200;
  undefined8 local_1f8;
  int *local_1f0;
  undefined8 uStack_1e8;
  long local_1e0;
  undefined1 auStack_1d0 [8];
  int *local_1c8 [3];
  int *local_1b0;
  int *piStack_1a8;
  undefined8 local_1a0;
  int *local_190;
  undefined8 uStack_188;
  long local_180;
  int *local_170;
  undefined8 *puStack_168;
  long local_160;
  int *local_150;
  undefined8 uStack_148;
  undefined8 local_140;
  int *local_130 [3];
  undefined1 local_115;
  float local_114;
  int *local_110;
  undefined8 uStack_108;
  undefined8 local_100;
  int *local_f0;
  undefined8 *local_e8;
  long local_e0;
  undefined1 auStack_d8 [8];
  undefined1 auStack_d0 [32];
  undefined1 auStack_b0 [32];
  undefined1 auStack_90 [32];
  long local_70;
  
  local_70 = *(long *)PTR____stack_chk_guard_10172c568;
  iVar3 = __ZN5QFile6existsERK7QString(param_2);
  if (iVar3 == 0) {
    uVar4 = 0;
  }
  else {
    __ZN9QFileInfoC1ERK7QString(auStack_d8,param_2);
    local_f0 = (int *)0x0;
    local_e8 = (undefined8 *)0x0;
    local_e0 = 0;
    uStack_108 = param_2[1];
    local_110 = (int *)*param_2;
    local_100 = param_2[2];
    uVar5 = 0;
    if (local_110 != (int *)0x0) {
      LOAcquire();
      iVar3 = *local_110;
      *local_110 = iVar3 + 1;
      uVar5 = CONCAT44((int)((ulong)local_110 >> 0x20),iVar3);
      LORelease();
    }
    uVar4 = __ZN2dj23getDJSSampleListFromXMLE7QStringP5QListIS1_INS_10SampleInfoEEE
                      (uVar5,&local_110,&local_f0);
    if (local_110 != (int *)0x0) {
      LOAcquire();
      iVar3 = *local_110;
      *local_110 = iVar3 + -1;
      LORelease();
      if (iVar3 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_110,2,8);
      }
    }
    if ((uVar4 & 1) != 0) {
      if (*(int *)(param_1 + 0x1886f0) != 1) {
        __ZN2dj5audio10BassStream11setDeckModeENS_15UIPanelDeckModeE(param_1,1);
      }
      local_114 = -1.0;
      local_115 = 0;
      uVar5 = __ZN2dj5dbase17HPlaylistDatabase11getInstanceEv();
      __ZNK9QFileInfo11absoluteDirEv(&local_490,auStack_d8);
      __ZNK4QDir4pathEv(local_130,&local_490);
      uStack_148 = param_2[1];
      local_150 = (int *)*param_2;
      local_140 = param_2[2];
      if (local_150 != (int *)0x0) {
        LOAcquire();
        *local_150 = *local_150 + 1;
        LORelease();
      }
      __ZN2dj5dbase17HPlaylistDatabase23AddSamplePackToDatabaseE7QStringRK5QListIS3_INS_10SampleInfoEEES2_PfPbPNS_10SampleTypeE
                (uVar5,local_130,&local_f0,&local_150,&local_114,&local_115,param_1 + 0x188718);
      if (local_150 != (int *)0x0) {
        LOAcquire();
        iVar3 = *local_150;
        *local_150 = iVar3 + -1;
        LORelease();
        if (iVar3 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_150,2,8);
        }
      }
      if (local_130[0] != (int *)0x0) {
        LOAcquire();
        iVar3 = *local_130[0];
        *local_130[0] = iVar3 + -1;
        LORelease();
        if (iVar3 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_130[0],2,8);
        }
      }
      __ZN4QDirD1Ev(&local_490);
      if (0.0 < local_114) {
        __ZN2dj5audio10BassStream33setSamplerQuantizationSizeInBeatsEd((double)local_114,param_1);
      }
      __ZN2dj5audio10BassStream23setSamplersQuantizationEb(param_1,local_115);
      if (0 < local_e0) {
        lVar11 = 0;
        do {
          lVar14 = 0;
          lVar10 = 0;
          puStack_168 = (undefined8 *)0x0;
          local_170 = (int *)0x0;
          local_160 = 0;
          lVar12 = lVar11 + 1;
          while( true ) {
            if ((((local_f0 == (int *)0x0) || (1 < *local_f0)) &&
                (FUN_1000a71b8(&local_f0,0,0,0), local_f0 == (int *)0x0)) || (1 < *local_f0)) {
              FUN_1000a71b8(&local_f0,0,0,0);
            }
            if ((long)local_e8[lVar11 * 3 + 2] <= lVar10) break;
            if ((((local_f0 == (int *)0x0) || (1 < *local_f0)) &&
                (FUN_1000a71b8(&local_f0,0,0,0), local_f0 == (int *)0x0)) || (1 < *local_f0)) {
              FUN_1000a71b8(&local_f0,0,0,0);
            }
            puVar7 = local_e8 + lVar11 * 3;
            piVar8 = (int *)*puVar7;
            if ((piVar8 == (int *)0x0) || (1 < *piVar8)) {
              FUN_1000a8074(puVar7,0,0,0);
              piVar8 = (int *)*puVar7;
              if (piVar8 != (int *)0x0) goto LAB_100098838;
LAB_100098844:
              FUN_1000a8074(puVar7,0,0,0);
            }
            else {
LAB_100098838:
              if (1 < *piVar8) goto LAB_100098844;
            }
            lVar13 = puVar7[1];
            lVar1 = lVar13 + lVar14;
            uStack_188 = *(undefined8 *)(lVar1 + 0x80);
            local_190 = *(int **)(lVar1 + 0x78);
            local_180 = *(long *)(lVar1 + 0x88);
            if (local_190 != (int *)0x0) {
              LOAcquire();
              *local_190 = *local_190 + 1;
              LORelease();
            }
            if ((local_180 != 0) &&
               (iVar3 = __ZN4QDir14isRelativePathERK7QString(&local_190), iVar3 != 0)) {
              __ZNK9QFileInfo11absoluteDirEv(auStack_1d0,auStack_d8);
              __ZNK4QDir4pathEv(local_1c8,auStack_1d0);
              FUN_100014ba4(&local_1b0,local_1c8,"/");
              piStack_488 = piStack_1a8;
              local_490 = local_1b0;
              local_480 = local_1a0;
              iVar3 = 0;
              if (local_1b0 != (int *)0x0) {
                LOAcquire();
                iVar3 = *local_1b0;
                *local_1b0 = iVar3 + 1;
                LORelease();
              }
              __ZN7QString6appendERKS_(iVar3,&local_490,&local_190);
              __ZN7QStringaSERKS_(&local_190,&local_490);
              if (local_490 != (int *)0x0) {
                LOAcquire();
                iVar3 = *local_490;
                *local_490 = iVar3 + -1;
                LORelease();
                if (iVar3 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_490,2,8);
                }
              }
              if (local_1b0 != (int *)0x0) {
                LOAcquire();
                iVar3 = *local_1b0;
                *local_1b0 = iVar3 + -1;
                LORelease();
                if (iVar3 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_1b0,2,8);
                }
              }
              if (local_1c8[0] != (int *)0x0) {
                LOAcquire();
                iVar3 = *local_1c8[0];
                *local_1c8[0] = iVar3 + -1;
                LORelease();
                if (iVar3 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_1c8[0],2,8);
                }
              }
              __ZN4QDirD1Ev(auStack_1d0);
            }
            uStack_1e8 = uStack_188;
            local_1f0 = local_190;
            local_1e0 = local_180;
            if (local_190 != (int *)0x0) {
              LOAcquire();
              *local_190 = *local_190 + 1;
              LORelease();
            }
            __ZN2dj21toUniversalSeparatorsE7QString(&local_1b0,&local_1f0);
            if (local_1f0 != (int *)0x0) {
              LOAcquire();
              iVar3 = *local_1f0;
              *local_1f0 = iVar3 + -1;
              LORelease();
              if (iVar3 == 1) {
                __ZN10QArrayData10deallocateEPS_xx(local_1f0,2,8);
              }
            }
            FUN_100014d8c(&local_170,local_160,&local_1b0);
            if ((local_170 == (int *)0x0) || (1 < *local_170)) {
              FUN_100015064(&local_170,0,0,0);
            }
            piStack_488 = (int *)0x0;
            local_490 = (int *)0x0;
            local_478 = 0;
            local_480 = 0;
            lVar13 = lVar13 + lVar14;
            __ZN7QStringaSERKS_(&piStack_488,lVar13 + 0x90);
            local_490 = (int *)CONCAT44(*(undefined4 *)(lVar13 + 200),(int)(lVar10 + 1));
            uStack_200 = local_480;
            local_208 = piStack_488;
            local_1f8 = local_478;
            iVar3 = 0;
            if (piStack_488 != (int *)0x0) {
              LOAcquire();
              iVar3 = *piStack_488;
              *piStack_488 = iVar3 + 1;
              LORelease();
            }
            local_210 = local_490;
            __ZN2dj5audio10BassStream18setSamplerCellInfoEiiNS_14SampleCellInfoE
                      (iVar3,param_1,lVar12,lVar10 + 1,&local_210);
            if (local_208 != (int *)0x0) {
              LOAcquire();
              iVar3 = *local_208;
              *local_208 = iVar3 + -1;
              LORelease();
              if (iVar3 == 1) {
                __ZN10QArrayData10deallocateEPS_xx(local_208,2,8);
              }
            }
            if (piStack_488 != (int *)0x0) {
              LOAcquire();
              iVar3 = *piStack_488;
              *piStack_488 = iVar3 + -1;
              LORelease();
              if (iVar3 == 1) {
                __ZN10QArrayData10deallocateEPS_xx(piStack_488,2,8);
              }
            }
            if (local_1b0 != (int *)0x0) {
              LOAcquire();
              iVar3 = *local_1b0;
              *local_1b0 = iVar3 + -1;
              LORelease();
              if (iVar3 == 1) {
                __ZN10QArrayData10deallocateEPS_xx(local_1b0,2,8);
              }
            }
            if (local_190 != (int *)0x0) {
              LOAcquire();
              iVar3 = *local_190;
              *local_190 = iVar3 + -1;
              LORelease();
              if (iVar3 == 1) {
                __ZN10QArrayData10deallocateEPS_xx(local_190,2,8);
              }
            }
            lVar14 = lVar14 + 0xd0;
            lVar10 = lVar10 + 1;
          }
          puStack_228 = puStack_168;
          local_230 = local_170;
          local_220 = local_160;
          iVar3 = 0;
          if (local_170 != (int *)0x0) {
            LOAcquire();
            iVar3 = *local_170;
            *local_170 = iVar3 + 1;
            LORelease();
          }
          __ZN2dj5audio10BassStream23loadSamplePackInSamplerEi5QListI7QStringE
                    (iVar3,param_1,lVar12,&local_230);
          if (local_230 != (int *)0x0) {
            LOAcquire();
            iVar3 = *local_230;
            *local_230 = iVar3 + -1;
            LORelease();
            if (iVar3 == 1) {
              if (local_220 != 0) {
                lVar11 = local_220 * 0x18;
                puVar7 = puStack_228;
                do {
                  piVar8 = (int *)*puVar7;
                  if (piVar8 != (int *)0x0) {
                    LOAcquire();
                    iVar3 = *piVar8;
                    *piVar8 = iVar3 + -1;
                    LORelease();
                    if (iVar3 == 1) {
                      __ZN10QArrayData10deallocateEPS_xx(*puVar7,2,8);
                    }
                  }
                  puVar7 = puVar7 + 3;
                  lVar11 = lVar11 + -0x18;
                } while (lVar11 != 0);
              }
              __ZN10QArrayData10deallocateEPS_xx(local_230,0x18,8);
            }
          }
          if (local_170 != (int *)0x0) {
            LOAcquire();
            iVar3 = *local_170;
            *local_170 = iVar3 + -1;
            LORelease();
            if (iVar3 == 1) {
              if (local_160 != 0) {
                lVar11 = local_160 * 0x18;
                puVar7 = puStack_168;
                do {
                  piVar8 = (int *)*puVar7;
                  if (piVar8 != (int *)0x0) {
                    LOAcquire();
                    iVar3 = *piVar8;
                    *piVar8 = iVar3 + -1;
                    LORelease();
                    if (iVar3 == 1) {
                      __ZN10QArrayData10deallocateEPS_xx(*puVar7,2,8);
                    }
                  }
                  puVar7 = puVar7 + 3;
                  lVar11 = lVar11 + -0x18;
                } while (lVar11 != 0);
              }
              __ZN10QArrayData10deallocateEPS_xx(local_170,0x18,8);
            }
          }
          lVar11 = lVar12;
        } while (lVar12 < local_e0);
      }
      uVar6 = __ZN2dj5dbase17HPlaylistDatabase11getInstanceEv();
      uStack_4a8 = param_2[1];
      local_4b0 = (int *)*param_2;
      local_4a0 = param_2[2];
      uVar5 = 0;
      if (local_4b0 != (int *)0x0) {
        LOAcquire();
        iVar3 = *local_4b0;
        *local_4b0 = iVar3 + 1;
        uVar5 = CONCAT44((int)((ulong)local_4b0 >> 0x20),iVar3);
        LORelease();
      }
      local_4b8 = (int *)0x0;
      piVar8 = (int *)__Znwm(uVar5,0x28);
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
      puVar7 = (undefined8 *)__Znam(0xa0);
      uVar4 = uVar4 & 0xffffffff;
      puVar7[1] = 1;
      *puVar7 = 0x90;
      puVar7[0x12] = 0;
      *(undefined2 *)(puVar7 + 0x13) = 0;
      puVar7[5] = 0xffffffffffffffff;
      puVar7[4] = 0xffffffffffffffff;
      puVar7[7] = 0xffffffffffffffff;
      puVar7[6] = 0xffffffffffffffff;
      puVar7[9] = 0xffffffffffffffff;
      puVar7[8] = 0xffffffffffffffff;
      puVar7[0xb] = 0xffffffffffffffff;
      puVar7[10] = 0xffffffffffffffff;
      puVar7[0xd] = 0xffffffffffffffff;
      puVar7[0xc] = 0xffffffffffffffff;
      puVar7[0xf] = 0xffffffffffffffff;
      puVar7[0xe] = 0xffffffffffffffff;
      puVar7[0x11] = 0xffffffffffffffff;
      puVar7[0x10] = 0xffffffffffffffff;
      puVar7[3] = 0xffffffffffffffff;
      puVar7[2] = 0xffffffffffffffff;
      *(undefined8 **)(piVar8 + 8) = puVar7 + 2;
      uVar5 = __ZN9QHashSeed10globalSeedEv();
      *(undefined8 *)(piVar8 + 6) = uVar5;
      local_170 = (int *)((ulong)local_170 & 0xffffffff00000000);
      local_4b8 = piVar8;
      FUN_1000a48dc(&local_4b8,&local_170,&local_190);
      local_170._0_4_ = 1;
      FUN_1000a48dc(&local_4b8,&local_170,&local_190);
      local_170._0_4_ = 2;
      FUN_1000a48dc(&local_4b8,&local_170,&local_190);
      local_170._0_4_ = 3;
      FUN_1000a48dc(&local_4b8,&local_170,&local_190);
      local_170._0_4_ = 4;
      FUN_1000a48dc(&local_4b8,&local_170,&local_190);
      local_170 = (int *)CONCAT44(local_170._4_4_,5);
      FUN_1000a48dc(&local_4b8,&local_170,&local_190);
      __ZN2dj5dbase17HPlaylistDatabase12GetMediaInfoE7QStringbiNS_17enAnalyzePriorityE4QSetINS_11AnalyzeTypeEE
                (&local_490,uVar6,&local_4b0,0,0xffffffff,0,&local_4b8);
      piVar8 = local_4b8;
      if ((local_4b8 != (int *)0x0) && (*local_4b8 != -1)) {
        LOAcquire();
        iVar3 = *local_4b8;
        *local_4b8 = iVar3 + -1;
        LORelease();
        if ((iVar3 == 1) && (local_4b8 != (int *)0x0)) {
          lVar11 = *(long *)(local_4b8 + 8);
          if (lVar11 != 0) {
            lVar12 = lVar11 + -0x10;
            if (*(long *)(lVar11 + -8) != 0) {
              lVar11 = *(long *)(lVar11 + -8) * 0x90;
              do {
                if (*(long *)(lVar12 + lVar11) != 0) {
                  __ZdaPv();
                  *(undefined8 *)(lVar12 + lVar11) = 0;
                }
                lVar11 = lVar11 + -0x90;
              } while (lVar11 != 0);
            }
            __ZdaPv(lVar12);
          }
          __ZdlPv(piVar8);
        }
      }
      if (local_4b0 != (int *)0x0) {
        LOAcquire();
        iVar3 = *local_4b0;
        *local_4b0 = iVar3 + -1;
        LORelease();
        if (iVar3 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_4b0,2,8);
        }
      }
      FUN_100094010(param_1 + 0x188b88,&local_490);
      *(undefined8 *)(param_1 + 0x188d50) = local_2c8;
      if (local_290 != (int *)0x0) {
        LOAcquire();
        *local_290 = *local_290 + 1;
        LORelease();
      }
      piVar8 = *(int **)(param_1 + 0x188d88);
      *(undefined8 *)(param_1 + 0x188d90) = uStack_288;
      *(int **)(param_1 + 0x188d88) = local_290;
      *(undefined8 *)(param_1 + 0x188d98) = local_280;
      if (piVar8 != (int *)0x0) {
        LOAcquire();
        iVar3 = *piVar8;
        *piVar8 = iVar3 + -1;
        LORelease();
        if (iVar3 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(piVar8,0x20,8);
        }
      }
      *(undefined8 *)(param_1 + 0x188d58) = local_2c0;
      __ZN7QStringaSERKS_(param_1 + 0x188d68,local_2b0);
      *(undefined8 *)(param_1 + 0x188d60) = local_2b8;
      *(undefined4 *)(param_1 + 0x188d84) = local_294;
      *(undefined4 *)(param_1 + 0x188da0) = local_278;
      *(undefined1 *)(param_1 + 0x188dc0) = local_258;
      uVar2 = *(undefined4 *)(param_1 + 0x7c);
      __ZN8QVariantC1E9QMetaTypePKv
                (auStack_90,
                 PTR___ZN9QtPrivate25QMetaTypeInterfaceWrapperIN2dj14AudioMediaInfoEE8metaTypeE_10172d2f0
                 ,param_1 + 0x188b88);
      __ZN2dj5audio10BassStream23stream_property_changedENS_9AUDIOEnumEi8QVariant
                (param_1,0x13,uVar2,auStack_90);
      __ZN8QVariantD1Ev(auStack_90);
      uVar2 = *(undefined4 *)(param_1 + 0x7c);
      uStack_4c8 = param_2[1];
      local_4d0 = (int *)*param_2;
      local_4c0 = param_2[2];
      if (local_4d0 != (int *)0x0) {
        LOAcquire();
        *local_4d0 = *local_4d0 + 1;
        LORelease();
      }
      __ZN2dj21toUniversalSeparatorsE7QString(&local_170,&local_4d0);
      __ZN8QVariantC1ERK7QString(auStack_b0,&local_170);
      __ZN2dj5audio10BassStream23stream_property_changedENS_9AUDIOEnumEi8QVariant
                (param_1,8,uVar2,auStack_b0);
      __ZN8QVariantD1Ev(auStack_b0);
      if (local_170 != (int *)0x0) {
        LOAcquire();
        iVar3 = *local_170;
        *local_170 = iVar3 + -1;
        LORelease();
        if (iVar3 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_170,2,8);
        }
      }
      if (local_4d0 != (int *)0x0) {
        LOAcquire();
        iVar3 = *local_4d0;
        *local_4d0 = iVar3 + -1;
        LORelease();
        if (iVar3 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_4d0,2,8);
        }
      }
      uVar2 = *(undefined4 *)(param_1 + 0x7c);
      __ZN8QVariantC1E9QMetaTypePKv
                (auStack_d0,
                 PTR___ZN9QtPrivate25QMetaTypeInterfaceWrapperIN2dj15AUDIOBPMResultsEE8metaTypeE_10172d300
                 ,param_1 + 0x188d50);
      __ZN2dj5audio10BassStream23stream_property_changedENS_9AUDIOEnumEi8QVariant
                (param_1,0x23,uVar2,auStack_d0);
      __ZN8QVariantD1Ev(auStack_d0);
      if (local_270 != (int *)0x0) {
        LOAcquire();
        iVar3 = *local_270;
        *local_270 = iVar3 + -1;
        LORelease();
        if (iVar3 == 1) {
          if (local_260 != 0) {
            lVar11 = local_260 * 0x58;
            puVar7 = local_268;
            do {
              piVar8 = (int *)puVar7[6];
              if (piVar8 != (int *)0x0) {
                LOAcquire();
                iVar3 = *piVar8;
                *piVar8 = iVar3 + -1;
                LORelease();
                if (iVar3 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(puVar7[6],2,8);
                }
              }
              piVar8 = (int *)*puVar7;
              if (piVar8 != (int *)0x0) {
                LOAcquire();
                iVar3 = *piVar8;
                *piVar8 = iVar3 + -1;
                LORelease();
                if (iVar3 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(*puVar7,2,8);
                }
              }
              puVar7 = puVar7 + 0xb;
              lVar11 = lVar11 + -0x58;
            } while (lVar11 != 0);
          }
          __ZN10QArrayData10deallocateEPS_xx(local_270,0x58,8);
        }
      }
      if (local_290 != (int *)0x0) {
        LOAcquire();
        iVar3 = *local_290;
        *local_290 = iVar3 + -1;
        LORelease();
        if (iVar3 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_290,0x20,8);
        }
      }
      if (local_2b0[0] != (int *)0x0) {
        LOAcquire();
        iVar3 = *local_2b0[0];
        *local_2b0[0] = iVar3 + -1;
        LORelease();
        if (iVar3 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_2b0[0],2,8);
        }
      }
      FUN_10009f554(&local_490);
    }
    if (local_f0 != (int *)0x0) {
      LOAcquire();
      iVar3 = *local_f0;
      *local_f0 = iVar3 + -1;
      LORelease();
      if (iVar3 == 1) {
        if (local_e0 != 0) {
          puVar9 = local_e8 + local_e0 * 3;
          puVar7 = local_e8;
          do {
            piVar8 = (int *)*puVar7;
            if (piVar8 != (int *)0x0) {
              LOAcquire();
              iVar3 = *piVar8;
              *piVar8 = iVar3 + -1;
              LORelease();
              if (iVar3 == 1) {
                if (puVar7[2] != 0) {
                  lVar11 = puVar7[1];
                  lVar12 = puVar7[2] * 0xd0;
                  do {
                    lVar11 = FUN_1000a1558(lVar11);
                    lVar11 = lVar11 + 0xd0;
                    lVar12 = lVar12 + -0xd0;
                  } while (lVar12 != 0);
                }
                __ZN10QArrayData10deallocateEPS_xx(*puVar7,0xd0,8);
              }
            }
            puVar7 = puVar7 + 3;
          } while (puVar7 != puVar9);
        }
        __ZN10QArrayData10deallocateEPS_xx(local_f0,0x18,8);
      }
    }
    __ZN9QFileInfoD1Ev(auStack_d8);
  }
  if (*(long *)PTR____stack_chk_guard_10172c568 == local_70) {
    return uVar4;
  }
                    /* WARNING: Subroutine does not return */
  ___stack_chk_fail();
}

