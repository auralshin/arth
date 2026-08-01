import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-bootstrap',
  templateUrl: './bootstrap.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BootstrapComponent extends BasePageComponent {}
