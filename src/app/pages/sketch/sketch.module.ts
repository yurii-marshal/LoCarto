import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SketchComponent } from './sketch.component';
import { ThemeModule } from '../../common/theme.module';
import { EditSketchComponent } from './edit-sketch/edit-sketch.component';
import { NgxImageGalleryModule } from 'ngx-image-gallery';

@NgModule({
  imports: [
    CommonModule,
    ThemeModule,
    NgxImageGalleryModule
  ],
  declarations: [
    SketchComponent,
    EditSketchComponent
  ],
  exports: [SketchComponent]
})
export class SketchModule { }
