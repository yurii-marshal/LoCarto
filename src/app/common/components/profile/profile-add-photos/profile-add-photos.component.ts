import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonService } from '../../../../services/common.service';
import { ProfileService } from '../../../../services/profile.service';
import { StorageService } from '../../../../services/storage.service';

@Component({
  selector: 'ngx-profile-add-photos',
  templateUrl: './profile-add-photos.component.html',
  styleUrls: ['./profile-add-photos.component.scss']
})
export class ProfileAddPhotosComponent implements OnInit {
  @Input() set tab(value: any) {
    this.activeTab = value;
  }

  @Output() finalResult = new EventEmitter<any>();
  @Output() dataToSend = new EventEmitter<any>();
  @Output() dataFiles = new EventEmitter<any>();
  @Output() changeTab = new EventEmitter<any>();

  public activeTab: any;
  public showSnipper: boolean;
  public showSnipperAvatar: boolean;
  public showSnipperBanner: boolean;
  public filesInProgress: boolean;
  public profileFileUrl: any;
  public bannerFileUrl: any;
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

  constructor(
    private _commonService: CommonService,
    private _profileService: ProfileService,
    private _storage: StorageService
  ) { }

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
        });

      }
    });
  }

  encodingURI(url) {
    return encodeURI(url);
  }

  setActiveTab(index, form?: NgForm) {
    // check form before allow set new-profile tab active
    if (form && form.valid) {
      this.activeTab = index;
    }
    // if it is not tab - allow set new-profile tab as active
    if (!form) this.activeTab = index;

    // emmit data to parent
    this.dataFiles.emit({avatar: this.avatar, banner: this.banner});
    this.changeTab.emit(this.activeTab);
  }

  sendData() {
    this.dataToSend.emit({avatar: this.avatar, banner: this.banner});
  }
}
