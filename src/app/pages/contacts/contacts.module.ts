import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactsComponent } from './contacts.component';
import { ThemeModule } from '../../common/theme.module';

@NgModule({
  imports: [
    CommonModule,
    ThemeModule
  ],
  declarations: [ContactsComponent],
  exports: [ContactsComponent]
})
export class ContactsModule { }
