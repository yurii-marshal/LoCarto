import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as Validator from '../../../../../../assets/js/validator.min.js';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { NgForm } from '@angular/forms';
import { StorageService } from '../../../../../services/storage.service';

@Component({
  selector: 'ngx-artist-basic',
  templateUrl: './artist-add-basic.component.html',
  styleUrls: ['./artist-add-basic.component.scss']
})
export class ArtistAddBasicComponent implements OnInit {
  @ViewChild('formProfile') form: NgForm;
  @Input() set tab(value: any) {
    this.activeTab = value;
  }
  @Input() set newSet(value: any) {
    // this.fromNew = value;
  }
  @Input() set getForm(value: any) {
    this.formData.emit(this.form);
  }

  @Output() socialsData = new EventEmitter<any>();
  @Output() changeTab = new EventEmitter<any>();
  @Output() formData = new EventEmitter<any>();

  public socials: any;
  public activeTab: any;
  public selectedOpt = 'artist';
  public currentEmail: any;
  public todayDate = new Date();
  public addresses = {
    studio: '',
    birthAdd: '',
    birthCountry: '',
    birthCity: '',
    deathAdd: '',
    deathCountry: '',
    deathCity: ''
  };
  public options = [
    { value: 'artist', label: 'I`m an artist', checked: true },
    { value: 'curator', label: 'Catalogue Raisonné administrator', checked: false }
  ];

  public telInputObj;
  public phonePattern = new RegExp(/^([0-9\(\)\/\+ \-]*)$/);

  constructor(
    private _storage: StorageService
  ) { }

  ngOnInit() {
    // if(this.fromNew) {
    //   this.options[0].checked = false;
    //   this.options[1].checked = true;
    // }
    this.currentEmail = this._storage.get('acc-email');
  }

  initTelInputObject(obj) {
    this.telInputObj = obj;
    this.telInputObj.setCountry('');
  }

  onCountryChange(country) {
    if (country.dialCode) {
      this.form.controls.phone.setValue('+' + country.dialCode + ' ');
    }
  }

  changed(event) {
    // set options
    this.selectedOpt = event;
  }

  validation(type, form, nameInput, value) {
    let namePattern;
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

    if (Validator[namePattern](value)) {
      form.controls[nameInput].setErrors(null);
    } else {
      form.controls[nameInput].setErrors({'incorrect': true});
    }
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
        this.addresses.birthCity = city;
        this.addresses.birthCountry = country;
        this.addresses.birthAdd = city + ', ' + country;
      } else {
        this.addresses.deathCity = city;
        this.addresses.deathCountry = country;
        this.addresses.deathAdd = city + ', ' + country;
      }
    } else {
      this.addresses[nameVar] = address.formatted_address;
    }
  }

  setActiveTab(index, form?: NgForm) {
    // check form before allow set new-profile tab active
    if (form && form.valid) {
      this.activeTab = index;
    }
    // if it is not tab - allow set new-profile tab as active
    if (!form) this.activeTab = index;

    // emmit data to parent
    this.formData.emit(this.form);
    this.changeTab.emit(this.activeTab);
  }

  socUpdate(value) {
    // set socials from Output component
    this.socialsData.emit(value);
  }
}
