import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-delta-hedged-lp',
  templateUrl: './delta-hedged-lp.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeltaHedgedLpComponent extends BasePageComponent {}
