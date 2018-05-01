import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CutURL } from './class/mission/punchinstatuscutUrl';

// Component
import { HomeComponent } from './container/home/home.component';
import { ErrorComponent } from './container/error/error.component';

// Component - User
import { UserComponent } from './container/user/user.component';
import { ProfileComponent } from './container/user/profile/profile.component';
import { PointComponent } from './container/user/point/point.component';
import { ManagementComponent } from './container/user/management/management.component';
import { ExpmanagementComponent } from './container/user/expmanagement/expmanagement.component';

import { SearchComponent } from './container/search/search.component';

// Component - Mission
import { CreateComponent } from './container/mission/create/create.component';
import { IntroduceComponent } from './container/mission/introduce/introduce.component';
import { PunchinComponent } from './container/mission/punchin/punchin.component';
import { PunchinstatusComponent } from './container/mission/punchinstatus/punchinstatus.component';
import { SignatureComponent } from './container/mission/signature/signature.component';

// Mission / 心得分類
import { ExpComponent } from './container/mission/exp/exp.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'error', component: ErrorComponent },

  // 使用者組件
  { path: 'user', component: UserComponent },
  { path: 'user/profile', component: ProfileComponent },
  { path: 'user/point', component: PointComponent },
  { path: 'user/management', component: ManagementComponent },
  { path: 'user/expmanagement', component: ExpmanagementComponent },

  { path: 'search/:id', component: SearchComponent },
  { path: 'search', component: SearchComponent },

  // 任務相關操作
  { path: 'mission/create', component: CreateComponent },
  { path: 'mission/introduce', component: IntroduceComponent },
  { path: 'mission/punchin', component: PunchinComponent },
  { path: 'mission/punchinstatus', component: PunchinstatusComponent, canActivate: [CutURL] },
  { path: 'mission/signature', component: SignatureComponent },


  // 心得分類
  { path: 'mission/exp', component: ExpComponent },

  // 強制跳轉至首頁 /home
  // { path: '504', redirectTo: '/error', pathMatch: 'full' },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  // useHash = true , 防止 http://localhost/# 發生跳轉
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
