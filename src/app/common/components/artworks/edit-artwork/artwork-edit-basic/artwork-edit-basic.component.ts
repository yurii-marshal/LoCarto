import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { GALLERY_CONF, NgxImageGalleryComponent } from 'ngx-image-gallery';
import { CommonService } from '../../../../../services/common.service';
import { ArtworkService } from '../../../../../services/artwork.service';
import { CategoryModel } from '../../../../../models/category.model';
import { FormArray } from '@angular/forms';

@Component({
  selector: 'ngx-artwork-edit-basic',
  templateUrl: './artwork-edit-basic.component.html',
  styleUrls: ['./artwork-edit-basic.component.scss']
})
export class ArtworkEditBasicComponent implements OnInit {
  @ViewChild(NgxImageGalleryComponent) ngxImageGallery: NgxImageGalleryComponent;

  @Input() set formData(value: any) {
    if (value) this.formArtwork = value;
  }
  @Input() set profile(value: any) {
    if (value) this.profileData = value;
  }
  @Input() set categoriesData(value: CategoryModel[]) {
    if (value) this.categories = value;
  }
  @Input() set curCat(value: any) {
    if (value) this.selectedCat = value;
  }
  @Input() set editions(value: any) {
    if (value) this.editionsData = value;
  }
  @Input() set optionsData(value: any) {
    if (value) this.options = value;
  }
  @Input() set dataArtwork(value: any) {
    if (value) this.artworkData = value;
  }
  @Input() set tagsData(value: any) {
    if (value) this.tagsArr = value;
  }
  @Input() set changeYearStatus(value: any) {
    this.changeYear = value;
  }

  @Output() forceUpdateFiles = new EventEmitter<any>();
  @Output() updateArtwork = new EventEmitter<any>();
  @Output() photoChangeEvent = new EventEmitter<any>();

  public formArtwork: any;
  public tempAvatar: any;
  public artworkData: any;
  public filesInProgress: boolean;
  public filesData = [];
  public firstFileId = 0;
  public currentId: number;
  public showSnipper: boolean;
  public profileData: any;
  public categories: CategoryModel[];
  public selectedCat: any;
  public fullDateCreation: any;
  public changeYear: boolean;
  public editionsData: any;
  public options: any;
  public tagsArr: any;
  public todayDate = new Date();
  public galConf: GALLERY_CONF;
  public currency = ['USD', 'EUR', 'GBP', 'CHF', 'NOK', 'SEK', 'RUB', 'AUD', 'CNY'].map(item => ({title: item, value: item}));
  public acquiredList = ['Bought', 'Gift', 'Inheritance'].map(item => ({title: item, value: item.toUpperCase()}));
  public collectorFields = {
    frame: false,
    glass: false
  };

  constructor(
    private _commonService: CommonService,
    private _artworkService: ArtworkService
  ) { }

  ngOnInit() {
    // gallery configuration
    this.galConf = {
      imageOffset: '0px',
      showDeleteControl: false,
      showImageTitle: false
    };

    this._commonService.uploadedLineChange.subscribe((value: any) => {
      if (this.filesInProgress) {
        if (value && value.length < 1) {
          setTimeout(() => {
            this.filesInProgress = false;
          }, 1000);
        }
      }
    });
  }

  setFormValue(value, nameProp, index?, multi?, remove?) {
    if (index === undefined) {
      // set fields
      const tempObj = {};
      tempObj[nameProp] = value;
      this.formArtwork.patchValue(tempObj);
    } else {

      const arr = this.getArrForms('fields');

      if (value !== undefined) {
        if (multi) {
          let existVal = arr.controls[index].value.selected;

          if (existVal) { // if value is array
            if (remove) {
              existVal = existVal.filter(item => item !== value);
            } else {
              existVal.push(value);
            }
          } else {
            existVal = [value];
          }

          arr.controls[index]['controls'].selected.value = existVal;
        } else {
          arr.controls[index].patchValue({selected: value});
        }
      }
    }
  }

  getArrForms(nameArr) {
    return this.formArtwork.get(nameArr) as FormArray;
  }

  openGallery(index: number = 0) {
    this.ngxImageGallery.open(index);
  }

  photoChange(event, type?) {
    this.photoChangeEvent.emit({event: event, type: type});
  }

  setRotation(tempArr) {
    return new Promise(resolve => {
      let i = 0;
      tempArr.map((item) => {
        const link = item.tempUrl || item.url;
        if (link) {
          this._commonService.autoRotation(link).subscribe(rotate => {
            item.rotation = rotate;
            if (rotate && rotate.length > 0) {
              const ind = rotate.match(/\(/).index;
              const newRes = rotate.substring(0);
              item.unrotation = newRes.slice(0, ind) + newRes[ind] + '-' + newRes.slice(ind + 1);
            } else {
              // this.resetRotation();
            }
            i++;
            if (tempArr.length - 1 <= i) resolve(tempArr);
          });
        } else {
          i++;
        }
      });
    });
  }

  setMainFile(id, index) {
    this.firstFileId = index;

    this.filesData.map((item, i) => {
      if (item._id === id) this.firstFileId = i;
    });
    this.updateFiles(this.filesData, true);
  }

  updateFiles(files, fromMain?) {
    this.forceUpdateFiles.emit({files: files, fromMain: fromMain});
  }

  selectDate(datepicker, value) {
    this.formArtwork.patchValue({dateCreation: value});
    if (!this.fullDateCreation) datepicker.close();
    this.changeYear = !this.changeYear;
  }

  changeTypeDate(event) {
    this.fullDateCreation = event.target.checked;
    this.formArtwork.patchValue({dateCreation: ''});
    if (!this.fullDateCreation) this.changeYear = !this.changeYear;
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

  actionTag(type, val) {
    if (type === 'set') {
      if (this.tagsArr && this.tagsArr.length > 0) {
        if (val.length > 0) this.tagsArr.push(val);
      } else {
        this.tagsArr = [val];
      }
    } else if (type === 'remove'){
      this.tagsArr.splice(val, 1);
    }
    this.setFormValue(this.tagsArr, 'tags');
  }

  sendData(form) {
    this.updateArtwork.emit(form);
  }
}
