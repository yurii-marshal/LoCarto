import { Component, OnInit } from '@angular/core';
import { NbMenuService } from '@nebular/theme';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'ngx-communication',
  templateUrl: './communication.component.html',
  styleUrls: ['./communication.component.scss']
})
export class CommunicationComponent implements OnInit {

  constructor(
    private _menuService: NbMenuService,
    private _commonService: CommonService
  ) { }

  ngOnInit() {
    this._commonService.setHeaderTitle({nav: 'Communication'});
  }

  goToHome() {
    this._menuService.navigateHome();
  }

}
