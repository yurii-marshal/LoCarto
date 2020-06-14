import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ProfileService } from '../../../services/profile.service';
import { FormBuilder, NgForm } from '@angular/forms';
import { StorageService } from '../../../services/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AuthGuardService } from '../../../services/auth-guard.service';
import { MapsAPILoader } from '@agm/core';
import { CommonService } from '../../../services/common.service';
import { AppConfig } from '../../../app.config';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit, OnDestroy {
  @ViewChild('studioAddress') public searchElementRef: ElementRef;

  public profileType: any;
  public profileData: any;
  public curProfileId: any;
  public showSnipper: boolean;
  public showSnipperAvatar: boolean;
  public showSnipperBanner: boolean;
  public selectedYear = [];
  public selectedYearStart = [];
  public selectedYearEnd = [];
  public datesEducation = [];
  public profileFileUrl: any;
  public bannerFileUrl: any;
  public fromInit: boolean;
  public birthDateAll: any;
  public deathDateAll: any;
  public filesInProgress: boolean;
  public serverUrl: string;
  public formData = {
    selectedYearStart: [],
    selectedYearEnd: [],
    selectedYear: [],
    birthDateAll: '',
    deathDateAll: ''
  };
  public avatar = {
    file: '',
    name: '',
    url: '',
    rotation: '',
    unrotation: ''
  };
  public banner = {
    file: '',
    name: '',
    url: '',
    rotation: '',
    unrotation: ''
  };
  public collectorForm = this._fb.group({
    id: '',
    name: '',
    contacts: this._fb.group({
      email: this._fb.group({value: '', hidden: true}),
      phone: this._fb.group({value: '', hidden: true}),
      address: this._fb.group({value: '', hidden: true}),
      company: this._fb.group({value: '', hidden: true})
    })
  });

  private _accountId: boolean;

  constructor(
    private _profileService: ProfileService,
    private _storage: StorageService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _titleService: Title,
    private _authService: AuthGuardService,
    private _mapsAPILoader: MapsAPILoader,
    private _ngZone: NgZone,
    private _commonService: CommonService,
    private _config: AppConfig,
    private _fb: FormBuilder,
    private _toastr: ToastrService
  ) { }

  ngOnInit() {
    // get server url
    this.serverUrl = this._config.Server_API;
    this._accountId = this._storage.get('token');
    this.fromInit = true;
    // set meta tag and header title
    this._titleService.setTitle('Locarto - Artist Profile');
    this._commonService.setHeaderTitle({nav: 'Edit profile'});

    this._commonService.uploadedLineChange.subscribe((value: any) => {
      if (this.filesInProgress) {
        if (value && value.length < 1) {
          setTimeout(() => {
            this.filesInProgress = false;
          }, 1000);
        }
      }
    });

    if (this._route.queryParams['value'].id) {
      this.curProfileId = this._route.queryParams['value'].id;
      this.getData(this.curProfileId);
    } else {
      this._profileService.getProfiles(this._storage.get('token')).subscribe(res => {
        const curPro = this.getCurrentProfile(res.profiles);
        this._router.navigate(['/pages/profile-edit-profile'], { queryParams: { id: curPro._id } });
      });
    }

    this._route.queryParams.subscribe( queryParams => {
      if (queryParams.id && !this.fromInit) {
        this.curProfileId = this._route.queryParams['value'].id;
        Object.keys(this.banner).map(key => this.banner[key] = '');
        Object.keys(this.avatar).map(key => this.avatar[key] = '');
        this.getData(this.curProfileId);
      }
    });
    this.fromInit = false;
    setTimeout(() => {
      if (this._commonService.previousRouteUrl.startsWith('/pages/profile-adding')) {
        if (this._commonService.createdItem) {
          this._toastr.success('Profile ' + this._commonService.createdItem + ' was created', 'Success');
          this._commonService.createdItem = null;
        }
      }
    });
  }

  getCurrentProfile(profiles) {
    const lastProfileId = this._storage.get('profile') ? this._storage.get('profile').id : '';
    let res: any;
    if (lastProfileId) {
      profiles.map(profile => {
        if (profile._id === lastProfileId) res = profile;
      });
    } else {
      res = profiles[profiles.length - 1];
    }

    return res;
  }

  generateLink(profileData, type) {
    // const imageUrl = this.serverUrl + /profiles/ + id + '/' + type;
    const imageUrl = profileData.photos[type];

    if (imageUrl) {
      this._commonService.autoRotation(imageUrl).subscribe(rotate => {
        this[type].rotation = rotate;
        if (rotate && rotate.length > 0) {
          const ind = rotate.match(/\(/).index;
          const newRes = rotate.substring(0);
          this[type].unrotation = newRes.slice(0, ind) + newRes[ind] + '-' + newRes.slice(ind + 1);

          this[type].url = imageUrl;
        } else {
          this[type].url = imageUrl;
        }
      });
    }
  }

  getData(currentProfile) {
    this._accountId = this._storage.get('token');
    this.showSnipper = true;
    this.selectedYear = [];
    this.selectedYearStart = [];
    this.selectedYearEnd = [];
    this.birthDateAll = '';
    this.deathDateAll = '';
    // this.formData = {
    //   selectedYearStart: [],
    //   selectedYearEnd: [],
    //   birthDateAll: '',
    //   deathDateAll: ''
    // };

    this._profileService.getProfileById(currentProfile).subscribe(res => {
      this.profileData = res.profile;

      this.profileType = this.profileData.type.toLowerCase();

      this.showSnipper = false;
      this.generateLink(this.profileData, 'avatar');
      this.generateLink(this.profileData, 'banner');

      // TODO need refactor this
      if (this.profileData.education && this.profileData.education.length > 0 ) {
        this.profileData.education.map(education => {
          this.selectedYearStart.push(new Date(education.start));
          this.selectedYearEnd.push(new Date(education.finish));
        });
      }

      if (this.profileData.grants && this.profileData.grants.length > 0 ) {
        this.profileData.grants.map(grant => {
          this.selectedYear.push(new Date(grant.date));
        });
      }

      if (this.profileData.birth) {
        if (this.profileData.birth.date) {
          this.birthDateAll = new Date(this.profileData.birth.date);
        }

        if (this.profileData.birth.country && this.profileData.birth.city) {
          this.profileData.birth.country = this.profileData.birth.city + ', ' + this.profileData.birth.country;
        }
      } else {
        this.profileData.birth = {};
      }

      if (this.profileData.death) {
        if (this.profileData.death.date) {
          this.deathDateAll = new Date(this.profileData.death.date);
        }

        if (this.profileData.death.country && this.profileData.death.city) {
          this.profileData.death.country = this.profileData.death.city + ', ' + this.profileData.death.country;
        }
      } else {
        this.profileData.death = {};
      }
      // TODO END need refactor this

      if (this.profileData.contacts) {
        Object.keys(this.profileData.contacts).map(key => {
          if (!this.profileData.contacts[key] || this.profileData.contacts[key] === null) {
            this.profileData.contacts[key] = { value: '', hidden: true }
          }
        });
      }

      this.formData.selectedYearStart = this.selectedYearStart;
      this.formData.selectedYearEnd = this.selectedYearEnd;
      this.formData.selectedYear = this.selectedYear;
      this.formData.birthDateAll = this.birthDateAll;
      this.formData.deathDateAll = this.deathDateAll;
    });
  }

  // profileChange(event, form: NgForm) {
  //   const uploadedFiles = this._commonService.photoChange(event);
  //
  //   if (uploadedFiles) {
  //     setTimeout(() => {
  //       this.uploadedFilesProfile = uploadedFiles;
  //       this.profileFileName = uploadedFiles[0].name;
  //       this.profileFileUrl = uploadedFiles[0].tempUrl;
  //
  //       this.updatePhoto('avatar', form);
  //     }, 200);
  //   }
  // }
  // bannerChange(event, form: NgForm) {
  //   const uploadedFiles = this._commonService.photoChange(event);
  //
  //   if (uploadedFiles) {
  //     setTimeout(() => {
  //       this.uploadedFilesBanner = uploadedFiles;
  //       this.bannerFileName = uploadedFiles[0].name;
  //       this.bannerFileUrl = uploadedFiles[0].tempUrl;
  //
  //       this.updatePhoto('banner', form);
  //     }, 200);
  //   }
  // }

  photoChange(event, nameVar: string) {
    const typeFile = (nameVar === 'profileFileUrl') ? 'avatar' : 'banner';
    if (nameVar === 'profileFileUrl') {
      this.showSnipperAvatar = true;
    } else {
      this.showSnipperBanner = true;
    }

    this.filesInProgress = true;
    this._commonService.photoChange(event, (res) => {
      const uploadedFiles = res;
      const tempBann = {
        file: '',
        name: '',
        url: '',
        rotation: '',
        unrotation: ''
      };

      if (uploadedFiles) {

        tempBann.file = uploadedFiles[0];
        tempBann.name = uploadedFiles[0].name;
        tempBann.url = uploadedFiles[0].tempUrl;

        this[typeFile]['rotation'] = undefined;
        this[typeFile]['unrotation'] = undefined;

        this._commonService.autoRotation(tempBann.url).subscribe(rotate => {
          tempBann.rotation = rotate;
          if (rotate && rotate.length > 0) {
            const ind = rotate.match(/\(/).index;
            const newRes = rotate.substring(0);
            tempBann.unrotation = newRes.slice(0, ind) + newRes[ind] + '-' + newRes.slice(ind + 1);

            this[typeFile] = tempBann;
            this.filesInProgress = false;
            this.showSnipperAvatar = false;
            this.showSnipperBanner = false;
          } else {
            this[typeFile] = tempBann;
            this.filesInProgress = false;
            this.showSnipperAvatar = false;
            this.showSnipperBanner = false;
          }

          setTimeout(() => {
            this.updatePhoto(typeFile);
          }, 250);
        });

      }
    });
  }

  encodingURI(url) {
    return encodeURI(url);
  }
  // addItem(type: string, arrName: string) {
  //   if (type === 'education') {
  //     this.profileData[arrName].push({
  //       university: '',
  //       startDate: '',
  //       endDate: ''
  //     });
  //     this.educationYearChanges.push([false, false]);
  //   } else if (type === 'grant') {
  //     this.profileData[arrName].push({
  //       name: '',
  //       year: ''
  //     });
  //     this.grantYearChanges.push(false);
  //   } else if (type === 'death') {
  //     this.deathInfo = true;
  //   }
  // }
  // removeItem(index, varName: string) {
  //   this.profileData[varName].splice(index, 1);
  // }

  updatePhoto(type) {
    const formData = new FormData();

    if (type === 'avatar') {
      this.showSnipperAvatar = true;
      const filesProfile = this.avatar.file;
      formData.append('file', filesProfile);

    } else if (type === 'banner') {
      this.showSnipperBanner = true;
      const filesBanner = this.banner.file;
      formData.append('file', filesBanner);
    }

    this._profileService.photos(formData, this.profileData._id, type).subscribe(res => {
      if (type === 'avatar') {
        // TODO temp hack for update avatar in header
        this._storage.set('isNavVisible', {status: true});
        // TODO END temp hack for update avatar in header
        this._commonService.profileUpdated(true);
      }

      this.showSnipperAvatar = false;
      this.showSnipperBanner = false;
      const emitData = {
        active: true,
        message: 'Photo updated successfully!'
      };
      this._commonService.changeActions(emitData);
      this.generateLink(this.profileData, type);
    }, error => {
      this.getData(this.curProfileId);
      this.showSnipperAvatar = false;
      this.showSnipperBanner = false;
    });

  }

  saveData(form: NgForm, typePro) {
    this.showSnipper = true;
    const formValue = form.value;
    const dataToSend = {
      death: {},
      birth: {},
      contacts: {},
      education: [],
      grants: [],
      type: typePro.toUpperCase()
    };

    if (this._commonService.organizeDate(formValue.deathDate)) {
      dataToSend.death['date'] = this._commonService.organizeDate(formValue.deathDate);
    }

    if (this._commonService.organizeDate(formValue.birthDate)) {
      dataToSend.birth['date'] = this._commonService.organizeDate(formValue.birthDate);
    }

    const education = this.generateObj('education', formValue);
    const grants = this.generateObj('grants', formValue);

    const formNames = [
      { prop: 'name', val: 'name' },
      { prop: 'curator', val: 'nameCu' },
      { prop: 'biography', val: 'biography' }
    ];

    const birthNames = [
      { prop: 'country', val: 'countryBirth' },
      { prop: 'city', val: 'cityBirth' }
    ];

    const deathNames = [
      { prop: 'country', val: 'countryDeath' },
      { prop: 'city', val: 'cityDeath' },
    ];

    let contactNames = [
      { prop: 'phone', val: 'phone' },
      { prop: 'email', val: 'email' },
      { prop: 'website', val: 'website' },
      { prop: 'studio', val: 'studioAddress' }
    ];

    if (typePro.toLowerCase() === 'collector' || typePro === 'COLLECTOR') {
      contactNames.push({prop: 'address', val: 'address'});
      contactNames.push({prop: 'company', val: 'company'});
    }

    const socialsNames = [
      { prop: 'instagram', val: 'instagram' },
      { prop: 'wikipedia', val: 'wikipedia' },
      { prop: 'facebook', val: 'facebook' },
      { prop: 'twitter', val: 'twitter' },
      { prop: 'linkedin', val: 'linkedin' }
    ];

    const birthDeathNames = [
      ['dayBirth', 'monthBirth', 'yearBirth', 'birth'],
      ['dayDeath', 'monthDeath', 'yearDeath', 'death'],
    ];

    if (typePro.toLowerCase() === 'artist' || typePro === 'ARTIST') {
      formNames.map(item => {
        if (formValue[item.val]) dataToSend[item.prop] = formValue[item.val];
      });
    } else if (typePro.toLowerCase() === 'collector' || typePro === 'COLLECTOR') {
      if (formValue['name']) dataToSend['name'] = formValue['name'];
    }

    // formNames.map(item => {
    //   if (formValue[item.val]) dataToSend[item.prop] = formValue[item.val];
    // });

    contactNames.map(item => {
      if (typePro.toLowerCase() === 'artist') {
        if (!formValue[item.val]) {
          dataToSend.contacts[item.prop] = null;
        } else {
          dataToSend.contacts[item.prop] = {};
          dataToSend.contacts[item.prop].value = formValue[item.val];
          dataToSend.contacts[item.prop].hidden = this.profileData.contacts[item.prop] ? this.profileData.contacts[item.prop].hidden : true;
        }
      } else if (typePro.toLowerCase() === 'collector') {
        if (!formValue.contacts[item.prop]) {
          dataToSend.contacts[item.prop] = null;
        } else {
          dataToSend.contacts[item.prop] = {};
          dataToSend.contacts[item.prop].value = formValue.contacts[item.prop].value;
          dataToSend.contacts[item.prop].hidden = formValue.contacts[item.prop] ? formValue.contacts[item.prop].hidden : true;
        }
      }
    });

    socialsNames.map(item => {
      if (!formValue[item.val]) {
        dataToSend.contacts[item.prop] = null;
      } else {
        dataToSend.contacts[item.prop] = {};
        dataToSend.contacts[item.prop].value = formValue[item.val];
        dataToSend.contacts[item.prop].hidden = false;
      }
    });

    birthNames.map(item => {
      if (item.prop === 'country') {
        if (formValue[item.val]) {
          const county = formValue[item.val].split(', ');
          dataToSend.birth[item.prop] = county[1];
        }
      } else {
        if (formValue[item.val]) dataToSend.birth[item.prop] = formValue[item.val];
      }
    });

    deathNames.map(item => {
      if (item.prop === 'country') {
        if (formValue[item.val]) {
          const county = formValue[item.val].split(', ');
          dataToSend.death[item.prop] = county[1];
        }
      } else {
        if (formValue[item.val]) dataToSend.death[item.prop] = formValue[item.val];
      }
    });

    // birthDeathNames.map(item => {
    //   if (formValue[item[0]] && formValue[item[1]] && formValue[item[2]]) {
    //     const date = new-profile Date(formValue[item[2]], formValue[item[1]], formValue[item[0]]);
    //     dataToSend[item[3]]['date'] = date.getTime();
    //   }
    // });

    if (education && education.length > 0) {
      education.map((item, index) => {
        dataToSend['education'].push({
          title: item.title,
          start: new Date(item.start).getTime(),
          finish: new Date(item.finish).getTime()
        });
      });
    } else {
      dataToSend['education'] = null;
    }

    if (grants && grants.length > 0) {
      grants.map((item, index) => {
        dataToSend['grants'].push({
          title: item.title,
          date: new Date(item.date).getTime()
        });
      });
    } else {
      dataToSend['grants'] = null;
    }

    if( Object.keys(dataToSend['death']).length < 1 ) {
      dataToSend['death'] = null;
    }

    this._profileService.editProfile(dataToSend, this.profileData._id).subscribe(res => {
      this._commonService.profileUpdated(true);
      this.getData(this.curProfileId);
      this.showSnipper = false;
    }, error => {
      this.showSnipper = false;
      console.error(error);
    });
  }

  // setFirstDay(year) {
  //   return String(new Date(year, 0, 1));
  // }

  generateObj(type: string, formObj: any) {
    const result = [];

    if (type === 'education') {

      for (let prop in formObj) {
        if (prop.includes('university')) {
          let index = prop.replace(/\D/g,'');
          if (formObj['university' + index] && formObj['startDate' + index] && formObj['endDate' + index]) {
            result.push({
              title: formObj['university' + index],
              start: formObj['startDate' + index],
              finish: formObj['endDate' + index]
            });
          }
        }
      }

    } else if (type === 'grants') {

      for (let prop in formObj) {
        if (prop.includes('grantName')) {
          let index = prop.replace(/\D/g,'');
          if (formObj['grantName' + index] && formObj['grantYear' + index]) {
            result.push({
              title: formObj['grantName' + index],
              date: formObj['grantYear' + index]
            });
          }
        }
      }

    }
    return result;
  }

  // validateDate(form: NgForm) {
  //
  //   setTimeout(() => {
  //     const formValue = form.value;
  //     let birthDate;
  //     let deathDate;
  //     const dateNow = new Date();
  //
  //     if (formValue.dayBirth && formValue.monthBirth && formValue.yearBirth) {
  //       birthDate = new Date(formValue.yearBirth, parseInt(formValue.monthBirth, 10) - 1 , formValue.dayBirth);
  //     }
  //
  //     if (formValue.dayDeath && formValue.monthDeath && formValue.yearDeath) {
  //       deathDate = new Date(formValue.yearDeath, parseInt(formValue.monthDeath, 10) - 1, formValue.dayDeath);
  //     }
  //
  //     if (birthDate && deathDate) {
  //       if(deathDate.getTime() < birthDate.getTime()) {
  //         form.controls['dayDeath'].setErrors({'incorrect': true});
  //       } else {
  //         form.controls['dayDeath'].setErrors(null);
  //       }
  //     }
  //
  //     if (birthDate) {
  //       if ( (birthDate.getTime() > dateNow.getTime()) ||
  //         this.checkDateValid(formValue.dayBirth, formValue.monthBirth)) {
  //         form.controls['dayBirth'].setErrors({'incorrect': true});
  //       } else {
  //         form.controls['dayBirth'].setErrors(null);
  //       }
  //     }
  //
  //     if (deathDate) {
  //       if ( (deathDate.getTime() > dateNow.getTime()) ||
  //         this.checkDateValid(formValue.dayDeath, formValue.monthDeath)) {
  //         form.controls['monthDeath'].setErrors({'incorrect': true});
  //       } else {
  //         form.controls['monthDeath'].setErrors(null);
  //       }
  //     }
  //
  //   }, 200);
  // }

  // checkDateValid(day, month) {
  //   if ( ((parseInt(month, 10) - 1) === 2) && parseInt(day, 10) === 31 ) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  // validateDateEducation(form: NgForm, index) {
  //   setTimeout(() => {
  //     const formValue = form.value;
  //     const startDate = formValue['startDate' + index];
  //     const endDate = formValue['endDate' + index];
  //
  //     if (startDate && endDate) {
  //       if (parseInt(startDate, 10) > parseInt(endDate, 10)) {
  //         form.controls['startDate' + index].setErrors({'incorrect': true});
  //         if (this.datesEducation[index]) {
  //           this.datesEducation[index] = 'error';
  //         } else {
  //           this.datesEducation.push('error');
  //         }
  //       } else {
  //         form.controls['startDate' + index].setErrors(null);
  //         if (this.datesEducation[index]) {
  //           this.datesEducation[index] = 'valid';
  //         } else {
  //           this.datesEducation.push('valid');
  //         }
  //       }
  //     }
  //   }, 200);
  // }

  // validation(type, form, nameInput, value) {
  //   let namePattern;
  //   switch (type) {
  //     case 'phone':
  //       namePattern = 'isMobilePhone';
  //       break;
  //     case 'link':
  //       namePattern = 'isURL';
  //       break;
  //     case 'email':
  //       namePattern = 'isEmail';
  //       break;
  //   }
  //
  //   if (Validator[namePattern](value)) {
  //     form.controls[nameInput].setErrors(null);
  //   } else {
  //     form.controls[nameInput].setErrors({'incorrect': true});
  //   }
  // }

  //
  // selectDate(datepicker, type, index, event) {
  //
  //   if (typeof type === 'string') {
  //     if (this[type][index]) {
  //       this[type][index] = event;
  //     } else {
  //       this[type].push(event);
  //     }
  //   } else {
  //     if (this[type][index]) {
  //       this[type][index] = event;
  //     } else {
  //       this[type][0][index].push(event);
  //     }
  //   }
  //   datepicker.close();
  //
  //   this.changeDate(type, index);
  // }

  // changeDate(type, index) {
  //   if (type === 'selectedYearStart' || type === 'selectedYearEnd') {
  //     const i = (type === 'selectedYearStart') ? 0 : 1;
  //     if (this.educationYearChanges[index]) {
  //       this.educationYearChanges[index][i] = !this.educationYearChanges[index][i];
  //     } else {
  //       this.educationYearChanges.push([false, false]);
  //       this.educationYearChanges[index][i] = !this.educationYearChanges[index][i];
  //     }
  //
  //   } else {
  //     if (this.grantYearChanges[index] || this.grantYearChanges[index] === false) {
  //       this.grantYearChanges[index] = !this.grantYearChanges[index];
  //     } else {
  //       this.grantYearChanges.push(true);
  //     }
  //   }
  // }

  // selectDateAll(datepicker, type, index, event) {
  //   if (this[type[0]][index][type[1]]) {
  //     this[type[0]][index][type[1]] = event;
  //   } else {
  //     this[type[0]][index][type[1]].push(event);
  //   }
  // }

  // toggleDirection(newVal, varName) {
  //   this.profileData.contacts[varName].hidden = !this.profileData.contacts[varName].hidden;
  // }

  // handleAddressChange(address: Address, nameVar, form?) {
  //   if (nameVar === 'birth' || nameVar === 'death') {
  //     let city = '';
  //     let country = '';
  //     address.address_components.map(item => {
  //       if (item.types[0] === 'locality') city = item.long_name;
  //       if (item.types[0] === 'country') country = item.long_name;
  //     });
  //
  //     if (nameVar === 'birth') {
  //       this.profileData.birth.city = city;
  //       this.profileData.birth.country = city + ', ' + country;
  //     } else {
  //       this.profileData.death.city = city;
  //       this.profileData.death.country = city + ', ' + country;
  //     }
  //   } else if (nameVar === 'studio') {
  //     if (!this.profileData.contacts.studio) {
  //       this.profileData.contacts.studio = {};
  //     }
  //     this.profileData.contacts.studio.value = address.formatted_address;
  //   }
  // }

  ngOnDestroy() {
    this._commonService.setHeaderTitle('');
  }
}
