import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { ArtworkService } from '../../services/artwork.service';
import { StorageService } from '../../services/storage.service';
import {ArtworkModel} from '../../models/artwork.model';

@Component({
  selector: 'ngx-art-works',
  templateUrl: './art-works.component.html',
  styleUrls: ['./art-works.component.scss']
})
export class ArtWorksComponent implements OnInit, OnDestroy {
  public curUrl: string;
  public showSnipper = true;
  public artworks: ArtworkModel[];
  public countItemsOnPage = 11; // show 11 artworks on one page
  public maxPage: number;
  public curPage: number = 1;
  public curSort: any;
  public paginationLink = '/pages/artworks/all';

  private _currentProfileId: any;

  constructor(
    private _activatedRoute : ActivatedRoute,
    private _commonService: CommonService,
    private _artworkService: ArtworkService,
    private _storage: StorageService,
    private _router: Router,
    private _route: ActivatedRoute
  ) { }

  ngOnInit() {
    let onInit = true;
    this.curPage = parseFloat(this._route.queryParams['value'].page);

    if (this._storage.get('profile')) {
      this._currentProfileId = this._storage.get('profile').id;
    }

    this._activatedRoute.url.subscribe(url => {
      this.curPage = 1;
      this.afterUrlCheck(url[1].path);

      this._route.queryParams.subscribe( queryParams => {
        if (queryParams.page && !onInit) {
          if (this._route.queryParams['value'].page) {
            this.curPage = parseFloat(this._route.queryParams['value'].page);
            this.getArtworks(this._route.queryParams['value'].page, this.curSort);
          }
        }
      });

      if (this._route.queryParams['value'].page) {
        if (!onInit) {
          this.curPage = parseFloat(this._route.queryParams['value'].page);
          this.getArtworks(this._route.queryParams['value'].page, this.curSort);
        }
      }
      // else {
        // this.getArtworks(1);
      // }
    });

    onInit = false;
  }

  getArtworks(page?, sort?, filter?) {
    this.showSnipper = true;
    let url: string;
    let tempArr = [];
    if (page !== undefined) url = this._commonService.generateUrl(page, this.countItemsOnPage, sort, filter);
    this._artworkService.getArtworks(this._currentProfileId, url).subscribe(res => {
      if (!res.artworks || (res.artworks && res.artworks.length < 1)) {
        this.artworks = [];
        this.showSnipper = false;
      }
      tempArr = res.artworks;
      let i = 0;

      tempArr.reduce(
        (chain, artwork) => {
          return chain.then(() => {
            return new Promise(resolve => {
              artwork.editMode = false;
              if (artwork.files && artwork.files.length > 0) {
                this.getUrlFile(artwork.files[0]).then(res => {
                  artwork.image = res;
                  if (tempArr.length - 1 === i) {
                    this.artworks = tempArr;
                    this.showSnipper = false;
                  }
                  resolve();
                  i++;
                });
              } else {
                artwork.image = '';
                if (tempArr.length - 1 === i) {
                  this.artworks = tempArr;
                  this.showSnipper = false;
                }
                resolve();
                i++;
              }
            });
          });
      }, Promise.resolve());


      this.maxPage = Math.ceil(res.count / this.countItemsOnPage);
    }, error => {
      console.error(error);
    });
  }

  getUrlFile(fileId) {
    return new Promise((resolve, reject) => {
      if (fileId) {
        this._artworkService.getFile(fileId).subscribe(res => {
          if (res.file) {
            resolve(res.file.url);
          } else {
            reject('');
          }
        }, error => {
          reject(error);
        });
      }
    });
  }

  afterUrlCheck(curUrl) {
    this.curUrl = curUrl;
    if (this.curUrl !== 'all') this.showSnipper = false;
    // emit header title data
    this._commonService.setHeaderTitle({
      nav:[
        {
          title: 'All artworks',
          link: '/pages/artworks/all',
          active: this.curUrl === 'all'
        },
        {
          title: 'Portfolios',
          link: '/pages/artworks/portfolios',
          active: this.curUrl === 'portfolios'
        },
        {
          title: 'Sketches',
          link: '/pages/artworks/sketches',
          active: this.curUrl === 'sketches'
        },
        {
          title: 'Tags',
          link: '/pages/artworks/tags',
          active: this.curUrl === 'tags'
        }
      ]
    });
  }

  setSort(sort) {
    this.curSort = sort;
    this.getArtworks(this.curPage, sort);
  }

  setFilter(filter) {
    this.getArtworks(this.curPage, this.curSort, filter);
  }

  ngOnDestroy() {
    this._commonService.setHeaderTitle('');
  }
}
