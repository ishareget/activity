import { Component, OnInit, ViewChild, DoCheck, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { DELEGATE_CTOR } from '@angular/core/src/reflection/reflection_capabilities';

import { SwalComponent } from '@toverux/ngsweetalert2';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { IMyDpOptions } from 'mydatepicker';
import * as moment from 'moment';
import * as R from 'ramda';
import { all } from 'q';

import { MissionService } from '../../../service/mission/mission.service';
import { UserService } from 'app/service/user/user.service';

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.css'],
  providers: [MissionService, UserService]
})
export class ManagementComponent implements OnInit {
  @ViewChild('noPermission') private noPermission: SwalComponent;
  @ViewChild('dialogPassSuccess') private swalDialogPassSuccess: SwalComponent;
  @ViewChild('dialogPassError') private swalDialogPassError: SwalComponent;
  @ViewChild('dialogRejectSuccess') private swalDialogRejectSuccess: SwalComponent;
  @ViewChild('dialogRejectError') private swalDialogRejectError: SwalComponent;
  @ViewChild('dialogRevertSuccess') private swalDialogRevertSuccess: SwalComponent;
  @ViewChild('dialogRevertError') private swalDialogRevertError: SwalComponent;
  @ViewChild('dialogPassError2') private swalDialogPassError2: SwalComponent;


  public userData: any = null;
  public datas: any = [];
  public tab: any = 0;
  public page: any = 1;
  public isLoading: Boolean = true;

  public auditData: any[] = [];
  public goOffData: any[] = [];
  public launchedData: any[] = [];
  public returnData: any[] = [];
  public closeData: any[] = [];
  public allData: any[] = [];

  public groupData: any[] = [];
  public missionType: any[] = [];
  public size = 0; // 判斷視窗大小

  constructor(
    private route: Router,
    private router: ActivatedRoute,
    private missionService: MissionService,
    private userService: UserService,
    private _location: Location
  ) { }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.size = event.target.innerWidth;
  }
  ngOnInit() {
    this.size = window.innerWidth;
    if (Cookie.get('userCookie')) { this.GET_userInfo() }
    this.router.queryParams.forEach(params => {
      this.tab = Number(params['tab']);
    })
  }

  /**
 * 取得所有任務型態
 *
 * @memberof IntroduceComponent
 */
  public async GET_missionType() {
    await this.missionService.GET_missionType().subscribe(
      result => {
        result.forEach(e => {
          this.missionType.push(e);
        });
        this.GET_mission();
      }
    )
  }

  /**
   * 取得登入中的使用者
   *
   * @memberof ManagementComponent
   */
  public async GET_userInfo() {
    await this.userService.GET_userInfo().subscribe(
      result => {
        if (result[0]) {
          this.userData = result[0];
          switch (Number(this.userData.logingroup)) {
            case 2:
            case 3:
              this.GET_group();
              break;
          }
        }
      },
      err => {
        this.swalDialogPassError2.show();
        const filter = { logout: 1 };
        this.route.navigate(['/home'], { queryParams: filter, skipLocationChange: true });
        this.route.navigate(['/home']);
        Cookie.delete('userCookie', '/');
      }
    )
  }

  // /**
  //  * 無權訪問頁面
  //  *
  //  * @memberof ManagementComponent
  //  */
  // public async returnBack() {
  //   setTimeout(() => { this.noPermission.show(); }, 500);
  //   setTimeout(() => { this._location.back(); }, 1700);
  //   let filter = { logout: 1 };
  //   this.route.navigate(['/home'], { queryParams: filter, skipLocationChange: true });
  //   this.route.navigate(['/home']);
  //   Cookie.delete('userCookie', '/');
  // }

  /**
   * 取得已發佈的任務
   *
   * @memberof ManagementComponent
   */
  public async GET_mission() {
    this.isLoading = true;
    const body = this.userData.groupid;
    this.datas = [];
    await this.missionService.GET_groupByMission(body).
      subscribe(result => {
        result.length === undefined ? this.isLoading = false : this.splitMission(result);
      });
  }

  /**
 * 取得權限
 *
 * @memberof StudentComponent
 */
  public async GET_group() {
    await this.userService.GET_userGetGroup().subscribe(
      result => {
        this.groupData = result;
        this.GET_missionType();
      }
    )
  }

  /**
    * 將任務執行時間格式化
    *
    * @memberof MissionComponent
    */
  public formatDate(data) {
    if (data) {
      data = {
        year: moment(data).format('YYYY'),
        month: moment(data).format('MM'),
        day: moment(data).format('DD'),
      }
    }
    return data['year'] + data['month'] + data['day'];
  }

  public async splitMission(result) {
    result.forEach(e => {
      this.groupData.forEach(element => {
        if (e.missiongroup === element.id) { e.missiongroup = element.groupname }
      })
      this.missionType.forEach(item => {
        if (e.missiontype === item.id) { e.missiontype2 = item.missiontype }
      })
      if (this.formatDate(e.missionfinaldate) < this.formatDate(moment())) {
        // if (e.status !== "已結束") {
        //   e.status = "已結束"
        //   this.missionEnd("已結束", e.id)
        // }
        this.closeData.push(e);
      } else {
        switch (e.status) {
          case '審核中':
            this.auditData.push(e);
            break;
          case '已上架':
            this.launchedData.push(e);
            break;
          case '已下架':
            this.goOffData.push(e);
            break;
          case '已退回':
            this.returnData.push(e);
            break;
        }
      }
      this.allData.push(e);
    });
    this.isLoading = false;
  }

}
