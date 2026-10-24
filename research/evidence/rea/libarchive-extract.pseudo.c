
void __ZN14LibarchiveUtil11extractUtf8EPcS0_x
               (undefined8 param_1,undefined8 param_2,char *param_3,undefined8 param_4)

{
  bool bVar1;
  int iVar2;
  long lVar3;
  char *pcVar4;
  long local_468;
  undefined8 uStack_460;
  undefined8 local_458;
  undefined8 local_450;
  char acStack_448 [1024];
  long local_48;
  
  local_48 = *(long *)PTR____stack_chk_guard_10172c568;
  lVar3 = _archive_read_new();
  bVar1 = false;
  if (lVar3 != 0) {
    local_468 = lVar3;
    uStack_460 = param_4;
    local_458 = param_1;
    _archive_read_extract_set_progress_callback
              (lVar3,__ZN14LibarchiveUtil13progress_funcEPv,&local_468);
    _archive_read_support_filter_all(lVar3);
    _archive_read_support_format_all(lVar3);
    iVar2 = _archive_read_open_filename(lVar3,param_2,0x2800);
    if (iVar2 == 0) {
      do {
        iVar2 = _archive_read_next_header(lVar3,&local_450);
        if (iVar2 != 0) {
          iVar2 = _archive_read_free(lVar3);
          bVar1 = iVar2 == 0;
          goto LAB_100ce346c;
        }
        _strcpy(acStack_448,param_3);
        pcVar4 = (char *)_archive_entry_pathname(local_450);
        _strcat(acStack_448,pcVar4);
        _archive_entry_copy_pathname(local_450,acStack_448);
        _archive_entry_pathname(local_450);
        iVar2 = _archive_read_extract(lVar3,local_450,0);
      } while (iVar2 == 0 || iVar2 == -0x14);
    }
    _archive_read_free(lVar3);
    bVar1 = false;
  }
LAB_100ce346c:
  if (*(long *)PTR____stack_chk_guard_10172c568 == local_48) {
    return;
  }
                    /* WARNING: Subroutine does not return */
  ___stack_chk_fail(bVar1);
}

