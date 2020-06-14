import {Injectable} from '@angular/core';
import {BaseApiService} from './base-api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private apiService: BaseApiService) {
  }

  login(data?) {
    return this.apiService.post('/accounts/login', data);
  }

  reset(data?) {
    return this.apiService.post('/accounts/reset-password', data);
  }

  changePas(data?, accountID?) {
    return this.apiService.post('/accounts/' + accountID + '/set-password', data);
  }

  registration(data?) {
    return this.apiService.post('/accounts', data);
  }

  verify(key, accountId) {
    return this.apiService.get('/accounts/' + accountId + '/verify-email?code=' + key);
  }

  verifyPass(key, accountId) {
    return this.apiService.get('/accounts/' + accountId + '/verify-password-reset?code=' + key);
  }

  forgot(data?) {
    return this.apiService.post('/accounts/reset-password', data);
  }
}
