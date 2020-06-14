import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../../services/auth/auth.service';

@Component({
  selector: 'ngx-pass',
  templateUrl: './pass.component.html',
  styleUrls: ['./pass.component.scss']
})
export class PassComponent implements OnInit {
  public success: any;
  public error: any;
  public result: any;
  public exist: boolean;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _authService: AuthService
  ) {
  }

  ngOnInit() {
    if (this._route.queryParams['value'].key) {
      this.verify(this._route.queryParams['value'].key, this._route.queryParams['value'].account);
    }
  }

  verify(key: string, accountId) {
    this.result = false;
    this.success = false;
    this.exist = false;
    this.error = false;
    this._authService.verifyPass(key, accountId).subscribe(res => {
      const result = res;
      this.success = true;
      setTimeout(() => {
        this._router.navigate(['/auth/sign-in']);
      }, 1500);
      this.result = true;
    }, error => {
      if (error.error.title.includes('ERR_ACCOUNT_VERIFIED_YET')) {
        this.exist = true;
        setTimeout(() => {
          this._router.navigate(['/auth/sign-in']);
        }, 2000);
      } else {
        this.error = true;
      }
    });
  }
}
