// --- Variables ---
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// --- Renderizado de productos ---
function renderProducts(filtered = products) {
  const container = document.getElementById("products");
  container.innerHTML = "";
  filtered.forEach(product => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
      <img src="${product.img}" alt="${product.name}" onclick="showProduct(${product.id})">
      <h3>${highlightText(product.name, document.getElementById("search").value)}</h3>
      <p>$${product.price}</p>
      <div class="rating">${"★".repeat(product.rating)}</div>
      <button onclick="addToCart(${product.id}, this)">Agregar al carrito</button>
    `;
    container.appendChild(card);
  });
  addSwipeToCards();
}

// --- Resaltar búsqueda ---
function highlightText(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

// --- Carrito ---
function addToCart(id, btn) {
  const product = products.find(p => p.id === id);
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
  document.getElementById("cart-count").innerText = cart.length;
  animateCart();
  showFloatCounter();
  animateFlyImage(btn);
}

function animateCart() {
  const cartIcon = document.getElementById("cart");
  cartIcon.style.transform = "scale(1.3)";
  setTimeout(() => cartIcon.style.transform = "scale(1)", 200);
}

function showFloatCounter() {
  const float = document.getElementById("cart-float");
  float.classList.add("show");
  setTimeout(() => float.classList.remove("show"), 600);
}

function animateFlyImage(btn) {
  const img = btn.parentElement.querySelector("img");
  const flyImg = img.cloneNode(true);
  flyImg.classList.add("fly-img");
  document.body.appendChild(flyImg);
  const rect = img.getBoundingClientRect();
  flyImg.style.top = rect.top + "px";
  flyImg.style.left = rect.left + "px";
  const cartIcon = document.getElementById("cart");
  const cartRect = cartIcon.getBoundingClientRect();
  setTimeout(() => {
    flyImg.style.top = cartRect.top + "px";
    flyImg.style.left = cartRect.left + "px";
    flyImg.style.width = "30px";
    flyImg.style.height = "30px";
    flyImg.style.opacity = "0.5";
  }, 50);
  setTimeout(() => { document.body.removeChild(flyImg); showPopup(); bounceCart(); }, 850);
}

function bounceCart() {
  const cartIcon = document.getElementById("cart");
  cartIcon.style.transition = "transform 0.2s";
  cartIcon.style.transform = "scale(1.6)";
  setTimeout(() => { cartIcon.style.transform = "scale(1)"; }, 200);
}

function showPopup() {
  const popup = document.getElementById("popup");
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 800);
}

// --- Modal carrito ---
function toggleCart() {
  document.getElementById("cart-modal").classList.toggle("hidden");
  renderCart();
}

function renderCart() {
  const container = document.getElementById("cart-items");
  container.innerHTML = "";
  let total = 0;
  cart.forEach((item, index) => {
    const div = document.createElement("div");
    div.innerHTML = `${item.name} - $${item.price} <button onclick="removeFromCart(${index})">❌</button>`;
    container.appendChild(div);
    total += item.price;
  });
  document.getElementById("cart-total").innerText = total;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  document.getElementById("cart-count").innerText = cart.length;
  renderCart();
}

// --- Checkout ---
function checkout() {
  if (cart.length === 0) { alert("Tu carrito está vacío 😅"); return; }
  document.getElementById("checkout-modal").classList.remove("hidden");
}

function closeCheckout() {
  document.getElementById("checkout-modal").classList.add("hidden");
}

document.getElementById("checkout-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const address = document.getElementById("address").value;
  const payment = document.getElementById("payment").value;
  setTimeout(() => {
    alert(`¡Gracias ${name}! 🎉\nPago realizado con ${payment}.\nConfirmación enviada a ${email}.\nTu pedido llegará a: ${address}`);
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
    document.getElementById("cart-count").innerText = 0;
    renderCart();
    closeCheckout();
    document.getElementById("checkout-form").reset();
  }, 1000);
});

// --- Página producto ---
function showProduct(id) {
  const product = products.find(p => p.id === id);
  const modal = document.getElementById("product-modal");
  const content = document.getElementById("product-content");
  content.innerHTML = `
    <img src="${product.img}" alt="${product.name}">
    <h3>${product.name}</h3>
    <p>$${product.price}</p>
    <div class="rating">${"★".repeat(product.rating)}</div>
    <p>${product.description}</p>
    <button onclick="addToCart(${product.id}, this)">Agregar al carrito</button>
  `;
  modal.classList.remove("hidden");
}

function closeProduct() {
  document.getElementById("product-modal").classList.add("hidden");
}

// --- Filtros y búsqueda ---
function filterProducts() {
  let search = document.getElementById("search").value.toLowerCase();
  let category = document.getElementById("category-filter").value;
  let sort = document.getElementById("sort-filter").value;
  let filtered = products.filter(p => {
    let matchesSearch = p.name.toLowerCase().includes(search);
    let matchesCategory = category === "all" || p.category === category;
    return matchesSearch && matchesCategory;
  });
  if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
  if (sort === "name-asc") filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "name-desc") filtered.sort((a, b) => b.name.localeCompare(a.name));
  renderProducts(filtered);
}

function loadCategories() {
  const select = document.getElementById("category-filter");
  const categories = [...new Set(products.map(p => p.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.innerText = cat;
    select.appendChild(option);
  });
}

// --- Modo oscuro ---
document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// --- Swipe móviles ---
function addSwipeToCards() {
  const cards = document.querySelectorAll(".product-card");
  cards.forEach(card => {
    let startX = 0;
    let distX = 0;
    card.addEventListener("touchstart", e => { startX = e.touches[0].clientX; });
    card.addEventListener("touchmove", e => {
      distX = e.touches[0].clientX - startX;
      card.style.transform = `translateX(${distX}px)`;
    });
    card.addEventListener("touchend", e => {
      if (distX > 100) {
        const btn = card.querySelector("button");
        btn.click();
        card.style.transition = "transform 0.5s, opacity 0.5s";
        card.style.transform = "translateX(100%)";
        card.style.opacity = "0";
        setTimeout(() => { card.style.transition = ""; card.style.transform = ""; card.style.opacity = ""; }, 600);
      } else {
        card.style.transition = "transform 0.3s";
        card.style.transform = "translateX(0)";
        setTimeout(() => { card.style.transition = ""; }, 300);
      }
      distX = 0;
    });
  });
}

// --- Inicialización ---
loadCategories();
renderProducts();
document.getElementById("cart-count").innerText = cart.length;