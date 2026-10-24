
void __ZN2dj5audio11BassSample313restartSampleEv(long param_1)

{
  if ((*(byte *)(param_1 + 0xb4) & 1) == 0) {
    __ZN2dj5audio11BassSample34playEv(param_1);
  }
  *(undefined1 *)(param_1 + 0x11c) = 1;
  return;
}

