import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtStoragesComponent } from './art-storages.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NbButtonModule, NbCardModule, NbInputModule, NbSpinnerModule } from '@nebular/theme';
import { ArtStorageComponent } from './art-storage/art-storage.component';
import { ThemeModule } from '../../common/theme.module';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NbInputModule,
    NbCardModule,
    NbButtonModule,
    NbSpinnerModule,
    ThemeModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyApMdqOPUNEd8BZADqFKENyAIr9EUCSifM",
      libraries: ["places"]
    }),
    GooglePlaceModule
  ],
  declarations: [
    ArtStoragesComponent,
    ArtStorageComponent
  ],
  exports: [
    ArtStoragesComponent,
    ArtStorageComponent
  ]
})
export class ArtStoragesModule { }
