import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import Swal from 'sweetalert2';

export class CutURL implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const hasPermission: boolean = ((window.location.href.toString().indexOf('mission/punchinstatus') < 0));


    if (!hasPermission) {
      window.location.href = '#'; {
        setTimeout(() => {
          Swal({
            title: '您無權進行此操作',
            type: 'error'
          });
        }, 500);
      }
    }

    return hasPermission;
  }
}
