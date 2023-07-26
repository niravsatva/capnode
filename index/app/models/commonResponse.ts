import { ResponseStatus } from '../enum';

export class CommonResponse {
  public responseStatus!: ResponseStatus;
  public data!: any;
  public message!: string;
}
