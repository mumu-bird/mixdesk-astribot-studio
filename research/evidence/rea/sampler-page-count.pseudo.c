
void __ZN2dj5audio10BassStream30setCurrentSamplerNumberOfPagesEi(long param_1,int param_2)

{
  undefined4 uVar1;
  undefined1 auStack_48 [32];
  long local_28;
  
  local_28 = *(long *)PTR____stack_chk_guard_10172c568;
  if (param_2 < 2) {
    param_2 = 1;
  }
  *(int *)(param_1 + 0x97c) = param_2;
  if (param_2 <= *(int *)(param_1 + 0x980)) {
    *(int *)(param_1 + 0x980) = param_2 + -1;
  }
  uVar1 = *(undefined4 *)(param_1 + 0x7c);
  __ZN8QVariantC1E9QMetaTypePKv
            (auStack_48,
             PTR___ZN9QtPrivate25QMetaTypeInterfaceWrapperIN2dj15SamplerPageInfoEE8metaTypeE_10172d318
             ,param_1 + 0x97c);
  __ZN2dj5audio10BassStream23stream_property_changedENS_9AUDIOEnumEi8QVariant
            (param_1,0x90,uVar1,auStack_48);
  __ZN8QVariantD1Ev(auStack_48);
  if (*(long *)PTR____stack_chk_guard_10172c568 == local_28) {
    return;
  }
                    /* WARNING: Subroutine does not return */
  ___stack_chk_fail();
}

