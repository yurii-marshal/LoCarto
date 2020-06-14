import {Injectable} from '@angular/core';
import {BaseSecureApiService} from './api/base-secure.api.service';

@Injectable({
  providedIn: 'root'
})
export class SketchesService {

  constructor(
    private _apiService: BaseSecureApiService
  ) {
  }

  getSketchesByProfile(profileId) {
    return this._apiService.get('/profiles/' + profileId + '/sketches/');
  }

  getSketch(id) {
    return this._apiService.get('/sketches/' + id);
  }

  createSketch(data) {
    return this._apiService.post('/sketches/', data);
  }

  updateSketch(data) {
    return this._apiService.put('/sketches/' + data.id, data);
  }

  removeSketch(id) {
    return this._apiService.delete('/sketches/' + id);
  }
}
