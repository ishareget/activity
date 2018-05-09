import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Params } from '@angular/router';

@Injectable()
export class NoticationService {

  constructor(
    private http: Http
  ) { }

  /** 
   * Token打包
   * 
   * @memberof NoticationService
  */
  public packToken() {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    headers.append('Authorization', 'Bearer' + Cookie.get('userCookie'));
    const options = new RequestOptions({ headers: headers });
    return options;
  }

  /**
  * 取得通知 
  *
  * @param username
  * @memberof NoticationService
  */
  public getNoti(body:Object) {
    return this.http.post('/api/notification/username', body)
      .map((res) => {
        // return res._body;
        return res.json() || {}
      });
  }

  /**
  * 新增通知 
  *
  * @param body
  * @memberof NotiService
  */
  // public createNoti(body) {
  //   return this.http.post('/api/notification/create', body)
  //     .map((res: any) => {
  //       return res._body;
  //     });
  // }

  /**
  * 更新通知 
  *
  * @param body
  * @memberof NotiService
  */
 public updateNoti(id:Object) {
  return this.http.post('/api/notification/update', id)
    .map((res) => {
      // return res._body;
      return res.json() || {}
    });
}
}
