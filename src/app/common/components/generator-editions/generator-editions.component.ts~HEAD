import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'ngx-generator-editions',
  templateUrl: './generator-editions.component.html',
  styleUrls: ['./generator-editions.component.scss']
})
export class GeneratorEditionsComponent implements OnInit {
  @Input() set category(value: any) {
    if (value.id === "CATEGORY_PHOTOGRAPHY_a2a5c33eda9046576764de2400b1aa50") this.photography = true;
    this.currentCategory = value;
  }
  @Input() set listCategories(value: any) {
    this.categories = value;
  }
  @Input() set listOptions(value: any) {
    this.options = value;
    // set default 'cm' checked - true
    this.options.map(opt => {
      opt.checked = (opt.value === 'cm');
    });
  }
  @Input() set form(value: any) {
    this.formArtwork = value;
    // base values sets
    this.setFormValue(this.currency[1].value, 'currencyCop');
    this.setFormValue(this.currency[1].value, 'currencyLoc');
    this.setFormValue('cm', 'units');
  }

  public currentCategory: any;
  public categories: any;
  public options: any;
  public showError: boolean;
  public photography: boolean;
  public formArtwork: FormGroup;
  public selectedEditions: any;

  public editions = [1, 2, 3, 4, 5, 6];
  public currency = ['USD', 'EUR', 'GBP', 'CHF', 'NOK', 'SEK', 'RUB', 'AUD', 'CNY'].map(item => ({title: item, value: item}));
  public viewEditions = [];

  constructor(
    private _dialogService: NbDialogService,
    private _fb: FormBuilder
  ) { }

  ngOnInit() {}

  setFormValue(value, nameProp, index?) {
    if (index === undefined) {
      // set fields base on category
      const tempObj = {};
      tempObj[nameProp] = value;
      this.formArtwork.patchValue(tempObj);
    } else {
      const arr = this.getArrForms('fields');
      arr.controls[index].patchValue({selected: value, fieldId: nameProp.id});
    }
  }

  deleteFromArr(i, nameArr) {
    this.getArrForms(nameArr).removeAt(i);
    this.viewEditions.splice(i, 1);
  }

  getArrForms(nameArr) {
    return this.formArtwork.get(nameArr) as FormArray;
  }

  generateEditions(form) {
    this.showError = false;
    const formVal = form.value;
    if (!this.validGenerator()) {
      this.showError = true;
      return;
    }

    const ordinaryCount = formVal.totalNumber;
    const proofCount = formVal.copyNumber;

    const data = {
      widthArt: formVal.widthArt,
      heightArt: formVal.heightArt,
      widthPap: formVal.widthPap,
      heightPap: formVal.heightPap,
      widthMot: formVal.widthMot,
      heightMot: formVal.heightMot,
      depth: formVal.depth,
      price: formVal.priceBas || formVal.priceCop,
      currency: formVal.currencyBas || formVal.currencyCop,
      units: formVal.units,
      place: '',
      namePlace: ''
    };

    if (ordinaryCount > 0) this.addEditions(ordinaryCount, 'ordinary', data);
    if (proofCount > 0) this.addEditions(proofCount, 'proof', data);

    // clear form values
    this.formArtwork.patchValue({
      widthArt: null,
      heightArt: null,
      widthPap: null,
      heightPap: null,
      widthMot: null,
      heightMot: null,
      depth: null,
      priceBas: null,
      priceCop: null,
      totalNumber: null,
      copyNumber: null,
      proof: false,
      units: 'cm'
    });
    this.selectedEditions = null;
  }

  validGenerator() {
    let arrValues = ['totalNumber'];

    if (this.currentCategory.sizes['artwork']) {
      arrValues.push('heightArt');
      arrValues.push('widthArt');
    }

    if (this.currentCategory.sizes['paper']) {
      arrValues.push('heightPap');
      arrValues.push('widthPap');
    }

    const res = arrValues.map(item => {
      if (!this.formArtwork.get(item).value) return false;
    });

    if (this.formArtwork.get('proof').value) res.push(this.formArtwork.get('copyNumber').value);

    return !res.includes(false);
  }

  addEditions(count, type, item) {
    let check: boolean;

    // generate editions array
    const editions = this.setChildArr(count, type, item);

    if (this.getArrForms('allEditions').value && this.getArrForms('allEditions').value.length > 0) {
      this.getArrForms('allEditions').value.map(item => {
        check = this.checkTheSame(item[0], editions.value[0]);

        const cp = this.getArrForms('allEditions').value.filter(item => this.checkTheSame(item[0], editions.value[0], true));

        if (cp.length <= 0) {
          this.getArrForms('allEditions').push(editions);
        }
      });
    } else {
      this.getArrForms('allEditions').push(editions);
    }

    this.generateViewEditions(editions.value);
  }

  generateViewEditions(editions) {
    // filter on unique
    const cp = this.viewEditions.filter(item => this.checkTheSame(item, editions[0]));

    this.viewEditions.map(item => {
      const check = this.checkTheSame(item, editions[0]);
      if (check && (item.type !== editions[0].type)) item[editions[0].type] = editions[0].locations.length;
    });

    if (cp.length <= 0) {
      const type = editions[0].type;
      editions[0][type] = editions[0].locations.length;

      this.viewEditions.push(editions[0])
    }
  }

  setChildArr(count, type, data) {
    // init base variables
    let i = 0;
    let res = this._fb.array([]);

    // generate array with 'notPrinted' for location param
    let locationsArr = [];
    while (i < count) {
      if (type === 'proof' || type === 'ordinary') {
        if (this.photography) {
          locationsArr.push('notPrinted');
        } else {
          locationsArr.push('notChosen');
        }
      }
      i++;
    }

    // set data to the copy item
    const obj = {
      type: type,
      widthArt: data.widthArt,
      heightArt: data.heightArt,
      widthPap: data.widthPap,
      heightPap: data.heightPap,
      widthMot: data.widthMot,
      heightMot: data['heightMot'],
      depth: data.depth,
      measurement: data.measurement,
      price: data['price'],
      currency: data['currency'],
      place: '',
      namePlace: '',
      locations: this._fb.array(locationsArr),
      units: data.units
    };

    // add object to the resulting array
    const proofOrdinary = Object.assign({}, obj);
    res.push(this._fb.group(proofOrdinary));
    return res;
  }

  checkTheSame(first, second, checkType?) {
    // fields for checking difference
    const params = ['heightArt', 'heightMot', 'heightPap', 'widthArt', 'widthMot', 'widthPap'];

    if (checkType) params.push('type');

    Object.keys(first).map(key => {
      if (first[key] === null) first[key] = '';
    });
    Object.keys(second).map(key => {
      if (second[key] === null) second[key] = '';
    });
    const resArray = params.map(param => first[param] === second[param]);
    return !resArray.includes(false);
  }

  generateArray(number) {
    return Array(number).fill('').map((x,i)=>i);
  }

  openModal(modal: TemplateRef<any>) {
    this._dialogService.open(modal);
  }
}
