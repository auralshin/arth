import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-lending-architecture',
  templateUrl: './lending-architecture.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LendingArchitectureComponent extends BasePageComponent {}
