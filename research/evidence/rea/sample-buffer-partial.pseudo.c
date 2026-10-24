
ulong __ZN2dj5audio11BassSample323BufferStreamProcPartialEjPvjS2_
                (undefined8 param_1,float *param_2,ulong param_3,long param_4)

{
  long *plVar1;
  void *pvVar2;
  void *pvVar3;
  uint uVar4;
  byte bVar5;
  uint uVar6;
  byte bVar7;
  bool bVar8;
  bool bVar9;
  int iVar10;
  uint uVar11;
  uint uVar12;
  uint uVar13;
  ulong uVar14;
  long *plVar15;
  ulong uVar16;
  undefined8 *puVar17;
  undefined1 (*pauVar18) [16];
  undefined8 *puVar19;
  bool bVar20;
  uint uVar21;
  undefined8 uVar22;
  long lVar23;
  ulong uVar24;
  long *plVar25;
  ulong uVar26;
  long lVar27;
  float *pfVar28;
  float *pfVar29;
  float *pfVar30;
  ulong uVar31;
  ulong uVar32;
  long lVar33;
  ulong uVar34;
  long lVar35;
  undefined4 *puVar36;
  long *plVar37;
  long lVar38;
  ulong uVar39;
  long lVar40;
  uint uVar41;
  size_t sVar42;
  uint uVar43;
  int in_wzr;
  undefined4 in_register_000040fc;
  undefined4 uVar44;
  float fVar45;
  int iVar46;
  int iVar47;
  int iVar48;
  int iVar49;
  float fVar50;
  double dVar51;
  undefined8 uVar52;
  undefined8 uVar53;
  undefined1 auVar54 [16];
  undefined8 uVar55;
  undefined8 uVar56;
  float fVar58;
  undefined1 auVar57 [16];
  float fVar59;
  float fVar60;
  float fVar61;
  float fVar62;
  float fVar63;
  float fVar64;
  float fVar65;
  float fVar66;
  float fVar67;
  float fVar68;
  float fVar69;
  float fVar70;
  float fVar71;
  double dVar72;
  double dVar73;
  double dVar74;
  double dVar75;
  float fVar76;
  float fVar77;
  float fVar78;
  float fVar79;
  float fVar80;
  float fVar81;
  float fVar82;
  float fVar83;
  uint local_464;
  undefined1 auStack_3f0 [32];
  float local_3d0 [200];
  long local_b0;
  
  local_b0 = *(long *)PTR____stack_chk_guard_10172c568;
  *(int *)(param_4 + 0x104) = *(int *)(param_4 + 0x104) + 1;
  iVar46 = *(int *)(param_4 + 0xec);
  if (iVar46 == 1) {
    *(int *)(param_4 + 0xec) = 2;
  }
  if (*(int *)(param_4 + 0xe8) == 0) {
LAB_100158124:
    uVar26 = 0x80000000;
    goto LAB_100158128;
  }
  bVar5 = *(byte *)(param_4 + 0x11f);
  if ((((*(byte *)(param_4 + 0xbe8) & 1) == 0) &&
      (iVar10 = __ZNK13CStdMemBuffer7getUsedEv(param_4 + 400), iVar10 == 0)) &&
     (*(long *)(param_4 + 0x110) == 0)) {
    *(int *)(param_4 + 0xd8) = *(int *)(param_4 + 0xd4) >> 3;
LAB_100156cc0:
    sVar42 = param_3 & 0xffffffff;
    uVar26 = param_3;
LAB_100156cc8:
    _bzero(param_2,sVar42);
    goto LAB_100158128;
  }
  if ((*(byte *)(param_4 + 0xb4) & 1) == 0) {
    bVar20 = 0 < *(int *)(param_4 + 0xc08);
  }
  else {
    bVar20 = true;
  }
  uVar13 = *(uint *)(param_4 + 0x1d8);
  dVar74 = (double)(**(code **)(**(long **)(param_4 + 0xbe0) + 0x70))();
  iVar10 = *(int *)(param_4 + 0x1dc);
  uVar44 = (**(code **)(**(long **)(param_4 + 0xbe0) + 0x60))();
  dVar73 = (double)(((long)(int)((60.0 / dVar74) * (double)(long)iVar10) & 0x1fffffffffffffffU) << 1
                   );
  dVar74 = (double)_fmod(uVar44,0x3fd0000000000000);
  dVar74 = dVar74 * 4.0;
  if (*(double *)(param_4 + 0x1e8) == dVar74) {
    dVar51 = (double)(long)*(int *)(param_4 + 0x1f0);
  }
  else {
    *(double *)(param_4 + 0x1e8) = dVar74;
    *(undefined4 *)(param_4 + 0x1f0) = 0;
    dVar51 = 0.0;
  }
  bVar5 = (bVar5 ^ 1) & iVar46 == 1;
  dVar74 = dVar74 + dVar51 / dVar73;
  if (1.0 <= dVar74) {
    dVar74 = dVar74 + -1.0;
  }
  uVar11 = **(int **)(param_4 + 0xc00) + 1;
  uVar12 = -uVar11;
  uVar11 = uVar11 & 0x7f;
  if (-1 < (int)uVar12) {
    uVar11 = -(uVar12 & 0x7f);
  }
  dVar51 = (double)_fmod(SUB84((double)(int)uVar11 / 4.0,0),*(undefined8 *)(param_4 + 0xbf0));
  if (*(char *)(param_4 + 0xbdc) == '\x01') {
    bVar8 = 1.0 <= (double)(param_3 & 0xffffffff) / dVar73 + dVar74;
    dVar72 = 1.0 - dVar74;
    if ((dVar51 >= 0.01 || (!bVar8 || dVar74 > 1.0)) && (0.0 < dVar51)) {
      dVar72 = dVar72 + (*(double *)(param_4 + 0xbf0) - dVar51) * 4.0;
    }
    if (bVar5 != 0) {
      uVar11 = *(int *)(param_4 + 0xe8) - *(int *)(param_4 + 0xd4);
      uVar11 = uVar11 & ((int)uVar11 >> 0x1f ^ 0xffffffffU);
      uVar41 = *(int *)(param_4 + 0x1d8) * 4000;
      uVar12 = uVar11;
      if ((int)uVar41 <= (int)uVar11) {
        uVar12 = uVar41;
      }
      *(undefined4 *)(param_4 + 0x2b50) = 1000;
      if ((0 < (int)uVar12) &&
         (_memcpy((void *)(param_4 + 0xc10),
                  (void *)(*(long *)(param_4 + 0xe0) + (long)*(int *)(param_4 + 0xd4)),(ulong)uVar12
                 ), *(char *)(param_4 + 0xb4) == '\x01')) {
        *(undefined4 *)(param_4 + 0x2b50) = 0;
      }
      if (uVar41 - uVar11 != 0 && (int)uVar11 <= (int)uVar41) {
        _bzero((void *)(param_4 + (ulong)uVar11 + 0xc10),(long)(int)(uVar41 - uVar11));
      }
      uVar22 = *(undefined8 *)(param_4 + 0xe0);
      *(undefined8 *)(param_4 + 0xe0) = *(undefined8 *)(param_4 + 0xf8);
      *(undefined8 *)(param_4 + 0xf8) = uVar22;
      *(undefined4 *)(param_4 + 0xe8) = *(undefined4 *)(param_4 + 0xf0);
      *(undefined4 *)(param_4 + 0xf0) = 0;
      *(undefined4 *)(param_4 + 0x100) = 0xffffffff;
      __ZN2dj5audio11BassSample318compute_target_bpmEv(param_4);
      if (*(char *)(param_4 + 0x11c) == '\x01') {
        *(undefined4 *)(param_4 + 0xc08) = 1000;
        *(undefined1 *)(param_4 + 0x11c) = 0;
      }
      *(undefined8 *)(param_4 + 0x108) = *(undefined8 *)(param_4 + 0x110);
      *(undefined4 *)(param_4 + 0xd4) = 0;
      *(undefined4 *)(param_4 + 0xd8) = 0;
      *(undefined4 *)(param_4 + 0xbf8) = 0;
      if (*(int *)(param_4 + 0xec) == 2) {
        *(int *)(param_4 + 0xec) = in_wzr;
      }
      if (*(char *)(param_4 + 0xc0c) == '\x01') {
        *(undefined4 *)(param_4 + 0xd4) = 0;
      }
    }
    if ((bVar20 == false) || (*(char *)(param_4 + 0xbe8) != '\x01')) goto LAB_100156cc0;
    if (*(char *)(param_4 + 0xbe9) != '\x01') {
LAB_100156c9c:
      uVar44 = 0;
      if (*(int *)(param_4 + 0xd4) < 1) {
        bVar5 = 0;
      }
      else {
LAB_100156ca8:
        bVar5 = 0;
        *(undefined4 *)(param_4 + 0xc08) = uVar44;
      }
      goto LAB_100156cd8;
    }
    if (*(int *)(param_4 + 0xd4) != 0) {
      *(undefined1 *)(param_4 + 0x11e) = 1;
      goto LAB_100156c9c;
    }
    uVar11 = (int)(dVar72 * dVar73 * 0.125) << 3;
    if ((uint)param_3 <= uVar11) {
      uVar11 = (uint)param_3;
    }
    uVar26 = (ulong)uVar11;
    if ((int)uVar11 < 1 && (dVar51 < 0.01 && (bVar8 && dVar74 <= 1.0))) {
      *(undefined1 *)(param_4 + 0x11e) = 0;
      uVar44 = 1000;
      goto LAB_100156ca8;
    }
    *(undefined1 *)(param_4 + 0xc0c) = 1;
    _bzero(param_2,(long)(int)uVar11);
  }
  else {
LAB_100156cd8:
    *(undefined4 *)(param_4 + 0x1f0) = 0;
    *(undefined1 *)(param_4 + 0xc0c) = 0;
    if (((*(char *)(param_4 + 0x11c) == '\x01') && ((*(byte *)(param_4 + 0xbe9) & 1) == 0)) &&
       ((*(byte *)(param_4 + 0x1c4) & 1) == 0)) {
      uVar26 = (ulong)*(uint *)(param_4 + 0x100);
      if ((int)*(uint *)(param_4 + 0x100) < 0) {
        uVar26 = (ulong)*(int *)(param_4 + 0xd0);
      }
      uVar11 = *(uint *)(param_4 + 0xb58 + uVar26 * 4);
      if ((4 < uVar11) || ((1 << (ulong)(uVar11 & 0x1f) & 0x15U) == 0)) {
        dVar72 = (double)__ZN3Sys10GetSecondsEv();
        if (DAT_119fd4e08 < dVar72 - __ZN2dj22g_test_control_latencyE) {
          DAT_119fd4e08 = dVar72 - __ZN2dj22g_test_control_latencyE;
        }
        *(undefined1 *)(param_4 + 0x11c) = 0;
        *(undefined1 *)(param_4 + 0x1c4) = 1;
        do {
          uVar22 = __ZN2dj5audio11BassSample323BufferStreamProcPartialEjPvjS2_
                             (param_1,local_3d0,800,param_4);
          if ((int)uVar22 < 1) break;
          __ZN13CStdMemBuffer8putBlockEPvj(param_4 + 0x1a8,local_3d0,uVar22);
          uVar11 = __ZNK13CStdMemBuffer7getUsedEv(param_4 + 0x1a8);
        } while (uVar11 < 800);
        *(undefined4 *)(param_4 + 0xc08) = 1000;
        *(undefined4 *)(param_4 + 0x1c0) = 100;
        *(undefined1 *)(param_4 + 0x1c4) = 0;
        plVar1 = (long *)(param_4 + 0x160);
        if (*plVar1 == 0) {
          *plVar1 = 1;
        }
        else {
          __ZN11QBasicMutex12lockInternalEv(plVar1);
        }
        *(undefined4 *)(param_4 + 0xd4) = 0;
        *(undefined4 *)(param_4 + 0xd8) = 0;
        if (*(long *)(param_4 + 0x110) != 0) {
          (**(code **)(**(long **)(param_4 + 0x148) + 0x78))();
          *(undefined8 *)(param_4 + 0x110) = 0;
          *(undefined4 *)(param_4 + 0x150) = 0;
          *(undefined8 *)(param_4 + 0x158) = 0;
        }
        *(undefined8 *)(param_4 + 0x108) = 0;
        if (*(long *)(param_4 + 0x160) == 1) {
          *(long *)(param_4 + 0x160) = CONCAT44(in_register_000040fc,in_wzr);
        }
        else {
          __ZN11QBasicMutex14unlockInternalEv(plVar1);
        }
      }
    }
    uVar26 = (ulong)uVar13;
    if ((((*(byte *)(param_4 + 0x11e) & bVar20) != 0) && (*(char *)(param_4 + 0xbe8) == '\x01')) &&
       ((*(char *)(param_4 + 0xbe9) == '\x01' &&
        (dVar72 = *(double *)(param_4 + 0x130), 0.0 < dVar72)))) {
      dVar75 = 0.0;
      if (*(char *)(param_4 + 0xb4) == '\x01') {
        if (*(long *)(param_4 + 0x148) == 0) {
          uVar44 = 0;
        }
        else {
          uVar39 = *(ulong *)(param_4 + 0x158);
          lVar33 = *(long *)(param_4 + 0x108);
          lVar23 = *(long *)(param_4 + 0x110);
          iVar46 = *(int *)(param_4 + 0xd8);
          uVar14 = __ZNK13CStdMemBuffer7getUsedEv(param_4 + 400);
          uVar24 = uVar39 & (long)uVar39 >> 0x3f;
          if (lVar23 != 0) {
            uVar24 = uVar39;
          }
          uVar44 = SUB84((double)((uVar24 + (long)iVar46) - (lVar33 + (uVar14 >> 3 & 0x1fffffff))) /
                         (double)(long)*(int *)(param_4 + 0x1dc),0);
          dVar72 = *(double *)(param_4 + 0x130);
        }
        dVar75 = (double)_fmod(uVar44,dVar72);
        dVar75 = dVar75 / dVar72;
      }
      dVar72 = (double)(**(code **)(**(long **)(param_4 + 0xbe0) + 0x60))();
      if (dVar75 - dVar72 <= 0.5) {
        if (0.5 < dVar72 - dVar75) {
          dVar75 = dVar75 + 1.0;
        }
      }
      else {
        dVar72 = dVar72 + 1.0;
      }
      iVar10 = (int)((double)(long)*(int *)(param_4 + 0x1dc) *
                     (dVar72 - dVar75) * *(double *)(param_4 + 0x130) + 0.5);
      iVar46 = *(int *)(param_4 + 0xd8) + iVar10;
      iVar10 = *(int *)(param_4 + 0xd4) + uVar13 * iVar10 * 4;
      *(int *)(param_4 + 0xd4) = iVar10;
      *(int *)(param_4 + 0xd8) = iVar46;
      dVar72 = *(double *)(param_4 + 0x130) * (double)(long)*(int *)(param_4 + 0x1dc);
      iVar47 = (int)(long)dVar72 * uVar13;
      if (iVar10 < 0) {
        *(int *)(param_4 + 0xd4) = iVar10 + iVar47 * 4;
        dVar72 = dVar72 + (double)iVar46;
LAB_100156fd8:
        *(int *)(param_4 + 0xd8) = (int)dVar72;
      }
      else if (*(int *)(param_4 + 0xe8) <= iVar10) {
        *(int *)(param_4 + 0xd4) = iVar10 + iVar47 * -4;
        dVar72 = (double)iVar46 - dVar72;
        goto LAB_100156fd8;
      }
      *(undefined1 *)(param_4 + 0x11e) = 0;
    }
    *(undefined1 *)(param_4 + 0xbdc) = 0;
    lVar33 = param_4 + 0xb58;
    plVar1 = (long *)(param_4 + 0x160);
    pvVar2 = (void *)(param_4 + 0xc10);
    uVar24 = param_3;
    bVar8 = false;
    do {
      bVar9 = bVar8;
      uVar11 = __ZNK13CStdMemBuffer7getUsedEv(param_4 + 400);
      if (uVar11 < (uint)uVar24) {
        if (*(int *)(param_4 + 0xe8) <= *(int *)(param_4 + 0xd4)) {
          uVar14 = (ulong)*(uint *)(param_4 + 0x100);
          if ((int)*(uint *)(param_4 + 0x100) < 0) {
            uVar14 = (ulong)*(int *)(param_4 + 0xd0);
          }
          uVar11 = *(uint *)(lVar33 + uVar14 * 4);
          if (4 < uVar11 || (1 << (ulong)(uVar11 & 0x1f) & 0x15U) == 0) goto LAB_1001570a4;
        }
LAB_1001570ac:
        plVar37 = *(long **)(param_4 + 0x1d0);
        if (0 < (int)uVar13) {
          lVar23 = 0;
          uVar11 = 0;
          if (uVar13 != 0) {
            uVar11 = 0x10000 / uVar13;
          }
          uVar24 = uVar26;
          plVar25 = plVar37;
          do {
            *plVar25 = *(long *)(param_4 + 0x180) + lVar23 * (ulong)uVar11 * 4;
            lVar23 = lVar23 + 1;
            uVar24 = uVar24 - 1;
            plVar25 = plVar25 + 1;
          } while (uVar24 != 0);
        }
        dVar72 = *(double *)(param_4 + 0x140);
        if (dVar72 == 0.0) {
          fVar45 = 0.0;
        }
        else {
          fVar45 = (float)(*(double *)(param_4 + 0x128) / dVar72);
        }
        fVar50 = (float)(dVar72 * (double)**(float **)(param_4 + 0x1e0));
        fVar58 = 4.0;
        if (fVar50 <= 4.0) {
          fVar58 = fVar50;
        }
        local_3d0[0] = 0.25;
        if (0.25 <= fVar50) {
          local_3d0[0] = fVar58;
        }
        fVar58 = 10.0;
        if (fVar45 <= 10.0) {
          fVar58 = fVar45;
        }
        fVar50 = 0.1;
        if (0.1 <= fVar45) {
          fVar50 = fVar58;
        }
        if (*plVar1 == 0) {
          *plVar1 = 1;
        }
        else {
          __ZN11QBasicMutex12lockInternalEv(plVar1);
        }
        if (*(long *)(param_4 + 0x110) == 0) {
          local_464 = (**(code **)(**(long **)(param_4 + 0x148) + 0x50))();
          uVar12 = 0;
          uVar11 = local_464;
        }
        else {
          if (bVar9) {
            uVar12 = 0;
          }
          else {
            if (0 < *(int *)(param_4 + 0x150)) {
              iVar46 = 0;
              do {
                (**(code **)(**(long **)(param_4 + 0x148) + 0x30))();
                __ZN2dj5audio11BassSample334_elastiqueProcessCallsDoneThisTurnE =
                     __ZN2dj5audio11BassSample334_elastiqueProcessCallsDoneThisTurnE + 1;
                iVar46 = iVar46 + 1;
              } while (iVar46 < *(int *)(param_4 + 0x150));
            }
            *(undefined4 *)(param_4 + 0x150) = 0;
            (**(code **)(**(long **)(param_4 + 0x148) + 0x70))
                      (fVar50,*(long **)(param_4 + 0x148),local_3d0,1);
            uVar12 = (**(code **)(**(long **)(param_4 + 0x148) + 0x38))
                               (*(long **)(param_4 + 0x148),plVar37);
            uVar22 = (**(code **)(**(long **)(param_4 + 0x148) + 0x80))();
            *(undefined8 *)(param_4 + 0x158) = uVar22;
          }
          uVar11 = (**(code **)(**(long **)(param_4 + 0x148) + 0x58))();
          local_464 = 0;
        }
        if (*plVar1 == 1) {
          *plVar1 = CONCAT44(in_register_000040fc,in_wzr);
        }
        else {
          __ZN11QBasicMutex14unlockInternalEv(plVar1);
        }
        lVar23 = (long)(int)uVar11;
        _bzero(*(void **)(param_4 + 0x178),(long)(int)uVar13 * 4 * lVar23);
        if ((bVar20 == false) || (*(char *)(param_4 + 0xbe8) != '\x01')) {
          bVar7 = 0;
        }
        else {
          bVar7 = 0;
          lVar38 = 0;
          uVar41 = uVar13 * 4 * uVar11;
          do {
            iVar46 = *(int *)(param_4 + 0xe8);
            lVar40 = (long)iVar46;
            iVar10 = *(int *)(param_4 + 0xd4);
            if ((int)uVar41 < 1) {
              if (iVar46 != iVar10) break;
              uVar24 = (ulong)*(uint *)(param_4 + 0x100);
              if ((int)*(uint *)(param_4 + 0x100) < 0) {
                uVar24 = (ulong)*(int *)(param_4 + 0xd0);
              }
              uVar43 = *(uint *)(lVar33 + uVar24 * 4);
              if (4 < uVar43 || (1 << (ulong)(uVar43 & 0x1f) & 0x15U) == 0) break;
            }
            uVar43 = iVar46 - iVar10;
            if ((int)uVar41 <= iVar46 - iVar10) {
              uVar43 = uVar41;
            }
            if ((int)uVar43 < 1) break;
            uVar39 = *(ulong *)(param_4 + 0x158);
            lVar35 = *(long *)(param_4 + 0x108);
            lVar27 = *(long *)(param_4 + 0x110);
            iVar46 = *(int *)(param_4 + 0xd8);
            uVar14 = __ZNK13CStdMemBuffer7getUsedEv(param_4 + 400);
            iVar47 = 0;
            uVar24 = uVar39 & (long)uVar39 >> 0x3f;
            if (lVar27 != 0) {
              uVar24 = uVar39;
            }
            lVar27 = ((uVar24 - lVar35) + (long)iVar46) * 8;
            lVar35 = 0;
            if (lVar40 != 0) {
              lVar35 = lVar27 / lVar40;
            }
            lVar27 = lVar27 - lVar35 * lVar40;
            if (lVar27 <= iVar10) {
              lVar40 = 0;
            }
            if (1.0 < dVar74) {
LAB_100157434:
              bVar8 = false;
              if (((*(byte *)(param_4 + 0xbe9) & 1) == 0) && (bVar5 == 1)) {
LAB_100157458:
                uVar21 = iVar47 * 4;
                if ((int)uVar43 <= iVar47 * 4) {
                  uVar21 = uVar43;
                }
                bVar8 = *(char *)(param_4 + 0xb4) == '\x01';
                if (bVar8) {
                  uVar43 = uVar21;
                }
              }
            }
            else {
              dVar72 = *(double *)(param_4 + 0x128) *
                       ((double)(((lVar38 + iVar10 + (uVar14 & 0xffffffff)) - lVar27) + lVar40) /
                       dVar73);
              bVar8 = false;
              if ((1.0 <= (double)uVar43 / dVar73 + dVar74 + dVar72) &&
                 (bVar8 = false, !NAN(dVar51))) {
                bVar8 = dVar51 < 0.01;
              }
              if ((!bVar8) ||
                 (uVar21 = (uint)(((1.0 - dVar74) - dVar72) * dVar73 * 0.125),
                 iVar47 = (uVar21 & ((int)uVar21 >> 0x1f ^ 0xffffffffU)) * uVar13,
                 (ulong)uVar43 < (ulong)((long)iVar47 << 2))) goto LAB_100157434;
              if (bVar5 != 0) goto LAB_100157458;
              bVar8 = false;
            }
            _memcpy((void *)(*(long *)(param_4 + 0x178) + lVar38),
                    (void *)(*(long *)(param_4 + 0xe0) + (long)*(int *)(param_4 + 0xd4)),
                    (long)(int)uVar43);
            iVar46 = *(int *)(param_4 + 0xd4) + uVar43;
            *(int *)(param_4 + 0xd4) = iVar46;
            if (*(int *)(param_4 + 0xe8) == iVar46) {
              uVar24 = (ulong)*(uint *)(param_4 + 0x100);
              if ((int)*(uint *)(param_4 + 0x100) < 0) {
                uVar24 = (ulong)*(int *)(param_4 + 0xd0);
              }
              uVar21 = *(uint *)(lVar33 + uVar24 * 4);
              if (((uVar21 < 5) && ((1 << (ulong)(uVar21 & 0x1f) & 0x15U) != 0)) ||
                 (*(char *)(param_4 + 0x11c) == '\x01')) {
                iVar46 = 0;
                *(undefined4 *)(param_4 + 0xd4) = 0;
                *(int *)(param_4 + 0xbf8) = *(int *)(param_4 + 0xbf8) + 1;
                goto LAB_1001574f8;
              }
              if (bVar5 == 0) {
                bVar5 = 0;
                break;
              }
              uVar21 = *(int *)(param_4 + 0x1d8) * 4000;
              *(undefined4 *)(param_4 + 0x2b50) = 1000;
              if (0 < (int)uVar21) {
                _bzero(pvVar2,(ulong)uVar21);
              }
              uVar22 = *(undefined8 *)(param_4 + 0xe0);
              *(undefined8 *)(param_4 + 0xe0) = *(undefined8 *)(param_4 + 0xf8);
              *(undefined8 *)(param_4 + 0xf8) = uVar22;
              *(undefined4 *)(param_4 + 0xe8) = *(undefined4 *)(param_4 + 0xf0);
              *(undefined4 *)(param_4 + 0xf0) = 0;
              *(undefined4 *)(param_4 + 0x100) = 0xffffffff;
              __ZN2dj5audio11BassSample318compute_target_bpmEv(param_4);
              if ((*(byte *)(param_4 + 0x11c) & 1) != 0) goto LAB_1001572cc;
LAB_1001572d8:
              bVar5 = 0;
              *(undefined8 *)(param_4 + 0x108) = *(undefined8 *)(param_4 + 0x110);
              *(undefined4 *)(param_4 + 0xd4) = 0;
              *(undefined4 *)(param_4 + 0xd8) = 0;
              *(undefined4 *)(param_4 + 0xbf8) = 0;
              if (*(int *)(param_4 + 0xec) == 2) {
                *(int *)(param_4 + 0xec) = in_wzr;
              }
            }
            else {
LAB_1001574f8:
              if ((bVar8 & bVar5) == 1) {
                uVar21 = *(int *)(param_4 + 0xe8) - iVar46;
                uVar21 = uVar21 & ((int)uVar21 >> 0x1f ^ 0xffffffffU);
                uVar6 = *(int *)(param_4 + 0x1d8) * 4000;
                uVar4 = uVar21;
                if ((int)uVar6 <= (int)uVar21) {
                  uVar4 = uVar6;
                }
                *(undefined4 *)(param_4 + 0x2b50) = 1000;
                if ((0 < (int)uVar4) &&
                   (_memcpy(pvVar2,(void *)(*(long *)(param_4 + 0xe0) + (long)iVar46),(ulong)uVar4),
                   *(char *)(param_4 + 0xb4) == '\x01')) {
                  *(undefined4 *)(param_4 + 0x2b50) = 0;
                }
                if (uVar6 - uVar21 != 0 && (int)uVar21 <= (int)uVar6) {
                  _bzero((void *)((long)pvVar2 + (ulong)uVar21),(long)(int)(uVar6 - uVar21));
                }
                uVar22 = *(undefined8 *)(param_4 + 0xe0);
                *(undefined8 *)(param_4 + 0xe0) = *(undefined8 *)(param_4 + 0xf8);
                *(undefined8 *)(param_4 + 0xf8) = uVar22;
                *(undefined4 *)(param_4 + 0xe8) = *(undefined4 *)(param_4 + 0xf0);
                *(undefined4 *)(param_4 + 0xf0) = 0;
                *(undefined4 *)(param_4 + 0x100) = 0xffffffff;
                __ZN2dj5audio11BassSample318compute_target_bpmEv(param_4);
                if (*(char *)(param_4 + 0x11c) == '\x01') {
LAB_1001572cc:
                  *(undefined4 *)(param_4 + 0xc08) = 1000;
                  *(undefined1 *)(param_4 + 0x11c) = 0;
                }
                goto LAB_1001572d8;
              }
            }
            lVar38 = lVar38 + (int)uVar43;
            uVar41 = uVar41 - uVar43;
            bVar7 = 1;
          } while ((*(byte *)(param_4 + 0xbe8) & 1) != 0);
        }
        plVar25 = *(long **)(param_4 + 0x1c8);
        iVar46 = *(int *)(param_4 + 0xd4);
        iVar10 = *(int *)(param_4 + 0xbf8);
        iVar47 = *(int *)(param_4 + 0xe8);
        if ((int)uVar11 < 1) {
          uVar14 = 0xffffffff;
        }
        else {
          lVar38 = 0;
          lVar40 = 0;
          uVar24 = 0;
          uVar41 = (uint)((double)(long)*(int *)(param_4 + 0x1dc) *
                          *(double *)(param_4 + 0xbf0) * *(double *)(param_4 + 0x130) + 0.5);
          uVar14 = 0xffffffff;
          do {
            if (uVar41 == 0) {
              bVar8 = false;
            }
            else {
              uVar43 = ((iVar46 + iVar47 * iVar10 >> 3) - uVar11) + (int)uVar24;
              uVar21 = 0;
              if (uVar41 != 0) {
                uVar21 = uVar43 / uVar41;
              }
              bVar8 = uVar43 - uVar21 * uVar41 != (uVar41 + 1) - *(int *)(param_4 + 0xc08);
            }
            if (*(char *)(param_4 + 0x11c) == '\x01' && *(byte *)(param_4 + 0x11d) == 0) {
              if (bVar8 || ((*(byte *)(param_4 + 0xbe9) ^ 0xff) & 1) != 0) goto LAB_100157700;
              if (((*(byte *)(param_4 + 0x11f) & 1) == 0) && (*(int *)(param_4 + 0xec) != 0)) {
                if ((*(byte *)(param_4 + 0x11d) & 1) == 0) goto LAB_100157700;
              }
              else {
                *(undefined1 *)(param_4 + 0x11d) = 1;
              }
LAB_100157770:
              iVar48 = *(int *)(param_4 + 0xc08);
LAB_100157774:
              iVar49 = iVar48 + -1;
              if (0 < iVar48) {
LAB_100157780:
                iVar48 = iVar49;
                *(int *)(param_4 + 0xc08) = iVar48;
              }
            }
            else {
              if ((*(byte *)(param_4 + 0x11d) & 1) != 0) goto LAB_100157770;
LAB_100157700:
              if (*(char *)(param_4 + 0x11c) == '\x01') {
                iVar48 = *(int *)(param_4 + 0xc08);
                if (*(char *)(param_4 + 0xbe9) == '\0') goto LAB_100157774;
              }
              else {
                iVar48 = *(int *)(param_4 + 0xc08);
              }
              if ((*(byte *)(param_4 + 0xb4) & 1) == 0) goto LAB_100157774;
              if (iVar48 < 1000) {
                iVar49 = iVar48 + 1;
                goto LAB_100157780;
              }
            }
            if ((*(char *)(param_4 + 0x11c) == '\x01') && (iVar48 == 0)) {
              pvVar3 = (void *)(*(long *)(param_4 + 0x178) + uVar24 * 8);
              if (*(char *)(param_4 + 0x11f) == '\x01') {
                _bzero(pvVar3,(lVar23 - uVar24) * 8);
                *(undefined1 *)(param_4 + 0xb4) = 0;
                *(undefined1 *)(param_4 + 0x11f) = 0;
              }
              else {
                _memcpy(pvVar3,*(void **)(param_4 + 0xe0),(lVar23 - uVar24) * 8);
              }
              *(undefined2 *)(param_4 + 0x11c) = 0;
              iVar48 = 1000;
              *(undefined4 *)(param_4 + 0xc08) = 1000;
              uVar14 = uVar24;
            }
            iVar49 = *(int *)(param_4 + 0x2b50);
            if (0 < (int)uVar13) {
              pfVar28 = (float *)(*(long *)(param_4 + 0x178) + lVar40);
              pfVar30 = (float *)(*(long *)(param_4 + 0x170) + lVar38);
              pfVar29 = (float *)((long)pvVar2 + (long)(iVar49 << 1) * 4);
              uVar39 = uVar26;
              do {
                if (iVar49 < 1000) {
                  fVar45 = ((float)iVar49 / -1000.0 + 1.0) * *pfVar29 +
                           ((float)iVar48 / 1000.0) * *pfVar28;
                }
                else {
                  fVar45 = ((float)iVar48 / 1000.0) * *pfVar28;
                }
                *pfVar30 = fVar45;
                pfVar28 = pfVar28 + 1;
                pfVar30 = pfVar30 + lVar23;
                pfVar29 = pfVar29 + 1;
                uVar39 = uVar39 - 1;
              } while (uVar39 != 0);
            }
            if (iVar49 < 1000) {
              *(int *)(param_4 + 0x2b50) = iVar49 + 1;
            }
            uVar24 = uVar24 + 1;
            lVar40 = lVar40 + (long)(int)uVar13 * 4;
            lVar38 = lVar38 + 4;
          } while (uVar24 != uVar11);
        }
        if (0 < (int)uVar13) {
          lVar38 = 0;
          uVar24 = uVar26;
          plVar15 = plVar25;
          do {
            *plVar15 = *(long *)(param_4 + 0x170) + lVar38;
            lVar38 = lVar38 + lVar23 * 4;
            uVar24 = uVar24 - 1;
            plVar15 = plVar15 + 1;
          } while (uVar24 != 0);
        }
        uVar24 = param_3 & 0xffffffff;
        uVar39 = (ulong)uVar12;
        if ((((bVar7 | uVar11 == 0) & bVar20) == 0) || (*(char *)(param_4 + 0xbe8) != '\x01')) {
          if (*plVar1 == 0) {
            *plVar1 = 1;
          }
          else {
            __ZN11QBasicMutex12lockInternalEv(plVar1);
          }
          if (*(long *)(param_4 + 0x110) == 0) {
            uVar11 = 0xffffffff;
          }
          else {
            uVar11 = (**(code **)(**(long **)(param_4 + 0x148) + 0x88))
                               (*(long **)(param_4 + 0x148),plVar37);
            (**(code **)(**(long **)(param_4 + 0x148) + 0x78))();
            *(undefined8 *)(param_4 + 0x110) = 0;
            *(undefined4 *)(param_4 + 0x150) = 0;
            *(undefined8 *)(param_4 + 0x158) = 0;
          }
          *(undefined8 *)(param_4 + 0x108) = 0;
          if (*(long *)(param_4 + 0x160) == 1) {
            *(long *)(param_4 + 0x160) = CONCAT44(in_register_000040fc,in_wzr);
          }
          else {
            __ZN11QBasicMutex14unlockInternalEv(plVar1);
          }
          uVar39 = (ulong)(uVar11 & ((int)uVar11 >> 0x1f ^ 0xffffffffU));
        }
        else {
          if (*plVar1 == 0) {
            *plVar1 = 1;
          }
          else {
            __ZN11QBasicMutex12lockInternalEv(plVar1);
          }
          bVar9 = *(long *)(param_4 + 0x110) == 0;
          plVar15 = *(long **)(param_4 + 0x148);
          if (*(long *)(param_4 + 0x110) == 0) {
            uVar39 = (**(code **)(*plVar15 + 0x20))(plVar15,plVar25,local_464,plVar37,0);
            uVar22 = (**(code **)(**(long **)(param_4 + 0x148) + 0x80))();
            *(undefined8 *)(param_4 + 0x158) = uVar22;
            lVar38 = *(long *)(param_4 + 0x110);
          }
          else {
            (**(code **)(*plVar15 + 0x28))(plVar15,plVar25,uVar11 - local_464);
            uVar44 = (**(code **)(**(long **)(param_4 + 0x148) + 0x40))();
            *(undefined4 *)(param_4 + 0x150) = uVar44;
            lVar38 = *(long *)(param_4 + 0x110);
          }
          if (-1 < (int)uVar14) {
            *(ulong *)(param_4 + 0x108) = lVar38 + (uVar14 & 0xffffffff);
            iVar46 = uVar11 - (int)uVar14;
            *(int *)(param_4 + 0xd4) = iVar46 * 8;
            *(int *)(param_4 + 0xd8) = iVar46;
          }
          *(long *)(param_4 + 0x110) = lVar38 + lVar23;
          if (*(long *)(param_4 + 0x160) == 1) {
            *(long *)(param_4 + 0x160) = CONCAT44(in_register_000040fc,in_wzr);
          }
          else {
            __ZN11QBasicMutex14unlockInternalEv(plVar1);
          }
        }
        uVar11 = (uint)uVar39;
        if (0 < (int)uVar13) {
          lVar38 = 0;
          uVar14 = 0;
          uVar31 = uVar39 & 0xffffffff;
          uVar32 = uVar39 & 0x7ffffff0;
          uVar34 = uVar39 & 0x7ffffffc;
          lVar23 = 0x20;
          do {
            if (0 < (int)uVar11) {
              lVar35 = plVar37[uVar14];
              lVar40 = *(long *)(param_4 + 0x170);
              if ((uVar11 < 4 || uVar13 != 1) || ((uVar14 * 4 + lVar40) - lVar35 < 0x40)) {
                uVar16 = 0;
              }
              else {
                if (uVar11 < 0x10) {
                  uVar16 = 0;
                }
                else {
                  puVar17 = (undefined8 *)(lVar40 + lVar23);
                  pauVar18 = (undefined1 (*) [16])(lVar35 + 0x20);
                  uVar16 = uVar32;
                  do {
                    uVar22 = *(undefined8 *)pauVar18[-2];
                    uVar53 = *(undefined8 *)(pauVar18[-1] + 8);
                    uVar52 = *(undefined8 *)pauVar18[-1];
                    auVar54 = *pauVar18;
                    uVar56 = *(undefined8 *)(pauVar18[1] + 8);
                    uVar55 = *(undefined8 *)pauVar18[1];
                    puVar17[-3] = *(undefined8 *)(pauVar18[-2] + 8);
                    puVar17[-4] = uVar22;
                    puVar17[-1] = uVar53;
                    puVar17[-2] = uVar52;
                    puVar17[1] = auVar54._8_8_;
                    *puVar17 = auVar54._0_8_;
                    puVar17[3] = uVar56;
                    puVar17[2] = uVar55;
                    uVar16 = uVar16 - 0x10;
                    puVar17 = puVar17 + 8;
                    pauVar18 = pauVar18 + 4;
                  } while (uVar16 != 0);
                  if (uVar32 == uVar31) goto LAB_100157a78;
                  uVar16 = uVar32;
                  if ((uVar39 & 0xc) == 0) goto LAB_100157abc;
                }
                lVar27 = uVar16 - uVar34;
                puVar17 = (undefined8 *)(lVar35 + uVar16 * 4);
                puVar19 = (undefined8 *)(lVar40 + lVar38 + uVar16 * 4);
                do {
                  uVar22 = *puVar17;
                  puVar19[1] = puVar17[1];
                  *puVar19 = uVar22;
                  lVar27 = lVar27 + 4;
                  puVar17 = puVar17 + 2;
                  puVar19 = puVar19 + 2;
                } while (lVar27 != 0);
                uVar16 = uVar34;
                if (uVar34 == uVar31) goto LAB_100157a78;
              }
LAB_100157abc:
              lVar40 = lVar40 + uVar26 * 4 * uVar16;
              lVar27 = uVar31 - uVar16;
              puVar36 = (undefined4 *)(lVar35 + uVar16 * 4);
              do {
                *(undefined4 *)(lVar40 + lVar38) = *puVar36;
                lVar40 = lVar40 + uVar26 * 4;
                lVar27 = lVar27 + -1;
                puVar36 = puVar36 + 1;
              } while (lVar27 != 0);
            }
LAB_100157a78:
            uVar14 = uVar14 + 1;
            lVar23 = lVar23 + 4;
            lVar38 = lVar38 + 4;
          } while (uVar14 != uVar26);
        }
        if (0 < (int)uVar11) {
          __ZN13CStdMemBuffer8putBlockEPvj
                    (param_4 + 400,*(undefined8 *)(param_4 + 0x170),uVar13 * 4 * uVar11);
        }
      }
      else {
LAB_1001570a4:
        if (bVar9) goto LAB_1001570ac;
        bVar9 = false;
      }
      uVar11 = (uint)uVar24;
      if (0 < *(int *)(param_4 + 0x150)) {
        uVar12 = __ZNK13CStdMemBuffer7getUsedEv(param_4 + 400);
        if (uVar12 < uVar11) {
          iVar46 = *(int *)(param_4 + 0x150);
          fVar45 = (float)iVar46;
        }
        else {
          uVar41 = 0;
          if (uVar11 != 0) {
            uVar41 = uVar12 / uVar11;
          }
          iVar46 = *(int *)(param_4 + 0x150);
          fVar45 = (float)iVar46 / (float)(int)uVar41 + 0.5;
        }
        uVar12 = (int)fVar45 / 2;
        if (2 < (int)fVar45 + 1U) {
          uVar41 = uVar12;
          if (uVar12 < 2) {
            uVar41 = 1;
          }
          lVar23 = (long)(int)uVar41;
          do {
            (**(code **)(**(long **)(param_4 + 0x148) + 0x30))();
            __ZN2dj5audio11BassSample334_elastiqueProcessCallsDoneThisTurnE =
                 __ZN2dj5audio11BassSample334_elastiqueProcessCallsDoneThisTurnE + 1;
            lVar23 = lVar23 + -1;
          } while (lVar23 != 0);
          iVar46 = *(int *)(param_4 + 0x150);
        }
        *(uint *)(param_4 + 0x150) = iVar46 - uVar12;
      }
      bVar8 = true;
    } while (bVar9);
    uVar13 = __ZNK13CStdMemBuffer7getUsedEv(param_4 + 400);
    if (uVar13 <= uVar11) {
      uVar11 = uVar13;
    }
    uVar26 = (ulong)uVar11;
    if (uVar11 == 0) {
      sVar42 = uVar24 & 0xffffffff;
      uVar26 = uVar24;
      if ((*(byte *)(param_4 + 0xbe8) & 1) == 0) {
        _bzero(param_2,sVar42);
        if (*(char *)(param_4 + 0xbe9) == '\x01') {
          *(undefined1 *)(param_4 + 0x11e) = 1;
        }
        if (*plVar1 == 0) {
          *plVar1 = 1;
        }
        else {
          __ZN11QBasicMutex12lockInternalEv(plVar1);
        }
        *(int *)(param_4 + 0xd8) = *(int *)(param_4 + 0xd4) >> 3;
        if (*(long *)(param_4 + 0x110) != 0) {
          (**(code **)(**(long **)(param_4 + 0x148) + 0x78))();
          *(undefined8 *)(param_4 + 0x110) = 0;
          *(undefined4 *)(param_4 + 0x150) = 0;
          *(undefined8 *)(param_4 + 0x158) = 0;
        }
        *(undefined8 *)(param_4 + 0x108) = 0;
        if (*(long *)(param_4 + 0x160) == 1) {
          *(long *)(param_4 + 0x160) = CONCAT44(in_register_000040fc,in_wzr);
        }
        else {
          __ZN11QBasicMutex14unlockInternalEv(plVar1);
        }
      }
      else {
        uVar26 = 0;
      }
      if (*(char *)(param_4 + 0xbe8) == '\x01') {
        uVar14 = (ulong)*(uint *)(param_4 + 0x100);
        if ((int)*(uint *)(param_4 + 0x100) < 0) {
          uVar14 = (ulong)*(int *)(param_4 + 0xd0);
        }
        uVar13 = *(uint *)(lVar33 + uVar14 * 4);
        if (((4 < uVar13) || ((1 << (ulong)(uVar13 & 0x1f) & 0x15U) == 0)) || (bVar20 == false)) {
          if (bVar5 == 0) {
            *(undefined1 *)(param_4 + 0xb4) = 0;
          }
          else {
            uVar13 = *(int *)(param_4 + 0xe8) - *(int *)(param_4 + 0xd4);
            uVar13 = uVar13 & ((int)uVar13 >> 0x1f ^ 0xffffffffU);
            uVar12 = *(int *)(param_4 + 0x1d8) * 4000;
            uVar11 = uVar13;
            if ((int)uVar12 <= (int)uVar13) {
              uVar11 = uVar12;
            }
            *(undefined4 *)(param_4 + 0x2b50) = 1000;
            if ((0 < (int)uVar11) &&
               (_memcpy(pvVar2,(void *)(*(long *)(param_4 + 0xe0) + (long)*(int *)(param_4 + 0xd4)),
                        (ulong)uVar11), *(char *)(param_4 + 0xb4) == '\x01')) {
              *(undefined4 *)(param_4 + 0x2b50) = 0;
            }
            if (uVar12 - uVar13 != 0 && (int)uVar13 <= (int)uVar12) {
              _bzero((void *)((long)pvVar2 + (ulong)uVar13),(long)(int)(uVar12 - uVar13));
            }
            uVar22 = *(undefined8 *)(param_4 + 0xe0);
            *(undefined8 *)(param_4 + 0xe0) = *(undefined8 *)(param_4 + 0xf8);
            *(undefined8 *)(param_4 + 0xf8) = uVar22;
            *(undefined4 *)(param_4 + 0xe8) = *(undefined4 *)(param_4 + 0xf0);
            *(undefined4 *)(param_4 + 0xf0) = 0;
            *(undefined4 *)(param_4 + 0x100) = 0xffffffff;
            __ZN2dj5audio11BassSample318compute_target_bpmEv(param_4);
            if (*(char *)(param_4 + 0x11c) == '\x01') {
              *(undefined4 *)(param_4 + 0xc08) = 1000;
              *(undefined1 *)(param_4 + 0x11c) = 0;
            }
            *(undefined8 *)(param_4 + 0x108) = *(undefined8 *)(param_4 + 0x110);
            *(undefined4 *)(param_4 + 0xd4) = 0;
            *(undefined4 *)(param_4 + 0xd8) = 0;
            *(undefined4 *)(param_4 + 0xbf8) = 0;
            if (*(int *)(param_4 + 0xec) == 2) {
              *(int *)(param_4 + 0xec) = in_wzr;
            }
          }
          if (*plVar1 == 0) {
            *plVar1 = 1;
          }
          else {
            __ZN11QBasicMutex12lockInternalEv(plVar1);
          }
          *(undefined8 *)(param_4 + 0xd4) = 0;
          if (*(long *)(param_4 + 0x110) != 0) {
            (**(code **)(**(long **)(param_4 + 0x148) + 0x78))();
            *(undefined8 *)(param_4 + 0x110) = 0;
            *(undefined4 *)(param_4 + 0x150) = 0;
            *(undefined8 *)(param_4 + 0x158) = 0;
          }
          *(undefined8 *)(param_4 + 0x108) = 0;
          if (*(long *)(param_4 + 0x160) == 1) {
            *(long *)(param_4 + 0x160) = CONCAT44(in_register_000040fc,in_wzr);
          }
          else {
            __ZN11QBasicMutex14unlockInternalEv(plVar1);
          }
          iVar46 = *(int *)(param_4 + 0xb0);
          iVar10 = *(int *)(param_4 + 0x118);
          __ZN8QVariantC1Ei(auStack_3f0,0);
          __ZN2dj5audio11BassSample323sample_property_changedENS_9AUDIOEnumEi8QVariant
                    (param_4,0x2a,iVar10 + iVar46 * 1000,auStack_3f0);
          __ZN8QVariantD1Ev(auStack_3f0);
          if (*(char *)(param_4 + 0xb4) != '\x01') goto LAB_100158124;
          *(undefined1 *)(param_4 + 0xbdc) = 1;
          uVar26 = uVar24;
          goto LAB_100156cc8;
        }
      }
    }
    else {
      __ZN13CStdMemBuffer8getBlockEPvj(param_4 + 400,param_2,uVar26);
    }
    if ((*(byte *)(param_4 + 0x1c4) & 1) == 0) {
      uVar11 = __ZNK13CStdMemBuffer7getUsedEv(param_4 + 0x1a8);
      uVar13 = (uint)uVar26;
      if (uVar11 <= (uint)uVar26) {
        uVar13 = uVar11;
      }
      __ZN13CStdMemBuffer8getBlockEPvj(param_4 + 0x1a8,*(undefined8 *)(param_4 + 0x188),uVar13);
      if (3 < uVar13) {
        uVar14 = (ulong)(long)(int)uVar13 >> 2;
        pfVar29 = *(float **)(param_4 + 0x188);
        iVar46 = *(int *)(param_4 + 0x1c0);
        uVar24 = uVar14;
        if (uVar14 < 3) {
          uVar24 = 2;
        }
        uVar24 = uVar24 - 1 >> 1;
        uVar39 = (ulong)(iVar46 - 1);
        if (uVar39 <= uVar24) {
          uVar24 = uVar39;
        }
        iVar10 = iVar46;
        if (uVar24 < 0x10) {
LAB_100157dd0:
          uVar32 = 0;
          uVar13 = 0;
        }
        else {
          uVar13 = 0;
          uVar32 = 0;
          uVar31 = uVar14;
          if (uVar14 < 3) {
            uVar31 = 2;
          }
          uVar31 = uVar31 - 1 >> 1;
          if (uVar39 <= uVar31) {
            uVar31 = uVar39;
          }
          if ((((((uint)uVar31 ^ 0xffffffff) & 0x7fffffff) != 0) && (-1 < (int)(uint)uVar31)) &&
             ((param_2 + 1 <= param_2 + 1 + uVar31 * 2 && (param_2 <= param_2 + uVar31 * 2)))) {
            uVar31 = uVar14;
            if (uVar14 < 3) {
              uVar31 = 2;
            }
            uVar31 = uVar31 - 1 >> 1;
            if (uVar39 <= uVar31) {
              uVar31 = uVar39;
            }
            if ((param_2 < pfVar29 + uVar31 * 2 + 2) && (pfVar29 < param_2 + uVar31 * 2 + 2))
            goto LAB_100157dd0;
            uVar39 = 0;
            uVar31 = uVar24 + 1 & 3;
            uVar34 = 4;
            if (uVar31 != 0) {
              uVar34 = uVar31;
            }
            lVar33 = (uVar24 + 1) - uVar34;
            iVar47 = (int)lVar33;
            iVar10 = iVar46 - iVar47;
            uVar32 = lVar33 * 2;
            uVar13 = iVar47 << 1;
            iVar47 = iVar46 + -1;
            iVar48 = iVar46 + -2;
            iVar49 = iVar46 + -3;
            lVar33 = ~uVar24 + uVar34;
            auVar54 = NEON_fmov(0x3f800000,4);
            pfVar28 = pfVar29;
            pfVar30 = param_2;
            do {
              auVar57._4_4_ = iVar47;
              auVar57._0_4_ = iVar46;
              auVar57._8_4_ = iVar48;
              auVar57._12_4_ = iVar49;
              auVar57 = NEON_scvtf(auVar57,4);
              fVar60 = *pfVar30;
              fVar64 = pfVar30[1];
              fVar61 = pfVar30[2];
              fVar65 = pfVar30[3];
              fVar62 = pfVar30[4];
              fVar66 = pfVar30[5];
              fVar63 = pfVar30[6];
              fVar67 = pfVar30[7];
              pfVar30 = pfVar30 + 8;
              fVar45 = auVar57._0_4_ / 100.0;
              fVar58 = auVar57._4_4_ / 100.0;
              fVar50 = auVar57._8_4_ / 100.0;
              fVar59 = auVar57._12_4_ / 100.0;
              fVar76 = *pfVar28;
              fVar80 = pfVar28[1];
              fVar77 = pfVar28[2];
              fVar81 = pfVar28[3];
              fVar78 = pfVar28[4];
              fVar82 = pfVar28[5];
              fVar79 = pfVar28[6];
              fVar83 = pfVar28[7];
              pfVar28 = pfVar28 + 8;
              fVar68 = auVar54._0_4_ - fVar45;
              fVar69 = auVar54._4_4_ - fVar58;
              fVar70 = auVar54._8_4_ - fVar50;
              fVar71 = auVar54._12_4_ - fVar59;
              uVar24 = uVar39 & 0xfffffff8;
              param_2[uVar24] = fVar45 * fVar76 + fVar68 * fVar60;
              param_2[uVar24 + 1] = fVar45 * fVar80 + fVar68 * fVar64;
              param_2[uVar24 + 2] = fVar58 * fVar77 + fVar69 * fVar61;
              param_2[uVar24 + 3] = fVar58 * fVar81 + fVar69 * fVar65;
              param_2[uVar24 + 4] = fVar50 * fVar78 + fVar70 * fVar62;
              param_2[uVar24 + 5] = fVar50 * fVar82 + fVar70 * fVar66;
              param_2[uVar24 + 6] = fVar59 * fVar79 + fVar71 * fVar63;
              param_2[uVar24 + 7] = fVar59 * fVar83 + fVar71 * fVar67;
              iVar46 = iVar46 + -4;
              iVar47 = iVar47 + -4;
              iVar48 = iVar48 + -4;
              iVar49 = iVar49 + -4;
              uVar39 = uVar39 + 8;
              lVar33 = lVar33 + 4;
            } while (lVar33 != 0);
          }
        }
        do {
          fVar45 = (float)iVar10 / 100.0;
          param_2[uVar32] = fVar45 * pfVar29[uVar32] + (1.0 - fVar45) * param_2[uVar32];
          uVar11 = uVar13 + 1;
          param_2[uVar11] = fVar45 * pfVar29[uVar11] + (1.0 - fVar45) * param_2[uVar11];
          iVar10 = iVar10 + -1;
          if (iVar10 == 0) {
            *(undefined4 *)(param_4 + 0x1c0) = 0;
            __ZN13CStdMemBuffer5clearEv(param_4 + 0x1a8);
            goto LAB_100157f28;
          }
          uVar32 = (ulong)(uVar13 + 2);
          uVar13 = uVar13 + 2;
        } while (uVar32 < uVar14);
        *(int *)(param_4 + 0x1c0) = iVar10;
      }
    }
  }
LAB_100157f28:
  *(int *)(param_4 + 0x1f0) = *(int *)(param_4 + 0x1f0) + (int)uVar26;
LAB_100158128:
  iVar46 = *(int *)(param_4 + 0x104) + -1;
  *(int *)(param_4 + 0x104) = iVar46;
  if ((iVar46 == 0) && (*(int *)(param_4 + 0xec) == 2)) {
    *(int *)(param_4 + 0xec) = 1;
  }
  if (*(long *)PTR____stack_chk_guard_10172c568 != local_b0) {
                    /* WARNING: Subroutine does not return */
    ___stack_chk_fail();
  }
  return uVar26;
}

