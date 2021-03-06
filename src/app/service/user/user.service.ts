import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable()
export class UserService {

  constructor(private http: Http) { }

  /**
   * Token打包
   *
   * @memberof UserService
   */
  public packToken() {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    headers.append('Authorization', 'Bearer ' + Cookie.get('userCookie'));
    const options = new RequestOptions({ headers: headers });
    return options;
  }

  /**
   * 登入
   *
   * @param body
   * @memberof UserService
   */
  public POST_login(body: object) {
    return this.http.post('/api/user/login', body)
      .map((res) => {
        return res.json() || {}
      });
  }

  /**
   * 使用者資訊
   *
   * @memberof UserService
   */
  public GET_userInfo() {
    return this.http.get('/api/user/userinfo', this.packToken())
      .map((res) => {
        return res.json() || {}
      });
  }

  /**
   * 學童資料取得
   *
   * @returns
   * @memberof UserService
   */
  public GetStudent() {
    return this.http.get('/api/student', this.packToken())
      .map((res) => {
        return res.json() || {}
      });
  }

  /**
   * 取得單位
   *
   * @param uid
   * @memberof UserService
   */
  public GET_group(uid) {
    return this.http.get(`/api/group/id/${uid}`, this.packToken())
      .map((res) => {
        return res.json() || {}
      });
  }


  /**
   * 使用者權限
   *
   * @param id
   * @memberof UserService
   */
  public GET_userPermission(id) {
    return this.http.get(`/api/user/permission/${id}`, this.packToken())
      .map((res) => {
        return res.json() || {}
      });
  }

  /**
   * 上傳心得圖片
   *
   * @param body
   * @memberof UserService
   */
  public POST_upload(body) {
    return this.http.post('/api/upload/participate', body)
      .map((res: any) => {
        return res._body;
      });
  }

  /**
   * 上傳心得圖片
   *
   * @param body
   * @memberof UserService
   */
  public POST_uploadBase64(body) {
    return this.http.post('/api/upload/profile', body)
      .map((res: any) => {
        return res._body;
      });
  }

  /** 編輯個人資料
   *
   * @param body
   * @memberof UserService
   */
  public POST_updateProfile(body) {
    return this.http.post('/api/user/update', body, this.packToken())
      .map((res: any) => {
        return res._body;
      });
  }

  /**
 * 單位資料取得
 *
 * @returns
 * @memberof UserService
 */
  public GET_userGetGroup() {
    return this.http.get('/api/group', this.packToken())
      .map((res) => {
        return res.json() || {}
      });
  }
}
