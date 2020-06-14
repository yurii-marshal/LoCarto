import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'ngx-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent implements OnInit {
  @Output() allUploaded = new EventEmitter<any>();
  @Input() set data(value: any) {
    this.files = value;
  };
  public files: any;

  constructor(
    private _commonService: CommonService
  ) { }

  ngOnInit() {
  }

  close() {
    this.allUploaded.emit(true);
  }
}
