import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { ThemeModule } from '../common/theme.module';
import { ProfileModule } from './profile/profile.module';
import { ArtStoragesModule } from './art-storages/art-storages.module';
import { SettingsModule } from './settings/settings.module';
import { ArtWorksModule } from './art-works/art-works.module';
import { SketchModule } from './sketch/sketch.module';
import { PortfolioSingleModule } from './portfolio-single/portfolio-single.module';
import { ExhibitionsModule } from './exhibitions/exhibitions.module';
import { ContactsModule } from './contacts/contacts.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { CommunicationModule } from './communication/communication.module';
import { ConsignmentModule } from './consignment/consignment.module';
import { TemplatesModule } from './templates/templates.module';
import { CvModule } from './cv/cv.module';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';

const PAGES_COMPONENTS = [
  PagesComponent,
];

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    ProfileModule,
    MiscellaneousModule,
    ArtStoragesModule,
    SettingsModule,
    ArtWorksModule,
    SketchModule,
    PortfolioSingleModule,
    ExhibitionsModule,
    ContactsModule,
    FileStorageModule,
    CommunicationModule,
    ConsignmentModule,
    TemplatesModule,
    CvModule
  ],
  declarations: [
    ...PAGES_COMPONENTS,
  ],
})
export class PagesModule {
}
