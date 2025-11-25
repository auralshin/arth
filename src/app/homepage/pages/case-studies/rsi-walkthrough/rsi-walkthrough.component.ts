import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-rsi-walkthrough',
  templateUrl: './rsi-walkthrough.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RsiWalkthroughComponent extends BasePageComponent {}
