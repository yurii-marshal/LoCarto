import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {ProgressHttp} from 'angular-progress-http';
import {AppConfig} from '../../app.config';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BaseApiService {
  private readonly baseUrl: string;

  private options = {
    headers: new HttpHeaders({'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'})
  };

  constructor(private _httpClient: HttpClient,
              private _progressHttp: ProgressHttp,
              private _config: AppConfig) {
    this.baseUrl = _config.Server_API;
  }

  get(url: string, params?: HttpParams): Observable<any> {
    return this._httpClient.get(this.baseUrl + url, {...this.options, params});
  }

  post(url: string, body: string): Observable<any> {
    return this._httpClient.post(this.baseUrl + url, body, this.options);
  }

  delete(url: string) {
    return this._httpClient.delete(this.baseUrl + url, this.options);
  }
}
