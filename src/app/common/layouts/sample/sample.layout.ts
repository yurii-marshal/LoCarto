import { Component, OnDestroy, OnInit } from '@angular/core';
import { delay, withLatestFrom, takeWhile } from 'rxjs/operators';
import {
  NbMediaBreakpoint,
  NbMediaBreakpointsService,
  NbMenuItem,
  NbMenuService,
  NbSidebarService,
  NbThemeService,
} from '@nebular/theme';

import { StateService } from '../../../@core/data/state.service';
import { CommonService } from '../../../services/common.service';
import { LayoutService } from '../../../@core/data/layout.service';
import { StorageService } from '../../../services/storage.service';

// TODO: move layouts into the framework
@Component({
  selector: 'ngx-sample-layout',
  styleUrls: ['./sample.layout.scss'],
  template: `
    <nb-layout [center]="layout.id === 'center-column'" windowMode><!-- [withScroll]="false" -->
      <nb-layout-header> <!-- class="{{isNavVisible ? 'expanted' : 'compacted'}}" -->
        <ngx-header [position]="sidebar.id === 'start' ? 'normal': 'inverse'"></ngx-header>
      </nb-layout-header>
      <nb-sidebar class="menu-sidebar"
                  state="{{isNavVisible ? 'expanted' : 'compacted'}}"
                   tag="menu-sidebar"
                   responsive
                   [end]="sidebar.id === 'end'">
          <div class="logo-containter">
              <a *ngIf="false" (click)="toggleSidebar()" href="#" class="navigation"><i class="nb-menu"></i></a>
              <div class="logo" (click)="goToHome()"><span>LOC</span>ART<span>O</span></div>
          </div>
        <ng-content select="nb-menu"></ng-content>
      </nb-sidebar>

      <nb-layout-column class="main-content">
        <ng-content select="router-outlet"></ng-content>
      </nb-layout-column>

      <nb-layout-column start class="small" *ngIf="layout.id === 'two-column' || layout.id === 'three-column'">
        <nb-menu [items]="subMenu"></nb-menu>
      </nb-layout-column>

      <nb-layout-column class="small" *ngIf="layout.id === 'three-column'">
        <nb-menu [items]="subMenu"></nb-menu>
      </nb-layout-column>

      <nb-layout-footer>
          <ngx-footer></ngx-footer>
      </nb-layout-footer>

    </nb-layout>
  `,
})
export class SampleLayoutComponent implements OnInit, OnDestroy {
  public toggleNav: boolean;
  subMenu: NbMenuItem[] = [
    {
      title: 'PAGE LEVEL MENU',
      group: true,
    },
    {
      title: 'Buttons',
      icon: 'ion ion-android-radio-button-off',
      link: '/pages/old-ui-features/buttons',
    },
    {
      title: 'Grid',
      icon: 'ion ion-android-radio-button-off',
      link: '/pages/old-ui-features/grid',
    },
    {
      title: 'Icons',
      icon: 'ion ion-android-radio-button-off',
      link: '/pages/old-ui-features/icons',
    },
    {
      title: 'Modals',
      icon: 'ion ion-android-radio-button-off',
      link: '/pages/old-ui-features/modals',
    },
    {
      title: 'Typography',
      icon: 'ion ion-android-radio-button-off',
      link: '/pages/old-ui-features/typography',
    },
    {
      title: 'Animated Searches',
      icon: 'ion ion-android-radio-button-off',
      link: '/pages/old-ui-features/search-fields',
    },
    {
      title: 'Tabs',
      icon: 'ion ion-android-radio-button-off',
      link: '/pages/old-ui-features/tabs',
    },
  ];
  layout: any = {};
  sidebar: any = {};
  public isNavVisible: boolean;
  private alive = true;

  currentTheme: string;

  constructor(protected stateService: StateService,
              protected menuService: NbMenuService,
              protected themeService: NbThemeService,
              protected bpService: NbMediaBreakpointsService,
              protected sidebarService: NbSidebarService,
              private _commonService: CommonService,
              private _layoutService: LayoutService,
              private _storage: StorageService) {
    this.stateService.onLayoutState()
      .pipe(takeWhile(() => this.alive))
      .subscribe((layout: string) => this.layout = layout);

    this.stateService.onSidebarState()
      .pipe(takeWhile(() => this.alive))
      .subscribe((sidebar: string) => {
        this.sidebar = sidebar;
      });

    const isBp = this.bpService.getByName('is');
    this.menuService.onItemSelect()
      .pipe(
        takeWhile(() => this.alive),
        withLatestFrom(this.themeService.onMediaQueryChange()),
        delay(20),
      )
      .subscribe(([item, [bpFrom, bpTo]]: [any, [NbMediaBreakpoint, NbMediaBreakpoint]]) => {

        if (bpTo.width <= isBp.width) {
          this.sidebarService.collapse('menu-sidebar');
        }
      });

    this.themeService.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe(theme => {
        this.currentTheme = theme.name;
    });

    this._storage.watchStorage().subscribe((data:string) => {
      if (this.isNavVisible !== this._storage.get('isNavVisible').status) {
        this.isNavVisible = this._storage.get('isNavVisible').status;
      }
    });
  }

  ngOnInit() {
    if (this._storage.get('isNavVisible') && this._storage.get('isNavVisible').status) {
      this.isNavVisible = true;
    } else {
      this.isNavVisible = false;
    }
  }

  ngOnDestroy() {
    this.alive = false;
  }
  goToHome() {
    this.menuService.navigateHome();
  }
  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.toggleNav = !this.toggleNav;
    // this._layoutService.changeLayoutSize();

    return false;
  }
}
