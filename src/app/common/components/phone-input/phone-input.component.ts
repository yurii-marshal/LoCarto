import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'phone-input',
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.scss']
})

export class PhoneInputComponent implements OnInit {
  public telInputObj;
  public phoneValue: string;
  public phonePattern = new RegExp(/^([0-9\(\)\/\+ \-]*)$/);
  @Output() valueChange = new EventEmitter<any>();

  constructor() {
  }

  @Input()
  set value(value: string) {
    this.phoneValue = value;
  }

  ngOnInit() {
  }

  initTelInputObject(obj) {
    this.telInputObj = obj;
    this.telInputObj.setCountry('');
  }

  onCountryChange(country) {
    if (country.dialCode) {
      this.phoneValue = '+' + country.dialCode + ' ';
    }
    this.valueChange.emit(this.phoneValue);
  }
}
