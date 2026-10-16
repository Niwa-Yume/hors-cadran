import { formatCHF, type Product } from '../data/products';
import { esc } from './ui';

/** Watch-reference style spec rows, shared by the spec sheet and quick view. */
export function specRows(p: Product, compact = false): Array<[string, string]> {
  const s = p.spec;
  const rows: Array<[string, string]> = [
    ['Reference', s.reference],
    ['Calibre', s.calibre],
    ['Case', s.case],
    ['Power reserve', s.powerReserve],
    ['Water resistance', s.waterResistance],
    ['Provenance', s.provenance],
  ];
  if (compact) rows.push(['Year', String(s.year)]);
  rows.push(['Condition', s.condition], ['Edition', s.edition]);
  if (!compact) rows.push(['Price incl. VAT', formatCHF(p.priceCHF)]);
  return rows;
}

export const specRowsHTML = (p: Product, compact = false) =>
  specRows(p, compact)
    .map(([k, v]) => `<div class="spec__row"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
    .join('');
