import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import swal from 'sweetalert2';
import * as moment from 'moment';
import { Router, Params } from '@angular/router';
import { UserService } from '../../../service/user/user.service';
import { MissionService } from '../../../service/mission/mission.service';
import { async } from '@angular/core/testing';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Component({
  selector: 'app-punchinstatus',
  templateUrl: './punchinstatus.component.html',
  styleUrls: ['./punchinstatus.component.css'],
  providers: [UserService, MissionService],
  encapsulation: ViewEncapsulation.None
})
export class PunchinstatusComponent implements OnInit {
  public userData: any;
  public name: any;
  public missions: any = [];
  public signaturedate: any;
  constructor(
    private router: Router,
    private userService: UserService,
    private missionService: MissionService
  ) { }

  ngOnInit() {
    this.getUserInfo();
  }


  /**
   * 取得使用者資料
   *
   * @memberof PunchinstatusComponent
   */
  public async getUserInfo() {
    await this.userService.userInfo().subscribe(
      result => {
        if (this.userData !== result[0]) {
          this.userData = result[0];
          this.name = this.userData.name;
          this.getMission();
        }
      }
    )
  }

  /**
   * 取得任務資訊
   *
   * @memberof PunchinstatusComponent
   */
  public async getMission() {
    await this.missionService.getMission(Number(this.router.parseUrl(this.router.url).queryParams['id'])).subscribe(
      result => {
        this.missions = result[0];
        this.punchin();
      }
    )
  }

  /**
   * 跳轉至任務詳細資訊頁面
   *
   * @memberof PunchinstatusComponent
   */
  public goDetail() {
    const filter = { id: this.missions.id }
    this.router.navigate(['/mission/introduce'], { queryParams: filter });
  }

  /**
   * 產生Update時所需body
   *
   * @memberof PunchinstatusComponent
   */
  public bodyMaker(signaturedata) {
    const body = {
      signaturestatus: '已簽到',
      signaturedate: signaturedata,
      missionid: this.missions.id,
      studentname: this.userData.username
    };
    return body;
  }

  /**
   * 任務簽到
   *
   * @memberof PunchinstatusComponent
   */
  public async punchin() {
    this.signaturedate = moment().format('YYYY-MM-DD HH:mm:ss');
    const body = this.bodyMaker(this.signaturedate);
    await this.missionService.punchinMission(body).subscribe();
  }

}
