import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { SwalComponent } from '@toverux/ngsweetalert2';
import { UserService } from '../../service/user/user.service';
import { MissionService } from '../../service/mission/mission.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';

declare let jquery: any;
declare let $: any;

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
  providers: [MissionService, UserService],
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
  public data: any[] =
    [{ type: '任務', name: '', content: '2018 Wonder Foto Day 台北國際攝影藝術交流展 報名成功', status: true },
    { type: '點數', name: '黎卋軒', content: '給予您點數100點', status: false },
    { type: '心得', name: '黎卉軒', content: '心得已繳交', status: true },
    { type: '活動', name: '王小明', content: '已參加台北國際攝影藝術交流展', status: true },
    { type: '任務', name: '王大明', content: '2018/04/12(四)『一日易經班』課程《6小時教你如何讀懂易經》#第237場 報名成功', status: false },
    { type: '任務', name: '陳曉明', content: 'NLP讀懂你的心_假日版 報名成功', status: false },
    { type: '任務', name: '陳大明', content: 'NLP讀懂你的心_假日版 報名成功', status: true },
    { type: '點數', name: '林老師', content: '給予您點數100點', status: true },
    { type: '點數', name: '陳老師', content: '給予您點數100點', status: false },
    { type: '點數', name: '王老師', content: '給予您點數100點', status: true },
    { type: '點數', name: '楊老師', content: '給予您點數100點', status: false },
    { type: '心得', name: '王小明', content: '心得已繳交', status: false },
    { type: '心得', name: '林小明', content: '心得已繳交', status: false },
    { type: '心得', name: '陳曉明', content: '心得已繳交', status: true },
    { type: '活動', name: '林好', content: '已參加NLP讀懂你的心_假日版', status: false },
    { type: '活動', name: '王明', content: '已參加台北國際攝影藝術交流展', status: false },
    { type: '活動', name: '楊明', content: '已參加NLP讀懂你的心_假日版', status: true }];
  public datacount = 0;

  constructor(
    private router: ActivatedRoute,
    private route: Router,
    private missionService: MissionService,
    private userService: UserService
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
    this.count(this.data);
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

  public async count(data) {
    data.forEach(e => {
      switch (e.status) {
        case true:
          this.datacount++;
          break;
      }
    })
  }
}
