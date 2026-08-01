import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-curve-construction',
  templateUrl: './curve-construction.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurveConstructionComponent extends BasePageComponent {}
