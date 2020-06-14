import { Component, OnInit } from '@angular/core';
import { NbMenuService } from '@nebular/theme';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'ngx-solo-exhibitions',
  templateUrl: './solo-exhibitions.component.html',
  styleUrls: ['./solo-exhibitions.component.scss']
})
export class SoloExhibitionsComponent implements OnInit {

  constructor(
    private _menuService: NbMenuService,
    private _commonService: CommonService
  ) { }

  ngOnInit() {
    this._commonService.setHeaderTitle({nav: 'Solo Exhibitions'});
  }

  goToHome() {
    this._menuService.navigateHome();
  }

}
