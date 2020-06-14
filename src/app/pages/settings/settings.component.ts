import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { StorageService } from '../../services/storage.service';
import { NbDialogService } from '@nebular/theme';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { FormBuilder } from '@angular/forms';
import {AuthService} from '../../services/auth/auth.service';
import {AccountModel} from '../../models/account.model';
import {ProfileModel} from '../../models/profile.model';

@Component({
  selector: 'ngx-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  private _currentAccount: any;
  private _currentProfile: any;
  private _emailToSend: string;
  public profile: ProfileModel;
  public account;
  public resultPass: boolean;
  public oldPassword: any;
  public newPassword: any;
  public showNewBlock = {success: false, error: false};
  public visibleOld = false;
  public visibleNew = false;
  public accountMode: boolean;
  public showSearchField: boolean;
  public showInvitation: boolean;
  public accounts: AccountModel[];
  public curAccount: AccountModel;
  public curators: any;
  public showSnipper: boolean;
  public showSnipperInvite: boolean;
  public editMode: number;
  public currentCur: any;
  public resultPassErr: boolean;
  public isOwner: boolean;
  public formAccounts = this._fb.group({
    email: '',
    user: '',
    name: ''
  });
  public notifications = {
    news: false,
    communication: false,
    exhibition: false
  };
  private _navArr = [
    {
      title: 'Role settings',
      link: '/pages/settings/role',
      active: false
    },
    {
      title: 'Account settings',
      link: '/pages/settings/account',
      active: false
    }
  ];

  constructor(
    private _commonService: CommonService,
    private _storage: StorageService,
    private _authService: AuthService,
    private _dialogService: NbDialogService,
    private _router: Router,
    private _activatedRoute : ActivatedRoute,
    private _profileService: ProfileService,
    private _fb: FormBuilder
  ) { }

  ngOnInit() {
    this._activatedRoute.url.subscribe(url =>{
      this.afterUrlCheck(url[1].path);
    });
  }

  afterUrlCheck(curUrl) {
    // emit header title data
    this._commonService.setHeaderTitle({nav: this._navArr});

    // set/update current active role into storage
    this._currentAccount = this._storage.get('token');

    // set current profiles
    if (this._storage.get('profile')) {
      this._currentProfile = this._storage.get('profile').id;
    }

    // get settings
    this.getSettings(this._currentAccount);

    // set active needed point in navigation
    if (curUrl === 'role') {
      this._navArr[0].active = true;
      this._navArr[1].active = false;
      this.accountMode = false;

      this.getCurators();
    } else if(curUrl === 'account') {
      this._navArr[0].active = false;
      this._navArr[1].active = true;
      this.accountMode = true;
      this.accounts = undefined;
    }

    // get and set up account data
    this.getAcc();
  }

  getAcc() {
    // get and set up account data
    this._profileService.getAccount({id: this._currentAccount}).subscribe(res => {
      this.account = res.account;
    });
  }

  setFormValue(value, nameProp, index?) {
    // set fields
    const tempObj = {};
    tempObj[nameProp] = value;
    this.formAccounts.patchValue(tempObj);
  }

  getSettings(accId) {
    this._profileService.settings({}, accId).subscribe(res => {
      this.notifications = res.settings.notifications;
    }, error => {
      console.error(error);
    });
  }

  encodingURI(url) {
    return encodeURI(url);
  }

  openModal(modal: TemplateRef<any>, val?, currentCur?) {
    if (val) this._emailToSend = val;
    if (currentCur) this.currentCur = currentCur;
    this._dialogService.open(modal);
  }

  changeEmail(pass, ref?, form?) {
    this.resultPass = false;
    this.resultPassErr = false;

    const dataToSend = {
      email: this._emailToSend,
      password: pass
    };

    this._profileService.changeEmailAccount(dataToSend, this._currentAccount).subscribe(res => {
      this.resultPass = true;
      this.getAcc();
    }, error => {
      this.resultPassErr = true;
      form.reset();
    });
  }

  getCurators() {
    this._profileService.getProfileById(this._currentProfile).subscribe(res => {
      if (res.profile.accounts.owner === this._currentAccount) this.isOwner = true;
      this.prepareAccounts(res.profile.accounts.granted);
    });
  }

  confirmOldPass(value) {
    this.showNewBlock = {success: false, error: false};
    this.oldPassword = '';

    // prepare data to send
    const dataToSend = {
      email: this.account.email.norm,
      password: value
    };

    this._authService.login(dataToSend).subscribe(res => {
      const result = res;

      if (result.account && result.account._id) {
        // this.resPass(this.account.email.norm);
        this.oldPassword = value;
        this.showNewBlock.success = true;
      } else {
        this.showNewBlock.error = true;
      }
    }, error => {
      console.error(error);
    });
  }

  saveNewPass(value, ref) {
    const dataToSend = {
      oldPassword: this.oldPassword,
      newPassword: value
    };

    this._authService.changePas(dataToSend, this._currentAccount).subscribe(res => {
      this.showNewBlock.success = true;
      value = '';
      this.oldPassword = '';
      this.showNewBlock.success = false;
      this.showNewBlock.error = false;
      this.openModal(ref);
      this.getAcc();
    }, error => {
      console.error(error);
    });
  }

  showHidePass(varName) {
    this[varName] = !this[varName];
  }

  toggleDirection(newVal, varName) {
    this.showSnipper = true;
    this.notifications[varName] = newVal;

    const dataToSend = {
      settings: {
        notifications: this.notifications
      }
    };

    this._profileService.settings(dataToSend, this._currentAccount).subscribe(res => {
      this.showSnipper = false;
    }, error => {
      this.showSnipper = false;
      console.error(error);
    });
  }

  actionCurator(type, curator?, index?, val?) {
    if (type === 'edit') {
      this.editMode = index;
    } else if (type === 'remove') {
      this.openModal(val, '', curator);
    } else if (type === 'change') {
      this._profileService.editProfPermissions({name: val}, this._currentProfile, curator.account).subscribe(res => {
        this.editMode = undefined;
        this.prepareAccounts(res.profile.accounts.granted);
      }, error => {
        console.error(error);
      });
    }
  }

  removeRole(curator, ref) {
    this._profileService.removeProfPermissions({}, this._currentProfile, curator.account).subscribe(res => {
      if (ref) ref.close();
      this.editMode = undefined;
      // if (!res.profile.accounts.granted || (res.profile.accounts.granted && res.profile.accounts.granted.length < 1)) {
      //   this.curators = [];
      // } else {
      //   this.prepareAccounts(res.profile.accounts.granted);
      // }
    }, error => {
      console.error(error);
    });
  }

  searchUsers(event) {
    this.showInvitation = false;
    this.curAccount = undefined;
    const dataToSend = {
      email: event
    };

    if (event.length > 2) {
      this._profileService.searchAccounts(dataToSend).subscribe(res => {
        this.accounts = res.accounts;
        if (this.accounts && this.accounts.length < 1) this.showInvitation = true;
      }, error => {
        console.error(error);
      });
    }
  }

  chooseProf(account) {
    this.setFormValue(account, 'user');
    this.setFormValue(account.email.norm, 'email');
    this.curAccount = account;
    this.accounts = [];
  }

  setUser(form, invite?) {
    this.showSnipperInvite = true;
    const formVal = form.value;
    const dataToSend = {
      name: formVal.name
    };

    if (invite) {
      dataToSend['email'] = formVal.email;
    } else {
      dataToSend['account'] = formVal.user._id;
    }

    this._profileService.setProfPermissions(dataToSend, this._currentProfile).subscribe(res => {
      this.showSnipperInvite = false;
      this.curators = [];
      this.prepareAccounts(res.profile.accounts.granted);

      this.setFormValue(undefined, 'email');
      this.setFormValue(undefined, 'user');
      this.curAccount = undefined;
      this.showInvitation = false;
      // this.getCurators();
    }, error => {
      console.error(error);
      this.getCurators();
      this.showSnipperInvite = false;
    });
  }

  prepareAccounts(data) {
    let i = 0;
    if (data) {
      data.reduce(
        (chain, acc) => {
          return chain.then(() => {
            return new Promise(resolve => {
              if (acc.dummy) {
                acc.email = acc.email.norm;
                if (i === data.length - 1 ) {
                  this.curators = data;
                }
                resolve();
                i++;
              } else {
                this._profileService.getAccount({id: acc.account}).subscribe(res => {
                  if (res.account && res.account.email) acc.email = res.account.email.norm;
                  if (i === data.length - 1 ) {
                    this.curators = data;
                  }
                  resolve();
                  i++;
                }, error => {
                  if (i === data.length - 1 ) {
                    this.curators = data;
                  }
                  resolve();
                  i++;
                });
              }
            });
          });
        }, Promise.resolve());
    }
  }

  sendInvite(form) {
    const dataToSend = {
      email: form.value
    };

    // TODO !!!
  }

  ngOnDestroy() {
    this._commonService.setHeaderTitle('');
  }
}
