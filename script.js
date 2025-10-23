const productsEl = document.querySelector('#products');
const productCountEl = document.querySelector('#product-count');
const categoryFiltersEl = document.querySelector('#category-filters');
const searchEl = document.querySelector('#search');
const sortEl = document.querySelector('#sort');
const cartItemsEl = document.querySelector('#cart-items');
const cartCountEl = document.querySelector('#cart-count');
const cartTotalEl = document.querySelector('#cart-total');
const checkoutTotalEl = document.querySelector('#checkout-total');
const clearCartEl = document.querySelector('#clear-cart');
const shippingMessageEl = document.querySelector('#shipping-message');
const shippingBarEl = document.querySelector('#shipping-bar');
const checkoutButtonEl = document.querySelector('#checkout-button');
const checkoutNoteEl = document.querySelector('#checkout-note');

let products = [];
let selectedCategory = 'Todos';
const cart = new Map();
const freeShippingGoal = 500;
const cartStorageKey = 'loja-virtual-cart';

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatPrice(value) {
  return money.format(Number(value) || 0);
}

function saveCart() {
  localStorage.setItem(cartStorageKey, JSON.stringify([...cart.values()]));
}

function loadSavedCart() {
  try {
    const savedItems = JSON.parse(localStorage.getItem(cartStorageKey) || '[]');
    savedItems.forEach((item) => cart.set(item.id, item));
  } catch (error) {
    localStorage.removeItem(cartStorageKey);
  }
}

function renderProducts(items) {
  productCountEl.textContent = `${items.length} produto${items.length === 1 ? '' : 's'}`;

  if (items.length === 0) {
    productsEl.innerHTML = '<p class="empty-state">Nenhum produto encontrado.</p>';
    return;
  }

  productsEl.innerHTML = items
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-media">
            <img src="${product.imagem}" alt="${product.nome}" />
          </div>
          <div class="product-body">
            <h3>${product.nome}</h3>
            <p>${product.descricao}</p>
            <div class="price-row">
              <div>
                <span class="price">${formatPrice(product.preco)}</span>
              </div>
              <button class="add-button" type="button" data-id="${product.id}">Adicionar</button>
            </div>
          </div>
        </article>
      `
    )
    .join('');
}

function renderCategories() {
  const categories = ['Todos', ...new Set(products.map((product) => product.categoria))];

  categoryFiltersEl.innerHTML = categories
    .map(
      (category) => `
        <button class="category-filter ${category === selectedCategory ? 'is-active' : ''}" type="button" data-category="${category}">
          ${category}
        </button>
      `
    )
    .join('');
}

function getVisibleProducts() {
  const term = searchEl.value.trim().toLowerCase();
  const sort = sortEl.value;

  const filtered = products.filter((product) => {
    const matchesCategory = selectedCategory === 'Todos' || product.categoria === selectedCategory;
    const matchesSearch = `${product.nome} ${product.descricao} ${product.categoria}`.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  return filtered.sort((a, b) => {
    if (sort === 'price-asc') return a.preco - b.preco;
    if (sort === 'price-desc') return b.preco - a.preco;
    if (sort === 'rating') return b.avaliacao - a.avaliacao;
    return a.id - b.id;
  });
}

function updateCatalog() {
  renderProducts(getVisibleProducts());
  renderCategories();
}

function renderCart() {
  const items = [...cart.values()];
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.quantity * item.preco, 0);
  const remaining = Math.max(freeShippingGoal - total, 0);
  const progress = Math.min((total / freeShippingGoal) * 100, 100);

  cartCountEl.textContent = `${totalItems} ite${totalItems === 1 ? 'm' : 'ns'}`;
  cartTotalEl.textContent = formatPrice(total);
  checkoutTotalEl.textContent = formatPrice(total);
  shippingBarEl.style.width = `${progress}%`;
  shippingMessageEl.textContent =
    total >= freeShippingGoal
      ? 'Frete grátis liberado para este pedido.'
      : `Faltam ${formatPrice(remaining)} para frete grátis.`;
  checkoutButtonEl.disabled = items.length === 0;
  saveCart();

  if (items.length === 0) {
    cartItemsEl.innerHTML = '<p class="empty-state">Seu carrinho está vazio.</p>';
    checkoutNoteEl.textContent = '';
    return;
  }

  cartItemsEl.innerHTML = items
    .map(
      (item) => `
        <div class="cart-item">
          <div>
            <strong>${item.nome}</strong>
            <span>${formatPrice(item.preco)} cada</span>
          </div>
          <div class="cart-actions">
            <div class="quantity-control" aria-label="Quantidade de ${item.nome}">
              <button type="button" data-action="decrease" data-id="${item.id}" aria-label="Diminuir ${item.nome}">-</button>
              <span>${item.quantity}</span>
              <button type="button" data-action="increase" data-id="${item.id}" aria-label="Aumentar ${item.nome}">+</button>
            </div>
            <button class="remove-button" type="button" data-action="remove" data-id="${item.id}" aria-label="Remover ${item.nome}">x</button>
          </div>
        </div>
      `
    )
    .join('');
}

function addToCart(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  const current = cart.get(id);
  const quantity = current ? current.quantity : 0;

  if (quantity >= product.estoque) {
    checkoutNoteEl.textContent = 'Estoque máximo desse produto já está no carrinho.';
    return;
  }

  cart.set(id, {
    ...product,
    quantity: quantity + 1,
  });

  checkoutNoteEl.textContent = '';
  renderCart();
}

function updateCartItem(id, action) {
  const current = cart.get(id);
  if (!current) return;

  if (action === 'increase') {
    if (current.quantity >= current.estoque) {
      checkoutNoteEl.textContent = 'Estoque máximo desse produto já está no carrinho.';
      return;
    }

    cart.set(id, { ...current, quantity: current.quantity + 1 });
  }

  if (action === 'decrease' && current.quantity > 1) {
    cart.set(id, { ...current, quantity: current.quantity - 1 });
  }

  if (action === 'decrease' && current.quantity === 1) {
    cart.delete(id);
  }

  if (action === 'remove') {
    cart.delete(id);
  }

  checkoutNoteEl.textContent = '';
  renderCart();
}

function filterProducts() {
  updateCatalog();
}

async function loadProducts() {
  try {
    const response = await fetch('/api/produtos');
    products = await response.json();
    cart.forEach((item) => {
      const product = products.find((productItem) => productItem.id === item.id);
      if (product) {
        cart.set(item.id, { ...product, quantity: item.quantity });
      }
    });
    updateCatalog();
    renderCart();
  } catch (error) {
    productsEl.innerHTML = '<p class="empty-state">Nao foi possivel carregar os produtos.</p>';
    productCountEl.textContent = 'Erro ao carregar';
  }
}

productsEl.addEventListener('click', (event) => {
  const button = event.target.closest('.add-button');
  if (!button) return;
  addToCart(Number(button.dataset.id));
});

cartItemsEl.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  updateCartItem(Number(button.dataset.id), button.dataset.action);
});

clearCartEl.addEventListener('click', () => {
  cart.clear();
  checkoutNoteEl.textContent = '';
  renderCart();
});

searchEl.addEventListener('input', filterProducts);
sortEl.addEventListener('change', updateCatalog);

categoryFiltersEl.addEventListener('click', (event) => {
  const button = event.target.closest('.category-filter');
  if (!button) return;
  selectedCategory = button.dataset.category;
  updateCatalog();
});

checkoutButtonEl.addEventListener('click', () => {
  checkoutNoteEl.textContent = 'Pedido pronto para finalizar.';
});

loadSavedCart();
renderCart();
loadProducts();
