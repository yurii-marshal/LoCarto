import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { ArtworkService } from '../../../../../services/artwork.service';
import { CommonService } from '../../../../../services/common.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { ExhibitionsService } from '../../../../../services/exhibitions.service';

@Component({
  selector: 'ngx-exh-edit-general',
  templateUrl: './exh-edit-general.component.html',
  styleUrls: ['./exh-edit-general.component.scss']
})
export class ExhEditGeneralComponent implements OnInit {
  @Output() exhUpdate = new EventEmitter<any>();
  public exhibition: any;
  public tempAvatar: any;
  public filesInProgress: boolean;
  public fullDateCreation = false;
  public changeYear: boolean;
  public showWorkDays: boolean;
  public showSnipper: boolean;
  public snipperPhoto: boolean;
  public tagsArr = [];
  public tagField: any;
  public bannerData: any;
  public currentId: string;
  public days: any;
  public role: string;
  public viewMode: boolean;
  public selectedCountry: any;
  public phonePattern = new RegExp(/^([0-9\(\)\/\+ \-]*)$/);
  public draftFormExhibition = this._fb.group({
    title: '',
    startDate: '',
    endDate: '',
    nameLocation: '',
    address: '',
    description: '',
    tags: '',
    website: '',
    phone: '',
    appointment: '',
    workDays: this._fb.array([])
  });
  public banner = {
    file: '',
    name: '',
    url: '',
    rotation: '',
    unrotation: ''
  };

  constructor(
    private _fb: FormBuilder,
    private _artworkService: ArtworkService,
    private _commonService: CommonService,
    private _exhibitionsService: ExhibitionsService
  ) {
    const base = new Date();
    const from = base.setHours(8, 0, 0, 0);
    const to = base.setHours(17, 0, 0, 0);
    this.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      .map((item: any, i) => item = {
        id: item.toLowerCase().substring(0, 3),
        title: item,
        from: new Date(from),
        to: new Date(to),
        active: (i < 5)
      });
  }

  @Input() set data(data: any) {
    this.exhibition = data;
    if (this.exhibition) this.setExhData(this.exhibition);
  }

  @Input() set exhId(val: string) {
    this.currentId = val;
  }

  @Input() set curRole(val: string) {
    this.role = val;
    this.viewMode = (this.role === 'member' || this.role === undefined);
  }

  ngOnInit() {
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

  setFormValue(value, nameProp, index?) {
    if (index === undefined) {
      // set fields
      const tempObj = {};
      tempObj[nameProp] = value;
      this.draftFormExhibition.patchValue(tempObj);
    }
  }

  setExhData(exhibition) {
    this._artworkService.generateFilesArr(exhibition.banner, true).then(banners => {
      if (banners) {
        this._commonService.autoRotation(banners['url']).subscribe(rotate => {
          exhibition.rotation = rotate;
          if (rotate && rotate.length > 0) {
            const ind = rotate.match(/\(/).index;
            const newRes = rotate.substring(0);
            exhibition.unrotation = newRes.slice(0, ind) + newRes[ind] + '-' + newRes.slice(ind + 1);

            exhibition.bannerUrl = banners['url'];
          } else {
            exhibition.bannerUrl = banners['url'];
          }
        });
      }
    });

    if (this.checkDaysExisting(exhibition.schedule.timetable)) {
      this.addWorkDays();
      this.days = this._commonService.orgWorkDays(exhibition.schedule.timetable, this.days);
    }

    const obj = {
      id: exhibition._id,
      title: exhibition.title,
      startDate: this.setDateCreate(exhibition.date.from),
      endDate: this.setDateCreate(exhibition.date.to),
      nameLocation: exhibition.place,
      address: exhibition.location,
      description: exhibition.description,
      tags: exhibition.tags,
      website: exhibition.website,
      phone: exhibition.phone,
      appointment: exhibition.schedule.byApoinment
    };

    // TODO: set a flag of current country number
    // view isn't reloaded in this case

    this.selectedCountry = this._commonService.separatePhone((exhibition && exhibition.phone) ? exhibition.phone : '');

    this.tagsArr = exhibition.tags;
    this.draftFormExhibition.patchValue(obj);
  }

  setDateCreate(val) {
    if (val) {
      const date: any = new Date(val);
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

  checkDaysExisting(days) {
    let res = false;
    if (days) {
      Object.keys(days).map(key => {
        if ((days[key] && days[key][0]) && (days[key] && days[key][1])) {
          res = true;
        }
      });
    }
    return res;
  }

  getArrForms(nameArr) {
    return this.draftFormExhibition.get(nameArr) as FormArray;
  }

  photoChange(event) {
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
        Object.keys(uploadedFiles).map(key => {
          tempBann.file = uploadedFiles[0];
          tempBann.name = uploadedFiles[0].name;
          tempBann.url = uploadedFiles[0].tempUrl;
        });

        this.banner['rotation'] = undefined;
        this.banner['unrotation'] = undefined;

        this._commonService.autoRotation(tempBann.url).subscribe(rotate => {
          tempBann.rotation = rotate;
          if (rotate && rotate.length > 0) {
            const ind = rotate.match(/\(/).index;
            const newRes = rotate.substring(0);
            tempBann.unrotation = newRes.slice(0, ind) + newRes[ind] + '-' + newRes.slice(ind + 1);

            this.banner = tempBann;
          } else {
            this.banner = tempBann;
          }

          this.filesUpload([this.banner]).then((data: any) => {
            const arrToSend = this._artworkService.organizeFiles(data);
            this.bannerData = arrToSend;

            this.updateBanner(this.bannerData[0]);
            this.filesInProgress = false;
          });
        });
      }
    });
  }

  filesUpload(files) {
    // set status 'in progress'
    this.filesInProgress = true;
    // copy object files
    const tempFiles = Array.from(files);
    // add main file of artwork to send
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

  telInputObject(ev) {
  }

  onCountryChange(country) {
    if (country.dialCode) {
      this.draftFormExhibition.controls.phone.patchValue('+' + country.dialCode + ' ');
    }
  }

  selectDate(datepicker, value, nameVar) {
    const tempObj = {};
    tempObj[nameVar] = value;
    this.draftFormExhibition.patchValue(tempObj);

    this.changeYear = !this.changeYear;
    // close if need only year view
    if (!this.fullDateCreation) datepicker.close();
  }

  changeTypeDate(event) {
    this.fullDateCreation = event.target.checked;
    // reset fields after change type of date
    this.draftFormExhibition.patchValue({startDate: '', endDate: ''});
    if (!this.fullDateCreation) this.changeYear = false;
  }

  handleAddressChange(address: Address, nameVar) {
    const tempObj = {};
    tempObj[nameVar] = address.formatted_address;
    this.draftFormExhibition.patchValue(tempObj);
  }

  validationAct(type, form, nameInput, value) {
    this._commonService.validation(type, form, nameInput, value);
  }

  addWorkDays() {
    this.showWorkDays = !this.showWorkDays;
  }

  changeVal(event, nameVar) {
    // set fields
    this.setFormValue(event.target.checked, nameVar);
  }

  toggleDay(val, index) {
    if (!this.days[index].from && !this.days[index].to) {
      const base = new Date();
      const from = base.setHours(8, 0, 0, 0);
      const to = base.setHours(17, 0, 0, 0);

      this.days[index].from = new Date(from);
      this.days[index].to = new Date(to);
    }
    // set value of active day
    this.days[index].active = !this.days[index].active;
    this.updateWorkDays();
  }

  timeAction(type, el, event, index) {
    this.days[index][type] = el.selected;
    this.updateWorkDays();
  }

  updateWorkDays() {
    // clear array before set new-profile one
    this.clearFormArray(this.getArrForms('workDays'));
    // set new-profile values
    this.days.map((item: any) => this.getArrForms('workDays').push(this._fb.group(item)));
  }

  clearFormArray(formArray: FormArray) {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  actionTag(type, val) {
    if (type === 'set') {
      const valArr = val.split(' ');
      valArr.map(item => {
        if (item.length > 0) this.tagsArr.push(item);
      });
      this.tagField = '';
    } else if (type === 'remove') {
      this.tagsArr.splice(val, 1);
    }

    this.setFormValue(this.tagsArr, 'tags');
  }

  sendForm(form, draftChange?) {
    this.showSnipper = true;
    const drForm = form.value;

    let dataToSend = {};

    dataToSend = {
      title: drForm.title,
      date: {
        from: this._commonService.organizeDate(drForm.startDate),
        to: this._commonService.organizeDate(drForm.endDate)
      },
      place: drForm.nameLocation,
      location: drForm.address,
      description: drForm.description,
      tags: drForm.tags,
      website: drForm.website,
      phone: drForm.phone,
      schedule: {
        timetable: this._commonService.orgWorkDays(drForm.workDays),
        byApoinment: drForm.appointment
      }
    };

    if (draftChange) {
      dataToSend = {
        isDraft: !this.exhibition.isDraft
      };
    }

    this.updateExh(dataToSend);
  }

  updateBanner(banId) {
    const dataToSend = {
      banner: banId
    };

    this.updateExh(dataToSend, true);
  }

  updateExh(dataToSend, banner?) {
    this._exhibitionsService.updateProfileExhibition(dataToSend, this.currentId).subscribe(res => {
      this.setExhData(res.exhibition);
      this.exhibition = res.exhibition;
      this.showSnipper = false;
      this.snipperPhoto = false;
      // if (!banner) this._router.navigate(['/pages/exhibitions/active']);
    }, error => {
      this.showSnipper = false;
      this.snipperPhoto = false;
      console.error(error);
    });
  }

  setTimes(day, index) {
    this.days = this._commonService.setTimes(day, index, this.days);
    this.updateWorkDays();
  }
}
