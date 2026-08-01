import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-unit-roots',
  templateUrl: './unit-roots.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitRootsComponent extends BasePageComponent {}
