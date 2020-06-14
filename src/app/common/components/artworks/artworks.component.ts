import {Component, EventEmitter, Input, OnInit, Output, TemplateRef} from '@angular/core';
import {NgForm} from '@angular/forms';
import {NbDialogService} from '@nebular/theme';
import {StorageService} from '../../../services/storage.service';
import {ArtworkService} from '../../../services/artwork.service';
import {PortfolioService} from '../../../services/portfolio.service';
import {CommonService} from '../../../services/common.service';
import {CategoryModel} from '../../../models/category.model';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'ngx-artworks',
  templateUrl: './artworks.component.html',
  styleUrls: ['./artworks.component.scss']
})
export class ArtworksComponent implements OnInit {
  @Output() needUpdate = new EventEmitter<any>();
  @Output() selectedItems = new EventEmitter<any>();
  @Output() actionItems = new EventEmitter<any>();
  @Output() removeItem = new EventEmitter<any>();
  @Output() emitPage = new EventEmitter<any>();
  @Output() emitSort = new EventEmitter<any>();
  @Output() emitFilter = new EventEmitter<any>();
  public showMask: boolean;
  public showSnipper: boolean;
  public artworks: any;
  public chosenArtworks = [];
  public selectedAll = false;
  public countSelected: number;
  public view = 'grid';
  public currentArtwork: any;
  public viewMode: boolean;
  public removeAction: boolean;
  public checkAction = true;
  public currentPortfolios: any;
  public portfoliosId: any;
  public selectedArtworks: any;
  public showFilter: any;
  public categories: CategoryModel[];
  public categoriesArt: any;
  public todayDate = new Date();
  public arrButtons: any;
  public maxPageNum: number;
  public curPageNum: number;
  public routerUrl: string;
  public curSorting: any;
  public selectedFrom: any;
  public selectedTo: any;
  public linkButton: boolean;
  public places = [
    {title: 'Not printed yet', id: 'notPrinted'},
    {title: 'Not chosen', id: 'notChosen'},
    {title: 'Sold', id: 'sold'},
    {title: 'Available', id: 'available'}
  ];
  public sorting = [
    {
      id: 0,
      type: 'sort_type',
      typeVal: 'title',
      order: 'sort_order',
      orderVal: 'asc',
      title: 'From A to Z',
      icon: 'icon-sort-name-up'
    },
    {
      id: 1,
      type: 'sort_type',
      typeVal: 'title',
      order: 'sort_order',
      orderVal: 'desc',
      title: 'From Z to A',
      icon: 'icon-sort-name-down'
    },
    {
      id: 2,
      type: 'sort_type',
      typeVal: 'date_created',
      order: 'sort_order',
      orderVal: 'asc',
      title: 'First created',
      icon: 'icon-sort-number-up'
    },
    {
      id: 3,
      type: 'sort_type',
      typeVal: 'date_created',
      order: 'sort_order',
      orderVal: 'desc',
      title: 'Last created',
      icon: 'icon-sort-number-down'
    },
    {
      id: 4,
      type: 'sort_type',
      typeVal: 'date_added',
      order: 'sort_order',
      orderVal: 'asc',
      title: 'First added',
      icon: 'icon-sort-number-up'
    },
    {
      id: 5,
      type: 'sort_type',
      typeVal: 'date_added',
      order: 'sort_order',
      orderVal: 'desc',
      title: 'Last added',
      icon: 'icon-sort-number-down'
    }
  ];
  public buttons = {
    portfolio: false,
    storage: false,
    remove: false,
    commission: false,
    collection: false,
    addToExh: false,
    removeFromExh: false
  };
  private _currentProfile: any;

  constructor(
    private _dialogService: NbDialogService,
    private _artworkService: ArtworkService,
    private _storage: StorageService,
    private _portfolioService: PortfolioService,
    private _commonService: CommonService,
    private _toastr: ToastrService
  ) {
  }

  @Input() set data(value: any) {
    this.artworks = value;
    if (this.artworks && this.artworks.length > 0) {
      this.artworks.map(artwork => {
        if (artwork.copies) {
          artwork.place = 'Has editions';
        } else {
          if (artwork.location && Object.keys(artwork.location).length > 0) {
            let idPlace;

            Object.keys(artwork.location).map(key => {
              if (artwork.location[key] !== null && artwork.location[key] !== false) {
                idPlace = key;
              }
            });

            this.places.map(place => {
              if (place.id === idPlace) artwork.place = place.title;
            });
          }
        }
        if (artwork.createDate) artwork.fullDate = this.checkDate(artwork.createDate);
        if (artwork.image) this._commonService.autoRotation(artwork.image).subscribe(res => artwork.rotation = res);
      });

      this.getCategories();
    } else {
      this.showMask = true;
    }
  }

  @Input() set showMode(value: boolean) {
    this.viewMode = value;
  }

  @Input() set maxPage(num: number) {
    this.maxPageNum = num;
  }

  @Input() set curPage(num: number) {
    this.curPageNum = num;
  }

  @Input() set link(link: string) {
    this.routerUrl = link;
  }

  @Input() set linkButtonMode(link: any) {
    this.linkButton = link;
  }

  @Input() set removeActionMode(value: boolean) {
    this.removeAction = value;
  }

  @Input() set checkActionMode(value: boolean) {
    if (value !== undefined) this.checkAction = value;
  }

  @Input() set pointedArtworks(value: any) {
    if (value && value.length > 0) {
      this.chosenArtworks = [];
      this.selectArtworks(value);
    } else {
      this.artworks.map(artwork => {
        artwork.selected = false;
      });
    }
  }

  @Input() set buttonsShow(value: any) {
    this.arrButtons = value;
    value.map(item => {
      this.buttons[item] = true;
    });
  }

  ngOnInit() {
    this.changeSorting(this.sorting[5]);
    this._currentProfile = this._storage.get('profile') ? this._storage.get('profile').id : '';
    setTimeout(() => {
      if (this._commonService.previousRouteUrl === '/pages/artworks/all') {
        if (this._commonService.createdItem) {
          this._toastr.success('Artwork ' + this._commonService.createdItem + ' was created', 'Success');
          this._commonService.createdItem = null;
        }
      }
    });
  }

  checkDate(dataDate) {
    const date: any = new Date(dataDate);
    const month = date.getMonth();
    const day = date.getDate();
    if ((month.toString() === '01' || month.toString() === '1' || month.toString() === '0') &&
      (day.toString() === '01' || day.toString() === '1')) {
      return false;
    } else {
      return true;
    }
  }

  getCategoriesCount() {
    this._artworkService.getCategoriesByProfile(this._currentProfile).subscribe(res => {
      const catCount = res.categories;
      this.categoriesArt.map(cat => {
        catCount.map(item => {
          if (item._id === cat._id) {
            cat.count = item.artworks ? item.artworks.length : 0;
          }
        });
        cat.selected = false;
      });
    });
  }

  selectArtworks(value) {
    value.map(id => {
      this.artworks.map(artwork => {
        if (id === artwork._id) {
          artwork.selected = true;
          this.chosenArtworks.push(artwork);
        }
      });
    });
  }

  send(form: NgForm, clear?: boolean) {
    const value = form.value.search;
    if (!clear) {
      if (value && value.length > 0) {
        this.needUpdate.emit(value);
      } else {
        this.needUpdate.emit(true);
      }
    } else {
      form.reset();
      this.needUpdate.emit(true);
    }
  }

  select(index, event?) {
    if (this.artworks[index].selected !== undefined) {
      this.artworks[index].selected = !this.artworks[index].selected;
    } else {
      this.artworks[index].selected = true;
    }

    const exist = this.chosenArtworks.filter(art => art._id === this.artworks[index]._id);

    if (!exist || (exist && exist.length < 1)) this.chosenArtworks.push(this.artworks[index]);

    this.countSelected = this.checkCount(this.chosenArtworks);
  }

  checkCount(artworks) {
    // let selectedArr = []; TODO OLD
    // let count = 0;
    // artworks.map(item => {
    //   if (item.selected) {
    //     selectedArr.push(item);
    //     count++;
    //   }
    // });

    const selectedArr = artworks;
    this.chosenArtworks = selectedArr;
    this.selectedItems.emit(selectedArr);
    return selectedArr.length;
  }

  selectAll() {
    if (!this.selectedAll) {
      this.artworks.map(item => {
        item.selected = true;

        const exist = this.chosenArtworks.filter(art => art._id === item._id);
        if (!exist || (exist && exist.length < 1)) this.chosenArtworks.push(item);
      });

      this.selectedAll = true;
      // this.countSelected = this.artworks.length; TODO OLD
      this.countSelected = this.checkCount(this.chosenArtworks);
    } else {
      this.artworks.map(item => {
        item.selected = false;
      });
      this.chosenArtworks = [];
      this.selectedAll = false;
      this.countSelected = 0;
    }
  }

  openModal(modal: TemplateRef<any>, currentArtwork?, portfolio?) {
    this.currentArtwork = currentArtwork;
    this._dialogService.open(modal);
    if (portfolio) this.countSelected = 0;
  }

  deleteArtwork(artwork, ref) {
    this._artworkService.removeArtwork(artwork._id).subscribe(res => {
      this.needUpdate.emit(true); // <-- this instead - this.getArtworks(this._currentProfile);
      this.currentArtwork = {};
      ref.close();
    });
  }

  addToPortfolio(ref) {
    let last: boolean;
    let ind = 0;
    if (this.currentPortfolios && this.currentPortfolios.length > 0) {
      this.currentPortfolios.map((portfolio, index) => {
        const artworksArr = [];
        if (ind === this.currentPortfolios.length - 1) last = true;
        ind++;
        this.selectedArtworks.map(artwork => {
          artworksArr.push(artwork._id);
        });

        const idsArtworks = Array.from(new Set([...portfolio.artworks, ...artworksArr]));

        this.updateData(ref, idsArtworks, portfolio._id, last);
      });
    }
  }

  updateData(ref, artworksArr, portfolioId, last) {
    this._portfolioService.updatePortfolio(portfolioId, {artworks: artworksArr}).subscribe(res => {
      if (last) {
        this.needUpdate.emit(true);
        ref.close();
      }
    }, error => {
      console.error(error);
      if (last) {
        ref.close();
      }
    });
  }

  selectPortfolios(value) {
    this.currentPortfolios = value;
    this.portfoliosId = this.currentPortfolios.map(artwork => artwork._id);
  }

  removeEmmit(artwork) {
    this.removeItem.emit(artwork);
  }

  changeView(type) {
    this.view = type;
  }

  getCategories() {
    this._artworkService.getCategories().subscribe(res => {
      this.categoriesArt = res.categories;
      this.artworks.map(artwork => {

        this.categoriesArt.map(cat => {
          if (cat.id === artwork.category) artwork['catName'] = cat.title;
        });

      });

      this.getCategoriesCount();
    }, error => {
      console.error('error', error);
    });
  }

  action(type?) {
    // {artworks: this.chosenArtworks, type: type} -------- OLD solution
    this.actionItems.emit({artworks: this.chosenArtworks, type: type});
    if (type === 'storage' || type === 'addToExh' || type === 'remove') this.countSelected = 0;
  }

  selectCat(index, category?) {
    this.categoriesArt[index].selected = !this.categoriesArt[index].selected;
  }

  pageChanged(page) {
    this.emitPage.emit(page);
  }

  changeSorting(sort) {
    this.emitSort.emit(sort);
    this.curSorting = sort;
  }

  filter() {
    const categories = [];
    this.categoriesArt.map(cat => {
      if (cat.selected) categories.push(cat.id);
    });

    const data = {
      from: this._commonService.organizeDate(this.selectedFrom),
      to: this._commonService.organizeDate(this.selectedTo),
      categories: categories
    };

    this.emitFilter.emit(data);
    this.showFilter = !this.showFilter;
  }

  clear() {
    this.selectedFrom = '';
    this.selectedTo = '';
    this.categoriesArt.map(cat => {
      cat.selected = false;
    });

    const data = {
      from: '',
      to: '',
      categories: []
    };

    this.emitFilter.emit(data);
  }

  selectDate(datepicker, varName, event) {
    this[varName] = event;
    datepicker.close();
  }
}
