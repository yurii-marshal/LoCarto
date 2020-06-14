import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-exh-final',
  templateUrl: './exh-final.component.html',
  styleUrls: ['./exh-final.component.scss']
})
export class ExhFinalComponent implements OnInit {
  @Input() set curId(val: string) {
    this.createdId = val;
  }

  public createdId: string;

  constructor() { }

  ngOnInit() {
  }

}
