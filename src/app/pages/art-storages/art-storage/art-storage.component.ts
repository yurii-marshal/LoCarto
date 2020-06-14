import {Component, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {StorageService} from '../../../services/storage.service';
import {AuthGuardService} from '../../../services/auth-guard.service';
import {NbDialogService} from '@nebular/theme';
import {ArtStorageService} from '../../../services/art-storage.service';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {CommonService} from '../../../services/common.service';
import {ArtworkService} from '../../../services/artwork.service';
import {PortfolioService} from '../../../services/portfolio.service';
import {ArtStorageModel} from '../../../models/art-storage.model';
import {ArtworkModel} from '../../../models/artwork.model';

@Component({
  selector: 'ngx-art-storage',
  templateUrl: './art-storage.component.html',
  styleUrls: ['./art-storage.component.scss']
})
export class ArtStorageComponent implements OnInit, OnDestroy {
  public artworks;
  public artworksPopup: any;
  public pointedArtworks = [];
  public showMask: boolean;
  public showSnipper: boolean;
  public currentId: number;
  public currentArtworks: any;
  public artworkToDelete: any;
  public artworksId = [];
  public artStorage: ArtStorageModel;
  public artworkWithoutEditions: any;
  public artworkWithEditions: any;
  public editionsMode: boolean;
  public selectedEditions: any;
  public portfoliosId: any;
  public selectedStorage: any;
  public selectedArtworks: any;
  public countItemsOnPage = 12; // show 12 artworks on one page
  public maxPage: number;
  public curPage: number = 1;
  public paginationLink = '';
  public activeArt = 0;

  private _sub: any;
  private _currentProfileId: number;

  constructor(
    private _route: ActivatedRoute,
    private _artStorageService: ArtStorageService,
    private _storage: StorageService,
    private _dialogService: NbDialogService,
    private _authService: AuthGuardService,
    private _commonService: CommonService,
    private _artworkService: ArtworkService,
    private _portfolioService: PortfolioService
  ) {
  }

  ngOnInit() {
    this._currentProfileId = this._storage.get('profile') ? this._storage.get('profile').id : '';
    this._sub = this._route.params.subscribe(params => {
      this.currentId = params['id'];
      this.artStorageData();
      this.getArtworks(this.currentId);
      this.getAllArtworks(1);
    });
  }

  artStorageData() {
    this._artStorageService.getStorage(this.currentId).subscribe(res => {
      this.artStorage = res.artstorage;
      this._commonService.setHeaderTitle({nav: this.artStorage.title, backUrl: '/pages/art-storages'});
    }, error => {
      console.error(error);
      this._commonService.setHeaderTitle({nav: 'Art storage', backUrl: '/pages/art-storages'});
    });
  }

  getArtworks(id) {
    this.showSnipper = true;
    this.showMask = false;
    let tempArr = [];

    this._artworkService.getArtworksByArtstorages(id).subscribe(res => {
      if (res.artworks && res.artworks.length < 1) this.artworks = [];
      this.showSnipper = false;
      tempArr = res.artworks;

      let i = 0;
      tempArr.reduce(
        (chain, artwork) => {
          return chain.then(() => {
            return new Promise(resolve => {

              this.pointedArtworks.push(artwork._id);
              this.artworksId.push(artwork._id);

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

    }, error => {
      console.error(error);
      this.showSnipper = false;
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

  send(form: NgForm) {

  }

  selectArtworks(value, modal?, deleteModal?) {
    this.currentArtworks = value.artworks;
    if (value.type === 'remove') {
      // value.artworks.map(artwork => {
      //   this.deleteArtwork(artwork, deleteModal);
      // }); // OLD version
      this.deleteArtwork(value.artworks, deleteModal);

    } else if (value.type === 'storage') {
      this.currentArtworks = value.artworks;
      this.artworkWithEditions = this.currentArtworks.filter(artwork => artwork.copies);
      this.openModal(modal);
    }
  }

  selectArtworksPopUp(value, modal?) {
    this.currentArtworks = value;
  }

  addArtworks(currentSto, ref, selectedArtworks?) {
    this.editionsMode = false;
    this.artworkWithEditions = this.currentArtworks.filter(artwork => artwork.copies);
    this.artworkWithEditions = this.currentArtworks.filter(artwork => artwork.copies);

    if (this.artworkWithEditions.length > 0) {
      this.editionsMode = true;
    } else { // withoutEditions
      this.changeArtworks(this.currentArtworks, currentSto, ref);
    }
  }

  openModal(modal: TemplateRef<any>) {
    this.activeArt = 0;
    this.editionsMode = false;
    this._dialogService.open(modal);
  }

  chooseEditions(currentSto, ref, deleteMode?, moveMode?) {
    const arrArtworks = deleteMode ? 'artworkToDelete' : 'artworkWithEditions';
    if (!deleteMode) {
      this.artworkWithoutEditions = this.currentArtworks.filter(artwork => !artwork.copies);
      this.changeArtworks(this.artworkWithoutEditions, currentSto, ref, moveMode);
    }

    let artwork = this[arrArtworks][this.activeArt];

    if (artwork) {

      let dataToSend = {
        id: artwork._id
      };

      if (!deleteMode) {
        dataToSend['editions'] = this.organizeEditions(artwork.copies, currentSto, moveMode);
      } else {
        dataToSend['editions'] = this.selectedEditions[artwork._id];
      }

      this._artworkService.updateArtwork(dataToSend).subscribe(res => {
        if (!deleteMode) { // add
          if (this.activeArt === this.artworkWithEditions.length - 1) {
            this.editionsMode = false;
            this.artworkWithEditions = '';
            this.artworkWithoutEditions = '';
            this.getArtworks(this.currentId);
            ref.close();
          }

        } else { // delete
          if (this.activeArt === this.artworkToDelete.length - 1) {
            this.artworkToDelete = '';
            this.getArtworks(this.currentId);
            ref.close();
          }

        }
        this.activeArt++;
      }, error => {
        console.error(error);
        this.showSnipper = false;
      });
    }

  }

  selectCopy(event, copy, artwork) {
    copy.checked = event.target.checked;
  }

  changeArtworks(data, currentSto, ref, moveMode?) {
    data.map((artwork, index) => {
      const dataToSend = {
        id: artwork ? artwork._id : ''
      };

      if (moveMode) {
        if (artwork.location && artwork.location.artstorage === this.currentId) {
          dataToSend['location'] = {artstorage: this.selectedStorage._id};
        } else {
          dataToSend['location'] = artwork.location;
        }
      } else {
        dataToSend['location'] = {artstorage: this.currentId};
      }

      this._artworkService.updateArtwork(dataToSend).subscribe(res => {

        if (index === data.length - 1) {
          this.getArtworks(this.currentId);
          ref.close();
        }
      }, error => {
        console.error(error);
        this.showSnipper = false;
      });
    });
  }

  organizeEditions(editions, currentSto?, moveMode?) {
    let res = [];
    let tempObj = {};
    editions.map((item: any) => {
      let locObj;
      if (item.checked) {
        locObj = {artstorage: this.currentId};
      } else if (moveMode) {
        if (item.location && item.location.artstorage === this.currentId) {
          locObj = {artstorage: this.selectedStorage._id};
        } else {
          locObj = item.location;
        }
      } else {
        locObj = item.location;
      }
      tempObj = item;
      tempObj['location'] = locObj;

      res.push(tempObj);
    });

    return res;
  }

  deleteArtwork(artworks, modalEl?: TemplateRef<any>) {
    this.showSnipper = true;
    let artworksWithoutEditions = [];
    let artworksWithEditions = [];
    // const filteredArtwork = this.artworks.filter(id => id._id === artwork._id);

    if (!Array.isArray(artworks)) artworks = [artworks];

    const filteredArtworks = this.artworks.filter(id => {
      const exs = artworks.filter(art => id._id === art._id);
      return exs && exs.length > 0;
    });

    filteredArtworks.map(artwork => {
      if (artwork.copies) {
        artworksWithEditions.push(artwork);
      } else {
        artworksWithoutEditions.push(artwork);
      }
    });

    if (artworksWithEditions && artworksWithEditions.length > 0) { // (filteredArtwork[0] && filteredArtwork[0].copies)
      this.showSnipper = false;

      this.artworkToDelete = artworksWithEditions;
      this.openModal(modalEl);
    }

    if (artworksWithoutEditions && artworksWithoutEditions.length > 0) { // remove artwork without editions

      artworksWithoutEditions.map(art => {
        const dataToSend = {
          id: art._id,
          location: null
        };

        this._artworkService.updateArtwork(dataToSend).subscribe(res => {
          this.getArtworks(this.currentId);
          this.showSnipper = false;
        }, error => {
          console.error(error);
          this.showSnipper = false;
        });
      });
    }
  }

  checkedEditions(editions) {
    this.selectedEditions = editions;
  }

  storageSelected(storage) {
    this.selectedStorage = storage;
  }

  addToStorage(ref, storage) {
    this.addArtworks(storage, ref, this.selectedArtworks);
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
