
undefined8 _archive_read_support_format_7zip(undefined8 param_1)

{
  undefined8 uVar1;
  void *pvVar2;
  
  uVar1 = ___archive_check_magic(param_1,0xdeb0c5,1,"archive_read_support_format_7zip");
  if ((int)uVar1 != -0x1e) {
    pvVar2 = _calloc(1,0x5068);
    if (pvVar2 == (void *)0x0) {
      _archive_set_error(param_1,0xc,"Can\'t allocate 7zip data");
      return 0xffffffe2;
    }
    uVar1 = ___archive_read_register_format
                      (param_1,pvVar2,&DAT_1016db198,FUN_100ca3bb8,0,FUN_100ca3d88,FUN_100ca45dc,
                       FUN_100ca479c,0,FUN_100ca48e8);
    if ((int)uVar1 != 0) {
      _free(pvVar2);
      uVar1 = 0;
    }
  }
  return uVar1;
}

