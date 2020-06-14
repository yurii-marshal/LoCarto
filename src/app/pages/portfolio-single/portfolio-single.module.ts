import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioSingleComponent } from './portfolio-single.component';
import { ThemeModule } from '../../common/theme.module';

@NgModule({
  imports: [
    CommonModule,
    ThemeModule
  ],
  declarations: [PortfolioSingleComponent],
  exports: [PortfolioSingleComponent]
})
export class PortfolioSingleModule { }
