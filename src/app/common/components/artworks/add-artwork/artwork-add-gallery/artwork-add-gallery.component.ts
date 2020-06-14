import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FileSystemDirectoryEntry, FileSystemFileEntry, UploadEvent, UploadFile } from 'ngx-file-drop';
import { CommonService } from '../../../../../services/common.service';
import { ArtworkService } from '../../../../../services/artwork.service';

@Component({
  selector: 'ngx-artwork-add-gallery',
  templateUrl: './artwork-add-gallery.component.html',
  styleUrls: ['./artwork-add-gallery.component.scss']
})
export class ArtworkAddGalleryComponent implements OnInit {
  @Input() set tab(value: number) {
    this.activeTab = value;
  }
  @Input() set formData(value: any) {
    this.formArtwork = value;
  }
  @Output() activeSet = new EventEmitter<any>();
  @Output() dataToSend = new EventEmitter<any>();
  @Output() filesData = new EventEmitter<any>();
  @Output() firstId = new EventEmitter<any>();

  public files: UploadFile[] = [];
  public filesInProgress: boolean;
  public overZone: boolean;
  public types = ['doc', 'pdf', 'xls'];
  public activeTab: number;
  public formArtwork: any;
  public firstFileId: string;

  constructor(
    public _commonService: CommonService,
    public _artworkService: ArtworkService
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

  changeTab(index) {
    this.activeSet.emit(index);
  }

  sendForm(form) {
    this.dataToSend.emit(form);
  }

  dropped(event: UploadEvent) {
    this.filesInProgress = true;

    if (this.files && this.files.length > 0) {
      this.files = this.files.concat(event.files);
    } else {
      this.files = event.files;
    }
    this.filesData.emit(this.files);

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
        this.filesInProgress = false;
        this.filesData.emit(this.files);
      });
    }, 200);
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

      if (uploadedFiles && uploadedFiles['length'] > 0) {
        Object.keys(uploadedFiles).map(key => {
          if (key !== 'length') {
            tempFiles.push(uploadedFiles[key]);
          }
        });

        this.setRotation(tempFiles).then((tempArr: any) => {
          setTimeout(() => {
            let filesToSend = Array.from(tempArr);

            this.filesUpload(filesToSend).then((data: any) => {
              this.files = data;
              this.filesInProgress = false;
              this.filesData.emit(this.files);
            });
          }, 250);
        });
      }
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

  removeFile(index) {
    this.files.splice(index, 1);
  }

  setMainFile(event) {
    if (event.dropIndex === 0) {
      Object.keys(event.el.attributes).map(key => {
        if (event.el.attributes[key].name === 'data-item') {
          this.firstFileId = event.el.attributes[key].value;
          this.firstId.emit(this.firstFileId);
        }
      });
    }
  }
}
