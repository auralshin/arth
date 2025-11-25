import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-on-chain-volume',
  templateUrl: './on-chain-volume.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnChainVolumeComponent extends BasePageComponent {}
