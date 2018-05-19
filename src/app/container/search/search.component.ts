import { Component, OnInit, ViewChild, transition } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { defaultUrlMatcher } from '@angular/router/src/shared';
import { ngControlStatusHost } from '@angular/forms/src/directives/ng_control_status';

import { ConfirmationService } from 'primeng/components/common/confirmationservice';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { IMyDpOptions } from 'mydatepicker';
import { element } from 'protractor';
import { SwalComponent } from '@toverux/ngsweetalert2';
import { resource } from 'selenium-webdriver/http';
import { BPClient } from 'blocking-proxy/built/lib/client';
import * as moment from 'moment';

import { Area } from '../../class/mission/area';
import { UserService } from '../../service/user/user.service';
import { MissionService } from '../../service/mission/mission.service';

declare let jquery: any;
declare let $: any;

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  providers: [MissionService, UserService]
})
export class SearchComponent implements OnInit {

  @ViewChild('dialogErrorAll') private swalDialogErrorAll: SwalComponent;
  @ViewChild('dialogPassError') private swalDialogPassError: SwalComponent;

  public distList: Array<String> = [];
  public area: any = new Area();
  public cityArea: any = this.area['city'];

  public userData: any;
  public missions: any = [];
  public missionType: any = [];
  public searchType: Number = 0;
  public missionStartDate: any;
  public missionFinalDate: any;
  public city: any = ''; // 市
  public dist: any = ''; // 區
  public missionName: any = ''; // 欲搜尋之任務名稱
  public missionShow: any = [];

  public isLoading: Boolean = true;
  public page: Number = 1;

  // 開始時間
  public missionCreateDate: any = {
    date: {
      year: moment().format('YYYY'),
      month: moment().format('M'),
      day: moment().add(1, 'd').format('D'),
    }
  };


  public DatePickerOption: IMyDpOptions = {
    dateFormat: 'yyyy-mm-dd',
    satHighlight: true,
    dayLabels: { su: '日', mo: '一', tu: '二', we: '三', th: '四', fr: '五', sa: '六' },
    monthLabels: {
      1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六',
      7: '七', 8: '八', 9: '九', 10: '十', 11: '十一', 12: '十二'
    },
    componentDisabled: false
  };

  constructor(
    private route: Router,
    private router: ActivatedRoute,
    private userService: UserService,
    private missionService: MissionService,
    private sanitized: DomSanitizer
  ) { }

  ngOnInit() {
    this.selectCity();
    this.GET_missionType();
    this.router.queryParams.forEach(params => {
      this.searchType = Number(params['type']) || 0;
      this.missionName = params['name'] || '';
      $('#searchBtn').click();
    });
    Cookie.get('userCookie') ? this.GET_userInfo() : this.GET_mission();
  }

  /**
   * 選擇城市時更換區域陣列
   *
   * @memberof SearchComponent
   */
  public async selectCity() {
    switch (this.city) {
      case '台北市':
        this.distList = this.area['TPC'];
        this.dist = '';
        break;
      case '新北市':
        this.distList = this.area['NTPC'];
        this.dist = '';
        break;
      default:
        this.distList = this.area['TPArea'];
        this.dist = '';
        break;
    }
  }

  /**
   * 取得所有任務型態
   *
   * @memberof SearchComponent
   */
  public async GET_missionType() {
    await this.missionService.GET_missionType().subscribe(
      result => {
        result.forEach(e => {
          this.missionType.push(e);
        });
      }
    )
  }

  /**
   * 取得登入中的使用者
   *
   * @memberof SearchComponent
   */
  public async GET_userInfo() {
    await this.userService.GET_userInfo().subscribe(
      result => {
        if (result[0]) {
          this.userData = result[0];
          this.GET_mission();
        }
      },
      err => {
        this.swalDialogPassError.show();
        const filter = { logout: 1 };
        this.route.navigate(['/home'], { queryParams: filter, skipLocationChange: true });
        this.route.navigate(['/home']);
        Cookie.delete('userCookie', '/');
      }
    )
  }

  /**
   * 將取得的任務資訊匯入至missions
   *
   * @memberof SearchComponent
   */
  public putIntoMission(result) {
    let s: String;
    const show = [];
    result.forEach(e => {
      s = e.missioncontent
      if (e.missioncontent) { e.missioncontent = s.replace(/<br>/g, '\n') }
      this.missions.push(e);
    });
    if (this.searchType !== 0) {
      this.missions.forEach(e => {
        if (this.searchType === e.missiontype) { show.push(e) }
      });
    }
    if (this.missionName !== '') {
      this.missions.forEach(e => {
        if (e.missionName.indexOf(this.missionName) > -1) { show.push(e) }
        // this.missionName ? e.missionName.indexOf(this.missionName) > -1 ? show.push(e) : null : null;
      });
    }
    this.searchType === 0 && this.missionName === '' ? this.missionShow = this.missions : this.missionShow = show;
    this.isLoading = false;
  }

  /**
   * 取得使用者可以參加的任務
   *
   * @memberof SearchComponent
   */
  public async GET_mission() {
    if (this.userData !== undefined) {
      await this.missionService.GET_groupMission(this.userData.groupid).subscribe(
        result => {
          this.putIntoMission(result);
        }
      )
    } else {
      await this.missionService.GET_groupMission(1).subscribe(
        result => {
          this.putIntoMission(result);
        }
      )
    }
  }

  /**
   * 搜尋
   *
   * @memberof SearchComponent
   */
  public async search() {
    const show = [];
    let success: Boolean = true;
    this.missions.forEach(e => {
      // tslint:disable-next-line:max-line-length
      success ? Number(this.searchType) !== 0 ? e.missiontype === this.searchType ? success = true : success = false : success = true : success = false;
      success ? this.missionStartDate ? moment(e.missionstartdate).format('YYYY-MM-DD') >= this.missionStartDate.formatted ?
        success = true : success = false : success = true : success = false;
      success ? this.missionFinalDate ? moment(e.missionfinaldate).format('YYYY-MM-DD') <= this.missionFinalDate.formatted ?
        success = true : success = false : success = true : success = false;
      success ? this.city ? e.missionlocation.indexOf(this.city) > -1 ? success = true : success = false :
        success = true : success = false;
      success ? this.dist ? e.missionlocation.indexOf(this.dist) > -1 ? success = true : success = false :
        success = true : success = false;
      success ? this.missionName ? e.missionName.indexOf(this.missionName) > -1 ? success = true : success = false :
        success = true : success = false
      if (success) { show.push(e) }
      success = true;
    });
    this.missionShow = show;
  }

}
