import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProfileService } from '../../../../../services/profile.service';
import { StorageService } from '../../../../../services/storage.service';
import { NbDialogService } from '@nebular/theme';

@Component({
  selector: 'ngx-exh-members',
  templateUrl: './exh-members.component.html',
  styleUrls: ['./exh-members.component.scss']
})
export class ExhMembersComponent implements OnInit {
  @Input() set form(value: any) {
    this.formExhibition = value;
  }
  @Input() set curTab(num: number) {
    this.activeTab = num;
  }
  @Output() setTab = new EventEmitter<number>();
  @Output() membersForm = new EventEmitter<any>();
  @Output() usersData = new EventEmitter<any>();

  public formExhibition: FormGroup;
  public activeTab: number;
  public members = [];
  public newMembers = [];
  public admins = [];
  public profiles: any;
  public showInvitation: boolean;
  public currentPro: any;
  public activeProfile: any;
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
    private _storage: StorageService,
    private _dialogService: NbDialogService
  ) { }

  ngOnInit() {
    this.getCurrentProfile(this._storage.get('profile').id);
  }

  getCurrentProfile(profileId) {
    this._profileService.getProfileById(profileId).subscribe(res => {
      this.activeProfile = res.profile;
      this.activeProfile.creator = true;
      this.activeProfile.editMode = false;
      this.admins.push(this.activeProfile);
      this.members.push(this.activeProfile);
    });
  }

  setFormValue(value, nameProp, index?) {
    if (index === undefined) {
      // set fields
      const tempObj = {};
      tempObj[nameProp] = value;
      this.formMembers.patchValue(tempObj);
    }
  }

  setActiveTab(tab) {
    this.setTab.emit(tab);
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
    if (this.changeUsers.val === 'artist') {
      this.admins.splice(this.changeUsers.index, 1);
      this.members.push(this.changeUsers.user);
      this.clearChangeUsers();
    } else if (this.changeUsers.val === 'admin') { // admins
      this.members.splice(this.changeUsers.index, 1);
      this.admins.push(this.changeUsers.user);
      this.clearChangeUsers();
    }
  }

  removeUser(user, ref?, index?) {
    if (user.type === 'members') { // Members
      this.members.splice(index, 1);
    } else { // Admins
      this.admins.splice(index, 1);
    }
    if (ref) ref.close();
  }

  saveData(members, admins) {
    this.usersData.emit({members: members, admins: admins});
  }

  searchUsers(event) {
    this.showInvitation = false;
    this.currentPro = undefined;
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
    this.currentPro.editMode = false;
    this.profiles = [];
  }

  sendInvite(form) {
    const dataToSend = {
      email: form.value
    };

     // TODO !!!
  }

  openModal(modal: TemplateRef<any>, val?, type?, index?) {
    if (val && type) {
      this.userToRemove = {_id: val._id, type: type};
      if (index) this.userToRemove.index = index;
    }
    this._dialogService.open(modal);
  }
}
