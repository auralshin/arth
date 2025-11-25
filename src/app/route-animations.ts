import {
  animate,
  animateChild,
  group,
  query,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter', [
      style({
        opacity: 0,
      }),
    ], { optional: true }),
    query(':leave', animateChild(), { optional: true }),
    group([
      query(':leave', [
        animate(
          '250ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({
            opacity: 0,
          })
        ),
      ], { optional: true }),
      query(':enter', [
        animate(
          '400ms 100ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({
            opacity: 1,
          })
        ),
      ], { optional: true }),
    ]),
    query(':enter', animateChild(), { optional: true }),
  ]),
]);

export const fadeAnimation = trigger('fadeAnimation', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0 }),
    ], { optional: true }),
    query(':leave', [
      animate('250ms ease-out', style({ opacity: 0 })),
    ], { optional: true }),
    query(':enter', [
      animate('450ms 200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1 })),
    ], { optional: true }),
  ]),
]);

export const slideAnimation = trigger('slideAnimation', [
  transition('* => *', [
    query(':enter, :leave', [
      style({
        opacity: 0,
      }),
    ], { optional: true }),
    group([
      query(':leave', [
        animate(
          '250ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({
            opacity: 0,
          })
        ),
      ], { optional: true }),
      query(':enter', [
        animate(
          '400ms 100ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({
            opacity: 1,
          })
        ),
      ], { optional: true }),
    ]),
  ]),
]);
