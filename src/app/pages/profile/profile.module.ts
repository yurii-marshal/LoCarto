import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { AddProfileComponent } from './add-profile/add-profile.component';
import {
  NbButtonModule,
  NbCardModule, NbDatepickerModule,
  NbDialogModule,
  NbInputModule, NbRadioModule, NbSelectModule, NbSpinnerModule,
  NbTabsetModule,
  NbUserModule
} from '@nebular/theme';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ThemeModule } from '../../common/theme.module';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { NewProfileComponent } from './new-profile/new-profile.component';
import { AgmCoreModule } from '@agm/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { DateViewModule } from '../../common/directives/date-view.module';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

@NgModule({
  imports: [
    CommonModule,
    NbCardModule,
    NbTabsetModule,
    NbUserModule,
    NbButtonModule,
    NbInputModule,
    FormsModule,
    RouterModule,
    ThemeModule,
    NbDialogModule.forRoot(),
    NbRadioModule,
    NbDatepickerModule.forRoot(),
    NbSpinnerModule,
    NbSelectModule,
    NgSelectModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    DateViewModule,
    GooglePlaceModule
  ],
  declarations: [
    ProfileComponent,
    AddProfileComponent,
    EditProfileComponent,
    NewProfileComponent,
  ],
  exports: [
    ProfileComponent,
    AddProfileComponent
  ]
})
export class ProfileModule { }
