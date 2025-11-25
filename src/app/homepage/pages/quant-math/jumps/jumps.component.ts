import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-jumps',
  templateUrl: './jumps.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JumpsComponent extends BasePageComponent {}
