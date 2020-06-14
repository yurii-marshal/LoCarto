import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonService} from '../../services/common.service';
import {ActivatedRoute} from '@angular/router';
import {ExhibitionsService} from '../../services/exhibitions.service';
import {StorageService} from '../../services/storage.service';
import {ExhibitionModel} from '../../models/exhibition.model';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'ngx-exhibitions',
  templateUrl: './exhibitions.component.html',
  styleUrls: ['./exhibitions.component.scss']
})
export class ExhibitionsComponent implements OnInit, OnDestroy {
  public curUrl: string;
  public viewMode: boolean;
  public exhibitions: ExhibitionModel[];
  public showSnipper: any;
  public actData = {
    text: 'Add new exhibition',
    url: '/pages/exhibitions/add'
  };

  public currentProfileId: string;

  constructor(
    private _commonService: CommonService,
    private _activatedRoute: ActivatedRoute,
    private _exhibitionsService: ExhibitionsService,
    private _storage: StorageService,
    private _toastr: ToastrService
  ) {
  }

  ngOnInit() {
    this.currentProfileId = this._storage.get('profile') ? this._storage.get('profile').id : '';
    this.afterUrlCheck();
    setTimeout(() => {
      if (this._commonService.previousRouteUrl === '/pages/exhibitions/add') {
        if (this._commonService.createdItem) {
          this._toastr.success('Exhibition ' + this._commonService.createdItem + ' was created', 'Success');
          this._commonService.createdItem = null;
        }
      }
    });
  }

  getExhibitions(profId?) {
    this.showSnipper = true;
    this._exhibitionsService.getProfileExhibitions(profId).subscribe(res => {
      this.exhibitions = res.exhibitions;
      this.showSnipper = false;
    }, error => {
      console.error(error);
      this.showSnipper = false;
    });
  }

  afterUrlCheck() {
    // emit header title data
    this._commonService.setHeaderTitle({nav: 'Exhibitions', backUrl: '/pages/exhibitions'});

    this.getExhibitions(this.currentProfileId);
  }

  search(event) {

  }

  actionTop(event) {

  }

  ngOnDestroy() {
    this._commonService.setHeaderTitle({});
  }
}
