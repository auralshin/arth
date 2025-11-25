import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-onchain-offchain',
  templateUrl: './onchain-offchain.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnchainOffchainComponent extends BasePageComponent {}
