import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-data-prep',
  templateUrl: './data-prep.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataPrepComponent extends BasePageComponent {}
