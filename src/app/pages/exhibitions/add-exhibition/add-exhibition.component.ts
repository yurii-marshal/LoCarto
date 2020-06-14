import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CommonService } from '../../../services/common.service';
import { ExhibitionsService } from '../../../services/exhibitions.service';
import {Router} from '@angular/router';

@Component({
  selector: 'ngx-add-exhibition',
  templateUrl: './add-exhibition.component.html',
  styleUrls: ['./add-exhibition.component.scss']
})
export class AddExhibitionComponent implements OnInit {
  public showSteps: boolean;
  public showSnipper: boolean;
  public finalResult: boolean;
  public activeTab = 0;
  public banner: any;
  public photos: any;
  public users: any;
  public exhId: string;
  public googleData: any;

  public tabs = [
    { title: 'Basic info' },
    { title: 'Banner' },
    { title: 'Photos' },
    { title: 'Member' }
  ]; // 'ADDING_ARTWORK.TABS.CATEGORY'
  public draftFormExhibition = this._fb.group({
    title: '',
    startDate: '',
    endDate: '',
    nameLocation: '',
    address: '',
    preAddress: ''
    // fields: this._fb.array([])
  });
  public formExhibition = this._fb.group({
    description: '',
    tags: '',
    website: '',
    phone: '',
    appointment: '',
    workDays: this._fb.array([]),
    members: this._fb.array([])
  });

  constructor(
    private _router: Router,
    private _commonService: CommonService,
    private _fb: FormBuilder,
    private _exhibitionsService: ExhibitionsService
  ) { }

  ngOnInit() {
  }

  setActiveTab(index, form?) {
    if (index === 0) this.showSteps = false;
    this.activeTab = index;
  }

  setData(varName, data, finalResult?) {
    this[varName] = data;
    if (finalResult) {
      this.createExh(data);
    }
  }

  setFormValue(value, nameProp, index?) {
    // set fields
    const tempObj = {};
    tempObj[nameProp] = value;
    this.formExhibition.patchValue(tempObj);
  }

  createExh(data?) {
    const drForm = this.draftFormExhibition.value;
    const exhForm = this.formExhibition.value;

    const dataToSend = {
      title: drForm.title,
      date: {
        from: this._commonService.organizeDate(drForm.startDate),
        to: this._commonService.organizeDate(drForm.endDate)
      },
      place: drForm.nameLocation,
      location: drForm.address,
      description: exhForm.description,
      tags: exhForm.tags,
      website: exhForm.website,
      phone: exhForm.phone,
      schedule: {
        timetable: this._commonService.orgWorkDays(exhForm.workDays),
        byApoinment: exhForm.appointment
      },
      banner: (this.banner && this.banner.length > 0) ? this.banner[0] : null,
      files: (this.photos && this.photos.length > 0) ? this.photos : [],
      // members: this._commonService.organizeUsersData(data.members),
      admins: this._commonService.organizeUsersData(data.admins),
      artworks: [],
      isSolo: true
    };

    this._exhibitionsService.addProfileExhibition(dataToSend).subscribe(res => {
      this.exhId = res.exhibition._id;
      const members = this._commonService.organizeUsersData(data.members);
      this.saveMembersAdmins(this.exhId, {members: members});
      // this.finalResult = true;
      this._commonService.createdItem = dataToSend.title;
      this._router.navigateByUrl('pages/exhibitions');
    }, error => {
      console.error(error);
    });
  }

  saveMembersAdmins(exhId, data?) {
    Object.keys(data).map(type => {
      if (data[type]) {
        data[type].map(proId => {
          const dataToSend = {profile: proId};
          const typeReq = (type === 'members') ? 'updateExhibitionMembers' : 'exhibitionAdmins';
          this._exhibitionsService[typeReq](dataToSend, exhId).subscribe(res => {

          }, error => {
            console.error(error);
          });
        });
      }
    });
  }

  setInfo(data) {
    this.googleData = data;
  }
}
