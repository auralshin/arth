import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-onchain-activity',
  templateUrl: './onchain-activity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnchainActivityComponent extends BasePageComponent {}
