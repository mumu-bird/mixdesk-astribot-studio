
void __ZN5Video3runEv(long param_1)

{
  byte bVar1;
  int iVar2;
  int iVar3;
  byte bVar4;
  long lVar5;
  long lVar6;
  undefined8 *puVar7;
  byte bVar8;
  int iVar9;
  char cVar10;
  byte bVar11;
  int iVar12;
  long lVar13;
  ulong uVar14;
  long *plVar15;
  int *piVar16;
  bool bVar17;
  long lVar18;
  long lVar19;
  ulong uVar20;
  long *plVar21;
  uint *puVar22;
  char *pcVar23;
  int **ppiVar24;
  bool bVar25;
  long lVar26;
  uint uVar27;
  int iVar28;
  char *pcVar29;
  long lVar30;
  undefined8 uVar31;
  long lVar32;
  int *piVar33;
  double *pdVar34;
  long lVar35;
  int **ppiVar36;
  double dVar37;
  double dVar38;
  double dVar39;
  undefined8 uVar40;
  double dVar41;
  undefined8 uVar42;
  ulong uVar43;
  double dVar44;
  double unaff_d10;
  double unaff_d11;
  ulong local_7e0;
  ulong local_7d0;
  int *local_7a8 [3];
  int *local_790 [3];
  int *local_778 [3];
  int *local_760 [3];
  int *local_748 [3];
  int *local_730;
  undefined8 uStack_728;
  undefined8 local_720;
  int *local_710;
  undefined8 uStack_708;
  undefined8 local_700;
  uint local_6f0;
  uint uStack_6ec;
  int iStack_6e8;
  uint uStack_6e4;
  undefined8 local_6e0;
  int *local_6d0;
  uint *puStack_6c8;
  undefined8 local_6c0 [12];
  undefined1 auStack_660 [96];
  undefined1 auStack_600 [152];
  uint local_568;
  undefined4 uStack_564;
  uint *local_560;
  long local_558 [12];
  undefined1 auStack_4f8 [96];
  undefined1 auStack_498 [144];
  undefined1 auStack_408 [8];
  undefined4 local_400;
  undefined4 local_3fc;
  undefined8 local_3f8;
  undefined8 local_3b8;
  char local_3a4 [4];
  double local_3a0;
  double local_398;
  int *local_390;
  int *piStack_388;
  undefined8 local_380;
  int *local_370;
  uint *puStack_368;
  undefined8 local_360;
  int *apiStack_310 [12];
  int *local_2b0;
  undefined8 uStack_2a8;
  undefined8 local_2a0;
  undefined8 local_298;
  undefined8 uStack_290;
  undefined8 local_288;
  undefined8 uStack_280;
  undefined8 local_278;
  undefined8 uStack_270;
  undefined8 local_268;
  double dStack_260;
  int *local_258;
  undefined8 uStack_250;
  undefined8 local_248;
  undefined8 local_240;
  undefined8 uStack_238;
  undefined8 uStack_230;
  undefined8 uStack_228;
  undefined8 local_220;
  undefined8 uStack_218;
  undefined8 uStack_210;
  double local_208;
  long local_200 [5];
  uint local_1d8 [16];
  undefined4 *local_198;
  uint auStack_178 [16];
  undefined4 *local_138;
  long local_118 [6];
  long local_e8 [6];
  long local_b8;
  
  local_b8 = *(long *)PTR____stack_chk_guard_10172c568;
  __ZN2cv12VideoCaptureC1Ev(local_118);
  __ZN2cv12VideoCaptureC1Ev();
  __ZN2cv3MatC1Ev(local_1d8);
  __ZN2cv3MatC1Ev(auStack_178);
  local_7d0 = 0;
  local_7e0 = 0;
  local_200[1] = 0;
  local_200[0] = 0;
  local_200[3] = 0;
  local_200[2] = 0;
  do {
    __ZN9QDateTime15currentDateTimeEv(&local_568);
    lVar13 = __ZNK9QDateTime17toMSecsSinceEpochEv(&local_568);
    __ZN9QDateTimeD1Ev(&local_568);
    __ZN5Video4readEv(param_1);
    if ((*(byte *)(param_1 + 0x19) & 1) != 0) break;
    lVar32 = 0;
    pdVar34 = &local_398;
    plVar15 = local_118;
    bVar25 = true;
    do {
      bVar17 = bVar25;
      local_3a4[lVar32] = *(char *)(param_1 + 0xe0);
      lVar30 = param_1 + 0x30 + lVar32 * 0x58;
      if (((*(byte *)(lVar30 + 0x40) & 1) == 0) &&
         (iVar12 = (**(code **)(*plVar15 + 0x30))(plVar15), iVar12 != 0)) {
        (**(code **)(*plVar15 + 0x38))(plVar15);
      }
      uVar14 = (**(code **)(*plVar15 + 0x30))(plVar15);
      if (((uVar14 & 1) == 0) && (*(long *)(lVar30 + 0x10) != 0)) {
        local_3a4[lVar32] = '\x01';
        *(undefined1 *)(lVar30 + 0x40) = 1;
        FUN_100067d74(&local_568,lVar30);
        (**(code **)(*plVar15 + 0x10))(plVar15,&local_568,0);
        if (local_558[0] < 0) {
          __ZdlPv(CONCAT44(uStack_564,local_568));
        }
        uVar14 = (**(code **)(*plVar15 + 0x30))(plVar15);
        if ((uVar14 & 1) == 0) goto LAB_10074bb2c;
      }
      dVar37 = (double)(**(code **)(*plVar15 + 0x70))(plVar15,5);
      dVar37 = dVar37 * *(double *)(lVar30 + 0x38);
      *pdVar34 = dVar37;
      iVar12 = (**(code **)(*plVar15 + 0x30))(plVar15);
      if (iVar12 != 0) {
        dVar38 = (double)(**(code **)(*plVar15 + 0x70))(plVar15,7);
        lVar35 = (long)dVar38;
        lVar18 = lVar35 * (long)dVar37;
        if (lVar18 - lVar35 == 0 || lVar18 < lVar35) {
          lVar18 = lVar35;
        }
        if (*(long *)(lVar30 + 0x48) == -0x8000000000000000) {
          lVar26 = *(long *)(lVar30 + 0x30);
          dVar37 = (double)(**(code **)(*plVar15 + 0x70))(plVar15,1);
          lVar19 = 0;
          if (lVar18 != 0) {
            lVar19 = lVar26 / lVar18;
          }
          lVar19 = (lVar26 - lVar19 * lVar18) + lVar18;
          lVar26 = 0;
          if (lVar18 != 0) {
            lVar26 = lVar19 / lVar18;
          }
          lVar5 = 0;
          if (lVar18 != 0) {
            lVar5 = ((lVar19 - lVar26 * lVar18) * lVar35) / lVar18;
          }
          *(long *)(lVar30 + 0x48) = (long)((double)lVar5 - dVar37);
        }
        else if (*(long *)(lVar30 + 0x48) == 0x7fffffffffffffff) {
          lVar26 = *(long *)(lVar30 + 0x28);
          dVar37 = (double)(**(code **)(*plVar15 + 0x70))(plVar15,1);
          lVar19 = 0;
          if (lVar18 != 0) {
            lVar19 = lVar26 / lVar18;
          }
          lVar19 = (lVar26 - lVar19 * lVar18) + lVar18;
          lVar26 = 0;
          if (lVar18 != 0) {
            lVar26 = lVar19 / lVar18;
          }
          lVar5 = 0;
          if (lVar18 != 0) {
            lVar5 = ((lVar19 - lVar26 * lVar18) * lVar35) / lVar18;
          }
          *(long *)(lVar30 + 0x48) = (long)((double)lVar5 - dVar37);
          lVar19 = 0;
          if (lVar18 != 0) {
            lVar19 = *(long *)(lVar30 + 0x30) / lVar18;
          }
          lVar19 = (*(long *)(lVar30 + 0x30) - lVar19 * lVar18) + lVar18;
          lVar26 = 0;
          if (lVar18 != 0) {
            lVar26 = lVar19 / lVar18;
          }
          lVar6 = 0;
          if (lVar18 != 0) {
            lVar6 = ((lVar19 - lVar26 * lVar18) * lVar35) / lVar18;
          }
          lVar6 = (lVar35 - (long)((double)lVar5 - dVar37)) + lVar6;
          lVar19 = 0;
          if (lVar35 != 0) {
            lVar19 = lVar6 / lVar35;
          }
          (**(code **)(*plVar15 + 0x68))((double)(lVar6 - lVar19 * lVar35),plVar15,1);
          *(undefined8 *)(lVar30 + 0x30) = 0x8000000000000000;
          local_3a4[lVar32] = '\x01';
        }
        lVar19 = *(long *)(lVar30 + 0x30);
        if (lVar19 != -0x8000000000000000) {
          lVar26 = 0;
          if (lVar18 != 0) {
            lVar26 = lVar19 / lVar18;
          }
          lVar19 = (lVar19 - lVar26 * lVar18) + lVar18;
          lVar26 = 0;
          if (lVar18 != 0) {
            lVar26 = lVar19 / lVar18;
          }
          lVar5 = 0;
          if (lVar18 != 0) {
            lVar5 = ((lVar19 - lVar26 * lVar18) * lVar35) / lVar18;
          }
          lVar19 = (lVar5 + lVar35) - *(long *)(lVar30 + 0x48);
          lVar18 = 0;
          if (lVar35 != 0) {
            lVar18 = lVar19 / lVar35;
          }
          (**(code **)(*plVar15 + 0x68))((double)(lVar19 - lVar18 * lVar35),plVar15,1);
          *(undefined8 *)(lVar30 + 0x30) = 0x8000000000000000;
          local_3a4[lVar32] = '\x01';
        }
      }
      dVar38 = local_398;
      dVar37 = local_3a0;
      pdVar34 = &local_3a0;
      lVar32 = 1;
      plVar15 = local_e8;
      bVar25 = false;
    } while (bVar17);
    *(undefined1 *)(param_1 + 0xe0) = 0;
    local_2b0 = *(int **)(param_1 + 0x30);
    uStack_2a8 = *(undefined8 *)(param_1 + 0x38);
    local_2a0 = *(undefined8 *)(param_1 + 0x40);
    if (local_2b0 != (int *)0x0) {
      LOAcquire();
      *local_2b0 = *local_2b0 + 1;
      LORelease();
    }
    uStack_290 = *(undefined8 *)(param_1 + 0x50);
    local_298 = *(undefined8 *)(param_1 + 0x48);
    uStack_280 = *(undefined8 *)(param_1 + 0x60);
    local_288 = *(undefined8 *)(param_1 + 0x58);
    uVar14 = *(ulong *)(param_1 + 0x70);
    uStack_270 = uVar14;
    uVar14 = uStack_270;
    local_278 = *(undefined8 *)(param_1 + 0x68);
    dStack_260 = *(double *)(param_1 + 0x80);
    local_268 = *(undefined8 *)(param_1 + 0x78);
    local_258 = *(int **)(param_1 + 0x88);
    uStack_250 = *(undefined8 *)(param_1 + 0x90);
    local_248 = *(undefined8 *)(param_1 + 0x98);
    if (local_258 != (int *)0x0) {
      LOAcquire();
      *local_258 = *local_258 + 1;
      LORelease();
    }
    uVar43 = *(ulong *)(param_1 + 200);
    uStack_218 = uVar43;
    uVar43 = uStack_218;
    local_220 = *(undefined8 *)(param_1 + 0xc0);
    local_208 = *(double *)(param_1 + 0xd8);
    uStack_210 = *(undefined8 *)(param_1 + 0xd0);
    uStack_238 = *(undefined8 *)(param_1 + 0xa8);
    local_240 = *(undefined8 *)(param_1 + 0xa0);
    uStack_228 = *(undefined8 *)(param_1 + 0xb8);
    uStack_230 = *(undefined8 *)(param_1 + 0xb0);
    uStack_270._0_1_ = (byte)uVar14;
    bVar11 = (byte)uStack_270;
    uStack_218._0_1_ = (byte)uVar43;
    bVar4 = (byte)uStack_270 & (byte)uStack_218;
    uStack_270 = uVar14;
    uStack_218 = uVar43;
    if ((local_3a4[0] == '\x01') && (local_3a4[1] == '\x01')) {
      unaff_d11 = local_3a0;
      unaff_d10 = local_398;
      if (local_3a0 <= local_398) {
        unaff_d11 = local_398;
        unaff_d10 = local_3a0;
      }
      local_200[1] = 0xffffffffffffffff;
      local_200[0] = -1;
      local_200[3] = 0xffffffffffffffff;
      local_200[2] = 0xffffffffffffffff;
      local_568 = 0x2010000;
      local_558[0] = 0;
      local_560 = local_1d8;
      local_3a4[2] = (**(code **)(local_118[0] + 0x60))(local_118,&local_568);
      local_568 = 0x2010000;
      local_558[0] = 0;
      local_560 = auStack_178;
      local_3a4[3] = (**(code **)(local_e8[0] + 0x60))(local_e8,&local_568);
      local_7d0 = 0;
      local_7e0 = 0;
    }
    else {
      local_7d0 = local_7d0 + 1;
      if ((bVar4 & 1) == 0) {
        if ((uVar14 & 1) == 0) {
          plVar21 = local_200 + 2;
          puVar22 = auStack_178;
          pcVar23 = local_3a4 + 1;
          ppiVar24 = &local_258;
          pcVar29 = local_3a4 + 3;
          dVar39 = local_3a0;
          if ((uVar43 & 1) == 0) goto LAB_10074ae68;
        }
        else {
          plVar15 = local_118;
          plVar21 = local_200;
          puVar22 = local_1d8;
          pcVar23 = local_3a4;
          ppiVar24 = &local_2b0;
          pcVar29 = local_3a4 + 2;
          dVar39 = local_398;
        }
        unaff_d11 = dVar39;
        if (((*(byte *)((long)ppiVar24 + 0x41) & 1) == 0) && (*pcVar23 != '\x01')) {
          if ((*plVar21 != -1) || (plVar21[1] != -1)) {
            *plVar21 = -1;
            plVar21[1] = -1;
          }
        }
        else {
          if ((plVar21[1] == -1) || (*pcVar23 == '\x01')) {
            *plVar21 = 0;
            plVar21[1] = lVar13;
          }
          else {
            *plVar21 = *plVar21 + 1;
          }
          local_568 = 0x2010000;
          local_558[0] = 0;
          local_560 = puVar22;
          cVar10 = (**(code **)(*plVar15 + 0x60))(plVar15,&local_568);
          *pcVar29 = cVar10;
        }
      }
      else {
        unaff_d11 = local_3a0;
        unaff_d10 = local_398;
        if (local_3a0 <= local_398) {
          unaff_d11 = local_398;
          unaff_d10 = local_3a0;
        }
        uStack_270._1_1_ = (byte)(uVar14 >> 8);
        bVar1 = uStack_270._1_1_;
        uStack_218._1_1_ = (byte)(uVar43 >> 8);
        bVar8 = uStack_218._1_1_;
        if (local_3a0 <= local_398) {
          uStack_218._1_1_ = uStack_270._1_1_;
        }
        if (((uStack_218._1_1_ & 1) == 0) && (local_3a4[local_398 < local_3a0] != '\x01')) {
          uVar20 = (ulong)(local_398 < local_3a0);
          lVar32 = 0x18;
          if (local_398 >= local_3a0) {
            lVar32 = 8;
          }
          if ((local_200[uVar20 * 2] != -1) || (*(long *)((long)local_200 + lVar32) != -1)) {
            local_200[uVar20 * 2] = -1;
            *(undefined8 *)((long)local_200 + lVar32) = 0xffffffffffffffff;
          }
          if (unaff_d11 < 1.0) goto LAB_10074acf0;
LAB_10074acd0:
          if ((unaff_d10 * (double)local_7d0) / unaff_d11 <= (double)local_7e0) goto LAB_10074acf0;
        }
        else {
          uVar20 = (ulong)(local_398 < local_3a0);
          lVar32 = 0x18;
          if (local_398 >= local_3a0) {
            lVar32 = 8;
          }
          if ((*(long *)((long)local_200 + lVar32) == -1) ||
             (local_3a4[local_398 < local_3a0] == '\x01')) {
            local_200[uVar20 * 2] = 0;
            *(long *)((long)local_200 + lVar32) = lVar13;
          }
          else {
            local_200[uVar20 * 2] = local_200[uVar20 * 2] + 1;
          }
          local_560 = auStack_178;
          if (local_3a0 <= local_398) {
            local_560 = local_1d8;
          }
          local_568 = 0x2010000;
          local_558[0] = 0;
          lVar32 = 0x30;
          if (local_3a0 <= local_398) {
            lVar32 = 0;
            plVar15 = local_118;
          }
          cVar10 = (**(code **)(*(long *)((long)local_118 + lVar32) + 0x60))(plVar15,&local_568);
          local_3a4[(ulong)(dVar38 < dVar37) + 2] = cVar10;
          if (1.0 <= unaff_d11) goto LAB_10074acd0;
LAB_10074acf0:
          if (local_3a4[dVar37 <= dVar38] != '\x01') goto LAB_10074ae68;
        }
        local_7e0 = local_7e0 + 1;
        if (dVar37 <= dVar38) {
          bVar1 = bVar8;
        }
        if (((bVar1 & 1) == 0) && (local_3a4[dVar37 <= dVar38] != '\x01')) {
          uVar20 = (ulong)(dVar37 <= dVar38);
          lVar32 = 8;
          if (dVar37 <= dVar38) {
            lVar32 = 0x18;
          }
          if ((local_200[uVar20 * 2] != -1) || (*(long *)((long)local_200 + lVar32) != -1)) {
            local_200[uVar20 * 2] = -1;
            *(undefined8 *)((long)local_200 + lVar32) = 0xffffffffffffffff;
          }
        }
        else {
          uVar20 = (ulong)(dVar37 <= dVar38);
          lVar32 = 8;
          if (dVar37 <= dVar38) {
            lVar32 = 0x18;
          }
          if ((*(long *)((long)local_200 + lVar32) == -1) || (local_3a4[dVar37 <= dVar38] == '\x01')
             ) {
            local_200[uVar20 * 2] = 0;
            *(long *)((long)local_200 + lVar32) = lVar13;
          }
          else {
            local_200[uVar20 * 2] = local_200[uVar20 * 2] + 1;
          }
          local_560 = local_1d8;
          if (dVar37 <= dVar38) {
            local_560 = auStack_178;
          }
          local_568 = 0x2010000;
          local_558[0] = 0;
          lVar32 = 0;
          plVar15 = local_118;
          if (dVar37 <= dVar38) {
            lVar32 = 0x30;
            plVar15 = local_e8;
          }
          cVar10 = (**(code **)(*(long *)((long)local_118 + lVar32) + 0x60))(plVar15,&local_568);
          local_3a4[(ulong)(dVar37 <= dVar38) + 2] = cVar10;
        }
      }
    }
LAB_10074ae68:
    if ((local_3a4[2] & 1U) == 0) {
      (**(code **)(local_118[0] + 0x68))(0,local_118,1);
      local_568 = 0x2010000;
      local_558[0] = 0;
      local_560 = local_1d8;
      (**(code **)(local_118[0] + 0x60))(local_118,&local_568);
    }
    if ((local_3a4[3] & 1U) == 0) {
      (**(code **)(local_e8[0] + 0x68))(0,local_e8,1);
      local_568 = 0x2010000;
      local_558[0] = 0;
      local_560 = auStack_178;
      (**(code **)(local_e8[0] + 0x60))(local_e8,&local_568);
    }
    if (*(char *)(*(long *)(*(long *)(param_1 + 0xe8) + 0x20) + 9) < '\0') {
      __ZN2cv3MatC1Ev(auStack_408);
      if ((bVar4 & 1) == 0) {
        if (((uVar14 & 1) != 0) || ((uVar43 & 1) != 0)) {
          puVar22 = local_1d8;
          if (bVar11 == 0) {
            puVar22 = auStack_178;
          }
          __ZN2cv3MataSERKS0_(auStack_408,puVar22);
        }
      }
      else {
        local_390 = (int *)CONCAT44(*local_198,local_198[1]);
        piStack_388 = (int *)CONCAT44(*local_138,local_138[1]);
        __ZN2cv3MatC1Ev(&local_370);
        __ZN2cv3MatC1Ev(apiStack_310);
        puVar22 = local_1d8;
        ppiVar24 = &local_390;
        ppiVar36 = &local_370;
        bVar25 = true;
        do {
          bVar17 = bVar25;
          __ZN2cv3Mat5zerosEiii(&local_568,0x438,0x780,local_1d8[0] & 0xfff);
          (**(code **)(*(long *)CONCAT44(uStack_564,local_568) + 0x18))
                    ((long *)CONCAT44(uStack_564,local_568),&local_568,ppiVar36,0xffffffff);
          __ZN2cv3MatD1Ev(auStack_498);
          __ZN2cv3MatD1Ev(auStack_4f8);
          __ZN2cv3MatD1Ev(local_558);
          iVar12 = *(int *)ppiVar24;
          uVar27 = *(uint *)((long)ppiVar24 + 4);
          if ((int)uVar27 < 0x438) {
            if (iVar12 < 0x780) {
              dVar39 = 1080.0 / (double)(int)uVar27;
              dVar44 = 1920.0 / (double)iVar12;
              if (dVar44 == dVar39) {
                *ppiVar24 = (int *)0x43800000780;
                uVar27 = 0x438;
                piVar16 = (int *)0x43800000780;
                piVar33 = (int *)0x780;
              }
              else if (dVar39 <= dVar44) {
                if (dVar44 <= dVar39) {
                  piVar16 = *ppiVar24;
                  uVar27 = (uint)((ulong)piVar16 >> 0x20);
                  piVar33 = piVar16;
                }
                else {
                  piVar33 = (int *)(ulong)(uint)(int)(dVar39 * (double)iVar12);
                  piVar16 = (int *)((ulong)piVar33 | 0x43800000000);
                  *ppiVar24 = piVar16;
                  uVar27 = 0x438;
                }
              }
              else {
                uVar27 = (uint)(dVar44 * (double)(int)uVar27);
                piVar16 = (int *)((ulong)uVar27 << 0x20 | 0x780);
                *ppiVar24 = piVar16;
                piVar33 = (int *)0x780;
              }
              iVar12 = (int)piVar33;
              local_558[0] = 0;
              local_568 = 0x1010000;
              local_6d0 = (int *)CONCAT44(local_6d0._4_4_,0x2010000);
              local_6c0[0] = 0;
              puStack_6c8 = puVar22;
              local_560 = puVar22;
              __ZN2cv6resizeERKNS_11_InputArrayERKNS_12_OutputArrayENS_5Size_IiEEddi
                        (0,0,&local_568,&local_6d0,piVar16,1);
              if (0x437 < (int)uVar27) goto LAB_10074b100;
            }
            uStack_6ec = 0x438 - uVar27 >> 1;
            local_6f0 = 0;
            iStack_6e8 = 0x780;
            uStack_6e4 = uVar27;
            __ZN2cv3MatC1ERKS0_RKNS_5Rect_IiEE(&local_568,ppiVar36,&local_6f0);
            local_6d0 = (int *)CONCAT44(local_6d0._4_4_,0xc2010000);
            local_6c0[0] = 0;
            puStack_6c8 = &local_568;
            __ZNK2cv3Mat6copyToERKNS_12_OutputArrayE(puVar22,&local_6d0);
LAB_10074af58:
            __ZN2cv3MatD1Ev(&local_568);
          }
          else {
LAB_10074b100:
            if (iVar12 < 0x780) {
              local_6f0 = 0x780U - iVar12 >> 1;
              uStack_6ec = 0;
              uStack_6e4 = 0x438;
              iStack_6e8 = iVar12;
              __ZN2cv3MatC1ERKS0_RKNS_5Rect_IiEE(&local_568,ppiVar36,&local_6f0);
              local_6d0 = (int *)CONCAT44(local_6d0._4_4_,0xc2010000);
              local_6c0[0] = 0;
              puStack_6c8 = &local_568;
              __ZNK2cv3Mat6copyToERKNS_12_OutputArrayE(puVar22,&local_6d0);
              goto LAB_10074af58;
            }
            __ZN2cv3MataSERKS0_(ppiVar36,puVar22);
          }
          puVar22 = auStack_178;
          ppiVar24 = &piStack_388;
          ppiVar36 = apiStack_310;
          bVar25 = false;
        } while (bVar17);
        if (local_208 <= dStack_260) {
          __ZN2cvmlEdRKNS_3MatE(&local_6d0,local_208 + local_208,apiStack_310);
          __ZN2cvplERKNS_3MatERKNS_7MatExprE(&local_568,&local_370,&local_6d0);
          (**(code **)(*(long *)CONCAT44(uStack_564,local_568) + 0x18))
                    ((long *)CONCAT44(uStack_564,local_568),&local_568,auStack_408,0xffffffff);
        }
        else {
          __ZN2cvmlEdRKNS_3MatE(&local_6d0,dStack_260 + dStack_260,&local_370);
          __ZN2cvplERKNS_3MatERKNS_7MatExprE(&local_568,apiStack_310,&local_6d0);
          (**(code **)(*(long *)CONCAT44(uStack_564,local_568) + 0x18))
                    ((long *)CONCAT44(uStack_564,local_568),&local_568,auStack_408,0xffffffff);
        }
        __ZN2cv3MatD1Ev(auStack_498);
        __ZN2cv3MatD1Ev(auStack_4f8);
        __ZN2cv3MatD1Ev(local_558);
        __ZN2cv3MatD1Ev(auStack_600);
        __ZN2cv3MatD1Ev(auStack_660);
        __ZN2cv3MatD1Ev(local_6c0);
        __ZN2cv3MatD1Ev(apiStack_310);
        __ZN2cv3MatD1Ev(&local_370);
      }
      uVar14 = __ZNK2cv3Mat5emptyEv(auStack_408);
      if ((uVar14 & 1) == 0) {
        __ZN6QImageC1EPhiixNS_6FormatEPFvPvES2_
                  (&local_568,local_3f8,local_3fc,local_400,local_3b8,0x1d,0,0);
        uVar31 = *(undefined8 *)(param_1 + 0xf0);
        __ZN7QPixmap9fromImageERK6QImage6QFlagsIN2Qt19ImageConversionFlagEE(&local_370,&local_568,0)
        ;
        lVar32 = *(long *)(*(long *)(param_1 + 0xf0) + 0x20);
        uVar40 = *(undefined8 *)(lVar32 + 0x1c);
        uVar42 = *(undefined8 *)(lVar32 + 0x14);
        local_390 = (int *)CONCAT44(((int)((ulong)uVar40 >> 0x20) - (int)((ulong)uVar42 >> 0x20)) +
                                    1,((int)uVar40 - (int)uVar42) + 1);
        __ZNK7QPixmap6scaledERK5QSizeN2Qt15AspectRatioModeENS3_18TransformationModeE
                  (&local_6d0,&local_370,&local_390,1,0);
        __ZN6QLabel9setPixmapERK7QPixmap(uVar31,&local_6d0);
        __ZN7QPixmapD1Ev(&local_6d0);
        __ZN7QPixmapD1Ev(&local_370);
        __ZN6QImageD1Ev(&local_568);
      }
      uVar31 = __ZNK7QWidget12isFullScreenEv(*(undefined8 *)(param_1 + 0xe8));
      bVar11 = *(byte *)(param_1 + 0x18);
      if ((uint)bVar11 != (uint)uVar31) {
        *(char *)(param_1 + 0x18) = (char)uVar31;
        uVar40 = *(undefined8 *)(param_1 + 0x10);
        __ZN7QString6numberEii(&local_370,uVar31,10);
        __ZN7QString8fromUtf8E14QByteArrayView(&local_6d0,0xb,"fullscreen ");
        __ZN7QString6appendERKS_(&local_6d0,&local_370);
        FUN_100067d74(&local_568,&local_6d0);
        puVar22 = (uint *)CONCAT44(uStack_564,local_568);
        if (-1 < local_558[0]) {
          puVar22 = &local_568;
        }
        __ZN9QIODevice5writeEPKc(uVar40,puVar22);
        if (local_558[0] < 0) {
          __ZdlPv(CONCAT44(uStack_564,local_568));
        }
        if (local_6d0 != (int *)0x0) {
          LOAcquire();
          iVar12 = *local_6d0;
          *local_6d0 = iVar12 + -1;
          LORelease();
          if (iVar12 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_6d0,2,8);
          }
        }
        if (local_370 != (int *)0x0) {
          LOAcquire();
          iVar12 = *local_370;
          *local_370 = iVar12 + -1;
          LORelease();
          if (iVar12 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_370,2,8);
          }
        }
        __ZN9QIODevice5writeEPKc(*(undefined8 *)(param_1 + 0x10),"\n");
        __ZN12QLocalSocket5flushEv(*(undefined8 *)(param_1 + 0x10));
        bVar11 = *(byte *)(param_1 + 0x18);
      }
      if ((bVar11 & 1) == 0) {
        lVar32 = *(long *)(*(long *)(param_1 + 0xe8) + 0x20);
        iVar12 = *(int *)(lVar32 + 0x14);
        iVar2 = *(int *)(lVar32 + 0x18);
        iVar28 = *(int *)(lVar32 + 0x1c);
        iVar3 = *(int *)(lVar32 + 0x20);
        if ((((*(int *)(param_1 + 0x1c) != iVar12) || (*(int *)(param_1 + 0x24) != iVar28)) ||
            (*(int *)(param_1 + 0x20) != iVar2)) || (*(int *)(param_1 + 0x28) != iVar3)) {
          *(int *)(param_1 + 0x1c) = iVar12;
          *(int *)(param_1 + 0x20) = iVar2;
          *(int *)(param_1 + 0x24) = iVar28;
          *(int *)(param_1 + 0x28) = iVar3;
          uVar31 = *(undefined8 *)(param_1 + 0x10);
          __ZN7QString6numberEii(local_760,iVar12,10);
          __ZN7QString8fromUtf8E14QByteArrayView(local_748,5,"rect ");
          __ZN7QString6appendERKS_(local_748,local_760);
          FUN_100014ba4(&local_730,local_748," ");
          __ZN7QString6numberEii(local_778,iVar2,10);
          uStack_708 = uStack_728;
          local_710 = local_730;
          local_700 = local_720;
          iVar9 = 0;
          if (local_730 != (int *)0x0) {
            LOAcquire();
            iVar9 = *local_730;
            *local_730 = iVar9 + 1;
            LORelease();
          }
          __ZN7QString6appendERKS_(iVar9,&local_710,local_778);
          FUN_100014ba4(&local_6f0,&local_710," ");
          __ZN7QString6numberEii(local_790,(iVar28 - iVar12) + 1,10);
          piStack_388 = (int *)CONCAT44(uStack_6e4,iStack_6e8);
          local_390 = (int *)CONCAT44(uStack_6ec,local_6f0);
          local_380 = local_6e0;
          uVar40 = 0;
          if (local_390 != (int *)0x0) {
            LOAcquire();
            iVar12 = *local_390;
            *local_390 = iVar12 + 1;
            uVar40 = CONCAT44(uStack_6ec,iVar12);
            LORelease();
          }
          __ZN7QString6appendERKS_(uVar40,&local_390,local_790);
          FUN_100014ba4(&local_370,&local_390," ");
          __ZN7QString6numberEii(local_7a8,(iVar3 - iVar2) + 1,10);
          puStack_6c8 = puStack_368;
          local_6d0 = local_370;
          local_6c0[0] = local_360;
          iVar12 = 0;
          if (local_370 != (int *)0x0) {
            LOAcquire();
            iVar12 = *local_370;
            *local_370 = iVar12 + 1;
            LORelease();
          }
          __ZN7QString6appendERKS_(iVar12,&local_6d0,local_7a8);
          FUN_100067d74(&local_568,&local_6d0);
          puVar22 = (uint *)CONCAT44(uStack_564,local_568);
          if (-1 < local_558[0]) {
            puVar22 = &local_568;
          }
          __ZN9QIODevice5writeEPKc(uVar31,puVar22);
          if (local_558[0] < 0) {
            __ZdlPv(CONCAT44(uStack_564,local_568));
          }
          if (local_6d0 != (int *)0x0) {
            LOAcquire();
            iVar12 = *local_6d0;
            *local_6d0 = iVar12 + -1;
            LORelease();
            if (iVar12 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_6d0,2,8);
            }
          }
          if (local_7a8[0] != (int *)0x0) {
            LOAcquire();
            iVar12 = *local_7a8[0];
            *local_7a8[0] = iVar12 + -1;
            LORelease();
            if (iVar12 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_7a8[0],2,8);
            }
          }
          if (local_370 != (int *)0x0) {
            LOAcquire();
            iVar12 = *local_370;
            *local_370 = iVar12 + -1;
            LORelease();
            if (iVar12 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_370,2,8);
            }
          }
          if (local_390 != (int *)0x0) {
            LOAcquire();
            iVar12 = *local_390;
            *local_390 = iVar12 + -1;
            LORelease();
            if (iVar12 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_390,2,8);
            }
          }
          if (local_790[0] != (int *)0x0) {
            LOAcquire();
            iVar12 = *local_790[0];
            *local_790[0] = iVar12 + -1;
            LORelease();
            if (iVar12 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_790[0],2,8);
            }
          }
          piVar33 = (int *)CONCAT44(uStack_6ec,local_6f0);
          if (piVar33 != (int *)0x0) {
            LOAcquire();
            iVar12 = *piVar33;
            *piVar33 = iVar12 + -1;
            LORelease();
            if (iVar12 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(CONCAT44(uStack_6ec,local_6f0),2,8);
            }
          }
          if (local_710 != (int *)0x0) {
            LOAcquire();
            iVar12 = *local_710;
            *local_710 = iVar12 + -1;
            LORelease();
            if (iVar12 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_710,2,8);
            }
          }
          if (local_778[0] != (int *)0x0) {
            LOAcquire();
            iVar12 = *local_778[0];
            *local_778[0] = iVar12 + -1;
            LORelease();
            if (iVar12 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_778[0],2,8);
            }
          }
          if (local_730 != (int *)0x0) {
            LOAcquire();
            iVar12 = *local_730;
            *local_730 = iVar12 + -1;
            LORelease();
            if (iVar12 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_730,2,8);
            }
          }
          if (local_748[0] != (int *)0x0) {
            LOAcquire();
            iVar12 = *local_748[0];
            *local_748[0] = iVar12 + -1;
            LORelease();
            if (iVar12 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_748[0],2,8);
            }
          }
          if (local_760[0] != (int *)0x0) {
            LOAcquire();
            iVar12 = *local_760[0];
            *local_760[0] = iVar12 + -1;
            LORelease();
            if (iVar12 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_760[0],2,8);
            }
          }
          __ZN9QIODevice5writeEPKc(*(undefined8 *)(param_1 + 0x10),"\n");
          __ZN12QLocalSocket5flushEv(*(undefined8 *)(param_1 + 0x10));
        }
      }
      __ZN2cv3MatD1Ev(auStack_408);
      dVar39 = 1000.0 / unaff_d11;
      if (unaff_d11 < 1.0) {
        dVar39 = 1000.0;
      }
      dVar44 = 1000.0;
      if (1.0 <= unaff_d10) {
        dVar44 = 1000.0 / unaff_d10;
      }
      __ZN9QDateTime15currentDateTimeEv(&local_568);
      lVar30 = __ZNK9QDateTime17toMSecsSinceEpochEv(&local_568);
      __ZN9QDateTimeD1Ev(&local_568);
      lVar32 = 0x99;
      if (dVar37 <= dVar38) {
        lVar32 = 0x41;
      }
      if (*(char *)((long)&local_2b0 + lVar32) == '\x01') {
        plVar15 = local_200 + 3;
        if (dVar37 <= dVar38) {
          plVar15 = (long *)((ulong)local_200 | 8);
        }
        if (*plVar15 == -1) goto LAB_10074b820;
        plVar21 = local_200 + 2;
        if (dVar37 <= dVar38) {
          plVar21 = local_200;
        }
        dVar41 = (double)*plVar15 + (double)(*plVar21 + 1) * dVar39;
      }
      else {
LAB_10074b820:
        puVar7 = &uStack_270;
        if (dVar37 <= dVar38) {
          puVar7 = &uStack_218;
        }
        if ((*(byte *)((long)puVar7 + 1) & 1) != 0) {
          plVar15 = (long *)((ulong)local_200 | 8);
          if (dVar37 <= dVar38) {
            plVar15 = local_200 + 3;
          }
          if (*plVar15 != -1) {
            plVar21 = local_200;
            if (dVar37 <= dVar38) {
              plVar21 = local_200 + 2;
            }
            dVar41 = (double)*plVar15 + (double)(*plVar21 + 1) * dVar44;
            goto LAB_10074b888;
          }
        }
        dVar41 = dVar39 + (double)lVar13;
      }
LAB_10074b888:
      iVar12 = (int)(dVar41 - (double)lVar30);
      if ((iVar12 < -(int)dVar39) && (999 < -((int)unaff_d11 * iVar12))) {
        iVar28 = -((int)unaff_d11 * iVar12) / 1000;
        uVar14 = (ulong)(dVar38 < dVar37);
        lVar13 = 0x30;
        plVar15 = local_e8;
        if (dVar38 >= dVar37) {
          lVar13 = 0;
          plVar15 = local_118;
        }
        local_7d0 = local_7d0 + (iVar28 - 1) + 1;
        do {
          if (*(char *)((long)&local_2b0 + lVar32) == '\x01') {
            local_200[uVar14 * 2] = local_200[uVar14 * 2] + 1;
            bVar11 = (**(code **)(*(long *)((long)local_118 + lVar13) + 0x40))(plVar15);
            local_3a4[uVar14 + 2] = bVar11;
            if ((bVar11 & 1) == 0) {
              (**(code **)(*(long *)((long)local_118 + lVar13) + 0x68))(0,plVar15,1);
              (**(code **)(*(long *)((long)local_118 + lVar13) + 0x40))(plVar15);
            }
          }
          iVar28 = iVar28 + -1;
        } while (iVar28 != 0);
      }
      bVar4 = bVar4 ^ 1;
      if (unaff_d11 < 1.0) {
        bVar4 = 1;
      }
      if ((((bVar4 & 1) == 0) && ((double)local_7e0 < (unaff_d10 * (double)local_7d0) / unaff_d11))
         && ((iVar12 < -(int)dVar44 && (999 < -((int)unaff_d10 * iVar12))))) {
        iVar28 = -((int)unaff_d10 * iVar12) / 1000;
        bVar25 = dVar37 <= dVar38;
        uVar14 = (ulong)bVar25;
        lVar13 = 0;
        plVar15 = local_118;
        if (bVar25) {
          lVar13 = 0x30;
          plVar15 = local_e8;
        }
        local_7e0 = local_7e0 + (iVar28 - 1) + 1;
        puVar7 = &uStack_270;
        if (bVar25) {
          puVar7 = &uStack_218;
        }
        bVar4 = *(byte *)((long)puVar7 + 1);
        do {
          if ((bVar4 & 1) != 0) {
            local_200[uVar14 * 2] = local_200[uVar14 * 2] + 1;
            bVar11 = (**(code **)(*(long *)((long)local_118 + lVar13) + 0x40))(plVar15);
            local_3a4[uVar14 + 2] = bVar11;
            if ((bVar11 & 1) == 0) {
              (**(code **)(*(long *)((long)local_118 + lVar13) + 0x68))(0,plVar15,1);
              (**(code **)(*(long *)((long)local_118 + lVar13) + 0x40))(plVar15);
            }
          }
          iVar28 = iVar28 + -1;
        } while (iVar28 != 0);
      }
      if (iVar12 < 2) {
        iVar12 = 1;
      }
      iVar12 = __ZN2cv7waitKeyEi(iVar12);
      if (iVar12 == 0x1b) goto LAB_10074babc;
      __ZN16QCoreApplication13processEventsE6QFlagsIN10QEventLoop17ProcessEventsFlagEE(0);
      bVar25 = true;
    }
    else {
LAB_10074babc:
      bVar25 = false;
    }
    if (local_258 != (int *)0x0) {
      LOAcquire();
      iVar12 = *local_258;
      *local_258 = iVar12 + -1;
      LORelease();
      if (iVar12 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_258,2,8);
      }
    }
    if (local_2b0 != (int *)0x0) {
      LOAcquire();
      iVar12 = *local_2b0;
      *local_2b0 = iVar12 + -1;
      LORelease();
      if (iVar12 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_2b0,2,8);
      }
    }
  } while (bVar25);
LAB_10074bb2c:
  __ZN2cv3MatD1Ev(auStack_178);
  __ZN2cv3MatD1Ev(local_1d8);
  __ZN2cv12VideoCaptureD1Ev(local_e8);
  __ZN2cv12VideoCaptureD1Ev(local_118);
  if (*(long *)PTR____stack_chk_guard_10172c568 != local_b8) {
                    /* WARNING: Subroutine does not return */
    ___stack_chk_fail();
  }
  return;
}

