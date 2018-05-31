import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Ng2DeviceService } from 'ng2-device-detector';
import { SwalComponent } from '@toverux/ngsweetalert2';

@Component({
  selector: 'app-browsercheck',
  templateUrl: './browsercheck.component.html',
  styleUrls: ['./browsercheck.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BrowsercheckComponent implements OnInit {
  url: any = {
    ishare: '/home',
    download: 'https://www.google.com.tw/chrome/'
  }
  @ViewChild('dialogCheck') private swalDialogCheck: SwalComponent;
  @ViewChild('dialogOld') private swalDialogOld: SwalComponent;
  constructor(
    private deviceService: Ng2DeviceService
  ) { }

  ngOnInit() {
    Cookie.get('checkBrowser') ? window.location.href = this.url.ishare : this.checkBrowser();
  }

  public checkBrowser() {
    setTimeout(() => {
      switch (this.deviceService.getDeviceInfo().browser) {
        case 'chrome':
          Cookie.set('checkBrowser', 'checkOK');
          window.location.href = this.url.ishare;
          break;
        case 'firefox':
        case 'ms-edge':
          // this.swalDialogCheck.show();
          setTimeout(() => {
            Cookie.set('checkBrowser', 'checkOK');
            window.location.href = this.url.ishare;
          }, 1000);
          break;
        case 'ie':
          // 請到index.html
          // this.swalDialogOld.show();
          window.location.href = this.url.download;
          break;
        default:
          // this.swalDialogCheck.show();
          Cookie.set('checkBrowser', 'checkOK');
          window.location.href = this.url.ishare;
          break;
      }
    }, 4000);
  }
}
