import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-data-quality',
  templateUrl: './data-quality.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataQualityComponent extends BasePageComponent {}
