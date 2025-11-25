import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-reading-paths',
  templateUrl: './reading-paths.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadingPathsComponent extends BasePageComponent {}
