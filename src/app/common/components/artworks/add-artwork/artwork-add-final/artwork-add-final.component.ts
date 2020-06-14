import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../../../../services/storage.service';

@Component({
  selector: 'ngx-artwork-add-final',
  templateUrl: './artwork-add-final.component.html',
  styleUrls: ['./artwork-add-final.component.scss']
})
export class ArtworkAddFinalComponent implements OnInit {
  @Input() set id(value: any) {
    this.createdId = value;
  }

  public createdId: any;
  public profileId: any;

  constructor(
    public _storage: StorageService,
    public _router: Router
  ) { }

  ngOnInit() {
    this.profileId = this._storage.get('profile') ? this._storage.get('profile').id : '';
  }

  setCurrentProfile(profileId) {
    this._storage.set('profile', {id: profileId});
    this._router.navigate(['/pages/profile-edit'], {queryParams: {id: profileId}});
  }
}
