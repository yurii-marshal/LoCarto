import { Component, OnInit } from '@angular/core';
import { NbMenuService } from '@nebular/theme';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'ngx-educations',
  templateUrl: './educations.component.html',
  styleUrls: ['./educations.component.scss']
})
export class EducationsComponent implements OnInit {

  constructor(
    private _menuService: NbMenuService,
    private _commonService: CommonService
  ) {
  }

  ngOnInit() {
    this._commonService.setHeaderTitle({nav: 'Educations'});
  }

  goToHome() {
    this._menuService.navigateHome();
  }

}
