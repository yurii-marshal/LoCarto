import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { StorageService } from '../../../services/storage.service';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ExhibitionsService } from '../../../services/exhibitions.service';
import { ArtworkService } from '../../../services/artwork.service';

@Component({
  selector: 'ngx-edit-exhibition',
  templateUrl: './edit-exhibition.component.html',
  styleUrls: ['./edit-exhibition.component.scss']
})
export class EditExhibitionComponent implements OnInit {
  public tabs: any;
  public profileId: string;
  public currentId: string;
  public filesInProgress: boolean;
  public exhibition: any;
  public activeTab = 1;
  public role: string;

  private _sub: any;

  constructor(
    private _commonService: CommonService,
    private _storage: StorageService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _titleService: Title,
    private _exhibitionsService: ExhibitionsService,
    private _artworksService: ArtworkService,
  ) {
    this.tabs = [
      {
        title: 'General'
      },
      {
        title: 'Artworks'
      },
      {
        title: 'Photos'
      },
      {
        title: 'Notifications'
      },
      {
        title: 'Members'
      }
    ];
  }

  ngOnInit() {
    this.profileId = this._storage.get('profile') ? this._storage.get('profile').id : '';
    this._titleService.setTitle( 'Locarto - Exhibition info' );
    this._commonService.setHeaderTitle({nav: 'Exhibitions', backUrl: '/pages/exhibitions'});
    this._sub = this._route.params.subscribe(params => {
      this.currentId = params['id'];
      this.getExhData(this.currentId);
    });
  }

  getExhData(id) {
    this._exhibitionsService.actionExh(id).subscribe(res => {
      this.exhibition = res.exhibition;
      this._commonService.setHeaderTitle({nav: 'Exhibition ' + this.exhibition.title, backUrl: '/pages/exhibitions'});

      this.setRole(this.exhibition);

      this.listedArtworks(this.exhibition);

      if (this.exhibition.files && this.exhibition.files.length > 0) {
        this.exhibition.files.map(file => {
          this.getUrlFile(file).then((res: any) => {
            const obj = {
              url: res.url,
              _id: res._id,
              name: res.name
            };
            if (this.exhibition.images) {
              this.exhibition.images.push(obj);
            } else {
              this.exhibition.images = [obj];
            }

            this.setRotation(this.exhibition.images).then((tempArr) => {
              setTimeout(() => {
                this.exhibition.images = tempArr;
              }, 250);
            });
          });
        });
      }
    }, error => {
      console.error(error);
    });
  }

  setRole(exh) {
    this.role = '';

    if (exh.admin === this.profileId) {
      this.role = 'creator';
      return;
    }

    exh.admins.map(adminId => {
      if (adminId === this.profileId) {
        this.role = 'admin';
      }
    });

    exh.members.map(member => {
      if (member.profile === this.profileId) {
        this.role += 'member';
      }
    });
  }

  listedArtworks(data) {
    let arrArtworks = [];
    let i = 0;
    if (data.members) {
      data.members.map(member => {
        if (member.active) {
          const arts = member.artworks.filter(art => art.selected);
          arrArtworks = [...arrArtworks, ...arts];
        }
        if (i === data.members.length - 1) this.organizeArtworks(arrArtworks);
        i++;
      });
    }
    // arrIds.map((id, i) => {
    //   this._artworksService.artwork('get', {id: id}).subscribe(res => {
    //     arrArtworks.push(res.artwork);
    //     if (i === arrIds.length - 1) this.setArtworks(arrArtworks);
    //   }, error => {
    //     console.error(error);
    //   });
    // });
  }

  organizeArtworks(item) {
    const arrArtworks = [];
    let i = 0;
    item.map(art => {
      if (art && art.artwork) {
        this._artworksService.getArtwork(art.artwork).subscribe(res => {
          let artObj = res.artwork;
          artObj.selected = art.selected;
          arrArtworks.push(artObj);
          if (i === item.length - 1) this.setArtworks(arrArtworks);
          i++;
        }, error => {
          console.error(error);
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

  setArtworks(data) {
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
                if (tempArr.length - 1 === i) this.exhibition.artworks = tempArr;
                resolve();
                i++;
              });
            } else {
              artwork.image = '';
              if (tempArr.length - 1 === i) this.exhibition.artworks = tempArr;
              resolve();
              i++;
            }
          });
        });
      }, Promise.resolve());
  }

  setActiveTab(index) {
    this.activeTab = index;
  }

  getUrlFile(fileId) {
    return new Promise((resolve, reject) => {
      this._artworksService.getFile(fileId).subscribe(res => {
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
}
