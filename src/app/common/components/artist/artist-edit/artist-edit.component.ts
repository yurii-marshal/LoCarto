import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import * as Validator from '../../../../../assets/js/validator.min.js';
import { CommonService } from '../../../../services/common.service';

@Component({
  selector: 'ngx-artist-edit',
  templateUrl: './artist-edit.component.html',
  styleUrls: ['./artist-edit.component.scss']
})
export class ArtistEditComponent implements OnInit {
  @Output() dataSend = new EventEmitter<any>();
  public phonePattern = new RegExp(/^([0-9\(\)\/\+ \-]*)$/);
  public profileData: any;
  public educationYearChanges = [];
  public grantYearChanges = [];
  public deathInfo: boolean;
  public todayDate = new Date();
  public selectedYear = [];
  public selectedYearStart = [];
  public selectedYearEnd = [];
  public datesEducation = [];
  public birthDateAll: any;
  public deathDateAll: any;
  public phoneInput = {value: '', hidden: true};
  public selectedCountry: any;

  constructor(
    private _commonService: CommonService
  ) {
  }

  @Input() set proData(value: any) {
    this.profileData = value;
    this.selectedCountry =
      this._commonService.separatePhone((this.profileData.contacts && this.profileData.contacts.phone) ?
        this.profileData.contacts.phone.value : '');
    if (!this.profileData.contacts.phone) {
      this.profileData.contacts.phone = this.phoneInput;
    } else {
      this.phoneInput = this.profileData.contacts.phone;
    }
    // if (!this.selectedCountry) {
    //   this.phoneInput.value = '+47 ';
    //   this.selectedCountry = {iso2: 'no'};
    // }
  }

  @Input() set dataForm(value: any) {
    if (value) {
      Object.keys(value).map(key => {
        this[key] = value[key];
      });
    }
  }

  ngOnInit() {
  }

  handleAddressChange(address: Address, nameVar, form?) {
    if (nameVar === 'birth' || nameVar === 'death') {
      let city = '';
      let country = '';
      address.address_components.map(item => {
        if (item.types[0] === 'locality') city = item.long_name;
        if (item.types[0] === 'country') country = item.long_name;
      });

      if (nameVar === 'birth') {
        this.profileData.birth.city = city;
        this.profileData.birth.country = city + ', ' + country;
      } else {
        this.profileData.death.city = city;
        this.profileData.death.country = city + ', ' + country;
      }
    } else if (nameVar === 'studio') {
      if (!this.profileData.contacts.studio) {
        this.profileData.contacts.studio = {};
      }
      this.profileData.contacts.studio.value = address.formatted_address;
    }
  }

  selectDate(datepicker, type, index, event) {
    if (typeof type === 'string') {
      if (this[type][index]) {
        this[type][index] = event;
      } else {
        this[type].push(event);
      }
    } else {
      if (this[type][index]) {
        this[type][index] = event;
      } else {
        this[type][0][index].push(event);
      }
    }
    datepicker.close();

    this.changeDate(type, index);
  }

  changeDate(type, index) {
    if (type === 'selectedYearStart' || type === 'selectedYearEnd') {
      const i = (type === 'selectedYearStart') ? 0 : 1;
      if (this.educationYearChanges[index]) {
        this.educationYearChanges[index][i] = !this.educationYearChanges[index][i];
      } else {
        this.educationYearChanges.push([false, false]);
        this.educationYearChanges[index][i] = !this.educationYearChanges[index][i];
      }

    } else {
      if (this.grantYearChanges[index] || this.grantYearChanges[index] === false) {
        this.grantYearChanges[index] = !this.grantYearChanges[index];
      } else {
        this.grantYearChanges.push(true);
      }
    }
  }

  onCountryChange(country) {
    if (country.dialCode) {
      this.profileData.contacts.phone.value = this.phoneInput.value = '+' + country.dialCode + ' ';
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

  addItem(type: string, arrName: string) {
    if (type === 'education') {
      this.profileData[arrName].push({
        university: '',
        startDate: '',
        endDate: ''
      });
      this.educationYearChanges.push([false, false]);
    } else if (type === 'grant') {
      this.profileData[arrName].push({
        name: '',
        year: ''
      });
      this.grantYearChanges.push(false);
    } else if (type === 'death') {
      this.deathInfo = true;
    }
  }

  removeItem(index, varName: string) {
    this.profileData[varName].splice(index, 1);
  }

  saveData(form) {
    this.dataSend.emit(form);
  }

  validation(type, form, nameInput, value) {
    let namePattern;
    let options;
    switch (type) {
      case 'phone':
        namePattern = 'isMobilePhone';
        break;
      case 'link':
        namePattern = 'isURL';
        break;
      case 'email':
        namePattern = 'isEmail';
        break;
    }

    if (nameInput === 'wikipedia') {
      options = {
        require_protocol: true
      };
    }

    if (Validator[namePattern](value, options)) {
      form.controls[nameInput].setErrors(null);
    } else {
      form.controls[nameInput].setErrors({'incorrect': true});
    }
  }

  toggleDirection(newVal, varName) {
    this.profileData.contacts[varName].hidden = !this.profileData.contacts[varName].hidden;
  }
}
