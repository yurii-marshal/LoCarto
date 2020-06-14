import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Address } from 'ngx-google-places-autocomplete/objects/address';

@Component({
  selector: 'ngx-artist-add-about',
  templateUrl: './artist-add-about.component.html',
  styleUrls: ['./artist-add-about.component.scss']
})
export class ArtistAddAboutComponent implements OnInit {
  @ViewChild('formProfile') form: NgForm;
  @Input() set type(value: string) {
    this.typePro = value;
  }
  @Input() set tab(value: any) {
    this.activeTab = value;
  }
  @Input() set newSet(value: any) {
    this.fromNew = value;
  }
  @Input() set getForm(value: any) {
    this.formData.emit(this.form);
  }

  @Output() changeTab = new EventEmitter<any>();
  @Output() formData = new EventEmitter<any>();
  @Output() dataToSend = new EventEmitter<any>();

  public typePro: string;
  public activeTab: any;
  public fromNew: any;
  public todayDate = new Date();
  public educationYearChanges = [[false, false]];
  public grantYearChanges = [];
  public deathInfo: boolean;
  public grantAr = [];
  public grantCu = [];
  public selectedYear = [];
  public selectedYearStart = [];
  public selectedYearEnd = [];
  public birthDateAll: any;
  public addresses = {
    studio: '',
    birthAdd: '',
    birthCountry: '',
    birthCity: '',
    deathAdd: '',
    deathCountry: '',
    deathCity: ''
  };
  public educationsAr = [
    {
      university: '',
      startDate: '',
      endDate: ''
    }
  ];
  public educationsCu = [
    {
      university: '',
      startDate: '',
      endDate: ''
    }
  ];

  constructor() { }

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

  selectDate(datepicker, type, index, event) {
    if (typeof type === 'string') {
      if (this[type][index]) {
        this[type][index] = event;
      } else {
        this[type].push(event);
      }
    } else {
      if (this[type[0]][index][type[1]]) {
        this[type[0]][index][type[1]] = event;
      } else {
        this[type[0]][index][type[1]].push(event);
      }
    }
    datepicker.close();

    this.changeDate(type, index);
  }

  changeDate(type, index) {
    if (type === 'selectedYearStart' || type === 'selectedYearEnd') {
      const i = (type === 'selectedYearStart') ? 0 : 1;
      this.educationYearChanges[index][i] = !this.educationYearChanges[index][i];
    } else {
      this.grantYearChanges[index] = !this.grantYearChanges[index];
    }
  }

  addItem(type: string, arrName: string) {
    if (type === 'education') {
      this[arrName].push({
        university: '',
        startDate: '',
        endDate: ''
      });
      this.educationYearChanges.push([false, false]);
    } else if (type === 'grant') {
      this[arrName].push({
        name: '',
        year: ''
      });
      this.grantYearChanges.push(false);
    } else if (type === 'death') {
      this.deathInfo = true;
    }
  }

  removeItem(index, varName: string) {
    this[varName].splice(index, 1);
  }

  hideItem() {
    this.deathInfo = false;
  }

  setActiveTab(index) {
    // set new-profile tab as active
    this.activeTab = index;

    // emmit data to parent
    this.formData.emit(this.form);
    this.changeTab.emit(this.activeTab);
  }

  selectDateAll(datepicker, type, index, event) {
    if (this[type[0]][index][type[1]]) {
      this[type[0]][index][type[1]] = event;
    } else {
      this[type[0]][index][type[1]].push(event);
    }
  }

  sendData() {
    this.formData.emit(this.form);
    this.dataToSend.emit(true);
  }
}
