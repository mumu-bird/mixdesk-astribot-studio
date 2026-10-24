
uint __ZN2dj23getDJSSampleListFromXMLE7QStringP5QListIS1_INS_10SampleInfoEEE
               (undefined8 param_1,undefined8 *param_2)

{
  undefined *puVar1;
  undefined *puVar2;
  int iVar3;
  int iVar4;
  int iVar5;
  uint uVar6;
  uint uVar7;
  ulong uVar8;
  long lVar9;
  undefined8 *puVar10;
  int *piVar11;
  undefined8 uVar12;
  undefined8 uVar13;
  long lVar14;
  bool bVar15;
  long lVar16;
  uint unaff_w21;
  undefined4 uVar17;
  int *local_238 [3];
  int *local_220;
  undefined8 uStack_218;
  undefined8 local_210;
  int *local_200;
  undefined *puStack_1f8;
  undefined8 local_1f0;
  undefined1 auStack_1e8 [8];
  undefined1 auStack_1e0 [8];
  int *local_1d8 [3];
  int *local_1c0;
  undefined *puStack_1b8;
  undefined8 local_1b0;
  undefined1 auStack_1a0 [8];
  undefined1 auStack_198 [8];
  int *local_190;
  undefined8 uStack_188;
  undefined8 local_180;
  int *local_170;
  undefined8 uStack_168;
  undefined8 local_160;
  int *local_150;
  undefined8 uStack_148;
  undefined8 local_140;
  int *local_130;
  undefined8 uStack_128;
  undefined8 local_120;
  int *local_110;
  undefined *puStack_108;
  undefined8 local_100;
  int *local_f0 [3];
  undefined1 auStack_d8 [8];
  undefined1 auStack_d0 [4];
  undefined1 auStack_cc [4];
  int *local_c8;
  undefined8 uStack_c0;
  undefined8 local_b8;
  undefined1 auStack_b0 [8];
  undefined1 auStack_a8 [16];
  undefined1 auStack_98 [8];
  int *local_90;
  undefined *puStack_88;
  undefined8 local_80;
  
  __ZN9QFileInfoC1ERK7QString(auStack_98,param_1);
  __ZNK9QFileInfo17canonicalFilePathEv(&local_90);
  __ZN5QFileC1ERK7QString(auStack_a8,&local_90);
  if (local_90 != (int *)0x0) {
    LOAcquire();
    iVar3 = *local_90;
    *local_90 = iVar3 + -1;
    LORelease();
    if (iVar3 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_90,2,8);
    }
  }
  __ZN12QDomDocumentC1Ev(auStack_b0);
  iVar3 = __ZN5QFile4openE6QFlagsIN13QIODeviceBase12OpenModeFlagEE(auStack_a8,1);
  if (iVar3 != 0) {
    local_c8 = (int *)0x0;
    uStack_c0 = 0;
    local_b8 = 0;
    iVar3 = __ZN12QDomDocument10setContentEP9QIODeviceP7QStringPiS4_
                      (auStack_b0,auStack_a8,&local_c8,auStack_cc,auStack_d0);
    if (iVar3 == 0) {
LAB_100eae450:
      bVar15 = true;
    }
    else {
      __ZNK12QDomDocument15documentElementEv(auStack_d8,auStack_b0);
      __ZNK8QDomNode8nodeNameEv(&local_90,auStack_d8);
      puVar2 = PTR___ZN7QString6_emptyE_10172c3d0;
      puVar1 = PTR___ZN7QString6_emptyE_10172c3d0;
      if (puStack_88 != (undefined *)0x0) {
        puVar1 = puStack_88;
      }
      iVar3 = __ZN7QString14compare_helperEPK5QCharxPKcxN2Qt15CaseSensitivityE
                        (puVar1,local_80,&DAT_1016f3f96,0xffffffffffffffff,1);
      if (local_90 != (int *)0x0) {
        LOAcquire();
        iVar4 = *local_90;
        *local_90 = iVar4 + -1;
        LORelease();
        if (iVar4 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_90,2,8);
        }
      }
      if (iVar3 != 0) {
        __ZN8QDomNodeD2Ev(auStack_d8);
        goto LAB_100eae450;
      }
      __ZNK8QDomNode10childNodesEv(&local_90,auStack_d8);
      iVar3 = __ZNK12QDomNodeList6lengthEv(&local_90);
      __ZN12QDomNodeListD1Ev(&local_90);
      __ZN7QString8fromUtf8E14QByteArrayView(&local_90,4,"year");
      puStack_108 = puStack_88;
      local_110 = local_90;
      local_100 = local_80;
      local_90 = (int *)0x0;
      puStack_88 = (undefined *)0x0;
      local_80 = 0;
      __ZNK11QDomElement9attributeERK7QStringS2_(local_f0,auStack_d8,&local_110,&local_90);
      if (local_90 != (int *)0x0) {
        LOAcquire();
        iVar4 = *local_90;
        *local_90 = iVar4 + -1;
        LORelease();
        if (iVar4 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_90,2,8);
        }
      }
      if (local_110 != (int *)0x0) {
        LOAcquire();
        iVar4 = *local_110;
        *local_110 = iVar4 + -1;
        LORelease();
        if (iVar4 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_110,2,8);
        }
      }
      __ZN7QString8fromUtf8E14QByteArrayView(&local_90,6,"artist");
      uStack_128 = puStack_88;
      local_130 = local_90;
      local_120 = local_80;
      local_90 = (int *)0x0;
      puStack_88 = (undefined *)0x0;
      local_80 = 0;
      __ZNK11QDomElement9attributeERK7QStringS2_(&local_110,auStack_d8,&local_130,&local_90);
      if (local_90 != (int *)0x0) {
        LOAcquire();
        iVar4 = *local_90;
        *local_90 = iVar4 + -1;
        LORelease();
        if (iVar4 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_90,2,8);
        }
      }
      if (local_130 != (int *)0x0) {
        LOAcquire();
        iVar4 = *local_130;
        *local_130 = iVar4 + -1;
        LORelease();
        if (iVar4 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_130,2,8);
        }
      }
      __ZN7QString8fromUtf8E14QByteArrayView(&local_90,5,"album");
      uStack_148 = puStack_88;
      local_150 = local_90;
      local_140 = local_80;
      local_90 = (int *)0x0;
      puStack_88 = (undefined *)0x0;
      local_80 = 0;
      __ZNK11QDomElement9attributeERK7QStringS2_(&local_130,auStack_d8,&local_150,&local_90);
      if (local_90 != (int *)0x0) {
        LOAcquire();
        iVar4 = *local_90;
        *local_90 = iVar4 + -1;
        LORelease();
        if (iVar4 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_90,2,8);
        }
      }
      if (local_150 != (int *)0x0) {
        LOAcquire();
        iVar4 = *local_150;
        *local_150 = iVar4 + -1;
        LORelease();
        if (iVar4 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_150,2,8);
        }
      }
      __ZN7QString8fromUtf8E14QByteArrayView(&local_90,5,"genre");
      uStack_168 = puStack_88;
      local_170 = local_90;
      local_160 = local_80;
      local_90 = (int *)0x0;
      puStack_88 = (undefined *)0x0;
      local_80 = 0;
      __ZNK11QDomElement9attributeERK7QStringS2_(&local_150,auStack_d8,&local_170,&local_90);
      if (local_90 != (int *)0x0) {
        LOAcquire();
        iVar4 = *local_90;
        *local_90 = iVar4 + -1;
        LORelease();
        if (iVar4 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_90,2,8);
        }
      }
      if (local_170 != (int *)0x0) {
        LOAcquire();
        iVar4 = *local_170;
        *local_170 = iVar4 + -1;
        LORelease();
        if (iVar4 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_170,2,8);
        }
      }
      __ZN7QString8fromUtf8E14QByteArrayView(&local_90,3,"bpm");
      uStack_188 = puStack_88;
      local_190 = local_90;
      local_180 = local_80;
      local_90 = (int *)0x0;
      puStack_88 = (undefined *)0x0;
      local_80 = 0;
      __ZNK11QDomElement9attributeERK7QStringS2_(&local_170,auStack_d8,&local_190,&local_90);
      if (local_90 != (int *)0x0) {
        LOAcquire();
        iVar4 = *local_90;
        *local_90 = iVar4 + -1;
        LORelease();
        if (iVar4 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_90,2,8);
        }
      }
      if (local_190 != (int *)0x0) {
        LOAcquire();
        iVar4 = *local_190;
        *local_190 = iVar4 + -1;
        LORelease();
        if (iVar4 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_190,2,8);
        }
      }
      lVar16 = (long)iVar3;
      FUN_100eb31b0(param_2,lVar16);
      lVar9 = param_2[2];
      if (lVar9 < lVar16) {
        lVar14 = param_2[1];
        do {
          puVar10 = (undefined8 *)(lVar14 + lVar9 * 0x18);
          *puVar10 = 0;
          puVar10[1] = 0;
          puVar10[2] = 0;
          lVar9 = param_2[2] + 1;
          param_2[2] = lVar9;
        } while (lVar9 != lVar16);
      }
      __ZNK8QDomNode10firstChildEv(auStack_198,auStack_d8);
      while (unaff_w21 = __ZNK8QDomNode6isNullEv(auStack_198), (unaff_w21 & 1) == 0) {
        __ZNK8QDomNode9toElementEv(auStack_1a0,auStack_198);
        __ZNK8QDomNode8nodeNameEv(&local_90,auStack_1a0);
        puVar1 = puVar2;
        if (puStack_88 != (undefined *)0x0) {
          puVar1 = puStack_88;
        }
        iVar4 = __ZN7QString14compare_helperEPK5QCharxPKcxN2Qt15CaseSensitivityE
                          (puVar1,local_80,"sampler",0xffffffffffffffff,1);
        if (local_90 != (int *)0x0) {
          LOAcquire();
          iVar5 = *local_90;
          *local_90 = iVar5 + -1;
          LORelease();
          if (iVar5 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_90,2,8);
          }
        }
        if (iVar4 == 0) {
          __ZN7QString8fromUtf8E14QByteArrayView(&local_90,3,&DAT_1016d6a6d);
          puStack_1b8 = puStack_88;
          local_1c0 = local_90;
          local_1b0 = local_80;
          local_90 = (int *)0x0;
          puStack_88 = (undefined *)0x0;
          local_80 = 0;
          __ZNK11QDomElement9attributeERK7QStringS2_(&local_190,auStack_1a0,&local_1c0,&local_90);
          lVar9 = __ZN7QString17toIntegral_helperE11QStringViewPbi(local_180,uStack_188,0,10);
          uVar6 = (uint)lVar9;
          if (lVar9 != (int)uVar6) {
            uVar6 = 0;
          }
          if (local_190 != (int *)0x0) {
            LOAcquire();
            iVar4 = *local_190;
            *local_190 = iVar4 + -1;
            LORelease();
            if (iVar4 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_190,2,8);
            }
          }
          if (local_90 != (int *)0x0) {
            LOAcquire();
            iVar4 = *local_90;
            *local_90 = iVar4 + -1;
            LORelease();
            if (iVar4 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_90,2,8);
            }
          }
          if (local_1c0 != (int *)0x0) {
            LOAcquire();
            iVar4 = *local_1c0;
            *local_1c0 = iVar4 + -1;
            LORelease();
            if (iVar4 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_1c0,2,8);
            }
          }
          __ZN7QString8fromUtf8E14QByteArrayView(&local_90,5,"color");
          puStack_1b8 = puStack_88;
          local_1c0 = local_90;
          local_1b0 = local_80;
          local_90 = (int *)0x0;
          puStack_88 = (undefined *)0x0;
          local_80 = 0;
          __ZNK11QDomElement9attributeERK7QStringS2_(local_1d8,auStack_1a0,&local_1c0,&local_90);
          __ZN2dj5dbase5Track15getLimitedColorE7QString(&local_190,local_1d8);
          if (local_1d8[0] != (int *)0x0) {
            LOAcquire();
            iVar4 = *local_1d8[0];
            *local_1d8[0] = iVar4 + -1;
            LORelease();
            if (iVar4 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_1d8[0],2,8);
            }
          }
          if (local_90 != (int *)0x0) {
            LOAcquire();
            iVar4 = *local_90;
            *local_90 = iVar4 + -1;
            LORelease();
            if (iVar4 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_90,2,8);
            }
          }
          if (local_1c0 != (int *)0x0) {
            LOAcquire();
            iVar4 = *local_1c0;
            *local_1c0 = iVar4 + -1;
            LORelease();
            if (iVar4 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_1c0,2,8);
            }
          }
          if (((int)uVar6 < 0) || (iVar3 <= (int)uVar6)) {
            __ZN11QFileDevice5closeEv(auStack_a8);
LAB_100eaf594:
            if (local_190 != (int *)0x0) {
              LOAcquire();
              iVar3 = *local_190;
              *local_190 = iVar3 + -1;
              LORelease();
              if (iVar3 == 1) {
                __ZN10QArrayData10deallocateEPS_xx(local_190,2,8);
              }
            }
            __ZN8QDomNodeD2Ev(auStack_1a0);
            goto LAB_100eaf5d0;
          }
          piVar11 = (int *)*param_2;
          if ((piVar11 == (int *)0x0) || (1 < *piVar11)) {
            FUN_1000a71b8(param_2,0,0,0);
            piVar11 = (int *)*param_2;
            if (piVar11 != (int *)0x0) goto LAB_100eaea84;
LAB_100eaea90:
            FUN_1000a71b8(param_2,0,0,0);
          }
          else {
LAB_100eaea84:
            if (1 < *piVar11) goto LAB_100eaea90;
          }
          FUN_100eafc94(param_2[1] + (ulong)uVar6 * 0x18,4);
          __ZNK8QDomNode10firstChildEv(auStack_1e0,auStack_1a0);
          while (uVar8 = __ZNK8QDomNode6isNullEv(auStack_1e0), (uVar8 & 1) == 0) {
            __ZNK8QDomNode9toElementEv(auStack_1e8,auStack_1e0);
            __ZNK8QDomNode8nodeNameEv(&local_90,auStack_1e8);
            puVar1 = puVar2;
            if (puStack_88 != (undefined *)0x0) {
              puVar1 = puStack_88;
            }
            iVar4 = __ZN7QString14compare_helperEPK5QCharxPKcxN2Qt15CaseSensitivityE
                              (puVar1,local_80,"sample",0xffffffffffffffff,1);
            if (local_90 != (int *)0x0) {
              LOAcquire();
              iVar5 = *local_90;
              *local_90 = iVar5 + -1;
              LORelease();
              if (iVar5 == 1) {
                __ZN10QArrayData10deallocateEPS_xx(local_90,2,8);
              }
            }
            if (iVar4 == 0) {
              __ZN7QString8fromUtf8E14QByteArrayView(&local_90,3,&DAT_1016d6a6d);
              puStack_1f8 = puStack_88;
              local_200 = local_90;
              local_1f0 = local_80;
              local_90 = (int *)0x0;
              puStack_88 = (undefined *)0x0;
              local_80 = 0;
              __ZNK11QDomElement9attributeERK7QStringS2_
                        (&local_1c0,auStack_1e8,&local_200,&local_90);
              lVar9 = __ZN7QString17toIntegral_helperE11QStringViewPbi(local_1b0,puStack_1b8,0,10);
              uVar7 = (uint)lVar9;
              if (lVar9 != (int)uVar7) {
                uVar7 = 0;
              }
              if (local_1c0 != (int *)0x0) {
                LOAcquire();
                iVar4 = *local_1c0;
                *local_1c0 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_1c0,2,8);
                }
              }
              if (local_90 != (int *)0x0) {
                LOAcquire();
                iVar4 = *local_90;
                *local_90 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_90,2,8);
                }
              }
              if (local_200 != (int *)0x0) {
                LOAcquire();
                iVar4 = *local_200;
                *local_200 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_200,2,8);
                }
              }
              if (3 < uVar7) {
                __ZN11QFileDevice5closeEv(auStack_a8);
                __ZN8QDomNodeD2Ev(auStack_1e8);
                __ZN8QDomNodeD1Ev(auStack_1e0);
                goto LAB_100eaf594;
              }
              piVar11 = (int *)*param_2;
              if ((piVar11 == (int *)0x0) || (1 < *piVar11)) {
                FUN_1000a71b8(param_2,0,0,0);
                piVar11 = (int *)*param_2;
                if (piVar11 != (int *)0x0) goto LAB_100eaec5c;
LAB_100eaec68:
                FUN_1000a71b8(param_2,0,0,0);
              }
              else {
LAB_100eaec5c:
                if (1 < *piVar11) goto LAB_100eaec68;
              }
              puVar10 = (undefined8 *)(param_2[1] + (ulong)uVar6 * 0x18);
              piVar11 = (int *)*puVar10;
              if ((piVar11 == (int *)0x0) || (1 < *piVar11)) {
                FUN_1000a8074(puVar10,0,0,0);
                piVar11 = (int *)*puVar10;
                if (piVar11 != (int *)0x0) goto LAB_100eaecb8;
LAB_100eaecc4:
                FUN_1000a8074(puVar10,0,0,0);
              }
              else {
LAB_100eaecb8:
                if (1 < *piVar11) goto LAB_100eaecc4;
              }
              lVar9 = puVar10[1];
              __ZN7QString8fromUtf8E14QByteArrayView(&local_90,5,"title");
              puStack_1f8 = puStack_88;
              local_200 = local_90;
              local_1f0 = local_80;
              local_90 = (int *)0x0;
              puStack_88 = (undefined *)0x0;
              local_80 = 0;
              __ZNK11QDomElement9attributeERK7QStringS2_
                        (&local_1c0,auStack_1e8,&local_200,&local_90);
              puVar10 = (undefined8 *)(lVar9 + (ulong)uVar7 * 0xd0);
              piVar11 = (int *)*puVar10;
              *puVar10 = local_1c0;
              uVar12 = puVar10[1];
              puVar10[1] = puStack_1b8;
              uVar13 = puVar10[2];
              puVar10[2] = local_1b0;
              local_1c0 = piVar11;
              puStack_1b8 = (undefined *)uVar12;
              local_1b0 = uVar13;
              if (piVar11 != (int *)0x0) {
                LOAcquire();
                iVar4 = *piVar11;
                *piVar11 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(piVar11,2,8);
                }
              }
              if (local_90 != (int *)0x0) {
                LOAcquire();
                iVar4 = *local_90;
                *local_90 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_90,2,8);
                }
              }
              if (local_200 != (int *)0x0) {
                LOAcquire();
                iVar4 = *local_200;
                *local_200 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_200,2,8);
                }
              }
              __ZN7QString8fromUtf8E14QByteArrayView(&local_90,3,"bpm");
              puStack_1f8 = puStack_88;
              local_200 = local_90;
              local_1f0 = local_80;
              __ZNK11QDomElement9attributeERK7QStringS2_
                        (&local_1c0,auStack_1e8,&local_200,&local_170);
              uVar17 = __ZNK7QString7toFloatEPb(&local_1c0,0);
              *(undefined4 *)(puVar10 + 0x18) = uVar17;
              if (local_1c0 != (int *)0x0) {
                LOAcquire();
                iVar4 = *local_1c0;
                *local_1c0 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_1c0,2,8);
                }
              }
              if (local_200 != (int *)0x0) {
                LOAcquire();
                iVar4 = *local_200;
                *local_200 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_200,2,8);
                }
              }
              __ZN7QString8fromUtf8E14QByteArrayView(&local_90,3,"key");
              puStack_1f8 = puStack_88;
              local_200 = local_90;
              local_1f0 = local_80;
              __ZN7QString8fromUtf8E14QByteArrayView(&local_90,4,"none");
              uStack_218 = puStack_88;
              local_220 = local_90;
              local_210 = local_80;
              __ZNK11QDomElement9attributeERK7QStringS2_
                        (&local_1c0,auStack_1e8,&local_200,&local_220);
              piVar11 = (int *)puVar10[0x15];
              puVar10[0x15] = local_1c0;
              uVar12 = puVar10[0x16];
              puVar10[0x16] = puStack_1b8;
              uVar13 = puVar10[0x17];
              puVar10[0x17] = local_1b0;
              local_1c0 = piVar11;
              puStack_1b8 = (undefined *)uVar12;
              local_1b0 = uVar13;
              if (piVar11 != (int *)0x0) {
                LOAcquire();
                iVar4 = *piVar11;
                *piVar11 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(piVar11,2,8);
                }
              }
              if (local_220 != (int *)0x0) {
                LOAcquire();
                iVar4 = *local_220;
                *local_220 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_220,2,8);
                }
              }
              if (local_200 != (int *)0x0) {
                LOAcquire();
                iVar4 = *local_200;
                *local_200 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_200,2,8);
                }
              }
              __ZN7QString8fromUtf8E14QByteArrayView(&local_90,4,&DAT_1016b97c7);
              puStack_1f8 = puStack_88;
              local_200 = local_90;
              local_1f0 = local_80;
              local_90 = (int *)0x0;
              puStack_88 = (undefined *)0x0;
              local_80 = 0;
              __ZNK11QDomElement9attributeERK7QStringS2_
                        (&local_1c0,auStack_1e8,&local_200,&local_90);
              piVar11 = (int *)puVar10[0xf];
              puVar10[0xf] = local_1c0;
              uVar12 = puVar10[0x10];
              puVar10[0x10] = puStack_1b8;
              uVar13 = puVar10[0x11];
              puVar10[0x11] = local_1b0;
              local_1c0 = piVar11;
              puStack_1b8 = (undefined *)uVar12;
              local_1b0 = uVar13;
              if (piVar11 != (int *)0x0) {
                LOAcquire();
                iVar4 = *piVar11;
                *piVar11 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(piVar11,2,8);
                }
              }
              if (local_90 != (int *)0x0) {
                LOAcquire();
                iVar4 = *local_90;
                *local_90 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_90,2,8);
                }
              }
              if (local_200 != (int *)0x0) {
                LOAcquire();
                iVar4 = *local_200;
                *local_200 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_200,2,8);
                }
              }
              __ZN7QString8fromUtf8E14QByteArrayView(&local_90,4,"type");
              puStack_1f8 = puStack_88;
              local_200 = local_90;
              local_1f0 = local_80;
              local_90 = (int *)0x0;
              puStack_88 = (undefined *)0x0;
              local_80 = 0;
              __ZNK11QDomElement9attributeERK7QStringS2_
                        (&local_1c0,auStack_1e8,&local_200,&local_90);
              lVar9 = __ZN7QString17toIntegral_helperE11QStringViewPbi(local_1b0,puStack_1b8,0,10);
              iVar4 = (int)lVar9;
              if (lVar9 != iVar4) {
                iVar4 = 0;
              }
              *(int *)(puVar10 + 0x19) = iVar4;
              if (local_1c0 != (int *)0x0) {
                LOAcquire();
                iVar4 = *local_1c0;
                *local_1c0 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_1c0,2,8);
                }
              }
              if (local_90 != (int *)0x0) {
                LOAcquire();
                iVar4 = *local_90;
                *local_90 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_90,2,8);
                }
              }
              if (local_200 != (int *)0x0) {
                LOAcquire();
                iVar4 = *local_200;
                *local_200 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_200,2,8);
                }
              }
              __ZN7QString8fromUtf8E14QByteArrayView(&local_90,6,"artist");
              puStack_1f8 = puStack_88;
              local_200 = local_90;
              local_1f0 = local_80;
              __ZNK11QDomElement9attributeERK7QStringS2_
                        (&local_1c0,auStack_d8,&local_200,&local_110);
              piVar11 = (int *)puVar10[3];
              puVar10[3] = local_1c0;
              uVar12 = puVar10[4];
              puVar10[4] = puStack_1b8;
              uVar13 = puVar10[5];
              puVar10[5] = local_1b0;
              local_1c0 = piVar11;
              puStack_1b8 = (undefined *)uVar12;
              local_1b0 = uVar13;
              if (piVar11 != (int *)0x0) {
                LOAcquire();
                iVar4 = *piVar11;
                *piVar11 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(piVar11,2,8);
                }
              }
              if (local_200 != (int *)0x0) {
                LOAcquire();
                iVar4 = *local_200;
                *local_200 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_200,2,8);
                }
              }
              __ZN7QString8fromUtf8E14QByteArrayView(&local_90,5,"album");
              puStack_1f8 = puStack_88;
              local_200 = local_90;
              local_1f0 = local_80;
              __ZNK11QDomElement9attributeERK7QStringS2_
                        (&local_1c0,auStack_d8,&local_200,&local_130);
              piVar11 = (int *)puVar10[6];
              puVar10[6] = local_1c0;
              uVar12 = puVar10[7];
              puVar10[7] = puStack_1b8;
              uVar13 = puVar10[8];
              puVar10[8] = local_1b0;
              local_1c0 = piVar11;
              puStack_1b8 = (undefined *)uVar12;
              local_1b0 = uVar13;
              if (piVar11 != (int *)0x0) {
                LOAcquire();
                iVar4 = *piVar11;
                *piVar11 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(piVar11,2,8);
                }
              }
              if (local_200 != (int *)0x0) {
                LOAcquire();
                iVar4 = *local_200;
                *local_200 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_200,2,8);
                }
              }
              __ZN7QString8fromUtf8E14QByteArrayView(&local_90,5,"genre");
              puStack_1f8 = puStack_88;
              local_200 = local_90;
              local_1f0 = local_80;
              __ZNK11QDomElement9attributeERK7QStringS2_
                        (&local_1c0,auStack_d8,&local_200,&local_150);
              piVar11 = (int *)puVar10[9];
              puVar10[9] = local_1c0;
              uVar12 = puVar10[10];
              puVar10[10] = puStack_1b8;
              uVar13 = puVar10[0xb];
              puVar10[0xb] = local_1b0;
              local_1c0 = piVar11;
              puStack_1b8 = (undefined *)uVar12;
              local_1b0 = uVar13;
              if (piVar11 != (int *)0x0) {
                LOAcquire();
                iVar4 = *piVar11;
                *piVar11 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(piVar11,2,8);
                }
              }
              if (local_200 != (int *)0x0) {
                LOAcquire();
                iVar4 = *local_200;
                *local_200 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_200,2,8);
                }
              }
              __ZN7QString8fromUtf8E14QByteArrayView(&local_90,4,"year");
              puStack_1f8 = puStack_88;
              local_200 = local_90;
              local_1f0 = local_80;
              __ZNK11QDomElement9attributeERK7QStringS2_(&local_1c0,auStack_d8,&local_200,local_f0);
              piVar11 = (int *)puVar10[0xc];
              puVar10[0xc] = local_1c0;
              uVar12 = puVar10[0xd];
              puVar10[0xd] = puStack_1b8;
              uVar13 = puVar10[0xe];
              puVar10[0xe] = local_1b0;
              local_1c0 = piVar11;
              puStack_1b8 = (undefined *)uVar12;
              local_1b0 = uVar13;
              if (piVar11 != (int *)0x0) {
                LOAcquire();
                iVar4 = *piVar11;
                *piVar11 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(piVar11,2,8);
                }
              }
              if (local_200 != (int *)0x0) {
                LOAcquire();
                iVar4 = *local_200;
                *local_200 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_200,2,8);
                }
              }
              __ZN7QString8fromUtf8E14QByteArrayView(&local_90,6,"length");
              puStack_1f8 = puStack_88;
              local_200 = local_90;
              local_1f0 = local_80;
              local_90 = (int *)0x0;
              puStack_88 = (undefined *)0x0;
              local_80 = 0;
              __ZNK11QDomElement9attributeERK7QStringS2_
                        (&local_1c0,auStack_1e8,&local_200,&local_90);
              uVar17 = __ZNK7QString7toFloatEPb(&local_1c0,0);
              *(undefined4 *)((long)puVar10 + 0xc4) = uVar17;
              if (local_1c0 != (int *)0x0) {
                LOAcquire();
                iVar4 = *local_1c0;
                *local_1c0 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_1c0,2,8);
                }
              }
              if (local_90 != (int *)0x0) {
                LOAcquire();
                iVar4 = *local_90;
                *local_90 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_90,2,8);
                }
              }
              if (local_200 != (int *)0x0) {
                LOAcquire();
                iVar4 = *local_200;
                *local_200 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_200,2,8);
                }
              }
              __ZN7QString8fromUtf8E14QByteArrayView(&local_90,5,"color");
              puStack_1f8 = puStack_88;
              local_200 = local_90;
              local_1f0 = local_80;
              __ZNK11QDomElement9attributeERK7QStringS2_
                        (local_238,auStack_1e8,&local_200,&local_190);
              __ZN2dj5dbase5Track15getLimitedColorE7QString(&local_1c0,local_238);
              piVar11 = (int *)puVar10[0x12];
              puVar10[0x12] = local_1c0;
              uVar12 = puVar10[0x13];
              puVar10[0x13] = puStack_1b8;
              uVar13 = puVar10[0x14];
              puVar10[0x14] = local_1b0;
              local_1c0 = piVar11;
              puStack_1b8 = (undefined *)uVar12;
              local_1b0 = uVar13;
              if (piVar11 != (int *)0x0) {
                LOAcquire();
                iVar4 = *piVar11;
                *piVar11 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(piVar11,2,8);
                }
              }
              if (local_238[0] != (int *)0x0) {
                LOAcquire();
                iVar4 = *local_238[0];
                *local_238[0] = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_238[0],2,8);
                }
              }
              if (local_200 != (int *)0x0) {
                LOAcquire();
                iVar4 = *local_200;
                *local_200 = iVar4 + -1;
                LORelease();
                if (iVar4 == 1) {
                  __ZN10QArrayData10deallocateEPS_xx(local_200,2,8);
                }
              }
            }
            __ZNK8QDomNode11nextSiblingEv(&local_90,auStack_1e0);
            __ZN8QDomNodeaSERKS_(auStack_1e0,&local_90);
            __ZN8QDomNodeD1Ev(&local_90);
            __ZN8QDomNodeD2Ev(auStack_1e8);
          }
          __ZN8QDomNodeD1Ev(auStack_1e0);
          if (local_190 != (int *)0x0) {
            LOAcquire();
            iVar4 = *local_190;
            *local_190 = iVar4 + -1;
            LORelease();
            if (iVar4 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_190,2,8);
            }
          }
        }
        __ZNK8QDomNode11nextSiblingEv(&local_90,auStack_198);
        __ZN8QDomNodeaSERKS_(auStack_198,&local_90);
        __ZN8QDomNodeD1Ev(&local_90);
        __ZN8QDomNodeD2Ev(auStack_1a0);
      }
      __ZN11QFileDevice5closeEv(auStack_a8);
LAB_100eaf5d0:
      __ZN8QDomNodeD1Ev(auStack_198);
      if (local_170 != (int *)0x0) {
        LOAcquire();
        iVar3 = *local_170;
        *local_170 = iVar3 + -1;
        LORelease();
        if (iVar3 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_170,2,8);
        }
      }
      if (local_150 != (int *)0x0) {
        LOAcquire();
        iVar3 = *local_150;
        *local_150 = iVar3 + -1;
        LORelease();
        if (iVar3 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_150,2,8);
        }
      }
      if (local_130 != (int *)0x0) {
        LOAcquire();
        iVar3 = *local_130;
        *local_130 = iVar3 + -1;
        LORelease();
        if (iVar3 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_130,2,8);
        }
      }
      if (local_110 != (int *)0x0) {
        LOAcquire();
        iVar3 = *local_110;
        *local_110 = iVar3 + -1;
        LORelease();
        if (iVar3 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_110,2,8);
        }
      }
      if (local_f0[0] != (int *)0x0) {
        LOAcquire();
        iVar3 = *local_f0[0];
        *local_f0[0] = iVar3 + -1;
        LORelease();
        if (iVar3 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_f0[0],2,8);
        }
      }
      __ZN8QDomNodeD2Ev(auStack_d8);
      bVar15 = false;
    }
    if (local_c8 != (int *)0x0) {
      LOAcquire();
      iVar3 = *local_c8;
      *local_c8 = iVar3 + -1;
      LORelease();
      if (iVar3 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_c8,2,8);
      }
    }
    if (!bVar15) goto LAB_100eae48c;
  }
  __ZN11QFileDevice5closeEv(auStack_a8);
  unaff_w21 = 0;
LAB_100eae48c:
  __ZN12QDomDocumentD1Ev(auStack_b0);
  __ZN5QFileD1Ev(auStack_a8);
  __ZN9QFileInfoD1Ev(auStack_98);
  return unaff_w21 & 1;
}

