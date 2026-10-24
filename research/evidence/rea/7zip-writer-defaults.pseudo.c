
undefined8 _archive_write_set_format_7zip(long param_1)

{
  undefined8 uVar1;
  undefined4 *puVar2;
  
  uVar1 = ___archive_check_magic(param_1,0xb0c5c0de,1,"archive_write_set_format_7zip");
  if ((int)uVar1 != -0x1e) {
    if (*(code **)(param_1 + 0x110) != (code *)0x0) {
      (**(code **)(param_1 + 0x110))(param_1);
    }
    puVar2 = _calloc(1,0xf140);
    if (puVar2 == (undefined4 *)0x0) {
      _archive_set_error(param_1,0xc,"Can\'t allocate 7-Zip data");
      return 0xffffffe2;
    }
    *puVar2 = 0xffffffff;
    ___archive_rb_tree_init(puVar2 + 0x3c4c,&PTR_FUN_1017df168);
    uVar1 = 0;
    *(undefined8 *)(puVar2 + 0x3c44) = 0;
    *(undefined4 **)(puVar2 + 0x3c46) = puVar2 + 0x3c44;
    *(undefined8 *)(puVar2 + 0x3c48) = 0;
    *(undefined4 **)(puVar2 + 0x3c4a) = puVar2 + 0x3c48;
    *(undefined8 *)(puVar2 + 0x20) = 0x600040202;
    *(code **)(param_1 + 0xf8) = FUN_100cdff38;
    *(code **)(param_1 + 0x100) = FUN_100ce075c;
    *(code **)(param_1 + 0xe8) = FUN_100cdfc84;
    *(code **)(param_1 + 0xf0) = FUN_100ce07ec;
    *(undefined4 **)(param_1 + 0xd0) = puVar2;
    *(undefined **)(param_1 + 0xd8) = &DAT_1016db198;
    *(code **)(param_1 + 0x108) = FUN_100ce08ec;
    *(code **)(param_1 + 0x110) = FUN_100ce1d54;
    *(undefined4 *)(param_1 + 0x10) = 0xe0000;
    *(undefined **)(param_1 + 0x18) = &DAT_1016db198;
  }
  return uVar1;
}

