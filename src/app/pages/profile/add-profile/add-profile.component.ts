import { Component, ElementRef, Input, OnDestroy, OnInit, Renderer } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { ProfileService } from '../../../services/profile.service';
import { StorageService } from '../../../services/storage.service';
import { Title } from '@angular/platform-browser';
import { AuthGuardService } from '../../../services/auth-guard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'ngx-add-profile',
  templateUrl: './add-profile.component.html',
  styleUrls: ['./add-profile.component.scss']
})
export class AddProfileComponent implements OnInit, OnDestroy {
  @Input('fromNew') fromNew: boolean;
  public activeTab: any;
  public socials: any;
  public needGetData: boolean;
  public formPro: any;
  public formProAbout: any;
  public showSnipper: boolean;
  public showSnipperAvatar: boolean;
  public showSnipperBanner: boolean;
  public finalResult: boolean;
  public createdId: any;
  public currentId: any;
  public profileType: string;
  public fromInit: boolean;
  public tabs: any;
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

  public allTabs = {
    artist: [
      {title: 'ADDING_PROFILE.TABS.BASIC'},
      {title: 'ADDING_PROFILE.TABS.ABOUT_ARTIST'}
      // {title: 'ADDING_PROFILE.TABS.PROFILE_PHOTOS'}
    ],
    collector: [
      {title: 'Basic info'}
      // {title: 'Photo'}
    ]
  };
  public collectorForm = this._fb.group({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: ''
  });

  constructor(
    private _commonService: CommonService,
    private _profileService: ProfileService,
    private _el: ElementRef,
    private _renderer: Renderer,
    private _storage: StorageService,
    private _titleService: Title,
    private _authService: AuthGuardService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _router: Router
  ) { }

  ngOnInit() {
    this.fromInit = true;
    // set meta tag and header title
    this._titleService.setTitle( 'Locarto - Artist Profile' );
    this._commonService.setHeaderTitle({ nav: 'Adding profile'});

    // set active first tab
    this.activeTab = 1;

    // get current account id
    this.currentId = this._storage.get('token');

    this.profileType = this._route.queryParams['value'].type || 'artist';
    this.tabs = this.allTabs[this.profileType];

    this._route.queryParams.subscribe( queryParams => {
      if (queryParams.type && !this.fromInit) {
        this.profileType = this._route.queryParams['value'].type || 'artist';
        this.tabs = this.allTabs[this.profileType];
      }
    });
    this.fromInit = false;
  }

  setActiveTab(index, getData: boolean) {
    // trigger for getting data
    if (getData) this.needGetData = !this.needGetData;

    // check form before allow set new-profile tab active
    if (this.profileType === 'artist') {
      if (this.formPro && this.formPro.valid) {
        this.activeTab = index;
      }
      // if it is not tab - allow set new-profile tab as active
      if (!this.formPro) this.activeTab = index;
    } else if (this.profileType === 'collector') {
      if (this.collectorForm && this.collectorForm.valid) {
        this.activeTab = index;
      }
      // if it is not tab - allow set new-profile tab as active
      if (!this.collectorForm) this.activeTab = index;
    }
  }

  // updatePhoto(profileId) { TODO old things
  //   if (this.avatar && this.avatar.file) {
  //     this.showSnipperAvatar = true;
  //
  //     const formData = new FormData();
  //     formData.append('file', this.avatar.file);
  //
  //     this._profileService.photos(formData, profileId, 'avatar').subscribe(res => {
  //       // this._storage.set('isNavVisible', {status: true});
  //       this.avatar = undefined;
  //       this.updatePhoto(profileId);
  //     }, error => {
  //       this.avatar = undefined;
  //       this.updatePhoto(profileId);
  //     });
  //   } else if (this.banner && this.banner.file) {
  //     // this.showSnipperBanner = true;
  //
  //     const formData = new FormData();
  //     formData.append('file', this.banner.file);
  //
  //     this._profileService.photos(formData, profileId, 'banner').subscribe(res => {
  //       this.showSnipperBanner = false;
  //       this.showSnipper = false;
  //       this.banner = undefined;
  //       this.finalResult = true;
  //     }, error => {
  //       this.showSnipperBanner = false;
  //       this.showSnipper = false;
  //       this.banner = undefined;
  //       this.finalResult = true;
  //     });
  //   } else {
  //     this.showSnipper = false;
  //     this.finalResult = true;
  //   }
  // }

  encodingURI(url) {
    return encodeURI(url);
  }

  sendData(typePro, data?) {
    this.showSnipper = true;
    // this.avatar = data.avatar; OLD things
    // this.banner = data.banner; OLD things
    let formValue;

    if (typePro === 'ARTIST') {
      formValue = Object.assign({}, this.formPro.value, this.formProAbout.value);
    } else if (typePro === 'COLLECTOR') {
      formValue = this.collectorForm.value;
    }

    const dataToSend = {
      death: {},
      birth: {},
      contacts: {},
      education: [],
      grants: [],
      type: typePro
    };

    if (this._commonService.organizeDate(formValue['deathDate'])) {
      dataToSend.death['date'] = this._commonService.organizeDate(formValue['deathDate']);
    }

    if (this._commonService.organizeDate(formValue['birthDate'])) {
      dataToSend.birth['date'] = this._commonService.organizeDate(formValue['birthDate']);
    }

    const socials = this.setSocials();
    const educations = this.generateObj('educations', formValue);
    const grants = this.generateObj('grants', formValue);

    const formNames = [
      {
        prop: 'name',
        val: 'artistName'
      },
      {
        prop: 'curator',
        val: 'curatorName'
      },
      {
        prop: 'biography',
        val: 'biography'
      }
    ];

    const birthNames = [
      {
        prop: 'country',
        val: 'countryBirth'
      },
      {
        prop: 'city',
        val: 'cityBirth'
      }
    ];

    const deathNames = [
      {
        prop: 'country',
        val: 'countryDeath'
      },
      {
        prop: 'city',
        val: 'cityDeath'
      },
    ];


    const contactNames = [
      {
        prop: 'phone',
        val: 'phone'
      },
      {
        prop: 'email',
        val: 'email'
      },
      {
        prop: 'website',
        val: 'website'
      },
      {
        prop: 'studio',
        val: 'studioAddress'
      },
      {
        prop: 'address',
        val: 'address'
      },
      {
        prop: 'company',
        val: 'company'
      }
    ];

    const socialsNames = [
      {
        prop: 'instagram',
        val: 'instagram'
      },
      {
        prop: 'wikipedia',
        val: 'wikipedia'
      },
      {
        prop: 'facebook',
        val: 'facebook'
      },
      {
        prop: 'twitter',
        val: 'twitter'
      },
      {
        prop: 'linkedin',
        val: 'linkedin'
      }
    ];

    // const birthDeathNames = [
    //   ['dayBirth', 'monthBirth', 'yearBirth', 'birth'],
    //   ['dayDeath', 'monthDeath', 'yearDeath', 'death'],
    // ];

    if (typePro === 'ARTIST') {
      formNames.map(item => {
        if (formValue[item.val]) dataToSend[item.prop] = formValue[item.val];
      });
    } else if (typePro === 'COLLECTOR') {
      if (formValue['name']) dataToSend['name'] = formValue['name'];
    }

    contactNames.map(item => {
      dataToSend.contacts[item.prop] = {};
      dataToSend.contacts[item.prop].value = formValue[item.val];
      dataToSend.contacts[item.prop].hidden = true;
      if (!formValue[item.val]) dataToSend.contacts[item.prop] = null;
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

    socialsNames.map(item => {
      dataToSend.contacts[item.prop] = {};
      dataToSend.contacts[item.prop].value = socials[item.val];
      dataToSend.contacts[item.prop].hidden = false;
      if (!socials[item.val]) dataToSend.contacts[item.prop] = null;
    });

    // birthDeathNames.map(item => {
    //   if (formValue[item[0]] && formValue[item[1]] && formValue[item[2]]) {
    //     const date = new-profile Date(formValue[item[2]], formValue[item[1]], formValue[item[0]]);
    //     dataToSend[item[3]]['date'] = date.getTime();
    //   }
    // });

    if (educations && educations.length > 0) {
      educations.map((item, index) => {
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

    if( Object.keys(dataToSend['birth']).length < 1) {
      dataToSend['birth'] = null;
    }

    this._profileService.addProfile(dataToSend).subscribe(res => {
      // this.updatePhoto(res.profile._id); TODO need remove this
      // this._profileService.getProfiles('get', this.currentId).subscribe(res => {
      //   this.createdId = res.profiles[res.profiles.length - 1]._id;
      // });
      // this._storage.set('isNavVisible', {status: true});

      this.createdId = res.profile._id;
      this._renderer.setElementClass(this._el.nativeElement, 'finished', true);
      this.showSnipper = false;
      this._storage.set('profile', {id: this.createdId});
      this._commonService.createdItem = dataToSend['name'];
      this._router.navigate(['/pages/profile-edit-profile'], {queryParams: {id: this.createdId}});
    }, error => {
      console.error(error);
      this.showSnipper = false;
    });
  }

  socialsUpd(data) {
    this.socials = data;
  }

  setSocials() {
    const obj = {
      instagram: '',
      wikipedia: '',
      facebook: '',
      twitter: '',
      linkedin: ''
    };

    if (this.socials && this.socials.length > 0) {
      this.socials.map(item => {
        if (item.link) {
          obj[item.name.toLowerCase()] = item.link;
        }
      });
    }

    return obj;
  }

  generateObj(type: string, formObj: any) {
    const result = [];

    if (type === 'educations') {

      for (let prop in formObj) {
        if (prop.includes('university')) {
          let index = prop.replace(/\D/g,'');
          result.push({
            title: formObj['university' + index],
            start: formObj['startDate' + index],
            finish: formObj['endDate' + index]
          });
        }

        // if (!result[0].title && !result[0].start && !result.finish) result = null; // TODO
      }

    } else if (type === 'grants') {

      for (let prop in formObj) {
        if (prop.includes('grantName')) {
          let index = prop.replace(/\D/g,'');
          result.push({
            title: formObj['grantName' + index],
            date: formObj['grantYear' + index]
          })
        }

        // if (!result.title && !result.date) result = null; // TODO
      }
    }

    return result;
  }

  filesChanged(data) {
    this.avatar = data.avatar;
    this.banner = data.banner;
  }

  ngOnDestroy() {
    this._commonService.setHeaderTitle('');
  }
}
