import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-stablecoins',
  templateUrl: './stablecoins.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StablecoinsComponent extends BasePageComponent {}
