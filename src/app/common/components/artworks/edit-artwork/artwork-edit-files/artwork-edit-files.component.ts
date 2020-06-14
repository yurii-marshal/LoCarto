import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { GALLERY_CONF, NgxImageGalleryComponent } from 'ngx-image-gallery';

@Component({
  selector: 'ngx-artwork-edit-files',
  templateUrl: './artwork-edit-files.component.html',
  styleUrls: ['./artwork-edit-files.component.scss']
})
export class ArtworkEditFilesComponent implements OnInit {
  @ViewChild(NgxImageGalleryComponent) ngxImageGallery: NgxImageGalleryComponent;

  @Input() set mainFilesData(value: any) {
    this.mainFiles = value;
  }
  @Input() set files(value: any) {
    this.filesData = value;
  }
  @Input() set filesUrlData(value: any) {
    this.filesUrl = value;
  }

  @Output() updateArtworkLoc = new EventEmitter<any>();
  @Output() openModalEvent = new EventEmitter<any>();
  @Output() updateFilesEvent = new EventEmitter<any>();
  @Output() photoChangeEvent = new EventEmitter<any>();

  public mainFiles: any;
  public filesUrl: any;
  public canMoves = true;
  public filesData = [];
  public bottomOfPage: boolean;
  public galConf: GALLERY_CONF;
  public types = ['doc', 'pdf', 'xls'];

  constructor() { }

  ngOnInit() {
    // gallery configuration
    this.galConf = {
      imageOffset: '0px',
      showDeleteControl: false,
      showImageTitle: false
    };

    setTimeout(() => {
      this.canMoves = true;
    }, 500);
  }

  openGallery(index: number = 0) {
    this.ngxImageGallery.open(index);
  }

  movedFiles(event) {
    this.canMoves = false;
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

    if (event.dropIndex !== oldIndex) {
      this.moveEl(this.filesData, oldIndex, event.dropIndex);

      this.updateFiles(this.filesData);
    } else {
      setTimeout(() => {
        this.canMoves = true;
      }, 500);
    }
  }

  updateFiles(files, fromMain?) {
    this.updateFilesEvent.emit({files: files, fromMain: fromMain});
  }

  openModal(copy?, modal?: string, type?, index?) {
    this.openModalEvent.emit({
      copy: copy,
      modal: modal,
      type: type,
      index: index
    })
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
  }

  @HostListener('window:scroll', ['$event']) doSomething(event) {
    this.checkOffset();
  }

  checkOffset() {
    let footerEl = document.getElementsByTagName('ngx-footer');
    let buttonHeight = 55;
    let windowHeight = document.body.scrollHeight;
    let pageHeight = window.innerHeight;
    let scroll = window.pageYOffset;

    if ((windowHeight - pageHeight - buttonHeight) <= scroll) {
      this.bottomOfPage = true;
    } else if (this.bottomOfPage) {
      this.bottomOfPage = false;
    }
  }

  photoChange(event, type?) {
    this.photoChangeEvent.emit({event: event, type: type});
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
