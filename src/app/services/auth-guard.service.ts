import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Router} from '@angular/router';
import {Http} from '@angular/http';
import {StorageService} from './storage.service';
import {AppConfig} from '../app.config';
import {CommonService} from './common.service';
import {ProgressHttp} from 'angular-progress-http';
import {ProfileService} from './profile.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  public isNavVisible: boolean;
  private _currentProfile: boolean;

  constructor(
    private _router: Router,
    private _config: AppConfig,
    private _http: Http,
    private http: ProgressHttp,
    private _storage: StorageService,
    private _commonService: CommonService,
    private _profileService: ProfileService,
  ) {
    this.isNavVisible = this._commonService.isNavVisible;
  }

  canActivate(route: ActivatedRouteSnapshot) {
    const token = this._storage.get('token');
    const currentRoute = route.url[0].path;
    let hasProfiles;

    if (token && token.length > 0) {
      return new Promise((resolve, reject) => {
        this._profileService.getProfilesListOnLogin(token).subscribe(res => {
          if (res) {
            hasProfiles = res.profiles.length > 0;

            if (this._storage.get('profile') && this._storage.get('profile').id) {
              this._currentProfile = this._storage.get('profile') ? this._storage.get('profile').id : '';
            } else {
              this._currentProfile = res.profiles[res.profiles.length - 1];
            }
          }
          resolve();
        });
      })
        .then(() => {
          if (currentRoute === 'sign-in') {
            this._storage.set('isNavVisible', {status: true});

            if (hasProfiles) {
              this._router.navigate(['/pages/profile-edit-profile'], {queryParams: {id: this._currentProfile['_id']}});
            } else {
              this._router.navigate(['/pages/profile-adding']);
            }
          } else {
            if (hasProfiles) {
              this._storage.set('isNavVisible', {status: true});
            } else {
              this._storage.set('isNavVisible', {status: false});
            }

            return true;
          }
        });
    } else {
      if (currentRoute !== 'sign-in') {
        this._router.navigate(['/auth/sign-in']);
      } else {
        return true;
      }
    }
  }
}
