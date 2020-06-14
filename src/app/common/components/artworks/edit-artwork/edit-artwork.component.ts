import { Component, ElementRef, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonService } from '../../../../services/common.service';
import { FormArray, FormBuilder } from '@angular/forms';
import { NbDialogService } from '@nebular/theme';
import { ArtworkService } from '../../../../services/artwork.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ArtStorageService } from '../../../../services/art-storage.service';
import { StorageService } from '../../../../services/storage.service';
import { GALLERY_CONF, NgxImageGalleryComponent } from 'ngx-image-gallery';
import { FileSystemDirectoryEntry, FileSystemFileEntry, UploadEvent } from 'ngx-file-drop';
import { Title } from '@angular/platform-browser';
import { ProfileService } from '../../../../services/profile.service';
import {CategoryModel} from '../../../../models/category.model';

@Component({
  selector: 'ngx-edit-artwork',
  templateUrl: './edit-artwork.component.html',
  styleUrls: ['./edit-artwork.component.scss']
})
export class EditArtworkComponent implements OnInit, OnDestroy {
  @ViewChild(NgxImageGalleryComponent) ngxImageGallery: NgxImageGalleryComponent;
  @ViewChild('deleteCopieModal') deleteCopieModal: TemplateRef<any>;
  @ViewChild('editCopieModal') editCopieModal: TemplateRef<any>;
  @ViewChild('addBookModal') addBookModal: TemplateRef<any>;
  @ViewChild('removeModal') removeModal: TemplateRef<any>;
  @ViewChild('addEditionsModal') addEditionsModal: TemplateRef<any>;

  public tabs: any;
  public todayDate = new Date();
  public tempUrl: any;
  public activeTab = 1;
  public tagsArr = [];
  public artStorages: any;
  public sourceEditions: any;
  public dynamicExhibitions: any;
  public dynamicLiterature: any;
  public categories: CategoryModel[];
  public selectedCat: any;
  public currentId: number; // TODO
  public currentCopy: any;
  public showSnipper: boolean; // TODO
  private _sub: any;
  public artworkData: any; // TODO
  public firstFileId = 0; // TODO
  public editionsData = [];
  public filesData = []; // TODO
  public booksData = [];
  public findedBook: any;
  public currentDelete: any;
  public setEditions: any;
  public showSteps: boolean;
  public profileId: any;
  public typeStep = 'set';
  public tempAvatar: any; // TODO
  public overZone: boolean;
  public fullDateCreation: any; // TODO
  public changeYear: boolean; // TODO
  public changeYearLit: boolean;
  public galConf: GALLERY_CONF; // TODO
  public filesUrl: any;
  public filesInProgress: boolean; // TODO
  public mainFiles: any; // TODO
  public canMoves = true;
  public photography: boolean;
  public tempArr = [];
  public bottomOfPage: boolean;
  public options = [ // TODO
    { value: 'cm', label: 'cm', checked: true },
    { value: 'inch', label: 'Inch', checked: false }
  ];
  public types = ['doc', 'pdf', 'xls']; // TODO
  public places = [
    {title: 'Not printed yet', id: 'notPrinted'},
    {title: 'Not chosen', id: 'notChosen'},
    {title: 'Sold', id: 'sold'},
    {title: 'Available', id: 'available'}
  ];
  public currency = ['USD', 'EUR', 'GBP', 'CHF', 'NOK', 'SEK', 'RUB', 'AUD', 'CNY'].map(item => ({title: item, value: item})); // TODO
  public profileData: any;
  public collectorFields = { // TODO
    frame: false,
    glass: false
  };
  public acquiredList = ['Bought', 'Gift', 'Inheritance'].map(item => ({title: item, value: item.toUpperCase()})); // TODO


  public formArtwork = this._fb.group({
    id: '',
    title: '',
    notes: '',
    category: '',
    signature: '',
    fields: this._fb.array([]),
    tags: '',
    priceLoc: '',
    currencyLoc: '',
    width: '',
    height: '',
    depth: '',
    measurement: '',
    location: '',
    dateCreation: '',
    placeLoc: '',
    namePlaceLoc: '',

    artistName: '',
    acquired: '',
    pricePaid: '',
    currencyPaid: '',
    purchasePlace: '',
    insurancePrice: '',
    currencyInsurance: '',
    glass: '',
    heightFrame: '',
    widthFrame: '',
    depthFrame: ''
  });

  public formCopy = this._fb.group({
    id: '',
    place: '',
    namePlace: '',
    priceCop: '',
    currencyCop: '',
    widthMot: '',
    heightMot: ''
  });

  public formLocations = this._fb.group({
    id: '',
    placeLoc: '',
    namePlaceLoc: ''
  });

  public literatureAdd = this._fb.group({
    nameLiterature: '',
    literatureId: '',
    findedIsbn: '',
    isbnNumber: '',
    title: '',
    author: '',
    publisher: '',
    year: '',
    page: '',
    illustration: ''
  });

  public addEditions = this._fb.group({
    allEditions: this._fb.array([]),
    units: '',
    heightArt: '',
    widthArt: '',
    priceCop: '',
    currencyCop: '',
    heightMot: '',
    widthMot: '',
    depth: '',
    totalNumber: '',
    proof: '',
    copyNumber: ''
  });

  constructor(
    private _commonService: CommonService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _dialogService: NbDialogService,
    private _artworkService: ArtworkService,
    private _router: Router,
    private _artStorageService: ArtStorageService,
    private _storage: StorageService,
    private _titleService: Title,
    private _profileService: ProfileService
  ) {

    this.tabs = [
      {title: 'Basic info'},
      {title: 'Status'},
      {title: 'Files'},
      // { title: 'Literature'}, // TODO Temp hidden!!!!
      // { title: 'Exhibition'}  // TODO Temp hidden!!!!
    ];

    // gallery configuration // TODO
    this.galConf = {
      imageOffset: '0px',
      showDeleteControl: false,
      showImageTitle: false,
    };
  }

  ngOnInit() {
    this.checkOffset();
    this.profileId = this._storage.get('profile') ? this._storage.get('profile').id : '';
    this.getProfile(this.profileId);
    this._titleService.setTitle( 'Locarto - Artwork adding' );
    this._commonService.setHeaderTitle({nav: 'Artwork title', backUrl: '/pages/artworks/all'});
    this._sub = this._route.params.subscribe(params => {
      this.currentId = params['id'];
      this.getCategories();
      this.getArtStorages(this.currentId);
    });

    this._commonService.uploadedLineChange.subscribe((value: any) => { // TODO
      if (this.filesInProgress) {
        if (value && value.length < 1) {
          setTimeout(() => {
            this.filesInProgress = false;
          }, 1000);
        }
      }
    });
  }

  getProfile(id) {
    this._profileService.getProfileById(id).subscribe(res => {
      this.profileData = res.profile;
    });
  }

  getArtStorages(id) {
    this._artStorageService.getProfileStorages(this.profileId).subscribe(res => {
      this.artStorages = res.artstorages;
    }, error => {
      console.error(error);
    });
  }

  getCategories() {
    this._artworkService.getCategories().subscribe(res => {
      this.categories = res.categories;
      this.getArtworkData(this.currentId);
    }, error => {
      console.error('error', error);
    });
  }

  getArtworkData(currentId, fromMain?) {
    this._artworkService.getArtwork(currentId).subscribe(res => {
      if (res && res.artwork) {
        this.artworkData = res.artwork;
      }

      if (!this.artworkData) this._router.navigate(['/pages/artworks/all']);

      if (res && res.artwork) {
        this._commonService.setHeaderTitle({nav: res.artwork.title, backUrl: '/pages/artworks/all'});
        this.setFormArtwork(res.artwork);
        this.setCategory(res.artwork.category);

        // set base states of checkboxes
        if (this.artworkData.glass) this.collectorFields.glass = true;
        if (this.artworkData.sizes && this.artworkData.sizes.frame) this.collectorFields.frame = true;
      }

      if (this.artworkData.files) {

        this.artworkData.files.map((fileId, i) => {
          let last: boolean;
          if (i === this.artworkData.files.length - 1) last = true;
          this.generateFilesArr(fileId, last);
        });

      } else {
        this.artworkData.image = '';
      }

      // prepare data for setting it
      if (this.artworkData.copies) {
        this.generateEditions(this.artworkData.copies);
      }

      this.artworkData.books.map(book => {
        this.generateBooksArr(book);
      });

      if (this.artworkData.location && Object.keys(this.artworkData.location).length > 0) {
        this.setLocationsData(this.artworkData);
      }

      this.setFormValue(this.artworkData.sizes.units, 'measurement');
      this.options.map(opt => {
        opt.checked = (opt.value === this.artworkData.sizes.units);
      });

      setTimeout(() => { // TODO
        this.canMoves = true;
      }, 500);
    });
  }

  setLocationsData(data) {
    // location: {artstorage: "5c8fa35b29a547068a4ee555"}
    let curLocationType: any;
    let curLocation: any;

    this.places.map(place => {
      if (data.location && place.id === data.location.toLowerCase()) {
        console.log('place.id ', place.id);
        this.setFormValueLoc(place.id, 'placeLoc');
      }
    });

    if (data && data.location) {
      this.artStorages.map(stor => {
        if (stor._id === data.location.artstorage) {
          this.setFormValueLoc(stor.title + ' - ' + stor.address, 'namePlaceLoc');
        } else {
          this.setFormValueLoc(data.location[Object.keys(data.location)[0]], 'namePlaceLoc');
        }
      });

      if (data.location.artstorage) {
        this.setFormValueLoc(data.location.artstorage, 'id');
      }
    }
  }

  getFormValue(nameProp) {
    return this.formArtwork.get(nameProp).value;
  }

  getLiteratureValue(nameProp) {
    return this.literatureAdd.get(nameProp);
  }

  getArrForms(nameArr) { // TODO
    return this.formArtwork.get(nameArr) as FormArray;
  }

  generateEditions(editions, fromUpdate?) {
    // sorting by keys
    // this.editionsData = this.sortEditions(editions);
    // if (fromUpdate) this.editionsData.reverse();
    this.editionsData = editions;

    if (this.editionsData && this.editionsData.length) {
      this.editionsData.map(copy => {
        let parseData = {location: {}};
        if (copy.location) {
          Object.keys(copy.location).map(key => {
            if (copy.location[key] !== null && copy.location[key] !== false) {
              copy.locationStatus = key;
              if (key !== 'notCreated') {
                // copy.locationPlace = key;
                // copy.locationPlaceName = copy.location[key];
                parseData.location[key] = copy.location[key];
              }
            }
          });
        }

        copy.locationPlace = this.parseObj(parseData, 'location', 'key') || '';
        copy.locationPlaceName = this.parseObj(parseData, 'location', 'val') || '';
      });
    }
  }

  sortEditions(editions, fromUpdate?) {
    if (editions) {
      return editions.sort((a, b) => {
        return this.compareEditions(a, b, fromUpdate);
      });
    }
  }

  compareEditions(firstObj, secondObj, fromUpdate?) {
    if (firstObj.proof === secondObj.proof &&
      firstObj.sizes && firstObj.sizes.artwork && firstObj.sizes.artwork[0] === secondObj.sizes.artwork[0] &&
      firstObj.sizes.artwork[1] === secondObj.sizes.artwork[1] &&
      firstObj.price.value === secondObj.price.value) {
      return fromUpdate ? -1 : 1;
    } else {
      return fromUpdate ? 1 : -1;
    }
  }

  parseObj(obj, prop, type: string) {
    if (obj[prop]) {
      if (type === 'key') {
        return Object.keys(obj[prop])[0];
      } else if (type === 'val') {
        if (prop === 'location') {
          let res;
          if (this.artStorages && this.artStorages.length > 0) {
            this.artStorages.map(stor => {
              if (stor._id === obj[prop][Object.keys(obj[prop])[0]]) {
                // res = stor.title + ' - ' + stor.address;  OLD version
                res = stor.title;
              }
            });
          }
          return res || '';
        } else {
          return obj[prop][Object.keys(obj[prop])[0]];
        }
      }
    } else {
      return '';
    }
  }

  setFormValue(value, nameProp, index?) { // TODO
    if (index === undefined) {
      // set fields
      const tempObj = {};
      tempObj[nameProp] = value;
      this.formArtwork.patchValue(tempObj);
    } else {
      const arr = this.getArrForms('fields');
      arr.controls[index].patchValue({selected: value});
    }
  }

  setFormValueLoc(value, nameProp) { // TODO
    const tempObj = {};
    tempObj[nameProp] = value;
    this.formLocations.patchValue(tempObj);
  }

  setFormCopyValue(value, nameProp) {
    const tempObj = {};

    tempObj[nameProp] = value;
    // reset value for Not Created case
    if (nameProp === 'place') {
      tempObj['namePlace'] = '';
    }

    this.formCopy.patchValue(tempObj);
  }

  setActiveTab(index) {
    this.activeTab = index;
  }

  setFormArtwork(data) {
    const obj: any = {
      id: data._id,
      title: data.title,
      category: data.category,
      signature: data.signature,
      dateCreation: this.setDateCreate(data.createDate),
      notes: data.notes,
      tags: data.tags,
      priceLoc: (data.price ? data.price.value : ''),
      currencyLoc: (data.price ? data.price.currency : ''),
      height: (data.sizes && data.sizes.artwork ? data.sizes.artwork[0] : ''),
      width: (data.sizes && data.sizes.artwork ? data.sizes.artwork[1] : ''),
      depth: (data.sizes && data.sizes.artwork ? data.sizes.artwork[2] : ''),
      measurement: data.units,
      artistName: data.artist,
      acquired: data.acquired,
      pricePaid: (data.price_paid ? data.price_paid.value : ''),
      currencyPaid: (data.price_paid ? data.price_paid.currency : ''),
      purchasePlace: data.purchase_location,
      insurancePrice: (data.insurance ? data.insurance.value : ''),
      currencyInsurance: (data.insurance ? data.insurance.currency : ''),
      glass: data.glass,
      heightFrame: (data.sizes && data.sizes.frame ? data.sizes.frame[0] : ''),
      widthFrame: (data.sizes && data.sizes.frame ? data.sizes.frame[1] : ''),
      depthFrame: (data.sizes && data.sizes.frame ? data.sizes.frame[2] : '')
    };

    this.setFormLocations(data);

    this.tagsArr = data.tags;
    this.formArtwork.patchValue(obj);
  }

  setFormLocations(data) {
    let obj = {
      id: data._id,
      placeLoc: '',
      namePlaceLoc: ''
    };
    if (data.location && typeof data.location === 'object') {
      let parseData = {location: {}};
      Object.keys(data.location).map(key => {
        if (data.location[key] !== null && data.location[key] !== false) {
          // obj.placeLoc = key;
          // obj.namePlaceLoc = data.location[key];
          parseData.location[key] = data.location[key];
        }
      });

      obj.placeLoc = this.parseObj(parseData, 'location', 'key') || '';
      obj.namePlaceLoc = this.parseObj(parseData, 'location', 'val') || '';
    } else if (data.location && typeof data.location[0] === 'string') {
      obj.placeLoc = '';
      obj.namePlaceLoc = '';
    }
    this.formLocations.patchValue(obj);
  }

  setFormCopy(data) {
    let idLoc: string;
    if (data && data['location']) {
      Object.keys(data.location).map(key => {
        if (data.location[key] !== null && data.location[key] !== false) {
          idLoc = data.location[key];
        }
      });
    }
    const obj: any = {
      id: idLoc || '',
      place:  '',
      namePlace: '',
      priceCop: data.price.value || '',
      currencyCop: data.price.currency || '',
      widthMot: data.sizes.motif[0] || '',
      heightMot: data.sizes.motif[1] || ''
    };

    if (data.location && typeof data.location === 'object') {
      let parseData = {location: {}};
      Object.keys(data.location).map(key => {
        if (data.location[key] !== null && data.location[key] !== false) {
          obj.place = key;
          // obj.namePlace = data.location[key];
          parseData.location[key] = data.location[key];
        }
      });

      // obj.place = Object.keys(data.location)[0];
      obj.namePlace = this.parseObj(parseData, 'location', 'val') || '';
    } else if (data.location && typeof data.location[0] === 'string') {
      obj.place = '';
      obj.namePlace = '';
    }
    this.formCopy.patchValue(obj);
  }

  setCopyPlace(obj) {
    if (obj) {
      let res;
      const name = this.parseObj(obj, 'location', 'key');
      this.places.map(place => {
        if (place.title.includes(name)) res = place.id;
      });
      return res;
    }
  }

  setDateCreate(val) {
    if (val) {
      const date: any = new Date(val);
      // const dateStr = date.split('T')[0];
      // let dateArr = dateStr.split('-');
      // dateArr = dateArr.reverse();
      const month = date.getMonth();
      const day = date.getDate();
      if ((month.toString() === '01' || month.toString() === '1' || month.toString() === '0') &&
          (day.toString() === '01' || day.toString() === '1')) {
        this.changeTypeDate({target: {checked: false}});
      } else {
        this.changeTypeDate({target: {checked: true}});
      }

      return new Date(val);
    }
  }

  setCategory(id) {
    this.categories.map(category => {
      if (category.id === id) {
        this.selectedCat = category;
        if (category.id === "CATEGORY_PHOTOGRAPHY_a2a5c33eda9046576764de2400b1aa50") this.photography = true;
        this.addFields(category.fields);
        if (this.selectedCat.copies) {
          this.tabs[1].title = 'Editions';
        }
      }
    });
  }

  addFields(fields) {
    this.formArtwork.setControl('fields',  this._fb.array([]));
    const baseField = fields.filter(field => field.base)[0];
    let subcategory;

    let options =
    fields.map(item => {

      Object.keys(this.artworkData.options).map(key => {
        if (key === item.id) {
          if (typeof this.artworkData.options[key] !== 'string') {
            let tempArr = [];
            Object.keys(this.artworkData.options[key]).map(v => {
              tempArr.push(this.artworkData.options[key][v]);
            });
            item['selected'] = this._fb.array(tempArr);
          } else {
            item['selected'] = this.artworkData.options[key];
          }
        }
      });

      if (item.values) {
        item.selected = item.selected || '';
        item.options = this._fb.array([]);
        item.values.map(val => {
          item.options.push(this._fb.control(val));
        });
      }

      if (item.base) {
        item.values.map(valItem => {
          if (valItem.id === item.selected) {
            item.baseTitle = valItem.title;
            subcategory = valItem.id;
          }
        });
      } else {
        if (item['options']) {
          item['options'].value.map((opt, index) => {
            if (opt.deps) {
              // check options needed
              const finded = opt.deps.filter(item => item === baseField.id + '.' + subcategory);
              // to show option in select
              opt.show = finded && finded.length > 0;
              // to show field in view
              if (finded && finded.length > 0) {
                item.showEl = true;
              }
            } else {
              // to show option in select
              opt.show = true;
              // to show field in view
              item.showEl = true;
            }
          });
        }
      }

      this.getArrForms('fields').push(this._fb.group(item));
    });
  }

  actionTag(type, val) { // TODO
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

  deleteSet(copy, ref) {
    const sendEditions = this.editionsData.filter(a => {
      return this.compareEditions(a, copy) < 0;
    });

    this.editCopy('', ref, sendEditions);
  }

  openModal(copy, modal: string, type, index) {
    if (copy) {
      this.currentCopy = copy;
      this.currentCopy.index = index;
    }

    if (type === 'delete') {
      this.generateSetEditions(copy);
    } else if (type === 'edit') {
      this.setFormCopy(copy);
    } else if (type === 'removeBook') {
      this.currentDelete = {
        type: 'book',
        title: 'book',
        index: index,
        question: 'Do you really want remove this book?'
      }
    } else if (type === 'removeFile') {
      this.currentDelete = {
        type: 'file',
        title: 'current file',
        index: index,
        question: 'Do you really want remove this file?'
      }
    }

    this._dialogService.open(this[modal]);
  }

  generateSetEditions(copy) {
    this.setEditions = this.editionsData.filter(a => {
      return this.compareEditions(a, copy) > 0;
    });
  }

  sendData(form) {
    this.showSnipper = true;
    const formValue = form.value;
    const locObj = {};

    if (formValue.placeLoc && formValue.namePlaceLoc) {
      locObj[formValue.placeLoc] = formValue.namePlaceLoc;
    }

    const dataToSend = {
      id: formValue.id,
      title: formValue.title,
      notes: formValue.notes,
      category: formValue.category,
      signature: parseInt(formValue.signature, 10),
      options: this.organizeOptions(formValue.fields),
      tags: formValue.tags,
      price: {
        value: formValue.priceLoc,
        currency: formValue.currencyLoc
      },
      sizes: {
        artwork: [formValue.width, formValue.height],
        units: formValue.measurement,
        frame: [formValue.widthFrame, formValue.heightFrame, formValue.depthFrame]
      },
      creationDate: this._commonService.organizeDate(formValue.dateCreation),
      artist: formValue.artistName,
      acquired: formValue.acquired,
      price_paid: {
        value: formValue.pricePaid,
        currency: formValue.currencyPaid
      },
      purchase_location: formValue.purchasePlace,
      insurance: {
        value: formValue.insurancePrice,
        currency: formValue.currencyInsurance
      },
      glass: formValue.glass
    };

    this._artworkService.updateArtwork(dataToSend).subscribe(res => {
      this._router.navigate(['/pages/artworks/all']);
      this.showSnipper = false;
    }, error => {
      console.error(error);
      this.showSnipper = false;
    });
  }

  sendDataLoc(form) {
    this.showSnipper = true;
    const formValue = form.value;

    const locObj = {};
    if (formValue.placeLoc && (formValue.placeLoc === 'notCreated' || formValue.namePlaceLoc)) {
      if (formValue.placeLoc === 'notCreated') {
        locObj[formValue.placeLoc] = true;
      } else {
        locObj[formValue.placeLoc] = formValue.namePlaceLoc;
      }
    }

    const dataToSend = {
      id: this.currentId,
      location: locObj
    };

    this._artworkService.updateArtwork(dataToSend).subscribe(res => {
      this._router.navigate(['/pages/artworks/all']);
      // this.getArtworkData(this.currentId);
      this.showSnipper = false;
    }, error => {
      console.error(error);
      this.showSnipper = false;
    });
  }

  organizeOptions(fields) {
    const resObj = {};
    fields.map(field => {
      resObj[field.id] = field.selected
    });

    return resObj;
  }

  editCopy(form, ref, editionsToSend, multi?) {
    this.showSnipper = true;
    const formValue = form ? form.value : '';

    const preparedEditions = editionsToSend || this.organizeEditionsUpdate(formValue);
    const dataToSend = {
      id: this.currentId,
      copies: preparedEditions
    };
    this._artworkService.updateArtwork(dataToSend).subscribe(res => {
      this.generateEditions(res.artwork.copies, true);
      if (ref) ref.close();
      this.showSnipper = false;
      this.typeStep = 'set';
    }, error => {
      console.error(error);
      this.showSnipper = false;
    });
  }

  organizeEditionsUpdate(copy, multi?) {
    let index;
    const locObj = {};

    if (this.currentCopy && this.currentCopy.index !== undefined ) {
      index = this.currentCopy.index;
    }

    if (copy.place && copy.namePlace ||
        copy.placeLoc && copy.namePlaceLoc) {
      if (multi) {
        locObj[copy.placeLoc.id] = copy.namePlaceLoc._id || copy.namePlaceLoc;
      } else {
        locObj[copy.place] = copy.namePlace;
      }
    } else if (copy.placeLoc && copy.placeLoc.id === 'notCreated') {
      locObj[copy.placeLoc.id] = true;
    } else if (copy.place === 'notCreated') {
      locObj[copy.place] = true;
    }

    if (multi) {
      this.editionsData.map((item, i) => {
        if (item.selectForSet) {
          item.location = locObj;
        }
      })
    } else {
      this.editionsData[index].price.value = copy.priceCop;
      this.editionsData[index].price.currency = copy.currencyCop;
      this.editionsData[index].sizes.motif = [copy.widthMot, copy.heightMot];
      this.editionsData[index].location = locObj;
    }

    return this.editionsData;
  }

  organizeEditionsCreate(editions) {
    if (editions && editions.length > 0) {
      let res = [];

      let tempObj = {};
      editions.map(set => {

        set.map(item => {
          const locObj = {};
          locObj[item.place] = item.namePlace;

          tempObj = {
            price: {
              value: item.price,
              currency: item.currency
            },
            sizes: {
              artwork: [(item.heightArt || item.heightPap), (item.widthArt || item.widthPap), item.depth],
              motif: [item.widthMot, item.heightMot],
              units: (item.units === 'cm' ? 'cm' : (item.units === 'in' ? 'in' : ''))
            },
            proof: item.type === 'proof',
            locations: item.locations
          };

          res.push(tempObj);
        });
      });

      return res;
    }
  }

  setPlaceholder(place) { // TODO
    let res: string;
    switch (place) {
      case 'In storage':
        res = 'Storage name';
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

  getUrlFile(fileId, allData?) {
    return new Promise((resolve, reject) => {
      if (fileId) {
        this._artworkService.getFile(fileId).subscribe(res => {
          if (res.file) {
            if (allData) {
              resolve(res.file);
            } else {
              resolve(res.file.url);
            }
          } else {
            resolve();
          }
        }, error => {
          reject(error);
        });
      }
    });
  }

  generateFilesArr(id, last?) {
    if (id) {

      this.tempArr = [];

      this.getUrlFile(id, true).then(res => {
        this.tempArr.push(res);
        // this.filesData.push(res);
        this.galleryLinks(res);
        if (last) {
          setTimeout(() => {
            this.tempArr = this.reverseArray(this.tempArr);

            // set main image in files part
            if (this.tempArr && this.tempArr.length > 0) {
              this.filesData = [];
              this.setRotation(this.tempArr).then((tempArr: any) => {
                setTimeout(() => {
                  this.mainFiles = tempArr.shift();
                  this.filesData = tempArr;

                  this.artworkData.image = this.mainFiles.url;
                  this.artworkData.rotation = this.mainFiles.rotation;
                  this.artworkData.unrotation = this.mainFiles.unrotation;

                  this.filesUrl = this.reverseArray(this.filesUrl, 'url');
                  this.filesUrl.unshift({url: this.mainFiles.url});
                }, 250);

              });
            }


          }, 250)

        }
      });
    }
  }

  setRotation(tempArr) { // TODO
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

  reverseArray(arr, type?) {
    const newArray = [];
    if (type === 'url') {
      this.filesData.map(orFile => {
        const filtered = arr.filter(file => orFile.url === file.url)[0];
        if (filtered) newArray.push(filtered);
      });
    } else {
      this.artworkData.files.map(orFile => {
        const filtered = arr.filter(file => orFile === file._id)[0];
        if (filtered) newArray.push(filtered);
      });
    }
    return newArray;
  }

  galleryLinks(file) {
    const obj = {
      url: file.url
    };
    if (this.filesUrl) {
      this.filesUrl.push(obj);
    } else {
      this.filesUrl = [obj];
    }
  }

  generateBooksArr(data) {
    if (data) {
      this.booksData = [];
      this._artworkService.getBookById(data.book).subscribe(res => {
        this.booksData.push(res);
      });
    }
  }

  photoChange(event, type?) {
    // const filesData = this.filesData;
    this.filesInProgress = true;
    let uploadedFiles: any;
    this._commonService.photoChange(event, (res) => {
      uploadedFiles = res;
      const tempFiles = Array.from(this.filesData);

      if (uploadedFiles) {
        Object.keys(uploadedFiles).map(key => {
          tempFiles.push(uploadedFiles[key]);
        });

        this.setRotation(tempFiles).then((tempArr: any) => {
          setTimeout(() => {
            this.filesData = tempArr;
            let filesToSend = Array.from(this.filesData);

            this.filesUpload(filesToSend).then((res: any) => {
              if (type === 'avatar') {
                this.tempAvatar = res[res.length - 1];
                if (this.tempAvatar.tempUrl) {
                  this._commonService.autoRotation(this.tempAvatar.tempUrl).subscribe(rotate => {
                    this.tempAvatar.rotation = rotate;
                    if (rotate && rotate.length > 0) {
                      const ind = rotate.match(/\(/).index;
                      const newRes = rotate.substring(0);
                      this.tempAvatar.unrotation = newRes.slice(0, ind) + newRes[ind] + '-' + newRes.slice(ind + 1);
                    } else {
                      this.tempAvatar.rotation = '';
                      this.tempAvatar.unrotation = '';
                    }
                  });
                }
                this.setMainFile(this.tempAvatar._id, res.length - 1);
              } else {
                this.updateFiles(res);
              }
            });
          }, 250);
        });

      }
    });
  }

  filesUpload(files) { // TODO
    // set status 'in progress'
    this.filesInProgress = true;
    // copy object files
    const tempFiles = Array.from(files);
    // add main file of artwork to send
    // if (this.mainFiles && tempFiles.length > 1) tempFiles.unshift(this.mainFiles);

    return new Promise((resolve, reject) => {
      const arrNew = tempFiles.filter(file => !file['_id']);
      let countNew = arrNew.length;
      tempFiles.map((file, index) => {
        if (!file['_id']) {
          const formData = new FormData();
          let toSend;
          if (file['file']) {
            toSend = file['file'];
          } else {
            toSend = file;
          }
          formData.append('file', toSend);
          this._artworkService.pushFile(formData).subscribe(res => {
            file['_id'] = res.json()['tempfile']._id;
            countNew--;
            if (countNew === 0) resolve(tempFiles);
          }, error => {
            reject(error);
          });
        }
      });

    });
  }

  updateFiles(files, fromMain?) {
    const dataToSend = {
      id: this.currentId,
      files: this.organizeFiles(files, fromMain)
    };
    this._artworkService.updateArtwork(dataToSend).subscribe(res => {
      this.showSnipper = false;
      this.getArtworkData(this.currentId);
      this.filesInProgress = false;
    }, error => {
      console.error(error);
      this.showSnipper = false;
      this.filesInProgress = false;
    });
  }

  organizeFiles(files, fromMain?) {
    let res = [];

    files.map(file => {
      if (file['_id']) res.push(file['_id']);
    });

    if (this.mainFiles !== undefined) {
      res.unshift(this.mainFiles._id);
      // set on the first position main file
      if (fromMain) res.unshift(res.splice((res.length - 1), 1)[0]);
    }

    return res;
  }

  setMainFile(id, index) { // TODO
    this.firstFileId = index;

    this.filesData.map((item, i) => {
      if (item._id === id) this.firstFileId = i;
    });
    this.updateFiles(this.filesData, true);
  }

  findBook(number) {
    this._artworkService.getBookIsbn(number).subscribe(res => {
      this.findedBook = res.book;
    }, error => {
      console.error(error);
    })
  }

  bookAction(type, index) {
    if (type === 'yes') {
      this.setLiterature(index, this.findedBook);
      this.findedBook.selected = true;
    } else {
      this.findedBook = '';
    }
  }

  setLiterature(index, data: any) {
    this.literatureAdd.patchValue({findedIsbn: data['isbn']});
  }

  selectedExisting(type, value) {
    if (type === 'exhibition') {
      this.getArrForms('exhibitions').controls[0].patchValue({
        existingId: value.existingId,
        title: value.title,
        museum: value.museum,
        country: value.country,
        city: value.city
      });
    } else if (type === 'literature') {
      const obj: any = {
        existingId: value.existingId,
        isbnNumber: value.isbn,
        title: value.title,
        publisher: value.publisher,
        year: value.year,
        author: value.authors
      };

      this.literatureAdd.patchValue({obj});
    }
  }

  findExisting(resName, value, type) {
    this[resName] = Object.assign([], this[type]).filter(
      item => (item && item.name) ? item.name.toLowerCase().indexOf(value.toLowerCase()) > -1 : []
    );
  }

  validationIsbn(value, index) {
    const ALLOWEDCHARS = /^[ -]*$/;
    const ISBN10WEIGHTS = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    const ISBN13WEIGHTS = [1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1];
    const litArr = this.getArrForms('literature');

    let str = value.replace(/\d/g, '');

    if (!ALLOWEDCHARS.test(str)) {
      this.literatureAdd.get('isbnNumber').setErrors({not_number: true});
      return undefined;
    }

    let isbn = value.replace(/\D/g, '');
    if ((isbn && isbn.length === 10 && this.checksum(isbn.split(''), ISBN10WEIGHTS) % 11 === 0) ||
      (isbn && isbn.length === 13 && this.checksum(isbn.split(''), ISBN13WEIGHTS) % 10 === 0)) {
      this.literatureAdd.get('isbnNumber').setErrors(null);
      return value;
    } else {
      this.literatureAdd.get('isbnNumber').setErrors({not_number: true});
      return undefined;
    }
  }

  checksum (arr, weights){
    return arr.reduce(function(a, x, i){
      a.push([Number(x), weights[i]]);
      return a;
    }, []).reduce(function(sum, a){
      return sum + a[0] * a[1];
    }, 0);
  };

  addLiterature(form, ref) {
    const dataToSend = {
      id: this.currentId,
      books: this.organizeBooks(form.value)
    };

    this._artworkService.updateArtwork(dataToSend).subscribe(res => {
      this.showSnipper = false;
      res.artwork.books.map(book => {
        this.generateBooksArr(book);
      });
      ref.close();
    }, error => {
      console.error(error);
      this.showSnipper = false;
      ref.close();
    });
  }

  organizeBooks(book) {
    const resArr = [];
    const obj = {
      book: {
        title: book.title,
        _id: book.existingId,
        isbn: book.findedIsbn,
        author: book.author,
        publisher: book.publisher,
        year: book.year
      },
      page: book.page,
      picture: book.illustration
    };
    this.booksData.push(obj);
    return this.booksData;
  }

  setClassName(name) { // TODO
    let res: string;
    if (name) {
      const nameArr = name.split('.');
      this.types.map(type => {
        if (nameArr[nameArr.length - 1].toLocaleLowerCase().includes(type)) {
          res = type;
        }
      });
    }
    return res || '';
  }

  removeBook(ref, current) {
    this.booksData.splice(current.index, 1);
    let booksToSend = this.booksData;

    if (booksToSend && booksToSend.length < 1) booksToSend = null;

    const dataToSend = {
      id: this.currentId,
      books: booksToSend
    };

    this._artworkService.updateArtwork(dataToSend).subscribe(res => {
      this.showSnipper = false;
      res.artwork.books.map(book => {
        this.generateBooksArr(book);
      });
      ref.close();
    }, error => {
      console.error(error);
      this.showSnipper = false;
      ref.close();
    });
  }

  removeFile(ref, current) {
    this.filesData.splice(current.index, 1);
    let filesToSend = this.filesData;

    // if (filesToSend && filesToSend.length < 1) filesToSend = null;
    //
    // let filesIds = [];
    // if (filesToSend && filesToSend.length > 0) {
    //   filesToSend.map(file => filesIds.push(file._id));
    // } else {
    //   filesIds = null;
    // }

    const dataToSend = {
      id: this.currentId,
      files: this.organizeFiles(filesToSend) // filesIds
    };

    this._artworkService.updateArtwork(dataToSend).subscribe(res => {
      this.showSnipper = false;
      let last: boolean;
      res.artwork.files.map((file, i) => {
        if (i === res.artwork.files.length - 1) last = true;
        this.generateFilesArr(file, last);
      });
      ref.close();
    }, error => {
      console.error(error);
      this.showSnipper = false;
      ref.close();
    });
  }

  deleteAction(type, ref, current?) {
    switch (type) {
      case 'book':
        this.removeBook(ref, current);
        break;
      case 'file':
        this.removeFile(ref, current);
        break;
    }
  }

  setNewEditions(event, i) {
    const val = event.target.checked;
    if (i === 'all') {
      this.editionsData.map(copy => {
        copy['selectForSet'] = val;
      });
    } else {
      this.editionsData[i]['selectForSet'] = val;
    }
  }

  setNext(type) {
    if (type === 'done') {
      this.editionsData.map(copy => copy.selectForSet ? copy.selectForSet = false : '');
      this.typeStep = type;
    } else {
      this.changeEditions();
      this.showSteps = false;
    }
  }

  changeEditions() {
    const editionsToSend = this.organizeEditionsUpdate(this.formLocations.value, true);

    this.editCopy('', '', editionsToSend, true);
  }

  // openGallery(index: number = 0) {
  //   this.ngxImageGallery.open(index);
  // }

  dropped(event: UploadEvent) {
    if (this.filesData && this.filesData.length > 0) {
      this.filesData = this.filesData.concat(event.files);
    } else {
      this.filesData = event.files;
    }

    this.filesData.map((droppedFile, index) => {
      // Is it a file?
      if (droppedFile && droppedFile.fileEntry && droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          const fileTarget = new File([file], file.name);

          // Here you can access the real file
          this.filesData[index]['size'] = (file.size / 1000000).toFixed(2);
          this.filesData[index]['name'] = file.name;
          this.filesData[index]['file'] = file;

          const reader = new FileReader();
          reader.onload = (event: ProgressEvent) => {
            this.filesData[index]['tempUrl'] = (<FileReader>event.target).result;
            this.filesData[index]['tempUrl'] = this.encodingURI(this.filesData[index]['tempUrl']);

            this._commonService.autoRotation(this.filesData[index]['tempUrl']).subscribe(rotate => {
              this.filesData[index].rotation = rotate;
              if (rotate && rotate.length > 0) {
                const ind = rotate.match(/\(/).index;
                const newRes = rotate.substring(0);
                this.filesData[index].unrotation = newRes.slice(0, ind) + newRes[ind] + '-' + newRes.slice(ind + 1);
              } else {
                this.filesData[index].rotation = '';
                this.filesData[index].unrotation = '';
              }
            });
          };

          const arrName = file.name.split('.');
          this.types.map(type => {
            if (arrName[arrName.length - 1].toLocaleLowerCase().includes(type)) {
              this.filesData[index]['type'] = type;
            }
          });

          reader.readAsDataURL(fileTarget);
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
      }
    });

    setTimeout(() => {
      this.filesUpload(this.filesData).then(res => {
        this.updateFiles(res);
      });
    }, 200);
  }

  encodingURI(url) {
    return encodeURI(url);
  }

  fileOver(event) {
    if (!this.overZone) this.overZone = true;
  }

  fileLeave(event) {
    if (this.overZone) this.overZone = false;
  }

  movedFiles(event) { // TODO
    this.canMoves = false;
    let droppedId: any;
    let oldIndex: number;

    Object.keys(event.el.attributes).map(key => {
      if (event.el.attributes[key].name === 'data-item') {
        droppedId = event.el.attributes[key].value;
      }
    });
    this.filesData.map((item, i) => {
      if (item._id === droppedId) oldIndex = i;
    });

    if (event.dropIndex !== oldIndex) {
      this.moveEl(this.filesData, oldIndex, event.dropIndex);

      this.updateFiles(this.filesData);
    } else {
      setTimeout(() => {
        this.canMoves = true;
      }, 500);
    }
  }

  moveEl(arr, oldIndex, newIndex) { // TODO
    if (newIndex >= arr.length) {
      let k = newIndex - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    return arr;
  };

  changeTypeDate(event) { // TODO
    this.fullDateCreation = event.target.checked;
    this.formArtwork.patchValue({dateCreation: ''});
    if (!this.fullDateCreation) this.changeYear = !this.changeYear;
  }

  selectDate(datepicker, value) { // TODO
    this.formArtwork.patchValue({dateCreation: value});
    if (!this.fullDateCreation) datepicker.close();
    this.changeYear = !this.changeYear;
  }

  selectDateYear(datepicker, value, i) {
    this.getArrForms('literature').controls[i].patchValue({year: value});
    datepicker.close();
    this.changeYearLit = !this.changeYearLit;
  }

  generateArray(number) {
    return Array(number).fill('').map((x, i)=>i);
  }

  addSetEditions(form, ref) {
    const editionsToSend = [...this.editionsData];
    const prepared = this.organizeEditionsCreate(form.value.allEditions);

    prepared.map(newCop => {
      editionsToSend.push(newCop);
    });
    this.editCopy('', ref, editionsToSend, true);
  }

  @HostListener('window:scroll', ['$event']) doSomething(event) { // TODO
    this.checkOffset();
  }

  checkOffset() { // TODO
    let footerEl = document.getElementsByTagName('ngx-footer');
    let buttonHeight = 55;
    let windowHeight = document.body.scrollHeight;
    let pageHeight = window.innerHeight;
    let scroll = window.pageYOffset;

    if ((windowHeight - pageHeight - buttonHeight) <= scroll) {
      this.bottomOfPage = true;
    } else if (this.bottomOfPage) {
      this.bottomOfPage = false;
    }
  }

  ngOnDestroy() {
    this._sub.unsubscribe();
    this._commonService.setHeaderTitle('');
  }

  newFields(el, type) { // TODO
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
