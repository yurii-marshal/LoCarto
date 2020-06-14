import { Component, OnInit } from '@angular/core';
import { SlimLoadingBarEvent, SlimLoadingBarService } from 'ng2-slim-loading-bar';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  templateUrl: './footer.component.html',
})
export class FooterComponent implements OnInit {
  public files: any;
  public showProg = true;
  public currentYear: any;

  constructor(
    private _commonService: CommonService
  ) {}

  ngOnInit() {
    const today = new Date();
    this.currentYear = today.getFullYear();
    this._commonService.uploadedLineChange.subscribe((value: any) => {
      this.files = value;
      this.checkValues(value);
    });
  }

  checkValues(value) {
    let count = 0;
    value.map(file => (file.progress === 100) ? count++ : '');
    if (count === value.length) {
      setTimeout(() => {
        this._commonService.setUploadedLine([]);
      }, 2000);
    }
  }
}
