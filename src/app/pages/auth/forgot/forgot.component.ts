import {Component, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Title} from '@angular/platform-browser';
import {AuthService} from '../../../services/auth/auth.service';

@Component({
  selector: 'ngx-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.scss']
})
export class ForgotComponent implements OnInit {
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
  public user: any;
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

  requestPass(form: NgForm) {
    this.showMessages.error = false;
    this.errors = [];
    this.showSnipper = true;

    this._authService.forgot({email: form.value.email}).subscribe(res => {
      this.showMessages.success = true;
      form.reset();
      this.showSnipper = false;
    }, (err) => {
      if (err.error) {
        this.showSnipper = false;
        if (err.error.error.title.includes('ERR_NO_ACCOUNT')) {
          this.showMessages.error = true;
          this.errors.push('Account with this e-mail doesn\'t exist');
        }
      }
    });
  }
}
