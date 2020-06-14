import {Observable, of} from 'rxjs';
import {ErrorObservable} from 'rxjs-compat/observable/ErrorObservable';
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {catchError, filter, switchMapTo} from 'rxjs/operators';
import {AppConfig} from '../../app.config';
import {ProgressHttp} from 'angular-progress-http';
import {CommonService} from '../common.service';
import {StorageService} from '../storage.service';
import {RequestOptions} from '@angular/http';

@Injectable({
  providedIn: 'root'
})
export class BaseSecureApiService {
  private readonly baseUrl: string;
  private options: any;

  constructor(private _httpClient: HttpClient,
              private _progressHttp: ProgressHttp,
              private _config: AppConfig,
              private _commonService: CommonService,
              private _storage: StorageService) {
    this.baseUrl = _config.Server_API;
  }

  get(url: string, params?: HttpParams): Observable<any> {
    return this.inspectToken()
      .pipe(
        filter(res => res === true),
        switchMapTo(this._httpClient.get(this.baseUrl + url, {...this.options, params})),
        catchError(error => ErrorObservable.create(error.error))
      );
  }

  post(url: string, body: string): Observable<any> {
    return this.inspectToken()
      .pipe(
        filter(res => res === true),
        switchMapTo(this._httpClient.post(this.baseUrl + url, body, this.options)),
        catchError(error => ErrorObservable.create(error.error))
      );
  }

  patch(url: string, body: string): Observable<any> {
    return this.inspectToken()
      .pipe(
        filter(res => res === true),
        switchMapTo(this._httpClient.patch(this.baseUrl + url, body, this.options)),
        catchError(error => ErrorObservable.create(error.error))
      );
  }

  put(url: string, body: string): Observable<any> {
    return this.inspectToken()
      .pipe(
        filter(x => x === true),
        switchMapTo(this._httpClient.put(this.baseUrl + url, body, this.options)),
        catchError(error => ErrorObservable.create(error.error))
      );
  }

  delete(url: string) {
    return this.inspectToken()
      .pipe(
        filter(x => x === true),
        switchMapTo(this._httpClient.delete(this.baseUrl + url, this.options)),
        catchError(error => ErrorObservable.create(error.error))
      );
  }

  pushFile(url, data, isRequiredToken?) {
    if (isRequiredToken && !this._storage.get('token')) {
      return;
    }

    return this.inspectToken()
      .pipe(
        filter(res => res === true),
        switchMapTo(
          this._progressHttp.withUploadProgressListener(progress => {
            const fileName = data.get('file').name;
            const line = this._commonService.uploadedLine;
            const selected = line.filter(item => item.name === fileName);
            const dataObj = {name: fileName, progress: progress.percentage};
            const newDataObj = Object.assign({}, dataObj);

            if (selected && selected.length > 0) {
              line.map(file => {
                if (file.name === fileName) file.progress = newDataObj.progress;
              });
            } else {
              line.push(newDataObj);
            }
            this._commonService.setUploadedLine(line);

          }).post(this.baseUrl + url, data, new RequestOptions())
        ),
        catchError(error => ErrorObservable.create(error.error))
      );
  }

  inspectToken(): Observable<boolean> {
    let profileToken = null;
    const token = this._storage.get('token');

    this.options = {
      headers: new HttpHeaders({'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'})
    };

    if (this._storage.get('profile')) {
      profileToken = this._storage.get('profile').id;
      this.options['headers'] = this.options['headers'].append('X-PROFILE-ID', profileToken);
    }

    this.options['headers'] = this.options['headers'].append('X-ACCID', token);

    return of(!!token);
  }
}
