import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { SwalComponent } from '@toverux/ngsweetalert2';
import { UserService } from '../../service/user/user.service';
import { MissionService } from '../../service/mission/mission.service';
import { NoticationService } from '../../service/notification/notification.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';

declare let jquery: any;
declare let $: any;

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
  providers: [MissionService, UserService, NoticationService],
  // host: {
  //   '(window:scroll)': 'onScroll($event)'
  // }
})
export class NavComponent implements OnInit {
  @ViewChild('dialogPass') private swalDialogPass: SwalComponent;
  @ViewChild('dialogPassError') private swalDialogPassError: SwalComponent;
  @ViewChild('dialogPassOut') private swalDialogPassOut: SwalComponent;
  @ViewChild('dialogWarning') private swalDialogWarning: SwalComponent;
  public userData: any; // 存放使用者資料
  public isLogin: Boolean = false;
  public readyLogin: Boolean = true;
  public logingroup: any = 0;
  public img: any = '';
  public point: any;
  public name: any;
  public rwd: Boolean = false;
  public data: any[];
  public datacount = 0;

  constructor(
    private router: ActivatedRoute,
    private route: Router,
    private missionService: MissionService,
    private userService: UserService,
    private noticationService: NoticationService

  ) { }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    event.target.innerWidth <= 768 ? this.rwd = true : this.rwd = false;
  }
  isScrolled = false;
  currPos: Number = 0;
  startPos: Number = 0;
  changePos: Number = 100;

  onScroll(evt) {
    this.currPos = (window.pageYOffset || evt.target.scrollTop) - (evt.target.clientTop || 0);
    if (this.currPos >= this.changePos) {
      this.isScrolled = true;
    } else {
      this.isScrolled = false;
    }
  }


  ngOnInit() {
    this.router.queryParams.forEach(params => {
      window.innerWidth <= 768 ? this.rwd = true : this.rwd = false;
      this.checkLogin();
      window.scroll(0, 0);
    });
  }

  public reset() {
    this.userData = undefined;
    this.isLogin = false;
    this.readyLogin = true;
    this.logingroup = 0;
    this.img = '';
    this.point = undefined;
    this.name = undefined;
  }

  /**
   * 取得登入中的使用者
   * @memberof NavComponent
   */
  public async getUserInfo() {
    await this.userService.userInfo().subscribe(
      result => {
        if (this.userData !== result[0]) {
          if (this.userData !== result[0]) { this.userData = result[0] }
          this.isLogin = true;
          if (this.userData !== result[0]) { this.swalDialogPass.show() }
          if (this.userData && (this.userData.logingroup !== 4 || this.userData.logingroup !== 5)) {
            this.logingroup = this.userData.logingroup;
            this.img = this.userData.picture;
            this.point = this.userData.point;
            this.name = this.userData.username;
            this.notice();
          } else {
            Cookie.delete('userCookie', '/');
          }
        }
      },
      err => {
        Cookie.delete('userCookie', '/');
        this.isLogin = false;
        this.readyLogin = true;
        this.reset();
      }
    )
  }

  /**
   * 判斷是否有使用者登入
   * @memberof NavComponent
   */
  public async checkLogin() {
    if (Cookie.get('userCookie')) {
      this.getUserInfo();
      this.readyLogin = false;
    } else {
      this.isLogin = false;
      this.readyLogin = true;
      this.reset();
    }
  }

  /**
   * 登出
   * @memberof NavComponent
   */
  public logout() {
    const filter = { logout: 1 };
    Cookie.delete('userCookie', '/');
    this.reset();
    this.isLogin = false;
    this.readyLogin = true;
    window.location.href = '/';
  }
  onNavClick() {
    $('#navbarBtn').click();
  }

  onSubmit(evt): void {
    // tslint:disable-next-line:max-line-length
    evt.target.value === '' ? this.route.navigate(['/search']) : this.route.navigate(['/search'], { queryParams: { name: evt.target.value } });
  }

  // public warning() {
  //   this.swalDialogWarning.show();
  // }

  // public async count(data) {
  //   data.forEach(e => {
  //     switch (e.status) {
  //       case true:
  //         this.datacount++;
  //         break;
  //     }
  //   })
  // }  

  /**
   * 最新通知轉先前通知
   * @memberof NavComponent
   */
  // public async turnstatus(id) {
  //   console.log(id);
  //   this.data[id].status = 1;
  //   console.log(this.data[0]);
  //   this.notice();
  // }

  /**
   * 取得使用者通知
   * @memberof NavComponent
   */
  public async notice() {
    const body = {
      username: this.userData.username
    }
    console.log(this.userData);
    console.log(this.userData.username);
    console.log(body);
    await this.noticationService.getNoti(body).subscribe(
      result => {
        if (result.length > 0) {
          this.data = result;
          this.datacount = result.length;
          console.log(result);
        } else {
          console.log('length=0');
        }
      }
    )
  }
}
