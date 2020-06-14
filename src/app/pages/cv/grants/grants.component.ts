import { Component, OnInit } from '@angular/core';
import { NbMenuService } from '@nebular/theme';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'ngx-grants',
  templateUrl: './grants.component.html',
  styleUrls: ['./grants.component.scss']
})
export class GrantsComponent implements OnInit {

  constructor(
    private _menuService: NbMenuService,
    private _commonService: CommonService
  ) { }

  ngOnInit() {
    this._commonService.setHeaderTitle({nav: 'Grants'});
  }

  goToHome() {
    this._menuService.navigateHome();
  }

}
