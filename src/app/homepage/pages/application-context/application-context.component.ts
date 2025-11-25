import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-application-context',
  templateUrl: './application-context.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationContextComponent extends BasePageComponent {}
