import { Component, OnInit, ViewChild } from '@angular/core';

import { SwalComponent } from '@toverux/ngsweetalert2';
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  @ViewChild('dialogSuccess') private swalDialogSuccess: SwalComponent;
  public userAccount: String = 'jason123';
  public userPassword: String = '123456';
  constructor() { }

  ngOnInit() {
  }

  public signup() {
    this.swalDialogSuccess
      .show()
      .then((value) => { window.location.reload(); });
  }
}
