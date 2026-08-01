import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-market-participants',
  templateUrl: './market-participants.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketParticipantsComponent extends BasePageComponent {}
