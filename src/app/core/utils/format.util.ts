/** Whole-dollar formatting, used everywhere a price is shown. */
export function usd(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? '−' : '';
  return `${sign}$${Math.abs(rounded).toLocaleString('en-US')}`;
}

/** "5 nights" / "1 night" */
export function nightsLabel(nights: number): string {
  return `${nights} ${nights === 1 ? 'night' : 'nights'}`;
}

/** "2 adults, 1 child" */
export function guestsLabel(adults: number, children: number): string {
  const parts = [`${adults} ${adults === 1 ? 'adult' : 'adults'}`];
  if (children > 0) parts.push(`${children} ${children === 1 ? 'child' : 'children'}`);
  return parts.join(', ');
}
