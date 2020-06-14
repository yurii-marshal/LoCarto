import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../../../services/storage.service';
import { ArtworkService } from '../../../../../services/artwork.service';
import { CommonService } from '../../../../../services/common.service';
import { NbDialogService } from '@nebular/theme';
import { ExhibitionsService } from '../../../../../services/exhibitions.service';


@Component({
  selector: 'ngx-exh-edit-artwork',
  templateUrl: './exh-edit-artwork.component.html',
  styleUrls: ['./exh-edit-artwork.component.scss']
})
export class ExhEditArtworkComponent implements OnInit, OnDestroy {
  @Input() set data(data: any) {
    this.showMask = false;
    this.artworks = data;

    if (!this.artworks || (this.artworks && this.artworks.length < 1)) {
      this.showMask = true;
    } else {
      this.artworks.map(artwork => {
        if (artwork.image) {
          artwork.image = artwork.image.url;
        }

        if (artwork.installed) {
          this.pointedArtworks.push(artwork._id);
        }
        this.addedArtworks.push(artwork._id);
      });
    }
  }
  @Input() set curRole(val: string) {
    this.role = val;
  }
  @Input() set exhId(data: any) {
    this.currentId = data;
  }
  @Input() set memeber(data: any) {
    this.selectedMember = data;
  }
  @Input() set canAdd(val: boolean) {
    this.canAddArtworks = val;
  }
  @Input() set listedFolder(val: boolean) {
    this.listed = val;
  }
  @Input() set canMove(val: boolean) {
    this.allowMove = val;
  }
  @Output() setTab = new EventEmitter<boolean>();
  @Output() exhUpdate = new EventEmitter<any>();

  private _sub: any;
  private _currentProfileId: string;

  public role: string;
  public canAddArtworks: boolean;
  public allowMove: boolean;
  public listed: boolean;
  public currentId: string;
  public selectedMember: string;
  public countItemsOnPage = 12; // show 12 artworks on one page
  public maxPage: number;
  public curPage: number = 1;
  public paginationLink = '';
  public artworksPopup: any;
  public artworks = [];
  public showSnipper: boolean;
  public artworkToDelete: any;
  public currentArtworks: any;
  public showMask: boolean;
  public artworksId = [];
  public pointedArtworks = [];
  public addedArtworks = [];

  constructor(
    private _route: ActivatedRoute,
    private _storage: StorageService,
    private _dialogService: NbDialogService,
    private _commonService: CommonService,
    private _artworkService: ArtworkService,
    private _exhibitionsService: ExhibitionsService,
    private _router: Router
  ) { }

  ngOnInit() {
    this._currentProfileId = this._storage.get('profile') ? this._storage.get('profile').id : '';
    this._sub = this._route.params.subscribe(params => {
      this.getAllArtworks(1);
    });
  }

  openModal(modal: TemplateRef<any>) {
    this._dialogService.open(modal);
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

  deleteArtwork(artworks, modalEl?: TemplateRef<any>) {
    this.showSnipper = true;

    const artworksArrIds = [];
    this.artworks.map(artwork => {
      const filtered = (artworks && artworks.length > 0) ? artworks.filter(art => art._id === artwork._id) : '';
      if (filtered && filtered.length > 0) {
        artworksArrIds.push({_id : artwork._id, profile: artwork.profile});
      }
    });

    let i = 0;
    artworksArrIds.map(art => {
      let dataToSend: any;

      const delAction = !this.allowMove;
      this.updateExh({}, '', '', (i === artworksArrIds.length - 1), '', art._id, true, delAction, art.profile);
      i++;
    });
  }

  updateExh(dataToSend, banner?, ref?, last?, addToExh?, artId?, changeToExh?, deleteExh?, profileId?) {
    let req: any;
    if (changeToExh) {
      let proId;
      proId = this.canAddArtworks ? this._currentProfileId : this.selectedMember['profile'];

      if (profileId && !this.selectedMember) proId = profileId;

      req = deleteExh && !this.listed ?
        this._exhibitionsService.removeExhibition(dataToSend, this.currentId,  proId, artId) :
        this._exhibitionsService.addToExhibition(dataToSend, this.currentId,  proId, artId);
    } else if (addToExh) {
      req = this._exhibitionsService.addArtwork(dataToSend, this.currentId, this._currentProfileId);
    }

    req.subscribe(res => {
      if (ref) ref.close();
      this.showSnipper = false;
      // if (!(this.canAddArtworks && addToExh)) {
        this.exhUpdate.emit();
      // }
    }, error => {
      if (ref) ref.close();
      this.showSnipper = false;
      console.error(error);
    });
  }

  selectArtworks(value, modal?) {
    this.currentArtworks = value.artworks;
    if (value.type === 'remove') {
      this.deleteArtwork(value.artworks, modal);
    } else if (value.type === 'addToExh') {
      const artworks = value.artworks.filter(art => !art.installed);
      this.changeExh(artworks, '', '', true);
    }
  }

  pageChanged(page) {
    this.curPage = page;
    this.getAllArtworks(page);
  }

  selectArtworksPopUp(value, modal?) {
    value = value.filter(art => {
      const res = (this.artworks && this.artworks.length > 0) ? this.artworks.filter(item => item._id === art._id) : '';
      return !(res && res.length > 0);
    });
    this.currentArtworks = value;
  }

  addArtworks(currentSto, ref, selectedArtworks?) {
    this.changeExh(this.currentArtworks, ref, true);
    if (this.canAddArtworks && this.listed) this.changeExh(this.currentArtworks, ref, '', true);
  }

  changeExh(artworks, ref?, addToExh?, changeToExh?) {
    let i = 0;
    artworks.map(art => {
      let dataToSend: any;
      if (changeToExh) {
        dataToSend = {
          selected: true
        };
      } else if (addToExh){
        dataToSend = {
          artwork: art._id
        };
      }

      this.updateExh(dataToSend, '', ref, (i === artworks.length - 1), addToExh, art._id, changeToExh);
      i++;
    });
  }

  send(form: NgForm) {} // TODO

  ngOnDestroy() {
    this._sub.unsubscribe();
    this._commonService.setHeaderTitle('');
  }
}
