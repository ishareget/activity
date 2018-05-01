import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { SwalComponent } from '@toverux/ngsweetalert2';
import { Event } from '@angular/router/src/events';
import { UserService } from '../../../service/user/user.service';
import { resource } from 'selenium-webdriver/http';
import * as moment from 'moment';
import { error } from 'selenium-webdriver';
import { Location } from '@angular/common';
import { ImageCropperComponent, CropperSettings, Bounds } from 'ng2-img-cropper';

declare let jquery: any;
declare let $: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [UserService]
})



export class ProfileComponent implements OnInit {

  @ViewChild('dialogSuccess') private swalDialogSuccess: SwalComponent;
  @ViewChild('dialogError') private swalDialogError: SwalComponent;
  @ViewChild('dialogErrorCheck') private swalDialogErrorCkeck: SwalComponent;
  @ViewChild('noPermission') private noPermission: SwalComponent;
  @ViewChild('dialogPassError') private swalDialogPassError: SwalComponent;

  public userData: any;
  public userPermission: any;
  public userGroupName: any;
  public passwordCheck: any;
  public errorData: String = '';

  private url = '';
  private urlboolean: Boolean = true;
  private file: any;
  private filename: any;
  public isLoading: Boolean = true;
  public changepicture: Boolean = false;
  public size = 0;
  uploadedImage: File;
  data: any;
  @ViewChild('cropper', undefined)
  cropper: ImageCropperComponent;
  cropperSettings: CropperSettings;
  constructor(
    private router: Router,
    private userService: UserService,
    private _location: Location
  ) {
    this.cropperSettings = new CropperSettings();
    this.cropperSettings.width = 200;
    this.cropperSettings.height = 200;
    this.cropperSettings.croppedWidth = 200;
    this.cropperSettings.croppedHeight = 200;
    this.cropperSettings.canvasWidth = 400;
    this.cropperSettings.canvasHeight = 400;
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
        { this.urlboolean = false; }
        this.cropper.setImage(image);
      }
      reader.readAsDataURL(file);
    }

  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.size = event.target.innerWidth;
  }
  ngOnInit() {
    this.size = window.innerWidth;
    if (window.innerHeight < 500 || window.innerWidth < 500) {
      this.cropperSettings.canvasHeight = 200; this.cropperSettings.canvasWidth = 200;
    }
    Cookie.get('userCookie') ? this.getUserInfo() : this.returnBack();
  }

  /**
   * 無權訪問頁面
   *
   * @memberof ProfileComponent
   */
  public async returnBack() {
    setTimeout(() => { this.noPermission.show(); }, 500);
    setTimeout(() => { this._location.back(); }, 1700);
    const filter = { logout: 1 };
    this.router.navigate(['/home'], { queryParams: filter, skipLocationChange: true });
  }

  /**
   * 取得使用者所屬單位
   *
   * @memberof ProfileComponent
   */
  public async getUserGroup() {
    await this.userService.getGroup(this.userData.groupid).subscribe(
      result => {
        this.userGroupName = result[0].name;
      }
    )
  }

  /**
   * 取得使用者可使用的權限
   *
   * @memberof ProfileComponent
   */
  public async getUserPermission() {
    await this.userService.userPermission(this.userData.logingroup).subscribe(
      result => {
        this.userPermission = result[0];
      }
    )
  }

  /**
   * 取得登入中的使用者
   *
   * @memberof ProfileComponent
   */
  public async getUserInfo() {
    await this.userService.userInfo().subscribe(
      result => {
        if (result[0]) {
          this.userData = result[0];
          setTimeout(() => {
            this.isLoading = false;
          }, 500);
          this.getUserPermission();
          this.getUserGroup();
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
   * 儲存個人資訊
   *
   * @memberof ProfileComponent
   */
  public async saveUserInformation() {
    this.bodyCheck();
    if (!this.errorData) {
      this.changepicture ? this.updatePicture() : this.updateProfile();

    } else {
      this.swalDialogErrorCkeck.html = `<ul class="text-center">${this.errorData}</ul>`;
      this.swalDialogErrorCkeck.show();
    }
  }

  /**
   * 驗證欄位是否有填寫正確
   *
   * @memberof ProfileComponent
   */
  public async bodyCheck() {
    this.errorData = '';
    if (!this.userData.name) { this.errorData += '<li>請輸入姓名</li>' }
    this.userData.password ? this.userData.password === this.passwordCheck ? this.errorData += '' :
      this.errorData += '<li>密碼輸入不一致</li>' : this.errorData += '';
  }

  /**
   * 編輯個人資料
   *
   * @memberof ProfileComponent
   */
  public async updateProfile() {
    const body = {
      password: this.userData.password || null,
      name: this.userData.name,
      tel: this.userData.tel,
      email: this.userData.email,
      school: this.userData.school || null,
      studentid: this.userData.studentid || null,
      picture: this.userData.picture || null,
      username: this.userData.username
    }

    await this.userService.updateProfile(body).subscribe(
      result => {
        if (result) {
          this.swalDialogSuccess.show();
          setTimeout(() => { location.reload(); }, 1200);

        } else {
          this.swalDialogError.show();
        }
      }
    )
  }

  public async updatePicture() {
    const body = {
      url: this.file,
      username: this.userData.username,
      filetype: this.filename
    }
    await this.userService.upload_base64(body).subscribe(
      result => {
        if (result) { this.userData.picture = result.replace(';', '') }
        this.updateProfile();
      }
    )
  }

  /**
   * 個人頭像上傳
   *
   * @memberof ProfileComponent
   */
  public async readUrl(data) {
    this.changepicture = true;
    this.userData.picture = data;
    this.file = data;
    $('#changephoto').modal('hide');
  }
}

