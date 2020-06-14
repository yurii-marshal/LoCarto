import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ProfileService } from '../../../../../services/profile.service';
import { CommonService } from '../../../../../services/common.service';
import { ExhibitionsService } from '../../../../../services/exhibitions.service';
import { NbDialogService } from '@nebular/theme';

@Component({
  selector: 'ngx-exh-edit-members',
  templateUrl: './exh-edit-members.component.html',
  styleUrls: ['./exh-edit-members.component.scss']
})
export class ExhEditMembersComponent implements OnInit {
  @Input() set data(value: any) {
    if (value) this.fromBulk = value.fromBulk;
    if (value && value.admin) this.creator = value.admin;
    // TODO probably it is temp thing
    if (value.fromBulk) value.admins = [value.admin];
    // TODO END probably it is temp thing
    if (value && value.members) this.setArtists(value, 'members');
    if (value && value.admins) this.setArtists(value, 'admins');
  }
  @Input() set exhId(data: any) {
    this.currentId = data;
  }
  @Input() set curRole(val: string) {
    this.role = val;
    this.viewMode = (this.role === 'member' || this.role === undefined);
  }
  @Output() exhUpdate = new EventEmitter<any>();

  public fromBulk: boolean;
  public viewMode: boolean;
  public role: string;
  public members = [];
  public newMembers = [];
  public admins = [];
  public currentId: any;
  public showInvitation: boolean;
  public currentPro: any;
  public profiles: any;
  public userToRemove: any;
  public creator: any;
  public showSnipper: boolean;
  public changeUsers: any;

  public formMembers = this._fb.group({
    email: '',
    userType: '',
    user: ''
  });
  public types = [
    {title: 'Exhibiting Artist', value: 'artist'},
    {title: 'Admin', value: 'admin'}
  ];

  constructor(
    private _fb: FormBuilder,
    private _profileService: ProfileService,
    private _commonService: CommonService,
    private _exhibitionsService: ExhibitionsService,
    private _dialogService: NbDialogService
  ) { }

  ngOnInit() {
  }

  setFormValue(value, nameProp, index?) {
    if (index === undefined) {
      // set fields
      const tempObj = {};
      tempObj[nameProp] = value;
      this.formMembers.patchValue(tempObj);
    }
  }

  setUser(form) {
    const formVal = form.value;
    if (formVal.userType === 'admin') {
      const exist = this.admins.filter(adm => adm._id === this.currentPro._id);
      if (!exist || (exist && exist.length < 1)) this.admins.push(this.currentPro);
    } else {
      const exist = this.members.filter(mem => mem._id === this.currentPro._id);
      if (!exist || (exist && exist.length < 1)) this.members.push(this.currentPro);

      const newExist = this.newMembers.filter(mem => mem._id === this.currentPro._id);
      if (!newExist || (newExist && newExist.length < 1)) this.newMembers.push(this.currentPro);
    }

    this.setFormValue(undefined, 'email');
    this.setFormValue(undefined, 'user');
    this.currentPro = undefined;
  }

  changeUsersType(val, type, index, curUser) {
    this.clearChangeUsers();
    const arrName = (val === 'admin') ? 'admins' : 'members';
    const exist = this[arrName].filter(mem => mem._id === curUser._id);

    if ((arrName !== type) && (!exist || (exist && exist.length < 1))) {
      this.changeUsers = {
        val: val,
        type: type,
        index: index,
        user: curUser
      };
    }
  }

  clearChangeUsers() {
    this.changeUsers = '';
  }

  updateUsers() {
    this.showSnipper = true;
    if (this.changeUsers.val === 'artist') {

      this.admins.splice(this.changeUsers.index, 1);
      this.saveData(undefined, this.admins);

      this.members.push(this.changeUsers.user);
      this.saveData([this.changeUsers.user], undefined);
      this.clearChangeUsers();

    } else if (this.changeUsers.val === 'admin') { // admins

      this.changeUsers.user.type = 'members';
      this.removeUser(this.changeUsers.user, undefined, this.changeUsers.index);
      this.members.splice(this.changeUsers.index, 1);

      this.admins.push(this.changeUsers.user);
      this.saveData(undefined, this.admins);
      this.clearChangeUsers();
    }
  }

  removeUser(user, ref?, index?) {
    if (user.type === 'members') { // Members
      this._exhibitionsService.removeExhibitionMembers(this.currentId, user._id).subscribe(res => {
        this.members.splice(index, 1);
        if (ref) ref.close();
      }, error => {
        console.error(error);
      });

    } else { // Admins
      this.admins.splice(index, 1);

      const dataToSend = {
        admins: this.admins
      };

      this._exhibitionsService.updateProfileExhibition(dataToSend, this.currentId).subscribe(res => {
        if (ref) ref.close();
      }, error => {
        console.error(error);
      });
    }
  }

  setArtists(data, type) {
    let i = 0;
    data[type].map(profId => {
      const id = profId.profile ? profId.profile : profId;
      this._profileService.getProfileById(id).subscribe(res => {
        this[type].push(res.profile);
        if ((i === (data[type].length - 1)) && this.creator) this.checkAdmins(this[type]);
        i++;
      });
    });
  }

  checkAdmins(users) {
    users.map(user => {
      if (user._id === this.creator) {
        user.creator = true;
      }
    });
  }

  searchUsers(event) {
    this.currentPro = undefined;
    this.showInvitation = false;
    const dataToSend = {
      email: event
    };

    if (event.length > 2) {
      this._profileService.searchUsers(dataToSend).subscribe(res => {
        this.profiles = res.profiles;
        if (this.profiles && this.profiles.length < 1) this.showInvitation = true;
      }, error => {
        console.error(error);
      });
    }
  }

  chooseProf(profile) {
    this.setFormValue(profile, 'user');
    this.setFormValue((profile.curator ? profile.curator : profile.name), 'email');
    this.currentPro = profile;
    this.profiles = [];
  }

  sendInvite(form) {
    const dataToSend = {
      email: form.value
    };
  }

  saveData(members?, admins?) {
    this.showSnipper = true;

    if (admins) {
      const dataToSend = {
        admins: this._commonService.organizeUsersData(admins)
      };

      this._exhibitionsService.updateProfileExhibition(dataToSend, this.currentId).subscribe(res => {
        this.exhId = res.exhibition._id;
        this.showSnipper = false;
      }, error => {
        console.error(error);
        this.showSnipper = false;
      });
    }

    if (members) {
      this.showSnipper = true;
      const membersUpdate = this._commonService.organizeUsersData(members);
      this.saveMembersAdmins(this.currentId, {members: membersUpdate});
    }
  }

  saveMembersAdmins(exhId, data?) {
    Object.keys(data).map(type => {
      if (data[type]) {
        data[type].map(proId => {
          const dataToSend = {profile: proId};
          const typeReq = (type === 'members') ? 'updateExhibitionMembers' : 'exhibitionAdmins';
          this._exhibitionsService[typeReq](dataToSend, exhId).subscribe(res => {
            this.showSnipper = false;
          }, error => {
            console.error(error);
            this.showSnipper = false;
          });
        });
      }
    });
  }

  openModal(modal: TemplateRef<any>, val?, type?, index?) {
    if (val && type) {
      this.userToRemove = {_id: val._id, type: type};
      if (index) this.userToRemove.index = index;
    }
    this._dialogService.open(modal);
  }
}
