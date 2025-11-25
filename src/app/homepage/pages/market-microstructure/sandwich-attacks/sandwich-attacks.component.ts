import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-sandwich-attacks',
  templateUrl: './sandwich-attacks.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SandwichAttacksComponent extends BasePageComponent {}
