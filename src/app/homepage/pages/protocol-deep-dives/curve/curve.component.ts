import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-curve',
  templateUrl: './curve.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurveComponent extends BasePageComponent {}
