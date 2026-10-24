
undefined8
__ZN2dj13getDJSFromXMLE7QStringPNS_14AudioMediaInfoEPS0_PfPbPNS_10SampleTypeE
          (undefined8 param_1,long param_2,undefined8 *param_3,float *param_4,undefined8 param_5,
          undefined4 *param_6)

{
  undefined *puVar1;
  int iVar2;
  int iVar3;
  long lVar4;
  undefined8 uVar5;
  undefined4 uVar6;
  float fVar7;
  int *piVar8;
  undefined8 uVar9;
  byte local_101;
  int *local_100;
  undefined *puStack_f8;
  undefined8 local_f0;
  int *local_e0;
  undefined8 uStack_d8;
  undefined8 local_d0;
  undefined1 auStack_c8 [8];
  undefined1 auStack_c0 [4];
  undefined1 auStack_bc [4];
  int *local_b8;
  undefined8 uStack_b0;
  undefined8 local_a8;
  undefined1 auStack_a0 [8];
  undefined1 auStack_98 [16];
  undefined1 auStack_88 [8];
  int *local_80;
  undefined *puStack_78;
  undefined8 local_70;
  
  __ZN9QFileInfoC1ERK7QString(auStack_88,param_1);
  __ZNK9QFileInfo17canonicalFilePathEv(&local_80);
  __ZN5QFileC1ERK7QString(auStack_98,&local_80);
  if (local_80 != (int *)0x0) {
    LOAcquire();
    iVar2 = *local_80;
    *local_80 = iVar2 + -1;
    LORelease();
    if (iVar2 == 1) {
      __ZN10QArrayData10deallocateEPS_xx(local_80,2,8);
    }
  }
  __ZN12QDomDocumentC1Ev(auStack_a0);
  iVar2 = __ZN5QFile4openE6QFlagsIN13QIODeviceBase12OpenModeFlagEE(auStack_98,1);
  if (iVar2 != 0) {
    local_b8 = (int *)0x0;
    uStack_b0 = 0;
    local_a8 = 0;
    iVar2 = __ZN12QDomDocument10setContentEP9QIODeviceP7QStringPiS4_
                      (auStack_a0,auStack_98,&local_b8,auStack_bc,auStack_c0);
    if (iVar2 != 0) {
      __ZNK12QDomDocument15documentElementEv(auStack_c8,auStack_a0);
      __ZNK8QDomNode8nodeNameEv(&local_80,auStack_c8);
      puVar1 = PTR___ZN7QString6_emptyE_10172c3d0;
      if (puStack_78 != (undefined *)0x0) {
        puVar1 = puStack_78;
      }
      iVar2 = __ZN7QString14compare_helperEPK5QCharxPKcxN2Qt15CaseSensitivityE
                        (puVar1,local_70,&DAT_1016f3f96,0xffffffffffffffff,1);
      if (local_80 != (int *)0x0) {
        LOAcquire();
        iVar3 = *local_80;
        *local_80 = iVar3 + -1;
        LORelease();
        if (iVar3 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_80,2,8);
        }
      }
      if (iVar2 == 0) {
        __ZN7QString8fromUtf8E14QByteArrayView(&local_80,5,"title");
        puStack_f8 = puStack_78;
        local_100 = local_80;
        local_f0 = local_70;
        local_80 = (int *)0x0;
        puStack_78 = (undefined *)0x0;
        local_70 = 0;
        __ZNK11QDomElement9attributeERK7QStringS2_(&local_e0,auStack_c8,&local_100,&local_80);
        uVar9 = *(undefined8 *)(param_2 + 0x58);
        piVar8 = *(int **)(param_2 + 0x50);
        *(undefined8 *)(param_2 + 0x58) = uStack_d8;
        *(int **)(param_2 + 0x50) = local_e0;
        uVar5 = *(undefined8 *)(param_2 + 0x60);
        *(undefined8 *)(param_2 + 0x60) = local_d0;
        local_e0 = piVar8;
        uStack_d8 = uVar9;
        local_d0 = uVar5;
        if (piVar8 != (int *)0x0) {
          LOAcquire();
          iVar2 = *piVar8;
          *piVar8 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(piVar8,2,8);
          }
        }
        if (local_80 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_80;
          *local_80 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_80,2,8);
          }
        }
        if (local_100 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_100;
          *local_100 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
          }
        }
        __ZNK5QFile8fileNameEv(&local_80,auStack_98);
        uVar9 = *(undefined8 *)(param_2 + 0x10);
        piVar8 = *(int **)(param_2 + 8);
        *(undefined **)(param_2 + 0x10) = puStack_78;
        *(int **)(param_2 + 8) = local_80;
        uVar5 = *(undefined8 *)(param_2 + 0x18);
        *(undefined8 *)(param_2 + 0x18) = local_70;
        local_80 = piVar8;
        puStack_78 = (undefined *)uVar9;
        local_70 = uVar5;
        if (piVar8 != (int *)0x0) {
          LOAcquire();
          iVar2 = *piVar8;
          *piVar8 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(piVar8,2,8);
          }
        }
        __ZN7QString8fromUtf8E14QByteArrayView(&local_80,6,"artist");
        puStack_f8 = puStack_78;
        local_100 = local_80;
        local_f0 = local_70;
        local_80 = (int *)0x0;
        puStack_78 = (undefined *)0x0;
        local_70 = 0;
        __ZNK11QDomElement9attributeERK7QStringS2_(&local_e0,auStack_c8,&local_100,&local_80);
        uVar9 = *(undefined8 *)(param_2 + 0x40);
        piVar8 = *(int **)(param_2 + 0x38);
        *(undefined8 *)(param_2 + 0x40) = uStack_d8;
        *(int **)(param_2 + 0x38) = local_e0;
        uVar5 = *(undefined8 *)(param_2 + 0x48);
        *(undefined8 *)(param_2 + 0x48) = local_d0;
        local_e0 = piVar8;
        uStack_d8 = uVar9;
        local_d0 = uVar5;
        if (piVar8 != (int *)0x0) {
          LOAcquire();
          iVar2 = *piVar8;
          *piVar8 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(piVar8,2,8);
          }
        }
        if (local_80 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_80;
          *local_80 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_80,2,8);
          }
        }
        if (local_100 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_100;
          *local_100 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
          }
        }
        __ZN7QString8fromUtf8E14QByteArrayView(&local_80,5,"album");
        puStack_f8 = puStack_78;
        local_100 = local_80;
        local_f0 = local_70;
        local_80 = (int *)0x0;
        puStack_78 = (undefined *)0x0;
        local_70 = 0;
        __ZNK11QDomElement9attributeERK7QStringS2_(&local_e0,auStack_c8,&local_100,&local_80);
        uVar9 = *(undefined8 *)(param_2 + 0x70);
        piVar8 = *(int **)(param_2 + 0x68);
        *(undefined8 *)(param_2 + 0x70) = uStack_d8;
        *(int **)(param_2 + 0x68) = local_e0;
        uVar5 = *(undefined8 *)(param_2 + 0x78);
        *(undefined8 *)(param_2 + 0x78) = local_d0;
        local_e0 = piVar8;
        uStack_d8 = uVar9;
        local_d0 = uVar5;
        if (piVar8 != (int *)0x0) {
          LOAcquire();
          iVar2 = *piVar8;
          *piVar8 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(piVar8,2,8);
          }
        }
        if (local_80 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_80;
          *local_80 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_80,2,8);
          }
        }
        if (local_100 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_100;
          *local_100 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
          }
        }
        __ZN7QString8fromUtf8E14QByteArrayView(&local_80,5,"genre");
        puStack_f8 = puStack_78;
        local_100 = local_80;
        local_f0 = local_70;
        local_80 = (int *)0x0;
        puStack_78 = (undefined *)0x0;
        local_70 = 0;
        __ZNK11QDomElement9attributeERK7QStringS2_(&local_e0,auStack_c8,&local_100,&local_80);
        uVar9 = *(undefined8 *)(param_2 + 0x88);
        piVar8 = *(int **)(param_2 + 0x80);
        *(undefined8 *)(param_2 + 0x88) = uStack_d8;
        *(int **)(param_2 + 0x80) = local_e0;
        uVar5 = *(undefined8 *)(param_2 + 0x90);
        *(undefined8 *)(param_2 + 0x90) = local_d0;
        local_e0 = piVar8;
        uStack_d8 = uVar9;
        local_d0 = uVar5;
        if (piVar8 != (int *)0x0) {
          LOAcquire();
          iVar2 = *piVar8;
          *piVar8 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(piVar8,2,8);
          }
        }
        if (local_80 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_80;
          *local_80 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_80,2,8);
          }
        }
        if (local_100 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_100;
          *local_100 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
          }
        }
        __ZN7QString8fromUtf8E14QByteArrayView(&local_80,4,"year");
        puStack_f8 = puStack_78;
        local_100 = local_80;
        local_f0 = local_70;
        local_80 = (int *)0x0;
        puStack_78 = (undefined *)0x0;
        local_70 = 0;
        __ZNK11QDomElement9attributeERK7QStringS2_(&local_e0,auStack_c8,&local_100,&local_80);
        uVar9 = *(undefined8 *)(param_2 + 0xa0);
        piVar8 = *(int **)(param_2 + 0x98);
        *(undefined8 *)(param_2 + 0xa0) = uStack_d8;
        *(int **)(param_2 + 0x98) = local_e0;
        uVar5 = *(undefined8 *)(param_2 + 0xa8);
        *(undefined8 *)(param_2 + 0xa8) = local_d0;
        local_e0 = piVar8;
        uStack_d8 = uVar9;
        local_d0 = uVar5;
        if (piVar8 != (int *)0x0) {
          LOAcquire();
          iVar2 = *piVar8;
          *piVar8 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(piVar8,2,8);
          }
        }
        if (local_80 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_80;
          *local_80 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_80,2,8);
          }
        }
        if (local_100 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_100;
          *local_100 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
          }
        }
        __ZN7QString8fromUtf8E14QByteArrayView(&local_80,3,"key");
        puStack_f8 = puStack_78;
        local_100 = local_80;
        local_f0 = local_70;
        local_80 = (int *)0x0;
        puStack_78 = (undefined *)0x0;
        local_70 = 0;
        __ZNK11QDomElement9attributeERK7QStringS2_(&local_e0,auStack_c8,&local_100,&local_80);
        lVar4 = __ZN7QString17toIntegral_helperE11QStringViewPbi(local_d0,uStack_d8,&local_101,10);
        if (lVar4 != (int)lVar4) {
          lVar4 = 0;
          local_101 = 0;
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
        if (local_80 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_80;
          *local_80 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_80,2,8);
          }
        }
        if (local_100 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_100;
          *local_100 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
          }
        }
        uVar6 = (undefined4)lVar4;
        if (local_101 == 0) {
          uVar6 = 0xffffffff;
        }
        *(undefined4 *)(param_2 + 0x160) = uVar6;
        __ZN7QString8fromUtf8E14QByteArrayView(&local_80,3,"bpm");
        puStack_f8 = puStack_78;
        local_100 = local_80;
        local_f0 = local_70;
        local_80 = (int *)0x0;
        puStack_78 = (undefined *)0x0;
        local_70 = 0;
        __ZNK11QDomElement9attributeERK7QStringS2_(&local_e0,auStack_c8,&local_100,&local_80);
        uVar6 = __ZNK7QString7toFloatEPb(&local_e0,&local_101);
        if (local_e0 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_e0;
          *local_e0 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
          }
        }
        if (local_80 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_80;
          *local_80 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_80,2,8);
          }
        }
        if (local_100 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_100;
          *local_100 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
          }
        }
        if (local_101 == 1) {
          *(undefined4 *)(param_2 + 0x110) = uVar6;
        }
        __ZN7QString8fromUtf8E14QByteArrayView(&local_80,0x11,"defaultSampleType");
        puStack_f8 = puStack_78;
        local_100 = local_80;
        local_f0 = local_70;
        local_80 = (int *)0x0;
        puStack_78 = (undefined *)0x0;
        local_70 = 0;
        __ZNK11QDomElement9attributeERK7QStringS2_(&local_e0,auStack_c8,&local_100,&local_80);
        lVar4 = __ZN7QString17toIntegral_helperE11QStringViewPbi(local_d0,uStack_d8,&local_101,10);
        if (lVar4 != (int)lVar4) {
          lVar4 = 0;
          local_101 = 0;
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
        if (local_80 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_80;
          *local_80 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_80,2,8);
          }
        }
        if (local_100 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_100;
          *local_100 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
          }
        }
        if (local_101 == 1) {
          *param_6 = (int)lVar4;
        }
        __ZN7QString8fromUtf8E14QByteArrayView(&local_80,0xb,"cover-image");
        puStack_f8 = puStack_78;
        local_100 = local_80;
        local_f0 = local_70;
        local_80 = (int *)0x0;
        puStack_78 = (undefined *)0x0;
        local_70 = 0;
        __ZNK11QDomElement9attributeERK7QStringS2_(&local_e0,auStack_c8,&local_100,&local_80);
        uVar9 = param_3[1];
        piVar8 = (int *)*param_3;
        param_3[1] = uStack_d8;
        *param_3 = local_e0;
        uVar5 = param_3[2];
        param_3[2] = local_d0;
        local_e0 = piVar8;
        uStack_d8 = uVar9;
        local_d0 = uVar5;
        if (piVar8 != (int *)0x0) {
          LOAcquire();
          iVar2 = *piVar8;
          *piVar8 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(piVar8,2,8);
          }
        }
        if (local_80 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_80;
          *local_80 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_80,2,8);
          }
        }
        if (local_100 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_100;
          *local_100 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
          }
        }
        __ZN7QString8fromUtf8E14QByteArrayView(&local_80,5,"quant");
        puStack_f8 = puStack_78;
        local_100 = local_80;
        local_f0 = local_70;
        local_80 = (int *)0x0;
        puStack_78 = (undefined *)0x0;
        local_70 = 0;
        __ZNK11QDomElement9attributeERK7QStringS2_(&local_e0,auStack_c8,&local_100,&local_80);
        fVar7 = (float)__ZNK7QString7toFloatEPb(&local_e0,&local_101);
        *param_4 = fVar7;
        if (local_e0 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_e0;
          *local_e0 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
          }
        }
        if (local_80 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_80;
          *local_80 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_80,2,8);
          }
        }
        if (local_100 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_100;
          *local_100 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
          }
        }
        if ((local_101 & 1) == 0) {
          *param_4 = -1.0;
        }
        __ZN7QString8fromUtf8E14QByteArrayView(&local_80,0xd,"quant-enabled");
        puStack_f8 = puStack_78;
        local_100 = local_80;
        local_f0 = local_70;
        local_80 = (int *)0x0;
        puStack_78 = (undefined *)0x0;
        local_70 = 0;
        __ZNK11QDomElement9attributeERK7QStringS2_(&local_e0,auStack_c8,&local_100,&local_80);
        lVar4 = __ZN7QString17toIntegral_helperE11QStringViewPbi(local_d0,uStack_d8,&local_101,10);
        if (lVar4 != (int)lVar4) {
          lVar4 = 0;
          local_101 = 0;
        }
        *(bool *)param_5 = 0 < lVar4;
        if (local_e0 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_e0;
          *local_e0 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
          }
        }
        if (local_80 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_80;
          *local_80 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_80,2,8);
          }
        }
        if (local_100 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_100;
          *local_100 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_100,2,8);
          }
        }
        if ((local_101 & 1) == 0) {
          *(bool *)param_5 = 0.0 < *param_4;
        }
        __ZN11QFileDevice5closeEv(auStack_98);
        __ZN8QDomNodeD2Ev(auStack_c8);
        if (local_b8 != (int *)0x0) {
          LOAcquire();
          iVar2 = *local_b8;
          *local_b8 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_b8,2,8);
          }
        }
        uVar5 = 1;
        goto LAB_100ead6b0;
      }
      __ZN8QDomNodeD2Ev(auStack_c8);
    }
    if (local_b8 != (int *)0x0) {
      LOAcquire();
      iVar2 = *local_b8;
      *local_b8 = iVar2 + -1;
      LORelease();
      if (iVar2 == 1) {
        __ZN10QArrayData10deallocateEPS_xx(local_b8,2,8);
      }
    }
  }
  __ZN11QFileDevice5closeEv(auStack_98);
  uVar5 = 0;
LAB_100ead6b0:
  __ZN12QDomDocumentD1Ev(auStack_a0);
  __ZN5QFileD1Ev(auStack_98);
  __ZN9QFileInfoD1Ev(auStack_88);
  return uVar5;
}

