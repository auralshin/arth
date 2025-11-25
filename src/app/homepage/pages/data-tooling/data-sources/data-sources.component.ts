import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-data-sources',
  templateUrl: './data-sources.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataSourcesComponent extends BasePageComponent {}
