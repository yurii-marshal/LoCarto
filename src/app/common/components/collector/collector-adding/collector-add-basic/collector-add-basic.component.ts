import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, NgForm } from '@angular/forms';
import { CommonService } from '../../../../../services/common.service';

@Component({
  selector: 'ngx-collector-add-basic',
  templateUrl: './collector-add-basic.component.html',
  styleUrls: ['./collector-add-basic.component.scss']
})
export class CollectorAddBasicComponent implements OnInit {
  @Input() set form(value: any) {
    this.collectorForm = value;
  }
  @Input() set tab(value: any) {
    this.activeTab = value;
  }
  @Output() socialsData = new EventEmitter<any>();
  @Output() dataToSend = new EventEmitter<any>();
  @Output() changeTab = new EventEmitter<any>();

  public collectorForm: any;
  public activeTab: any;

  public telInputObj;
  public phonePattern = new RegExp(/^([0-9\(\)\/\+ \-]*)$/);

  constructor(
    private _commonService: CommonService
  ) { }

  ngOnInit() {
  }

  validationAct(type, form, nameInput, value) {
    this._commonService.validation(type, form, nameInput, value);
  }

  setActiveTab(index, form?: NgForm) {
    // check form before allow set new-profile tab active
    if (form && form.valid) {
      this.activeTab = index;
    }
    // if it is not tab - allow set new-profile tab as active
    if (!form) this.activeTab = index;

    // emmit data to parent
    // this.formData.emit(this.form);
    this.changeTab.emit(this.activeTab);
  }

  sendData() {
    this.dataToSend.emit(true);
  }

  initTelInputObject(obj) {
    this.telInputObj = obj;
    this.telInputObj.setCountry('');
  }

  onCountryChange(country) {
    if (country.dialCode) {
      this.collectorForm.controls.phone.patchValue('+' + country.dialCode + ' ');
    }
  }
}
