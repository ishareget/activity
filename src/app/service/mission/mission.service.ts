import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { formDirectiveProvider } from '@angular/forms/src/directives/ng_form';


@Injectable()
export class MissionService {
  constructor(
    private http: Http
  ) { }

  /**
   * 上傳任務圖片
   *
   * @param body
   * @memberof MissionService
   */
  public uploadMissionPicture(body) {
    return this.http.post('/api/upload/mission', body)
      .map((res: any) => {
        return res._body;
      });
  }

  /**
   * Token打包
   *
   * @memberof MissionService
   */
  public packToken() {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    headers.append('Authorization', 'Bearer ' + Cookie.get('userCookie'));
    const options = new RequestOptions({ headers: headers });
    return options;
  }

  /**
   * 任務查詢 by ID
   *
   * @param id
   * @memberof MissionService
   */
  public getMission(id) {
    return this.http.get(`/api/mission/id/${id}`, this.packToken())
      .map((res) => {
        return res.json() || {}
      });
  }

  /**
   * 任務查詢 ALL
   *
   * @memberof MissionService
   */
  public getAllMission() {
    return this.http.get(`/api/mission`)
      .map((res) => {
        return res.json() || {}
      })
  }

  /**
   * 任務查詢 by Group, Token
   *
   * @param uid
   * @memberof MissionService
   */
  public getGroupMission(uid) {
    return this.http.get(`/api/mission/group/${uid}`, this.packToken())
      .map(res => {
        return res.json() || {}
      });
  }

  /**
   * 任務型態查詢 ALL
   *
   * @memberof MissionService
   */
  public getMissionType() {
    return this.http.get(`/api/mission/type`, this.packToken())
      .map((res) => {
        return res.json() || {}
      });
  }

  /**
   * 輪播圖查詢 ALL
   *
   * @memberof MissionService
   */
  public getCarousel() {
    return this.http.get('/api/carousel')
      .map((res) => {
        return res.json() || {}
      })
  }

  /**
   * 建立任務
   *
   * @param body
   * @memberof MissionService
   */
  public addMission(body) {
    return this.http.post('/api/mission/create', body, this.packToken())
      .map((res) => {
        return res.json() || {}
      });
  }

  /**
   * 編輯任務
   *
   * @param id
   * @memberof MissionService
   */
  public updateMission(body) {
    return this.http.post('/api/mission/update', body, this.packToken())
      .map((res) => {
        return res.json() || {}
      });
  }

  /**
   * 取得學生所參與過的任務  個人主頁
   *
   * @param uid
   * @memberof MissionService
   */
  public findByStudent(uid) {
    return this.http.get(`/api/participate/homepage/${uid}`, this.packToken())
      .map((res) => {
        return res.json() || {}
      });
  }

  /**
   * 取得使用者任務包含任務資訊
   *
   * @param param
   * @memberof MissionService
   */
  public getJoinByMission(param) {
    return this.http.get(`/api/participate/missionexp?${param}`, this.packToken())
      .map((res) => {
        return res.json() || {}
      });
  }

  /**
   * 任務管理頁面
   *
   * @param param
   * @memberof MissionService
   */
  public JoinMission(param) {
    return this.http.get(`/api/participate/status?${param}`, this.packToken())
      .map((res) => {
        return res.json() || {}
      });
  }

  /**
   * 取得同 group 的任務列表 for management
   *
   * @param param
   * @memberof MissionService
   */
  public groupMission(body) {
    return this.http.get(`/api/mission/user/${body}`, this.packToken())
      .map((res) => {
        return res.json() || {}
      });
  }

  /**
   * 參加任務
   *
   * @param body
   * @memberof MissionService
   */
  public addJoin(body: Object) {
    return this.http.post('/api/participate/create', body, this.packToken())
      .map((res) => {
        return res.json() || {}
      });
  }


  /**
   * 更新使用者任務
   *
   * @param body
   * @memberof MissionService
   */
  public updateJoin(filedata) {
    const option = this.packToken();
    return this.http.post('/api/participate/update', filedata, option)
      .map((res) => {
        return res.json() || {}
      });
  }

  /**
   * 取消參加
   *
   * @param body
   * @memberof MissionService
   */
  public deleteJoin(body) {
    return this.http.post('/api/participate/delete', body, this.packToken())
      .map((res) => {
        return res.json() || {}
      });
  }

  /**
   * 審核任務狀態
   *
   * @param body
   * @memberof MissionService
   */
  public verifyMission(body) {
    return this.http.post('/api/mission/verify', body, this.packToken())
      .map((res) => {
        return res.json() || {}
      });
  }

  public getSignature(uid) {
    return this.http.get(`/api/mission/signature/${uid}`, this.packToken())
      .map((res) => {
        return res.json() || {}
      });
  }

  public punchinMission(body) {
    return this.http.post('/api/mission/punchin', body, this.packToken())
      .map((res) => {
        return res.json() || {}
      });
  }

  /**
   * Error 判斷api
   *
   * @memberof MissionService
   */
  public error() {
    return this.http.get(`/api`)
      .map((res) => {
        return res.json() || {}
      })
  }
}
