import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ArtStorageService} from '../../services/art-storage.service';
import {StorageService} from '../../services/storage.service';
import {NbDialogService} from '@nebular/theme';
import {AuthGuardService} from '../../services/auth-guard.service';
import {CommonService} from '../../services/common.service';
import {ArtworkService} from '../../services/artwork.service';
import {Address} from 'ngx-google-places-autocomplete/objects/address';
import {ProfileService} from '../../services/profile.service';
import {ArtStorageModel} from '../../models/art-storage.model';
import {ArtworkModel} from '../../models/artwork.model';

@Component({
  selector: 'ngx-art-storages',
  templateUrl: './art-storages.component.html',
  styleUrls: ['./art-storages.component.scss']
})
export class ArtStoragesComponent implements OnInit, OnDestroy {
  @Output() selectedItem = new EventEmitter<any>();
  public currentStorage = new ArtStorageModel();
  public currentArtworks;
  public artworks: ArtworkModel[];
  public artStorages: ArtStorageModel[];
  public showMask: boolean;
  public showSnipper: boolean;
  public editionsMode: boolean;
  public viewMode: boolean;
  public artworkWithEditions: any;
  public artworkWithoutEditions: any;
  public pointedArtworks = [[]];
  public selectedStorage: any;
  public selectedEditions: any;
  public countItemsOnPage = 12; // show 12 artworks on one page
  public maxPage: number;
  public curPage: number = 1;
  public paginationLink = '';
  private _currentAccount: any;
  private _currentProfile: any;
  private _currentProfileId: string;

  constructor(
    private _artStorageService: ArtStorageService,
    private _storage: StorageService,
    private _dialogService: NbDialogService,
    private _authService: AuthGuardService,
    private _commonService: CommonService,
    private _profileService: ProfileService,
    private _artworkService: ArtworkService
  ) {
  }

  @Input() set showMode(value: boolean) {
    this.viewMode = value;
  }

  ngOnInit() {
    this._currentProfileId = this._storage.get('profile') ? this._storage.get('profile').id : '';
    this._commonService.setHeaderTitle({nav: 'Art storages'});
    this._currentAccount = this._storage.get('token');
    if (this._storage.get('profile')) {
      this._currentProfile = this._storage.get('profile').id;
    }

    if (this._currentProfile && this._currentProfile.length > 0) {
      this.getStorages(this._currentProfile);
    } else {
      this._profileService.getAccount({id: this._currentAccount}).subscribe(res => {
        const lastProfileId = res.lastActiveProfile;
        this._currentProfile = lastProfileId;
        this._storage.set('profile', {id: lastProfileId});
        this.getStorages(this._currentProfile);
      });
    }

    this.getArtworks(1);
  }

  getArtworks(page?) {
    let url: string;
    let tempArr = [];
    if (page !== undefined) url = this._commonService.generateUrl(page, this.countItemsOnPage);

    this._artworkService.getArtworks(this._currentProfileId, '').subscribe(res => {
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


      // set max page for pagination
      this.maxPage = Math.ceil(res.count / this.countItemsOnPage);
    }, error => {
      console.error(error);
    });
  }

  getStorages(id, params?) {
    this.showMask = false;
    this.showSnipper = true;
    let dataToSend: any;
    let typeReq = 'getProfileStorages';
    if (params) {
      typeReq = 'searchStorages';
      dataToSend = {val: params};
    }

    this._artStorageService[typeReq](id, dataToSend).subscribe(res => {
      let artStorages = res.artstorages;
      if (artStorages && artStorages.length > 0) {
        artStorages.map(item => {
          item.editMode = false;
        });
      }

      if (artStorages.length < 1) {
        this.showMask = true;
      } else {
        this.generateArtworks(artStorages);
      }

      this.showSnipper = false;
    }, error => {
      this.showSnipper = false;
    });
  }

  generateArtworks(data) {
    let artStorages = [...data];

    data.map((artstorage, index) => {

      this._artworkService.getArtworksByArtstorages(artstorage._id).subscribe(res => {
        const tempArr = res.artworks;

        if (tempArr && tempArr.length > 0) {
          let i = 0;
          tempArr.reduce(
            (chain, artwork) => {
              return chain.then(() => {
                return new Promise(resolve => {

                  if (this.pointedArtworks[index] === undefined) {
                    this.pointedArtworks.push([]);
                  } else {
                    this.pointedArtworks[index].push(artwork._id);
                  }

                  artwork.editMode = false;
                  if (artwork.files && artwork.files.length > 0) {
                    this.getUrlFile(artwork.files[0]).then(res => {
                      artwork.image = res;
                      if (tempArr.length - 1 === i) {
                        artstorage.artworks = Array.from(tempArr);

                        artStorages.map(storage => {
                          if (storage.artworks && storage.artworks.length > 0) {
                            this._commonService.autoRotation(storage.artworks[storage.artworks.length - 1].image).subscribe(res => storage.artworks[storage.artworks.length - 1].rotation = res);
                          }
                        });
                        setTimeout(() => {
                          this.artStorages = artStorages;
                        }, 300);
                      }
                      resolve();
                      i++;
                    });
                  } else {
                    artwork.image = '';
                    if (tempArr.length - 1 === i) {
                      artstorage.artworks = Array.from(tempArr);

                      artStorages.map(storage => {
                        if (storage.artworks && storage.artworks.length > 0) {
                          this._commonService.autoRotation(storage.artworks[storage.artworks.length - 1].image).subscribe(res => storage.artworks[storage.artworks.length - 1].rotation = res);
                        }
                      });
                      setTimeout(() => {
                        this.artStorages = artStorages;
                      }, 300);
                    }
                    resolve();
                    i++;
                  }
                });
              });
            }, Promise.resolve());

        } else {
          if (data.length - 1 === index) this.artStorages = artStorages;
        }

      });
    });
  }

  getUrlFile(fileId) {
    return new Promise((resolve, reject) => {
      // console.log('fileId', fileId);
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

  send(form: NgForm, clear?: boolean) {
    const value = form.value.search;
    if (!clear) {
      if (value && value.length > 0) {
        this.getStorages(this._currentProfile, value);
      } else {
        this.getStorages(this._currentProfile);
      }
    } else {
      form.reset();
      this.getStorages(this._currentProfile);
    }
  }

  createStorage(form: NgForm, ref) {
    const dataToSend = form.value;
    // dataToSend.profile = this._currentProfile;

    let nameReq = form.value.id ? 'updateStorage' : 'addProfileStorage';

    this._artStorageService[nameReq](dataToSend).subscribe(res => {
      this.getStorages(this._currentProfile);
      this.currentStorage = new ArtStorageModel();
      ref.close();
    });
  }

  openModal(modal: TemplateRef<any>, storage?, index?) {
    if (storage) {
      this.currentStorage = storage;
      this.currentStorage['pointedArtworks'] = [];
      this.currentStorage['pointedArtworks'] = this.pointedArtworks[index] ? this.pointedArtworks[index] : [];
    }
    this._dialogService.open(modal);
  }

  moveArtworks(storage, ref) {
    ref.close();
  }

  deleteStorage(storage, ref) {
    this._artStorageService.deleteStorage(storage._id).subscribe(res => {
      this.getStorages(this._currentProfile);
      this.currentStorage = new ArtStorageModel();
      ref.close();
    });
  }

  actionItem(type, storage, ref?) {
    this.currentStorage = new ArtStorageModel();
    storage.editMode = false;
    this.currentStorage = storage;
    this.openModal(ref);
  }

  selectArtworks(value) {
    this.currentArtworks = value;
  }

  addArtworks(currentSto, ref) {
    this.editionsMode = false;
    if (this.currentArtworks && this.currentArtworks.length > 0) {
      this.artworkWithEditions = this.currentArtworks.filter(artwork => artwork.copies);
    }

    if (this.artworkWithEditions && this.artworkWithEditions.length > 0) {
      this.editionsMode = true;
    } else if (this.currentArtworks && this.currentArtworks.length > 0) { // withoutEditions
      this.changeArtworks(this.currentArtworks, currentSto, ref);
    } else { // no new-profile artworks selected
      ref.close();
    }
  }

  changeArtworks(data, currentSto, ref) {
    data.map((artwork, index) => {
      const storId = currentSto ? currentSto._id : '';

      const dataToSend = {
        id: artwork._id,
        location: {artstorage: storId}
      };

      this._artworkService.updateArtwork(dataToSend).subscribe(res => {
        if (index === data.length - 1) {
          this.getStorages(this._currentProfile);
          ref.close();
        }
      }, error => {
        console.error(error);
        this.showSnipper = false;
      });
    });
  }

  chooseEditions(currentSto, ref) {
    // update simple artworks without editions
    this.artworkWithoutEditions = this.currentArtworks.filter(artwork => !artwork.copies);
    this.changeArtworks(this.artworkWithoutEditions, currentSto, ref);

    this.artworkWithEditions.map((artwork, index) => {
      const dataToSend = {
        id: artwork._id,
        editions: this.selectedEditions[artwork._id]
      };

      this._artworkService.updateArtwork(dataToSend).subscribe(res => {

        if (index === this.artworkWithEditions.length - 1) {
          this.editionsMode = false;
          this.artworkWithEditions = '';
          this.artworkWithoutEditions = '';
          this.getStorages(this._currentProfile);
          ref.close();
        }
      }, error => {
        console.error(error);
        this.showSnipper = false;
      });
    });
  }

  checkedEditions(editions) {
    this.selectedEditions = editions;
  }

  // organizeEditions(editions, currentSto) {
  //   // location: { artstorage: currentSto._id }
  //   let res = [];
  //
  //   let tempObj = {};
  //   editions.map((item: any) => {
  //     let locObj;
  //     if (item.checked) {
  //       locObj =  { artstorage: currentSto._id }
  //     } else {
  //       locObj = item.location;
  //     }
  //     tempObj = item;
  //     tempObj['location'] = locObj;
  //
  //     res.push(tempObj);
  //   });
  //
  //   return res;
  // }

  handleAddressChange(address: Address, nameVar, form?) {
    this.currentStorage[nameVar] = address.formatted_address;
  }

  selectStorage(store) {
    this.selectedStorage = store;
    this.selectedItem.emit(this.selectedStorage);
  }

  pageChanged(page) {
    this.curPage = page;
    this.getArtworks(page);
  }

  ngOnDestroy() {
    this._commonService.setHeaderTitle('');
  }
}
