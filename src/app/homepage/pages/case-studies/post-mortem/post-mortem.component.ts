import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-post-mortem',
  templateUrl: './post-mortem.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostMortemComponent extends BasePageComponent {}
