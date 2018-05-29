import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { validateConfig } from '@angular/router/src/config';
import { errorHandler } from '@angular/platform-browser/src/browser';
import { formDirectiveProvider } from '@angular/forms/src/directives/ng_form';

import { SwalComponent } from '@toverux/ngsweetalert2';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { IMyDpOptions } from 'mydatepicker';
import * as moment from 'moment';
import * as R from 'ramda';
import { lang } from 'moment';
import { isNullOrUndefined } from 'util';
import { resource } from 'selenium-webdriver/http';
import { error } from 'selenium-webdriver';
import Sweetalert2 from 'sweetalert2';

import { MissionService } from '../../../service/mission/mission.service';
import { UserService } from '../../../service/user/user.service';
import { Area } from '../../../class/mission/area';

declare let jquery: any;
declare let $: any;

@Component({
  selector: 'app-exp',
  templateUrl: './exp.component.html',
  styleUrls: ['./exp.component.css'],
  providers: [MissionService, UserService]
})
export class ExpComponent implements OnInit {

  @ViewChild('modelClose') modelClose: ElementRef;
  @ViewChild('dialogSuccess') private swalDialogSuccess: SwalComponent;
  @ViewChild('dialogError') private swalDialogError: SwalComponent;
  @ViewChild('dialogErrorCheck') private swalDialogErrorCkeck: SwalComponent;
  @ViewChild('dialogPassSuccess') private swalDialogPassSuccess: SwalComponent;
  @ViewChild('dialogRejectSuccess') private swalDialogRejectSuccess: SwalComponent;
  @ViewChild('dialogRevertSuccess') private swalDialogRevertSuccess: SwalComponent;
  @ViewChild('dialogPassError') private swalDialogPassError: SwalComponent;
  @ViewChild('dialogPassError2') private swalDialogPassError2: SwalComponent;
  @ViewChild('dialogRejectError') private swalDialogRejectError: SwalComponent;
  @ViewChild('dialogRevertError') private swalDialogRevertError: SwalComponent;

  public distList: Array<String> = [];
  public area: any = new Area();
  public cityArea: any = this.area['city'];

  public country: any;
  public city: any = ''; // 市
  public dist: any = ''; // 區
  public road: any = ''; // 路
  public picture: any = [];

  public specialBody: any;
  public importText = '';
  public returnText = '';
  public expLocate: any;

  public expMember: Object = {}
  public expCost: any;

  public expType: Object = {};
  public tempCheck: any;
  public importType: Boolean;

  public returnexplist: any = [];
  public isLoading: any = true;
  public errorData: any;
  public userData: any = [];
  public missionType: any = [];
  public userPermission: any = [];

  public missionId: Number = null;
  public missionData: any = [];
  public missionDetail: any = [];

  public videoUrlFrm: any = null;
  public isYoutube: Boolean = false;
  public missionEditMode: Boolean = false;
  public StudentEdit: Boolean = false;
  public missionPhotoList: any = [];
  public arttypeimport: any;
  public filesPhoto: FileList;
  public viewTime: any;
  public myDatePickerOptions: IMyDpOptions = {
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
    private router: Router,
    private missionService: MissionService,
    private userService: UserService,
    private domSanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    // this.selectCity();
    this.GET_missionType();
    if (Cookie.get('userCookie')) { this.GET_userInfo() }
  }

  /**
   * 將任務執行時間格式化
   *
   * @memberof IntroduceComponent
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
   * 選擇城市時更換區域陣列
   *
   * @memberof ExpComponent
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
   * @memberof IntroduceComponent
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
        this.swalDialogPassError2.show();
        const filter = { logout: 1 };
        Cookie.delete('userCookie', '/');
        this.router.navigate(['/home'], { queryParams: filter, skipLocationChange: true });
        this.router.navigate(['/home']);
      }
    )
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
      }
    )
  }

  /**
   * 取得使用者可使用的權限
   *
   * @memberof IntroduceComponent
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
   * @memberof IntroduceComponent
   */
  public async GET_mission() {
    this.missionId = Number(this.router.parseUrl(this.router.url).queryParams['id']);
    this.returnexplist = [];
    if (this.missionId) {
      await this.missionService.GET_mission(this.missionId).subscribe(
        result => {
          this.missionData = result[0];
          this.missionType.forEach(element => {
            if (element.id === this.missionData.missiontype) {
              this.missionData.missiontype = element.missiontype;
              if (element.missiontype === '影片任務') {
                this.convertUrl()

              }
            }
          });
        }
      );

      // 判斷學生檢視心得還是老師，因老師／志工觀看心得時往只會帶入childusernasme
      const udata = this.userPermission.expwrite ? this.userData['username'] :
        this.router.parseUrl(this.router.url).queryParams['username'];
      const query = `username=${udata}&missionid=${this.missionId}`;

      await this.missionService.GET_joinByMission(query).subscribe(
        result => {
          this.missionDetail = result[0];
          try {
            if (typeof this.missionDetail.missionspecial === 'string') {
              // online 為 string
              // Local 為 object
              this.missionDetail.missionspecial = JSON.parse(this.missionDetail.missionspecial);
            }
          } catch (e) {
            console.error(e);
          }

          try {
            if (typeof this.missionDetail.returnexp === 'string') {
              // online 為 string
              // Local 為 object
              this.missionDetail.returnexp = JSON.parse(this.missionDetail.returnexp);
            }
          } catch (e) {
            console.error('returnexp沒跑進trycatch', e);
          }
          this.viewTime = moment(this.missionDetail.executedate).format('YYYY-MM-DD');
          if (this.missionDetail.missionspecial) {
            this.expLocate = this.missionDetail.missionspecial.Locate;
          }

          const checkStatus = R.or(
            this.missionDetail.status === '已參加',
            this.missionDetail.status === '已提交',
            this.missionDetail.status === '已退回'
          );
          if (checkStatus) {
            if (this.missionDetail.status === '已提交' && this.StudentEdit === true) {
              this.missionEditMode = false;
            } else {
              this.missionEditMode = true;
              this.myDatePickerOptions.componentDisabled = false;
            }
          }

          if (this.missionDetail.experience) { this.missionDetail.experience = this.missionDetail.experience.replace('<br>', '\n') }



          if (this.missionDetail.picture) {
            this.missionPhotoList = String(this.missionDetail.picture).split(';');
            if (this.missionPhotoList[this.missionPhotoList.length - 1] === '') {
              this.missionPhotoList.forEach(element => {
                if (element !== '') {
                  this.picture.push(element);
                }
              });
              this.picture = this.missionPhotoList;
            }
          }


          if (this.missionData.missiontype !== '美術任務') {
            this.missionDetail.executedate = this.formatDate(this.missionDetail.executedate);
            if (this.missionDetail.missionspecial) {
              try {
                this.city = this.missionDetail.missionspecial.Locate.city;
                this.selectCity();
                this.dist = this.missionDetail.missionspecial.Locate.dist;
                this.road = this.missionDetail.missionspecial.Locate.road;
              } catch (e) {
                console.error(e);
              }
            }

          }

          if (this.missionDetail.missionspecial) {
            this.expLocate = this.missionDetail.missionspecial['Locate'];
            this.expCost = this.missionDetail.missionspecial['Cost'];
            this.expMember = this.missionDetail.missionspecial['Member'];
            this.expType = this.missionDetail.missionspecial['Type'];
          }
          if (this.missionDetail.returnexp.length !== 0) {
            this.missionDetail.returnexp.forEach(element => {
              this.returnexplist.push(element);
            });
          }

          this.isLoading = false;
        }
      );

    } else {
      console.log('查無任務資訊, 應導回首頁');
    }
  }

  /**
   * 驗證欄位是否有填寫正確
   *
   * @memberof IntroduceComponent
   */
  public bodyCheck() {
    this.errorData = '';

    switch (this.missionData.missiontype) {
      case '展演任務':
        if (this.missionDetail.executedate) {
          if (this.missionDetail.executedate.formatted < moment(this.missionData.missioncreatedate).format('YYYY-MM-DD')) {
            this.errorData += '<li>日期不能在創立任務之前</li>';
          } else if (this.missionDetail.executedate.formatted <= moment().format('YYYY-MM-DD')) {
            this.errorData += ''
          } else {
            this.errorData += '<li>不能填寫今天之後的日期</li>'
          }
        } else {
          this.errorData += '<li>請選擇日期</li>';
        }
        if (this.missionDetail.experience) {
          (this.missionDetail.experience.trim().length !== 0) ? this.errorData += '' : this.errorData += '<li>請填寫心得感想</li>';
        } else {
          this.errorData += '<li>請填寫心得感想</li>';
        }
        this.filesPhoto || this.missionPhotoList.length > 0 ? this.errorData += '' : this.errorData += '<li>請上傳圖片</li>';
        break;
      case '影片任務':
        if (this.missionDetail.executedate) {
          if (this.missionDetail.executedate.formatted < moment(this.missionData.missioncreatedate).format('YYYY-MM-DD')) {
            this.errorData += '<li>日期不能在創立任務之前</li>';
          } else if (this.missionDetail.executedate.formatted <= moment().format('YYYY-MM-DD')) {
            this.errorData += ''
          } else {
            this.errorData += '<li>不能填寫今天之後的日期</li>'
          }
        } else {
          this.errorData += '<li>請選擇日期</li>';
        }
        if (this.missionDetail.experience) {
          (this.missionDetail.experience.trim().length !== 0) ? this.errorData += '' : this.errorData += '<li>請填寫心得感想</li>';
        } else {
          this.errorData += '<li>請填寫心得感想</li>';
        }
        break;
      case '旅遊任務':
        this.specialBody = {
          'Locate': {
            'city': this.city,
            'dist': this.dist,
            'road': this.road
          },
          'Member': this.expMember,
          'Cost': this.expCost
        };
        this.expLocate = this.city + this.dist + this.road;
        this.city ? this.errorData += '' : this.errorData += '<li>請填寫縣市</li>';
        this.dist ? this.errorData += '' : this.errorData += '<li>請填寫所在區</li></li>';
        if (this.road) {
          (this.road.trim().length !== 0) ? this.errorData += '' : this.errorData += '<li>請填寫地址</li>';
        } else {
          this.errorData += '<li>請填寫地址</li>';
        }

        // if (this.expMember['無']) {
        //   if (this.expMember['family'] || this.expMember['朋友']) {
        //     this.errorData += '<li>當勾選"無"成員時,不得有其他勾選</li>';
        //   }
        // } else {
        //   this.expMember['家人'] || this.expMember['朋友'] ? this.errorData += '' : this.errorData += '<li>請勾選旅遊成員</li>';
        // }
        this.specialBody['Locate'] ? this.errorData += '' : this.errorData += '<li>請填寫旅遊地點</li>';
        if (this.missionDetail.executedate) {
          if (this.missionDetail.executedate.formatted < moment(this.missionData.missioncreatedate).format('YYYY-MM-DD')) {
            this.errorData += '<li>日期不能在創立任務之前</li>';
          } else if (this.missionDetail.executedate.formatted <= moment().format('YYYY-MM-DD')) {
            this.errorData += ''
          } else {
            this.errorData += '<li>不能填寫今天之後的日期</li>'
          }
        } else {
          this.errorData += '<li>請選擇日期</li>';
        }
        this.specialBody['Cost'] ? this.errorData += '' : this.errorData += '<li>請填寫旅遊費用估計</li>';
        if (this.missionDetail.experience) {
          (this.missionDetail.experience.trim().length !== 0) ? this.errorData += '' : this.errorData += '<li>請填寫心得感想</li>';
        } else {
          this.errorData += '<li>請填寫心得感想</li>';
        }
        this.filesPhoto || this.missionPhotoList.length > 0 ? this.errorData += '' : this.errorData += '<li>請上傳圖片</li>'
        break;
      case '運動任務':
        this.expLocate = {
          'city': this.city,
          'dist': this.dist,
          'road': this.road
        }
        this.specialBody = {
          'Locate': this.expLocate
        }
        this.expLocate = this.city + this.dist + this.road;
        this.city ? this.errorData += '' : this.errorData += '<li>請填寫縣市</li>';
        this.dist ? this.errorData += '' : this.errorData += '<li>請填寫所在區</li></li>';
        if (this.road) {
          (this.road.trim().length !== 0) ? this.errorData += '' : this.errorData += '<li>請填寫地址</li>';
        } else {
          this.errorData += '<li>請填寫地址</li>';
        }
        // this.specialBody['Locate'] ? this.errorData += '' : this.errorData += '<li>請填寫運動場域</li>';

        if (this.missionDetail.executedate) {
          if (this.missionDetail.executedate.formatted < moment(this.missionData.missioncreatedate).format('YYYY-MM-DD')) {
            this.errorData += '<li>日期不能在創立任務之前</li>';
          } else if (this.missionDetail.executedate.formatted <= moment().format('YYYY-MM-DD')) {
            this.errorData += ''
          } else {
            this.errorData += '<li>不能填寫今天之後的日期</li>'
          }
        } else {
          this.errorData += '<li>請選擇日期</li>';
        }
        if (this.missionDetail.experience) {
          (this.missionDetail.experience.trim().length !== 0) ? this.errorData += '' : this.errorData += '<li>請填寫心得感想</li>';
        } else {
          this.errorData += '<li>請填寫心得感想</li>';
        }
        this.filesPhoto || this.missionPhotoList.length > 0 ? this.errorData += '' : this.errorData += '<li>請上傳圖片</li>';
        break;
      case '美術任務':
        if (this.importText) {
          this.expType['自行輸入'] = {
            'click': true,
            'text': this.importText
          }
        }
        this.specialBody = {
          'Type': this.expType
        }
        // tslint:disable-next-line:max-line-length
        this.expType['painted'] || this.expType['carving'] || this.expType['grinding'] || this.expType['graphic'] || this.expType['solid'] ?
          this.errorData += '' : this.errorData += '<li>請勾選作品類別</li>';
        if (this.missionDetail.experience) {
          (this.missionDetail.experience.trim().length !== 0) ? this.errorData += '' : this.errorData += '<li>請填寫心得感想</li>';
        } else {
          this.errorData += '<li>請填寫心得感想</li>';
        }
        this.filesPhoto || this.missionPhotoList.length > 0 ? this.errorData += '' : this.errorData += '<li>請上傳圖片</li>';
        break;
      case '環保任務':
        this.expLocate = {
          'city': this.city,
          'dist': this.dist,
          'road': this.road
        }
        this.specialBody = {
          'Locate': this.expLocate
        }
        this.expLocate = this.city + this.dist + this.road;
        this.city ? this.errorData += '' : this.errorData += '<li>請填寫縣市</li>';
        this.dist ? this.errorData += '' : this.errorData += '<li>請填寫所在區</li></li>';
        if (this.road) {
          (this.road.trim().length !== 0) ? this.errorData += '' : this.errorData += '<li>請填寫地址</li>';
        } else {
          this.errorData += '<li>請填寫地址</li>';
        }

        this.specialBody['Locate'] ? this.errorData += '' : this.errorData += '<li>請填寫環保地點</li>';
        if (this.missionDetail.executedate) {
          if (this.missionDetail.executedate.formatted < moment(this.missionData.missioncreatedate).format('YYYY-MM-DD')) {
            this.errorData += '<li>日期不能在創立任務之前</li>';
          } else if (this.missionDetail.executedate.formatted <= moment().format('YYYY-MM-DD')) {
            this.errorData += ''
          } else {
            this.errorData += '<li>不能填寫今天之後的日期</li>'
          }
        } else {
          this.errorData += '<li>請選擇日期</li>';
        }
        if (this.missionDetail.experience) {
          (this.missionDetail.experience.trim().length !== 0) ? this.errorData += '' : this.errorData += '<li>請填寫心得感想</li>';
        } else {
          this.errorData += '<li>請填寫心得感想</li>';
        }
        this.filesPhoto || this.missionPhotoList.length > 0 ? this.errorData += '' : this.errorData += '<li>請上傳圖片</li>'
        break;
    }
    return this.errorData;
  }


  // type檢查
  public typeclick() {
    if (this.importType) {
      this.importType = false;
    } else {
      this.importType = true;
    }
  }

  /**
   * 圖片上傳
   *
   * @memberof IntroduceComponent
   */
  public async photoUpload() {
    const errorData = this.bodyCheck();
    if (errorData === '') {
      const formData = new FormData();

      const body = {
        submittime: moment().format('YYYY-MM-DD HH:mm:ss'),
        studentusername: this.userData['username'],
        missionid: this.missionId
      }

      if (this.missionData.missiontype !== '影片任務') {
        if (this.filesPhoto || this.missionPhotoList) {
          if (this.filesPhoto !== undefined) {
            for (let i = 0; i < this.filesPhoto.length; i++) {
              formData.append('files', this.filesPhoto[i]);
            }
            formData.append('photoData', JSON.stringify(body));
            await this.userService.POST_upload(formData).subscribe(
              result => {
                this.saveMissionDetail(result);
              }
            )
          } else {
            this.saveMissionDetail('');
          }
        } else {
          this.saveMissionDetail('');
        }
      } else {
        this.saveMissionDetail('');
      }
    } else {
      this.swalDialogErrorCkeck.html = `<ul class="text-center">${errorData}</ul>`;
      this.swalDialogErrorCkeck.show();
    }
  }

  /**
   * 送出心得
   *
   * @memberof IntroduceComponent
   * @param url 圖片路徑
   */
  public async saveMissionDetail(url: string) {
    const temp = [];
    for (let i = 0; i < this.missionPhotoList.length; i++) {
      if ((this.missionPhotoList[i] !== '') && this.missionPhotoList[i] !== undefined) {
        temp.push(this.missionPhotoList[i]);
      }
    }
    this.missionPhotoList = temp;
    for (let i = 0; i < this.missionPhotoList.length; i++) {
      if (this.missionPhotoList[i] !== '') {
        // tslint:disable-next-line:max-line-length
        url += (url.substr(url.length - 1)) !== ';' ? url.length !== 0 ? this.missionPhotoList[i] + ';' : this.missionPhotoList[i] + ';' : this.missionPhotoList[i] + ';';
      }
    }
    const body = {
      submittime: moment().format('YYYY-MM-DD HH:mm:ss'),
      executedate: this.missionDetail.executedate ? this.missionDetail.executedate.formatted : null,
      status: '已提交',
      experience: this.missionDetail.experience ? this.missionDetail.experience.replace('\n', '<br>') : null,
      picture: url !== '' ? url : null,
      missionid: this.missionId,
      studentusername: this.userData['username'],
      missionspecial: JSON.stringify(this.specialBody)
    }
    await this.missionService.POST_updateJoin(body).subscribe(
      result => {
        if (result.affectedRows > 0) {

          this.swalDialogSuccess.show();
          this.StudentEdit = true;
          this.reset();
          this.GET_missionType();
          this.GET_userInfo();
        }
      });
  }

  /**
   * 通過任務
   *
   * @param mid 任務編號
   * @param cuid 學童帳號
   */
  public async PassMission(mid: Number, cuid: String, verifyexp: String) {
    const body = {
      status: '已審核',
      verifytime: moment().format('YYYY-MM-DD HH:mm:ss'),
      verifyusername: this.userData.username,
      missionid: mid,
      studentusername: cuid,
      verifyexp: verifyexp
    };
    await this.missionService.POST_verifyMission(body)
      .subscribe(result => {
        if (result.affectedRows > 0) {
          this.missionEditMode = true;
          this.swalDialogPassSuccess.show();
        } else {
          this.swalDialogPassError.show();
        }
        this.GET_mission();
      });
  }

  /**
   * 退回任務
   *
   * @param mid 任務編號
   * @param cuid 學童帳號
   */
  public async RejectMission(mid: Number, cuid: String) {
    if (!this.returnText) {
      Sweetalert2('資料不完整', '請輸入退回原因', 'error');
    } else {
      const returndata = {
        'returnusername': this.userData.name,
        'returnexp': this.returnText,
        'returntime': moment().format('YYYY-MM-DD HH:mm:ss')
      }
      this.returnexplist.push(returndata);
      const body = {
        status: '已退回',
        verifytime: moment().format('YYYY-MM-DD HH:mm:ss'),
        verifyusername: this.userData.username,
        missionid: mid,
        studentusername: cuid,
        returnexp: JSON.stringify(this.returnexplist)
      };
      await this.missionService.POST_verifyMission(body)
        .subscribe(result => {
          if (result.affectedRows > 0) {
            this.swalDialogRejectSuccess.show();
          } else {
            this.swalDialogRejectError.show();
          }
          this.GET_mission();
          this.modelClose.nativeElement.click();
        });
    }
  }

  /**
 * 還原任務(轉為待審)
 * @param mid 任務編號
 * @param cuid 學童帳號
 */
  public async RevertMission(mid: Number, cuid: String) {
    if (this.userPermission.expturnback) {

      const body = {
        status: '已提交',
        verifytime: moment().format('YYYY-MM-DD HH:mm:ss'),
        verifyusername: this.userData.username,
        missionid: mid,
        studentusername: cuid
      };
      await this.missionService.POST_verifyMission(body)
        .subscribe(result => {
          if (result.affectedRows > 0) {
            this.swalDialogRevertSuccess.show();
          } else {
            this.swalDialogRevertError.show();
          }
          this.GET_mission();
        });
    }
  }

  /**
   * 圖片上傳
   * @memberof IntroduceComponent
   */
  public uploadHandler(obj) {
    setTimeout(() => { this.filesPhoto = obj.files; }, 100); // 圖片增減事件是非同步
  }

  /**
   * 圖片上傳取消
   * @memberof IntroduceComponent
   */
  public removeHandler(obj) {
    setTimeout(() => { this.filesPhoto = null; }, 100); // 圖片增減事件是非同步
  }

  /**
   * 轉換影片網址
   *
   * @memberof IntroduceComponent
   */
  public async convertUrl() {

    let data: any = [];
    data = JSON.stringify(this.missionData.missionspecial);
    // 包在docker時為字串型態，採split切割兩次取ID
    data = data.split('?v=')[1].split('"')[0];
    this.isYoutube = true;
    this.videoUrlFrm = await this.domSanitizer
      .bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${data}`);
    // https://www.youtube.com/watch?v=DdcoPdEOm5o
  }

  public reset() {
    this.distList = [];
    this.area = new Area();
    this.cityArea = this.area['city'];
    this.city = '';
    this.dist = '';
    this.road = '';
    this.specialBody = undefined;
    this.importText = '';
    this.returnText = '';
    this.expLocate = '';
    this.expMember = {};
    this.expCost = undefined;
    this.expType = {};
    this.tempCheck = {};
    this.importType = false;
    this.returnexplist = [];
    this.isLoading = true;
    this.userData = [];
    this.missionType = [];
    this.userPermission = [];
    this.missionId = null;
    this.missionData = [];
    this.missionDetail = [];
    this.videoUrlFrm = null;
    this.arttypeimport = undefined;
    this.filesPhoto = null;
  }

  public photodelete(i, $event) {
    this.missionPhotoList.splice(i, 1);
  }
}
