
void __ZN2dj5audio10BassStream20setDefaultSampleTypeENS_10SampleTypeE
               (long param_1,undefined4 param_2)

{
  undefined4 uVar1;
  undefined1 auStack_48 [32];
  long local_28;
  
  local_28 = *(long *)PTR____stack_chk_guard_10172c568;
  *(undefined4 *)(param_1 + 0x188718) = param_2;
  uVar1 = *(undefined4 *)(param_1 + 0x7c);
  __ZN8QVariantC1Ei(auStack_48);
  __ZN2dj5audio10BassStream23stream_property_changedENS_9AUDIOEnumEi8QVariant
            (param_1,0x98,uVar1,auStack_48);
  __ZN8QVariantD1Ev(auStack_48);
  if (*(long *)PTR____stack_chk_guard_10172c568 == local_28) {
    return;
  }
                    /* WARNING: Subroutine does not return */
  ___stack_chk_fail();
}

