import { Component, OnInit, ViewChild, DoCheck, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { SwalComponent } from '@toverux/ngsweetalert2';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { IMyDpOptions } from 'mydatepicker';
import * as moment from 'moment';
import * as R from 'ramda';

import { UserService } from 'app/service/user/user.service';
import { MissionService } from '../../../service/mission/mission.service';

@Component({
  selector: 'app-expmanagement',
  templateUrl: './expmanagement.component.html',
  styleUrls: ['./expmanagement.component.css'],
  providers: [MissionService, UserService]
})
export class ExpmanagementComponent implements OnInit {
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
  public tab = 0;
  public page = 1;
  public isLoading: Boolean = true;
  public size = 0; // 判斷視窗大小
  public sentDatas: any = [];
  public auditedDatas: any = [];
  public unauditedDatas: any = [];
  public turnbackDatas: any = [];
  public missionType: any = [];

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
    Cookie.get('userCookie') ? this.GET_userInfo() : this.returnBack();
    this.router.queryParams.forEach(params => {
      this.tab = Number(params['tab']);
    })
  }

  /**
   * 取得登入中的使用者
   *
   * @memberof ExpmanagementComponent
   */
  public async GET_userInfo() {
    await this.userService.GET_userInfo().subscribe(
      result => {
        if (result[0]) {
          this.userData = result[0];
          switch (Number(this.userData.logingroup)) {
            case 2:
            case 3:
              this.GET_missionType();
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

  /**
   * 無權訪問頁面
   *
   * @memberof ExpmanagementComponent
   */
  public async returnBack() {
    // setTimeout(() => { this.noPermission.show(); }, 500);
    // setTimeout(() => { this._location.back(); }, 1700);
    // let filter = { logout: 1 };
    // this.route.navigate(['/home'], { queryParams: filter, skipLocationChange: true });
    // this.route.navigate(['/home']);
    // Cookie.delete('userCookie', '/');
  }


  /**
   * 取得所有任務型態
   *
   * @memberof ExpmanagementComponent
   */
  public async GET_missionType() {
    this.missionType = [];
    await this.missionService.GET_missionType().subscribe(
      result => {
        result.forEach(element => {
          this.missionType.push(element);
        });
        this.GET_mission();
      }
    )
  }

  /**
   * 取得所有填寫心得之任務
   *
   * @memberof ExpmanagementComponent
   */
  public async GET_mission() {
    this.datas = [];
    await this.missionService.GET_joinMission(`groupid=${this.userData.groupid}`).subscribe(
      result => {
        if (result[0] === undefined) {
          this.isLoading = false;
        } else {
          result.forEach(e => {
            this.missionType.forEach(element => {
              if (e.missiontype === element.id) {
                e.missiontype2 = element.missiontype;
              }
            });
            switch (e.status) {
              case '已提交':
                this.datas.push(e);
                this.unauditedDatas.push(e);
                break;
              case '已退回':
                this.datas.push(e);
                this.turnbackDatas.push(e);
                break;
              case '已審核':
                this.datas.push(e);
                this.auditedDatas.push(e);
                break;
              case '已發送':
                this.datas.push(e);
                this.sentDatas.push(e);
                break;
            }
            this.isLoading = false;
          });
        }
      }
    )
  }


  /**
   * 批改心得
   * @param mid 任務編號
   * @param mtype 任務類別
   * @param cuid 學童帳號
   *
   * @memberof ExpmanagementComponent
   */
  public correctMission(mid: Number, mtype: String, cuid: String) {
    // window.open('mission/exp?id=' + mid + '&username=' + cuid);
    const filter = { id: mid, username: cuid }
    this.route.navigate(['mission/exp'], { queryParams: filter })
  }

  public async POST_verifyMission(body) {
    await this.missionService.POST_verifyMission(body)
      .subscribe(result => {
        if (result.affectedRows > 0) {
          this.swalDialogPassSuccess.show();
          this.GET_mission();
        } else {
          this.swalDialogPassError.show();
        }
      });
  }

  /**
   * 通過任務
   * @param mid 任務編號
   * @param cuid 學童帳號
   *
   * @memberof ExpmanagementComponent
   */
  public async PassMission(mid: Number, cuid: String) {
    if (this.userData) {
      const body = {
        status: '已審核',
        verifytime: moment().format('YYYY-MM-DD hh:mm:ss'),
        verifyusername: this.userData.username,
        missionid: mid,
        studentusername: cuid
      };

      this.POST_verifyMission(body);
    }
  }

  /**
   * 退回任務
   * @param mid 任務編號
   * @param cuid 學童帳號
   *
   * @memberof ExpmanagementComponent
   */
  public async RejectMission(mid: Number, cuid: String) {
    if (this.userData) {
      const body = {
        status: '已退回',
        verifytime: moment().format('YYYY-MM-DD hh:mm:ss'),
        verifyusername: this.userData.username,
        missionid: mid,
        studentusername: cuid
      };

      this.POST_verifyMission(body);
    }
  }

  /**
   * 還原任務(轉為待審)
   * @param mid 任務編號
   * @param cuid 學童帳號
   *
   * @memberof ExpmanagementComponent
   */
  public async RevertMission(mid: Number, cuid: String) {
    if (this.userData) {
      const body = {
        status: '已提交',
        verifytime: moment().format('YYYY-MM-DD hh:mm:ss'),
        verifyusername: this.userData.username,
        missionid: mid,
        studentusername: cuid
      };

      this.POST_verifyMission(body);
    }
  }

}
