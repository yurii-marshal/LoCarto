import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { animate, style, transition, trigger } from '@angular/animations';
import { AuthService } from '../../../services/auth/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { StorageService } from '../../../services/storage.service';

@Component({
  selector: 'ngx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({height: 0, opacity: 0}),
            animate('1s ease-out',
              style({height: 300, opacity: 1}))
          ]
        ),
        transition(
          ':leave',
          [
            style({height: 300, opacity: 1}),
            animate('1s ease-in',
              style({height: 0, opacity: 0}))
          ]
        )
      ]
    )
  ]
})
export class LoginComponent implements OnInit {
  public service: any;
  public options: any;
  public cd: any;
  public router: any;
  public showMessages = {
    success: false,
    error: false
  };
  public submitted = false;
  public errors = [];
  public messages = [];
  public userLogin = {
    email: null,
    password: null
  };
  public userRegistration = {email: ''};
  public showSnipper: boolean;
  public tabTitle = this._storage.get('tab') || 'Sign In';

  constructor(
    private _profileService: ProfileService,
    private _authService: AuthService,
    private _storage: StorageService,
    private _router: Router,
    private _titleService: Title
  ) {
  }

  ngOnInit() {
    // set meta-tag title
    this._titleService.setTitle('Locarto Professional');
    // set base structure of userLogin obj
    this.userLogin = {
      email: '',
      password: ''
    };
    this.userRegistration = {email: ''};
  }

  login(form: NgForm) {
    // reset variables
    this.showMessages.error = false;
    this.showSnipper = true;
    this.errors = [];

    // prepare data to send
    const dataToSend = {
      email: form.value.email,
      password: form.value.password
    };

    // clear form on view
    form.reset();

    this._authService.login(dataToSend).subscribe(res => {
      const result = res;

      if (result.account && result.account._id) {
        // set token
        this._storage.set('token', result.account._id);
        this._storage.set('acc-email', result.account.email.real);

        // need check before redirect
        this.getUser(result.account._id);
      } else {
        // set error status
        this.showSnipper = false;
        this.showMessages.error = true;
        this.errors.push('Email or password incorrect');
      }
    }, error => {
      // set error status
      if (error.error.error.title.includes('ERR_ACCOUNT_NOT_VERIFIED')) {
        this.showMessages.error = true;
        this.errors.push('Please check your e-mail and verify your account.');
      } else {
        this.showMessages.error = true;
        this.errors.push('Email or password incorrect');
      }
      this.showSnipper = false;
    });
  }

  register(form: NgForm) {
    this.errors = [];
    this.showMessages.success = false;
    this.showMessages.error = false;
    this.showSnipper = true;
    const dataToSend = {
      email: form.value.email
    };

    if (form.value.email.length > 0) {
      this._authService.registration(dataToSend).subscribe(res => {
        this.showMessages.success = true;
        form.reset();
        this.showSnipper = false;
      }, error => {
        this.showSnipper = false;
        this.showMessages.error = true;
        if (error.error.error.title.includes('Unrouteable address')) {
          this.errors.push('Not valid e-mail.');
        } else if (error.error.error.title.includes('ERR_EMAIL_IS_BUSY')) {
          this.errors.push('E-mail is already exist');
        } else if (error.error.error.title.includes('ERR_BAD_EMAIL') && dataToSend.email.length > 0) {
          this.errors.push('Please enter a valid email!');
        }
      });
    } else {
      this.showSnipper = false;
      this.showMessages.error = true;
      this.errors.push('Email is required!');
    }
  }

  getUser(currentId) {
    // get profiles list data
    this._profileService.getProfileOnLogin(currentId).subscribe(res => {
      const profiles = res.profiles;

      if (profiles && profiles.length > 0) {
        // redirect to artworks page
        this._router.navigate(['/pages/artworks/all']);
      } else {
        // redirect to profile page
        this._router.navigate(['/pages/profile-edit-profile']);
      }
    });
  }

  changeTab(ev) {
    this.showMessages.error = false;
    this._storage.set('tab', ev.tabTitle);
  }
}
