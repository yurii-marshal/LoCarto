import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { NotFoundComponent } from './miscellaneous/not-found/not-found.component';
import { AddProfileComponent } from './profile/add-profile/add-profile.component';
import { ProfileComponent } from './profile/profile.component';
import { EditProfileComponent } from './profile/edit-profile/edit-profile.component';
import { NewProfileComponent } from './profile/new-profile/new-profile.component';
import { ArtStoragesComponent } from './art-storages/art-storages.component';
import { ArtStorageComponent } from './art-storages/art-storage/art-storage.component';
import { SettingsComponent } from './settings/settings.component';
import { ArtWorksComponent } from './art-works/art-works.component';
import { AddArtworkComponent } from '../common/components/artworks/add-artwork/add-artwork.component';
import { EditArtworkComponent } from '../common/components/artworks/edit-artwork/edit-artwork.component';
import { SketchComponent } from './sketch/sketch.component';
import { PortfolioSingleComponent } from './portfolio-single/portfolio-single.component';
import { EditSketchComponent } from './sketch/edit-sketch/edit-sketch.component';
import { ExhibitionsComponent } from './exhibitions/exhibitions.component';
import { AddExhibitionComponent } from './exhibitions/add-exhibition/add-exhibition.component';
import { EditExhibitionComponent } from './exhibitions/edit-exhibition/edit-exhibition.component';
import { ContactsComponent } from './contacts/contacts.component';
import { FileStorageComponent } from './file-storage/file-storage.component';
import { CommunicationComponent } from './communication/communication.component';
import { ConsignmentComponent } from './consignment/consignment.component';
import { AddPastExhibitionComponent } from './exhibitions/add-past-exhibition/add-past-exhibition.component';
import { TemplatesComponent } from './templates/templates.component';
import { CvComponent } from './cv/cv.component';
import { EducationsComponent } from './cv/educations/educations.component';
import { SoloExhibitionsComponent } from './cv/solo-exhibitions/solo-exhibitions.component';
import { GroupExhibitionsComponent } from './cv/group-exhibitions/group-exhibitions.component';
import { GrantsComponent } from './cv/grants/grants.component';
import { PressComponent } from './cv/press/press.component';
import { CollectionsComponent } from './cv/collections/collections.component';
import { CommissionsComponent } from './cv/commissions/commissions.component';
import { AuthGuardService } from '../services/auth-guard.service';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [{
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'profile-adding',
    component: AddProfileComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'profile-edit-profile',
    component: EditProfileComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'profile-new-profile',
    component: NewProfileComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'art-storages',
    component: ArtStoragesComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'art-storages/:id',
    component: ArtStorageComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'settings/:type',
    component: SettingsComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'artworks/:type',
    component: ArtWorksComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'artwork',
    component: AddArtworkComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'artwork/:id',
    component: EditArtworkComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'sketch',
    component: SketchComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'sketch/:id',
    component: EditSketchComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'portfolio/:id',
    component: PortfolioSingleComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'exhibitions/add',
    component: AddExhibitionComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'exhibitions/add-past',
    component: AddPastExhibitionComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'exhibitions/edit/:id',
    component: EditExhibitionComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'exhibitions',
    component: ExhibitionsComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'commissions',
    component: CommissionsComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'contacts',
    component: ContactsComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'file-storage',
    component: FileStorageComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'communication',
    component: CommunicationComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'consignment',
    component: ConsignmentComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'collections',
    component: CollectionsComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'templates',
    component: TemplatesComponent,
    canActivate: [AuthGuardService],
  }, {
    path: 'cv',
    component: CvComponent,
    canActivate: [AuthGuardService],
  }, {
    path: 'cv/educations',
    component: EducationsComponent,
    canActivate: [AuthGuardService],
  }, {
    path: 'cv/solo-exhibitions',
    component: SoloExhibitionsComponent,
    canActivate: [AuthGuardService],
  }, {
    path: 'cv/group-exhibitions',
    component: GroupExhibitionsComponent,
    canActivate: [AuthGuardService],
  }, {
    path: 'cv/collections',
    component: CollectionsComponent,
    canActivate: [AuthGuardService],
  }, {
    path: 'cv/commissions',
    component: CommissionsComponent,
    canActivate: [AuthGuardService],
  }, {
    path: 'cv/grants',
    component: GrantsComponent,
    canActivate: [AuthGuardService],
  }, {
    path: 'cv/press',
    component: PressComponent,
    canActivate: [AuthGuardService],
  },
  // {
  //   path: 'old-dashboard',
  //   component: ECommerceComponent,
  //   canActivate: [AuthGuardService]
  // }, {
  //   path: 'iot-old-dashboard',
  //   component: DashboardComponent,
  //   canActivate: [AuthGuardService]
  // },{
  //   path: 'old-ui-features',
  //   loadChildren: './old-ui-features/old-ui-features.module#UiFeaturesModule',
  //   canActivate: [AuthGuardService]
  // }, {
  //   path: 'old-components',
  //   loadChildren: './old-components/old-components.module#ComponentsModule',
  //   canActivate: [AuthGuardService]
  // }, {
  //   path: 'old-maps',
  //   loadChildren: './old-maps/old-maps.module#MapsModule',
  //   canActivate: [AuthGuardService]
  // }, {
  //   path: 'old-charts',
  //   loadChildren: './old-charts/old-charts.module#ChartsModule',
  //   canActivate: [AuthGuardService]
  // }, {
  //   path: 'old-editors',
  //   loadChildren: './old-editors/old-editors.module#EditorsModule',
  //   canActivate: [AuthGuardService]
  // }, {
  //   path: 'old-forms',
  //   loadChildren: './old-forms/old-forms.module#FormsModule',
  //   canActivate: [AuthGuardService]
  // }, {
  //   path: 'old-tables',
  //   loadChildren: './old-tables/old-tables.module#TablesModule',
  //   canActivate: [AuthGuardService]
  // }, {
  //   path: 'miscellaneous',
  //   loadChildren: './miscellaneous/miscellaneous.module#MiscellaneousModule',
  //   canActivate: [AuthGuardService]
  // },
  {
    path: '',
    redirectTo: 'profile',
    pathMatch: 'full',
  }, {
    path: '**',
    component: NotFoundComponent,
  }],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
