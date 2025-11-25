import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-use-cases',
  templateUrl: './use-cases.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UseCasesComponent extends BasePageComponent {}
