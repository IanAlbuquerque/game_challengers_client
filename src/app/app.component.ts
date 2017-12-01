import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { GameClientService, ConnectionStatus } from './game-client/game-client.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  public playerName: string = '';

  constructor(private gameClientService: GameClientService) {
  }

  public isFindingMatchOpen(): boolean {
    return this.gameClientService.getConnectionStatus() === ConnectionStatus.FINDING_MATCH;
  }

  public isMainMenuOpen(): boolean {
    return this.gameClientService.getConnectionStatus() === ConnectionStatus.DISCONNECTED ||
           this.gameClientService.getConnectionStatus() === ConnectionStatus.FINDING_MATCH;
  }

  public isGameClientOpen(): boolean {
    return !this.isMainMenuOpen();
  }

  public onClickFindMatch(): void {
    this.gameClientService.connect(this.playerName);
  }

  ngAfterViewInit() {
  }
}
