import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { ExhibitionsService } from '../../../../services/exhibitions.service';
import { StorageService } from '../../../../services/storage.service';
import { AuthGuardService } from '../../../../services/auth-guard.service';
import { CommonService } from '../../../../services/common.service';
import { ArtworkService } from '../../../../services/artwork.service';
import { ProfileService } from '../../../../services/profile.service';

@Component({
  selector: 'ngx-exhibitions-list',
  templateUrl: './exhibitions-list.component.html',
  styleUrls: ['./exhibitions-list.component.scss']
})
export class ExhibitionsListComponent implements OnInit {
  @Input() set type(value: string) {
    this.typeExh = value;
  }
  @Input() set data(data: any) {
    this.exhibitions = data;
    this.showMask = false;

    if (this.exhibitions && this.exhibitions.length > 0) {
      this.exhibitions.map(exh => {
        exh.editMode = false;
        if (exh.date && exh.date.from && exh.date.to) {
          exh.startPipe = this._commonService.exhibitionStartDate(exh.date.from, exh.date.to);
        }
        this._artworkService.generateFilesArr(exh.banner, true).then(banners => {
          if (banners) {
            exh.bannerUrl = {
              rotation: '',
              url: '',
              unrotation: ''
            };
            this._commonService.autoRotation(banners['url']).subscribe(rotate => {
              exh.bannerUrl['rotation'] = rotate;
              exh.bannerUrl['url'] = banners['url'];
              if (rotate && rotate.length > 0) {
                const ind = rotate.match(/\(/).index;
                const newRes = rotate.substring(0);
                exh.bannerUrl['unrotation'] = newRes.slice(0, ind) + newRes[ind] + '-' + newRes.slice(ind + 1);
              } else {
                exh.bannerUrl['rotation'] = '';
                exh.bannerUrl['unrotation'] = '';
              }
            });

            // exh.bannerUrl = banners['url'];
          }
        });

        // this.setArtists(exh, 'admins');
        this.setArtists(exh, 'members');
      });

      const today = new Date();

      // this.exhibitions = this.exhibitions.filter(item  => {
      //   if (this.typeExh === 'draft') {
      //     if (item.isDraft) {
      //       return true;
      //     }
      //   } else if (this.typeExh === 'active') {
      //     if (!item.isDraft) {
      //       if (new Date(item.date.to).getTime() > today.getTime()) return true;
      //     }
      //   } else if (this.typeExh === 'past') {
      //     if (!item.isDraft) {
      //       if (new Date(item.date.to).getTime() < today.getTime()) return true;
      //     }
      //   }
      // });
    }

    if (!this.exhibitions || (this.exhibitions && this.exhibitions.length < 1)) {
      this.showMask = true;
    }
  }
  @Input() set viewMode(value: boolean) {
    this.showMode = value;
  }
  @Output() needUpdate = new EventEmitter<any>();

  public showSnipper: boolean;
  public showMask: boolean;
  public showMode: boolean;
  public exhibitions: any;
  public currentExhibition: any;
  public typeExh: string;

  private _currentProfile: string;

  constructor(
    private _dialogService: NbDialogService,
    private _exhibitionsService: ExhibitionsService,
    private _storage: StorageService,
    private _authService: AuthGuardService,
    private _commonService: CommonService,
    private _artworkService: ArtworkService,
    private _profileService: ProfileService
  ) { }

  ngOnInit() {
    this.setProfId();

  }

  setProfId() {
    const currentAccount = this._storage.get('token');

    if (this._storage.get('profile')) {
      this._currentProfile = this._storage.get('profile').id;
    }

    if (this._currentProfile && this._currentProfile.length > 0) {
      // this.getExhibitions(this._currentProfile);
    } else {
      this._profileService.getAccount({id: currentAccount}).subscribe(res => {
        const lastProfileId = res.lastActiveProfile;
        this._currentProfile = lastProfileId;
        this._storage.set('profile', {id: lastProfileId});
        // this.getExhibitions(this._currentProfile);
      });
    }
  }

  setArtists(data, type) {
    if (data[type] && data[type].length > 0) {
      data[type].map(prof => {
        const id = (type === 'admins') ? prof : prof.profile;
        this._profileService.getProfileById(id).subscribe(res => {
          if (!data.artists) {
            data.artists = [res.profile];
          } else {
            data.artists.push(res.profile);
          }
        });
      });
    }
  }

  actionItem(type, exhibition, ref?) {
    this.currentExhibition = {};
    exhibition.editMode = false;
    this.currentExhibition = exhibition;
    this.openModal(ref);
  }

  openModal(modal: TemplateRef<any>, exhibition?, index?) {
    if (exhibition) {
      this.currentExhibition = exhibition;
      // this.currentExhibition['pointedArtworks'] = [];
      // this.currentExhibition['pointedArtworks'] = this.pointedArtworks[index] ? this.pointedArtworks[index] : [];
    }
    this._dialogService.open(modal);
  }

  deleteExhibition(exhibition, ref) {
    this._exhibitionsService.deleteExhibition(exhibition._id).subscribe(res => {
      // this.getExhibitions(this._currentProfile);
      this.needUpdate.emit();
      this.currentExhibition = {};
      ref.close();
    });
  }

}
