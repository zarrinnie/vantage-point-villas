import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('creates the application', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the chrome every page shares', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('a[href="#main"]')?.textContent).toContain('Skip to content');
    expect(el.querySelector('header')?.textContent).toContain('Vantage Point');
    expect(el.querySelector('main')?.getAttribute('id')).toBe('main');
    expect(el.querySelector('footer')?.textContent).toContain('Jalan Toya Ning I');
  });
});
