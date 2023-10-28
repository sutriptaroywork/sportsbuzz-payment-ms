import { UserLeagueNotFound } from "@/interfaces/userLeagueException/userLeagueException";

export class HttpException extends Error {
  public status: number;
  public message: string;
  public body?: UserLeagueNotFound;

  /**
   * This Class instance takes the below following parameters and then throws exception to requesting platform.
   * @param status
   * @param message
   * @param body
   */
  constructor(status: number, message: string, body?: UserLeagueNotFound) {
    super(message);
    this.status = status;
    this.message = message;
    this.body = body;
  }
}
