import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { StorageService } from '../../../services/storage.service';
import { NbDialogService } from '@nebular/theme';
import { SketchesService } from '../../../services/sketches.service';
import { ArtworkService } from '../../../services/artwork.service';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'ngx-sketches',
  templateUrl: './sketches.component.html',
  styleUrls: ['./sketches.component.scss']
})
export class SketchesComponent implements OnInit {
  private _currentProfileId: any;
  public showMask: boolean = true;
  public showSnipper: boolean;
  public sketches: any;
  public currentSketch: any;

  constructor(
    private _storage: StorageService,
    private _dialogService: NbDialogService,
    private _sketchesService: SketchesService,
    private _artworkService: ArtworkService,
    private _commonService: CommonService
  ) { }

  ngOnInit() {
    this._currentProfileId = this._storage.get('profile') ? this._storage.get('profile').id : '';
    this.getScketches(this._currentProfileId);
    // this._commonService.setHeaderTitle({nav: 'Sketches'});
  }

  send(form: NgForm, clear?: boolean) {
    const value = form.value.search;
    if (!clear) {
      if (value && value.length > 0) {
        this.getScketches(this._currentProfileId, value);
      } else {
        this.getScketches(this._currentProfileId);
      }
    } else {
      form.reset();
      this.getScketches(this._currentProfileId);
    }
  }

  getScketches(profileId, val?) {
    this.showSnipper = true;
    this.showMask = false;

    this._sketchesService.getSketchesByProfile(this._currentProfileId).subscribe(res => {
      this.showSnipper = false;
      this.sketches = res.sketches;
      this.sketches.map(sketch => {
        if (sketch.files) {
          this.getUrlFile(sketch.files[0]).then(res => {
            sketch.image = res;
          });
        } else {
          sketch.image = '';
        }
        sketch.editMode = false;
      });
      if (res.sketches.length < 1) this.showMask = true;
    }, error => {
      this.showSnipper = false;
      this.showMask = true;
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

  deleteSketch(ref) {
    this._sketchesService.removeSketch(this.currentSketch._id).subscribe(res => {
      ref.close();
      this.currentSketch = '';
      this.getScketches(this._currentProfileId);
    }, error => {
      console.error(error);
      this.currentSketch = '';
    });
  }

  openModal(modal: TemplateRef<any>, currentSketch?) {
    this.currentSketch = currentSketch;
    this._dialogService.open(modal);
  }

  ngOnDestroy() {
    // this._commonService.setHeaderTitle('');
  }
}
