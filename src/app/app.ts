import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/layout/header';
import { FooterComponent } from './shared/layout/footer';
import { WhatsappFabComponent } from './shared/layout/whatsapp-fab';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, WhatsappFabComponent],
  templateUrl: './app.html',
})
export class App {}
