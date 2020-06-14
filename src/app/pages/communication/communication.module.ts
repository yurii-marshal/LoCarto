import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunicationComponent } from './communication.component';
import { ThemeModule } from '../../common/theme.module';

@NgModule({
  imports: [
    CommonModule,
    ThemeModule
  ],
  declarations: [CommunicationComponent],
  exports: [CommunicationComponent]
})
export class CommunicationModule { }
