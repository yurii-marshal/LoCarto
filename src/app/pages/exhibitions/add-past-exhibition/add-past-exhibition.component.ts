import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { CommonService } from '../../../services/common.service';
import { ExhibitionsService } from '../../../services/exhibitions.service';
import { StorageService } from '../../../services/storage.service';
import { ProfileService } from '../../../services/profile.service';

@Component({
  selector: 'ngx-add-past-exhibition',
  templateUrl: './add-past-exhibition.component.html',
  styleUrls: ['./add-past-exhibition.component.scss']
})
export class AddPastExhibitionComponent implements OnInit {

  public pastFormExhibition = this._fb.group({
    type: '',
    title: '',
    place: '',
    city: '',
    country: '',
    from: ''
  });
  public types = ['Group', 'Solo'].map((item: any) => item = {title: item, val: item.toLocaleLowerCase()});
  public currYear: any;
  public changeYear = false;
  public finalResult: boolean;
  public showSnipper: boolean;
  public soloExh: any;
  public groupExh: any;
  public currentProfileId: string;
  public exhId: any;

  private _activeProfile: any;

  constructor(
    private _fb: FormBuilder,
    private _titleService: Title,
    private _commonService: CommonService,
    private _exhibitionsService: ExhibitionsService,
    private _storage: StorageService,
    private _profileService: ProfileService
  ) { }

  ngOnInit() {
    this.currentProfileId = this._storage.get('profile') ? this._storage.get('profile').id : '';
    this._titleService.setTitle( 'Locarto - Exhibition adding' );
    this._commonService.setHeaderTitle({nav: 'Exhibition adding', backUrl: '/pages/exhibitions'});
    this.currYear = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    this.getExhibitions(this.currentProfileId);
    this.getCurrentProfile(this._storage.get('profile').id);
  }

  getCurrentProfile(profileId) {
    this._profileService.getProfileById(profileId).subscribe(res => {
      this._activeProfile = res.profile;
      this._activeProfile.creator = true;
      this._activeProfile.editMode = false;
    });
  }

  getExhibitions(profId?) {
    const today = new Date();
    this.showSnipper = true;
    this._exhibitionsService.getProfileExhibitions(profId).subscribe(res => {
      const exhibitions = res.exhibitions; // TODO temp solution!
      this.soloExh = exhibitions.filter(item  => {
          if (!item.isDraft && item.isSolo) {
            if (new Date(item.date.to).getTime() < today.getTime()) return true;
          }
      });
      this.groupExh = exhibitions.filter(item  => {
          if (!item.isDraft && !item.isSolo) {
            if (new Date(item.date.to).getTime() < today.getTime()) return true;
          }
      });
      this.showSnipper = false;
    }, error => {
      console.error(error);
      this.showSnipper = false;
    });
  }

  setFormValue(value, nameProp, index?) {
    // set fields
    const tempObj = {};
    tempObj[nameProp] = value;
    this.pastFormExhibition.patchValue(tempObj);
  }

  selectDate(datepicker, varName, event) {
    this.setFormValue(event, varName);
    this.changeYear = !this.changeYear;
    datepicker.close();
  }

  sendForm(form) {
    this.showSnipper = true;
    const exhForm = form.value;

    const dataToSend = {
      title: exhForm.title,
      isSolo: exhForm.type === 'solo',
      isDraft: false,
      place: exhForm.place,
      date: {
        from: this._commonService.organizeDate(exhForm.from),
        to: this._commonService.organizeDate(exhForm.from)
      },
      location: exhForm.city + (exhForm.city ? ', ' : '') + exhForm.country,
      admins: this._commonService.organizeUsersData([this._activeProfile])
    };

    this._exhibitionsService.addProfileExhibition(dataToSend).subscribe(res => {
      this.exhId = res.exhibition._id;
      form.reset();
      this.getExhibitions(this.currentProfileId);
      this.showSnipper = false;
    }, error => {
      console.error(error);
      this.showSnipper = false;
    });
  }

  fileChange(event) {
    this.showSnipper = true;
    const target = event.target || event.srcElement;
    const uploadedFiles = target.files;

    const formData = new FormData();

    formData.append('file', uploadedFiles[0]);

    this._exhibitionsService.bulkExh(formData).subscribe(res => {
      this.getExhibitions(this.currentProfileId);
      this.showSnipper = false;
    }, error => {
      console.error(error);
      this.showSnipper = false;
    });
  }
}
