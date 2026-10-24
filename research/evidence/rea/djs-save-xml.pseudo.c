
undefined4
__ZN2dj22saveDJSSamplePackToXMLE7QStringPNS_14AudioMediaInfoEP5QListIS3_INS_10SampleInfoEEES0_fbNS_10SampleTypeE
          (undefined4 param_1,undefined8 param_2,long param_3,long param_4,long param_5,
          undefined4 param_6,int param_7)

{
  int iVar1;
  long lVar2;
  long lVar3;
  long lVar4;
  long lVar5;
  long lVar6;
  undefined1 auStack_128 [8];
  int *local_120;
  undefined8 uStack_118;
  undefined8 local_110;
  undefined1 auStack_100 [8];
  undefined1 auStack_f8 [8];
  undefined1 auStack_f0 [8];
  undefined1 auStack_e8 [8];
  int *local_e0;
  undefined8 uStack_d8;
  undefined1 auStack_c8 [8];
  undefined1 auStack_c0 [8];
  undefined1 auStack_b8 [8];
  undefined1 auStack_b0 [16];
  int *local_a0;
  undefined8 uStack_98;
  undefined4 local_90;
  
  if (*(long *)(param_3 + 0x60) == 0) {
    local_90 = 0;
  }
  else {
    __ZN5QFileC1ERK7QString(auStack_b0,param_2);
    __ZN12QDomDocumentC1Ev(auStack_b8);
    iVar1 = __ZN5QFile4openE6QFlagsIN13QIODeviceBase12OpenModeFlagEE(auStack_b0,2);
    if (iVar1 == 0) {
      local_90 = 0;
    }
    else {
      __ZN12QDomDocumentC1Ev(auStack_c0);
      __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,4,&DAT_1016f3f96);
      uStack_d8 = uStack_98;
      local_e0 = local_a0;
      __ZN12QDomDocument13createElementERK7QString(auStack_c8,auStack_c0,&local_e0);
      if (local_e0 != (int *)0x0) {
        LOAcquire();
        iVar1 = *local_e0;
        *local_e0 = iVar1 + -1;
        LORelease();
        if (iVar1 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
        }
      }
      __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,5,"title");
      uStack_d8 = uStack_98;
      local_e0 = local_a0;
      __ZN11QDomElement12setAttributeERK7QStringS2_(auStack_c8,&local_e0,param_3 + 0x50);
      if (local_e0 != (int *)0x0) {
        LOAcquire();
        iVar1 = *local_e0;
        *local_e0 = iVar1 + -1;
        LORelease();
        if (iVar1 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
        }
      }
      __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,6,"artist");
      uStack_d8 = uStack_98;
      local_e0 = local_a0;
      __ZN11QDomElement12setAttributeERK7QStringS2_(auStack_c8,&local_e0,param_3 + 0x38);
      if (local_e0 != (int *)0x0) {
        LOAcquire();
        iVar1 = *local_e0;
        *local_e0 = iVar1 + -1;
        LORelease();
        if (iVar1 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
        }
      }
      __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,5,"album");
      uStack_d8 = uStack_98;
      local_e0 = local_a0;
      __ZN11QDomElement12setAttributeERK7QStringS2_(auStack_c8,&local_e0,param_3 + 0x68);
      if (local_e0 != (int *)0x0) {
        LOAcquire();
        iVar1 = *local_e0;
        *local_e0 = iVar1 + -1;
        LORelease();
        if (iVar1 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
        }
      }
      __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,5,"genre");
      uStack_d8 = uStack_98;
      local_e0 = local_a0;
      __ZN11QDomElement12setAttributeERK7QStringS2_(auStack_c8,&local_e0,param_3 + 0x80);
      if (local_e0 != (int *)0x0) {
        LOAcquire();
        iVar1 = *local_e0;
        *local_e0 = iVar1 + -1;
        LORelease();
        if (iVar1 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
        }
      }
      __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,4,"year");
      uStack_d8 = uStack_98;
      local_e0 = local_a0;
      __ZN11QDomElement12setAttributeERK7QStringS2_(auStack_c8,&local_e0,param_3 + 0x98);
      if (local_e0 != (int *)0x0) {
        LOAcquire();
        iVar1 = *local_e0;
        *local_e0 = iVar1 + -1;
        LORelease();
        if (iVar1 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
        }
      }
      __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,3,"bpm");
      uStack_d8 = uStack_98;
      local_e0 = local_a0;
      __ZN11QDomElement12setAttributeERK7QStringf
                (*(undefined4 *)(param_3 + 0x110),auStack_c8,&local_e0);
      if (local_e0 != (int *)0x0) {
        LOAcquire();
        iVar1 = *local_e0;
        *local_e0 = iVar1 + -1;
        LORelease();
        if (iVar1 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
        }
      }
      __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,5,"quant");
      uStack_d8 = uStack_98;
      local_e0 = local_a0;
      __ZN11QDomElement12setAttributeERK7QStringf(param_1,auStack_c8,&local_e0);
      if (local_e0 != (int *)0x0) {
        LOAcquire();
        iVar1 = *local_e0;
        *local_e0 = iVar1 + -1;
        LORelease();
        if (iVar1 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
        }
      }
      __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,0xd,"quant-enabled");
      uStack_d8 = uStack_98;
      local_e0 = local_a0;
      __ZN11QDomElement12setAttributeERK7QStringx(auStack_c8,&local_e0,param_6);
      if (local_e0 != (int *)0x0) {
        LOAcquire();
        iVar1 = *local_e0;
        *local_e0 = iVar1 + -1;
        LORelease();
        if (iVar1 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
        }
      }
      __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,3,"key");
      uStack_d8 = uStack_98;
      local_e0 = local_a0;
      __ZN11QDomElement12setAttributeERK7QStringx
                (auStack_c8,&local_e0,(long)*(int *)(param_3 + 0x160));
      if (local_e0 != (int *)0x0) {
        LOAcquire();
        iVar1 = *local_e0;
        *local_e0 = iVar1 + -1;
        LORelease();
        if (iVar1 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
        }
      }
      __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,0x11,"defaultSampleType");
      uStack_d8 = uStack_98;
      local_e0 = local_a0;
      __ZN11QDomElement12setAttributeERK7QStringx(auStack_c8,&local_e0,(long)param_7);
      if (local_e0 != (int *)0x0) {
        LOAcquire();
        iVar1 = *local_e0;
        *local_e0 = iVar1 + -1;
        LORelease();
        if (iVar1 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
        }
      }
      if (*(long *)(param_5 + 0x10) != 0) {
        __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,0xb,"cover-image");
        uStack_d8 = uStack_98;
        local_e0 = local_a0;
        __ZN11QDomElement12setAttributeERK7QStringS2_(auStack_c8,&local_e0,param_5);
        if (local_e0 != (int *)0x0) {
          LOAcquire();
          iVar1 = *local_e0;
          *local_e0 = iVar1 + -1;
          LORelease();
          if (iVar1 == 1) {
            __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
          }
        }
      }
      __ZN8QDomNode11appendChildERKS_(auStack_e8,auStack_c0,auStack_c8);
      __ZN8QDomNodeD1Ev(auStack_e8);
      if (0 < *(long *)(param_4 + 0x10)) {
        lVar3 = 0;
        do {
          __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,7,"sampler");
          uStack_d8 = uStack_98;
          local_e0 = local_a0;
          __ZN12QDomDocument13createElementERK7QString(auStack_f0,auStack_c0,&local_e0);
          if (local_e0 != (int *)0x0) {
            LOAcquire();
            iVar1 = *local_e0;
            *local_e0 = iVar1 + -1;
            LORelease();
            if (iVar1 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
            }
          }
          __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,3,&DAT_1016d6a6d);
          uStack_d8 = uStack_98;
          local_e0 = local_a0;
          __ZN11QDomElement12setAttributeERK7QStringx(auStack_f0,&local_e0,lVar3);
          if (local_e0 != (int *)0x0) {
            LOAcquire();
            iVar1 = *local_e0;
            *local_e0 = iVar1 + -1;
            LORelease();
            if (iVar1 == 1) {
              __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
            }
          }
          __ZN8QDomNode11appendChildERKS_(auStack_f8,auStack_c8,auStack_f0);
          __ZN8QDomNodeD1Ev(auStack_f8);
          lVar2 = *(long *)(param_4 + 8);
          if (0 < *(long *)(lVar2 + lVar3 * 0x18 + 0x10)) {
            lVar4 = 0;
            lVar6 = 0;
            do {
              lVar5 = *(long *)(lVar2 + lVar3 * 0x18 + 8);
              if (*(long *)(lVar5 + lVar4 + 0x10) != 0) {
                __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,6,"sample");
                uStack_d8 = uStack_98;
                local_e0 = local_a0;
                __ZN12QDomDocument13createElementERK7QString(auStack_100,auStack_c0,&local_e0);
                if (local_e0 != (int *)0x0) {
                  LOAcquire();
                  iVar1 = *local_e0;
                  *local_e0 = iVar1 + -1;
                  LORelease();
                  if (iVar1 == 1) {
                    __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
                  }
                }
                __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,3,&DAT_1016d6a6d);
                uStack_d8 = uStack_98;
                local_e0 = local_a0;
                __ZN11QDomElement12setAttributeERK7QStringx(auStack_100,&local_e0,lVar6);
                if (local_e0 != (int *)0x0) {
                  LOAcquire();
                  iVar1 = *local_e0;
                  *local_e0 = iVar1 + -1;
                  LORelease();
                  if (iVar1 == 1) {
                    __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
                  }
                }
                __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,5,"title");
                uStack_d8 = uStack_98;
                local_e0 = local_a0;
                __ZN11QDomElement12setAttributeERK7QStringS2_(auStack_100,&local_e0,lVar5 + lVar4);
                if (local_e0 != (int *)0x0) {
                  LOAcquire();
                  iVar1 = *local_e0;
                  *local_e0 = iVar1 + -1;
                  LORelease();
                  if (iVar1 == 1) {
                    __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
                  }
                }
                __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,3,"bpm");
                uStack_d8 = uStack_98;
                local_e0 = local_a0;
                __ZN11QDomElement12setAttributeERK7QStringf
                          (*(undefined4 *)(lVar5 + lVar4 + 0xc0),auStack_100,&local_e0);
                if (local_e0 != (int *)0x0) {
                  LOAcquire();
                  iVar1 = *local_e0;
                  *local_e0 = iVar1 + -1;
                  LORelease();
                  if (iVar1 == 1) {
                    __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
                  }
                }
                __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,3,"key");
                uStack_d8 = uStack_98;
                local_e0 = local_a0;
                __ZN11QDomElement12setAttributeERK7QStringS2_
                          (auStack_100,&local_e0,lVar5 + lVar4 + 0xa8);
                if (local_e0 != (int *)0x0) {
                  LOAcquire();
                  iVar1 = *local_e0;
                  *local_e0 = iVar1 + -1;
                  LORelease();
                  if (iVar1 == 1) {
                    __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
                  }
                }
                __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,4,&DAT_1016b97c7);
                uStack_d8 = uStack_98;
                local_e0 = local_a0;
                __ZN11QDomElement12setAttributeERK7QStringS2_
                          (auStack_100,&local_e0,lVar5 + lVar4 + 0x78);
                if (local_e0 != (int *)0x0) {
                  LOAcquire();
                  iVar1 = *local_e0;
                  *local_e0 = iVar1 + -1;
                  LORelease();
                  if (iVar1 == 1) {
                    __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
                  }
                }
                __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,4,"type");
                uStack_d8 = uStack_98;
                local_e0 = local_a0;
                __ZN11QDomElement12setAttributeERK7QStringx
                          (auStack_100,&local_e0,(long)*(int *)(lVar5 + lVar4 + 200));
                if (local_e0 != (int *)0x0) {
                  LOAcquire();
                  iVar1 = *local_e0;
                  *local_e0 = iVar1 + -1;
                  LORelease();
                  if (iVar1 == 1) {
                    __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
                  }
                }
                __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,6,"artist");
                uStack_d8 = uStack_98;
                local_e0 = local_a0;
                __ZN11QDomElement12setAttributeERK7QStringS2_
                          (auStack_100,&local_e0,lVar5 + lVar4 + 0x18);
                if (local_e0 != (int *)0x0) {
                  LOAcquire();
                  iVar1 = *local_e0;
                  *local_e0 = iVar1 + -1;
                  LORelease();
                  if (iVar1 == 1) {
                    __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
                  }
                }
                __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,5,"album");
                uStack_d8 = uStack_98;
                local_e0 = local_a0;
                __ZN11QDomElement12setAttributeERK7QStringS2_
                          (auStack_100,&local_e0,lVar5 + lVar4 + 0x30);
                if (local_e0 != (int *)0x0) {
                  LOAcquire();
                  iVar1 = *local_e0;
                  *local_e0 = iVar1 + -1;
                  LORelease();
                  if (iVar1 == 1) {
                    __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
                  }
                }
                __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,5,"genre");
                uStack_d8 = uStack_98;
                local_e0 = local_a0;
                __ZN11QDomElement12setAttributeERK7QStringS2_
                          (auStack_100,&local_e0,lVar5 + lVar4 + 0x48);
                if (local_e0 != (int *)0x0) {
                  LOAcquire();
                  iVar1 = *local_e0;
                  *local_e0 = iVar1 + -1;
                  LORelease();
                  if (iVar1 == 1) {
                    __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
                  }
                }
                __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,4,"year");
                uStack_d8 = uStack_98;
                local_e0 = local_a0;
                __ZN11QDomElement12setAttributeERK7QStringS2_
                          (auStack_100,&local_e0,lVar5 + lVar4 + 0x60);
                if (local_e0 != (int *)0x0) {
                  LOAcquire();
                  iVar1 = *local_e0;
                  *local_e0 = iVar1 + -1;
                  LORelease();
                  if (iVar1 == 1) {
                    __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
                  }
                }
                __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,6,"length");
                uStack_d8 = uStack_98;
                local_e0 = local_a0;
                __ZN11QDomElement12setAttributeERK7QStringf
                          (*(undefined4 *)(lVar5 + lVar4 + 0xc4),auStack_100,&local_e0);
                if (local_e0 != (int *)0x0) {
                  LOAcquire();
                  iVar1 = *local_e0;
                  *local_e0 = iVar1 + -1;
                  LORelease();
                  if (iVar1 == 1) {
                    __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
                  }
                }
                __ZN7QString8fromUtf8E14QByteArrayView(&local_a0,5,"color");
                uStack_d8 = uStack_98;
                local_e0 = local_a0;
                lVar5 = lVar5 + lVar4;
                uStack_118 = *(undefined8 *)(lVar5 + 0x98);
                local_120 = *(int **)(lVar5 + 0x90);
                local_110 = *(undefined8 *)(lVar5 + 0xa0);
                if (local_120 != (int *)0x0) {
                  LOAcquire();
                  *local_120 = *local_120 + 1;
                  LORelease();
                }
                __ZN2dj5dbase5Track15getLimitedColorE7QString(&local_a0,&local_120);
                __ZN11QDomElement12setAttributeERK7QStringS2_(auStack_100,&local_e0,&local_a0);
                if (local_a0 != (int *)0x0) {
                  LOAcquire();
                  iVar1 = *local_a0;
                  *local_a0 = iVar1 + -1;
                  LORelease();
                  if (iVar1 == 1) {
                    __ZN10QArrayData10deallocateEPS_xx(local_a0,2,8);
                  }
                }
                if (local_120 != (int *)0x0) {
                  LOAcquire();
                  iVar1 = *local_120;
                  *local_120 = iVar1 + -1;
                  LORelease();
                  if (iVar1 == 1) {
                    __ZN10QArrayData10deallocateEPS_xx(local_120,2,8);
                  }
                }
                if (local_e0 != (int *)0x0) {
                  LOAcquire();
                  iVar1 = *local_e0;
                  *local_e0 = iVar1 + -1;
                  LORelease();
                  if (iVar1 == 1) {
                    __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
                  }
                }
                __ZN8QDomNode11appendChildERKS_(auStack_128,auStack_f0,auStack_100);
                __ZN8QDomNodeD1Ev(auStack_128);
                __ZN8QDomNodeD2Ev(auStack_100);
                lVar2 = *(long *)(param_4 + 8);
              }
              lVar6 = lVar6 + 1;
              lVar4 = lVar4 + 0xd0;
            } while (lVar6 < *(long *)(lVar2 + lVar3 * 0x18 + 0x10));
          }
          __ZN8QDomNodeD2Ev(auStack_f0);
          lVar3 = lVar3 + 1;
        } while (lVar3 < *(long *)(param_4 + 0x10));
      }
      __ZNK12QDomDocument8toStringEi(&local_e0,auStack_c0,2);
      __ZN7QString13toUtf8_helperERKS_(&local_a0,&local_e0);
      __ZN9QIODevice5writeERK10QByteArray(auStack_b0,&local_a0);
      if (local_a0 != (int *)0x0) {
        LOAcquire();
        iVar1 = *local_a0;
        *local_a0 = iVar1 + -1;
        LORelease();
        if (iVar1 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_a0,1,8);
        }
      }
      if (local_e0 != (int *)0x0) {
        LOAcquire();
        iVar1 = *local_e0;
        *local_e0 = iVar1 + -1;
        LORelease();
        if (iVar1 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
        }
      }
      __ZN11QFileDevice5closeEv(auStack_b0);
      __ZNK12QDomDocument8toStringEi(&local_e0,auStack_c0,2);
      __ZN7QString13toUtf8_helperERKS_(&local_a0,&local_e0);
      if (local_a0 != (int *)0x0) {
        LOAcquire();
        iVar1 = *local_a0;
        *local_a0 = iVar1 + -1;
        LORelease();
        if (iVar1 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_a0,1,8);
        }
      }
      if (local_e0 != (int *)0x0) {
        LOAcquire();
        iVar1 = *local_e0;
        *local_e0 = iVar1 + -1;
        LORelease();
        if (iVar1 == 1) {
          __ZN10QArrayData10deallocateEPS_xx(local_e0,2,8);
        }
      }
      __ZN8QDomNodeD2Ev(auStack_c8);
      __ZN12QDomDocumentD1Ev(auStack_c0);
    }
    __ZN12QDomDocumentD1Ev(auStack_b8);
    __ZN5QFileD1Ev(auStack_b0);
  }
  return local_90;
}

