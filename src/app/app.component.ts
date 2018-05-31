import { Component, OnInit, HostListener, HostBinding } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import animateScrollTo from 'animated-scroll-to';
import { Navigation } from 'selenium-webdriver';
import { Cookie } from 'ng2-cookies/ng2-cookies';

declare let jquery: any;
declare let $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: {
    '(window:scroll)': 'onScroll($event)'
  }
})
export class AppComponent implements OnInit {

  isScrolled = false;
  currPos: Number = 0;
  startPos: Number = 0;
  changePos: Number = 100;
  isCheck = true;
  constructor(
    private route: Router
  ) { }

  onScroll(evt) {
    this.currPos = (window.pageYOffset || evt.target.scrollTop) - (evt.target.clientTop || 0);
    if (this.currPos >= this.changePos) {
      this.isScrolled = true;
    } else {
      this.isScrolled = false;
    }
  }

  ngOnInit() {
    if (!Cookie.get('checkBrowser')) {
      this.route.navigate(['/browsercheck']);
      this.isCheck = false;
    } else {
      this.isCheck = true;
    }
  }

  public scrolltop() {
    animateScrollTo(0);
  }
  checkPunchin() {
    if (window.location.href.toString().indexOf('mission/punchin') === -1) {
      this.isCheck = true;
    } else {
      this.isCheck = false;
    }
  }
}
