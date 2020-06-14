import { AfterContentInit, Component, Input, OnDestroy, OnInit } from '@angular/core';

import {MENU_ITEMS} from './pages-menu';
import {Router} from '@angular/router';
import {CommonService} from '../services/common.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'ngx-pages',
  template: `
    <ngx-sample-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-sample-layout>
  `,
})
export class PagesComponent implements OnInit, AfterContentInit, OnDestroy {
  menu = MENU_ITEMS;
  private _subscription: Subscription;
  private subMenuList = ['My CV'];

  constructor(
    private _router: Router,
    private _commonService: CommonService
  ) {
  }

  ngOnInit() {
    this._subscription = this._commonService.watchType().subscribe(type => {
      // TODO - need extra check url for menu collector
      if (type === 'collector') {
        this.menu = this.menu.filter(item => item.title.toLowerCase() !== 'exhibitions');
      } else if (type === 'artist') {
        this.menu = MENU_ITEMS;
      }
    });

    this._router.events.subscribe((event: any) => {
      if (event.url) {
        if (event.url !== this._commonService.currentRouteUrl) {
          this._commonService.setPreviousRouteUrl(event.url);
        }
        if (event.url === '/pages/profile'
          || event.url.includes('profile-edit-profile')
          || event.url.includes('profile-adding')
          || event.url.includes('profile-new-profile')) {
          this.changeSelected();
        }
      }
    });
  }

  changeSelected() {
    this.menu.map(item => {
      item.selected = false;
    });
  }

  ngAfterContentInit() {
    let menuItems = [];
    const sidebarDOM = document.getElementsByClassName('menu-item');
    setTimeout(() => {
      menuItems = Array.from(sidebarDOM);
      menuItems.forEach((menuItemDOM) => {
        this.subMenuList.forEach((subMenu) => {
          if (menuItemDOM.textContent.startsWith(subMenu)) {
            const subMenuDOM = menuItemDOM.getElementsByClassName('menu-items');
            setTimeout(() => {
              const bounding = subMenuDOM[0].getBoundingClientRect();
              if (bounding.bottom > (window.innerHeight || document.documentElement.clientHeight)) {
                subMenuDOM[0].style.top =
                  ((window.innerHeight || document.documentElement.clientHeight) - bounding.bottom) + 'px';
              }
            });
          }
        });
      });
    });
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
