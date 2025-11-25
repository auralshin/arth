import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-onchain-data',
  templateUrl: './onchain-data.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnchainDataComponent extends BasePageComponent {}
