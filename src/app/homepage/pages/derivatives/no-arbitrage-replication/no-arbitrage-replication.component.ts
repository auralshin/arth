import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-no-arbitrage-replication',
  templateUrl: './no-arbitrage-replication.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoArbitrageReplicationComponent extends BasePageComponent {}
