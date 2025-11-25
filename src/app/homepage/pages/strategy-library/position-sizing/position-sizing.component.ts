import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-position-sizing',
  templateUrl: './position-sizing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PositionSizingComponent extends BasePageComponent {}
