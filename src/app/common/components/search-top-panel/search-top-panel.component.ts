import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'ngx-search-top-panel',
  templateUrl: './search-top-panel.component.html',
  styleUrls: ['./search-top-panel.component.scss']
})
export class SearchTopPanelComponent implements OnInit {
  @Input() set actionData(val: any) {
    this.actionButton = val;
  }
  @Output() actionOut = new EventEmitter<any>();
  @Output() dataOut = new EventEmitter<any>();

  public actionButton: any;

  constructor() { }

  ngOnInit() {
  }

  send(form: NgForm, clear?) {
    this.dataOut.emit(form.value);
  }

  emitAction() {
    this.actionOut.emit(true);
  }

}
