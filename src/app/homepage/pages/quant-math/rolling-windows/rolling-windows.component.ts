import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-rolling-windows',
  templateUrl: './rolling-windows.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RollingWindowsComponent extends BasePageComponent {}
