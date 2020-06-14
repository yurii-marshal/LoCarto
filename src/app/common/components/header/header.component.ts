import {Component, Input, OnDestroy, OnInit} from '@angular/core';

import {NbMenuService, NbSidebarService} from '@nebular/theme';
import {UserService} from '../../../@core/data/users.service';
import {AnalyticsService} from '../../../@core/utils/analytics.service';
import {LayoutService} from '../../../@core/data/layout.service';
import {filter, map} from 'rxjs/operators';
import {ProfileService} from '../../../services/profile.service';
import {StorageService} from '../../../services/storage.service';
import {Router} from '@angular/router';
import {AuthGuardService} from '../../../services/auth-guard.service';
import {CommonService} from '../../../services/common.service';
import {AppConfig} from '../../../app.config';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() position = 'normal';

  public currentProfile: any;
  public profiles: any;
  public currentId: any;
  public pageTitle: any;
  public titleType: any;
  public action: any;
  public showAction: boolean;
  public serverUrl: string;
  public backUrl: string;
  public user: any;
  public profileTipe: any;
  public exited: boolean;

  private _subscriptionStor: Subscription;
  private _subscriptionPro: Subscription;

  constructor(
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private userService: UserService,
    private analyticsService: AnalyticsService,
    private layoutService: LayoutService,
    private _profileService: ProfileService,
    private _storage: StorageService,
    private _router: Router,
    private _authService: AuthGuardService,
    private _commonService: CommonService,
    private _config: AppConfig
  ) {
  }

  ngOnInit() {
    // get server url
    this.serverUrl = this._config.Server_API;

    // set page title
    if (this._commonService.headerTitle) {
      this.pageTitle = this._commonService.headerTitle.nav;
      this.backUrl = this._commonService.headerTitle.backUrl;
    }

    // check page title type arr or string
    this.checkPageTitle(this.pageTitle);

    this._commonService.headerTitleChange.subscribe((value: any) => {
      // set page title
      if (value) {
        this.pageTitle = value.nav;
        this.backUrl = value.backUrl;
      }
      // check page title type arr or string
      this.checkPageTitle(this.pageTitle);
    });

    // set current token
    this.currentId = this._storage.get('token');

    // get user data
    this.getUser();

    // subscribe on changes user data
    // this.userService.getUsers().subscribe((users: any) => this.user = users.nick);

    this.menuService.onItemClick().pipe(
      filter(({tag}) => tag === 'user-menu'),
      map(({item: {title}}) => title),
    )
      .subscribe(title => {
        if (title === 'Log out') this.doLogOut();
      });

    // subscribe to change store data
    this._subscriptionStor = this._storage.watchStorage().subscribe((data: string) => {
      if (this._storage.get('isNavVisible').status && !this.exited) {
        this.getUser();
      }
    });
    this._subscriptionPro = this._commonService.watchProfile().subscribe((data: string) => {
      this.getUser();
    });

    this._commonService.subjectActions.subscribe(value => {
      this.action = value;
      if (this.action.active) {
        this.showhideBar('show');
      }
    });
  }

  checkPageTitle(title) {
    if (typeof title === 'string') {
      this.titleType = 'str';
    } else if (typeof title === 'object') {
      this.titleType = 'arr';
    }
  }

  showhideBar(type: string) {
    if (type === 'show') {
      setTimeout(() => {
        this.showAction = true;
      }, 100);

      setTimeout(() => {
        this.showAction = false;
      }, 4000);
    }
  }

  getUser() {
    // get profiles list data
    this._profileService.getProfilesListOnLogin(this.currentId).subscribe(res => {
      this.profiles = res.profiles.reverse();
      this.getCurrentProfile(res.profiles);
    });
  }

  getCurrentProfile(profiles) {
    // get account data for get info about last active profile
    this._profileService.getAccount({id: this.currentId}).subscribe(res => {
      // get last active Profile id
      const lastProfileId = this._storage.get('profile') ? this._storage.get('profile').id : '';

      if (lastProfileId) {
        // set last active profile
        profiles.map(profile => {
          if (profile._id === lastProfileId) this.currentProfile = profile;
        });
      } else {
        // set default last active profile like a last created profile
        this.currentProfile = profiles[profiles.length - 1];
        if (this.currentProfile && this.currentProfile._id) {
          this.setCurrentProfile(this.currentProfile._id);
        }
      }

      // sort profiles list for show the last created first
      if (this.currentProfile) {
        this.profiles.sort((x, y) => {
          return x._id == this.currentProfile._id ? -1 : (y._id == this.currentProfile._id ? 1 : 0);
        });

        this.profileTipe = this.currentProfile.type.toLowerCase();
        this._commonService.setProType(this.profileTipe);
      }
    });
  }

  setCurrentProfile(profileId) {
    // set new-profile current profile
    this._storage.set('profile', {id: profileId});

    // navigate to edit-profile current profile
    this._router.navigate(['/pages/profile-edit-profile'], {queryParams: {id: profileId}});
  }

  doLogOut() {
    this.exited = true;
    this._storage.remove('token');
    this._storage.remove('acc-email');
    this._storage.remove('profile');
    this._storage.set('isNavVisible', {status: false});

    setTimeout(() => {
      this._router.navigate(['/auth/sign-in']);
    }, 500);
  }

  encodingURI(url) {
    return encodeURI(url);
  }

  ngOnDestroy() {
    this._subscriptionStor.unsubscribe();
    this._subscriptionPro.unsubscribe();
  }
}
