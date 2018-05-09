import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable()
export class PointService {
  constructor(
    private http: Http
  ) { }

  /**
  * Token打包
  *
  * @memberof PointService
  */
  public packToken() {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    headers.append('Authorization', 'Bearer ' + Cookie.get('userCookie'));
    const options = new RequestOptions({ headers: headers });
    return options;
  }

  /**
  * 取得學生點數
  *
  * @memberof PointService
  */
  public GET_point(param: Object) {
    return this.http.get(`/api/student?${param}`, this.packToken())
      .map((res) => {
        return res.json() || []
      });
  }

  /**
   * 取得兌換紀錄
   *
   * @memberof PointService
   */
  public GET_dePoint(param: Object) {
    return this.http.get(`/api/record?${param}`, this.packToken())
      .map((res) => {
        return res.json() || []
      });
  }
}
