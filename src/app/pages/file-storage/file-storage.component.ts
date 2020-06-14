import { Component, OnInit } from '@angular/core';
import { NbMenuService } from '@nebular/theme';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'ngx-file-storage',
  templateUrl: './file-storage.component.html',
  styleUrls: ['./file-storage.component.scss']
})
export class FileStorageComponent implements OnInit {

  constructor(
    private _menuService: NbMenuService,
    private _commonService: CommonService
  ) { }

  ngOnInit() {
    this._commonService.setHeaderTitle({nav: 'File Storages'});
  }

  goToHome() {
    this._menuService.navigateHome();
  }

}
