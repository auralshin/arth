import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportingComponent extends BasePageComponent {}
