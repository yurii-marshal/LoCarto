import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonService } from '../../../../services/common.service';

@Component({
  selector: 'ngx-collector-edit',
  templateUrl: './collector-edit.component.html',
  styleUrls: ['./collector-edit.component.scss']
})
export class CollectorEditComponent implements OnInit {
  @Output() dataSend = new EventEmitter<any>();
  public collectorForm: any;
  public profileData: any;
  public todayDate = new Date();
  public phonePattern = new RegExp(/^([0-9\(\)\/\+ \-]*)$/);
  public phoneInput = '';
  public selectedCountry: any;

  constructor(
    private _commonService: CommonService
  ) {
  }

  @Input() set collectorData(value: any) {
    this.profileData = value.data;
    if (!this.profileData.contacts.phone) {
      this.profileData.contacts.phone = {
        value: '',
        hidden: true
      };
    }

    this.collectorForm = value.form;
    this.setForm(value.data);
  }

  ngOnInit() {
  }

  validationAct(type, form, nameInput, value) {
    this._commonService.validation(type, form, nameInput, value);
  }

  saveData(form) {
    this.dataSend.emit(form);
  }

  setForm(data) {
    const contacts = data.contacts;
    const email = contacts.email;
    const phone = contacts.phone;
    const address = contacts.address;
    const company = contacts.company;

    // this.phoneInput = phone ? phone.value : '';
    // this.collectorForm.controls.contacts.controls['phone'].patchValue({value: this.phoneInput});

    this.selectedCountry = this._commonService.separatePhone((contacts && phone) ? phone.value : '');

    const obj = {
      id: data._id,
      name: data.name,
      contacts: {
        email: {
          value: contacts && email ? email.value : '',
          hidden: contacts && email ? email.hidden : true
        },
        phone: {
          value: contacts && phone ? phone.value : '',
          hidden: contacts && phone ? phone.hidden : true
        },
        address: {
          value: contacts && address ? address.value : '',
          hidden: contacts && address ? address.hidden : true
        },
        company: {
          value: contacts && company ? company.value : '',
          hidden: contacts && company ? company.hidden : true
        }
      }
    };
    this.collectorForm.patchValue(obj);
  }

  toggleDirection(newVal, varName) {
    this.collectorForm.controls.contacts.controls[varName].value.hidden =
      !this.collectorForm.controls.contacts.controls[varName].value.hidden;
  }

  onCountryChange(country) {
    if (country.dialCode) {
      this.phoneInput = '+' + country.dialCode + ' ';
      this.collectorForm.controls.contacts.controls['phone'].patchValue({value: this.phoneInput});
    }
  }

  onPhoneChange(ev) {
    if (this.profileData.contacts.phone) {
      this.profileData.contacts.phone.value = ev.target.value;
      // if (!this.phoneInput.value.startsWith('+') && this.selectedCountry.dialCode) {
      //   this.phoneInput.value = `+${this.selectedCountry.dialCode} ${this.phoneInput.value}`;
      // }
    } else {
      this.profileData.contacts.phone = this.phoneInput;
    }
  }
}
