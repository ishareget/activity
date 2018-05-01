import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterState } from '@angular/router';
import { SwalComponent } from '@toverux/ngsweetalert2';
import { MissionService } from '../../service/mission/mission.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Body } from '@angular/http/src/body';
import { async } from '@angular/core/testing';
import { ngControlStatusHost } from '@angular/forms/src/directives/ng_control_status';
import { clearTimeout, setTimeout } from 'timers';
import { ConfirmationService } from 'primeng/components/common/confirmationservice';
import * as R from 'ramda';
import { UserService } from '../../service/user/user.service';
import { resource } from 'selenium-webdriver/http';
import { ResourceLoader } from '@angular/compiler';
import * as moment from 'moment';

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
  public groupMission: any = []; // 存放該使用者所屬單位的任務
  public masterMission: any = []; // 存放協會的任務

  public loadingFalse: any = false;
  public isLoading: any = true;
  public iscarousel: any = true;
  public missions: any = [];
  public carouseldata: Object[] = [];
  public carousellength: any;
  public nowtime: any;
  public errorstatus: any = false;

  constructor(
    private router: ActivatedRoute,
    private route: Router,
    private missionService: MissionService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.error();
    this.router.queryParams.forEach(params => {

      this.reset();
      $('.carousel').carousel({
        interval: 2500
      });
      this.getMissionType();
    });
  }


  public reset() {
    this.userData = undefined;
    this.missionType = [];
    this.userMission = [];
    this.groupMission = [];
    this.masterMission = [];
    this.loadingFalse = false;
    this.isLoading = true;
    this.missions = [];
    this.carouseldata = [] = [];
    this.carousellength = undefined;
  }

  public async error() {
    await this.missionService.error().subscribe(
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
  public async getUserInfo() {
    await this.userService.userInfo().subscribe(
      result => {
        if (result[0]) {
          this.userData = result[0];
          this.getMission();
        } else {
          this.getAllMission();
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
  public async getMission() {
    const temp = [];
    const self = this;
    await this.missionService.getGroupMission(this.userData.groupid).subscribe(
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
          self.getCarousel();
        }, function (reason) {
          // rejection
        });
      },
      err => {
        this.getCarousel();
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
  public async getAllMission() {
    const temp = [];
    const self = this;
    await this.missionService.getAllMission().subscribe(
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
          self.getCarousel();
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
  public async getMissionType() {
    const self = this;
    await this.missionService.getMissionType().subscribe(
      result => {

        Promise.all([result.forEach(e => {
          self.missionType.push(e);
        })]).then(function (value) {
          Cookie.get('userCookie') ? self.getUserInfo() : self.getAllMission();
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
  public async getCarousel() {

    await this.missionService.getCarousel().subscribe(
      result => {

        if (result) {
          this.iscarousel = true;
        } else {
          this.iscarousel = false;
        }

        this.carouseldata = result;
        this.carousellength = result.length;
        this.isLoading = false;
      }
    )
  }
}
