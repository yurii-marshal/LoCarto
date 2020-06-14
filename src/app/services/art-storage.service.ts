import {Injectable} from '@angular/core';
import {BaseSecureApiService} from './api/base-secure.api.service';

@Injectable({
  providedIn: 'root'
})
export class ArtStorageService {

  constructor(
    private _apiService: BaseSecureApiService
  ) {
  }

  getProfileStorages(id, data?) {
    return this._apiService.get('/profiles/' + id + '/artstorages', data);
  }

  addProfileStorage(data) {
    return this._apiService.post('/artstorages/', data);
    // return this._apiService.post('/artstorages/', data, true); TODO ???????
  }

  updateStorage(data) {
    return this._apiService.put('/artstorages/' + data.id, data);
  }

  getStorage(id) {
    return this._apiService.get('/artstorages/' + id);
  }

  deleteStorage(id) {
    return this._apiService.delete('/artstorages/' + id);
  }

  searchStorages(id, data) {
    return this._apiService.get('/artstorages/searches?query=' + data.val + '&profile=' + id);
  }
}
