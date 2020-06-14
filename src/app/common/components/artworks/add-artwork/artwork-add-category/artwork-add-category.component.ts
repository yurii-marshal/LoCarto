import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import {CategoryModel} from '../../../../../models/category.model';

@Component({
  selector: 'ngx-artwork-add-category',
  templateUrl: './artwork-add-category.component.html',
  styleUrls: ['./artwork-add-category.component.scss']
})
export class ArtworkAddCategoryComponent implements OnInit {
  @Input() set tab(value: number) {
    this.activeTab = value;
  }
  @Input() set formData(value: any) {
    this.formArtwork = value;
  }
  @Input() set categoriesData(value: any) {
    this.categories = value;
  }
  @Input() set curCat(value: any) {
    this.currentCat = value;
  }

  @Output() activeSet = new EventEmitter<any>();
  @Output() activeCat = new EventEmitter<any>();

  public formArtwork: any;
  public currentCat: number;
  public categories;
  public activeTab: any;

  constructor (
    public _fb: FormBuilder
  ) {}

  ngOnInit() {}

  changeTab(index) {
    this.activeSet.emit(index);
  }

  setFormValue(value, nameProp, index?) {
      // set fields base on category
      if (nameProp === 'category') {
        this.categories.map(item => {
          if (item.id === value) {
            this.addFields(item.fields);
            this.currentCat = item;
            this.formArtwork.patchValue({category: item.id});
          }
        });
      } else if (nameProp === 'subcategory') {

        if (value && value.copies) {
          this.currentCat['editions'] = value.copies;
        } else {
          this.currentCat['editions'] = '';
        }

        if (this.currentCat) {

          const arrValues = this.currentCat['fields'].filter(item => item.base);
          arrValues[0].values.map(item => {

            if (item.id === value.id) {
              this.formArtwork.patchValue({subcategory: item.id});

              const arr = this.getArrForms('fields');
              arr.controls[index].patchValue({selected: item.id, fieldId: item.id});
            }
          });
        }
      }

      this.activeCat.emit(this.currentCat);
  }

  addFields(fields) {
    fields.map(item => {
      item.selected = '';
      item.fieldId = '';
      item.showEl = false;
      if (item.values) {
        item.options = this._fb.array([]);
        item.values.map(val => {
          if (val.deps) val.deps = [val.deps];
          val.show = false;
          item.options.push(this._fb.group(val));
        });
      }
    });

    // clear - before set
    this.formArtwork.setControl('fields',  this._fb.array([]));

    fields.map(field => {
      this.getArrForms('fields').push(this._fb.group(field));
    });
  }

  getArrForms(nameArr) {
    return this.formArtwork.get(nameArr) as FormArray;
  }
}
