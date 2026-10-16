import { persistentAtom } from '@nanostores/persistent';
import { computed } from 'nanostores';
import { PRODUCTS, productById, type Product } from '../data/products';
import { emit } from './events';

export interface CartLine {
  id: string;
  qty: number;
}

export const $cart = persistentAtom<CartLine[]>('hc-cart', [], {
  encode: JSON.stringify,
  decode: (raw) => {
    try {
      const parsed = JSON.parse(raw) as CartLine[];
      return Array.isArray(parsed) ? parsed.filter((l) => productById(l.id)) : [];
    } catch {
      return [];
    }
  },
});

export const $cartCount = computed($cart, (lines) => lines.reduce((n, l) => n + l.qty, 0));
export const $cartTotal = computed($cart, (lines) =>
  lines.reduce((sum, l) => sum + (productById(l.id)?.priceCHF ?? 0) * l.qty, 0),
);

/** Returns true when the item actually went into the cart. */
export function addToCart(id: string): boolean {
  const p = productById(id);
  if (!p) return false;
  if (p.status === 'sold_out') {
    emit('hc:toast', { message: 'Sold out. Even the box.' });
    return false;
  }
  const lines = $cart.get();
  const existing = lines.find((l) => l.id === id);
  if (existing && p.status === 'one_of_one') {
    emit('hc:toast', { message: 'One of one. It is already in your cart.' });
    return false;
  }
  $cart.set(
    existing ? lines.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l)) : [...lines, { id, qty: 1 }],
  );
  emit('hc:toast', { message: `Added — ${p.title}` });
  return true;
}

/** Brief confirmation on the button itself, so the click visibly did something. */
function flashAdded(btn: HTMLElement) {
  const label = btn.querySelector<HTMLElement>('span:first-child');
  if (!label || btn.dataset.flashing) return;
  const previous = label.textContent;
  btn.dataset.flashing = '1';
  label.textContent = 'Added ✓';
  window.setTimeout(() => {
    // The Tick may have relabelled the button for another product meanwhile.
    if (label.textContent === 'Added ✓') label.textContent = previous;
    delete btn.dataset.flashing;
  }, 1600);
}

export function removeFromCart(id: string) {
  $cart.set($cart.get().filter((l) => l.id !== id));
}

export function cartProducts(): Array<{ product: Product; qty: number }> {
  return $cart
    .get()
    .map((l) => ({ product: productById(l.id)!, qty: l.qty }))
    .filter((l) => l.product);
}

/* Global delegation: any [data-add], [data-cart-open], [data-quickview] on the page. */
document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const add = t.closest<HTMLElement>('[data-add]');
  if (add) {
    e.preventDefault();
    e.stopPropagation();
    if ((add as HTMLButtonElement).disabled) return;
    if (addToCart(add.dataset.add!)) flashAdded(add);
    return;
  }
  if (t.closest('[data-cart-open]')) {
    e.preventDefault();
    emit('hc:cart-open');
    return;
  }
  const qv = t.closest<HTMLElement>('[data-quickview]');
  if (qv) {
    e.preventDefault();
    emit('hc:quickview', { id: qv.dataset.quickview! });
  }
});

/* Header counters. */
$cartCount.subscribe((n) => {
  document.querySelectorAll('[data-cart-count]').forEach((el) => (el.textContent = String(n)));
});

export { PRODUCTS };
