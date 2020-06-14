import { Component, OnInit } from '@angular/core';
import { NbMenuService } from '@nebular/theme';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'ngx-press',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit {

  constructor(
    private _menuService: NbMenuService,
    private _commonService: CommonService
  ) { }

  ngOnInit() {
    this._commonService.setHeaderTitle({nav: 'Templates'});
  }

  goToHome() {
    this._menuService.navigateHome();
  }

}
