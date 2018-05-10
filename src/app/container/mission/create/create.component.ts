import { Component, OnInit, ViewChild, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MissionService } from '../../../service/mission/mission.service';
import { UserService } from '../../../service/user/user.service';
import { NoticationService } from '../../../service/notification/notification.service';

import { SwalComponent } from '@toverux/ngsweetalert2';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { IMyDpOptions } from 'mydatepicker';
import * as moment from 'moment';

import { Mission } from '../.././../class/mission/mission';
import { constructDependencies } from '@angular/core/src/di/reflective_provider';
import { BootstrapOptions } from '@angular/core/src/application_ref';

import { Location } from '@angular/common';
import { isUndefined } from 'util';
import { and } from '@angular/router/src/utils/collection';
import { ImageCropperComponent, CropperSettings, Bounds } from 'ng2-img-cropper';
import { Window } from 'selenium-webdriver';
import { Area } from '../../../class/mission/area';

declare let jquery: any;
declare let $: any;

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],
  providers: [MissionService, UserService, NoticationService]
})
export class CreateComponent implements OnInit {
  @ViewChild('dialogPassError') private swalDialogPassError: SwalComponent;
  @ViewChild('noPermission') private noPermission: SwalComponent;
  @ViewChild('dialogSuccess') private swalDialogSuccess: SwalComponent;
  @ViewChild('dialogError') private swalDialogError: SwalComponent;
  @ViewChild('dialogErrorType') private swalDialogErrorType: SwalComponent;
  @ViewChild('dialogErrorAll') private swalDialogErrorAll: SwalComponent;

  public missionLink: any;
  public missionTrans: any;
  public missionType: any = [];
  public missionId: Number = null;
  public mission: any = {};

  public distList: Array<String> = [];
  public area: any = new Area();
  public cityArea: any = this.area['city'];

  public city: any = ''; // 市
  public dist: any = ''; // 區
  public road: any = ''; // 路

  public isVideo: Boolean = false;
  public isTravel: Boolean = false;
  public isSignature: Boolean;
  public checking: Boolean = true;
  public urlBoolean: Boolean = true;
  public isLoading: Boolean = false;
  public specialBody: any;
  public userData: any;
  public userPermission: any = [];

  public typeId: Number = 1;
  public type: String;

  public file: any;
  public filename: any;
  public andited: Boolean = false; // 判斷是否已審核
  public changepicture: Boolean = false;
  public ErrorData: any = '';
  public step: any = 0;
  public screenwidth = false;
  public DatePickerOption: IMyDpOptions = {
    dateFormat: 'yyyy-m-dd',
    satHighlight: true,
    dayLabels: { su: '日', mo: '一', tu: '二', we: '三', th: '四', fr: '五', sa: '六' },
    monthLabels: {
      1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六',
      7: '七', 8: '八', 9: '九', 10: '十', 11: '十一', 12: '十二'
    },
    componentDisabled: false
  };
  uploadedImage: File;
  data: any;
  @ViewChild('cropper', undefined)
  cropper: ImageCropperComponent;
  cropperSettings: CropperSettings;

  constructor(
    private router: Router,
    private missionService: MissionService,
    private userService: UserService,
    private notificationService: NoticationService,
    private _location: Location
  ) {
    this.cropperSettings = new CropperSettings();
    this.cropperSettings.width = 1080;
    this.cropperSettings.height = 500;
    this.cropperSettings.minWidth = 1080;
    this.cropperSettings.minHeight = 500;
    this.cropperSettings.croppedWidth = 1080;  // 產生的圖片寬度
    this.cropperSettings.croppedHeight = 500;  // 產生的圖片高度
    this.cropperSettings.canvasHeight = 400;
    this.cropperSettings.canvasWidth = 800;
    this.cropperSettings.noFileInput = true;
    this.data = {};
  }

  public fileChangeListener($event) {
    const image: any = new Image();
    const file: File = $event.target.files[0];
    if (file !== undefined) {
      this.filename = file.name.split('.')[1];
      const reader = new FileReader();
      reader.onload = (x: any) => {
        image.src = x.target.result;
        this.cropper.setImage(image);
      }
      reader.readAsDataURL(file);
    }

  }
  ngOnInit() {
    this.GET_missionType();
    this.selectCity();
    Cookie.get('userCookie') ? this.GET_userInfo() : this.returnBack();
  }

  /**
   * 無權訪問頁面
   *
   * @memberof CreateComponent
   */
  public async returnBack() {
    setTimeout(() => { this.noPermission.show(); }, 500);
    setTimeout(() => { this._location.back(); }, 1700);
    const filter = { logout: 1 };
    Cookie.delete('userCookie', '/');
    this.router.navigate(['/home'], { queryParams: filter, skipLocationChange: true });
  }

  /**
 * 選擇城市時更換區域陣列
 *
 * @memberof CreateComponent
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
   * 取得登入中的使用者
   *
   * @memberof CreateComponent
   */
  public async GET_userInfo() {
    await this.userService.GET_userInfo().subscribe(
      result => {
        if (result[0]) {
          this.userData = result[0];
          if (this.userData) {
            this.getUserPermission();
          } else {
            this.router.navigate(['/home']);
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
   * 取得所有任務型態
   *
   * @memberof CreateComponent
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
   * 取得使用者可使用的權限
   *
   * @memberof CreateComponent
   */
  public async getUserPermission() {
    await this.userService.GET_userPermission(this.userData.logingroup).subscribe(
      result => {
        this.userPermission = result[0];
        if (this.userPermission.missioncreate) {
          this.GET_mission();
        } else {
          this.returnBack();
        }
      }
    )
  }

  /**
   * 將任務執行時間格式化
   *
   * @memberof CreateComponent
   */
  public formatDate(data) {
    if (data) {
      data = {
        date: {
          year: moment(data).format('YYYY'),
          month: moment(data).format('M'),
          day: moment(data).format('D'),
        }
      }
    }
    return data;
  }

  /**
   * 取得任務資訊
   *
   * @memberof CreateComponent
   */
  public async GET_mission() {
    this.missionId = Number(this.router.parseUrl(this.router.url).queryParams['id']);

    if (this.missionId) {
      await this.missionService.GET_mission(this.missionId).subscribe(
        result => {
          this.mission = result[0];
          if (this.mission.status === '審核中' || this.mission.status === '已退回') {
            this.andited = false;
          } else {
            this.andited = true;
          }
          if (this.mission.missionlocation) {
            this.city = this.mission.missionlocation.slice(0, 3);
            this.selectCity();
            this.dist = this.mission.missionlocation.slice(3, 6);
            this.road = this.mission.missionlocation.slice(6, this.mission.missionlocation.length);
          }
          if (this.mission.missioncreater === this.userData.username) {
            this.mission.missionstartdate = this.formatDate(this.mission.missionstartdate);
            this.mission.missionfinaldate = this.formatDate(this.mission.missionfinaldate);
            this.mission.missionexperiencedate = this.formatDate(this.mission.missionexperiencedate);

            this.mission.missionpicture ? this.urlBoolean = false : this.urlBoolean = true;

            this.mission.missioncontent ? this.mission.missioncontent = this.mission.missioncontent.replace(/<br>/g, '\n') :
              this.mission.missioncontent = null;

            this.missionType.forEach(element => {
              if (element.id === this.mission.missiontype) {
                this.mission.missiontype = element.missiontype;
                this.typeId = element.id;
              }
            });

            if (this.mission.missionspecial) {
              this.missionLink = this.mission.missionspecial['Link'] || null;
              this.missionTrans = this.mission.missionspecial['Transportation'] || null;
            }

            this.toStep1();
          } else {
            this.noPermission.show();
            setTimeout(() => { this._location.back(); }, 1200);
          }
        }
      );
    } else {
      this.mission.missionstartdate ? this.mission.missionstartdate = null :
        this.mission.missionstartdate = this.formatDate(moment());
      this.mission.missionfinaldate ? this.mission.missionfinaldate = null :
        this.mission.missionfinaldate = this.formatDate(moment().add(7, 'd'));
      this.mission.missionexperiencedate ? this.mission.missionexperiencedate = null :
        this.mission.missionexperiencedate = this.formatDate(moment().add(7, 'd'));
      this.isLoading = true;
    }
  }

  /**
   * 跳轉至任務建立頁面
   *
   * @memberof CreateComponent
   */
  public toStep1() {
    this.typeSelect();
    this.step = 1;
    window.scroll(0, 0);
  }

  /**
   * 取得目前所選擇的任務型態
   *
   * @memberof CreateComponent
   */
  public typeSelect() {
    this.missionType.forEach(element => {
      if (element.id === this.typeId) {
        this.type = element.missiontype;
      }
    });
    this.type === '影片任務' ? this.isVideo = true : this.isVideo = false;
    this.type === '旅遊任務' ? this.isTravel = true : this.isTravel = false;

    if (this.isVideo) { this.missionTrans = null }
    if (this.isTravel) { this.missionLink = null }
    this.isLoading = true;
  }

  /**
   *  驗證欄位是否有填寫正確
   *
   * @memberof CreateComponent
   */
  public bodyCheck() {
    const nowdate = moment().format('YYYY-M-DD');
    this.ErrorData = '';
    this.mission.missionlocation = this.city + this.dist + this.road;
    this.city ? this.ErrorData += '' : this.ErrorData += '<li>請填寫縣市</li>';
    this.dist ? this.ErrorData += '' : this.ErrorData += '<li>請填寫所在區</li></li>';
    if (this.road) {
      (this.road.trim().length !== 0) ? this.ErrorData += '' : this.ErrorData += '<li>請填寫地址</li>';
    } else {
      this.ErrorData += '<li>請填寫地址</li>';
    }
    this.mission.missionstartdate ? this.ErrorData += '' : this.ErrorData += '<li>請輸入任務開始日期</li>';
    this.mission.missionfinaldate ? this.ErrorData += '' : this.ErrorData += '<li>請輸入任務結束日期</li>';
    this.mission.missionexperiencedate ? this.ErrorData += '' : this.ErrorData += '<li>請輸入開放填寫心得日期</li>';
    this.mission.missionname ? this.ErrorData += '' : this.ErrorData += '<li>請輸入任務標題</li>';
    this.mission.missioncontent ? this.ErrorData += '' : this.ErrorData += '<li>請輸入任務內容</li>';
    this.mission.missionpoint ? this.ErrorData += '' : this.ErrorData += '<li>請輸入任務點數</li>';
    this.mission.missionpicture === undefined ? this.ErrorData += '<li>圖片尚未上傳</li>' : this.ErrorData += '';

    // 防呆
    if ((this.mission.missionfinaldate && this.mission.missionstartdate)
      && this.mission.missionfinaldate.formatted < this.mission.missionstartdate.formatted) {
      this.ErrorData += '<li>結束日期不可在開始日期之前</li>';
    }
    if ((this.mission.missionexperiencedate && this.mission.missionstartdate)
      && this.mission.missionexperiencedate.formatted < this.mission.missionstartdate.formatted) {
      this.ErrorData += '<li>撰寫心得日期不可在任務開始日期之前</li>';
    }
    if ((this.mission.missionexperiencedate && nowdate > this.mission.missionexperiencedate.formatted)) {
      this.ErrorData += '<li>開放心得填寫日期不可在今天以前</li>';
    }
    this.mission.missionpoint > 0 ? this.ErrorData += '' : this.ErrorData += '<li>點數不可小於0</li>';

    // 特殊欄位
    this.type === '旅遊任務' ? this.missionTrans ? this.ErrorData += '' : this.ErrorData += '<li>請輸入交通工具</li>' : this.ErrorData += '';
    this.type === '影片任務' ? this.missionLink ? this.ErrorData += '' : this.ErrorData += '<li>請輸入影片網址</li>' : this.ErrorData += '';
  }

  /**
   *  產生Create與Update時所需的body
   *
   * @memberof CreateComponent
   */
  public bodyMaker(createdate, id) {
    const body = {
      missionname: this.mission.missionname,
      missiontype: this.typeId,
      missioncontent: this.mission.missioncontent.replace(/\n/g, '<br>'),
      // 暫時先改成自動送審 status: '審核中',
      status: '已上架',
      missioncreatedate: createdate,
      missionstartdate: this.mission.missionstartdate.formatted,
      missionfinaldate: this.mission.missionfinaldate.formatted,
      missionexperiencedate: this.mission.missionexperiencedate.formatted,
      missionpoint: this.mission.missionpoint,
      missionpicture: this.mission.missionpicture,
      missionlocation: this.mission.missionlocation,
      missionspecial: JSON.stringify(this.specialBody),
      missioncreater: this.userData.username,
      missiongroup: this.userData.groupid,
      id: id,
      // 暫時關閉簽到功能 signature: Number(this.isSignature === true ? 1 : 0)
    }
    return body;
  }

  /**
   *  儲存任務
   *
   * @memberof CreateComponent
   */
  public async saveMission() {
    this.bodyCheck();
    if (this.ErrorData === '') {
      this.specialBody = {
        'Transportation': this.missionTrans ? this.missionTrans : null,
        'Link': this.missionLink ? this.missionLink : null
      };
      this.changepicture ? this.updatePicture() : this.mission.missioncreater ? this.POST_updateMission() : this.createMission();
    } else {
      this.swalDialogErrorAll.html = `<ul class="text-center">${this.ErrorData}</ul>`;
      this.swalDialogErrorAll.show();
    }
  }

  public async updatePicture() {
    const body = {
      url: this.file,
      username: this.userData.username,
      filetype: this.filename
    }
    await this.missionService.POST_uploadMissionPicture(body).subscribe(
      result => {
        if (result) { this.mission.missionpicture = result.replace(';', '') }
        this.mission.missioncreater ? this.POST_updateMission() : this.createMission();
      }
    )
  }

  /**
   *  編輯任務
   *
   * @memberof CreateComponent
   */
  public async POST_updateMission() {
    const body = this.bodyMaker(moment(this.mission.missioncreatedate).format('YYYY-M-DD'), this.mission.id);
    await this.missionService.POST_updateMission(body).subscribe(
      result => {
        if (result.affectedRows > 0 && this.checking === true) {
          this.swalDialogSuccess.show();
          setTimeout(() => {
            this.router.navigate([`mission/introduce`], { queryParams: { id: this.missionId } });
          }, 1200);
        } else {
          this.swalDialogError.show();
        }
      });
  }

  /**
   *  建立任務
   *
   * @memberof CreateComponent
   */
  public async createMission() {
    const body = this.bodyMaker(moment().format('YYYY-M-DD'), null);
    await this.missionService.POST_addMission(body).subscribe(
      result => {
        if (result.affectedRows > 0 && this.checking === true) {
          this.createNotification(moment().format('YYYY-M-DD'), result.insertId);
        } else {
          this.swalDialogError.show();
        }
      });
  }

  /**
   *  新增通知
   * 
   * @memberof CreateComponent
   */
  public async createNotification(createtime, missionId) {
    const body = {
      username: this.userData.username,
      type: '任務',
      groupid: this.userData.groupid,
      mission_id: missionId,
      noti_time: createtime,
      description: `${this.userData.name} 建立新任務-- ${this.mission.missionname}`,
      status: 0
    }
    await this.notificationService.createNoti(body).subscribe(
      result => {
        if (result.affectedRows == 1) {
          this.swalDialogSuccess.show();
          setTimeout(() => {
            this.router.navigate([`mission/introduce`], { queryParams: { id: missionId } });
          }, 1200);
        } else {
          this.swalDialogError.show();
        }
      }
    )
  }

  /**
   *  回上一步
   *
   * @memberof CreateComponent
   */
  public BackStep() {
    this.step = Number(this.step) - 1;
    window.scroll(0, 0);
  }

  /**
   * 個人頭像上傳
   *
   * @memberof ProfileComponent
   */
  public async readUrl(data) {
    this.changepicture = true;
    this.mission.missionpicture = data;
    this.urlBoolean = false;
    this.file = data;
    $('#changephoto').modal('hide');
  }
}
