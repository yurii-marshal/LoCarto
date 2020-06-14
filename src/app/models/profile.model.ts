export class ProfileModel {
  public _id: string;
  public name: string;
  public curator: string;
  public accounts: Object;
  public photos: Object;
  public birth: Object;
  public death: Object;
  public biography: string;
  public education: string[];
  public grants: string[];
  public createDate: string;
  public contacts: Object;
}
