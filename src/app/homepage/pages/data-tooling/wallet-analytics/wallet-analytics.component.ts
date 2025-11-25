import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-wallet-analytics',
  templateUrl: './wallet-analytics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletAnalyticsComponent extends BasePageComponent {}
