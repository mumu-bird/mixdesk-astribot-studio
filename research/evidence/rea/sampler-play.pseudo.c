
void __ZN2dj5audio10BassStream10playSampleEi(long param_1,undefined8 param_2)

{
  uint uVar1;
  long lVar2;
  
  uVar1 = (int)param_2 - 1;
  if (((uVar1 < 4) && (lVar2 = *(long *)(param_1 + (ulong)uVar1 * 8 + 0x188810), lVar2 != 0)) &&
     (*(int *)(lVar2 + 0x1c) != 0)) {
    if (*(char *)(lVar2 + 0xb4) == '\x01') {
      __ZN2dj5audio11BassSample34stopEv();
    }
    else {
      __ZN2dj5audio11BassSample34playEv(lVar2);
    }
    __ZN2dj5audio10BassStream11sendSamplesEi(param_1,param_2);
    return;
  }
  return;
}

