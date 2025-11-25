import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-variance-std',
  templateUrl: './variance-std.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VarianceStdComponent extends BasePageComponent {}
