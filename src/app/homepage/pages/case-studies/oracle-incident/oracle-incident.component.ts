import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-oracle-incident',
  templateUrl: './oracle-incident.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OracleIncidentComponent extends BasePageComponent {}
