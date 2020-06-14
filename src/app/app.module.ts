/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import {APP_BASE_HREF} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {CoreModule} from './@core/core.module';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {ThemeModule} from './common/theme.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {RegisterModule} from './pages/auth/register/register.module';
import {LoginModule} from './pages/auth/login/login.module';
import {AuthGuardService} from './services/auth-guard.service';
import {AppConfig} from './app.config';
import {HttpModule} from '@angular/http';
import {CommonService} from './services/common.service';
import {ProfileService} from './services/profile.service';
import {VerifyModule} from './pages/verify/verify.module';

import {ForgotModule} from './pages/auth/forgot/forgot.module';
import {ArtStorageService} from './services/art-storage.service';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {ArtworkService} from './services/artwork.service';
import {PortfolioService} from './services/portfolio.service';
import {SketchesService} from './services/sketches.service';
import {ProgressHttpModule} from 'angular-progress-http';
import {ExhibitionsModule} from './pages/exhibitions/exhibitions.module';
import {AgmCoreModule} from '@agm/core';
import {ExhibitionsService} from './services/exhibitions.service';
import {AuthService} from './services/auth/auth.service';
import {BaseSecureApiService} from './services/api/base-secure.api.service';
import {BaseApiService} from './services/auth/base-api.service';
import {ToastrModule} from 'ngx-toastr';

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    ProgressHttpModule,
    BrowserAnimationsModule,
    HttpModule,
    HttpClientModule,
    AppRoutingModule,

    NgbModule.forRoot(),
    ThemeModule.forRoot(),
    CoreModule.forRoot(),
    RegisterModule,
    LoginModule,
    VerifyModule,
    ForgotModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    ExhibitionsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyApMdqOPUNEd8BZADqFKENyAIr9EUCSifM',
      libraries: ['places'],
    }),
    ToastrModule.forRoot(),
  ],
  bootstrap: [AppComponent],
  providers: [
    {provide: APP_BASE_HREF, useValue: '/'},
    AuthGuardService,
    AuthService,
    BaseApiService,
    BaseSecureApiService,
    AppConfig,
    AuthService,
    CommonService,
    ProfileService,
    ArtStorageService,
    ArtworkService,
    PortfolioService,
    SketchesService,
    ExhibitionsService,
  ],
})
export class AppModule {
}
