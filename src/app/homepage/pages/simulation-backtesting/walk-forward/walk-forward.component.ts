import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-walk-forward',
  templateUrl: './walk-forward.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalkForwardComponent extends BasePageComponent {}
