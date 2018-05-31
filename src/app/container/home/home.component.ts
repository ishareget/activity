import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterState } from '@angular/router';
import { Body } from '@angular/http/src/body';
import { async } from '@angular/core/testing';
import { ngControlStatusHost } from '@angular/forms/src/directives/ng_control_status';
import { ResourceLoader } from '@angular/compiler';

import { SwalComponent } from '@toverux/ngsweetalert2';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { clearTimeout, setTimeout } from 'timers';
import { ConfirmationService } from 'primeng/components/common/confirmationservice';
import { resource } from 'selenium-webdriver/http';
import * as R from 'ramda';
import * as moment from 'moment';

import { UserService } from '../../service/user/user.service';
import { MissionService } from '../../service/mission/mission.service';

declare let jquery: any;
declare let $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [MissionService, UserService]
})
export class HomeComponent implements OnInit {
  @ViewChild('dialogPassError') private swalDialogPassError: SwalComponent;

  public userData: any; // 存放使用者資料
  public missionType: any = []; // 存放所有任務型態
  public userMission: any = []; // 存放該使用者可以參加的任務
  public GET_groupMission: any = []; // 存放該使用者所屬單位的任務
  public masterMission: any = []; // 存放協會的任務

  public loadingFalse: any = false;
  public isLoading: any = true;
  public isCarousel: any = true;
  public missions: any = [];
  public carouselData: Object[] = [];
  public carouselLength: any;

  constructor(
    private router: ActivatedRoute,
    private route: Router,
    private missionService: MissionService,
    private userService: UserService
  ) { }

  ngOnInit() {
      this.error();
      this.router.queryParams.forEach(params => {
        // 登入後 首頁重取資料
        this.reset();
        $('.carousel').carousel({
          interval: 2500
        });
        this.GET_missionType();
      });
  }


  public reset() {
    this.userData = undefined;
    this.missionType = [];
    this.userMission = [];
    this.GET_groupMission = [];
    this.masterMission = [];
    this.loadingFalse = false;
    this.isLoading = true;
    this.missions = [];
    this.carouselData = [] = [];
    this.carouselLength = undefined;
  }

  public async error() {
    await this.missionService.GET_error().subscribe(
      result => {
        // this.route.navigate(['/error'], {});
      },
      err => {
        this.route.navigate(['/error'], {});
      }
    )
  }

  /**
   * 取得登入中的使用者
   *
   * @memberof HomeComponent
   */
  public async GET_userInfo() {
    await this.userService.GET_userInfo().subscribe(
      result => {
        if (result[0]) {
          this.userData = result[0];
          this.GET_mission();
        } else {
          this.GET_allMission();
        }
      },
      err => {
        this.swalDialogPassError.show();
        const filter = { logout: 1 };
        Cookie.delete('userCookie', '/');
        this.route.navigate(['/home'], { queryParams: filter, skipLocationChange: true });
      }
    )
  }


  /**
   * 載入該使用者可以參加的任務
   *
   * @memberof HomeComponent
   */
  public async GET_mission() {
    const temp = [];
    const self = this;
    await this.missionService.GET_groupMission(this.userData.groupid).subscribe(
      result => {
        result.forEach(e => {
          if (this.formatDate(e.missionfinaldate) > this.formatDate(moment())) {
            if (e.status === '已上架') {
              this.missions.push(e);
            }
          }
        });
        Promise.all([this.missionType.forEach(element => {
          temp.push(this.missions.filter(function (r) {
            r.missioncontent = r.missioncontent.replace(/<br>/g, '\n');
            return r.missiontype === element.id;
          }));
        })]).then(function (value) {
          self.missions = temp;
          self.GET_carousel();
        }, function (reason) {
          // rejection
        });
      },
      err => {
        this.GET_carousel();
        this.loadingFalse = true;
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
   * 載入所有任務
   *
   * @memberof HomeComponent
   */
  public async GET_allMission() {
    const temp = [];
    const self = this;
    await this.missionService.GET_allMission().subscribe(
      result => {
        result.forEach(e => {
          if (this.formatDate(e.missionfinaldate) > this.formatDate(moment())) {
            if (e.status === '已上架' && e.missiongroup === 1) {
              this.missions.push(e);
            }
          }
        });

        Promise.all([this.missionType.forEach(element => {
          temp.push(this.missions.filter(function (r) {
            r.missioncontent = r.missioncontent.replace(/<br>/g, '\n');
            return r.missiontype === element.id;
          }));
        })]).then(function (value) {
          self.missions = temp;
          self.GET_carousel();
        }, function (reason) {
          // rejection
        });

      }
    )
  }


  /**
   * 取得所有任務型態
   *
   * @memberof HomeComponent
   */
  public async GET_missionType() {
    const self = this;
    await this.missionService.GET_missionType().subscribe(
      result => {

        Promise.all([result.forEach(e => {
          self.missionType.push(e);
        })]).then(function (value) {
          Cookie.get('userCookie') ? self.GET_userInfo() : self.GET_allMission();
        }, function (reason) {
          // rejection
        });
      }
    )
  }

  /**
   * 載入輪播圖
   *
   * @memberof HomeComponent
   */
  public async GET_carousel() {

    await this.missionService.GET_carousel().subscribe(
      result => {

        if (result) {
          this.isCarousel = true;
        } else {
          this.isCarousel = false;
        }

        this.carouselData = result;
        this.carouselLength = result.length;
        this.isLoading = false;
      }
    )
  }
}
