import { Injectable } from '@angular/core';


@Injectable()
export class AppConfig {
  public Server: string;
  public Server_API: string;
  public Server_API_PROD: string;

  constructor() {
    this.Server = 'http://beta.locarto.uk';
    this.Server_API = 'http://api.beta.locarto.uk';
    this.Server_API_PROD = 'http://api.locarto.uk';
  }
}
