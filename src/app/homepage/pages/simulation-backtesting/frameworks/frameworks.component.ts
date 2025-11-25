import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-frameworks',
  templateUrl: './frameworks.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrameworksComponent extends BasePageComponent {}
