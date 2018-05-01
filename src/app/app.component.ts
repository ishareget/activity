import { Component, OnInit, HostListener, HostBinding } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import animateScrollTo from 'animated-scroll-to';
import { Navigation } from 'selenium-webdriver';

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

  constructor() { }

  onScroll(evt) {
    this.currPos = (window.pageYOffset || evt.target.scrollTop) - (evt.target.clientTop || 0);
    if (this.currPos >= this.changePos) {
      this.isScrolled = true;
    } else {
      this.isScrolled = false;
    }
  }

  ngOnInit() {

  }

  public scrolltop() {
    animateScrollTo(0);
  }
  checkPunchin() {
    if (window.location.href.toString().indexOf('mission/punchin') === -1) {
      return true;
    } else {
      return false;
    }
  }
}
