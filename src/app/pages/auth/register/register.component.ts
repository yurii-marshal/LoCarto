import {Component, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Title} from '@angular/platform-browser';
import {AuthService} from '../../../services/auth/auth.service';

@Component({
  selector: 'ngx-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  public service: any;
  public options: any;
  public cd: any;
  public router: any;
  public redirectDelay = 0;
  public showMessages = {
    success: false,
    error: false
  };
  public strategy = '';
  public submitted = false;
  public errors = [];
  public messages = [];
  public user: any;
  public socialLinks = [];
  public showSnipper: boolean;

  constructor(
    private _authService: AuthService,
    private _titleService: Title
  ) {
  }

  ngOnInit() {
    this._titleService.setTitle('Locarto Professional');
    this.user = {
      email: '',
      terms: ''
    };
  }

  getConfigValue(val) {

  }

  register(form: NgForm) {
    this.errors = [];
    this.showMessages.success = false;
    this.showMessages.error = false;
    this.showSnipper = true;
    const dataToSend = {
      email: form.value.email
    };

    this._authService.registration(dataToSend).subscribe(res => {
      this.showMessages.success = true;
      form.reset();
      this.showSnipper = false;
    }, error => {
      if (error.error.title.includes('Unrouteable address')) {
        this.showMessages.error = true;
        this.errors.push('Not valid e-mail.');
      }

      if (error.error.title.includes('ERR_EMAIL_IS_BUSY')) {
        this.showMessages.error = true;
        this.errors.push('E-mail is already exist');
      }
      this.showSnipper = false;
    });
  }
}
