import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExhibitionsComponent } from './exhibitions.component';
import { ThemeModule } from '../../common/theme.module';
import { AddExhibitionComponent } from './add-exhibition/add-exhibition.component';
import { EditExhibitionComponent } from './edit-exhibition/edit-exhibition.component';
import { NbDatepickerModule, NbDialogModule } from '@nebular/theme';
import { AddPastExhibitionComponent } from './add-past-exhibition/add-past-exhibition.component';

@NgModule({
  imports: [
    CommonModule,
    ThemeModule,
    NbDialogModule.forRoot(),
    NbDatepickerModule.forRoot()
  ],
  declarations: [
    ExhibitionsComponent,
    AddExhibitionComponent,
    EditExhibitionComponent,
    AddPastExhibitionComponent
  ],
  exports: [
    ExhibitionsComponent,
    AddExhibitionComponent,
    EditExhibitionComponent,
    AddPastExhibitionComponent
  ]
})
export class ExhibitionsModule { }
