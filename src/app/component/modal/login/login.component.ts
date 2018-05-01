import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { SwalComponent } from '@toverux/ngsweetalert2';
import { UserService } from '../../../service/user/user.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';

declare let jquery: any;
declare let $: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [UserService]
})
export class LoginComponent implements OnInit {

  @ViewChild('dialogError') private swalDialogError: SwalComponent;
  @ViewChild('dialogErrorGroup') private swalDialogErrorGroup: SwalComponent;

  public userAccount: String = 'TCF001';
  public userPassword: String = '123456';
  public result: any = null;
  public dashboarduserdata: any;
  public userdata: any;

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  /**
   * 使用者登入
   * @memberof LoginComponent
   */
  public async userLogin() {
    const body = {
      userId: this.userAccount,
      userPwd: this.userPassword
    };

    await this.userService.Login(body).subscribe(
      result => {
        if (result.token) {
          Cookie.set('userCookie', result.token, 0.040972255, '/');
          const filter = { reload: 1 };
          this.router.navigate(['/home'], { queryParams: filter, skipLocationChange: true });
          $('#loginModal').modal('hide');
        } else {
          this.swalDialogError.show();
        }
      }
    )
  }

}
