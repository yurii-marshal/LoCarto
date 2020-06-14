import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateViewDirective } from './date-view.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [DateViewDirective],
  exports: [DateViewDirective]
})
export class DateViewModule { }
