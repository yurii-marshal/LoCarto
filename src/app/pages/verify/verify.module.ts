import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerifyComponent } from './verify.component';
import { PassComponent } from './pass/pass.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [VerifyComponent, PassComponent],
  exports: [VerifyComponent, PassComponent]
})
export class VerifyModule { }
