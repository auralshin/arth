import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-blockchain-evm',
  templateUrl: './evm.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvmComponent extends BasePageComponent {}
