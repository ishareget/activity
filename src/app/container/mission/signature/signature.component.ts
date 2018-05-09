import { Component, OnInit, ViewEncapsulation, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { async } from '@angular/core/testing';

import { Cookie } from 'ng2-cookies/ng2-cookies';
import { SwalComponent } from '@toverux/ngsweetalert2';
import { UserService } from '../../../service/user/user.service';
import { MissionService } from '../../../service/mission/mission.service';

import * as moment from 'moment';
import * as R from 'ramda';
import { $ } from 'protractor';

@Component({
  selector: 'app-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.css'],
  providers: [UserService, MissionService]
})
export class SignatureComponent implements OnInit {

  @ViewChild('dialogPassError') private swalDialogPassError: SwalComponent;
  @ViewChild('dialogMissionIdError') private swalDialogMissionIdError: SwalComponent;

  public userPermission: any = [];
  public userData: any = [];
  public tab: any = 0;
  public page: any = 1;

  public missions: any = [];
  public missionType: any = [];
  public allData: any[] = []; // 所有簽到資料
  public checkinData: any[] = []; // 已簽到資料
  public checkoutData: any[] = []; // 未簽到資料

  public isLoading: Boolean = true;
  public size = 0; // 判斷視窗大小
  public dropdownenter: Boolean = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private missionService: MissionService,
    private route: ActivatedRoute
  ) { }


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.size = event.target.innerWidth;
  }

  ngOnInit() {
    this.size = window.innerWidth;
    Cookie.get('userCookie') ? this.GET_userInfo() : this.router.navigate(['/home']);
    this.tab = 0;
  }

  /**
   * 取得登入中的使用者
   *
   * @memberof SignatureComponent
   */
  public async GET_userInfo() {
    await this.userService.GET_userInfo().subscribe(
      result => {
        if (result[0]) {
          this.userData = result[0];
          this.getUserPermission();
        }
      },
      err => {
        this.swalDialogPassError.show();
        const filter = { logout: 1 };
        Cookie.delete('userCookie', '/');
        this.router.navigate(['/home'], { queryParams: filter, skipLocationChange: true });
        this.router.navigate(['/home']);
      }
    )
  }


  /**
   * 取得使用者可使用的權限
   *
   * @memberof SignatureComponent
   */
  public async getUserPermission() {
    await this.userService.GET_userPermission(this.userData.logingroup).subscribe(
      result => {
        this.userPermission = result[0];
        this.GET_mission();
      }
    )
  }

  /**
   * 取得任務資訊
   *
   *  @memberof SignatureComponent
   */
  public async GET_mission() {
    if (Number(this.router.parseUrl(this.router.url).queryParams['id'])) {
      await this.missionService.GET_mission(Number(this.router.parseUrl(this.router.url).queryParams['id'])).subscribe(
        result => {
          if (result[0] !== undefined) {
            if (result[0].missiongroup !== this.userData.groupid && result[0].missiongroup !== 1) { this.router.navigate([`/home`]) }
            result[0].missioncontent = result[0].missioncontent.replace(/'<br>'/g, '\n');

            this.missions = result[0];
            this.GET_signature();
            this.isLoading = false;
          } else {
            this.swalDialogMissionIdError.show();
            this.router.navigate(['/home']);
          }
        }
      );
    } else {
      this.swalDialogMissionIdError.show();
      this.router.navigate(['/home']);
    }
  }

  /**
<<<<<<< HEAD
   * 取得簽到人數
=======
   * 取得以參加任務的學生簽到狀況
>>>>>>> 84dad348b3db25c19746625289fae025fb997727
   *
   * @memberof SignatureComponent
   */
  public async GET_signature() {
    await this.missionService.GET_signature(Number(this.router.parseUrl(this.router.url).queryParams['id'])).subscribe(
      result => {
        if (result[0] !== undefined) {
          result.forEach(e => {
            // if (this.formatDate(e.missionfinaldate) > this.formatDate(moment())) {
            e.signaturedate = moment(e.signaturedate).format('YYYY-MM-DD HH:mm:ss')
            this.allData.push(e);
            // }
          })
          this.allData.forEach(e => {
            switch (e.signaturestatus) {
              case '已簽到':
                this.checkinData.push(e);
                break;
              case '未簽到':
                this.checkoutData.push(e);
                break;
            }
          })
        }
      }
    )
  }
}
