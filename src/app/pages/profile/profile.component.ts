import {Component, Input, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'ngx-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  @Input('fromCreate') fromCreate: boolean;

  constructor(
    private _titleService: Title
  ) {
  }

  ngOnInit() {
    // set title
    this._titleService.setTitle('Locarto - Artist Profile');
  }

}
