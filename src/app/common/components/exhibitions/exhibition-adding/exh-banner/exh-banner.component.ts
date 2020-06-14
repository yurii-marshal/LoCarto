import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { CommonService } from '../../../../../services/common.service';
import { ArtworkService } from '../../../../../services/artwork.service';

@Component({
  selector: 'ngx-exh-banner',
  templateUrl: './exh-banner.component.html',
  styleUrls: ['./exh-banner.component.scss']
})
export class ExhBannerComponent implements OnInit {
  @Input() set form(value: any) {
    this.formExhibition = value;
  }
  @Input() set curTab(num: number) {
    this.activeTab = num;
  }
  @Output() setTab = new EventEmitter<boolean>();
  @Output() bannerData = new EventEmitter<any>();

  public formExhibition: FormGroup;
  public activeTab: number;
  public filesInProgress: boolean;
  public banner = {
    file: '',
    name: '',
    url: ''
  };

  constructor(
    private _commonService: CommonService,
    private _artworkService: ArtworkService
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
            this.bannerData.emit(arrToSend);

            this.filesInProgress = false;
          });
        });
      }
    });
  }

  setActiveTab(tab) {
    this.setTab.emit(tab);
  }

  filesUpload(files) {
    // copy object files
    const tempFiles = Array.from(files);

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
}
