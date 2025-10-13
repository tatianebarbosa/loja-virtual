const productImages = {
  1: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=900&q=80',
  2: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80',
  3: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
};

const productsEl = document.querySelector('#products');
const productCountEl = document.querySelector('#product-count');
const searchEl = document.querySelector('#search');
const cartItemsEl = document.querySelector('#cart-items');
const cartCountEl = document.querySelector('#cart-count');
const cartTotalEl = document.querySelector('#cart-total');
const checkoutTotalEl = document.querySelector('#checkout-total');
const clearCartEl = document.querySelector('#clear-cart');

let products = [];
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
          <img src="${productImages[product.id] || productImages[1]}" alt="${product.nome}" />
          <div class="product-body">
            <h3>${product.nome}</h3>
            <p>${product.descricao}</p>
            <div class="price-row">
              <span class="price">${formatPrice(product.preco)}</span>
              <button class="add-button" type="button" data-id="${product.id}">Adicionar</button>
            </div>
          </div>
        </article>
      `
    )
    .join('');
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
  const term = searchEl.value.trim().toLowerCase();
  const filtered = products.filter((product) => {
    return `${product.nome} ${product.descricao}`.toLowerCase().includes(term);
  });

  renderProducts(filtered);
}

async function loadProducts() {
  try {
    const response = await fetch('/api/produtos');
    products = await response.json();
    renderProducts(products);
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

renderCart();
loadProducts();
