import { Injectable, EventEmitter } from '@angular/core';
import { environment } from '../../environments/environment';
import * as Msg from './msg';

export enum ConnectionStatus {
  DISCONNECTED,
  CONNECTED,
  FINDING_MATCH,
  CALCULATING_ACTION,
  WAITING,
  GAME_OVER
}

@Injectable()
export class GameClientService {

  private ws: WebSocket = undefined;
  private connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;

  public onRequestAction: EventEmitter<Msg.SCRequestAction> = new EventEmitter<Msg.SCRequestAction>();
  public onGameOver: EventEmitter<Msg.SCGameOver> = new EventEmitter<Msg.SCGameOver>();
  public onWait: EventEmitter<Msg.SCWait> = new EventEmitter<Msg.SCWait>();

  constructor() { }

  private send(msg: Msg.CS): void {
    this.ws.send(JSON.stringify(msg));
  }

  public connect(name: string): void {
    this.ws = new WebSocket(environment.gameClientWebsocket);

    this.ws.onopen = (event: Event) => {
      const msg: Msg.CSCreateClient = {
        type: Msg.CSType.CSCreateClient,
        name: name
      }
      this.send(msg);
      this.connectionStatus = ConnectionStatus.CONNECTED;
    };

    this.ws.onclose = (event: Event) => {
      this.connectionStatus = ConnectionStatus.DISCONNECTED;
    };

    this.ws.onmessage = (event: MessageEvent) => {
      const msg: Msg.SC = JSON.parse(event.data);
      if (msg.type === Msg.SCType.SCFindingMatch) {
        this.connectionStatus = ConnectionStatus.FINDING_MATCH;
      }
      if (msg.type === Msg.SCType.SCRequestAction) {
        this.connectionStatus = ConnectionStatus.CALCULATING_ACTION;
        this.onRequestAction.emit(msg as Msg.SCRequestAction);
      }
      if (msg.type === Msg.SCType.SCWait) {
        this.connectionStatus = ConnectionStatus.WAITING;
        this.onWait.emit(msg as Msg.SCWait);
      }
      if (msg.type === Msg.SCType.SCGameOver) {
        this.connectionStatus = ConnectionStatus.GAME_OVER;
        this.onGameOver.emit(msg as Msg.SCGameOver);
      }
    };
  }

  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  public sendAction(action: string, key: number): void {
    const data: Msg.CSAction = {
      type: Msg.CSType.CSAction,
      action: action,
      key: key
    };
    this.send(data); 
  }

}
