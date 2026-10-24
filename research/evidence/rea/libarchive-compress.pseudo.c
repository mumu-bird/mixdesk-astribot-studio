
bool __ZN14LibarchiveUtil8compressEPKcNSt3__16vectorI17CompressOperationNS2_9allocatorIS4_EEEEx
               (undefined8 param_1,undefined8 param_2,long *param_3,long param_4)

{
  bool bVar1;
  int iVar2;
  undefined8 uVar3;
  undefined8 uVar4;
  char *pcVar5;
  FILE *pFVar6;
  ulong uVar7;
  long *plVar8;
  long lVar9;
  ulong uVar10;
  long lVar11;
  undefined1 auVar12 [16];
  undefined1 auStack_2080 [8192];
  long local_80;
  
  auVar12 = (*(code *)PTR____chkstk_darwin_10172c550)();
  local_80 = *(long *)PTR____stack_chk_guard_10172c568;
  uVar3 = _archive_write_new();
  _archive_write_set_format_7zip();
  iVar2 = _archive_write_open_filename(uVar3,auVar12._8_8_);
  if (iVar2 == 0) {
    if (param_3[1] == *param_3) {
      bVar1 = true;
    }
    else {
      uVar10 = 0;
      lVar11 = 0;
      do {
        uVar4 = _archive_entry_new();
        lVar9 = *param_3 + uVar10 * 0x38;
        plVar8 = (long *)(lVar9 + 0x18);
        if (*(char *)(lVar9 + 0x2f) < '\0') {
          plVar8 = (long *)*plVar8;
        }
        _archive_entry_update_pathname_utf8(uVar4,plVar8);
        _archive_entry_set_size(uVar4,*(undefined8 *)(*param_3 + uVar10 * 0x38 + 0x30));
        _archive_entry_set_perm(uVar4,0x1a4);
        _archive_entry_set_filetype(uVar4,0x8000);
        _archive_write_header(uVar3,uVar4);
        pcVar5 = (char *)(*param_3 + uVar10 * 0x38);
        if (pcVar5[0x17] < '\0') {
          pcVar5 = *(char **)pcVar5;
        }
        pFVar6 = _fopen(pcVar5,"rb");
        bVar1 = pFVar6 != (FILE *)0x0;
        if (pFVar6 == (FILE *)0x0) break;
        uVar7 = _fread(auStack_2080,1,0x2000,pFVar6);
        iVar2 = (int)uVar7;
        while (0 < iVar2) {
          _archive_write_data(uVar3,auStack_2080,uVar7 & 0x7fffffff);
          uVar7 = _fread(auStack_2080,1,0x2000,pFVar6);
          iVar2 = (int)uVar7;
          lVar11 = lVar11 + iVar2;
          (*(code *)*auVar12._0_8_)
                    ((float)(((double)lVar11 / (double)param_4) * 100.0),auVar12._0_8_[1]);
        }
        _fclose(pFVar6);
        _archive_entry_free(uVar4);
        uVar10 = uVar10 + 1;
      } while (uVar10 < (ulong)((param_3[1] - *param_3 >> 3) * 0x6db6db6db6db6db7));
    }
    _archive_write_close(uVar3);
    _archive_write_free(uVar3);
  }
  else {
    bVar1 = false;
  }
  if (*(long *)PTR____stack_chk_guard_10172c568 == local_80) {
    return bVar1;
  }
                    /* WARNING: Subroutine does not return */
  ___stack_chk_fail();
}

