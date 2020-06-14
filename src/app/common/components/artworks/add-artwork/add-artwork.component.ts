import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonService } from '../../../../services/common.service';
import { FormArray, FormBuilder, NgForm } from '@angular/forms';
import { FileSystemDirectoryEntry, FileSystemFileEntry, UploadEvent, UploadFile } from 'ngx-file-drop';
import { NbDialogService } from '@nebular/theme';
import { ArtworkService } from '../../../../services/artwork.service';
import { ArtStorageService } from '../../../../services/art-storage.service';
import { StorageService } from '../../../../services/storage.service';
import { Router } from '@angular/router';
import { ProfileService } from '../../../../services/profile.service';
import {ArtStorageModel} from '../../../../models/art-storage.model';
import {CategoryModel} from '../../../../models/category.model';
import {ArtworkModel} from '../../../../models/artwork.model';

@Component({
  selector: 'ngx-artwork',
  templateUrl: './add-artwork.component.html',
  styleUrls: ['./add-artwork.component.scss']
})
export class AddArtworkComponent implements OnInit, OnDestroy {
  public artStorages: ArtStorageModel[];
  public categories;
  public fullDateCreation = false;
  public currentCategory;
  // public currency = ['USD', 'EUR', 'GBP', 'CHF', 'NOK', 'SEK', 'RUB', 'AUD', 'CNY'].map(item => ({title: item, value: item}));
  public dynamicExhibitions: any;
  public dynamicLiterature: any;
  public existingExi: any;
  public existingLit: any;
  public findedBook = [];
  public finalResult: boolean;
  // public files: UploadFile[] = [];
  // public tabs: any;
  // public tagsArr = [];
  public showSnipper: boolean;
  // public places: any;
  public profileId: any;
  public profileData: any;
  // public overZone: boolean;
  public createdArtwork: ArtworkModel;
  public firstFileId: string;
  public activeTab = 1;
  public files = [];

  public todayDate = new Date();
  public changeYear = false;
  public changeYearLit = false;
  public tabs = [
    {title: 'ADDING_ARTWORK.TABS.CATEGORY'},
    {title: 'ADDING_ARTWORK.TABS.BASIC'},
    {title: 'Status'},
    {title: 'Photos'}
  ];
  public formArtwork = this._fb.group({
    title: '',
    category: '',
    subcategory: '',
    fields: this._fb.array([]),
    dateCreation: '',
    height: '',
    width: '',
    depth: '',
    measurement: '',
    notes: '',
    tags: '',

    allEditions: this._fb.array([]),
    proof: '',
    copyNumber: '',
    totalNumber: '',
    cmCop: true,
    inchCop: false,

    widthArt: '',
    heightArt: '',
    widthPap: '',
    heightPap: '',
    widthMot: '',
    heightMot: '',
    units: '',

    placeLoc: '',
    namePlaceLoc: '',
    priceLoc: '',
    currencyLoc: '',

    priceCop: '',
    currencyCop: '',

    priceBas: '',
    currencyBas: '',

    nameExhibition: '',
    exibitionId: '',
    exhibitions: this._fb.array([]),
    nameLiterature: '',
    literatureId: '',
    literature: this._fb.array([]),

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

  // public selectedEditions: any;
  public options  = [
    { value: 'cm', label: 'cm', checked: true },
    { value: 'inch', label: 'Inch', checked: false }
  ];

  constructor(
    public _titleService: Title,
    public _commonService: CommonService,
    public _fb: FormBuilder,
    public _dialogService: NbDialogService,
    public _artworkService: ArtworkService,
    public _artStorageService: ArtStorageService,
    public _storage: StorageService,
    public _router: Router,
    public _profileService: ProfileService
  ) {}

  ngOnInit() {
    this.profileId = this._storage.get('profile') ? this._storage.get('profile').id : '';
    this.getProfile(this.profileId);

    // this.getArtStorages();
    this.addExhibition();
    this.addLiterature();
    this._titleService.setTitle( 'Locarto - Artwork adding' );
    this._commonService.setHeaderTitle({nav: 'Artwork adding', backUrl: '/pages/artworks/all'});
    this.getCategories();
    this.getExisting();

    // this._commonService.uploadedLineChange.subscribe((value: any) => {
    //   if (this.filesInProgress) {
    //     if (value && value.length < 1) {
    //       setTimeout(() => {
    //         this.filesInProgress = false;
    //       }, 1000);
    //     }
    //   }
    // });

    // base values sets
    // this.setFormValue(this.currency[1].value, 'currencyLoc');
    // this.setFormValue('cm', 'measurement');
  }

  // getArtStorages() {
  //   this._artStorageService.profileStorages('get', this.profileId).subscribe(res => {
  //     this.artStorages = res.artstorages;
  //   });
  // }

  getProfile(id) {
    this._profileService.getProfileById(id).subscribe(res => {
      this.profileData = res.profile;
    });
  }

  getExisting() {
    this._artworkService.getExhibitions().subscribe(res => {
      this.existingExi = res;
    }, error => {
      console.error('error', error);
    });

    this._artworkService.getBook().subscribe(res => {
      this.existingLit = res;
    }, error => {
      console.error('error', error);
    });
  }

  getCategories() {
    this._artworkService.getCategories().subscribe(res => {
      this.categories = res.categories;
      this.categories.sort((a, b) => a.title.localeCompare(b.title))
    }, error => {
      console.error('error', error);
    });
  }

  getFormValue(nameProp) {
    return this.formArtwork.get(nameProp).value;
  }

  getArrForms(nameArr) {
    return this.formArtwork.get(nameArr) as FormArray;
  }

  setFormValue(value, nameProp, index?) {
    if (index === undefined) {
      const tempObj = {};
      tempObj[nameProp] = value;
      this.formArtwork.patchValue(tempObj);
    } else {
      const arr = this.getArrForms('fields');
      arr.controls[index].patchValue({selected: value, fieldId: nameProp.id, showEl: false});
    }
  }

  addExhibition() {
    const exhibition = this._fb.group({
      exhibitionId: '',
      title: '',
      museum: '',
      country: '',
      city: ''
    });

    this.getArrForms('exhibitions').push(exhibition);
  }

  addLiterature() {
    const literature = this._fb.group({
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

    this.getArrForms('literature').push(literature);
  }

  deleteFromArr(i, nameArr) {
    this.getArrForms(nameArr).removeAt(i);
  }

  setActiveTab(index, form?: NgForm) {
    if (index > this.activeTab) {
      if (form && form.valid) {
        this.activeTab = index;
      }
    } else {
      this.activeTab = index;
    }

    if (!form) this.activeTab = index;
  }

  setCat(data) {
    this.currentCategory = data;

    if (this.currentCategory && this.currentCategory.copies) {
      this.tabs[2].title = 'Editions';
    } else {
      this.tabs[2].title = 'Status';
    }
  }

  // actionTag(type, val) {
  //   if (type === 'set') {
  //     const valArr = val.split(' ');
  //     valArr.map(item => {
  //       if (item.length > 0) this.tagsArr.push(item);
  //     });
  //     this.tagField = '';
  //   } else if (type === 'remove'){
  //     this.tagsArr.splice(val, 1);
  //   }
  //
  //   this.setFormValue(this.tagsArr, 'tags');
  // }

  // setPlaceholder(place) {
  //   let res: string;
  //   switch (place) {
  //     case 'In storage':
  //       res ='Storage name';
  //       break;
  //     case 'In collection':
  //       res = 'Collector`s name';
  //       break;
  //     case 'In commissions':
  //       res = 'Museum, gallery, etc';
  //       break;
  //     default:
  //       res = 'Place name';
  //       break;
  //   }
  //   return res;
  // }

  setEditions(event, nameVar, nameMeth) {
    if (nameVar === 'ordinary' && event > 50) return;

    // exhibition
    if (nameVar === 'exhibitions' || nameVar === 'literature') {
      this[nameMeth]();
      // this[nameVar].push(this.exhibitionItem);
      return;
    }

    // proofs && ordinary
    if (this.getFormValue(nameVar).length !== event) {
      const arr: any = this.formArtwork.controls[nameVar];
      arr.controls = [];
      let i = 0;
      while (i < event) {
        this[nameMeth]();
        i++;
      }
    }
  }

  // dropped(event: UploadEvent) {
  //   this.filesInProgress = true;
  //
  //   if (this.files && this.files.length > 0) {
  //     this.files = this.files.concat(event.files);
  //   } else {
  //     this.files = event.files;
  //   }
  //
  //   this.files.map((droppedFile, index) => {
  //     // Is it a file?
  //     if (droppedFile && droppedFile.fileEntry && droppedFile.fileEntry.isFile) {
  //       const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
  //       fileEntry.file((file: File) => {
  //         const fileTarget = new File([file], file.name);
  //
  //         // Here you can access the real file
  //         this.files[index]['size'] = (file.size / 1000000).toFixed(2);
  //         this.files[index]['name'] = file.name;
  //         this.files[index]['file'] = file;
  //
  //         const reader = new FileReader();
  //         reader.onload = (event: ProgressEvent) => {
  //           this.files[index]['tempUrl'] = (<FileReader>event.target).result;
  //           this.files[index]['tempUrl'] = this.encodingURI(this.files[index]['tempUrl']);
  //
  //           this._commonService.autoRotation(this.files[index]['tempUrl']).subscribe(rotate => {
  //             this.files[index]['rotation'] = rotate;
  //             if (rotate && rotate.length > 0) {
  //               const ind = rotate.match(/\(/).index;
  //               const newRes = rotate.substring(0);
  //               this.files[index]['unrotation'] = newRes.slice(0, ind) + newRes[ind] + '-' + newRes.slice(ind + 1);
  //             } else {
  //               this.files[index]['rotation'] = '';
  //               this.files[index]['unrotation'] = '';
  //             }
  //           });
  //         };
  //
  //         const arrName = file.name.split('.');
  //         this.types.map(type => {
  //           if (arrName[arrName.length - 1].toLocaleLowerCase().includes(type)) {
  //             this.files[index]['type'] = type;
  //           }
  //         });
  //
  //         reader.readAsDataURL(fileTarget);
  //       });
  //     } else {
  //       // It was a directory (empty directories are added, otherwise only files)
  //       const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
  //     }
  //   });
  //
  //   setTimeout(() => {
  //     this.filesUpload(this.files).then((res: any) => {
  //       this.files = res;
  //
  //       this.filesInProgress = false;
  //     });
  //   }, 200);
  // }

  // encodingURI(url) {
  //   return encodeURI(url);
  // }
  //
  // fileOver(event) {
  //   if (!this.overZone) this.overZone = true;
  // }
  //
  // fileLeave(event) {
  //   if (this.overZone) this.overZone = false;
  // }

  // filesUpload(files) {
  //   // copy object files
  //   const tempFiles = Array.from(files);
  //
  //   return new Promise((resolve, reject) => {
  //     const arrNew = tempFiles.filter(file => !file['_id']);
  //     let countNew = arrNew.length;
  //     tempFiles.map((file, index) => {
  //       if (!file['_id']) {
  //         const formData = new FormData();
  //         let toSend;
  //         if (file['file']) {
  //           toSend = file['file'];
  //         } else {
  //           toSend = file;
  //         }
  //         formData.append('file', toSend);
  //         this._artworkService.fileAction('post', formData).subscribe(res => {
  //           file['_id'] = res.tempfile._id;
  //           countNew--;
  //           if (countNew === 0) resolve(tempFiles);
  //         }, error => {
  //           reject(error);
  //         });
  //       }
  //     });
  //   });
  // }

  // photoChange(event) {
  //   this.filesInProgress = true;
  //   this._commonService.photoChange(event, (res) => {
  //     const uploadedFiles = res;
  //     const tempFiles = Array.from(this.files);
  //
  //     if (uploadedFiles && uploadedFiles['length'] > 0) {
  //       Object.keys(uploadedFiles).map(key => {
  //         if (key !== 'length') {
  //           tempFiles.push(uploadedFiles[key]);
  //         }
  //       });
  //
  //       this.setRotation(tempFiles).then((tempArr: any) => {
  //         setTimeout(() => {
  //           let filesToSend = Array.from(tempArr);
  //
  //           this.filesUpload(filesToSend).then((data: any) => {
  //             this.files = data;
  //             this.filesInProgress = false;
  //           });
  //         }, 250);
  //       });
  //     }
  //   });
  // }
  //
  // setRotation(tempArr) {
  //   return new Promise(resolve => {
  //     let i = 0;
  //     tempArr.map((item) => {
  //       const link = item.tempUrl || item.url;
  //       if (link) {
  //         this._commonService.autoRotation(link).subscribe(rotate => {
  //           item.rotation = rotate;
  //           if (rotate && rotate.length > 0) {
  //             const ind = rotate.match(/\(/).index;
  //             const newRes = rotate.substring(0);
  //             item.unrotation = newRes.slice(0, ind) + newRes[ind] + '-' + newRes.slice(ind + 1);
  //           } else {
  //             // this.resetRotation();
  //           }
  //           i++;
  //           if (tempArr.length - 1 <= i) resolve(tempArr);
  //         });
  //       } else {
  //         i++;
  //       }
  //     });
  //   });
  // }
  //
  // removeFile(index) {
  //   this.files.splice(index, 1);
  // }

  sendForm(form: NgForm) {
    this.showSnipper = true;
    this.finalResult = false;
    const formValue = form.value;

    let locationVal = {};
    if (formValue.placeLoc) {
      locationVal = formValue.placeLoc;
    } else {
      locationVal = 'notChosen';
    }

    const dataToSend = {
      title: formValue.title,
      notes: formValue.notes,
      category: formValue.category,
      // signature: formValue.signature,
      options: this.organizeOptions(formValue.fields),
      // books: this.organizeBooks(formValue.literature), TODO Temp hidden !!
      // exhibitions: this.organizeExhibitions(formValue.exhibitions), TODO Temp hidden !!
      tags: formValue.tags,
      copies: this.organizeEditions(formValue.allEditions),
      price: {
        value: formValue.priceLoc,
        currency: formValue.currencyLoc
      },
      sizes: {
        artwork: [formValue.height, formValue.width, formValue.depth],
        units: formValue.measurement,
        frame: [formValue.widthFrame, formValue.heightFrame, formValue.depthFrame]
      },
      files: this.organizeFiles(),
      location: locationVal,
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

    this._artworkService.createArtwork(dataToSend).subscribe(res => {
      this.createdArtwork = res;
      // this.finalResult = true;
      this.showSnipper = false;
      this._commonService.createdItem = dataToSend.title;
      this._router.navigateByUrl('pages/artworks/all');
    }, error => {
      console.error(error);
      this.showSnipper = false;
    });
  }

  // setMainFile(event) {
  //   if (event.dropIndex === 0) {
  //     Object.keys(event.el.attributes).map(key => {
  //       if (event.el.attributes[key].name === 'data-item') {
  //         this.firstFileId = event.el.attributes[key].value;
  //       }
  //     });
  //   }
  // }

  organizeFiles() {
    let res = [];

    this.files.map(file => {
      if (file['_id']) res.push(file['_id']);
    });

    if (this.firstFileId) {
      let index = res.indexOf(this.firstFileId);
      res.unshift(res.splice(index, 1)[0]);
    }
    return res;
  }

  organizeEditions(editions) {
    if (this.currentCategory.copies) {
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
              units: item.units === 'cm' ? 'cm' : (item.units === 'inch' ? 'in' : '')
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

  organizeOptions(fields) {
    const resObj = {};
    fields.map(field => {
      resObj[field.id] = field.selected
    });
    return resObj;
  }

  organizeBooks(literature) {
    const resArr = [];

    literature.map(book => {
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

      resArr.push(obj);
    });

    return resArr;
  }

  organizeExhibitions(exhibitions) {
    const resArr = [];
    exhibitions.map(exhibition => {
      const obj = {
        _id: exhibition.existingId,
        title: exhibition.title,
        country: exhibition.country,
        city: exhibition.city,
        year: exhibition.year
      };
      resArr.push(obj);
    });

    return resArr;
  }

  openModal(modal: TemplateRef<any>) {
    this._dialogService.open(modal);
  }

  validationIsbn(value, index) {
    const ALLOWEDCHARS = /^[ -]*$/;
    const ISBN10WEIGHTS = [10,9,8,7,6,5,4,3,2,1];
    const ISBN13WEIGHTS = [1,3,1,3,1,3,1,3,1,3,1,3,1];
    const litArr = this.getArrForms('literature');

    let str = value.replace(/\d/g, '');

    if (!ALLOWEDCHARS.test(str)) {
      litArr.controls[index]['controls'].isbnNumber.setErrors({not_number: true});
      return undefined;
    }

    let isbn = value.replace(/\D/g, '');
    if ((isbn && isbn.length === 10 && this.checksum(isbn.split(''), ISBN10WEIGHTS) % 11 === 0) ||
        (isbn && isbn.length === 13 && this.checksum(isbn.split(''), ISBN13WEIGHTS) % 10 === 0)) {
      litArr.controls[index]['controls'].isbnNumber.setErrors(null);
      return value;
    } else {
      litArr.controls[index]['controls'].isbnNumber.setErrors({not_number: true});
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

  findBook(number) {
    this._artworkService.getBookIsbn(number).subscribe(res => {
      this.findedBook.push(res.book);
    }, error => {
      console.error(error);
    })
  }

  bookAction(type, index) {
    if (type === 'yes') {
      this.setLiterature(index, this.findedBook[index]);
      this.findedBook[index].selected = true;
    } else {
      this.findedBook.splice(index, 1);
    }
  }

  setLiterature(index, data) {
    this.getArrForms('literature').controls[index].patchValue({
      findedIsbn: data.isbn
    });
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
      this.getArrForms('literature').controls[0].patchValue({
        existingId: value.existingId,
        isbnNumber: value.isbn,
        title: value.title,
        publisher: value.publisher,
        year: value.year,
        author: value.authors
      });
    }
  }

  findExisting(resName, value, type) {
    this[resName] = Object.assign([], this[type]).filter(
      item => (item && item.name) ? item.name.toLowerCase().indexOf(value.toLowerCase()) > -1 : []
    );
  }
  //
  // setCurrentProfile() {
  //   this._storage.set('profile', {id: this.profileId});
  //   this._router.navigate(['/pages/profile-edit'], {queryParams: {id: this.profileId}});
  // }

  // checkOptions(subcat, fields, deps) {
  //   this.hideOption = false;
  //   if (deps) {
  //     let res = [];
  //     let ids: any;
  //
  //     fields.value.map(field => {
  //       if (field && field.base) {
  //         ids = field.fieldId + '.' + subcat;
  //       }
  //     });
  //
  //     if (deps && deps.length > 0) {
  //       deps.map(dep => {
  //         if (dep === ids) res.push(dep);
  //       });
  //     }
  //
  //     return res.length > 0;
  //   } else {
  //     return true;
  //   }
  // }

  // checkCountOptions(field) {
  //   let res = [];
  //   field.options.map(opt => {
  //     if (!this.checkOptions(this.getFormValue('subcategory'), this.getArrForms('fields'), opt.deps)) res.push(true);
  //   });
  //   return res.length !== field.options.length;
  // }

  // checkButton(hasBase, subcategory, category) {
  //   if (hasBase) {
  //     return (category && subcategory);
  //   } else {
  //     return category;
  //   }
  // }

  // changeTypeDate(event) {
  //   this.fullDateCreation = event.target.checked;
  //   this.formArtwork.patchValue({dateCreation: ''});
  // }

  // selectDate(datepicker, value) {
  //   this.formArtwork.patchValue({dateCreation: value});
  //   if (!this.fullDateCreation) datepicker.close();
  //   this.changeYear = !this.changeYear;
  // }

  selectDateYear(datepicker, value, i) {
    this.getArrForms('literature').controls[i].patchValue({year: value});
    datepicker.close();
    this.changeYearLit = !this.changeYearLit;
  }

  ngOnDestroy() {
    this._commonService.setHeaderTitle('');
  }
}