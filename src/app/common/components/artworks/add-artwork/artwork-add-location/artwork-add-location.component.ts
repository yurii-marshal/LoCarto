import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { ArtStorageService } from '../../../../../services/art-storage.service';
import { StorageService } from '../../../../../services/storage.service';
import {ArtStorageModel} from '../../../../../models/art-storage.model';
import {CategoryModel} from '../../../../../models/category.model';

@Component({
  selector: 'ngx-artwork-add-location',
  templateUrl: './artwork-add-location.component.html',
  styleUrls: ['./artwork-add-location.component.scss']
})
export class ArtworkAddLocationComponent implements OnInit {
  @Input() set tab(value: number) {
    this.activeTab = value;
  }
  @Input() set formData(value: any) {
    this.formArtwork = value;
  }
  @Input() set curCat(value: any) {
    this.currentCat = value;
  }
  @Input() set categoriesData(value: any) {
    this.categories = value;
  }

  @Output() activeSet = new EventEmitter<any>();

  public formArtwork: any;
  public activeTab: number;
  public currentCat: any;
  public artStorages: ArtStorageModel[];
  public profileId: any;
  public categories: CategoryModel[];
  public options  = [
    { value: 'cm', label: 'cm', checked: true },
    { value: 'inch', label: 'Inch', checked: false }
  ];
  public places = [
    { title: 'Sold', id: 'sold'},
    { title: 'Available', id: 'available'}
  ];

  constructor (
    public _fb: FormBuilder,
    public _artStorageService: ArtStorageService,
    public _storage: StorageService
  ) {}

  ngOnInit() {
    this.profileId = this._storage.get('profile') ? this._storage.get('profile').id : '';
    this.getArtStorages();
    this.setFormValue(this.places[1].id, 'placeLoc')
  }

  changeTab(index) {
    this.activeSet.emit(index);
  }

  setFormValue(value, nameProp, index?) {
    if (index === undefined) {
      const tempObj = {};
      tempObj[nameProp] = value;
      this.formArtwork.patchValue(tempObj);
    } else {
      const arr = this.getArrForms('fields');
      arr.controls[index].patchValue({selected: value, fieldId: nameProp.id});
    }
  }

  getFormValue(nameProp) {
    return this.formArtwork.get(nameProp).value;
  }

  getArrForms(nameArr) {
    return this.formArtwork.get(nameArr) as FormArray;
  }

  getArtStorages() {
    this._artStorageService.getProfileStorages(this.profileId).subscribe(res => {
      this.artStorages = res.artstorages;
    });
  }

  setPlaceholder(place) { // TODO should be remove
    let res: string;
    switch (place) {
      case 'In storage':
        res ='Storage name';
        break;
      case 'In collection':
        res = 'Collector`s name';
        break;
      case 'In commissions':
        res = 'Museum, gallery, etc';
        break;
      default:
        res = 'Place name';
        break;
    }
    return res;
  }
}
