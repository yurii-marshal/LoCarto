import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  public isAuthorized = false;
  private storageSub = new Subject<any>();

  constructor() { }

  watchStorage(): Observable<any> {
    return this.storageSub.asObservable();
  }

  get(key: string) {
    return JSON.parse(localStorage.getItem(key));
  }

  set(key: string, data: object) {
    localStorage.setItem(key, JSON.stringify(data));
    this.storageSub.next('changed');
  }

  remove(item: string) {
    localStorage.removeItem(item);
    this.storageSub.next('changed');
  }

  getSetStatusAuthorization (status?: boolean) {
    if (!status) {
      return this.isAuthorized;
    }

    this.isAuthorized = status;
  }
}
