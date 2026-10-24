
void __ZN5Video8setVideoE7QStringbi(long param_1,undefined8 param_2,undefined1 param_3,uint param_4)

{
  if (param_4 < 2) {
    param_1 = param_1 + (ulong)param_4 * 0x58;
    *(undefined1 *)(param_1 + 0x70) = 0;
    __ZN7QStringaSERKS_(param_1 + 0x30);
    *(undefined1 *)(param_1 + 0x71) = param_3;
  }
  return;
}

