import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import * as Validator from '../../assets/js/validator.min.js';
import {ArtworkService} from './artwork.service';
import {Observable} from 'rxjs/Observable';
import {bindCallback} from 'rxjs/internal/observable/bindCallback';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  public subjectActions = new BehaviorSubject({active: false, message: ''});
  public isNavVisible: boolean;
  public navVisibilityChange = new Subject<boolean>();

  public headerTitle: any;
  public headerTitleChange = new Subject<boolean>();

  public uploadedLine = [];
  public uploadedLineChange = new Subject<boolean>();
  public createdItem: string;

  public previousRouteUrl = '';
  public currentRouteUrl = '';

  public profileData = new Subject<boolean>();
  public profileType = new Subject<boolean>();
  getOrientation = (file: File, callback: Function) => {
    let reader = new FileReader();

    reader.onload = (event: ProgressEvent) => {

      if (!event.target) {
        return;
      }

      const file = event.target as FileReader;
      const view = new DataView(file.result as ArrayBuffer);

      if (view.getUint16(0, false) != 0xFFD8) {
        return callback(-2);
      }

      const length = view.byteLength;
      let offset = 2;

      while (offset < length) {
        if (view.getUint16(offset + 2, false) <= 8) return callback(-1);
        let marker = view.getUint16(offset, false);
        offset += 2;

        if (marker == 0xFFE1) {
          if (view.getUint32(offset += 2, false) != 0x45786966) {
            return callback(-1);
          }

          let little = view.getUint16(offset += 6, false) == 0x4949;
          offset += view.getUint32(offset + 4, little);
          let tags = view.getUint16(offset, little);
          offset += 2;
          for (let i = 0; i < tags; i++) {
            if (view.getUint16(offset + (i * 12), little) == 0x0112) {
              return callback(view.getUint16(offset + (i * 12) + 8, little));
            }
          }
        } else if ((marker & 0xFF00) != 0xFF00) {
          break;
        }
        else {
          offset += view.getUint16(offset, false);
        }
      }
      return callback(-1);
    };

    reader.readAsArrayBuffer(file);
  };

  constructor() {
    this.navVisibilityChange.subscribe((value) => {
      this.isNavVisible = value;
    });

    this.headerTitleChange.subscribe((value) => {
      this.headerTitle = value;
    });

    this.uploadedLineChange.subscribe((value: any) => {
      this.uploadedLine = value;
    });
  }

  public setPreviousRouteUrl(url) {
    this.previousRouteUrl = this.currentRouteUrl.slice();
    if (url) {
      this.currentRouteUrl = url;
    }
  }

  // getPhoneNumber(code, phoneValue) {
  //   const countryList = this.countryService.getCountries();
  //   countryList.map((item) => {
  //     if (item.countryCode === code) {
  //       if (phoneValue.includes(item.dialCode)) {
  //         phoneValue = '+' + phoneValue.splice(item.dialCode.length, phoneValue.length);
  //       }
  //     }
  //   });
  //
  //   return phoneValue;
  // }

  getCountryCode(phoneValue) {
    let countryList = [];
    let selectedCountry = '';
    if (window['intlTelInputGlobals']) {
      countryList = window['intlTelInputGlobals'].getCountryData();
    }
    countryList.map((item) => {
      if (phoneValue.includes('+' + item.dialCode)) {
        selectedCountry = item.iso2;
      }
    });

    return selectedCountry;
  }

  toggleNavVisibility(value) {
    this.navVisibilityChange.next(value);
  }

  setHeaderTitle(value) {
    this.headerTitleChange.next(value);
  }

  setUploadedLine(value) {
    this.uploadedLineChange.next(value);
  }

  changeActions(data) {
    this.subjectActions.next(data);
  }

  getActions() {
    return this.subjectActions;
  }

  watchProfile(): Observable<any> {
    return this.profileData.asObservable();
  }

  profileUpdated(data): void {
    return this.profileData.next(data);
  }

  watchType(): Observable<any> {
    return this.profileType.asObservable();
  }

  setProType(data): void {
    return this.profileType.next(data);
  }

  photoChange(event, callback?) {
    const target = event.target || event.srcElement;
    const uploadedFiles = target.files;
    const types = ['doc', 'pdf', 'xls'];

    if (uploadedFiles) {

      Object.keys(uploadedFiles).map((key, i) => {
        const fileTarget = new File([uploadedFiles[key]], uploadedFiles[key].name);

        if (key !== 'length') {
          const reader = new FileReader();
          reader.onload = (event: ProgressEvent) => {
            uploadedFiles[key]['sizeFile'] = (uploadedFiles[key]['size'] / 1000000).toFixed(2);
            uploadedFiles[key]['tempUrl'] = (<FileReader>event.target).result;
            uploadedFiles[key]['tempUrl'] = this.encodingURI(uploadedFiles[key]['tempUrl']);

            const arrName = uploadedFiles[key].name.split('.');
            types.map(type => {
              if (arrName[arrName.length - 1].toLocaleLowerCase().includes(type)) {
                uploadedFiles[key]['type'] = type;
              }
            });

            if (uploadedFiles.length - 1 === i) callback(uploadedFiles);
          };
          reader.readAsDataURL(fileTarget);
        }
      });

      // return uploadedFiles;
    }
    return false;
  }

  encodingURI(url) {
    return encodeURI(url);
  }

  exhibitionStartDate(start, end) {
    let res = '';
    const arrVars = [
      {name: 'day', val: 'dd'},
      {name: 'month', val: 'MMM'},
      {name: 'year', val: 'yyyy'}
    ];
    start = new Date(start);
    end = new Date(end);

    // show on view
    const objDate = {
      day: true,
      month: true,
      year: true
    };

    const startDay = start.getDate();
    const startMonth = start.getMonth();
    const startYear = start.getFullYear();
    const endDay = end.getDate();
    const endMonth = end.getMonth();
    const endYear = end.getFullYear();

    if (startYear === endYear) objDate.year = false;

    if (!objDate.year) {
      if (startMonth === endMonth) objDate.month = false;
    }

    if (!objDate.year && !objDate.month) {
      if (startDay === endDay) objDate.day = false;
    }

    arrVars.map(item => {
      if (objDate[item.name]) res += res ? ' ' + item.val : item.val;
    });

    return res;
  }

  generateUrl(curPage, countItemsOnPage, sort?, filter?) {
    let sorting = '';
    let filtering = '';
    const skip = (curPage - 1) * countItemsOnPage;
    const limit = countItemsOnPage;
    let pagination = '?skip=' + skip + '&limit=' + limit;


    if (sort) {
      sorting = '&' + sort.type + '=' + sort.typeVal + '&' + sort.order + '=' + sort.orderVal;

      pagination += sorting;
    }

    if (filter) {
      Object.keys(filter).map(key => {
        if (key === 'categories') {
          if (filter[key] && filter[key].length > 0) {
            filter[key].map(cat => {
              filtering += '&categories=' + cat;
            });
          }
        } else {
          if (filter[key]) filtering += '&' + key + '=' + filter[key];
        }
      });

      pagination += filtering;
    }

    return pagination;
  }

  validation(type, form, nameInput, value) {
    console.log(type, form, nameInput, value);
    let namePattern;
    switch (type) {
      case 'phone':
        namePattern = 'isMobilePhone';
        break;
      case 'link':
        namePattern = 'isURL';
        break;
      case 'email':
        namePattern = 'isEmail';
        break;
    }

    if (Validator[namePattern](value)) {
      form.controls[nameInput].setErrors(null);
    } else {
      form.controls[nameInput].setErrors({'incorrect': true});
    }
  }

  organizeDate(value) {
    const date = new Date(value);
    let time: any;
    time = date.getTime();
    // if (time > 0) {
    return time;
    // }
  }

  organizeUsersData(data) {
    const res = [];
    data.map(item => res.push(item._id));
    return res;
  }

  orgWorkDays(days, baseArr?) {
    // {mon: [481, 1081], tue: [275, 395], wed: [395, 397], thu: null, fri: null, sat: [396, 516], sun: null}
    // {id: item.toLowerCase().substring(0, 3), title: item, from: '', to: '', active: (i < 5)}
    const res = {};

    if (baseArr) { // if SET days

      baseArr.map(day => {
        if (days[day.id] && (days[day.id][0] && days[day.id][1])) {
          day.active = true;
          day.from = new Date(this.setDate(days[day.id][0]));
          day.to = new Date(this.setDate(days[day.id][1]));
        } else {
          day.active = false;
        }
      });

      return baseArr;

    } else { // if SEND days
      days.map(day => {
        if (day.active && day.from && day.to) {
          res[day.id] = [this.calculateMinute(day.from), this.calculateMinute(day.to)];
        } else {
          res[day.id] = null;
        }
      });

      return res;
    }
  }

  calculateMinute(date) {
    const millisecondsInMin = 60000;
    const baseDate = new Date(date.getTime());
    let start = new Date(date.getTime());
    start.setHours(0, 0, 0, 0);

    const milliseconds = (baseDate.getTime() - start.getTime());

    return Math.round(milliseconds / millisecondsInMin);
  }

  setDate(minutes) {
    const today = new Date();

    const h = (minutes / 60);
    const hours = Math.floor(h);
    const m = (hours - hours) * 60;
    const min = Math.round(m);

    return today.setHours(hours, min, 0, 0);
  }

  setTimes(mainDay, index, days) {
    days.map((day, i) => {
      if (day.active && i !== index) {
        day.from = mainDay.from;
        day.to = mainDay.to;
      }
    });
    return days;
  }

  autoRotation(url: any): any {
    const orientation: any = bindCallback<any>(this.prepareRotation);
    return orientation(url);
  }

  prepareRotation(url, callback) {
    const rotation = {
      1: '',
      3: 'rotate(180deg)',
      6: 'rotate(90deg)',
      8: 'rotate(270deg)'
    }; // rotate(0deg)
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = (e => {

      if (xhr['status'] == 200) {
        let reader = new FileReader();

        reader.onload = (event: ProgressEvent) => {
          if (!event.target) {
            return;
          }

          const file = event.target as FileReader;
          const view = new DataView(file.result as ArrayBuffer);

          if (view.getUint16(0, false) != 0xFFD8) {
            callback(-2);
          }

          const length = view.byteLength;
          let offset = 2;

          while (offset < length) {
            if (view.getUint16(offset + 2, false) <= 8) callback(-1);
            let marker = view.getUint16(offset, false);
            offset += 2;

            if (marker == 0xFFE1) {
              if (view.getUint32(offset += 2, false) != 0x45786966) {
                callback(-1);
              }

              let little = view.getUint16(offset += 6, false) == 0x4949;
              offset += view.getUint32(offset + 4, little);
              let tags = view.getUint16(offset, little);
              offset += 2;
              for (let i = 0; i < tags; i++) {
                if (view.getUint16(offset + (i * 12), little) == 0x0112) {
                  callback(rotation[view.getUint16(offset + (i * 12) + 8, little)]);
                }
              }
            } else if ((marker & 0xFF00) != 0xFF00) {
              break;
            }
            else {
              offset += view.getUint16(offset, false);
            }
          }
          callback(-1);
        };

        reader.readAsArrayBuffer(xhr['response']);
      }
    });
    xhr.send();
  }

  separatePhone(number: string) {
    if (!number) return null;
    let selectedCountry: any;
    // get the country data from the plugin
    let countryData = window['intlTelInputGlobals'].getCountryData();

    countryData.map(country => {
      if ( number.includes('+' + country.dialCode)) {
        selectedCountry = country;
      }
    });

    return selectedCountry;
  }
}
