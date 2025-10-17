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

let products = [];
let selectedCategory = 'Todos';
const cart = new Map();

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatPrice(value) {
  return money.format(Number(value) || 0);
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
            <span class="product-tag">${product.tag}</span>
          </div>
          <div class="product-body">
            <div class="product-meta">
              <span>${product.categoria}</span>
              <span>Nota ${String(product.avaliacao).replace('.', ',')}</span>
            </div>
            <h3>${product.nome}</h3>
            <p>${product.descricao}</p>
            <div class="price-row">
              <span>
                <span class="old-price">${formatPrice(product.precoAntigo)}</span>
                <span class="price">${formatPrice(product.preco)}</span>
                <span class="installment">${product.parcelamento}</span>
              </span>
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

  cartCountEl.textContent = `${totalItems} ite${totalItems === 1 ? 'm' : 'ns'}`;
  cartTotalEl.textContent = formatPrice(total);
  checkoutTotalEl.textContent = formatPrice(total);

  if (items.length === 0) {
    cartItemsEl.innerHTML = '<p class="empty-state">Seu carrinho está vazio.</p>';
    return;
  }

  cartItemsEl.innerHTML = items
    .map(
      (item) => `
        <div class="cart-item">
          <div>
            <strong>${item.nome}</strong>
            <span>${item.quantity} x ${formatPrice(item.preco)}</span>
          </div>
          <button class="remove-button" type="button" data-id="${item.id}" aria-label="Remover ${item.nome}">x</button>
        </div>
      `
    )
    .join('');
}

function addToCart(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  const current = cart.get(id);
  cart.set(id, {
    ...product,
    quantity: current ? current.quantity + 1 : 1,
  });

  renderCart();
}

function removeFromCart(id) {
  const current = cart.get(id);
  if (!current) return;

  if (current.quantity === 1) {
    cart.delete(id);
  } else {
    cart.set(id, { ...current, quantity: current.quantity - 1 });
  }

  renderCart();
}

function filterProducts() {
  updateCatalog();
}

async function loadProducts() {
  try {
    const response = await fetch('/api/produtos');
    products = await response.json();
    updateCatalog();
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
  const button = event.target.closest('.remove-button');
  if (!button) return;
  removeFromCart(Number(button.dataset.id));
});

clearCartEl.addEventListener('click', () => {
  cart.clear();
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

renderCart();
loadProducts();
