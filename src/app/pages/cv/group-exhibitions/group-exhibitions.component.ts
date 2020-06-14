import { Component, OnInit } from '@angular/core';
import { NbMenuService } from '@nebular/theme';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'ngx-group-exhibitions',
  templateUrl: './group-exhibitions.component.html',
  styleUrls: ['./group-exhibitions.component.scss']
})
export class GroupExhibitionsComponent implements OnInit {

  constructor(
    private _menuService: NbMenuService,
    private _commonService: CommonService
  ) { }

  ngOnInit() {
    this._commonService.setHeaderTitle({nav: 'Group Exhibitions'});
  }

  goToHome() {
    this._menuService.navigateHome();
  }

}
