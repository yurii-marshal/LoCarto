import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'ngx-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
// how to use
// <app-pagination *ngIf="curPage && maxPage && maxPage > 1 && !empty" [currentPage]="curPage" [maxPage]="maxPage" [category]="'vacancies'"></app-pagination>
export class PaginationComponent implements OnInit {
  public categoryName: string;
  public curPage: number;
  public max: number;
  public beforeCurrent: any;
  public afterCurrent: any;
  public routerUrl: string;

  @Input()
  set currentPage(page: number) {
    let needInit: boolean;
    if (this.curPage) needInit = true;
    this.curPage = page;
    if (needInit) this.ngOnInit();
  }
  @Input()
  set maxPage(max: number) {
    let needInit: boolean;
    if (this.max) needInit = true;
    this.max = max;
    if (needInit) this.ngOnInit();
  }
  @Input()
  set link(link: string) {
    let needInit: boolean;

    if (this.routerUrl) needInit = true;
    this.routerUrl = link;
    if (needInit) this.ngOnInit();
  }
  @Output() pageNumb = new EventEmitter<any>();

  constructor(
    private _route: ActivatedRoute,
    @Inject(DOCUMENT) private _document: Document
  ) { }

  ngOnInit() {
    this.beforeCurrent = [];
    this.afterCurrent = [];

    for (let i = 1; i < this.curPage; i++) {
      this.beforeCurrent.push(i);
    }

    for (let i = this.curPage + 1; i <= this.max; i++) {
      this.afterCurrent.push(i);
    }

    if ( this.curPage > 4 ) {
      this.beforeCurrent = this.beforeCurrent.slice(-2);
    }

    if ( this.curPage + 3 < this.max) {
      this.afterCurrent = this.afterCurrent.slice(0, 2);
    }
    this._route.queryParams.subscribe( queryParams => {
      window.scrollTo(0, 0);
    });
  }

  changePage(page) {
    this.pageNumb.emit(page);
  }
}
