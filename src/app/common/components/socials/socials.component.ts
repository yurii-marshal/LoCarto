import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import * as Validator from '../../../../assets/js/validator.min.js';

@Component({
  selector: 'ngx-socials',
  templateUrl: './socials.component.html',
  styleUrls: ['./socials.component.scss']
})
export class SocialsComponent implements OnInit {
  @Input('type') type: string;
  @Input('title') title: string;
  @Output() values = new EventEmitter<any>();

  public currentSoc: string;
  public socList: any;

  constructor(
    private _dialogService: NbDialogService
  ) {
    this.socList = [
      {
        name: 'Instagram',
        className: 'ins',
        icon: 'icon-instagram',
        link: ''
      },
      {
        name: 'Wikipedia',
        className: 'be',
        icon: 'icon-wikipedia-w',
        link: ''
      },
      {
        name: 'Facebook',
        className: 'fe',
        icon: 'icon-facebook',
        link: ''
      },
      {
        name: 'Twitter',
        className: 'tw',
        icon: 'icon-twitter',
        link: ''
      },
      {
        name: 'Linkedin',
        className: 'in',
        icon: 'icon-linkedin',
        link: ''
      }
    ];
  }

  ngOnInit() {
  }

  openModal(item: string, modal: TemplateRef<any>) {
    this.currentSoc = item;
    this._dialogService.open(modal);
  }

  setSocial(link: string, ref) {
    this.socList.map(item => {
      if (item.name === this.currentSoc['name']) item.link = link;
    });
    this.values.emit(this.socList);
    ref.close();
  }

  validation(type, form, nameInput, value) {
    setTimeout(() => {
      let namePattern;
      switch (type) {
        case 'phone':
          namePattern = 'isMobilePhone';
          break;
        case 'link':
          namePattern = 'isURL';
          break;
        case 'email':
          namePattern = 'isEmail';
          break;
      }

      if (Validator[namePattern](value)) {
        form.controls[nameInput].setErrors(null);
      } else {
        form.controls[nameInput].setErrors({'incorrect': true});
      }
    }, 250);

  }
}
