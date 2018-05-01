import { Component, ViewChild, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { MissionService } from '../../service/mission/mission.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { async } from '@angular/core/testing';
import { element } from 'protractor';
import { UserService } from '../../service/user/user.service';
import { SwalComponent } from '@toverux/ngsweetalert2';
import { Location } from '@angular/common';

import * as R from 'ramda';
import { JSONPBackend } from '@angular/http/src/backends/jsonp_backend';
import * as moment from 'moment';

declare let jquery: any;
declare let $: any;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  providers: [MissionService, UserService]
})
export class UserComponent implements OnInit {

  @ViewChild('noPermission') private noPermission: SwalComponent;
  @ViewChild('dialogPassError') private swalDialogPassError: SwalComponent;

  public userData: any;
  public userPermission: any = [];
  public userName: any;
  public imgUrl: any;

  public missions: any;
  public missionApply: any = [];
  public missionSubmit: any = [];
  public missionVerify: any = [];
  public missionReject: any = [];
  public missionAll: any = [];
  public missionintime: any = []; // 期限內的任務
  public userdata: any;
  public img: any;
  public isLoading: Boolean = true;
  public size = 0;
  public tab = 1;
  public name = '參加中的任務';
  constructor(
    private router: Router,
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
    Cookie.get('userCookie') ? this.getUserInfo() : this.returnBack();
    window.scroll(0, 0);
  }

  /**
   * 無權訪問頁面
   *
   * @memberof UserComponent
   */
  public async returnBack() {
    setTimeout(() => { this.noPermission.show(); }, 500);
    setTimeout(() => { this._location.back(); }, 1700);
  }

  /**
   * 取得使用者可使用的權限
   *
   * @memberof UserComponent
   */
  public async getUserPermission() {
    await this.userService.userPermission(this.userData.logingroup).subscribe(
      result => {
        if (result[0].missionapply) {
          this.userPermission = result[0];
          this.getMission();
        } else {
          this.returnBack();
        }
      }
    )
  }

  /**
   * 取得登入中的使用者
   *
   * @memberof UserComponent
   */
  public async getUserInfo() {
    await this.userService.userInfo().subscribe(
      result => {
        if (result[0]) {
          if (this.userData !== result[0]) {
            this.userData = result[0];
            this.imgUrl = this.userData.picture;
            this.userName = this.userData.name;
            this.getUserPermission();
          }
        }
      },
      err => {
        this.swalDialogPassError.show();
        const filter = { logout: 1 };
        this.router.navigate(['/home'], { queryParams: filter, skipLocationChange: true });
        this.router.navigate(['/home']);
        Cookie.delete('userCookie', '/');
      }
    )
  }

  /**
     * 將任務執行時間格式化
     *
     * @memberof HomeComponent
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

  /**
   * 取得使用者任務清單包含任務基本資料
   *
   * @memberof UserComponent
   */
  public async getMission() {

    await this.missionService.findByStudent(this.userData.username).subscribe(
      result => {
        if (result.length > 0) {
          result.forEach(e => {
            if (this.formatDate(e.missionfinaldate) > this.formatDate(moment())) {
              this.missionintime.push(e);
            }
          });
        }
        for (let i = 0; i < this.missionintime.length; i++) {
          if (this.missionintime[i].missioncontent) {
            this.missionintime[i].missioncontent = this.missionintime[i].missioncontent.replace(/<br>/g, '\n');
          }
          switch (this.missionintime[i].status) {
            case '已參加':
              this.missionApply.push(this.missionintime[i]);
              break;
            case '已提交':
              this.missionSubmit.push(this.missionintime[i]);
              break;
            case '已審核':
            case '已發送':
              this.missionVerify.push(this.missionintime[i]);
              break;
            case '已退回':
              this.missionReject.push(this.missionintime[i]);
              break;
          }
          this.missionAll.push(this.missionintime[i]);
        }
        this.isLoading = false;
      });
  }

}
