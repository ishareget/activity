import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import _ from 'lodash';
import * as moment from 'moment';
import { SwalComponent } from '@toverux/ngsweetalert2';
import { Cookie } from 'ng2-cookies/ng2-cookies';

import { UserService } from '../../service/user/user.service';
import { MissionService } from '../../service/mission/mission.service';
import { NoticationService } from '../../service/notification/notification.service';

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
  public loginGroup: any = 0;
  public img: any = '';
  public point: any;
  public name: any;
  public rwd: Boolean = false;
  public data: any = [];
  public unRead: any = 0;
  public notiTime: any = [];
  public time: any = [];
  public notiHref: any = [];
  public noti: any = [];
  public untime: any = [];

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
    this.loginGroup = 0;
    this.img = '';
    this.point = undefined;
    this.name = undefined;
  }

  /**
   * 取得登入中的使用者
   * @memberof NavComponent
   */
  public async GET_userInfo() {
    await this.userService.GET_userInfo().subscribe(
      result => {
        if (this.userData !== result[0]) {
          if (this.userData !== result[0]) { this.userData = result[0] }
          this.isLogin = true;
          if (this.userData !== result[0]) { this.swalDialogPass.show() }
          if (this.userData && (this.userData.logingroup !== 4 || this.userData.logingroup !== 5)) {
            this.loginGroup = this.userData.logingroup;
            this.img = this.userData.picture;
            this.point = this.userData.point;
            this.name = this.userData.username;
          } else {
            Cookie.delete('userCookie', '/');
          }
          this.notice();
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
      this.GET_userInfo();
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

  /**
   * 計算最新通知筆數
   * @memberof NavComponent
   */
  public async unReadcount(data) {
    data.forEach(e => {
      switch (e.status) {
        case 0:
          this.unRead += 1;
          break;
      }
    })
  }

  /**
    * 最新通知轉先前通知
    * @memberof NavComponent
    */
  public async turnstatus(data) {
    const body = {
      id: data.id,
      username: this.userData.username
    }
    console.log(body);
    await this.noticationService.updateNoti(body).subscribe(
      result => {
        console.log(result);
      }
    )
  }

  /**
  * 通知跳轉連結頁面
  * @memberof NavComponent
  */
  public async turnurl(data) {
    // console.log(data);
    const body = {
      id: data.id,
      username: data.username
    }
    await this.noticationService.getNoti(body).subscribe(
      result => {
        console.log(body);
        console.log(result);
        this.data.forEach(e => {
          console.log(e);
          if (e.id === body.id) {
            if (e.type === '任務') {
              this.route.navigate([`mission/introduce`], { queryParams: { id: e.mission_id } });
            } else {
              console.log(2);
              this.route.navigate(['user/point']);
            }
          }
        });
      }
    )
  }

  /**
   * 取得使用者通知
   * @memberof NavComponent
   */
  public async notice() {
    const body = {
      username: this.userData.username,
    }
    await this.noticationService.getAllNoti(body).subscribe(
      result => {
        // this.turnstatus();
        if (result.length > 0) {
          /**陣列取得通知時間*/
          this.data = [];
          _.map(result, (value) => {
            this.untime = moment(value.noti_time);
            /**判斷七日內通知 */
            if (this.untime.format('YYYY年MM月DD日') >= moment().add('days', -7).format('YYYY年MM月DD日')) {
              this.data.push(value);
              this.notiTime.push(this.untime);
            }
          })
          this.unRead = 0;
          this.unReadcount(this.data);
          this.setNotiTime(this.notiTime);

        } else {
          console.log('length=0');
        }
      }
    )
  }

  /**
   * 設定通知時間格式
   * @memberof NavComponent
   */
  public setNotiTime(value) {
    value.forEach(e => {
      const now = new Date().getTime();
      const notitime = e;
      const detime = ((now - e) / 1000) /**+ 8 * 60 * 60 Online*/;
      // format string
      if (detime < 10) {
        value = '數秒前';
      } else if (detime < 60) { // sent in last minute
        value = '在 ' + Math.floor(detime) + '秒前';
      } else if (detime < 3600) { // sent in last hour
        value = '在 ' + Math.floor(detime / 60) + '分鐘前';
      } else if (detime < 86400) { // sent on last day
        value = '在 ' + Math.floor(detime / 3600) + '小時前';
      } else { // sent more than one day ago
        value = notitime.format('MM月DD日 HH:mm');
      }
      this.time.push(value);
      return value;
    })
  }
}


