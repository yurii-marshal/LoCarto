import { Component, OnInit, TemplateRef } from '@angular/core';
import { StorageService } from '../../../services/storage.service';
import { NgForm } from '@angular/forms';
import { NbDialogService } from '@nebular/theme';
import { ArtworkService } from '../../../services/artwork.service';

@Component({
  selector: 'ngx-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit {
  private _currentProfileId: any;
  public showMask: boolean;
  public showSnipper: boolean;
  public tags: any;
  public currentArtworks: any;
  public currentTag: any;
  public activeTag: number;

  constructor(
    private _storage: StorageService,
    private _dialogService: NbDialogService,
    private _artworkService: ArtworkService
  ) { }

  ngOnInit() {
    this._currentProfileId = this._storage.get('profile') ? this._storage.get('profile').id : '';
    this.getArtworks();
  }

  send(form: NgForm, clear?: boolean) {
    // const value = form.value.search;
    // if (!clear) {
    //   if (value && value.length > 0) {
    //     this.getScketches(value);
    //   } else {
    //     this.getScketches();
    //   }
    // } else {
    //   form.reset();
    //   this.getScketches();
    // }
  }

  getArtworks(val?) {
    this._artworkService.getArtworks(this._currentProfileId, '').subscribe(res => {
      this.generateTags(res.artworks);

    }, error => {
      console.error(error);
    });
  }

  generateTags(data) {
    this.showMask = false;
    let existingTags = [];

    let allTags = [];

    data.map(artwork => {
      if (artwork.tags) {
        artwork.tags.map(tag => allTags.push({name: tag.toLowerCase(), artwork: artwork}));
      }
    });

    allTags.map(item => {
      const exist = existingTags.filter(tagItem => tagItem.name === item.name);
      if (exist && exist.length > 0) {
        existingTags.map(tagItem => {
          if (tagItem.name === item.name) {
            tagItem.count += 1;
            tagItem.artworks.push(item.artwork);
          }
        });
      } else {
        existingTags.push({name: item.name, count: 1, artworks: [item.artwork]});
      }
    });

    this.tags = existingTags;

    if (this.tags && this.tags.length < 1) {
      this.showMask = true;
    }
  }

  openModal(modal: TemplateRef<any>, currentTag) {
    this.currentTag = currentTag;
    // this._activeModal = modal;
    this._dialogService.open(modal);
  }

  showArtworks(artworks, index) {
    this.activeTag = index;

    const tempArr = artworks;
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
                  this.currentArtworks = tempArr;
                  this.showSnipper = false;
                }
                resolve();
                i++;
              });
            } else {
              artwork.image = '';
              if (tempArr.length - 1 === i) {
                this.currentArtworks = tempArr;
                this.showSnipper = false;
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

  deleteTag(ref) {
    this._artworkService.removeTag(this.currentTag.name).subscribe(res => {
      ref.close();
      this.currentTag = '';
      this.getArtworks();
    }, error => {
      console.error(error);
    });
  }

  showAll() {
    this.activeTag = undefined;
    this.currentArtworks = [];
  }
}
