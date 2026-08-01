import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-vol-surface',
  templateUrl: './vol-surface.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VolSurfaceComponent extends BasePageComponent {}
