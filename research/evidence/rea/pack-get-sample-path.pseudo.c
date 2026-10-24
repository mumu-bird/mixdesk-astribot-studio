
void __ZN2dj18sample_pack_widget13GetSamplePathEv(undefined8 *param_1,long param_2)

{
  int *piVar1;
  
  piVar1 = *(int **)(param_2 + 0x2a8);
  param_1[1] = *(undefined8 *)(param_2 + 0x2b0);
  *param_1 = piVar1;
  param_1[2] = *(undefined8 *)(param_2 + 0x2b8);
  if (piVar1 != (int *)0x0) {
    LOAcquire();
    *piVar1 = *piVar1 + 1;
    LORelease();
  }
  return;
}

