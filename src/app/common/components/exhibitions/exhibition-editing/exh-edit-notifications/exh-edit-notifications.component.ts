import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ProfileService } from '../../../../../services/profile.service';

@Component({
  selector: 'ngx-exh-edit-notifications',
  templateUrl: './exh-edit-notifications.component.html',
  styleUrls: ['./exh-edit-notifications.component.scss']
})
export class ExhEditNotificationsComponent implements OnInit {
  @Input() set exh(data: any) {
    this.exhibition = data;
  }
  @Input() set curRole(val: string) {
    this.role = val;
  }
  @Input() set data(value: any) {
    // this.history = value;

    this.setProfiles(value).then((res: any) => {
      res.map(item => {

        if (item.profile) item.role = this.setRole(this.exhibition, item.profile);

        switch (item.title) {
          case 'member_added':
             item.action = 'joined the exhibition';
            break;
          case 'member_deleted':
             item.action = 'exit the exhibition';
            break;
          case 'member_accepted':
             item.action = 'accepted the invitation';
            break;
          case 'member_rejected':
             item.action = 'rejected the invitation';
            break;
          case 'admin_added':
             item.action = 'admin added new-profile member';
            break;
          case 'admin_deleted':
             item.action = 'admin was remove a member';
            break;
          case 'admin_accepted':
             item.action = 'admin the invitation';
            break;
          case 'admin_rejected':
             item.action = 'admin was reject the invitation';
            break;
          case 'artwork_added':
             item.action = 'was add new-profile artwork';
            break;
          case 'artwork_deleted':
             item.action = 'was delete an artwork';
            break;
          case 'artwork_selected':
             item.action = 'approved artwork of exhibiting artist';
            break;
        }

        const today = this.isToday(new Date(item.date));
        if (today) {
          this.newHistory.push(item);
        } else {
          this.oldHistory.push(item);
        }
      });
    });
  }
  @Input() set exhId(data: any) {
    this.currentId = data;
  }
  @Output() exhUpdate = new EventEmitter<any>();

  public exhibition: any;
  public role: string;
  public history: any;
  public currentId: any;
  public newHistory = [];
  public oldHistory = [];

  constructor(
    private _fb: FormBuilder,
    private _profileService: ProfileService
  ) { }

  ngOnInit() {
  }

  setProfiles(data) {
    return new Promise((resolve) => {
      let i = 0;
      data.map(item => {
        let proId;
        let admin = false;
        if (item.profile) {
          proId = item.profile;
        } else if (this.exhibition.admin) {
          proId = this.exhibition.admin;
          admin = true;
        }

        this._profileService.getProfileById(proId).subscribe(res => {
          if (admin) item.role = 'creator';
          item.profileData = res.profile;
          if (i === data.length - 1) resolve(data);
          i++;
        });
      });
    });
  }

  setRole(exh, proId) {
      let role = '';

      if (exh.admin === proId) {
        role += 'creator';
        return role;
      }

      exh.admins.map(adminId => {
        if (adminId === proId) {
          role += 'admin';
        }
      });

      exh.members.map(member => {
        if (member.profile === proId) {
          role += 'member';
        }
      });

      return role;
  }

  isToday(someDate) {
    const today = new Date();
    return someDate.getDate() == today.getDate() &&
      someDate.getMonth() == today.getMonth() &&
      someDate.getFullYear() == today.getFullYear();
  }

  setUser(val) {

  }

  changeUsersType(val, type, index) {

  }

  updateUsers() {

  }

  removeUser(user, index) {

  }
}
