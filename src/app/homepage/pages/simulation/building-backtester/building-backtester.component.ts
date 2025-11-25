import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-building-backtester',
  templateUrl: './building-backtester.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuildingBacktesterComponent extends BasePageComponent {}
