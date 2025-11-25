import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-incident-response',
  templateUrl: './incident-response.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentResponseComponent extends BasePageComponent {}
