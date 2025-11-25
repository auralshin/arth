import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-oracle-designs',
  templateUrl: './oracle-designs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OracleDesignsComponent extends BasePageComponent {}
