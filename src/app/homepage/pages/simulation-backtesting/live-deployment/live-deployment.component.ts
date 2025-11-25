import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-live-deployment',
  templateUrl: './live-deployment.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveDeploymentComponent extends BasePageComponent {}
