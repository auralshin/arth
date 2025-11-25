import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-oracle-design',
  templateUrl: './oracle-design.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OracleDesignComponent extends BasePageComponent {}
