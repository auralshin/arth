import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-data-transparency',
  templateUrl: './data-transparency.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTransparencyComponent extends BasePageComponent {}
