import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PortfolioService } from '../../services/portfolio.service';
import { ArtworkService } from '../../services/artwork.service';
import { NbDialogService } from '@nebular/theme';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'ngx-portfolio-single',
  templateUrl: './portfolio-single.component.html',
  styleUrls: ['./portfolio-single.component.scss']
})
export class PortfolioSingleComponent implements OnInit, OnDestroy {
  private _sub: any;
  private _currentProfileId: any;

  public currentId: number;
  public artworks: any;
  public artworksPopup: any;
  public currentArtworks: any;
  public showSnipper: boolean;
  public showMask: boolean;
  public pointedArtworks: any;
  public countItemsOnPage = 12; // show 12 artworks on one page
  public maxPage: number;
  public curPage: number = 1;
  public paginationLink = '';

  constructor(
    private _commonService: CommonService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _portfolioService: PortfolioService,
    private _artworkService: ArtworkService,
    private _dialogService: NbDialogService,
    private _storage: StorageService
  ) { }

  ngOnInit() {
    this._currentProfileId = this._storage.get('profile') ? this._storage.get('profile').id : '';
    this._commonService.setHeaderTitle({nav: 'Portfolio title', backUrl: '/pages/artworks/portfolios'});
    this._sub = this._route.params.subscribe(params => {
      this.currentId = params['id'];
      this.getPortfolio();
      this.getAllArtworks(1);
    });
  }

  getAllArtworks(page?) {
    let url: string;
    if (page !== undefined) url = this._commonService.generateUrl(page, this.countItemsOnPage);

    this._artworkService.getArtworks(this._currentProfileId, url).subscribe(res => {
      this.artworksPopup = res.artworks;
      this.artworksPopup.map(artwork => {
        if (artwork.files && artwork.files.length > 0) {
          this.getUrlFile(artwork.files[0]).then(res => {
            artwork.image = res;
          });
        } else {
          artwork.image = '';
        }
        artwork.editMode = false;
      });

      // set max page for pagination
      this.maxPage = Math.ceil(res.count / this.countItemsOnPage);
    }, error => {
      console.error(error);
    });
  }

  getPortfolio() {
    this.showMask = false;
    this._portfolioService.getPortfolio(this.currentId).subscribe(res => {
      if (res.portfolio.isPublic) {
        this._commonService.setHeaderTitle({nav: 'Public portfolio', backUrl: '/pages/artworks/portfolios'});
      } else {
        this._commonService.setHeaderTitle({nav: res.portfolio.title, backUrl: '/pages/artworks/portfolios'});
      }
      const artworks = res.portfolio.artworks;
      this.pointedArtworks = artworks;
      const resArr = [];
      if (artworks) {
        artworks.map(artworkId => {
          if (artworkId) {
            this._artworkService.getArtwork(artworkId).subscribe(res => {
              resArr.push(res.artwork);
              if (artworks.length === resArr.length) this.setArtworks(resArr.filter(art => art));
            }, error => {
              console.error(error);
            });
          } else {
            this.showMask = true;
          }
        })
      }
    }, error => {
      console.error(error);
    });
  }

  setArtworks(data) {
    const tempArr = data;

    let i = 0;
    tempArr.reduce(
      (chain, artwork) => {
        return chain.then(() => {
          return new Promise(resolve => {
            artwork.editMode = false;
            if (artwork.files && artwork.files.length > 0) {
              this.getUrlFile(artwork.files[0]).then(res => {
                artwork.image = res;
                if (tempArr.length - 1 === i) this.artworks = tempArr;
                resolve();
                i++;
              });
            } else {
              artwork.image = '';
              if (tempArr.length - 1 === i) this.artworks = tempArr;
              resolve();
              i++;
            }
          });
        });
      }, Promise.resolve());
  }


  getUrlFile(fileId) {
    return new Promise((resolve, reject) => {
      this._artworkService.getFile(fileId).subscribe(res => {
        if (res.file) {
          resolve(res.file.url);
        } else {
          resolve('');
        }
      }, error => {
        reject(error);
      });
    });
  }

  openModal(modal: TemplateRef<any>) {
    this._dialogService.open(modal);
  }

  selectArtworks(value) {
    this.currentArtworks = value;
  }

  addArtworks(ref) {
    this.showSnipper = true;
    const artworks = [];
    this.currentArtworks.map(item => artworks.push(item._id));
    this._portfolioService.updatePortfolio(this.currentId, {artworks: artworks}).subscribe(res => {
      this.actionsAfterRes(ref);
    }, error => {
      console.error(error);
      this.actionsAfterRes(ref);
    });
  }

  send(form) {

  }

  actionsAfterRes(ref?) {
    this.getPortfolio();
    this.getAllArtworks(1);
    if (ref) ref.close();
    this.currentArtworks = '';
    this.showSnipper = false;
  }

  deleteArtwork(artwork) {
    this.showSnipper = true;
    const filteredArtworks = this.artworks.filter(id => id._id !== artwork._id);

    const artworks = [];
    filteredArtworks.map(item => artworks.push(item._id));

    this._portfolioService.updatePortfolio(this.currentId, {artworks: artworks}).subscribe(res => {
      this.actionsAfterRes();
    }, error => {
      console.error(error);
      this.actionsAfterRes();
    });
  }

  pageChanged(page) {
    this.curPage = page;
    this.getAllArtworks(page);
  }

  ngOnDestroy() {
    this._sub.unsubscribe();
    this._commonService.setHeaderTitle('');
  }
}
