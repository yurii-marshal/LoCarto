import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { FormBuilder } from '@angular/forms';
import { FileSystemDirectoryEntry, FileSystemFileEntry, UploadEvent, UploadFile } from 'ngx-file-drop';
import { ArtworkService } from '../../services/artwork.service';
import { SketchesService } from '../../services/sketches.service';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-sketch',
  templateUrl: './sketch.component.html',
  styleUrls: ['./sketch.component.scss']
})
export class SketchComponent implements OnInit, OnDestroy {
  public formSketch: any;
  public files: UploadFile[] = [];
  public overZone: boolean;
  public types = ['doc', 'pdf', 'xls'];
  public showSnipper: boolean;
  public firstFileId: string;
  public filesInProgress: boolean;

  constructor(
    private _commonService: CommonService,
    private _fb: FormBuilder,
    private _artworkService: ArtworkService,
    private _sketchesService: SketchesService,
    private _router: Router
  ) { }

  ngOnInit() {
    this._commonService.setHeaderTitle({nav: 'Sketch adding', backUrl: '/pages/artworks/sketches'});
    this.formSketch = this._fb.group({
      title: '',
      description: ''
    });

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

  dropped(event: UploadEvent) {
    this.filesInProgress = true;

    if (this.files && this.files.length > 0) {
      this.files = this.files.concat(event.files);
    } else {
      this.files = event.files;
    }

    this.files.map((droppedFile, index) => {
      // Is it a file?
      if (droppedFile && droppedFile.fileEntry && droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          const fileTarget = new File([file], file.name);

          // Here you can access the real file
          this.files[index]['size'] = (file.size / 1000000).toFixed(2);
          this.files[index]['name'] = file.name;
          this.files[index]['file'] = file;

          const reader = new FileReader();
          reader.onload = (event: ProgressEvent) => {
            this.files[index]['tempUrl'] = (<FileReader>event.target).result;
            this.files[index]['tempUrl'] = this.encodingURI(this.files[index]['tempUrl']);

            this._commonService.autoRotation(this.files[index]['tempUrl']).subscribe(rotate => {
              this.files[index]['rotation'] = rotate;
              if (rotate && rotate.length > 0) {
                const ind = rotate.match(/\(/).index;
                const newRes = rotate.substring(0);
                this.files[index]['unrotation'] = newRes.slice(0, ind) + newRes[ind] + '-' + newRes.slice(ind + 1);
              } else {
                this.files[index]['rotation'] = '';
                this.files[index]['unrotation'] = '';
              }
            });
          };

          const arrName = file.name.split('.');
          this.types.map(type => {
            if (arrName[arrName.length - 1].toLocaleLowerCase().includes(type)) {
              this.files[index]['type'] = type;
            }
          });

          reader.readAsDataURL(fileTarget);
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
      }
    });

    setTimeout(() => {
      this.filesUpload(this.files).then((res: any) => {
        this.files = res;
      });
    }, 200);

    // setTimeout(() => {
    //   this.filesUpload(this.files);
    // }, 200);
  }

  encodingURI(url) {
    return encodeURI(url);
  }

  fileOver(event) {
    if (!this.overZone) this.overZone = true;
  }

  fileLeave(event) {
    if (this.overZone) this.overZone = false;
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

  photoChange(event) {
    this.filesInProgress = true;
    this._commonService.photoChange(event, (res) => {
      const uploadedFiles = res;
      const tempFiles = Array.from(this.files);

      if (uploadedFiles) {
        Object.keys(uploadedFiles).map(key => {
          tempFiles.push(uploadedFiles[key]);
        });


        this.setRotation(tempFiles).then((tempArr: any) => {
          setTimeout(() => {
            this.files = tempArr;
            let filesToSend = Array.from(this.files);

            this.filesUpload(filesToSend).then((data: any) => {
              this.files = data;
            });
          }, 250);
        });
      }
    });

    // if (uploadedFiles) {
    //   Object.keys(uploadedFiles).map(key => {
    //     this.files.push(uploadedFiles[key]);
    //   });
    // }

    // setTimeout(() => {
    //   this.filesUpload(this.files);
    // }, 200);

  }

  removeFile(index) {
    this.files.splice(index, 1);
  }

  sendData(form) {
    this.showSnipper = true;
    const formValue = form.value;

    const locObj = {};
    locObj[formValue.placeLoc] = formValue.namePlaceLoc;

    const dataToSend = {
      title: formValue.title,
      description: formValue.description,
      files: this.organizeFiles()
    };

    this._sketchesService.createSketch(dataToSend).subscribe(res => {
      this.showSnipper = false;
      this._router.navigate(['/pages/artworks/sketches']);
    }, error => {
      console.error(error);
      this.showSnipper = false;
    });
  }

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

  setMainFile(event) {
    if (event.dropIndex === 0) {
      Object.keys(event.el.attributes).map(key => {
        if (event.el.attributes[key].name === 'data-item') {
          this.firstFileId = event.el.attributes[key].value;
        }
      });
    }
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
    this._commonService.setHeaderTitle('');
  }
}
