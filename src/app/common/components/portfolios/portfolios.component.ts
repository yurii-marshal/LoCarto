import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { StorageService } from '../../../services/storage.service';
import { NbDialogService } from '@nebular/theme';
import { PortfolioService } from '../../../services/portfolio.service';
import { ArtworkService } from '../../../services/artwork.service';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'ngx-portfolios',
  templateUrl: './portfolios.component.html',
  styleUrls: ['./portfolios.component.scss']
})
export class PortfoliosComponent implements OnInit, OnDestroy {
  @Input() editMode: boolean;
  @Input() set pointedPortfolios(value: any) {
    if (value && value.length > 0) {
      this.selectPortfolios(value);
    } else {
      this.portfolios.map(portfolio => {
        portfolio.selected = false;
      });
    }
  }
  @Output() selectedItems = new EventEmitter<any>();

  private _currentProfileId: string;
  private _activeModal: TemplateRef<any>;

  public portfolios: any;
  public selectedAll: boolean;
  public countSelected: number;
  public currentPortfolio: any;
  public showMask: boolean;
  public portfolio: any; // TODO TEMP!!!
  public publicPortfolio: any;
  public artworks: any;
  public showSnipper: boolean;
  public currentArtworks: any;
  public artworksId: any;
  public countItemsOnPage = 12; // show 12 artworks on one page
  public maxPage: number;
  public curPage: number = 1;
  public paginationLink = '';

  constructor(
    private _storage: StorageService,
    private _dialogService: NbDialogService,
    private _portfolioService: PortfolioService,
    private _artworkService: ArtworkService,
    private _commonService: CommonService
  ) { }

  ngOnInit() {
    this._currentProfileId = this._storage.get('profile') ? this._storage.get('profile').id : '';
    this.getPortfolios();
  }

  selectPortfolios(data) {
    data.map(id => {
      this.portfolios.map(portfolio => {
        if (id === portfolio._id) portfolio.selected = true;
      });
    });
  }

  getPortfolios(search?) {
    this.showMask = false;
    this._portfolioService.getPortfolioListByProfile(this._currentProfileId).subscribe(res => {
      this.portfolios = res.portfolios;

      if (this.portfolios && this.portfolios.length > 0) {

        this.portfolios.map((item, index) => {
          if (item.isPublic) {
            this.publicPortfolio = this.portfolios.splice(index, 1)[0];
            this.setImages([this.publicPortfolio]);
          }
          item.selected = false;
          item.editMode = false;
        });

        this.setImages(this.portfolios);

        this.getArtworks(1);
      } else {
        this.showMask = true;
      }

    }, error => {
      console.error(error);
    });
  }

  getArtworks(page?) {
    let url: string;
    if (page !== undefined) url = this._commonService.generateUrl(page, this.countItemsOnPage);

    this._artworkService.getArtworks(this._currentProfileId, url).subscribe(res => {
      this.artworks = res.artworks;
      this.artworks.map(artwork => {
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

  getUrlFile(fileId) {
    return new Promise((resolve, reject) => {
      if (fileId) {
        this._artworkService.getFile(fileId).subscribe(res => {
          if (res.file) {
            resolve(res.file.url);
          } else {
            resolve('');
          }
        }, error => {
          reject(error);
        });
      }
    });
  }

  setImages(data) {
    data.map(portfolio => {
      let images = [];
      let index = 0;
      if (portfolio.artworks && portfolio.artworks.length > 0) {
        portfolio.artworks.map(artworkId => {
          this._artworkService.getArtwork(artworkId).subscribe(res => {

            if (res.artwork && res.artwork.files && res.artwork.files.length > 0) {
              this.getUrlFile(res.artwork.files[0]).then(url => {
                this._commonService.autoRotation(url).subscribe(rotate => {
                  if (rotate && rotate.length > 0) {
                    const ind = rotate.match(/\(/).index;
                    const newRes = rotate.substring(0);
                    const objItem = {
                      url: url,
                      rotation: rotate,
                      unrotation: newRes.slice(0, ind) + newRes[ind] + '-' + newRes.slice(ind + 1)
                    };

                    if (images && images.length > 0) {
                      images.push(objItem);
                    } else {
                      images = [objItem];
                    }
                    index++;
                  } else {
                    const objItem = {
                      url: url,
                      rotation: '',
                      unrotation: ''
                    };
                    if (images && images.length > 0) {
                      images.push(objItem);
                    } else {
                      images = [objItem];
                    }
                    index++;
                  }

                  if (index === portfolio.artworks.length) {
                    portfolio.images = images;
                  }
                });

              });

            } else {
              index++;
              if (index === portfolio.artworks.length) {
                portfolio.images = images;
              }
            }
          }, error => {
            console.error(error);
          });
        });
      }

    });
  }

  setRotation(tempArr) {
    return new Promise(resolve => {
      let i = 0;
      tempArr.map((item) => {
        const link = item.tempUrl || item.url;
        if (link) {
          this._commonService.autoRotation(link).subscribe(rotate => {
            item.rotation = rotate;
            if (rotate && rotate.length > 0) {
              const ind = rotate.match(/\(/).index;
              const newRes = rotate.substring(0);
              item.unrotation = newRes.slice(0, ind) + newRes[ind] + '-' + newRes.slice(ind + 1);
            } else {
              // this.resetRotation();
            }
            i++;
            if (tempArr.length - 1 <= i) resolve(tempArr);
          });
        } else {
          i++;
        }
      });
    });
  }

  selectArtworks(value) {
    this.currentArtworks = value;
    this.artworksId = this.currentArtworks.map( artwork => artwork._id);
  }

  addArtworks(ref) {
    this._portfolioService.updatePortfolio(this.currentPortfolio._id, {artworks: this.artworksId}).subscribe(res => {
      this.getPortfolios();
      ref.close();
      this.currentPortfolio = {};
    }, error => {
      console.error(error);
      ref.close();
      this.currentPortfolio = {};
    });
  }

  send(form: NgForm, clear?: boolean) {
    const value = form.value.search;
    if (!clear) {
      if (value && value.length > 0) {
        this.getPortfolios(value);
      } else {
        this.getPortfolios();
      }
    } else {
      form.reset();
      this.getPortfolios();
    }
  }

  openModal(modal: TemplateRef<any>, currentPortfolio?) {
    if (currentPortfolio) {
      this.currentPortfolio = currentPortfolio;
    }
    this._activeModal = modal;
    this._dialogService.open(modal);
  }

  select(index) {
    if (index === -1) {
      this.publicPortfolio.selected = !this.publicPortfolio.selected;
      this.countSelected = this.checkCount(true);
    } else {
      if (this.portfolios[index] && (this.portfolios[index].selected !== undefined)) {
        this.portfolios[index].selected = !this.portfolios[index].selected;
      } else {
        this.portfolios[index].selected = true;
      }
      this.countSelected = this.checkCount();
    }
  }

  checkCount(publicPor?) {
    let selectedArr = [];
    let count = 0;

    if (publicPor) {
      selectedArr.push(this.publicPortfolio);
      count++;
    } else {
      this.portfolios.map(item => {
        if (item.selected) {
          selectedArr.push(item);
          count++;
        }
      });
    }

    this.selectedItems.emit(selectedArr);
    return count;
  }

  selectAll() {
    if (!this.selectedAll) {
      this.portfolios.map(item => {
        item.selected = true;
      });
      this.selectedAll = true;
      this.countSelected = this.portfolios.length;
    } else {
      this.portfolios.map(item => {
        item.selected = false;
      });
      this.selectedAll = false;
      this.countSelected = 0;
    }
  }

  deletePortfolio(portfolio, ref) {
    this._portfolioService.removePortfolio(portfolio._id).subscribe(res => {
      this.getPortfolios();
      this.currentPortfolio = {};
      ref.close();
    }, error => {
      console.error(error);
      this.currentPortfolio = {};
      ref.close();
    });
  }

  newPortfolio(form: NgForm, ref?, publicPor?: boolean) {
    let formVal: any;
    if (form) {
      formVal = form.value;
    }
    const artworks = (this.currentPortfolio && this.currentPortfolio.artworks) ? this.currentPortfolio.artworks : [];

    let dataToSend = {};
    if (publicPor) {
      dataToSend = {
        title: 'Public portfolio',
        isPublic: true,
        artworks: []
      };
    } else {
      dataToSend = {
        title: formVal.title,
        isPublic: false,
        artworks: artworks
      };
    }

    formVal.id ? this.updatePortfolio(dataToSend, formVal.id, ref) : this.createPortfolio(dataToSend, ref);
  }

  createPortfolio(data, ref?) {
    this._portfolioService.createPortfolio(data).subscribe(res => {
      this.getPortfolios();
      if (ref) ref.close();
      this.currentPortfolio = {};
    }, error => {
      console.error(error);
      if (ref) ref.close();
      this.currentPortfolio = {};
    });
  }

  updatePortfolio(data, id, ref?) {
    this._portfolioService.updatePortfolio(id, data).subscribe(res => {
      this.getPortfolios();
      if (ref) ref.close();
      this.currentPortfolio = {};
    }, error => {
      console.error(error);
      if (ref) ref.close();
      this.currentPortfolio = {};
    });
  }

  action() {
  }

  pageChanged(page) {
    this.curPage = page;
    this.getArtworks(page);
  }

  ngOnDestroy() {
    this._commonService.setHeaderTitle('');
  }
}
