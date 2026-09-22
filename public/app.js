import { I18N_DICTIONARY } from "./i18n.js";

// --- State Management ---
const state = {
  lang: "es-419",
  theme: "light",
  selectedCategory: "all",
  searchQuery: "",
  products: [],
  cart: { id: "cart-client-001", items: [], subtotal: 0, currency: "CLP", freeShippingThreshold: 30000, qualifiesForFreeShipping: false, missingForFreeShipping: 30000 },
  selectedProductForDetail: null,
  selectedProductForAR: null,
  selectedARProfile: "Nova",
  platformOnline: true,
};

function t(key, vars = {}) {
  const dict = I18N_DICTIONARY[state.lang] || I18N_DICTIONARY["es-419"];
  let text = dict[key] || key;
  for (const [k, v] of Object.entries(vars)) {
    text = text.replace(`{${k}}`, v);
  }
  return text;
}

function formatMoney(amount, currency = "CLP") {
  if (currency === "CLP") {
    return `$${Math.round(amount).toLocaleString("es-CL")} CLP`;
  }
  return `${amount.toFixed(2)} EUR`;
}

// --- DOM References ---
const elements = {
  themeToggleBtn: document.getElementById("btn-theme-toggle"),
  themeIcon: document.getElementById("theme-icon"),
  langToggleBtn: document.getElementById("btn-lang-toggle"),
  langLabel: document.getElementById("lang-label"),
  statusIndicator: document.getElementById("status-indicator"),
  statusText: document.getElementById("status-text"),
  heroBadge: document.getElementById("hero-badge"),
  heroTitle: document.getElementById("hero-title"),
  heroSubtitle: document.getElementById("hero-subtitle"),
  searchForm: document.getElementById("search-form"),
  searchInput: document.getElementById("search-input"),
  searchBtn: document.getElementById("search-btn"),
  categoryContainer: document.getElementById("category-container"),
  productGrid: document.getElementById("product-grid"),
  cartCounter: document.getElementById("cart-counter"),
  cartOpenBtn: document.getElementById("btn-cart-open"),
  cartCloseBtn: document.getElementById("btn-cart-close"),
  cartDrawer: document.getElementById("cart-drawer"),
  cartItemsContainer: document.getElementById("cart-items-container"),
  shippingProgressBox: document.getElementById("shipping-progress-box"),
  shippingProgressLabel: document.getElementById("shipping-progress-label"),
  shippingProgressFill: document.getElementById("shipping-progress-fill"),
  cartSubtotalVal: document.getElementById("cart-subtotal-val"),
  cartShippingVal: document.getElementById("cart-shipping-val"),
  cartTotalVal: document.getElementById("cart-total-val"),
  checkoutOpenBtn: document.getElementById("btn-checkout-open"),
  productModal: document.getElementById("product-modal"),
  modalProductTitle: document.getElementById("modal-product-title"),
  modalProductBody: document.getElementById("modal-product-body"),
  modalCloseBtn: document.getElementById("btn-modal-close"),
  arModal: document.getElementById("ar-modal"),
  arModalCloseBtn: document.getElementById("btn-ar-modal-close"),
  arModalProductName: document.getElementById("ar-modal-product-name"),
  arProfileSelect: document.getElementById("ar-profile-select"),
  arRecommendedSize: document.getElementById("ar-recommended-size"),
  arRationaleText: document.getElementById("ar-rationale-text"),
  arUrnDisplay: document.getElementById("ar-urn-display"),
  arWebxrInfo: document.getElementById("ar-webxr-info"),
  aiAssistantBtn: document.getElementById("btn-ai-assistant"),
  aiCloseBtn: document.getElementById("btn-ai-close"),
  aiDrawer: document.getElementById("ai-drawer"),
  aiMessagesContainer: document.getElementById("ai-messages-container"),
  aiChatForm: document.getElementById("ai-chat-form"),
  aiChatInput: document.getElementById("ai-chat-input"),
  checkoutModal: document.getElementById("checkout-modal"),
  checkoutCloseBtn: document.getElementById("btn-checkout-close"),
  checkoutForm: document.getElementById("checkout-form"),
  checkoutTotalVal: document.getElementById("checkout-total-val"),
  checkoutSuccessBox: document.getElementById("checkout-success-box"),
  checkoutSuccessOrderId: document.getElementById("checkout-success-order-id"),
  checkoutSuccessDoneBtn: document.getElementById("btn-checkout-success-done"),
};

// --- Initialization ---
async function initApp() {
  bindEvents();
  await loadCatalog();
  renderCategories();
  renderCatalog();
  renderCart();
  addAIMessage("system", state.lang === "es-419" ? "¡Hola! Soy tu asistente de Tentaciones. ¿Buscas zapatillas para correr, ropa para fiesta o asistencia con tu talla?" : "Hello! I am your Tentaciones shopping assistant. Are you looking for running shoes, party apparel or size guidance?");
  checkWebXRSupport();
}

// --- Event Binding ---
function bindEvents() {
  elements.themeToggleBtn.addEventListener("click", toggleTheme);
  elements.langToggleBtn.addEventListener("click", toggleLanguage);

  elements.searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSearch();
  });

  elements.cartOpenBtn.addEventListener("click", () => openDrawer(elements.cartDrawer));
  elements.cartCloseBtn.addEventListener("click", () => closeDrawer(elements.cartDrawer));

  elements.aiAssistantBtn.addEventListener("click", () => openDrawer(elements.aiDrawer));
  elements.aiCloseBtn.addEventListener("click", () => closeDrawer(elements.aiDrawer));

  elements.modalCloseBtn.addEventListener("click", () => closeModal(elements.productModal));
  elements.arModalCloseBtn.addEventListener("click", () => closeModal(elements.arModal));
  elements.checkoutCloseBtn.addEventListener("click", () => closeModal(elements.checkoutModal));

  elements.arProfileSelect.addEventListener("change", (e) => {
    state.selectedARProfile = e.target.value;
    updateARRecommendation();
  });

  elements.checkoutOpenBtn.addEventListener("click", () => {
    closeDrawer(elements.cartDrawer);
    openCheckoutModal();
  });

  elements.checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    processDemoCheckout();
  });

  elements.checkoutSuccessDoneBtn.addEventListener("click", () => {
    closeModal(elements.checkoutModal);
    elements.checkoutForm.style.display = "flex";
    elements.checkoutSuccessBox.style.display = "none";
  });

  elements.aiChatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleAIChat();
  });
}

// --- Theme & Language ---
function toggleTheme() {
  state.theme = state.theme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", state.theme);
  elements.themeIcon.textContent = state.theme === "light" ? "🌙" : "☀️";
}

function toggleLanguage() {
  state.lang = state.lang === "es-419" ? "en" : "es-419";
  elements.langLabel.textContent = state.lang === "es-419" ? "English" : "Español";
  applyI18n();
}

function applyI18n() {
  elements.heroBadge.textContent = t("hero.badge");
  elements.heroTitle.textContent = t("hero.title");
  elements.heroSubtitle.textContent = t("hero.subtitle");
  elements.searchInput.placeholder = t("search.placeholder");
  elements.searchBtn.textContent = t("search.button");
  document.getElementById("nav-ai-label").textContent = t("nav.ai_assistant");
  document.getElementById("nav-cart-label").textContent = t("nav.cart");
  renderCategories();
  renderCatalog();
  renderCart();
}

// --- Data Fetching ---
async function loadCatalog() {
  try {
    const res = await fetch("/api/products");
    if (res.ok) {
      state.products = await res.json();
    } else {
      throw new Error("Local API endpoint not found");
    }
  } catch {
    // Fallback: embedded catalog if served as raw static page
    state.products = getFallbackCatalog();
  }
}

// --- Render Categories ---
function renderCategories() {
  const categories = [
    { id: "all", label: t("category.all") },
    { id: "poleras", label: t("category.poleras") },
    { id: "camisas", label: t("category.camisas") },
    { id: "polerones", label: t("category.polerones") },
    { id: "chaquetas", label: t("category.chaquetas") },
    { id: "vestidos", label: t("category.vestidos") },
    { id: "pantalones", label: t("category.pantalones") },
    { id: "faldas", label: t("category.faldas") },
    { id: "calzado", label: t("category.calzado") },
    { id: "accesorios", label: t("category.accesorios") },
  ];

  while (elements.categoryContainer.firstChild) {
    elements.categoryContainer.removeChild(elements.categoryContainer.firstChild);
  }

  for (const cat of categories) {
    const tab = document.createElement("button");
    tab.className = `category-tab ${state.selectedCategory === cat.id ? "active" : ""}`;
    tab.textContent = cat.label;
    tab.addEventListener("click", () => {
      state.selectedCategory = cat.id;
      renderCategories();
      renderCatalog();
    });
    elements.categoryContainer.appendChild(tab);
  }
}

// --- Render Product Grid ---
function renderCatalog() {
  while (elements.productGrid.firstChild) {
    elements.productGrid.removeChild(elements.productGrid.firstChild);
  }

  let list = state.products;
  if (state.selectedCategory !== "all") {
    list = list.filter((p) => p.category === state.selectedCategory);
  }

  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q)) || p.category.includes(q));
  }

  for (const product of list) {
    const card = document.createElement("article");
    card.className = "product-card";

    const imgContainer = document.createElement("div");
    imgContainer.className = "product-image-container";

    const placeholder = document.createElement("div");
    placeholder.className = "product-image-placeholder";
    placeholder.textContent = getProductCategoryIcon(product.category);
    imgContainer.appendChild(placeholder);

    if (product.arAvailable) {
      const arBadge = document.createElement("span");
      arBadge.className = "ar-badge";
      arBadge.textContent = "👓 3D / AR";
      imgContainer.appendChild(arBadge);
    }

    const body = document.createElement("div");
    body.className = "product-body";

    const brand = document.createElement("div");
    brand.className = "product-brand";
    brand.textContent = product.brand;

    const name = document.createElement("h3");
    name.className = "product-name";
    name.textContent = product.name;

    const price = document.createElement("div");
    price.className = "product-price";
    price.textContent = formatMoney(product.basePriceCLP, product.currency);

    const actions = document.createElement("div");
    actions.className = "product-actions";

    const viewBtn = document.createElement("button");
    viewBtn.className = "btn btn-secondary";
    viewBtn.style.flex = "1";
    viewBtn.textContent = t("product.view_details");
    viewBtn.addEventListener("click", () => openProductDetailModal(product));

    const addBtn = document.createElement("button");
    addBtn.className = "btn btn-primary";
    addBtn.textContent = "🛒";
    addBtn.title = t("product.add_to_cart");
    addBtn.addEventListener("click", () => {
      const defaultVariant = product.variants[0];
      if (defaultVariant) {
        addToCart(product, defaultVariant);
      }
    });

    actions.appendChild(viewBtn);
    actions.appendChild(addBtn);

    body.appendChild(brand);
    body.appendChild(name);
    body.appendChild(price);
    body.appendChild(actions);

    card.appendChild(imgContainer);
    card.appendChild(body);
    elements.productGrid.appendChild(card);
  }
}

// --- Product Detail Modal ---
function openProductDetailModal(product) {
  state.selectedProductForDetail = product;
  elements.modalProductTitle.textContent = product.name;

  while (elements.modalProductBody.firstChild) {
    elements.modalProductBody.removeChild(elements.modalProductBody.firstChild);
  }

  const container = document.createElement("div");

  const brandEl = document.createElement("p");
  brandEl.className = "product-brand";
  brandEl.textContent = `${product.brand} • ${product.category.toUpperCase()}`;

  const descEl = document.createElement("p");
  descEl.style.fontSize = "0.875rem";
  descEl.style.color = "var(--text-secondary)";
  descEl.style.margin = "0.75rem 0";
  descEl.textContent = product.description;

  const priceEl = document.createElement("div");
  priceEl.className = "product-price";
  priceEl.textContent = formatMoney(product.basePriceCLP, product.currency);

  // Variant selector
  const varTitle = document.createElement("h4");
  varTitle.style.fontSize = "0.8125rem";
  varTitle.style.fontWeight = "700";
  varTitle.style.marginBottom = "0.35rem";
  varTitle.textContent = "Seleccionar Variante & Talla:";

  const variantContainer = document.createElement("div");
  variantContainer.style.display = "flex";
  variantContainer.style.flexWrap = "wrap";
  variantContainer.style.gap = "0.5rem";
  variantContainer.style.marginBottom = "1.25rem";

  let selectedVariant = product.variants[0];

  for (const variant of product.variants) {
    const vBtn = document.createElement("button");
    vBtn.className = `btn btn-secondary ${variant.sku === selectedVariant.sku ? "btn-primary" : ""}`;
    vBtn.style.fontSize = "0.75rem";
    vBtn.textContent = `${variant.color} - Talla ${variant.size} (Stock: ${variant.stock})`;
    vBtn.addEventListener("click", () => {
      selectedVariant = variant;
      for (const btn of variantContainer.children) {
        btn.className = "btn btn-secondary";
      }
      vBtn.className = "btn btn-primary";
    });
    variantContainer.appendChild(vBtn);
  }

  // Buttons
  const actionRow = document.createElement("div");
  actionRow.style.display = "flex";
  actionRow.style.gap = "0.75rem";

  const addCartBtn = document.createElement("button");
  addCartBtn.className = "btn btn-primary";
  addCartBtn.style.flex = "1";
  addCartBtn.textContent = t("product.add_to_cart");
  addCartBtn.addEventListener("click", () => {
    addToCart(product, selectedVariant);
    closeModal(elements.productModal);
    openDrawer(elements.cartDrawer);
  });

  actionRow.appendChild(addCartBtn);

  if (product.arAvailable) {
    const arBtn = document.createElement("button");
    arBtn.className = "btn btn-secondary";
    arBtn.textContent = "👓 " + t("product.try_on");
    arBtn.addEventListener("click", () => {
      closeModal(elements.productModal);
      openARModal(product);
    });
    actionRow.appendChild(arBtn);
  }

  container.appendChild(brandEl);
  container.appendChild(descEl);
  container.appendChild(priceEl);
  container.appendChild(varTitle);
  container.appendChild(variantContainer);
  container.appendChild(actionRow);

  elements.modalProductBody.appendChild(container);
  openModal(elements.productModal);
}

// --- AR Virtual Try-On ---
function openARModal(product) {
  state.selectedProductForAR = product;
  elements.arModalProductName.textContent = `${product.name} (${product.brand})`;
  elements.arUrnDisplay.textContent = product.defaultArUrn || "urn:tentaciones:ar:apparel";
  updateARRecommendation();
  openModal(elements.arModal);
}

function updateARRecommendation() {
  const product = state.selectedProductForAR;
  if (!product) return;

  const profile = state.selectedARProfile;
  let recommended = "M";
  let rationale = "Calculado según proporciones de silueta.";

  if (product.category === "calzado") {
    recommended = profile === "Mateo" ? "42" : profile === "Nova" ? "39" : "40";
    rationale = `Ajuste biomecánico para calce deportivo de silueta ${profile}.`;
  } else if (product.category === "pantalones") {
    recommended = profile === "Mateo" ? "34" : profile === "Nova" ? "30" : "32";
    rationale = `Contorno de cintura proporcional a perfil ${profile}.`;
  } else {
    recommended = profile === "Mateo" ? "L" : profile === "Nova" ? "S" : "M";
    rationale = `Holgura de pecho y hombros optimizada para perfil ${profile}.`;
  }

  elements.arRecommendedSize.textContent = recommended;
  elements.arRationaleText.textContent = rationale;
}

function checkWebXRSupport() {
  if (navigator.xr) {
    navigator.xr.isSessionSupported("immersive-ar").then((supported) => {
      elements.arWebxrInfo.textContent = supported ? t("ar.webxr_supported") : t("ar.webxr_unsupported");
    }).catch(() => {
      elements.arWebxrInfo.textContent = t("ar.webxr_unsupported");
    });
  } else {
    elements.arWebxrInfo.textContent = t("ar.webxr_unsupported");
  }
}

// --- Cart Operations ---
function addToCart(product, variant, qty = 1) {
  const existingIndex = state.cart.items.findIndex((i) => i.sku === variant.sku);
  const updatedItems = [...state.cart.items];

  if (existingIndex >= 0) {
    const item = updatedItems[existingIndex];
    const newQty = item.quantity + qty;
    updatedItems[existingIndex] = { ...item, quantity: newQty, lineTotal: newQty * item.unitPrice };
  } else {
    updatedItems.push({
      productId: product.id,
      sku: variant.sku,
      name: product.name,
      color: variant.color,
      size: variant.size,
      unitPrice: variant.priceCLP,
      currency: "CLP",
      quantity: qty,
      lineTotal: qty * variant.priceCLP,
    });
  }

  const subtotal = updatedItems.reduce((acc, i) => acc + i.lineTotal, 0);
  const threshold = state.cart.freeShippingThreshold;
  const missing = Math.max(0, threshold - subtotal);

  state.cart = {
    ...state.cart,
    items: updatedItems,
    subtotal,
    qualifiesForFreeShipping: missing === 0,
    missingForFreeShipping: missing,
  };

  renderCart();
}

function removeFromCart(sku) {
  const updatedItems = state.cart.items.filter((i) => i.sku !== sku);
  const subtotal = updatedItems.reduce((acc, i) => acc + i.lineTotal, 0);
  const threshold = state.cart.freeShippingThreshold;
  const missing = Math.max(0, threshold - subtotal);

  state.cart = {
    ...state.cart,
    items: updatedItems,
    subtotal,
    qualifiesForFreeShipping: missing === 0,
    missingForFreeShipping: missing,
  };

  renderCart();
}

function renderCart() {
  const count = state.cart.items.reduce((acc, i) => acc + i.quantity, 0);
  elements.cartCounter.textContent = count.toString();

  while (elements.cartItemsContainer.firstChild) {
    elements.cartItemsContainer.removeChild(elements.cartItemsContainer.firstChild);
  }

  if (state.cart.items.length === 0) {
    const emptyEl = document.createElement("p");
    emptyEl.style.color = "var(--text-secondary)";
    emptyEl.style.fontSize = "0.875rem";
    emptyEl.style.textAlign = "center";
    emptyEl.style.padding = "2rem 0";
    emptyEl.textContent = t("cart.empty");
    elements.cartItemsContainer.appendChild(emptyEl);
  } else {
    for (const item of state.cart.items) {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.alignItems = "center";
      row.style.padding = "0.75rem 0";
      row.style.borderBottom = "1px solid var(--border)";

      const info = document.createElement("div");
      const title = document.createElement("h4");
      title.style.fontSize = "0.875rem";
      title.style.fontWeight = "700";
      title.textContent = item.name;

      const sub = document.createElement("p");
      sub.style.fontSize = "0.75rem";
      sub.style.color = "var(--text-secondary)";
      sub.textContent = `${item.color} | Talla: ${item.size} | Cant: ${item.quantity}`;

      info.appendChild(title);
      info.appendChild(sub);

      const right = document.createElement("div");
      right.style.textAlign = "right";

      const lineTotal = document.createElement("div");
      lineTotal.style.fontWeight = "700";
      lineTotal.style.fontSize = "0.875rem";
      lineTotal.textContent = formatMoney(item.lineTotal, item.currency);

      const removeBtn = document.createElement("button");
      removeBtn.style.background = "none";
      removeBtn.style.border = "none";
      removeBtn.style.color = "var(--danger)";
      removeBtn.style.fontSize = "0.75rem";
      removeBtn.style.cursor = "pointer";
      removeBtn.style.marginTop = "0.25rem";
      removeBtn.textContent = "Eliminar";
      removeBtn.addEventListener("click", () => removeFromCart(item.sku));

      right.appendChild(lineTotal);
      right.appendChild(removeBtn);

      row.appendChild(info);
      row.appendChild(right);
      elements.cartItemsContainer.appendChild(row);
    }
  }

  // Free shipping progress
  const progressPercent = Math.min(100, Math.round((state.cart.subtotal / state.cart.freeShippingThreshold) * 100));
  elements.shippingProgressFill.style.width = `${progressPercent}%`;

  if (state.cart.qualifiesForFreeShipping) {
    elements.shippingProgressLabel.textContent = t("cart.free_shipping_qualifies");
    elements.shippingProgressLabel.style.color = "var(--success)";
  } else {
    elements.shippingProgressLabel.textContent = t("cart.free_shipping_missing", { amount: formatMoney(state.cart.missingForFreeShipping, "CLP") });
    elements.shippingProgressLabel.style.color = "var(--text-secondary)";
  }

  const shippingFee = state.cart.qualifiesForFreeShipping || state.cart.items.length === 0 ? 0 : 3990;
  const total = state.cart.subtotal + shippingFee;

  elements.cartSubtotalVal.textContent = formatMoney(state.cart.subtotal, "CLP");
  elements.cartShippingVal.textContent = shippingFee === 0 ? t("cart.shipping_free") : formatMoney(shippingFee, "CLP");
  elements.cartTotalVal.textContent = formatMoney(total, "CLP");
}

// --- AI Natural Language Search & Assistant ---
function handleSearch() {
  const query = elements.searchInput.value.trim();
  if (!query) return;

  state.searchQuery = query;
  renderCatalog();

  addAIMessage("user", query);
  const results = state.products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.tags.some((t) => t.includes(query.toLowerCase())));
  const responseText = results.length > 0
    ? `Encontré ${results.length} producto(s) afines a tu búsqueda: "${query}".`
    : `No encontré coincidencias exactas para "${query}". Te muestro las opciones más destacadas de nuestro catálogo.`;

  addAIMessage("assistant", responseText);
}

function handleAIChat() {
  const text = elements.aiChatInput.value.trim();
  if (!text) return;

  elements.aiChatInput.value = "";
  addAIMessage("user", text);

  const normalized = text.toLowerCase();
  let reply = "Entiendo tu consulta. Te asisto con recomendaciones de prendas de alta calidad y tallas precisas.";

  if (normalized.includes("despacho") || normalized.includes("envío")) {
    reply = state.cart.qualifiesForFreeShipping
      ? `Tu pedido actual (${formatMoney(state.cart.subtotal)}) califica para Despacho Gratis a todo Chile.`
      : `Tu subtotal es ${formatMoney(state.cart.subtotal)}. Te faltan ${formatMoney(state.cart.missingForFreeShipping)} para el Despacho Gratis (umbral: ${formatMoney(state.cart.freeShippingThreshold)}).`;
  } else if (normalized.includes("talla") || normalized.includes("medida")) {
    reply = "Para calzado recomendamos medir el largo en cm. Para vestuario, nuestro probador virtual AR calibra con perfiles biométricos Nova (F), Sora (Unisex) y Mateo (M).";
  } else if (normalized.includes("ar") || normalized.includes("3d") || normalized.includes("probar")) {
    reply = "Haz clic en el botón 'Probar en AR' de cualquier prenda para ingresar al Probador Virtual 3D.";
  }

  setTimeout(() => addAIMessage("assistant", reply), 300);
}

function addAIMessage(sender, message) {
  const msgEl = document.createElement("div");
  msgEl.style.padding = "0.65rem 0.875rem";
  msgEl.style.borderRadius = "var(--radius-md)";
  msgEl.style.fontSize = "0.8125rem";
  msgEl.style.lineHeight = "1.4";

  if (sender === "user") {
    msgEl.style.backgroundColor = "var(--primary)";
    msgEl.style.color = "#ffffff";
    msgEl.style.alignSelf = "flex-end";
    msgEl.style.maxWidth = "80%";
  } else if (sender === "assistant") {
    msgEl.style.backgroundColor = "var(--bg-muted)";
    msgEl.style.color = "var(--text-primary)";
    msgEl.style.border = "1px solid var(--border)";
    msgEl.style.alignSelf = "flex-start";
    msgEl.style.maxWidth = "85%";
  } else {
    msgEl.style.backgroundColor = "var(--primary-light)";
    msgEl.style.color = "var(--primary)";
    msgEl.style.fontSize = "0.75rem";
    msgEl.style.textAlign = "center";
  }

  msgEl.textContent = message;
  elements.aiMessagesContainer.appendChild(msgEl);
  elements.aiMessagesContainer.scrollTop = elements.aiMessagesContainer.scrollHeight;
}

// --- Checkout Simulation ---
function openCheckoutModal() {
  if (state.cart.items.length === 0) return;
  const shippingFee = state.cart.qualifiesForFreeShipping ? 0 : 3990;
  const total = state.cart.subtotal + shippingFee;
  elements.checkoutTotalVal.textContent = formatMoney(total, "CLP");
  openModal(elements.checkoutModal);
}

function processDemoCheckout() {
  const orderId = `tentaciones-${Math.random().toString(36).substring(2, 10)}`;
  elements.checkoutForm.style.display = "none";
  elements.checkoutSuccessOrderId.textContent = `Orden N° ${orderId}`;
  elements.checkoutSuccessBox.style.display = "block";

  // Clear cart
  state.cart = {
    ...state.cart,
    items: [],
    subtotal: 0,
    qualifiesForFreeShipping: false,
    missingForFreeShipping: state.cart.freeShippingThreshold,
  };
  renderCart();
}

// --- Modal & Drawer Helpers ---
function openModal(el) {
  el.classList.add("open");
}

function closeModal(el) {
  el.classList.remove("open");
}

function openDrawer(el) {
  el.classList.add("open");
}

function closeDrawer(el) {
  el.classList.remove("open");
}

function getProductCategoryIcon(cat) {
  switch (cat) {
    case "poleras": return "👕";
    case "camisas": return "👔";
    case "polerones": return "🧥";
    case "chaquetas": return "🥼";
    case "vestidos": return "👗";
    case "pantalones": return "👖";
    case "faldas": return "🥻";
    case "calzado": return "👟";
    case "accesorios": return "🧦";
    default: return "🛍️";
  }
}

// --- Fallback Catalog Definition ---
function getFallbackCatalog() {
  return [
    {
      id: "prod-polera-essential",
      slug: "polera-oversized-cotton-essential",
      name: "Polera Oversized Organic Cotton Essential",
      brand: "Tentaciones Atelier",
      category: "poleras",
      description: "Polera corte oversized confeccionada en 100% algodón orgánico peinado de 240 GSM.",
      basePriceCLP: 22990,
      currency: "CLP",
      tags: ["polera", "algodon", "oversized", "blanca"],
      arAvailable: true,
      defaultArUrn: "urn:tentaciones:ar:apparel:polera-essential",
      variants: [
        { sku: "POL-WHT-S", color: "Blanco Crudo", size: "S", priceCLP: 22990, stock: 25 },
        { sku: "POL-WHT-M", color: "Blanco Crudo", size: "M", priceCLP: 22990, stock: 30 },
      ],
    },
    {
      id: "prod-zapatillas-carbon",
      slug: "pro-carbon-racer-marathon-shoes",
      name: "Zapatillas Pro Carbon Racer Marathon Shoes",
      brand: "Tentaciones Sport",
      category: "calzado",
      description: "Zapatilla de competición en asfalto con placa completa de fibra de carbono.",
      basePriceCLP: 119990,
      currency: "CLP",
      tags: ["calzado", "zapatillas", "running", "carbon"],
      arAvailable: true,
      defaultArUrn: "urn:tentaciones:ar:footwear:pro-carbon-racer",
      variants: [
        { sku: "PCR-BLK-40", color: "Black / Stealth", size: 40, priceCLP: 119990, stock: 18 },
        { sku: "PCR-BLK-42", color: "Black / Stealth", size: 42, priceCLP: 119990, stock: 20 },
      ],
    },
    {
      id: "prod-vestido-seda",
      slug: "vestido-aura-silk-evening-gala",
      name: "Vestido Aura Silk Elegant Dinner Gala",
      brand: "Tentaciones Atelier",
      category: "vestidos",
      description: "Vestido midi de noche confeccionado en 100% seda Mulberry pura.",
      basePriceCLP: 139990,
      currency: "CLP",
      tags: ["vestido", "seda", "elegante", "gala", "negro"],
      arAvailable: true,
      defaultArUrn: "urn:tentaciones:ar:apparel:silk-evening-dress",
      variants: [
        { sku: "SED-NOIR-M", color: "Noir Velvet", size: "M", priceCLP: 139990, stock: 12 },
      ],
    },
  ];
}

document.addEventListener("DOMContentLoaded", initApp);
