import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvComponent } from './cv.component';
import { EducationsComponent } from './educations/educations.component';
import { CollectionsComponent } from './collections/collections.component';
import { CommissionsComponent } from './commissions/commissions.component';
import { GrantsComponent } from './grants/grants.component';
import { GroupExhibitionsComponent } from './group-exhibitions/group-exhibitions.component';
import { PressComponent } from './press/press.component';
import { SoloExhibitionsComponent } from './solo-exhibitions/solo-exhibitions.component';
import { ThemeModule } from '../../common/theme.module';

const CV_COMPONENTS = [
  CvComponent,
  CollectionsComponent,
  CommissionsComponent,
  EducationsComponent,
  GrantsComponent,
  GroupExhibitionsComponent,
  PressComponent,
  SoloExhibitionsComponent,
];

@NgModule({
  imports: [
    CommonModule,
    ThemeModule,
  ],
  declarations: [...CV_COMPONENTS]
})
export class CvModule {
}
