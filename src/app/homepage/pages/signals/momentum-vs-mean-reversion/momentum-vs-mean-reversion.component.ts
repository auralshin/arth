import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-momentum-vs-mean-reversion',
  templateUrl: './momentum-vs-mean-reversion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MomentumVsMeanReversionComponent extends BasePageComponent {}
