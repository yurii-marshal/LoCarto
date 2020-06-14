import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SketchesService } from '../../../services/sketches.service';
import { ArtworkService } from '../../../services/artwork.service';
import { NgForm } from '@angular/forms';
import { GALLERY_CONF, GALLERY_IMAGE, NgxImageGalleryComponent } from 'ngx-image-gallery';
import { NbDialogService } from '@nebular/theme';

@Component({
  selector: 'ngx-edit-sketch',
  templateUrl: './edit-sketch.component.html',
  styleUrls: ['./edit-sketch.component.scss']
})
export class EditSketchComponent implements OnInit, OnDestroy {
  // get reference to gallery component
  @ViewChild(NgxImageGalleryComponent) ngxImageGallery: NgxImageGalleryComponent;
  public currentId: number;
  public sketch: any;
  public images: any;
  public conf: GALLERY_CONF;
  private _sub: any;
  public showSnipper: boolean;
  public showMask: boolean;
  public currentSketch: any;

  constructor(
    private _commonService: CommonService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _sketchesService: SketchesService,
    private _artworkService: ArtworkService,
    private _dialogService: NbDialogService
  ) {
    // gallery configuration
    this.conf = {
      imageOffset: '0px',
      showDeleteControl: false,
      showImageTitle: false,
    };
  }

  ngOnInit() {
    this._sub = this._route.params.subscribe(params => {
      this.currentId = params['id'];
      this.getSketch();
    });
  }

  getSketch(val?) {
    this._sketchesService.getSketch(this.currentId).subscribe(res => {
      this.sketch = res.sketch;
      this._commonService.setHeaderTitle({nav: this.sketch.title, backUrl: '/pages/artworks/sketches'});
      this.sketch.files.map(file => {
        this.getUrlFile(file).then((res) => {
          const obj = {
            url: res
          };
          if (this.sketch.images) {
            this.sketch.images.push(obj);
          } else {
            this.sketch.images = [obj];
          }

          this.setRotation(this.sketch.images).then((tempArr) => {
            setTimeout(() => {
              this.sketch.images = tempArr;
            }, 250);
          });
        });
      });

    }, error => {
      console.error(error);
    });
  }

  getUrlFile(fileId) {
    return new Promise((resolve, reject) => {
      this._artworkService.getFile(fileId).subscribe(res => {
        if (res.file) {
          resolve(res.file.url);
        } else {
          resolve('');
        }
      }, error => {
        reject(error);
      });
    });
  }

  send(form: NgForm, clear?: boolean) {
    const value = form.value.search;
    if (!clear) {
      if (value && value.length > 0) {
        this.getSketch(value);
      } else {
        this.getSketch();
      }
    } else {
      form.reset();
      this.getSketch();
    }
  }

  openModal(modal: TemplateRef<any>, currentSketch?, index?) {
    if (currentSketch) {
      this.currentSketch = currentSketch;
      this.currentSketch.index = index;
    }
    this._dialogService.open(modal);
  }

  photoChange(event) {
    const filesData = [];
    const uploadedFiles = this._commonService.photoChange(event);

    if (uploadedFiles) {
      Object.keys(uploadedFiles).map(key => {
        filesData.push(uploadedFiles[key]);
      });
    }

    setTimeout(() => {
      this.filesUpload(filesData).then(res => {
        this.updateFiles(filesData);
      });
    }, 200);
  }

  filesUpload(files) {
    return new Promise((resolve, reject) => {
      files.map((file, index) => {
        if (!file['_id']) {
          const formData = new FormData();
          let toSend;
          if (file.file) {
            toSend = file['file'];
          } else {
            toSend = file;
          }
          formData.append('file', toSend);
          this._artworkService.pushFile( formData).subscribe(res => {
            file['_id'] = res.json()['tempfile']._id;
            if (index === (files.length - 1)) resolve(res['file']);
          }, error => {
            reject(error);
          });
        }
      });

    });
  }

  updateFiles(files) {
    const dataToSend = {
      id: this.currentId,
      files: this.organizeFiles(files)
    };

    this._sketchesService.updateSketch(dataToSend).subscribe(res => {
      this.getSketch();
      this.showSnipper = false;
    }, error => {
      console.error(error);
      this.showSnipper = false;
    });
  }

  organizeFiles(files) {
    let res = this.sketch.files || [];

    files.map(file => {
      if (file['_id']) res.push(file['_id']);
    });

    return res;
  }

  openGallery(index: number = 0) {
    this.ngxImageGallery.open(index);
  }

  encodingURI(url) {
    return encodeURI(url);
  }

  deleteFile(ref) {
    this.showSnipper = true;
    // prepear files arr
    this.currentSketch.files.splice(this.currentSketch.index, 1);
    const files = this.currentSketch.files;

    const dataToSend = {
      id: this.currentSketch._id,
      files: files
    };

    this._sketchesService.updateSketch(dataToSend).subscribe(res => {
      this.getSketch();
      ref.close();
      this.showSnipper = false;
    }, error => {
      console.error(error);
      ref.close();
      this.showSnipper = false;
    });
  }

  setRotation(tempArr) {
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

  ngOnDestroy() {
    this._sub.unsubscribe();
    this._commonService.setHeaderTitle('');
  }
}
