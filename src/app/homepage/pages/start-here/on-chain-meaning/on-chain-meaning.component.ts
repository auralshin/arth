import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-on-chain-meaning',
  templateUrl: './on-chain-meaning.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnChainMeaningComponent extends BasePageComponent {}
