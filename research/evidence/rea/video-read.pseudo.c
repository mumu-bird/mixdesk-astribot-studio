
void __ZN5Video4readEv(long param_1)

{
  undefined *puVar1;
  undefined *puVar2;
  int iVar3;
  int iVar4;
  int iVar5;
  long lVar6;
  undefined8 uVar7;
  long lVar8;
  long lVar9;
  ulong uVar10;
  undefined8 uVar11;
  long lVar12;
  int *piVar13;
  int *piVar14;
  long *plVar15;
  long *plVar16;
  undefined8 *puVar17;
  double dVar18;
  int *local_120;
  undefined8 uStack_118;
  undefined8 local_110;
  int *local_100;
  undefined8 *puStack_f8;
  long local_f0;
  int *local_e0;
  undefined *puStack_d8;
  undefined8 local_d0;
  int *local_c0;
  undefined8 *puStack_b8;
  long local_b0;
  int *local_a8;
  long *local_a0;
  long local_98;
  int *local_90;
  undefined8 *puStack_88;
  long local_80;
  
  lVar6 = (**(code **)(**(long **)(param_1 + 0x10) + 0xa0))();
  if (lVar6 != 0) {
    __ZN9QIODevice7readAllEv(&local_e0,*(undefined8 *)(param_1 + 0x10));
    iVar4 = __ZNK10QByteArray6isNullEv(&local_e0);
    puVar1 = PTR___ZN10QByteArray6_emptyE_10172c340;
    if (puStack_d8 != (undefined *)0x0) {
      puVar1 = puStack_d8;
    }
    puVar2 = (undefined *)0x0;
    if (iVar4 == 0) {
      puVar2 = puVar1;
    }
    __ZN7QString8fromUtf8E14QByteArrayView(&local_90,local_d0,puVar2);
    puStack_b8 = puStack_88;
    local_c0 = local_90;
    local_b0 = local_80;
    __ZNK7QString5splitE5QChar6QFlagsIN2Qt18SplitBehaviorFlagsEENS2_15CaseSensitivityE
              (&local_a8,&local_c0,10,0,1);
    if (local_c0 != (int *)0x0) {
      LOAcquire();
      iVar4 = *local_c0;
      *local_c0 = iVar4 + -1;
      LORelease();
      if (iVar4 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_c0,2,8);
      }
    }
    if (local_e0 != (int *)0x0) {
      LOAcquire();
      iVar4 = *local_e0;
      *local_e0 = iVar4 + -1;
      LORelease();
      if (iVar4 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_e0,1,8);
      }
    }
    if ((((local_a8 == (int *)0x0) || (1 < *local_a8)) &&
        (FUN_100015064(&local_a8,0,0,0), local_a8 == (int *)0x0)) ||
       (plVar15 = local_a0, 1 < *local_a8)) {
      plVar15 = local_a0;
      FUN_100015064(&local_a8,0,0,0);
    }
    plVar16 = local_a0 + local_98 * 3;
    if (plVar15 != plVar16) {
      lVar6 = param_1 + 0x30;
      do {
        piVar14 = (int *)*plVar15;
        puVar17 = (undefined8 *)plVar15[1];
        lVar12 = plVar15[2];
        if (piVar14 == (int *)0x0) {
          if (lVar12 != 0) {
            local_90 = (int *)0x0;
            goto LAB_10074c1c0;
          }
        }
        else {
          LOAcquire();
          *piVar14 = *piVar14 + 1;
          LORelease();
          if (lVar12 == 0) {
            iVar4 = 3;
LAB_10074d048:
            LOAcquire();
            iVar3 = *piVar14;
            *piVar14 = iVar3 + -1;
            LORelease();
            if (iVar3 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(piVar14,2,8);
            }
          }
          else {
            LOAcquire();
            *piVar14 = *piVar14 + 1;
            LORelease();
            local_90 = piVar14;
LAB_10074c1c0:
            puStack_88 = puVar17;
            local_80 = lVar12;
            __ZNK7QString5splitE5QChar6QFlagsIN2Qt18SplitBehaviorFlagsEENS2_15CaseSensitivityE
                      (&local_c0,&local_90,9,0,1);
            if (local_90 != (int *)0x0) {
              LOAcquire();
              iVar4 = *local_90;
              *local_90 = iVar4 + -1;
              LORelease();
              if (iVar4 == 1) {
                __ZN10QArrayData10deallocateEPS_xx(local_90,2,8);
              }
            }
            if (local_b0 == 0) {
              iVar4 = 3;
            }
            else {
              if ((local_c0 == (int *)0x0) || (1 < *local_c0)) {
                FUN_100015064(&local_c0,0,0,0);
              }
              puStack_d8 = (undefined *)puStack_b8[1];
              local_e0 = (int *)*puStack_b8;
              local_d0 = puStack_b8[2];
              if (local_e0 != (int *)0x0) {
                LOAcquire();
                *local_e0 = *local_e0 + 1;
                LORelease();
              }
              __ZN7QString8fromUtf8E14QByteArrayView(&local_90,4,"hide");
              puStack_f8 = puStack_88;
              local_100 = local_90;
              local_f0 = local_80;
              iVar4 = __ZNK7QString7compareERKS_N2Qt15CaseSensitivityE(&local_e0,&local_100,1);
              if (local_100 != (int *)0x0) {
                LOAcquire();
                iVar3 = *local_100;
                *local_100 = iVar3 + -1;
                LORelease();
                if (iVar3 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
                }
              }
              if (iVar4 == 0) {
                *(undefined1 *)(param_1 + 0x19) = 1;
                iVar4 = 2;
              }
              else {
                __ZN7QString8fromUtf8E14QByteArrayView(&local_90,4,"size");
                puStack_f8 = puStack_88;
                local_100 = local_90;
                local_f0 = local_80;
                iVar4 = __ZNK7QString7compareERKS_N2Qt15CaseSensitivityE(&local_e0,&local_100,1);
                if (local_100 != (int *)0x0) {
                  LOAcquire();
                  iVar3 = *local_100;
                  *local_100 = iVar3 + -1;
                  LORelease();
                  if (iVar3 == 1) {
                    __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
                  }
                }
                if (iVar4 == 0) {
                  if (local_b0 != 3) goto LAB_10074cfac;
                  if ((((local_c0 == (int *)0x0) || (1 < *local_c0)) &&
                      (FUN_100015064(&local_c0,0,0,0), local_c0 == (int *)0x0)) || (1 < *local_c0))
                  {
                    FUN_100015064(&local_c0,0,0,0);
                  }
                  lVar12 = __ZN7QString17toIntegral_helperE11QStringViewPbi
                                     (puStack_b8[5],puStack_b8[4],0,10);
                  if ((((local_c0 == (int *)0x0) || (1 < *local_c0)) &&
                      (FUN_100015064(&local_c0,0,0,0), local_c0 == (int *)0x0)) || (1 < *local_c0))
                  {
                    FUN_100015064(&local_c0,0,0,0);
                  }
                  lVar8 = __ZN7QString17toIntegral_helperE11QStringViewPbi
                                    (puStack_b8[8],puStack_b8[7],0,10);
                  iVar4 = 0;
                  iVar3 = (int)lVar12 + -1;
                  if (lVar12 + 0x80000000U >> 0x20 != 0) {
                    iVar3 = -1;
                  }
                  iVar5 = (int)lVar8 + -1;
                  if (lVar8 != (int)lVar8) {
                    iVar5 = -1;
                  }
                  *(int *)(param_1 + 0x24) = *(int *)(param_1 + 0x1c) + iVar3;
                  *(int *)(param_1 + 0x28) = *(int *)(param_1 + 0x20) + iVar5;
                }
                else {
                  __ZN7QString8fromUtf8E14QByteArrayView(&local_90,4,"move");
                  puStack_f8 = puStack_88;
                  local_100 = local_90;
                  local_f0 = local_80;
                  iVar4 = __ZNK7QString7compareERKS_N2Qt15CaseSensitivityE(&local_e0,&local_100,1);
                  if (local_100 != (int *)0x0) {
                    LOAcquire();
                    iVar3 = *local_100;
                    *local_100 = iVar3 + -1;
                    LORelease();
                    if (iVar3 == 1) {
                      __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
                    }
                  }
                  if (iVar4 == 0) {
                    if (local_b0 != 3) goto LAB_10074cfac;
                    if ((((local_c0 == (int *)0x0) || (1 < *local_c0)) &&
                        (FUN_100015064(&local_c0,0,0,0), local_c0 == (int *)0x0)) || (1 < *local_c0)
                       ) {
                      FUN_100015064(&local_c0,0,0,0);
                    }
                    lVar12 = __ZN7QString17toIntegral_helperE11QStringViewPbi
                                       (puStack_b8[5],puStack_b8[4],0,10);
                    iVar3 = (int)lVar12;
                    if (lVar12 != iVar3) {
                      iVar3 = 0;
                    }
                    if ((((local_c0 == (int *)0x0) || (1 < *local_c0)) &&
                        (FUN_100015064(&local_c0,0,0,0), local_c0 == (int *)0x0)) || (1 < *local_c0)
                       ) {
                      FUN_100015064(&local_c0,0,0,0);
                    }
                    lVar12 = __ZN7QString17toIntegral_helperE11QStringViewPbi
                                       (puStack_b8[8],puStack_b8[7],0,10);
                    iVar4 = 0;
                    iVar5 = (int)lVar12;
                    if (lVar12 != iVar5) {
                      iVar5 = 0;
                    }
                    *(int *)(param_1 + 0x1c) = iVar3;
                    *(int *)(param_1 + 0x20) = iVar5;
                  }
                  else {
                    __ZN7QString8fromUtf8E14QByteArrayView(&local_90,4,"path");
                    puStack_f8 = puStack_88;
                    local_100 = local_90;
                    local_f0 = local_80;
                    iVar4 = __ZNK7QString7compareERKS_N2Qt15CaseSensitivityE(&local_e0,&local_100,1)
                    ;
                    if (local_100 != (int *)0x0) {
                      LOAcquire();
                      iVar3 = *local_100;
                      *local_100 = iVar3 + -1;
                      LORelease();
                      if (iVar3 == 1) {
                        __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
                      }
                    }
                    if (iVar4 == 0) {
                      if (local_b0 != 4) goto LAB_10074cfac;
                      if ((((local_c0 == (int *)0x0) || (1 < *local_c0)) &&
                          (FUN_100015064(&local_c0,0,0,0), local_c0 == (int *)0x0)) ||
                         (1 < *local_c0)) {
                        FUN_100015064(&local_c0,0,0,0);
                      }
                      uStack_118 = puStack_b8[4];
                      local_120 = (int *)puStack_b8[3];
                      local_110 = puStack_b8[5];
                      if (local_120 != (int *)0x0) {
                        LOAcquire();
                        *local_120 = *local_120 + 1;
                        LORelease();
                      }
                      if ((((local_c0 == (int *)0x0) || (1 < *local_c0)) &&
                          (FUN_100015064(&local_c0,0,0,0), local_c0 == (int *)0x0)) ||
                         (1 < *local_c0)) {
                        FUN_100015064(&local_c0,0,0,0);
                      }
                      lVar12 = __ZN7QString17toIntegral_helperE11QStringViewPbi
                                         (puStack_b8[8],puStack_b8[7],0,10);
                      if ((((local_c0 == (int *)0x0) || (1 < *local_c0)) &&
                          (FUN_100015064(&local_c0,0,0,0), local_c0 == (int *)0x0)) ||
                         (1 < *local_c0)) {
                        FUN_100015064(&local_c0,0,0,0);
                      }
                      uVar10 = __ZN7QString17toIntegral_helperE11QStringViewPbi
                                         (puStack_b8[0xb],puStack_b8[10],0,10);
                      if (uVar10 == (long)(int)uVar10) {
                        if (uVar10 < 2) goto LAB_10074cbf4;
                      }
                      else {
                        uVar10 = 0;
LAB_10074cbf4:
                        lVar8 = lVar6 + uVar10 * 0x58;
                        *(undefined1 *)(lVar8 + 0x40) = 0;
                        __ZN7QStringaSERKS_(lVar8,&local_120);
                        *(bool *)(lVar8 + 0x41) = lVar12 != 0 && lVar12 == (int)lVar12;
                      }
                      if (local_120 != (int *)0x0) {
                        LOAcquire();
                        iVar4 = *local_120;
                        *local_120 = iVar4 + -1;
                        LORelease();
                        if (iVar4 == 1) {
                          __ZN10QArrayData10deallocateEPS_xx(local_120,2,8);
                        }
                      }
                    }
                    else {
                      __ZN7QString8fromUtf8E14QByteArrayView(&local_90,4,"rate");
                      puStack_f8 = puStack_88;
                      local_100 = local_90;
                      local_f0 = local_80;
                      iVar4 = __ZNK7QString7compareERKS_N2Qt15CaseSensitivityE
                                        (&local_e0,&local_100,1);
                      if (local_100 != (int *)0x0) {
                        LOAcquire();
                        iVar3 = *local_100;
                        *local_100 = iVar3 + -1;
                        LORelease();
                        if (iVar3 == 1) {
                          __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
                        }
                      }
                      if (iVar4 == 0) {
                        if (local_b0 == 3) {
                          if ((((local_c0 == (int *)0x0) || (1 < *local_c0)) &&
                              (FUN_100015064(&local_c0,0,0,0), local_c0 == (int *)0x0)) ||
                             (1 < *local_c0)) {
                            FUN_100015064(&local_c0,0,0,0);
                          }
                          uVar7 = __ZNK7QString8toDoubleEPb(puStack_b8 + 3,0);
                          if ((((local_c0 == (int *)0x0) || (1 < *local_c0)) &&
                              (FUN_100015064(&local_c0,0,0,0), local_c0 == (int *)0x0)) ||
                             (1 < *local_c0)) {
                            FUN_100015064(&local_c0,0,0,0);
                          }
                          uVar10 = __ZN7QString17toIntegral_helperE11QStringViewPbi
                                             (puStack_b8[8],puStack_b8[7],0,10);
                          *(undefined1 *)(param_1 + 0xe0) = 1;
                          if (uVar10 == (long)(int)uVar10) {
                            if (1 < uVar10) goto LAB_10074cfac;
                          }
                          else {
                            uVar10 = 0;
                          }
                          iVar4 = 0;
                          *(undefined8 *)(lVar6 + uVar10 * 0x58 + 0x38) = uVar7;
                          goto LAB_10074cfb0;
                        }
                      }
                      else {
                        __ZN7QString8fromUtf8E14QByteArrayView(&local_90,4,"play");
                        puStack_f8 = puStack_88;
                        local_100 = local_90;
                        local_f0 = local_80;
                        iVar4 = __ZNK7QString7compareERKS_N2Qt15CaseSensitivityE
                                          (&local_e0,&local_100,1);
                        if (local_100 != (int *)0x0) {
                          LOAcquire();
                          iVar3 = *local_100;
                          *local_100 = iVar3 + -1;
                          LORelease();
                          if (iVar3 == 1) {
                            __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
                          }
                        }
                        if (iVar4 == 0) {
                          if (local_b0 == 2) {
                            if ((((local_c0 == (int *)0x0) || (1 < *local_c0)) &&
                                (FUN_100015064(&local_c0,0,0,0), local_c0 == (int *)0x0)) ||
                               (1 < *local_c0)) {
                              FUN_100015064(&local_c0,0,0,0);
                            }
                            uVar10 = __ZN7QString17toIntegral_helperE11QStringViewPbi
                                               (puStack_b8[5],puStack_b8[4],0,10);
                            if (uVar10 == (long)(int)uVar10) {
                              if (1 < uVar10) goto LAB_10074cfac;
                            }
                            else {
                              uVar10 = 0;
                            }
                            iVar4 = 0;
                            *(undefined1 *)(lVar6 + uVar10 * 0x58 + 0x41) = 1;
                            goto LAB_10074cfb0;
                          }
                        }
                        else {
                          __ZN7QString8fromUtf8E14QByteArrayView(&local_90,5,"pause");
                          puStack_f8 = puStack_88;
                          local_100 = local_90;
                          local_f0 = local_80;
                          iVar4 = __ZNK7QString7compareERKS_N2Qt15CaseSensitivityE
                                            (&local_e0,&local_100,1);
                          if (local_100 != (int *)0x0) {
                            LOAcquire();
                            iVar3 = *local_100;
                            *local_100 = iVar3 + -1;
                            LORelease();
                            if (iVar3 == 1) {
                              __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
                            }
                          }
                          if (iVar4 == 0) {
                            if (local_b0 == 3) {
                              if ((((local_c0 == (int *)0x0) || (1 < *local_c0)) &&
                                  (FUN_100015064(&local_c0,0,0,0), local_c0 == (int *)0x0)) ||
                                 (1 < *local_c0)) {
                                FUN_100015064(&local_c0,0,0,0);
                              }
                              lVar12 = __ZNK7QString10toLongLongEPbi(puStack_b8 + 3,0,10);
                              if ((((local_c0 == (int *)0x0) || (1 < *local_c0)) &&
                                  (FUN_100015064(&local_c0,0,0,0), local_c0 == (int *)0x0)) ||
                                 (1 < *local_c0)) {
                                FUN_100015064(&local_c0,0,0,0);
                              }
                              uVar10 = __ZN7QString17toIntegral_helperE11QStringViewPbi
                                                 (puStack_b8[8],puStack_b8[7],0,10);
                              if (uVar10 == (long)(int)uVar10) {
                                if (1 < uVar10) goto LAB_10074cfac;
                              }
                              else {
                                uVar10 = 0;
                              }
                              lVar8 = lVar6 + uVar10 * 0x58;
                              if (*(char *)(lVar8 + 0x41) == '\x01') {
                                *(undefined1 *)(lVar8 + 0x41) = 0;
                                lVar12 = (long)(double)lVar12;
                                *(undefined8 *)(lVar8 + 0x28) = 0x8000000000000000;
                                *(long *)(lVar8 + 0x30) = lVar12;
                                if (*(long *)(lVar8 + 0x20) == lVar12) {
                                  iVar3 = *(int *)(lVar8 + 0x18) + 1;
                                }
                                else {
                                  *(long *)(lVar8 + 0x20) = lVar12;
                                  iVar3 = 1;
                                }
                                iVar4 = 0;
                                *(int *)(lVar8 + 0x18) = iVar3;
                                *(undefined8 *)(lVar8 + 0x48) = 0x8000000000000000;
                                goto LAB_10074cfb0;
                              }
                            }
                          }
                          else {
                            __ZN7QString8fromUtf8E14QByteArrayView(&local_90,4,"stop");
                            puStack_f8 = puStack_88;
                            local_100 = local_90;
                            local_f0 = local_80;
                            iVar4 = __ZNK7QString7compareERKS_N2Qt15CaseSensitivityE
                                              (&local_e0,&local_100,1);
                            if (local_100 != (int *)0x0) {
                              LOAcquire();
                              iVar3 = *local_100;
                              *local_100 = iVar3 + -1;
                              LORelease();
                              if (iVar3 == 1) {
                                __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
                              }
                            }
                            if (iVar4 == 0) {
                              if (local_b0 == 2) {
                                if ((((local_c0 == (int *)0x0) || (1 < *local_c0)) &&
                                    (FUN_100015064(&local_c0,0,0,0), local_c0 == (int *)0x0)) ||
                                   (1 < *local_c0)) {
                                  FUN_100015064(&local_c0,0,0,0);
                                }
                                uVar10 = __ZN7QString17toIntegral_helperE11QStringViewPbi
                                                   (puStack_b8[5],puStack_b8[4],0,10);
                                if (uVar10 == (long)(int)uVar10) {
                                  if (1 < uVar10) goto LAB_10074cfac;
                                }
                                else {
                                  uVar10 = 0;
                                }
                                iVar4 = 0;
                                *(undefined2 *)(lVar6 + uVar10 * 0x58 + 0x40) = 0;
                                goto LAB_10074cfb0;
                              }
                            }
                            else {
                              __ZN7QString8fromUtf8E14QByteArrayView(&local_90,3,"pos");
                              puStack_f8 = puStack_88;
                              local_100 = local_90;
                              local_f0 = local_80;
                              iVar4 = __ZNK7QString7compareERKS_N2Qt15CaseSensitivityE
                                                (&local_e0,&local_100,1);
                              if (local_100 != (int *)0x0) {
                                LOAcquire();
                                iVar3 = *local_100;
                                *local_100 = iVar3 + -1;
                                LORelease();
                                if (iVar3 == 1) {
                                  __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
                                }
                              }
                              if (iVar4 == 0) {
                                if (local_b0 == 4) {
                                  uVar7 = FUN_1000be7b8(&local_c0,1);
                                  uVar7 = __ZNK7QString10toLongLongEPbi(uVar7,0,10);
                                  lVar12 = FUN_1000be7b8(&local_c0,2);
                                  lVar12 = __ZN7QString17toIntegral_helperE11QStringViewPbi
                                                     (*(undefined8 *)(lVar12 + 0x10),
                                                      *(undefined8 *)(lVar12 + 8),0,10);
                                  iVar4 = (int)lVar12;
                                  if (lVar12 != iVar4) {
                                    iVar4 = 0;
                                  }
                                  uVar11 = FUN_1000be7b8(&local_c0,3);
                                  uVar11 = __ZNK7QString10toLongLongEPbi(uVar11,0,10);
                                }
                                else {
                                  if (local_b0 != 3) goto LAB_10074cfac;
                                  uVar7 = FUN_1000be7b8(&local_c0,1);
                                  uVar7 = __ZNK7QString10toLongLongEPbi(uVar7,0,10);
                                  lVar12 = FUN_1000be7b8(&local_c0,2);
                                  lVar12 = __ZN7QString17toIntegral_helperE11QStringViewPbi
                                                     (*(undefined8 *)(lVar12 + 0x10),
                                                      *(undefined8 *)(lVar12 + 8),0,10);
                                  iVar4 = (int)lVar12;
                                  if (lVar12 != iVar4) {
                                    iVar4 = 0;
                                  }
                                  uVar11 = 0x8000000000000000;
                                }
                                __ZN5Video11setPositionExix(param_1,uVar7,iVar4,uVar11);
                              }
                              else {
                                __ZN7QString8fromUtf8E14QByteArrayView(&local_90,4,"load");
                                puStack_f8 = puStack_88;
                                local_100 = local_90;
                                local_f0 = local_80;
                                iVar4 = __ZNK7QString7compareERKS_N2Qt15CaseSensitivityE
                                                  (&local_e0,&local_100,1);
                                if (local_100 != (int *)0x0) {
                                  LOAcquire();
                                  iVar3 = *local_100;
                                  *local_100 = iVar3 + -1;
                                  LORelease();
                                  if (iVar3 == 1) {
                                    __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
                                  }
                                }
                                if (iVar4 != 0) {
                                  __ZN7QString8fromUtf8E14QByteArrayView(&local_90,5,"alpha");
                                  puStack_f8 = puStack_88;
                                  local_100 = local_90;
                                  local_f0 = local_80;
                                  iVar3 = __ZNK7QString7compareERKS_N2Qt15CaseSensitivityE
                                                    (&local_e0,&local_100,1);
                                  if (local_100 != (int *)0x0) {
                                    LOAcquire();
                                    iVar4 = *local_100;
                                    *local_100 = iVar4 + -1;
                                    LORelease();
                                    if (iVar4 == 1) {
                                      __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
                                    }
                                  }
                                  iVar4 = 0;
                                  if ((iVar3 == 0) && (local_b0 == 2)) {
                                    uVar7 = FUN_1000be7b8(&local_c0,1);
                                    dVar18 = (double)__ZNK7QString8toDoubleEPb(uVar7,0);
                                    iVar4 = 0;
                                    *(double *)(param_1 + 0x80) = dVar18;
                                    *(double *)(param_1 + 0xd8) = 1.0 - dVar18;
                                  }
                                  goto LAB_10074cfb0;
                                }
                                if (local_b0 == 4) {
                                  lVar12 = FUN_1000be7b8(&local_c0,1);
                                  lVar12 = __ZN7QString17toIntegral_helperE11QStringViewPbi
                                                     (*(undefined8 *)(lVar12 + 0x10),
                                                      *(undefined8 *)(lVar12 + 8),0,10);
                                  lVar8 = FUN_1000be7b8(&local_c0,2);
                                  lVar8 = __ZN7QString17toIntegral_helperE11QStringViewPbi
                                                    (*(undefined8 *)(lVar8 + 0x10),
                                                     *(undefined8 *)(lVar8 + 8),0,10);
                                  lVar9 = FUN_1000be7b8(&local_c0,3);
                                  uVar10 = __ZN7QString17toIntegral_helperE11QStringViewPbi
                                                     (*(undefined8 *)(lVar9 + 0x10),
                                                      *(undefined8 *)(lVar9 + 8),0,10);
                                  if (uVar10 == (long)(int)uVar10) {
                                    if (1 < uVar10) goto LAB_10074cfac;
                                  }
                                  else {
                                    uVar10 = 0;
                                  }
                                  iVar4 = 0;
                                  lVar9 = lVar6 + uVar10 * 0x58;
                                  *(bool *)(lVar9 + 0x40) = lVar12 != 0 && lVar12 == (int)lVar12;
                                  *(bool *)(lVar9 + 0x41) = lVar8 != 0 && lVar8 == (int)lVar8;
                                  goto LAB_10074cfb0;
                                }
                              }
                            }
                          }
                        }
                      }
                    }
LAB_10074cfac:
                    iVar4 = 0;
                  }
                }
              }
LAB_10074cfb0:
              if (local_e0 != (int *)0x0) {
                LOAcquire();
                iVar3 = *local_e0;
                *local_e0 = iVar3 + -1;
                LORelease();
                if (iVar3 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
                }
              }
            }
            if (local_c0 != (int *)0x0) {
              LOAcquire();
              iVar3 = *local_c0;
              *local_c0 = iVar3 + -1;
              LORelease();
              if (iVar3 == 1) {
                if (local_b0 != 0) {
                  lVar12 = local_b0 * 0x18;
                  puVar17 = puStack_b8;
                  do {
                    piVar13 = (int *)*puVar17;
                    if (piVar13 != (int *)0x0) {
                      LOAcquire();
                      iVar3 = *piVar13;
                      *piVar13 = iVar3 + -1;
                      LORelease();
                      if (iVar3 == 1) {
                        __ZN10QArrayData10deallocateEPS_xx(*puVar17,2,8);
                      }
                    }
                    puVar17 = puVar17 + 3;
                    lVar12 = lVar12 + -0x18;
                  } while (lVar12 != 0);
                }
                __ZN10QArrayData10deallocateEPS_xx(local_c0,0x18,8);
              }
            }
            if (piVar14 != (int *)0x0) goto LAB_10074d048;
          }
          if ((iVar4 != 3) && (iVar4 != 0)) break;
        }
        plVar15 = plVar15 + 3;
      } while (plVar15 != plVar16);
    }
    if (local_a8 != (int *)0x0) {
      LOAcquire();
      iVar4 = *local_a8;
      *local_a8 = iVar4 + -1;
      LORelease();
      if (iVar4 == 1) {
        if (local_98 != 0) {
          lVar6 = local_98 * 0x18;
          plVar15 = local_a0;
          do {
            piVar14 = (int *)*plVar15;
            if (piVar14 != (int *)0x0) {
              LOAcquire();
              iVar4 = *piVar14;
              *piVar14 = iVar4 + -1;
              LORelease();
              if (iVar4 == 1) {
                __ZN10QArrayData10deallocateEPS_xx(*plVar15,2,8);
              }
            }
            plVar15 = plVar15 + 3;
            lVar6 = lVar6 + -0x18;
          } while (lVar6 != 0);
        }
        __ZN10QArrayData10deallocateEPS_xx(local_a8,0x18,8);
      }
    }
  }
  return;
}

