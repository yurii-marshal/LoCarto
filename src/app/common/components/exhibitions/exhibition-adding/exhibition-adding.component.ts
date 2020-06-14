import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { CommonService } from '../../../../services/common.service';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-exhibition-adding',
  templateUrl: './exhibition-adding.component.html',
  styleUrls: ['./exhibition-adding.component.scss']
})
export class ExhibitionAddingComponent implements OnInit {
  @Input() set form(value: any) {
    this.draftFormExhibition = value;
  }
  @Input() set curTab(num: number) {
    this.activeTab = num;
  }
  @Output() setTab = new EventEmitter<boolean>();
  @Output() draftCreated = new EventEmitter<boolean>();
  @Output() addressData = new EventEmitter<any>();

  public draftFormExhibition: FormGroup;
  public todayDate = new Date();
  public fullDateCreation = true;
  public changeYear = false;
  public existExh: boolean = false;
  public exhibition: any;
  public activeTab: number;

  constructor(
    private _titleService: Title,
    private _commonService: CommonService,
    private _router: Router
  ) { }

  ngOnInit() {
    this._titleService.setTitle( 'Locarto - Exhibition adding' );
    this._commonService.setHeaderTitle({nav: 'Exhibition adding', backUrl: '/pages/exhibitions'});
  }

  sendForm(form) {
    this.checkExisting('somedatafor req'); // TODO !!!!!
    // output after creation
    // this.draftCreated.emit(true);
  }

  selectDate(datepicker, value, nameVar) {
    const tempObj = {};
    tempObj[nameVar] = value;
    this.draftFormExhibition.patchValue(tempObj);

    this.changeYear = !this.changeYear;
    // close if need only year view
    if (!this.fullDateCreation) datepicker.close();
  }

  changeTypeDate(event) {
    this.fullDateCreation = !event.target.checked;
    // reset fields after change type of date
    this.draftFormExhibition.patchValue({startDate: '', endDate: ''});
  }

  handleAddressChange(address: Address, nameVar) {
    this.addressData.emit(address);

    address.types.map((type) => {
      if (type === 'museum' || type === 'art_gallery') {
        if (address.name) this.draftFormExhibition.patchValue({nameLocation: address.name});
        if (nameVar === 'address') this.draftFormExhibition.patchValue({preAddress: address.formatted_address});
      }
    });

    const tempObj = {};
    tempObj[nameVar] = address.formatted_address;
    this.draftFormExhibition.patchValue(tempObj);

  }

  checkExisting(val) {
    this.draftCreated.emit(true);
    this.setActiveTab(this.activeTab + 1);
  }

  actionExh(id, type) {

    // TODO after requests
    this._router.navigate(['/pages/profile']);
  }

  setActiveTab(tab) {
    this.setTab.emit(tab);
  }
}
