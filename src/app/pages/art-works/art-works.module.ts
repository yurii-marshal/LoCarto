import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtWorksComponent } from './art-works.component';
import { ThemeModule } from '../../common/theme.module';
import { TranslateModule } from '@ngx-translate/core';
import { FileDropModule } from 'ngx-file-drop';
import { EditArtworkComponent } from '../../common/components/artworks/edit-artwork/edit-artwork.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NgxImageGalleryModule } from 'ngx-image-gallery';

@NgModule({
  imports: [
    CommonModule,
    ThemeModule,
    TranslateModule,
    Ng2SmartTableModule,
    NgxImageGalleryModule,
    FileDropModule
  ],
  declarations: [
    ArtWorksComponent,
    EditArtworkComponent
  ],
  exports: [
    ArtWorksComponent,
    EditArtworkComponent
  ]
})
export class ArtWorksModule { }
