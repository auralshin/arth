import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-brownian-motion',
  templateUrl: './brownian-motion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrownianMotionComponent extends BasePageComponent {}
