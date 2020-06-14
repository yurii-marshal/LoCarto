import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';

@Component({
  selector: 'ngx-artwork-add-basic',
  templateUrl: './artwork-add-basic.component.html',
  styleUrls: ['./artwork-add-basic.component.scss']
})
export class ArtworkAddBasicComponent implements OnInit {
  @Input() set tab(value: number) {
    this.activeTab = value;
  }
  @Input() set formData(value: any) {
    if (value) {
      this.formArtwork = value;
      this.checkOptions(value);
      // force set values for fields

      // base values set ups
      const currencyForInit = ['currencyLoc', 'currencyPaid', 'currencyInsurance'];
      currencyForInit.map(cur => this.setFormValue(this.currency[1].value, cur));
      this.setFormValue('cm', 'measurement');
    }
  }
  @Input() set categoriesData(value: any) {
    this.categories = value;
  }
  @Input() set curCat(value: any) {
    this.currentCat = value;
  }
  @Input() set curPro(value: any) {
    if (value) {
      this.profileData = value;
    }
  }

  @Output() activeSet = new EventEmitter<any>();

  public currency = ['USD', 'EUR', 'GBP', 'CHF', 'NOK', 'SEK', 'RUB', 'AUD', 'CNY'].map(item => ({title: item, value: item}));
  public acquiredList = ['Bought', 'Gift', 'Inheritance'].map(item => ({title: item, value: item.toUpperCase()}));
  public currentCat: any;
  public fullDateCreation: any;
  public formArtwork: any;
  public activeTab: any;
  public tagsArr = [];
  public tagField: any;
  public categories: boolean;
  public todayDate = new Date();
  public changeYear = false;
  public profileData: any;
  public collectorFields = {
    frame: false,
    glass: false
  };
  public options = [
    { value: 'cm', label: 'cm', checked: true },
    { value: 'inch', label: 'Inch', checked: false }
  ];

  constructor (
    public _fb: FormBuilder
  ) {}

  ngOnInit() {}

  checkOptions(form) {
    // set base field for comparing
    const baseField = form.value.fields.filter(field => field.base)[0];

    form.value.fields.map((field, i) => {
      if (!field.base) {
        if (field['options']) {
          field['options'].map((opt, index) => {
            if (opt.deps) {
              // check options needed
              const finded = opt.deps.filter(item => item === baseField.id + '.' + form.value.subcategory);
              // to show option in select
              this.getArrForms('fields').controls[i]['controls'].options.controls[index].patchValue({show: finded && finded.length > 0});
              // to show field in view
              if (finded && finded.length > 0) {
                this.setFormValue({showEl: true}, 'fields', i);
              }
            } else {
              // to show option in select
              this.getArrForms('fields').controls[i]['controls'].options.controls[index].patchValue({show: true});
              // to show field in view
              this.setFormValue({showEl: true}, 'fields', i);
            }
          });
        }
      }
    });
  }

  changeTypeDate(event) {
    this.fullDateCreation = event.target.checked;
    this.formArtwork.patchValue({dateCreation: ''});
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

  changeTab(index) {
    this.activeSet.emit(index);
  }

  setFormValue(value, nameProp, index?, multi?, remove?) {

    if (index === undefined) {
      const tempObj = {};
      tempObj[nameProp] = value;
      this.formArtwork.patchValue(tempObj);
    } else {
      const arr = this.getArrForms('fields');

      const tempObj = {};
      Object.keys(value).map(key => {
        if (value[key] !== undefined) {
          if (multi) {
            let existVal = arr.controls[index].value.selected;

            if (existVal) { // if value is array
              if (remove) {
                existVal = existVal.filter(item => item !== value[key]);
              } else {
                existVal.push(value[key]);
              }
            } else {
              existVal = [value[key]];
            }

            tempObj[key] = existVal;
          } else {
            tempObj[key] = value[key];
          }
        }
      });

      tempObj['fieldId'] = nameProp.id;
      arr.controls[index].patchValue(tempObj);
    }
  }

  getFormValue(nameProp) {
    return this.formArtwork.get(nameProp).value;
  }

  getArrForms(nameArr) {
    return this.formArtwork.get(nameArr) as FormArray;
  }

  selectDate(datepicker, value) {
    this.formArtwork.patchValue({dateCreation: value});
    if (!this.fullDateCreation) datepicker.close();
    this.changeYear = !this.changeYear;
  }

  newFields(el, type) {
    if (el['value'] === false) {
      if (type === 'glass') {
        this.setFormValue('', 'glass');
      } else {
        this.setFormValue('', 'widthFrame');
        this.setFormValue('', 'heightFrame');
        this.setFormValue('', 'depthFrame');
      }
    }
    this.collectorFields[type] = el['value'];
  }
}
