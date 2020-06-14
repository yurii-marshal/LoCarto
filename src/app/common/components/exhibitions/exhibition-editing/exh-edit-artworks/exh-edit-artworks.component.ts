import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../../../services/storage.service';
import { ArtworkService } from '../../../../../services/artwork.service';
import { CommonService } from '../../../../../services/common.service';
import { NbDialogService } from '@nebular/theme';
import { ExhibitionsService } from '../../../../../services/exhibitions.service';
import { ProfileService } from '../../../../../services/profile.service';

@Component({
  selector: 'ngx-exh-edit-artworks',
  templateUrl: './exh-edit-artworks.component.html',
  styleUrls: ['./exh-edit-artworks.component.scss']
})
export class ExhEditArtworksComponent implements OnInit, OnDestroy {
  @Input() set data(data: any) {
    if (data && data.length > 0) {
      this.exhArtworks = data;
      this.exhArtworks.map(artwork => {
        if (artwork.image) {
          this._commonService.autoRotation(artwork.image.url).subscribe(rotate => {

            if (rotate && rotate.length > 0) {
              const ind = rotate.match(/\(/).index;
              const newRes = rotate.substring(0);

              artwork.image['rotation'] = rotate;
              artwork.image['unrotation'] = newRes.slice(0, ind) + newRes[ind] + '-' + newRes.slice(ind + 1);
            }
          });
        }
      })
    }
  }
  @Input() set users(data: any) {
    this.members = data;
    this.members.map((member, ind) => {
      const currentProId = this._storage.get('profile') ? this._storage.get('profile').id : '';
      if (member.profile === currentProId) this.personalMember = member;
      this.organizeProfiles(member.profile, ind);
      if (member.artworks && member.artworks.length > 0) {
        this.organizeArtworks(member.artworks, ind);
      }
    });
  }
  @Input() set exhId(data: any) {
    this.currentId = data;
  }
  @Input() set creator(data: any) {
    this.creatorId = data;
  }
  @Input() set curRole(val: string) {
    this.role = val;
  }
  @Output() setTab = new EventEmitter<boolean>();
  @Output() exhUpdate = new EventEmitter<any>();

  private _sub: any;
  private _currentProfileId: string;

  public creatorId: any;
  public listed: boolean;
  public personalMember: any;
  public canAddArtworks: boolean;
  public canMove: boolean;
  public role: string;
  public currentId: string;
  public countItemsOnPage = 12; // show 12 artworks on one page
  public maxPage: number;
  public curPage: number = 1;
  public paginationLink = '';
  public showSnipper: boolean;
  public listedExh: any;
  public exhArtworks: any;
  public openArtworks: boolean;
  public members = [];
  public selectedArtworks = [];
  public selectedMember: any;

  constructor(
    private _route: ActivatedRoute,
    private _storage: StorageService,
    private _dialogService: NbDialogService,
    private _commonService: CommonService,
    private _artworkService: ArtworkService,
    private _exhibitionsService: ExhibitionsService,
    private _router: Router,
    private _profileService: ProfileService
  ) { }

  ngOnInit() {
    this._currentProfileId = this._storage.get('profile') ? this._storage.get('profile').id : '';
  }

  organizeProfiles(proId, ind) {
    this._profileService.getProfileById(proId).subscribe(res => {
      this.members[ind].proData = res.profile;
    }, error => {
      console.error(error);
    });
  }

  organizeArtworks(item, ind) {
    const arrArtworks = [];
    let i = 0;
    item.map(art => {
      if (art && art.artwork) {
        this._artworkService.getArtwork(art.artwork).subscribe(res => {
          let artObj = res.artwork;
          artObj.installed = art.selected;
          arrArtworks.push(artObj);
          if (i === item.length - 1) this.setArtworks(arrArtworks, ind);
          i++;
        }, error => {
          console.error(error);
        });
      } else {
        if (i === item.length - 1) this.setArtworks(arrArtworks, ind);
        i++;
      }
    });
  }

  setArtworks(data, ind) {
    let len = data.length;
    let tempArr = data;

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
                  let v = 0;
                  tempArr.map((item) => {
                    v++;
                    if (item.image) {
                      this.setRotation([item.image]).then(image => {
                        item.image = image[0];
                        if (v === len) this.members[ind].artworksData = tempArr;
                      });
                    } else {
                      if (v === len) this.members[ind].artworksData = tempArr;
                    }
                  });
                }
                resolve();
                i++;
              });
            } else {
              artwork.image = '';
              if (tempArr.length - 1 === i) {
                let v = 0;
                tempArr.map((item) => {
                  v++;
                  if (item.image) {
                    this.setRotation([item.image]).then(image => {
                      item.image = image[0];
                      if (v === len) this.members[ind].artworksData = tempArr;
                    });
                  } else {
                    if (v === len) this.members[ind].artworksData = tempArr;
                  }
                });
              }
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
          resolve(res.file);
        } else {
          resolve('');
        }
      }, error => {
        reject(error);
      });
    });
  }

  showArtworks(artworks, member?, role?, listed?) {
    this.canAddArtworks = false;
    this.canMove = false;
    this.selectedArtworks = artworks;
    this.listed = listed;
    if (listed && (role === 'creator' || role === 'admin')) this.canAddArtworks = true;
    if (!listed && (role === 'creator' || role === 'admin')) this.canMove = true;
    if ((role === 'member' || role === 'adminmember') && member && member.profile === this.personalMember.profile) this.canAddArtworks = true;
    if (member) this.selectedMember = member;
    this.openArtworks = true;
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

  updateExhData() {
    this.exhUpdate.emit();
    this.openArtworks = false;
  }

  ngOnDestroy() {
    // this._sub.unsubscribe();
    this._commonService.setHeaderTitle('');
  }
}
