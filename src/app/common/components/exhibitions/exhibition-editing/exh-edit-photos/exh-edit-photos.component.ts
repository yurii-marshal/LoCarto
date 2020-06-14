import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FileSystemDirectoryEntry, FileSystemFileEntry, UploadEvent } from 'ngx-file-drop';
import { GALLERY_CONF, NgxImageGalleryComponent } from 'ngx-image-gallery';
import { ArtworkService } from '../../../../../services/artwork.service';
import { Router } from '@angular/router';
import { CommonService } from '../../../../../services/common.service';
import { NbDialogService } from '@nebular/theme';
import { ExhibitionsService } from '../../../../../services/exhibitions.service';

@Component({
  selector: 'ngx-exh-edit-photos',
  templateUrl: './exh-edit-photos.component.html',
  styleUrls: ['./exh-edit-photos.component.scss']
})
export class ExhEditPhotosComponent implements OnInit {
  @ViewChild(NgxImageGalleryComponent) ngxImageGallery: NgxImageGalleryComponent;
  @Input() set data(data: any) {
    this.showMask = false;

    if (!data || (data && data.length < 1)) {
      this.showMask = true;
    } else {
      this.initialFiles = Array.from(data);

      let index = 0;
      this.filesUrl = [];
      data.map((file, i) => {
        if (i === (data.length - 1)) {
          setTimeout(() => {
            this.filesData = data;
            this.filesData.map(orFile => {
              this.filesUrl.push({url: orFile.url});
            });
          }, 200);
        }
      });
    }
  }
  @Input() set exhId(data: any) {
    this.currentId = data;
  }
  @Input() set curRole(val: string) {
    this.role = val;
    this.viewMode = (this.role === 'member' || this.role === undefined);
  }
  @Output() exhUpdate = new EventEmitter<any>();

  public viewMode: boolean;
  public role: string;
  public filesData = [];
  public currentId: any;
  public showMask: boolean;
  public overZone: boolean;
  public showSnipper: boolean;
  public filesInProgress: boolean;
  public currentDelete: any;
  public filesUrl = [];
  public initialFiles: any;
  public galConf: GALLERY_CONF;
  public types = ['doc', 'pdf', 'xls'];

  constructor(
    private _commonService: CommonService,
    private _artworkService: ArtworkService,
    private _router: Router,
    private _dialogService: NbDialogService,
    private _exhibitionsService: ExhibitionsService
  ) { }

  ngOnInit() {
    // gallery configuration
    this.galConf = {
      imageOffset: '0px',
      showDeleteControl: false,
      showImageTitle: false,
    };
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

  movedFiles(event) {
    let droppedId: any;
    let oldIndex: number;

    Object.keys(event.el.attributes).map(key => {
      if (event.el.attributes[key].name === 'data-item') {
        droppedId = event.el.attributes[key].value;
      }
    });
    this.filesData.map((item, i) => {
      if (item._id === droppedId) oldIndex = i;
    });

    this.moveEl(this.filesData, oldIndex, event.dropIndex);

    this.updateFiles(this.filesData);
  }

  moveEl(arr, oldIndex, newIndex) {
    if (newIndex >= arr.length) {
      let k = newIndex - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    return arr;
  };

  openGallery(index: number = 0) {
    this.ngxImageGallery.open(index);
  }

  dropped(event: UploadEvent) {
    this.filesInProgress = true;

    if (this.filesData && this.filesData.length > 0) {
      this.filesData = this.filesData.concat(event.files);
    } else {
      this.filesData = event.files;
    }

    this.filesData.map((droppedFile, index) => {
      // Is it a file?
      if (droppedFile && droppedFile.fileEntry && droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          const fileTarget = new File([file], file.name);

          // Here you can access the real file
          this.filesData[index]['size'] = (file.size / 1000000).toFixed(2);
          this.filesData[index]['name'] = file.name;
          this.filesData[index]['file'] = file;

          const reader = new FileReader();
          reader.onload = (event: ProgressEvent) => {
            this.filesData[index]['tempUrl'] = (<FileReader>event.target).result;
            this.filesData[index]['tempUrl'] = this.encodingURI(this.filesData[index]['tempUrl']);

            this._commonService.autoRotation(this.filesData[index]['tempUrl']).subscribe(rotate => {
              this.filesData[index]['rotation'] = rotate;
              if (rotate && rotate.length > 0) {
                const ind = rotate.match(/\(/).index;
                const newRes = rotate.substring(0);
                this.filesData[index]['unrotation'] = newRes.slice(0, ind) + newRes[ind] + '-' + newRes.slice(ind + 1);
              } else {
                this.filesData[index]['rotation'] = '';
                this.filesData[index]['unrotation'] = '';
              }
            });
          };

          const arrName = file.name.split('.');
          this.types.map(type => {
            if (arrName[arrName.length - 1].toLocaleLowerCase().includes(type)) {
              this.filesData[index]['type'] = type;
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
      this.filesUpload(this.filesData).then((res: any) => {
        this.filesData = res;
        const arrToSend = this._artworkService.organizeFiles(res);

        this.updateFiles(arrToSend);
        this.filesInProgress = false;
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

  updateFiles(files, fromMain?) {
    const dataToSend = {
      files: this.organizeFiles(files, fromMain)
    };

    this._exhibitionsService.updateProfileExhibition(dataToSend, this.currentId).subscribe(res => {
      this.showSnipper = false;
      this.showMask = false;
      this.galleryLinks(res);
      this.exhUpdate.emit();
    }, error => {
      console.error(error);
      this.showSnipper = false;
    });
  }

  organizeFiles(files, fromMain?) {
    let res = [];

    files.map(file => {
      if (file['_id']) res.push(file['_id']);
    });

    return res;
  }

  filesUpload(files) {
    // set status 'in progress'
    this.filesInProgress = true;
    // copy object files
    const tempFiles = Array.from(files);
    // add main file of artwork to send
    // if (this.mainFiles && tempFiles.length > 1) tempFiles.unshift(this.mainFiles);

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

  openModal(copy, modal: TemplateRef<any>, type, index) {
    this.currentDelete = {
      type: 'file',
      title: 'current file',
      index: index,
      question: 'Do you really want remove this file?'
    };

    this._dialogService.open(modal);
  }

  deleteAction(type, ref, current?) {
     this.removeFile(ref, current);
  }

  removeFile(ref, current) {
    this.filesData.splice(current.index, 1);
    let filesToSend = this.filesData;

    if (filesToSend && filesToSend.length < 1) filesToSend = null;

    let filesIds = [];
    if (filesToSend && filesToSend.length > 0) {
      filesToSend.map(file => filesIds.push(file._id));
    } else {
      filesIds = null;
    }

    const dataToSend = {
      files: filesIds
    };

    this._exhibitionsService.updateProfileExhibition(dataToSend, this.currentId).subscribe(res => {
      this.showSnipper = false;
      ref.close();
    }, error => {
      console.error(error);
      ref.close();
      this.showSnipper = false;
    });
  }

  reverseArray(arr, type?) {
    const newArray = [];
    if (type === 'url') {
      this.filesData.map(orFile => {
        const filtered = arr.filter(file => orFile.url === file.url)[0];
        if (filtered) newArray.push(filtered);
      });
    } else {
      this.initialFiles.map(orFile => { // TODO check it
        const filtered = arr.filter(file => orFile === file._id)[0];
        if (filtered) newArray.push(filtered);
      });
    }
    return newArray;
  }

  getUrlFile(fileId, allData?) {
    return new Promise((resolve, reject) => {
      if (fileId) {
        this._artworkService.getFile(fileId).subscribe(res => {
          if (res.file) {
            if (allData) {
              resolve(res.file);
            } else {
              resolve(res.file.url);
            }
          } else {
            resolve();
          }
        }, error => {
          reject(error);
        });
      }
    });
  }

  galleryLinks(file) {
    const obj = {
      url: file.url
    };
    if (this.filesUrl) {
      this.filesUrl.push(obj);
    } else {
      this.filesUrl = [obj];
    }
  }

  photoChange(event, type?) {
    this.filesInProgress = true;
    this._commonService.photoChange(event, (res) => {
      const uploadedFiles = res;
      const tempFiles = Array.from(this.filesData);

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
              this.filesData = data;
              this.updateFiles(data);

              this.filesInProgress = false;
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

  setClassName(name) {
    let res: string;
    if (name) {
      const nameArr = name.split('.');
      this.types.map(type => {
        if (nameArr[nameArr.length - 1].toLocaleLowerCase().includes(type)) {
          res = type;
        }
      });
    }
    return res || '';
  }
}
