import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { async } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';

import { Cookie } from 'ng2-cookies/ng2-cookies';
import { SwalComponent } from '@toverux/ngsweetalert2';
import * as moment from 'moment';
import * as R from 'ramda';
import { ConfirmationService } from 'primeng/components/common/confirmationservice';

import { Mission } from '../../../class/mission/mission';
import { MissionService } from '../../../service/mission/mission.service';
import { UserService } from '../../../service/user/user.service';

@Component({
  selector: 'app-introduce',
  templateUrl: './introduce.component.html',
  styleUrls: ['./introduce.component.css'],
  providers: [MissionService, UserService]
})
export class IntroduceComponent implements OnInit {

  @ViewChild('dialogIsExperience') private swalDialogIsExperience: SwalComponent;
  @ViewChild('dialogIsLogin') private swalDialogIsLogin: SwalComponent;
  @ViewChild('dialogSuccess') private swalDialogSuccess: SwalComponent;
  @ViewChild('dialogError') private swalDialogError: SwalComponent;
  @ViewChild('dialogDelSuccess') private swalDialogDelSuccess: SwalComponent;
  @ViewChild('dialogDelError') private swalDialogDelError: SwalComponent;
  @ViewChild('dialogPassError') private swalDialogPassError: SwalComponent;
  @ViewChild('dialogMissionIdError') private swalDialogMissionIdError: SwalComponent;

  public userPermission: any = [];
  public userData: any = [];

  public missionType: any = [];
  public missions: any = [];
  public missionJoin: any = [];

  public qrcodeWebsite: String;

  public isExpOpen: Boolean = true;
  public isJoin: Boolean = false;
  public isLoading: Boolean = true;
  public videoUrlFrm: any = null;
  public warningText: any;
  public isYoutube: Boolean = false;
  constructor(
    private router: Router,
    private missionService: MissionService,
    private userService: UserService,
    private route: ActivatedRoute,
    private domSanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    Cookie.get('userCookie') ? this.GET_userInfo() : this.GET_missionType();
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
        this.swalDialogPassError.show();
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
        this.GET_mission();
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
        this.GET_missionType() ;
      }
    )
  }

  /**
   * 取得任務資訊
   *
   * @memberof IntroduceComponent
   */
  public async GET_mission() {
    if (Number(this.router.parseUrl(this.router.url).queryParams['id'])) {
      await this.missionService.GET_mission(Number(this.router.parseUrl(this.router.url).queryParams['id'])).subscribe(
        result => {
          if (result[0] !== undefined) {
            if (result[0].missiongroup !== this.userData.groupid && result[0].missiongroup !== 1) { this.router.navigate([`/home`]) }
            result[0].missioncontent = result[0].missioncontent.replace(/'<br>'/g, '\n');

            this.missions = result[0];
            if (moment(this.missions.missionexperiencedate).format('YYYY/MM/DD') > moment().format('YYYY/MM/DD')) {
              this.isExpOpen = false;
            }
            this.missionType.forEach(element => {
              if (element.id === this.missions.missiontype) {
                this.missions.missiontype = element.missiontype;
                if (element.missiontype === '影片任務') {
                  this.convertUrl();
                }
              }
            });
            if (this.missions.signature === 1) {
              this.qrcodeWebsite = `http://www.ishareget.org/#/mission/punchin?id=${this.missions.id}`;
            }
            this.isLoading = false;
            this.checkApply();
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
   * 任務參加
   *
   * @memberof IntroduceComponent
   */
  public async missionApply() {
    if (this.userData && this.userPermission.missionapply) {
      await this.missionService.POST_addJoin(this.Getbody()).subscribe(
        result => {
          if (result.affectedRows > 0) {
            this.swalDialogSuccess.show();
            setTimeout(() => { window.location.reload(); }, 1200);
          } else {
            this.swalDialogError.show();
          }
        });

    } else {
      this.swalDialogIsLogin.show();
    }
  }



  public Getbody() {
    if (this.missions.signature === 1) {
      const body = {
        missionid: this.missions.id,
        studentusername: this.userData.username,
        applytime: moment().format('YYYY-MM-DD hh:mm:ss'),
        signaturestatus: '未簽到'
      }
      return body;
    } else {
      const body = {
        missionid: this.missions.id,
        studentusername: this.userData.username,
        applytime: moment().format('YYYY-MM-DD hh:mm:ss')
      }
      return body;
    }
  }


  /**
   * 取消參加
   *
   * @memberof IntroduceComponent
   */
  public async POST_deleteJoin() {

    if (this.missions.id && this.userData && this.userPermission.missionapply) {

      const body = {
        missionid: this.missions.id,
        studentusername: this.userData.username
      }

      await this.missionService.POST_deleteJoin(body).subscribe(
        result => {

          if (result.affectedRows > 0) {
            this.swalDialogDelSuccess.show();
            this.isJoin = false;
            setTimeout(() => { window.location.reload(); }, 1200);
          } else {
            this.swalDialogDelError.show();
          }
        });
    }
  }

  /**
   * 檢查是否已經參加任務
   *
   * @memberof IntroduceComponent
   */
  public async checkApply() {
    if (this.userPermission.missionapply) {
      const body = 'username=' + this.userData.username + '&missionid=' + this.missions.id;
      await this.missionService.GET_joinByMission(body).subscribe(
        result => {
          if (result[0]) {
            this.missionJoin = result[0];
            this.isJoin = true;
          }
        });
    }
  }

  /**
   * 填寫心得（根據ID選擇不同任務心得）
   *
   * @memberof IntroduceComponent
   */
  public btnExperience(data) {
    if (this.isExpOpen) {
      this.router.navigate([`mission/exp`], { queryParams: { id: this.missions.id } });
    } else {
      this.warningText = moment(data).format('YYYY/MM/DD');
      this.swalDialogIsExperience.html = `<h5 class="text-center">開放時間為：${this.warningText}</h3>`
      this.swalDialogIsExperience.show();
    }

  }

  /**
   * 解析任務影片網址
   *
   * @memberof IntroduceComponent
   */
  public async convertUrl() {

    let data: any = [];
    data = JSON.stringify(this.missions.missionspecial);
    // 包在docker時為字串型態，採split切割兩次取ID
    data = data.split('?v=')[1].split('"')[0];
    this.isYoutube = true;
    this.videoUrlFrm = await this.domSanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${data}`);

  }

}
