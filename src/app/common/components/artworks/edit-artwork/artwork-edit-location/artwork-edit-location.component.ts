import { Component, EventEmitter, HostListener, Input, OnInit, Output, TemplateRef } from '@angular/core';

@Component({
  selector: 'ngx-artwork-edit-location',
  templateUrl: './artwork-edit-location.component.html',
  styleUrls: ['./artwork-edit-location.component.scss']
})
export class ArtworkEditLocationComponent implements OnInit {
  @Input() set formData(value: any) {
    this.formLocations = value;
  }
  @Input() set curCat(value: any) {
    if (value) this.selectedCat = value;
  }
  @Input() set artStoragesData(value: any) {
    if (value) this.artStorages = value;
  }
  @Input() set editions(value: any) {
    if (value) this.editionsData = value;
  }
  @Input() set showStepsStatus(value: any) {
    this.showSteps = value;
  }
  @Input() set typeStepStatus(value: any) {
    this.typeStep = value;
  }
  @Input() set photographyData(value: any) {
    this.photography = value;
  }

  @Output() updateArtworkLoc = new EventEmitter<any>();
  @Output() openModalEvent = new EventEmitter<any>();
  @Output() setNextEvent = new EventEmitter<any>();
  @Output() setNewEditionsEvent = new EventEmitter<any>();

  public formLocations: any;
  public selectedCat: any;
  public artStorages: any;
  public editionsData: any;
  public showSteps: any;
  public typeStep: any;
  public bottomOfPage: boolean;
  public photography: boolean;

  public places = [
    { title: 'Not printed yet', id: 'notPrinted'},
    { title: 'Not chosen', id: 'notChosen'},
    { title: 'Sold', id: 'sold'},
    { title: 'Available', id: 'available'}
  ];

  constructor() { }

  ngOnInit() {
  }

  setFormValueLoc(value, nameProp) {
    const tempObj = {};
    tempObj[nameProp] = value;
    this.formLocations.patchValue(tempObj);
  }

  sendDataLoc(form) {
    this.updateArtworkLoc.emit(form);
  }

  setNext(type) {
    this.setNextEvent.emit(type)
  }

  setNewEditions(event, i) {
    this.setNewEditionsEvent.emit({event: event, i: i});
  }

  openModal(copy?, modal?: string, type?, index?) {
    this.openModalEvent.emit({
      copy: copy,
      modal: modal,
      type: type,
      index: index
    })
  }

  setPlaceholder(place) { // TODO should be remove
    let res: string;
    switch (place) {
      case 'In storage':
        res ='Storage name';
        break;
      case 'In collection':
        res = 'Collector`s name';
        break;
      case 'In commissions':
        res = 'Museum, gallery, etc';
        break;
      default:
        res = 'Place name';
        break;
    }
    return res;
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
}
