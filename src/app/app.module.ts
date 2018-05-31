import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpModule, JsonpModule } from '@angular/http';
import { AppRoutingModule } from './app-routing.module';
import { QRCodeModule } from 'angular2-qrcode';
import { Ng2DeviceDetectorModule } from 'ng2-device-detector';


import { enableProdMode } from '@angular/core';

// Plugin
import { SweetAlert2Module } from '@toverux/ngsweetalert2';
import { MyDatePickerModule } from 'mydatepicker';

// Primeng [元件組-僅用到此工具的上傳]
import { AccordionModule } from 'primeng/primeng';
import { MenuItem } from 'primeng/primeng';
import { FileUploadModule } from 'primeng/primeng';
import { NgxPaginationModule } from 'ngx-pagination';

// Component
import { LoginComponent } from './component/modal/login/login.component';
import { SignupComponent } from './component/modal/signup/signup.component';

// Container
import { AppComponent } from './app.component';
import { NavComponent } from './container/nav/nav.component';
import { HomeComponent } from './container/home/home.component';
import { FooterComponent } from './container/footer/footer.component';
import { UserComponent } from './container/user/user.component';
import { ProfileComponent } from './container/user/profile/profile.component';
import { PointComponent } from './container/user/point/point.component';
import { SearchComponent } from './container/search/search.component';
import { ManagementComponent } from './container/user/management/management.component';
import { ExpmanagementComponent } from './container/user/expmanagement/expmanagement.component';

// Container / Mission
import { CreateComponent } from './container/mission/create/create.component';
import { IntroduceComponent } from './container/mission/introduce/introduce.component';

// Container / Mission / Detail
import { ExpComponent } from './container/mission/exp/exp.component';

// import { ImageCropperComponent, CropperSettings } from 'ng2-img-cropper';
import { ImageCropperModule } from 'ng2-img-cropper';
import { PunchinComponent } from './container/mission/punchin/punchin.component';
import { PunchinstatusComponent } from './container/mission/punchinstatus/punchinstatus.component';
import { SignatureComponent } from './container/mission/signature/signature.component';
import { CutURL } from './class/mission/punchinstatuscutUrl';
import { ErrorComponent } from './container/error/error.component';
import { BrowsercheckComponent } from './container/browsercheck/browsercheck.component';

enableProdMode();

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    FooterComponent,
    UserComponent,
    LoginComponent,
    SignupComponent,
    ProfileComponent,
    PointComponent,
    SearchComponent,
    CreateComponent,
    IntroduceComponent,
    ExpComponent,
    ManagementComponent,
    ExpmanagementComponent,
    PunchinComponent,
    PunchinstatusComponent,
    SignatureComponent,
    BrowsercheckComponent,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    JsonpModule,
    AppRoutingModule,
    QRCodeModule,
    SweetAlert2Module.forRoot({
      // buttonsStyling: false,
      // customClass: 'modal-content',
      // confirmButtonClass: 'btn btn-lg btn-primary',
      // cancelButtonClass: 'btn btn-lg'
    }),
    Ng2DeviceDetectorModule.forRoot(),
    AccordionModule,
    FileUploadModule,
    MyDatePickerModule,
    NgxPaginationModule,
    ImageCropperModule
  ],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }, CutURL],
  bootstrap: [AppComponent]
})
export class AppModule { }
