import {Injectable} from '@angular/core';
import {BaseSecureApiService} from './api/base-secure.api.service';

@Injectable({
  providedIn: 'root'
})
export class ExhibitionsService {

  constructor(
    private _apiService: BaseSecureApiService
  ) {
  }

  getProfileExhibitions(id) {
    return this._apiService.get('/profiles/' + id + '/exhibitions');
  }

  actionExh(id) {
    return this._apiService.get('/exhibitions2/' + id);
  }

  bulkExh(data) {
    return this._apiService.post('/exhibitions2/bulk', data);
  }

  addProfileExhibition(data) {
    return this._apiService.post('/exhibitions2/', data);
  }

  updateProfileExhibition(data, exhId) {
    return this._apiService.put('/exhibitions2/' + exhId, data);
  }

  addArtwork(data?, exhId?, proId?) {
    return this._apiService.post('/exhibitions2/' + exhId + '/members/' + proId + '/artworks', data);
  }

  addToExhibition(data, exhId, proId, artId) {
    return this._apiService.put('/exhibitions2/' + exhId + '/members/' + proId + '/artworks/' + artId, data);
  }

  removeExhibition(data, exhId, proId, artId) {
    return this._apiService.delete('/exhibitions2/' + exhId + '/members/' + proId + '/artworks/' + artId);
    // return this._apiService.delete('/exhibitions2/' + exhId + '/members/' + proId + '/artworks/' + artId, data);
    // TODO ??????????????
  }

  deleteExhibition(id) {
    return this._apiService.delete('/exhibitions2/' + id);
  }

  removeExhibitionMembers(exhId, proId) {
    return this._apiService.delete('/exhibitions2/' + exhId + '/members/' + proId);
  }

  updateExhibitionMembers(data, id) {
    return this._apiService.post('/exhibitions2/' + id + '/members', data);
  }

  exhibitionAdmins(data, exhId) {
    return this._apiService.post('/exhibitions2/' + exhId + '/admins', data);
  }

  searchExhibition(id, data) {
    return this._apiService.get('/exhibitions2/searches?query=' + data.val + '&profile=' + id);
  }
}
