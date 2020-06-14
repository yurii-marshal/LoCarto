import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsignmentComponent } from './consignment.component';
import { ThemeModule } from '../../common/theme.module';

@NgModule({
  imports: [
    CommonModule,
    ThemeModule
  ],
  declarations: [ConsignmentComponent],
  exports: [ConsignmentComponent]
})
export class ConsignmentModule { }
