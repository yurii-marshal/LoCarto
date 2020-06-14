import {Injectable} from '@angular/core';
import {BaseSecureApiService} from './api/base-secure.api.service';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {

  constructor(
    private _apiService: BaseSecureApiService
  ) {
  }

  getPortfolioListByProfile(profileId) {
    return this._apiService.get('/profiles/' + profileId + '/portfolios/');
  }

  getPortfolio(id) {
    return this._apiService.get('/portfolios/' + id);
  }

  createPortfolio(data) {
    return this._apiService.post('/portfolios/', data);
  }

  updatePortfolio(id, data) {
    return this._apiService.put('/portfolios/' + id, data);
  }

  removePortfolio(id) {
    return this._apiService.delete('/portfolios/' + id);
  }
}
