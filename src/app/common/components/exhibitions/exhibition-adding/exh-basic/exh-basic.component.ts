import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { CommonService } from '../../../../../services/common.service';

@Component({
  selector: 'ngx-exh-basic',
  templateUrl: './exh-basic.component.html',
  styleUrls: ['./exh-basic.component.scss']
})
export class ExhBasicComponent implements OnInit {
  @Input() set form(value: any) {
    this.formExhibition = value;
  }
  @Input() set curTab(num: number) {
    this.activeTab = num;
  }
  @Input() set addressData(value: any) {
    value.types.map((type) => {
      if (type === 'museum' || type === 'art_gallery') {
        const values = [{from: 'website', to: 'website'}, {from: 'international_phone_number', to: 'phone'}];
        values.map(item => {
          if (value[item.from]) this.setFormValue(value[item.from], item.to);
        });
        if (value.opening_hours && value.opening_hours.periods) this.setHours(value.opening_hours.periods);
      }
    });
  }
  @Output() setTab = new EventEmitter<boolean>();

  public formExhibition: FormGroup;
  public activeTab: number;
  // public openingHours: any;
  public tagField: any;
  public tagsArr = [];
  public showSnipper: boolean;
  public showWorkDays: boolean;
  public days: any;

  public telInputObj;
  public phonePattern = new RegExp(/^([0-9\(\)\/\+ \-]*)$/);

  constructor(
    private _commonService: CommonService,
    private _fb: FormBuilder
  ) {
    const base = new Date();
    const from = base.setHours(8, 0,0,0);
    const to = base.setHours(17, 0,0,0);
    this.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      .map((item: any, i) => item = {id: item.toLowerCase().substring(0, 3), title: item, from: new Date(from), to: new Date(to), active: (i < 5)});
  }

  ngOnInit() {
  }

  setActiveTab(tab) {
    this.setTab.emit(tab);
  }

  getArrForms(nameArr) {
    return this.formExhibition.get(nameArr) as FormArray;
  }

  validationAct(type, form, nameInput, value) {
    this._commonService.validation(type, form, nameInput, value);
  }

  actionTag(type, val) {
    if (type === 'set') {
      const valArr = val.split(' ');
      valArr.map(item => {
        if (item.length > 0) this.tagsArr.push(item);
      });
      this.tagField = '';
    } else if (type === 'remove'){
      this.tagsArr.splice(val, 1);
    }

    this.setFormValue(this.tagsArr, 'tags');
  }

  setFormValue(value, nameProp, index?) {
    if (index === undefined) {
      // set fields
      const tempObj = {};
      tempObj[nameProp] = value;
      this.formExhibition.patchValue(tempObj);
    }
  }

  addWorkDays() {
    this.showWorkDays = !this.showWorkDays;
  }

  changeVal(event, nameVar) {
    // set fields
    this.setFormValue(event.target.checked, nameVar);
  }

  toggleDay(val, index) {
    if (!this.days[index].from && !this.days[index].to) {
      const base = new Date();
      const from = base.setHours(8, 0,0,0);
      const to = base.setHours(17, 0,0,0);

      this.days[index].from = new Date(from);
      this.days[index].to = new Date(to);
    }
    // set value of active day
    this.days[index].active = !this.days[index].active;
    this.updateWorkDays();
  }

  timeAction(type, el, event, index) {
    this.days[index][type] = el.selected;
    this.updateWorkDays();
  }

  updateWorkDays() {
    // clear array before set new-profile one
    this.clearFormArray(this.getArrForms('workDays'));
    // set new-profile values
    this.days.map((item: any) => this.getArrForms('workDays').push(this._fb.group(item)));
  }

  clearFormArray(formArray: FormArray) {
    while (formArray.length !== 0) {
      formArray.removeAt(0)
    }
  }

  setTimes(day, index) {
    this.days = this._commonService.setTimes(day, index, this.days);
    this.updateWorkDays();
  }

  setHours(hours) {
    const indexes = [];

    hours.map((item, i) => {
      const openIndex = item.open.day;
      const dayIndex = (openIndex === 0) ? this.days.length - 1 : openIndex - 1;

      indexes.push(dayIndex);

      const base = new Date();
      const from = base.setHours(item.open.hours, item.open.minutes,0,0);
      const to = base.setHours(item.close.hours, item.close.minutes,0,0);

      this.days[dayIndex].from = new Date(from);
      this.days[dayIndex].to = new Date(to);
      this.days[dayIndex].active = true;
    });

    this.days.map((day, index) => {
      if (!indexes.includes(index)) day.active = false;
    });

    this.addWorkDays();
    this.updateWorkDays();
  }

  initTelInputObject(obj) {
    this.telInputObj = obj;
    this.telInputObj.setCountry('');
  }

  onCountryChange(country) {
    if (country.dialCode) {
      this.formExhibition.controls.phone.patchValue('+' + country.dialCode + ' ');
    }
  }
}
