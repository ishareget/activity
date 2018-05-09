import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { SwalComponent } from '@toverux/ngsweetalert2';
import { UserService } from '../../../service/user/user.service';
import { Cookie } from 'ng2-cookies/ng2-cookies'
import { async } from '@angular/core/testing';
import { MissionService } from '../../../service/mission/mission.service';


@Component({
  selector: 'app-punchin',
  templateUrl: './punchin.component.html',
  styleUrls: ['./punchin.component.css'],
  providers: [UserService, MissionService],
  encapsulation: ViewEncapsulation.None
})
export class PunchinComponent implements OnInit {
  @ViewChild('dialogError') private swalDialogError: SwalComponent;
  @ViewChild('dialogPassError') private swalDialogPassError: SwalComponent;
  @ViewChild('dialogIdError') private swalDialogIdError: SwalComponent;
  @ViewChild('dialogSignatureFinish') private dialogSignatureFinish: SwalComponent;
  public userData: any;
  public logingroup: any = 0;
  public userAccount: String = '';
  public userPassword: String = '';
  public missions: any = [];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private missionService: MissionService
  ) { }

  ngOnInit() {
    this.CheckUrlId();
  }


  /**
   * 檢查傳入Id是否存在
   *
   * @memberof PunchinComponent
   */
  public async CheckUrlId() {
    await this.missionService.GET_mission(Number(this.router.parseUrl(this.router.url).queryParams['id'])).subscribe(
      result => {
        this.missions = result[0];
        if (this.missions === undefined) {
          this.router.navigate(['/home']); {
            setTimeout(() => {
              this.swalDialogIdError.show();
            }, 500);
          }
        }
      }
    )
  }

  /**
   * 檢查logingroup
   *
   * @memberof PunchinComponent
   */
  public async CheckIdentity() {
    await this.userService.GET_userInfo().subscribe(
      result => {
        if (this.userData !== result[0]) {
          this.userData = result[0];
          if (this.userData.logingroup === 1) {
            this.CheckSignaturestatus();
          } else {
            this.swalDialogPassError.show();
          }
        } else {
          Cookie.delete('userCookie', '/');
        }
      }
    )
  }

  /**
   * 簽到登入
   *
   * @memberof PunchinComponent
   */
  public async userLogin() {
    const body = {
      userId: this.userAccount,
      userPwd: this.userPassword
    };

    await this.userService.POST_login(body).subscribe(
      result => {
        if (result.token) {
          Cookie.set('userCookie', result.token, 0.040972255, '/');
          this.CheckIdentity();
        } else {
          this.swalDialogError.show();
        }
      }
    )
  }

  /**
   * 檢查是否簽到
   *
   * @memberof PunchinComponent
   */
  public async CheckSignaturestatus() {
    await this.missionService.GET_signature(Number(this.router.parseUrl(this.router.url).queryParams['id'])).subscribe(
      result => {
        const filter = { id: this.missions.id };
        result.forEach(e => {
          if (e.username === this.userAccount) {
            if (e.signaturestatus === '未簽到') {
              this.router.navigate(['mission/punchinstatus'], { queryParams: filter });
            } else {
              this.dialogSignatureFinish.show(); {
                setTimeout(() => {
                  this.router.navigate(['/home']);
                }, 100);
              }
            }
          }
        });
      });
  }

}
