import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SlimLoadingBarModule} from 'ng2-slim-loading-bar';

import {
  NbActionsModule,
  NbCardModule,
  NbLayoutModule,
  NbMenuModule,
  NbRouteTabsetModule,
  NbSearchModule,
  NbSidebarModule,
  NbTabsetModule,
  NbThemeModule,
  NbUserModule,
  NbCheckboxModule,
  NbPopoverModule,
  NbContextMenuModule,
  NbProgressBarModule,
  NbSpinnerModule,
  NbButtonModule,
  NbInputModule,
  NbSelectModule,
  NbDatepickerModule,
  NbRadioModule, NbTooltipModule
} from '@nebular/theme';

import {NbSecurityModule} from '@nebular/security';

import {
  FooterComponent,
  HeaderComponent,
  SearchInputComponent,
  SwitcherComponent,
  SocialsComponent
} from './components';
import {
  CapitalizePipe,
  PluralPipe,
  RoundPipe,
  TimingPipe,
  NumberWithCommasPipe,
} from './pipes';
import {
  OneColumnLayoutComponent,
  SampleLayoutComponent,
  ThreeColumnsLayoutComponent,
  TwoColumnsLayoutComponent,
} from './layouts';
import {DEFAULT_THEME} from './styles/theme.default';
import {COSMIC_THEME} from './styles/theme.cosmic';
import {CORPORATE_THEME} from './styles/theme.corporate';
import {RouterModule} from '@angular/router';
import {ArtworksComponent} from './components/artworks/artworks.component';
import {SketchesComponent} from './components/sketches/sketches.component';
import {TagsComponent} from './components/tags/tags.component';
import {AddArtworkComponent} from './components/artworks/add-artwork/add-artwork.component';
import {TranslateModule} from '@ngx-translate/core';
import {FileDropModule} from 'ngx-file-drop';
import {NgxDnDModule} from '@swimlane/ngx-dnd';
import {PortfoliosComponent} from './components/portfolios/portfolios.component';
import {ProgressBarComponent} from './components/progress-bar/progress-bar.component';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {PaginationComponent} from './components/pagination/pagination.component';
import {DateViewModule} from './directives/date-view.module';
import {ProofInfoComponent} from './components/proof-info/proof-info.component';
import {SafePipe} from './pipes/safe.pipe';
import {ExhibitionsListComponent} from './components/exhibitions/exhibitions-list/exhibitions-list.component';
import {GeneratorEditionsComponent} from './components/generator-editions/generator-editions.component';
import {EditionsListComponent} from './components/editions-list/editions-list.component';
import {SearchTopPanelComponent} from './components/search-top-panel/search-top-panel.component';
import {ExhibitionAddingComponent} from './components/exhibitions/exhibition-adding/exhibition-adding.component';
import {ExhBasicComponent} from './components/exhibitions/exhibition-adding/exh-basic/exh-basic.component';
import {ExhBannerComponent} from './components/exhibitions/exhibition-adding/exh-banner/exh-banner.component';
import {ExhPhotosComponent} from './components/exhibitions/exhibition-adding/exh-photos/exh-photos.component';
import {ExhMembersComponent} from './components/exhibitions/exhibition-adding/exh-members/exh-members.component';
import {GooglePlaceModule} from 'ngx-google-places-autocomplete';
import {ExhFinalComponent} from './components/exhibitions/exhibition-adding/exh-final/exh-final.component';
import {ExhEditGeneralComponent} from './components/exhibitions/exhibition-editing/exh-edit-general/exh-edit-general.component';
import {ExhEditArtworksComponent} from './components/exhibitions/exhibition-editing/exh-edit-artworks/exh-edit-artworks.component';
import {ExhEditPhotosComponent} from './components/exhibitions/exhibition-editing/exh-edit-photos/exh-edit-photos.component';
import {ExhEditNotificationsComponent} from './components/exhibitions/exhibition-editing/exh-edit-notifications/exh-edit-notifications.component';
import {ExhEditMembersComponent} from './components/exhibitions/exhibition-editing/exh-edit-members/exh-edit-members.component';
import {NgxImageGalleryModule} from 'ngx-image-gallery';
import {ExhEditArtworkComponent} from './components/exhibitions/exhibition-editing/exh-edit-artwork/exh-edit-artwork.component';
import {ArtistAddingComponent} from './components/artist/artist-adding/artist-adding.component';
import {ArtistAddBasicComponent} from './components/artist/artist-adding/artist-add-basic/artist-add-basic.component';
import {ProfileAddPhotosComponent} from './components/profile/profile-add-photos/profile-add-photos.component';
import {CollectorAddingComponent} from './components/collector/collector-adding/collector-adding.component';
import {ProfileFinalComponent} from './components/profile/profile-final/profile-final.component';
import {ArtistAddAboutComponent} from './components/artist/artist-adding/artist-add-about/artist-add-about.component';
import {CollectorAddBasicComponent} from './components/collector/collector-adding/collector-add-basic/collector-add-basic.component';
import {ArtistEditComponent} from './components/artist/artist-edit/artist-edit.component';
import {ProfileEditPhotosComponent} from './components/profile/profile-edit-photos/profile-edit-photos.component';
import {CollectorEditComponent} from './components/collector/collector-edit/collector-edit.component';
import {ArtworkAddCategoryComponent} from './components/artworks/add-artwork/artwork-add-category/artwork-add-category.component';
import {ArtworkAddBasicComponent} from './components/artworks/add-artwork/artwork-add-basic/artwork-add-basic.component';
import {ArtworkAddLocationComponent} from './components/artworks/add-artwork/artwork-add-location/artwork-add-location.component';
import {ArtworkAddGalleryComponent} from './components/artworks/add-artwork/artwork-add-gallery/artwork-add-gallery.component';
import {ArtworkAddFinalComponent} from './components/artworks/add-artwork/artwork-add-final/artwork-add-final.component';
import {ArtworkEditBasicComponent} from './components/artworks/edit-artwork/artwork-edit-basic/artwork-edit-basic.component';
import {ArtworkEditLocationComponent} from './components/artworks/edit-artwork/artwork-edit-location/artwork-edit-location.component';
import {ArtworkEditFilesComponent} from './components/artworks/edit-artwork/artwork-edit-files/artwork-edit-files.component';
import {Ng2TelInputModule} from 'ng2-tel-input';
import {PhoneInputComponent} from './components/phone-input/phone-input.component';
import {FilterPipe} from './pipes/filter.pipe';
import {NgxSelectModule} from 'ngx-select-ex';

const BASE_MODULES = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterModule,
  TranslateModule,
  NgbModule,
  FileDropModule,
  NgxDnDModule,
  SlimLoadingBarModule,
  RoundProgressModule,
  OwlDateTimeModule,
  OwlNativeDateTimeModule,
  DateViewModule,
  GooglePlaceModule,
  NgxImageGalleryModule,
  NgxSelectModule
];

const NB_MODULES = [
  NbCardModule,
  NbLayoutModule,
  NbTabsetModule,
  NbRouteTabsetModule,
  NbMenuModule,
  NbUserModule,
  NbActionsModule,
  NbSearchModule,
  NbSidebarModule,
  NbCheckboxModule,
  NbPopoverModule,
  NbContextMenuModule,
  NbSecurityModule, // *nbIsGranted directive,
  NbProgressBarModule,
  NbInputModule,
  NbCardModule,
  NbButtonModule,
  NbSpinnerModule,
  NbSelectModule,
  NbDatepickerModule,
  NbRadioModule,
  NbTooltipModule
];

const COMPONENTS = [
  SwitcherComponent,
  HeaderComponent,
  FooterComponent,
  SearchInputComponent,
  OneColumnLayoutComponent,
  SampleLayoutComponent,
  ThreeColumnsLayoutComponent,
  TwoColumnsLayoutComponent,
  SocialsComponent,
  ArtworksComponent,
  SketchesComponent,
  TagsComponent,
  AddArtworkComponent,
  PortfoliosComponent,
  ProgressBarComponent,
  PaginationComponent,
  ProofInfoComponent,
  ExhibitionsListComponent,
  GeneratorEditionsComponent,
  EditionsListComponent,
  SearchTopPanelComponent,
  ExhibitionAddingComponent,
  ExhBasicComponent,
  ExhBannerComponent,
  ExhPhotosComponent,
  ExhMembersComponent,
  ExhFinalComponent,
  ExhEditGeneralComponent,
  ExhEditArtworksComponent,
  ExhEditPhotosComponent,
  ExhEditNotificationsComponent,
  ExhEditMembersComponent,
  ExhEditArtworkComponent,
  ArtistAddingComponent,
  ArtistAddAboutComponent,
  ArtistAddBasicComponent,
  ProfileAddPhotosComponent,
  CollectorAddingComponent,
  ProfileFinalComponent,
  CollectorAddBasicComponent,
  ArtistEditComponent,
  ProfileEditPhotosComponent,
  CollectorEditComponent,
  ArtworkAddCategoryComponent,
  ArtworkAddBasicComponent,
  ArtworkAddLocationComponent,
  ArtworkAddGalleryComponent,
  ArtworkAddFinalComponent,
  ArtworkEditBasicComponent,
  ArtworkEditLocationComponent,
  ArtworkEditFilesComponent,
  PhoneInputComponent
];

const PIPES = [
  CapitalizePipe,
  PluralPipe,
  RoundPipe,
  TimingPipe,
  NumberWithCommasPipe,
  SafePipe,
  FilterPipe
];

const NB_THEME_PROVIDERS = [
  ...NbThemeModule.forRoot(
    {
      name: 'default',
    },
    [DEFAULT_THEME, COSMIC_THEME, CORPORATE_THEME],
  ).providers,
  ...NbSidebarModule.forRoot().providers,
  ...NbMenuModule.forRoot().providers,
];

const INPUT_PHONE_MODULES = [
  Ng2TelInputModule,
];

@NgModule({
  imports: [
    ...BASE_MODULES,
    ...NB_MODULES,
    RouterModule,
    ...INPUT_PHONE_MODULES
  ],
  exports: [...BASE_MODULES, ...NB_MODULES, ...COMPONENTS, ...PIPES],
  declarations: [...COMPONENTS, ...PIPES]
})
export class ThemeModule {
  static forRoot(): ModuleWithProviders {
    return <ModuleWithProviders>{
      ngModule: ThemeModule,
      providers: [...NB_THEME_PROVIDERS],
    };
  }
}
