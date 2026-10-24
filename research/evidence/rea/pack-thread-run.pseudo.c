
/* WARNING: Removing unreachable block (ram,0x0001006d3720) */
/* WARNING: Removing unreachable block (ram,0x0001006d368c) */
/* WARNING: Removing unreachable block (ram,0x0001006d36a0) */
/* WARNING: Removing unreachable block (ram,0x0001006d3734) */

void __ZN2dj10PackThread3runEv(long param_1)

{
  undefined *puVar1;
  long *plVar2;
  code *pcVar3;
  bool bVar4;
  int iVar5;
  int iVar6;
  ulong uVar7;
  undefined8 uVar8;
  uint uVar9;
  int *piVar10;
  long lVar11;
  long lVar12;
  undefined8 uVar13;
  long *plVar14;
  long *plVar15;
  ulong uVar16;
  undefined8 *puVar17;
  long lVar18;
  ulong uVar19;
  long lVar20;
  undefined8 *puVar21;
  int iVar22;
  long local_2e0;
  long local_2d8;
  long local_2b8;
  long local_2b0;
  long local_2a8;
  long *local_2a0;
  undefined8 uStack_298;
  undefined8 local_290;
  int *local_288 [3];
  int *local_270;
  undefined8 uStack_268;
  undefined8 local_260;
  int *local_250;
  undefined8 uStack_248;
  undefined8 local_240;
  int *local_230;
  undefined8 uStack_228;
  undefined8 local_220;
  long *local_210;
  long *plStack_208;
  ulong local_200;
  int *local_1f0;
  undefined8 uStack_1e8;
  undefined8 local_1e0;
  int *local_1d0;
  undefined8 uStack_1c8;
  undefined8 local_1c0;
  long *local_1b0;
  undefined8 uStack_1a8;
  long local_1a0;
  long *local_190;
  long *plStack_188;
  ulong local_180;
  long *plStack_178;
  long *local_170;
  undefined8 local_168;
  long local_160;
  int *local_158 [3];
  long *local_140;
  long *plStack_138;
  ulong local_130;
  long *local_120;
  long *plStack_118;
  ulong local_110;
  long *local_100;
  long *plStack_f8;
  ulong local_f0;
  long *local_e0;
  long *plStack_d8;
  ulong local_d0;
  undefined1 auStack_c8 [8];
  long *local_c0;
  long *plStack_b8;
  ulong local_b0;
  int *local_a8;
  undefined8 *local_a0;
  long local_98;
  int *local_90;
  int *local_88 [3];
  
  local_90 = (int *)0x0;
  local_88[0] = (int *)0x0;
  local_a8 = (int *)0x0;
  local_a0 = (undefined8 *)0x0;
  local_98 = 0;
  puVar17 = (undefined8 *)(param_1 + 0x218);
  if (0 < *(long *)(param_1 + 0x228)) {
    local_2e0 = 0;
    local_2d8 = 0;
LAB_1006d1bb8:
    lVar20 = 0;
    do {
      piVar10 = (int *)*puVar17;
      if ((piVar10 == (int *)0x0) || (1 < *piVar10)) {
        FUN_1000a71b8(puVar17,0,0,0);
        piVar10 = (int *)*puVar17;
        if (piVar10 != (int *)0x0) goto LAB_1006d1bfc;
LAB_1006d1c08:
        FUN_1000a71b8(puVar17,0,0,0);
      }
      else {
LAB_1006d1bfc:
        if (1 < *piVar10) goto LAB_1006d1c08;
      }
      if (*(long *)(*(long *)(param_1 + 0x220) + local_2d8 * 0x18 + 0x10) <= lVar20)
      goto LAB_1006d1b9c;
      piVar10 = (int *)*puVar17;
      if ((piVar10 == (int *)0x0) || (1 < *piVar10)) {
        FUN_1000a71b8(puVar17,0,0,0);
        piVar10 = (int *)*puVar17;
        if (piVar10 != (int *)0x0) goto LAB_1006d1c74;
LAB_1006d1c80:
        FUN_1000a71b8(puVar17,0,0,0);
      }
      else {
LAB_1006d1c74:
        if (1 < *piVar10) goto LAB_1006d1c80;
      }
      puVar21 = (undefined8 *)(*(long *)(param_1 + 0x220) + local_2d8 * 0x18);
      piVar10 = (int *)*puVar21;
      if ((piVar10 == (int *)0x0) || (1 < *piVar10)) {
        FUN_1000a8074(puVar21,0,0,0);
        piVar10 = (int *)*puVar21;
        if (piVar10 != (int *)0x0) goto LAB_1006d1cd4;
LAB_1006d1ce0:
        FUN_1000a8074(puVar21,0,0,0);
      }
      else {
LAB_1006d1cd4:
        if (1 < *piVar10) goto LAB_1006d1ce0;
      }
      lVar11 = puVar21[1] + lVar20 * 0xd0;
      plStack_b8 = *(long **)(lVar11 + 0x80);
      local_c0 = *(long **)(lVar11 + 0x78);
      local_b0 = *(long *)(lVar11 + 0x88);
      if (local_c0 != (long *)0x0) {
        LOAcquire();
        *(int *)local_c0 = (int)*local_c0 + 1;
        LORelease();
      }
      if (local_b0 != 0) {
        __ZN9QFileInfoC1ERK7QString(auStack_c8,&local_c0);
        piVar10 = local_88[0];
        uVar16 = local_b0;
        plVar14 = plStack_b8;
        if ((local_88[0] == (int *)0x0) || (*(long *)(local_88[0] + 2) == 0)) {
LAB_1006d2028:
          local_e0 = (long *)0x0;
          plStack_d8 = (long *)0x0;
          iVar5 = 1;
          local_d0 = 0;
          while( true ) {
            __ZNK9QFileInfo8baseNameEv(&local_140,auStack_c8);
            plStack_118 = plStack_138;
            local_120 = local_140;
            local_110 = local_130;
            iVar6 = 0;
            if (local_140 != (long *)0x0) {
              LOAcquire();
              iVar6 = (int)*local_140;
              *(int *)local_140 = iVar6 + 1;
              LORelease();
            }
            __ZN7QString6appendERKS_(iVar6,&local_120,&local_e0);
            FUN_100014ba4(&local_100,&local_120,".");
            __ZNK9QFileInfo6suffixEv(local_158,auStack_c8);
            plStack_188 = plStack_f8;
            local_190 = local_100;
            local_180 = local_f0;
            iVar6 = 0;
            if (local_100 != (long *)0x0) {
              LOAcquire();
              iVar6 = (int)*local_100;
              *(int *)local_100 = iVar6 + 1;
              LORelease();
            }
            __ZN7QString6appendERKS_(iVar6,&local_190,local_158);
            piVar10 = local_90;
            uVar16 = local_180;
            plVar14 = plStack_188;
            if ((local_90 == (int *)0x0) || (*(long *)(local_90 + 2) == 0)) {
              bVar4 = false;
            }
            else {
              uVar7 = __Z5qHash11QStringViewm(local_180,plStack_188,*(undefined8 *)(local_90 + 6));
              lVar18 = *(long *)(piVar10 + 4);
              lVar11 = *(long *)(piVar10 + 8);
              uVar7 = lVar18 - 1U & uVar7;
              while( true ) {
                uVar19 = uVar7;
                uVar9 = (uint)*(byte *)(lVar11 + (uVar19 >> 7) * 0x90 + (uVar19 & 0x7f));
                if ((uVar9 == 0xff) ||
                   ((lVar12 = *(long *)(lVar11 + (uVar19 >> 7) * 0x90 + 0x80) + (ulong)uVar9 * 0x18,
                    *(ulong *)(lVar12 + 0x10) == uVar16 &&
                    (iVar6 = __ZN9QtPrivate14compareStringsE11QStringViewS0_N2Qt15CaseSensitivityE
                                       (uVar16,*(undefined8 *)(lVar12 + 8),uVar16,plVar14,1),
                    iVar6 == 0)))) break;
                uVar7 = 0;
                if (uVar19 + 1 != lVar18) {
                  uVar7 = uVar19 + 1;
                }
              }
              lVar11 = lVar11 + (uVar19 >> 7) * 0x90;
              if (*(char *)(lVar11 + (uVar19 & 0x7f)) == -1) {
                bVar4 = false;
              }
              else {
                bVar4 = *(long *)(lVar11 + 0x80) != 0;
              }
            }
            if (local_190 != (long *)0x0) {
              LOAcquire();
              lVar11 = *local_190;
              *(int *)local_190 = (int)lVar11 + -1;
              LORelease();
              if ((int)lVar11 == 1) {
                __ZN10QArrayData10deallocateEPS_xx(local_190,2,8);
              }
            }
            if (local_158[0] != (int *)0x0) {
              LOAcquire();
              iVar6 = *local_158[0];
              *local_158[0] = iVar6 + -1;
              LORelease();
              if (iVar6 == 1) {
                __ZN10QArrayData10deallocateEPS_xx(local_158[0],2,8);
              }
            }
            if (local_100 != (long *)0x0) {
              LOAcquire();
              lVar11 = *local_100;
              *(int *)local_100 = (int)lVar11 + -1;
              LORelease();
              if ((int)lVar11 == 1) {
                __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
              }
            }
            if (local_120 != (long *)0x0) {
              LOAcquire();
              lVar11 = *local_120;
              *(int *)local_120 = (int)lVar11 + -1;
              LORelease();
              if ((int)lVar11 == 1) {
                __ZN10QArrayData10deallocateEPS_xx(local_120,2,8);
              }
            }
            if (local_140 != (long *)0x0) {
              LOAcquire();
              lVar11 = *local_140;
              *(int *)local_140 = (int)lVar11 + -1;
              LORelease();
              if ((int)lVar11 == 1) {
                __ZN10QArrayData10deallocateEPS_xx(local_140,2,8);
              }
            }
            if (!bVar4) break;
            __ZN7QString6numberEii(&local_100,iVar5,10);
            __ZN7QString8fromUtf8E14QByteArrayView(&local_190,1,"_");
            __ZN7QString6appendERKS_(&local_190,&local_100);
            __ZN7QStringaSERKS_(&local_e0,&local_190);
            if (local_190 != (long *)0x0) {
              LOAcquire();
              lVar11 = *local_190;
              *(int *)local_190 = (int)lVar11 + -1;
              LORelease();
              if ((int)lVar11 == 1) {
                __ZN10QArrayData10deallocateEPS_xx(local_190,2,8);
              }
            }
            if (local_100 != (long *)0x0) {
              LOAcquire();
              lVar11 = *local_100;
              *(int *)local_100 = (int)lVar11 + -1;
              LORelease();
              if ((int)lVar11 == 1) {
                __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
              }
            }
            iVar5 = iVar5 + 1;
          }
          __ZNK9QFileInfo8baseNameEv(&local_140,auStack_c8);
          plStack_118 = plStack_138;
          local_120 = local_140;
          local_110 = local_130;
          iVar5 = 0;
          if (local_140 != (long *)0x0) {
            LOAcquire();
            iVar5 = (int)*local_140;
            *(int *)local_140 = iVar5 + 1;
            LORelease();
          }
          __ZN7QString6appendERKS_(iVar5,&local_120,&local_e0);
          FUN_100014ba4(&local_190,&local_120,".");
          __ZNK9QFileInfo6suffixEv(local_158,auStack_c8);
          plStack_f8 = plStack_188;
          local_100 = local_190;
          local_f0 = local_180;
          iVar5 = 0;
          if (local_190 != (long *)0x0) {
            LOAcquire();
            iVar5 = (int)*local_190;
            *(int *)local_190 = iVar5 + 1;
            LORelease();
          }
          __ZN7QString6appendERKS_(iVar5,&local_100,local_158);
          if (local_158[0] != (int *)0x0) {
            LOAcquire();
            iVar5 = *local_158[0];
            *local_158[0] = iVar5 + -1;
            LORelease();
            if (iVar5 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_158[0],2,8);
            }
          }
          if (local_190 != (long *)0x0) {
            LOAcquire();
            lVar11 = *local_190;
            *(int *)local_190 = (int)lVar11 + -1;
            LORelease();
            if ((int)lVar11 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_190,2,8);
            }
          }
          if (local_120 != (long *)0x0) {
            LOAcquire();
            lVar11 = *local_120;
            *(int *)local_120 = (int)lVar11 + -1;
            LORelease();
            if ((int)lVar11 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_120,2,8);
            }
          }
          if (local_140 != (long *)0x0) {
            LOAcquire();
            lVar11 = *local_140;
            *(int *)local_140 = (int)lVar11 + -1;
            LORelease();
            if ((int)lVar11 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_140,2,8);
            }
          }
          plStack_188 = plStack_f8;
          local_190 = local_100;
          local_180 = local_f0;
          iVar5 = 0;
          if (local_100 != (long *)0x0) {
            LOAcquire();
            iVar5 = (int)*local_100;
            *(int *)local_100 = iVar5 + 1;
            LORelease();
          }
          FUN_1000f3170(iVar5,&local_90,&local_190,&local_120);
          if (local_190 != (long *)0x0) {
            LOAcquire();
            lVar11 = *local_190;
            *(int *)local_190 = (int)lVar11 + -1;
            LORelease();
            if ((int)lVar11 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_190,2,8);
            }
          }
          plStack_188 = plStack_b8;
          local_190 = local_c0;
          local_180 = local_b0;
          iVar5 = 0;
          if (local_c0 != (long *)0x0) {
            LOAcquire();
            iVar5 = (int)*local_c0;
            *(int *)local_c0 = iVar5 + 1;
            LORelease();
          }
          FUN_1000f3170(iVar5,local_88,&local_190,&local_120);
          if (local_190 != (long *)0x0) {
            LOAcquire();
            lVar11 = *local_190;
            *(int *)local_190 = (int)lVar11 + -1;
            LORelease();
            if ((int)lVar11 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_190,2,8);
            }
          }
          plStack_178 = (long *)0x0;
          local_180 = 0;
          local_168 = 0;
          local_170 = (long *)0x0;
          plStack_188 = (long *)0x0;
          local_190 = (long *)0x0;
          uStack_1a8 = plStack_b8;
          local_1b0 = local_c0;
          local_1a0 = local_b0;
          if (local_c0 != (long *)0x0) {
            LOAcquire();
            *(int *)local_c0 = (int)*local_c0 + 1;
            LORelease();
          }
          __ZN2dj21toUniversalSeparatorsE7QString(&local_120,&local_1b0);
          uVar16 = local_180;
          plVar15 = plStack_188;
          plVar14 = local_190;
          plStack_188 = plStack_118;
          local_190 = local_120;
          plStack_118 = plVar15;
          local_120 = plVar14;
          local_180 = local_110;
          local_110 = uVar16;
          if (plVar14 != (long *)0x0) {
            LOAcquire();
            lVar11 = *plVar14;
            *(int *)plVar14 = (int)lVar11 + -1;
            LORelease();
            if ((int)lVar11 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(plVar14,2,8);
            }
          }
          if (local_1b0 != (long *)0x0) {
            LOAcquire();
            lVar11 = *local_1b0;
            *(int *)local_1b0 = (int)lVar11 + -1;
            LORelease();
            if ((int)lVar11 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_1b0,2,8);
            }
          }
          uStack_1c8 = *(undefined8 *)(param_1 + 0x30);
          local_1d0 = *(int **)(param_1 + 0x28);
          local_1c0 = *(undefined8 *)(param_1 + 0x38);
          uVar13 = 0;
          if (local_1d0 != (int *)0x0) {
            LOAcquire();
            iVar5 = *local_1d0;
            *local_1d0 = iVar5 + 1;
            uVar13 = CONCAT44((int)((ulong)local_1d0 >> 0x20),iVar5);
            LORelease();
          }
          __ZN7QString6appendERKS_(uVar13,&local_1d0,&local_100);
          __ZN2dj21toUniversalSeparatorsE7QString(&local_120,&local_1d0);
          uVar16 = local_168;
          plVar15 = local_170;
          plVar14 = plStack_178;
          local_170 = plStack_118;
          plStack_178 = local_120;
          plStack_118 = plVar15;
          local_120 = plVar14;
          local_168 = local_110;
          local_110 = uVar16;
          if (plVar14 != (long *)0x0) {
            LOAcquire();
            lVar11 = *plVar14;
            *(int *)plVar14 = (int)lVar11 + -1;
            LORelease();
            if ((int)lVar11 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(plVar14,2,8);
            }
          }
          if (local_1d0 != (int *)0x0) {
            LOAcquire();
            iVar5 = *local_1d0;
            *local_1d0 = iVar5 + -1;
            LORelease();
            if (iVar5 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_1d0,2,8);
            }
          }
          lVar11 = __ZNK9QFileInfo4sizeEv(auStack_c8);
          local_160 = lVar11;
          if (((local_180 != local_168) ||
              (iVar5 = __ZN9QtPrivate14compareStringsE11QStringViewS0_N2Qt15CaseSensitivityE
                                 (local_180,plStack_188,local_180,local_170,1), iVar5 != 0)) &&
             ((FUN_1006d4a44(&local_a8,local_98,&local_190), local_a8 == (int *)0x0 ||
              (1 < *local_a8)))) {
            FUN_1006d4690(&local_a8,0,0,0);
          }
          piVar10 = (int *)*puVar17;
          if ((piVar10 == (int *)0x0) || (1 < *piVar10)) {
            FUN_1000a71b8(puVar17,0,0,0);
            piVar10 = (int *)*puVar17;
            if (piVar10 != (int *)0x0) goto LAB_1006d2668;
LAB_1006d2674:
            FUN_1000a71b8(puVar17,0,0,0);
          }
          else {
LAB_1006d2668:
            if (1 < *piVar10) goto LAB_1006d2674;
          }
          puVar21 = (undefined8 *)(*(long *)(param_1 + 0x220) + local_2d8 * 0x18);
          piVar10 = (int *)*puVar21;
          if ((piVar10 == (int *)0x0) || (1 < *piVar10)) {
            FUN_1000a8074(puVar21,0,0,0);
            piVar10 = (int *)*puVar21;
            if (piVar10 != (int *)0x0) goto LAB_1006d26c8;
LAB_1006d26d4:
            FUN_1000a8074(puVar21,0,0,0);
          }
          else {
LAB_1006d26c8:
            if (1 < *piVar10) goto LAB_1006d26d4;
          }
          __ZN7QStringaSERKS_(puVar21[1] + lVar20 * 0xd0 + 0x78,&local_100);
          if (plStack_178 != (long *)0x0) {
            LOAcquire();
            lVar18 = *plStack_178;
            *(int *)plStack_178 = (int)lVar18 + -1;
            LORelease();
            if ((int)lVar18 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(plStack_178,2,8);
            }
          }
          if (local_190 != (long *)0x0) {
            LOAcquire();
            lVar18 = *local_190;
            *(int *)local_190 = (int)lVar18 + -1;
            LORelease();
            if ((int)lVar18 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_190,2,8);
            }
          }
          if (local_100 != (long *)0x0) {
            LOAcquire();
            lVar18 = *local_100;
            *(int *)local_100 = (int)lVar18 + -1;
            LORelease();
            if ((int)lVar18 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
            }
          }
          if (local_e0 != (long *)0x0) {
            LOAcquire();
            lVar18 = *local_e0;
            *(int *)local_e0 = (int)lVar18 + -1;
            LORelease();
            if ((int)lVar18 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
            }
          }
          local_2e0 = lVar11 + local_2e0;
        }
        else {
          uVar7 = __Z5qHash11QStringViewm(local_b0,plStack_b8,*(undefined8 *)(local_88[0] + 6));
          lVar18 = *(long *)(piVar10 + 4);
          lVar11 = *(long *)(piVar10 + 8);
          uVar7 = lVar18 - 1U & uVar7;
          while( true ) {
            uVar19 = uVar7;
            uVar9 = (uint)*(byte *)(lVar11 + (uVar19 >> 7) * 0x90 + (uVar19 & 0x7f));
            if ((uVar9 == 0xff) ||
               ((lVar12 = *(long *)(lVar11 + (uVar19 >> 7) * 0x90 + 0x80) + (ulong)uVar9 * 0x18,
                *(long *)(lVar12 + 0x10) == uVar16 &&
                (iVar5 = __ZN9QtPrivate14compareStringsE11QStringViewS0_N2Qt15CaseSensitivityE
                                   (uVar16,*(undefined8 *)(lVar12 + 8),uVar16,plVar14,1), iVar5 == 0
                )))) break;
            uVar7 = 0;
            if (uVar19 + 1 != lVar18) {
              uVar7 = uVar19 + 1;
            }
          }
          lVar11 = lVar11 + (uVar19 >> 7) * 0x90;
          if ((*(char *)(lVar11 + (uVar19 & 0x7f)) == -1) || (*(long *)(lVar11 + 0x80) == 0))
          goto LAB_1006d2028;
          if (0 < local_98) {
            lVar18 = 0;
            lVar11 = 0;
            do {
              if ((((local_a8 == (int *)0x0) || (1 < *local_a8)) &&
                  (FUN_1006d4690(&local_a8,0,0,0), local_a8 == (int *)0x0)) || (1 < *local_a8)) {
                FUN_1006d4690(&local_a8,0,0,0);
              }
              lVar12 = *(long *)((long)local_a0 + lVar18 + 0x10);
              if ((lVar12 == local_b0) &&
                 (iVar5 = __ZN9QtPrivate14compareStringsE11QStringViewS0_N2Qt15CaseSensitivityE
                                    (lVar12,*(undefined8 *)((long)local_a0 + lVar18 + 8),lVar12,
                                     plStack_b8,1), iVar5 == 0)) {
                if ((((local_a8 == (int *)0x0) || (1 < *local_a8)) &&
                    (FUN_1006d4690(&local_a8,0,0,0), local_a8 == (int *)0x0)) || (1 < *local_a8)) {
                  FUN_1006d4690(&local_a8,0,0,0);
                }
                __ZN9QFileInfoC1ERK7QString(&local_e0,(long)local_a0 + lVar18 + 0x18);
                __ZNK9QFileInfo8fileNameEv(&local_190);
                piVar10 = (int *)*puVar17;
                if ((piVar10 == (int *)0x0) || (1 < *piVar10)) {
                  FUN_1000a71b8(puVar17,0,0,0);
                  piVar10 = (int *)*puVar17;
                  if (piVar10 != (int *)0x0) goto LAB_1006d1f38;
LAB_1006d1f44:
                  FUN_1000a71b8(puVar17,0,0,0);
                }
                else {
LAB_1006d1f38:
                  if (1 < *piVar10) goto LAB_1006d1f44;
                }
                puVar21 = (undefined8 *)(*(long *)(param_1 + 0x220) + local_2d8 * 0x18);
                piVar10 = (int *)*puVar21;
                if ((piVar10 == (int *)0x0) || (1 < *piVar10)) {
                  FUN_1000a8074(puVar21,0,0,0);
                  piVar10 = (int *)*puVar21;
                  if (piVar10 != (int *)0x0) goto LAB_1006d1f98;
LAB_1006d1fa4:
                  FUN_1000a8074(puVar21,0,0,0);
                }
                else {
LAB_1006d1f98:
                  if (1 < *piVar10) goto LAB_1006d1fa4;
                }
                lVar11 = puVar21[1] + lVar20 * 0xd0;
                plVar14 = *(long **)(lVar11 + 0x78);
                *(long **)(lVar11 + 0x78) = local_190;
                plVar15 = *(long **)(lVar11 + 0x80);
                *(long **)(lVar11 + 0x80) = plStack_188;
                uVar16 = *(ulong *)(lVar11 + 0x88);
                *(ulong *)(lVar11 + 0x88) = local_180;
                local_190 = plVar14;
                plStack_188 = plVar15;
                local_180 = uVar16;
                if (plVar14 != (long *)0x0) {
                  LOAcquire();
                  lVar11 = *plVar14;
                  *(int *)plVar14 = (int)lVar11 + -1;
                  LORelease();
                  if ((int)lVar11 == 1) {
                    __ZN10QArrayData10deallocateEPS_xx(plVar14,2,8);
                  }
                }
                __ZN9QFileInfoD1Ev(&local_e0);
                break;
              }
              lVar11 = lVar11 + 1;
              lVar18 = lVar18 + 0x38;
            } while (lVar11 < local_98);
          }
        }
        __ZN9QFileInfoD1Ev(auStack_c8);
      }
      if (local_c0 != (long *)0x0) {
        LOAcquire();
        lVar11 = *local_c0;
        *(int *)local_c0 = (int)lVar11 + -1;
        LORelease();
        if ((int)lVar11 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_c0,2,8);
        }
      }
      lVar20 = lVar20 + 1;
    } while( true );
  }
  local_2e0 = 0;
LAB_1006d27d8:
  __ZN7QString8fromUtf8E14QByteArrayView(&local_190,0xb,"Loopmasters");
  plStack_b8 = plStack_188;
  local_c0 = local_190;
  local_b0 = local_180;
  iVar5 = __ZNK7QString7compareERKS_N2Qt15CaseSensitivityE(param_1 + 0x80,&local_c0,0);
  if (iVar5 == 0) {
    bVar4 = true;
  }
  else {
    __ZN7QString8fromUtf8E14QByteArrayView(&local_190,10,"Loopmaster");
    plStack_d8 = plStack_188;
    local_e0 = local_190;
    local_d0 = local_180;
    iVar5 = __ZNK7QString7compareERKS_N2Qt15CaseSensitivityE(param_1 + 0x80,&local_e0,0);
    bVar4 = iVar5 == 0;
    if (local_e0 != (long *)0x0) {
      LOAcquire();
      lVar20 = *local_e0;
      *(int *)local_e0 = (int)lVar20 + -1;
      LORelease();
      if ((int)lVar20 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
      }
    }
  }
  if (local_c0 != (long *)0x0) {
    LOAcquire();
    lVar20 = *local_c0;
    *(int *)local_c0 = (int)lVar20 + -1;
    LORelease();
    if ((int)lVar20 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_c0,2,8);
    }
  }
  __ZN7QString8fromUtf8E14QByteArrayView(&local_190,0,&DAT_1016afb6c);
  plStack_b8 = plStack_188;
  local_c0 = local_190;
  local_b0 = local_180;
  if (bVar4) {
LAB_1006d292c:
    __ZN7QString8fromUtf8E14QByteArrayView(&local_190,0x23,":/sampler/DJUCED_DefaultArtWork.png");
    plStack_f8 = plStack_188;
    local_100 = local_190;
    local_f0 = local_180;
    __ZN6QImageC1ERK7QStringPKc(&local_e0,&local_100,0);
    if (local_100 != (long *)0x0) {
      LOAcquire();
      lVar20 = *local_100;
      *(int *)local_100 = (int)lVar20 + -1;
      LORelease();
      if ((int)lVar20 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
      }
    }
    FUN_100014ba4(&local_190,param_1 + 0x28,"cover.png");
    __ZN7QStringaSERKS_(&local_c0,&local_190);
    if (local_190 != (long *)0x0) {
      LOAcquire();
      lVar20 = *local_190;
      *(int *)local_190 = (int)lVar20 + -1;
      LORelease();
      if ((int)lVar20 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_190,2,8);
      }
    }
    __ZNK6QImage4saveERK7QStringPKci(&local_e0,&local_c0,0,0xffffffff);
    plStack_178 = (long *)0x0;
    local_180 = 0;
    local_168 = 0;
    local_170 = (long *)0x0;
    plStack_188 = (long *)0x0;
    local_190 = (long *)0x0;
    plStack_208 = plStack_b8;
    local_210 = local_c0;
    local_200 = local_b0;
    if (local_c0 != (long *)0x0) {
      LOAcquire();
      *(int *)local_c0 = (int)*local_c0 + 1;
      LORelease();
    }
    __ZN2dj21toUniversalSeparatorsE7QString(&local_100,&local_210);
    uVar16 = local_180;
    plVar15 = plStack_188;
    plVar14 = local_190;
    plStack_188 = plStack_f8;
    local_190 = local_100;
    plStack_f8 = plVar15;
    local_100 = plVar14;
    local_180 = local_f0;
    local_f0 = uVar16;
    if (plVar14 != (long *)0x0) {
      LOAcquire();
      lVar20 = *plVar14;
      *(int *)plVar14 = (int)lVar20 + -1;
      LORelease();
      if ((int)lVar20 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(plVar14,2,8);
      }
    }
    if (local_210 != (long *)0x0) {
      LOAcquire();
      lVar20 = *local_210;
      *(int *)local_210 = (int)lVar20 + -1;
      LORelease();
      if ((int)lVar20 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_210,2,8);
      }
    }
    __ZN9QFileInfoC1ERK7QString(&local_140,&local_190);
    __ZNK9QFileInfo8fileNameEv(&local_100,&local_140);
    uVar16 = local_b0;
    plVar15 = plStack_b8;
    plVar14 = local_c0;
    plStack_b8 = plStack_f8;
    local_c0 = local_100;
    plStack_f8 = plVar15;
    local_100 = plVar14;
    local_b0 = local_f0;
    local_f0 = uVar16;
    if (plVar14 != (long *)0x0) {
      LOAcquire();
      lVar20 = *plVar14;
      *(int *)plVar14 = (int)lVar20 + -1;
      LORelease();
      if ((int)lVar20 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(plVar14,2,8);
      }
    }
    __ZNK9QFileInfo8fileNameEv(&local_120,&local_140);
    uStack_228 = *(undefined8 *)(param_1 + 0x30);
    local_230 = *(int **)(param_1 + 0x28);
    local_220 = *(undefined8 *)(param_1 + 0x38);
    uVar13 = 0;
    if (local_230 != (int *)0x0) {
      LOAcquire();
      iVar5 = *local_230;
      *local_230 = iVar5 + 1;
      uVar13 = CONCAT44((int)((ulong)local_230 >> 0x20),iVar5);
      LORelease();
    }
    __ZN7QString6appendERKS_(uVar13,&local_230,&local_120);
    __ZN2dj21toUniversalSeparatorsE7QString(&local_100,&local_230);
    uVar13 = local_168;
    plVar15 = local_170;
    plVar14 = plStack_178;
    local_170 = plStack_f8;
    plStack_178 = local_100;
    plStack_f8 = plVar15;
    local_100 = plVar14;
    local_168 = local_f0;
    local_f0 = uVar13;
    if (plVar14 != (long *)0x0) {
      LOAcquire();
      lVar20 = *plVar14;
      *(int *)plVar14 = (int)lVar20 + -1;
      LORelease();
      if ((int)lVar20 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(plVar14,2,8);
      }
    }
    if (local_230 != (int *)0x0) {
      LOAcquire();
      iVar5 = *local_230;
      *local_230 = iVar5 + -1;
      LORelease();
      if (iVar5 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_230,2,8);
      }
    }
    if (local_120 != (long *)0x0) {
      LOAcquire();
      lVar20 = *local_120;
      *(int *)local_120 = (int)lVar20 + -1;
      LORelease();
      if ((int)lVar20 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_120,2,8);
      }
    }
    local_160 = __ZNK9QFileInfo4sizeEv(&local_140);
    if (((local_180 != local_168) ||
        (iVar5 = __ZN9QtPrivate14compareStringsE11QStringViewS0_N2Qt15CaseSensitivityE
                           (local_180,plStack_188,local_180,local_170,1), iVar5 != 0)) &&
       ((FUN_1006d4a44(&local_a8,local_98,&local_190), local_a8 == (int *)0x0 || (1 < *local_a8))))
    {
      FUN_1006d4690(&local_a8,0,0,0);
    }
    __ZNK9QFileInfo16absoluteFilePathEv(&local_100,&local_140);
    uVar8 = *(undefined8 *)(param_1 + 0x198);
    plVar14 = *(long **)(param_1 + 400);
    *(long **)(param_1 + 0x198) = plStack_f8;
    *(long **)(param_1 + 400) = local_100;
    uVar13 = *(undefined8 *)(param_1 + 0x1a0);
    *(ulong *)(param_1 + 0x1a0) = local_f0;
    local_100 = plVar14;
    plStack_f8 = (long *)uVar8;
    local_f0 = uVar13;
    if (plVar14 != (long *)0x0) {
      LOAcquire();
      lVar20 = *plVar14;
      *(int *)plVar14 = (int)lVar20 + -1;
      LORelease();
      if ((int)lVar20 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(plVar14,2,8);
      }
    }
    __ZNK9QFileInfo16absoluteFilePathEv(&local_100,&local_140);
    plVar15 = *(long **)(param_1 + 0x238);
    plVar14 = *(long **)(param_1 + 0x230);
    *(long **)(param_1 + 0x238) = plStack_f8;
    *(long **)(param_1 + 0x230) = local_100;
    uVar16 = *(ulong *)(param_1 + 0x240);
    *(ulong *)(param_1 + 0x240) = local_f0;
    local_100 = plVar14;
    plStack_f8 = plVar15;
    local_f0 = uVar16;
    if (plVar14 != (long *)0x0) {
      LOAcquire();
      lVar20 = *plVar14;
      *(int *)plVar14 = (int)lVar20 + -1;
      LORelease();
      if ((int)lVar20 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(plVar14,2,8);
      }
    }
    __ZN9QFileInfoD1Ev(&local_140);
    if (plStack_178 != (long *)0x0) {
      LOAcquire();
      lVar20 = *plStack_178;
      *(int *)plStack_178 = (int)lVar20 + -1;
      LORelease();
      if ((int)lVar20 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(plStack_178,2,8);
      }
    }
    if (local_190 != (long *)0x0) {
      LOAcquire();
      lVar20 = *local_190;
      *(int *)local_190 = (int)lVar20 + -1;
      LORelease();
      if ((int)lVar20 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_190,2,8);
      }
    }
    __ZN6QImageD1Ev(&local_e0);
    if (bVar4) {
      plVar14 = *(long **)(param_1 + 0x80);
      *(undefined8 *)(param_1 + 0x80) = 0;
      *(wchar16 **)(param_1 + 0x88) = L"DJUCED";
      *(undefined8 *)(param_1 + 0x90) = 6;
      if (plVar14 != (long *)0x0) {
        LOAcquire();
        lVar20 = *plVar14;
        *(int *)plVar14 = (int)lVar20 + -1;
        LORelease();
        if ((int)lVar20 == 1) goto LAB_1006d2fe8;
      }
    }
  }
  else {
    uStack_1e8 = *(undefined8 *)(param_1 + 0x198);
    local_1f0 = *(int **)(param_1 + 400);
    local_1e0 = *(undefined8 *)(param_1 + 0x1a0);
    uVar13 = 0;
    if (local_1f0 != (int *)0x0) {
      LOAcquire();
      iVar5 = *local_1f0;
      *local_1f0 = iVar5 + 1;
      uVar13 = CONCAT44((int)((ulong)local_1f0 >> 0x20),iVar5);
      LORelease();
    }
    uVar16 = __ZN9FileUtils10fileExistsE7QString(uVar13,&local_1f0);
    if (local_1f0 != (int *)0x0) {
      LOAcquire();
      iVar5 = *local_1f0;
      *local_1f0 = iVar5 + -1;
      LORelease();
      if (iVar5 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_1f0,2,8);
      }
    }
    if ((uVar16 & 1) == 0) goto LAB_1006d292c;
    plStack_178 = (long *)0x0;
    local_180 = 0;
    local_168 = 0;
    local_170 = (long *)0x0;
    plStack_188 = (long *)0x0;
    local_190 = (long *)0x0;
    uStack_248 = *(undefined8 *)(param_1 + 0x198);
    local_250 = *(int **)(param_1 + 400);
    local_240 = *(undefined8 *)(param_1 + 0x1a0);
    if (local_250 != (int *)0x0) {
      LOAcquire();
      *local_250 = *local_250 + 1;
      LORelease();
    }
    __ZN2dj21toUniversalSeparatorsE7QString(&local_e0,&local_250);
    uVar16 = local_180;
    plVar15 = plStack_188;
    plVar14 = local_190;
    plStack_188 = plStack_d8;
    local_190 = local_e0;
    plStack_d8 = plVar15;
    local_e0 = plVar14;
    local_180 = local_d0;
    local_d0 = uVar16;
    if (plVar14 != (long *)0x0) {
      LOAcquire();
      lVar20 = *plVar14;
      *(int *)plVar14 = (int)lVar20 + -1;
      LORelease();
      if ((int)lVar20 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(plVar14,2,8);
      }
    }
    if (local_250 != (int *)0x0) {
      LOAcquire();
      iVar5 = *local_250;
      *local_250 = iVar5 + -1;
      LORelease();
      if (iVar5 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_250,2,8);
      }
    }
    __ZN9QFileInfoC1ERK7QString(&local_120,&local_190);
    __ZNK9QFileInfo8fileNameEv(&local_100,&local_120);
    uStack_268 = *(undefined8 *)(param_1 + 0x30);
    local_270 = *(int **)(param_1 + 0x28);
    local_260 = *(undefined8 *)(param_1 + 0x38);
    uVar13 = 0;
    if (local_270 != (int *)0x0) {
      LOAcquire();
      iVar5 = *local_270;
      *local_270 = iVar5 + 1;
      uVar13 = CONCAT44((int)((ulong)local_270 >> 0x20),iVar5);
      LORelease();
    }
    __ZN7QString6appendERKS_(uVar13,&local_270,&local_100);
    __ZN2dj21toUniversalSeparatorsE7QString(&local_e0,&local_270);
    uVar13 = local_168;
    plVar15 = local_170;
    plVar14 = plStack_178;
    local_170 = plStack_d8;
    plStack_178 = local_e0;
    plStack_d8 = plVar15;
    local_e0 = plVar14;
    local_168 = local_d0;
    local_d0 = uVar13;
    if (plVar14 != (long *)0x0) {
      LOAcquire();
      lVar20 = *plVar14;
      *(int *)plVar14 = (int)lVar20 + -1;
      LORelease();
      if ((int)lVar20 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(plVar14,2,8);
      }
    }
    if (local_270 != (int *)0x0) {
      LOAcquire();
      iVar5 = *local_270;
      *local_270 = iVar5 + -1;
      LORelease();
      if (iVar5 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_270,2,8);
      }
    }
    if (local_100 != (long *)0x0) {
      LOAcquire();
      lVar20 = *local_100;
      *(int *)local_100 = (int)lVar20 + -1;
      LORelease();
      if ((int)lVar20 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
      }
    }
    __ZNK9QFileInfo8fileNameEv(&local_e0,&local_120);
    uVar16 = local_b0;
    plVar15 = plStack_b8;
    plVar14 = local_c0;
    plStack_b8 = plStack_d8;
    local_c0 = local_e0;
    plStack_d8 = plVar15;
    local_e0 = plVar14;
    local_b0 = local_d0;
    local_d0 = uVar16;
    if (plVar14 != (long *)0x0) {
      LOAcquire();
      lVar20 = *plVar14;
      *(int *)plVar14 = (int)lVar20 + -1;
      LORelease();
      if ((int)lVar20 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(plVar14,2,8);
      }
    }
    local_160 = __ZNK9QFileInfo4sizeEv(&local_120);
    FUN_1006d4a44(&local_a8,local_98,&local_190);
    if ((local_a8 == (int *)0x0) || (1 < *local_a8)) {
      FUN_1006d4690(&local_a8,0,0,0);
    }
    __ZN9QFileInfoD1Ev(&local_120);
    if (plStack_178 != (long *)0x0) {
      LOAcquire();
      lVar20 = *plStack_178;
      *(int *)plStack_178 = (int)lVar20 + -1;
      LORelease();
      if ((int)lVar20 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(plStack_178,2,8);
      }
    }
    if (local_190 != (long *)0x0) {
      LOAcquire();
      lVar20 = *local_190;
      *(int *)local_190 = (int)lVar20 + -1;
      LORelease();
      plVar14 = local_190;
      if ((int)lVar20 != 1) goto LAB_1006d2ff4;
LAB_1006d2fe8:
      __ZN10QArrayData10deallocateEPS_xx(plVar14,2,8);
    }
  }
LAB_1006d2ff4:
  FUN_100014ba4(local_288,param_1 + 0x28,"default.djs");
  uStack_298 = plStack_b8;
  local_2a0 = local_c0;
  local_290 = local_b0;
  iVar5 = 0;
  if (local_c0 != (long *)0x0) {
    LOAcquire();
    iVar5 = (int)*local_c0;
    *(int *)local_c0 = iVar5 + 1;
    LORelease();
  }
  iVar5 = __ZN2dj22saveDJSSamplePackToXMLE7QStringPNS_14AudioMediaInfoEP5QListIS3_INS_10SampleInfoEEES0_fbNS_10SampleTypeE
                    (iVar5,*(undefined4 *)(param_1 + 0x248),local_288,param_1 + 0x48,puVar17,
                     &local_2a0,*(undefined1 *)(param_1 + 0x24c),*(undefined4 *)(param_1 + 0x210));
  if (local_2a0 != (long *)0x0) {
    LOAcquire();
    lVar20 = *local_2a0;
    *(int *)local_2a0 = (int)lVar20 + -1;
    LORelease();
    if ((int)lVar20 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_2a0,2,8);
    }
  }
  if (local_288[0] != (int *)0x0) {
    LOAcquire();
    iVar6 = *local_288[0];
    *local_288[0] = iVar6 + -1;
    LORelease();
    if (iVar6 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_288[0],2,8);
    }
  }
  iVar6 = *(int *)(param_1 + 0x40);
  if (iVar6 == 1) {
    if (local_98 < 1) {
      uVar13 = 1;
      goto LAB_1006d3754;
    }
    lVar20 = 0;
    lVar18 = 0;
    uVar13 = 1;
    lVar11 = 0x30;
    do {
      plStack_178 = (long *)0x0;
      local_180 = 0;
      local_168 = 0;
      local_170 = (long *)0x0;
      plStack_188 = (long *)0x0;
      local_190 = (long *)0x0;
      plVar14 = (long *)((long)local_a0 + lVar11);
      __ZN7QStringaSERKS_(&local_190,plVar14 + -6);
      __ZN7QStringaSERKS_(&plStack_178,plVar14 + -3);
      local_160 = *plVar14;
      iVar6 = __ZNK7QString7compareERKS_N2Qt15CaseSensitivityE(&local_190,&plStack_178,1);
      if (iVar6 == 0) {
        lVar18 = local_160 + lVar18;
        __ZN2dj10PackThread13statusChangedEf
                  ((float)(((double)lVar18 / (double)local_2e0) * 100.0),param_1);
        iVar22 = 0xf;
        iVar6 = 0xf;
      }
      else {
        __ZN5QFile6removeERK7QString(&plStack_178);
        iVar6 = __ZN5QFile4copyERK7QStringS2_(&local_190,&plStack_178);
        if (iVar6 == 0) {
          uVar13 = 0;
          iVar22 = 0xd;
          iVar6 = 0xd;
        }
        else {
          lVar18 = local_160 + lVar18;
          __ZN2dj10PackThread13statusChangedEf
                    ((float)(((double)lVar18 / (double)local_2e0) * 100.0),param_1);
          iVar22 = 0;
          iVar6 = 0;
        }
      }
      if (plStack_178 != (long *)0x0) {
        LOAcquire();
        lVar12 = *plStack_178;
        *(int *)plStack_178 = (int)lVar12 + -1;
        LORelease();
        iVar6 = iVar22;
        if ((int)lVar12 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(plStack_178,2,8);
        }
      }
      if (local_190 != (long *)0x0) {
        LOAcquire();
        lVar12 = *local_190;
        *(int *)local_190 = (int)lVar12 + -1;
        LORelease();
        if ((int)lVar12 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_190,2,8);
        }
      }
      if ((iVar6 != 0xf) && (iVar6 != 0)) break;
      lVar20 = lVar20 + 1;
      lVar11 = lVar11 + 0x38;
    } while (lVar20 < local_98);
    iVar6 = *(int *)(param_1 + 0x40);
  }
  else {
    uVar13 = 1;
  }
  if (iVar6 == 2) {
    __ZN14LibarchiveUtilC1EPFvfPvES0_(&local_140,__ZN2dj10PackThread13progress_funcEfPv,param_1);
    puVar1 = PTR___ZN10QByteArray6_emptyE_10172c340;
    local_e0 = (long *)0x0;
    plStack_d8 = (long *)0x0;
    local_d0 = 0;
    if (-1 < local_98) {
      lVar11 = 0;
      lVar20 = -1;
      do {
        plStack_178 = (long *)0x0;
        local_180 = 0;
        local_168 = 0;
        local_170 = (long *)0x0;
        plStack_188 = (long *)0x0;
        local_190 = (long *)0x0;
        if (lVar20 + 1 == local_98) {
          FUN_100014ba4(&local_120,param_1 + 0x28,"default.djs");
          __ZN7QString18toLocal8Bit_helperEPK5QCharx(&local_100,plStack_118,local_110);
          plVar14 = (long *)puVar1;
          if (plStack_f8 != (long *)0x0) {
            plVar14 = plStack_f8;
          }
          __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc
                    (&local_190,plVar14);
          if (local_100 != (long *)0x0) {
            LOAcquire();
            lVar18 = *local_100;
            *(int *)local_100 = (int)lVar18 + -1;
            LORelease();
            if ((int)lVar18 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_100,1,8);
            }
          }
          if (local_120 != (long *)0x0) {
            LOAcquire();
            lVar18 = *local_120;
            *(int *)local_120 = (int)lVar18 + -1;
            LORelease();
            if ((int)lVar18 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_120,2,8);
            }
          }
          __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc
                    (&plStack_178,"default.djs");
          local_160 = (long)iVar5;
        }
        else {
          if ((((local_a8 == (int *)0x0) || (1 < *local_a8)) &&
              (FUN_1006d4690(&local_a8,0,0,0), local_a8 == (int *)0x0)) || (1 < *local_a8)) {
            FUN_1006d4690(&local_a8,0,0,0);
          }
          __ZN9QFileInfoC1ERK7QString(local_158,(long)local_a0 + lVar11 + 0x18);
          if ((((local_a8 == (int *)0x0) || (1 < *local_a8)) &&
              (FUN_1006d4690(&local_a8,0,0,0), local_a8 == (int *)0x0)) || (1 < *local_a8)) {
            FUN_1006d4690(&local_a8,0,0,0);
          }
          __ZN7QString18toLocal8Bit_helperEPK5QCharx
                    (&local_100,*(undefined8 *)((long)local_a0 + lVar11 + 8),
                     *(undefined8 *)((long)local_a0 + lVar11 + 0x10));
          plVar14 = (long *)puVar1;
          if (plStack_f8 != (long *)0x0) {
            plVar14 = plStack_f8;
          }
          __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc
                    (&local_190,plVar14);
          if (local_100 != (long *)0x0) {
            LOAcquire();
            lVar18 = *local_100;
            *(int *)local_100 = (int)lVar18 + -1;
            LORelease();
            if ((int)lVar18 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_100,1,8);
            }
          }
          __ZNK9QFileInfo8fileNameEv(&local_120,local_158);
          __ZN7QString13toUtf8_helperERKS_(&local_100,&local_120);
          plVar14 = (long *)puVar1;
          if (plStack_f8 != (long *)0x0) {
            plVar14 = plStack_f8;
          }
          __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc
                    (&plStack_178,plVar14);
          if (local_100 != (long *)0x0) {
            LOAcquire();
            lVar18 = *local_100;
            *(int *)local_100 = (int)lVar18 + -1;
            LORelease();
            if ((int)lVar18 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_100,1,8);
            }
          }
          if (local_120 != (long *)0x0) {
            LOAcquire();
            lVar18 = *local_120;
            *(int *)local_120 = (int)lVar18 + -1;
            LORelease();
            if ((int)lVar18 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_120,2,8);
            }
          }
          if ((((local_a8 == (int *)0x0) || (1 < *local_a8)) &&
              (FUN_1006d4690(&local_a8,0,0,0), local_a8 == (int *)0x0)) || (1 < *local_a8)) {
            FUN_1006d4690(&local_a8,0,0,0);
          }
          local_160 = *(long *)((long)local_a0 + lVar11 + 0x30);
          __ZN9QFileInfoD1Ev(local_158);
        }
        plVar14 = plStack_188;
        if (-1 < (long)local_180) {
          plVar14 = (long *)(local_180 >> 0x38);
        }
        uVar9 = (uint)(char)local_168._7_1_;
        if (plVar14 != (long *)0x0) {
          plVar14 = local_170;
          if (-1 < (int)uVar9) {
            plVar14 = (long *)(ulong)local_168._7_1_;
          }
          if (plVar14 != (long *)0x0) {
            FUN_1006d4058(&local_e0,&local_190);
            uVar9 = (uint)local_168._7_1_;
          }
        }
        if ((uVar9 >> 7 & 1) != 0) {
          __ZdlPv(plStack_178);
        }
        if ((long)local_180 < 0) {
          __ZdlPv(local_190);
        }
        lVar20 = lVar20 + 1;
        lVar11 = lVar11 + 0x38;
      } while (lVar20 < local_98);
    }
    __ZN7QString13toUtf8_helperERKS_(&local_190,param_1 + 0x10);
    if ((local_190 == (long *)0x0) || (1 < (int)*local_190)) {
      __ZN10QByteArray11reallocDataExN10QArrayData16AllocationOptionE(&local_190,local_180,1);
    }
    plVar2 = plStack_d8;
    plVar15 = local_e0;
    plVar14 = plStack_188;
    local_2b0 = 0;
    local_2a8 = 0;
    local_2b8 = 0;
    local_100 = &local_2b8;
    plStack_f8 = (long *)((ulong)plStack_f8 & 0xffffffffffffff00);
    lVar20 = (long)plStack_d8 - (long)local_e0;
    if (lVar20 != 0) {
      if (0x492492492492492 < (ulong)((lVar20 >> 3) * 0x6db6db6db6db6db7)) {
        FUN_1006d5760();
                    /* WARNING: Does not return */
        pcVar3 = (code *)SoftwareBreakpoint(1,0x1006d38c4);
        (*pcVar3)();
      }
      local_2b8 = __Znwm(lVar20);
      local_2a8 = local_2b8 + lVar20;
      local_2b0 = local_2b8;
      local_2b0 = FUN_1006d5888(&local_2b8,plVar15,plVar2,local_2b8);
    }
    uVar8 = __ZN14LibarchiveUtil8compressEPKcNSt3__16vectorI17CompressOperationNS2_9allocatorIS4_EEEEx
                      (&local_140,plVar14,&local_2b8,local_2e0 + iVar5);
    __ZN2dj10PackThread14UploadFinishedEb(param_1,uVar8);
    if (local_2b8 != 0) {
      for (; local_2b0 != local_2b8; local_2b0 = local_2b0 + -0x38) {
      }
      local_2b0 = local_2b8;
      __ZdlPv(local_2b8);
    }
    if (local_190 != (long *)0x0) {
      LOAcquire();
      lVar20 = *local_190;
      *(int *)local_190 = (int)lVar20 + -1;
      LORelease();
      if ((int)lVar20 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_190,1,8);
      }
    }
    __ZN2dj9removeDirERK7QString(param_1 + 0x28);
    if (local_e0 != (long *)0x0) {
      for (; plStack_d8 != local_e0; plStack_d8 = plStack_d8 + -7) {
      }
      plStack_d8 = local_e0;
      __ZdlPv(local_e0);
    }
    __ZN14LibarchiveUtilD1Ev(&local_140);
  }
LAB_1006d3754:
  __ZN2dj10PackThread14UploadFinishedEb(param_1,uVar13);
  __ZN7QThread4exitEi(param_1,0);
  if (local_c0 != (long *)0x0) {
    LOAcquire();
    lVar20 = *local_c0;
    *(int *)local_c0 = (int)lVar20 + -1;
    LORelease();
    if ((int)lVar20 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_c0,2,8);
    }
  }
  if (local_a8 != (int *)0x0) {
    LOAcquire();
    iVar5 = *local_a8;
    *local_a8 = iVar5 + -1;
    LORelease();
    if (iVar5 == 1) {
      if (local_98 != 0) {
        lVar20 = local_98 * 0x38;
        puVar17 = local_a0;
        do {
          piVar10 = (int *)puVar17[3];
          if (piVar10 != (int *)0x0) {
            LOAcquire();
            iVar5 = *piVar10;
            *piVar10 = iVar5 + -1;
            LORelease();
            if (iVar5 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(puVar17[3],2,8);
            }
          }
          piVar10 = (int *)*puVar17;
          if (piVar10 != (int *)0x0) {
            LOAcquire();
            iVar5 = *piVar10;
            *piVar10 = iVar5 + -1;
            LORelease();
            if (iVar5 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(*puVar17,2,8);
            }
          }
          puVar17 = puVar17 + 7;
          lVar20 = lVar20 + -0x38;
        } while (lVar20 != 0);
      }
      __ZN10QArrayData10deallocateEPS_xx(local_a8,0x38,8);
    }
  }
  if ((local_90 != (int *)0x0) && (*local_90 != -1)) {
    LOAcquire();
    iVar5 = *local_90;
    *local_90 = iVar5 + -1;
    LORelease();
    if ((iVar5 == 1) && (local_90 != (int *)0x0)) {
      FUN_1000f3090();
      __ZdlPv();
    }
  }
  if ((local_88[0] != (int *)0x0) && (*local_88[0] != -1)) {
    LOAcquire();
    iVar5 = *local_88[0];
    *local_88[0] = iVar5 + -1;
    LORelease();
    if ((iVar5 == 1) && (local_88[0] != (int *)0x0)) {
      FUN_1000f3090();
      __ZdlPv();
    }
  }
  return;
LAB_1006d1b9c:
  local_2d8 = local_2d8 + 1;
  if (*(long *)(param_1 + 0x228) <= local_2d8) goto LAB_1006d27d8;
  goto LAB_1006d1bb8;
}

