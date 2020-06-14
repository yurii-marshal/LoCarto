import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'ngx-editions-list',
  templateUrl: './editions-list.component.html',
  styleUrls: ['./editions-list.component.scss']
})
export class EditionsListComponent implements OnInit {
  @Input() set storage(value: any) {
    this.currentStorage = value;
  }
  @Input() set removeMode(value: boolean) {
    this.deleteMode = value;
  }
  @Input() set setArt(value: number) {
    this.activeArt = value;
  }
  @Input() set artworks(value: any) {
    this.artworkWithEditions = value;
    this.checkEditions(this.artworkWithEditions);
  }
  @Output() selectedEditions = new EventEmitter<any>();

  public artworkWithEditions: any;
  public currentStorage: any;
  public deleteMode: boolean;
  public activeArt = 0;

  constructor() {}

  ngOnInit() {}

  checkEditions(artworks) {
    artworks.map(artwork => {
      if (artwork.copies) {
        artwork.copies.map(copy => {
          if (copy.location && copy.location.artstorage && (this.currentStorage && copy.location.artstorage === this.currentStorage._id || copy.location.artstorage === this.currentStorage) ) {
            if (this.deleteMode) {
              copy.canDelete = true;
            } else {
              copy.checked = true;
            }
          }

          let parseData = {location: {}};
          if (copy.location) {
            Object.keys(copy.location).map(key => {
              if (copy.location[key] !== null && copy.location[key] !== false) {
                copy.locationStatus = key;
                if (key !== 'notCreated') {
                  parseData.location[key] = copy.location[key];
                }
              }
            });
          }

          copy.locationPlace = this.parseObj(parseData, 'location', 'key') || '';
          copy.locationPlaceName = this.parseObj(parseData, 'location', 'val') || '';

        });
      }
    });
  }

  parseObj(obj, prop, type: string) {
    if (obj[prop]) {
      if (type === 'key') {
        return Object.keys(obj[prop])[0];
      } else if (type === 'val') {
        if (prop === 'location') {
          const res = this.currentStorage.title;
          return res || '';
        } else {
          return obj[prop][Object.keys(obj[prop])[0]];
        }
      }
    } else {
      return '';
    }
  }

  selectCopy(event, copy, artwork) {
    copy.checked = event.target.checked;

    this.emitEditions(this.artworkWithEditions);
  }

  emitEditions(artworks) {
    let tempObj = {};
    let res = {};
    artworks.map((artwork, index) => {
      res[artwork._id] = [];

      artwork.copies.map((item: any) => {
        let locObj;
        tempObj = item;
        if (item.checked) {
          if (this.deleteMode) {
            locObj = null;
          } else {
            locObj = { artstorage: this.currentStorage._id };
          }

          tempObj['location'] = locObj;
        }
        res[artwork._id].push(tempObj);
      });
    });

    this.selectedEditions.emit(res);
  }
}