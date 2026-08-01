import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-roll-and-carry',
  templateUrl: './roll-and-carry.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RollAndCarryComponent extends BasePageComponent {}
