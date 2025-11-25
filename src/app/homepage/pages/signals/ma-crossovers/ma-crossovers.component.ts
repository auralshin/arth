import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-ma-crossovers',
  templateUrl: './ma-crossovers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaCrossoversComponent extends BasePageComponent {}
