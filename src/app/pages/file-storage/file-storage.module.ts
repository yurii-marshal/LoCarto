import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileStorageComponent } from './file-storage.component';
import { ThemeModule } from '../../common/theme.module';

@NgModule({
  imports: [
    CommonModule,
    ThemeModule
  ],
  declarations: [FileStorageComponent],
  exports: [FileStorageComponent]
})
export class FileStorageModule { }
