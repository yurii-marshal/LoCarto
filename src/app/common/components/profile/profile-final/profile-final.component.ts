import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../../../services/storage.service';

@Component({
  selector: 'ngx-profile-final',
  templateUrl: './profile-final.component.html',
  styleUrls: ['./profile-final.component.scss']
})
export class ProfileFinalComponent implements OnInit {
  @Input() set id(value: any) {
    this.createdId = value;
  }

  public createdId: any;

  constructor(
    private _storage: StorageService,
    private _router: Router
  ) { }

  ngOnInit() {
  }

  setCurrentProfile(profileId) {
    this._storage.set('profile', {id: profileId});
    this._router.navigate(['/pages/profile-edit-profile'], {queryParams: {id: profileId}});
  }
}
