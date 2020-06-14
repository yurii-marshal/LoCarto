import { Component, OnInit } from '@angular/core';
import { NbMenuService } from '@nebular/theme';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'ngx-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss']
})
export class CollectionsComponent implements OnInit {


  constructor(
    private _menuService: NbMenuService,
    private _commonService: CommonService
  ) { }

  ngOnInit() {
    this._commonService.setHeaderTitle({nav: 'Collections'});
  }

  goToHome() {
    this._menuService.navigateHome();
  }
}
