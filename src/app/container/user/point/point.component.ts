import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MissionService } from '../../../service/mission/mission.service';
import { PointService } from '../../../service/point/point.service';
import { SwalComponent } from '@toverux/ngsweetalert2';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { UserService } from 'app/service/user/user.service';

@Component({
  selector: 'app-point',
  templateUrl: './point.component.html',
  styleUrls: ['./point.component.css'],
  providers: [MissionService, PointService, UserService]
})

export class PointComponent implements OnInit {
  @ViewChild('dialogPassError') private swalDialogPassError: SwalComponent;
  public data = [];
  public data2 = [];
  public step = 1;

  public userData: any;
  public isLoading: Boolean = true;
  public recordstatus: any;
  public size = 0;
  constructor(
    private router: Router,
    private missionService: MissionService,
    private pointService: PointService,
    private userService: UserService
  ) { }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.size = event.target.innerWidth;
  }

  ngOnInit() {
    this.size = window.innerWidth;
    Cookie.get('userCookie') ? this.GET_userInfo() : this.returnBack();
  }

  /**
   * 無權訪問頁面
   *
   * @memberof PointComponent
   */
  public async returnBack() {
    this.swalDialogPassError.show();
    const filter = { logout: 1 };
    this.router.navigate(['/home'], { queryParams: filter, skipLocationChange: true });
    this.router.navigate(['/home']);
    Cookie.delete('userCookie', '/');
  }

  /**
  * 取得登入中的使用者
  *
  * @memberof PointComponent
  */
  public async GET_userInfo() {
    await this.userService.GET_userInfo().subscribe(
      result => {
        if (result[0].logingroup !== 1) { this.router.navigate(['/home']) }
        if (result[0]) {
          this.userData = result[0];
          this.getPoint();
        }
      },
      err => {
        this.returnBack();
      }
    )
  }

  /**
    * 取得獲得點數紀錄
    *
    * @memberof PointComponent
    */
  public async getPoint() {
    await this.pointService.GET_point(`username=${this.userData.username}&give=1`).subscribe(
      result => {
        this.data = result;
        this.deduction();
      });
  }

  /**
    * 取得扣除點數紀錄
    *
    * @memberof PointComponent
    */
  public async deduction() {
    await this.pointService.GET_dePoint('username=' + this.userData.username).subscribe(
      result => {
        this.data2 = result;
        this.GET_missionType();
      });
  }

  /**
   * 取得任務型態
   *
   * @memberof PointComponent
   */
  public async GET_missionType() {
    await this.missionService.GET_missionType().subscribe(
      result => {
        this.data = this.SetType(this.data, result);
        this.data2 = this.SetType(this.data2, result);
        this.isLoading = false;
      }
    )
  }

  /**
   * 將取得的任務型態放入陣列
   * @param data 欲存放之陣列
   * @param result 任務型態陣列
   *
   * @memberof PointComponent
   */
  public SetType(data, result) {
    for (let i = 0; i < data.length; i += 1) {
      for (let j = 0; j < result.length; j += 1) {
        if (data[i].missiontype === result[j].id) {
          data[i].missiontype = result[j].missiontype;
        }
      }
    }
    return data;
  }

  /**
    * bg-color
    *
    * @memberof PointComponent
    */
  public color(x: string) {
    let data = null;

    switch (x) {
      case '展演任務':
        data = 'bg-success text-white font-weight-bold first';
        break;
      case '美術任務':
        data = 'bg-secondary text-white font-weight-bold first';
        break;
      case '運動任務':
        data = 'bg-info text-white font-weight-bold first';
        break;
      case '環保任務':
        data = 'bg-warning text-white font-weight-bold first';
        break;
      case '影片任務':
        data = 'bg-primary text-white font-weight-bold first';
        break;
      case '旅遊任務':
        data = 'bg-danger text-white font-weight-bold first';
        break;
      default:
        if ((parseInt(x, 10) >= 11) && (parseInt(x, 10) <= 13)) {
          data = 'bg-success text-white font-weight-bold first';
          this.recordstatus = '午餐兌換';
        } else if ((parseInt(x, 10) >= 17) && (parseInt(x, 10) <= 19)) {
          data = 'bg-info text-white font-weight-bold first';
          this.recordstatus = '晚餐兌換';
        } else {
          data = 'bg-danger text-white font-weight-bold first';
          this.recordstatus = '時段錯誤';
        }
        break;
    }
    return data;
  }
}
