import {Injectable} from '@angular/core';
import {BaseSecureApiService} from './api/base-secure.api.service';
import {BaseApiService} from './auth/base-api.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(
    private _apiService: BaseSecureApiService,
    private _signApiService: BaseApiService
  ) {
  }

  getProfileOnLogin(id) {
    return this._signApiService.get('/profiles/' + id);
  }

  getProfilesListOnLogin(id) {
    return this._signApiService.get('/accounts/' + id + '/profiles');
  }

  getAccount(data) {
    return this._signApiService.get('/accounts/' + data.id);
  }

  addProfile(data) {
    return this._apiService.post('/profiles', data);
  }

  editProfile(data, id) {
    return this._apiService.put('/profiles/' + id, data);
  }

  getProfileById(id) {
    return this._apiService.get('/profiles/' + id, null);
    // return this._apiService.get('/profiles/' + id, null, true); TODO ??????
  }

  photos(data, id, link) {
    return this._apiService.pushFile('/profiles/' + id + '/' + link, data);
  }

  searchUsers(data) {
    return this._apiService.get('/profiles/searches?email=' + data.email);
  }

  // searchAccounts(data) { TODO ??????????
  //   return this._apiService.post('/accounts/searches?email=' + data.email, data);
  // }

  searchAccounts(data) {
    return this._apiService.get('/accounts/searches?email=' + data.email);
  }

  changeEmailAccount(data, accountID) {
    return this._apiService.post('/accounts/' + accountID + '/change-email', data);
  }

  editProfPermissions(data, profileID, accountID) {
    return this._apiService.put('/profiles/' + profileID + '/accounts/' + accountID, data);
  }

  removeProfPermissions(data, profileID, accountID) {
    return this._apiService.delete('/profiles/' + profileID + '/accounts/' + accountID);
    // return this._apiService.delete('/profiles/' + profileID + '/accounts/' + accountID, data); TODO ????
  }

  setProfPermissions(data, profileID) {
    return this._apiService.post('/profiles/' + profileID + '/accounts/', data);
  }

  getProfiles(id) {
    return this._apiService.get('/accounts/' + id + '/profiles');
  }

  setProfiles(id, data) {
    return this._apiService.post('/accounts/' + id + '/last-active-profile', data);
  }

  settings(data, accountId) {
    return this._apiService.get('/accounts/' + accountId + '/settings', data);
  }
}
