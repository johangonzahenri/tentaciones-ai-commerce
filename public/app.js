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
  selectedProductFor3D: null,
  selectedProductForAR: null,
  selectedARProfile: "Nova",
  arViewMode: "2D", // "2D" | "WEBXR"
  webxrSupported: false,
  // 3D Viewer Interactive Camera State
  viewer3D: {
    rotX: 15,
    rotY: 45,
    zoom: 1.0,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    autoSpin: false,
    animFrameId: null,
    meshType: "polera",
  },
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
  heroBadge: document.getElementById("hero-badge"),
  heroTitle: document.getElementById("hero-title"),
  heroSubtitle: document.getElementById("hero-subtitle"),
  heroTryNowBtn: document.getElementById("btn-hero-try-now"),
  heroExploreBtn: document.getElementById("btn-hero-explore"),
  searchForm: document.getElementById("search-form"),
  searchInput: document.getElementById("search-input"),
  searchBtn: document.getElementById("search-btn"),
  searchFeedbackBox: document.getElementById("search-feedback-box"),
  searchFeedbackIntent: document.getElementById("search-feedback-intent"),
  searchFeedbackRationale: document.getElementById("search-feedback-rationale"),
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
  // 3D Viewer elements
  viewer3DModal: document.getElementById("viewer-3d-modal"),
  viewer3DTitle: document.getElementById("viewer-3d-title"),
  viewer3DProductName: document.getElementById("viewer-3d-product-name"),
  viewer3DCloseBtn: document.getElementById("btn-viewer-3d-close"),
  canvas3D: document.getElementById("canvas-3d"),
  viewer3DLoading: document.getElementById("viewer-3d-loading"),
  btn3DRotateLeft: document.getElementById("btn-3d-rotate-left"),
  btn3DRotateRight: document.getElementById("btn-3d-rotate-right"),
  btn3DZoomIn: document.getElementById("btn-3d-zoom-in"),
  btn3DZoomOut: document.getElementById("btn-3d-zoom-out"),
  btn3DReset: document.getElementById("btn-3d-reset"),
  btn3DAutoSpin: document.getElementById("btn-3d-auto-spin"),
  btn3DToAR: document.getElementById("btn-3d-to-ar"),
  btn3DReturn: document.getElementById("btn-3d-return"),
  // AR elements
  arModal: document.getElementById("ar-modal"),
  arModalCloseBtn: document.getElementById("btn-ar-modal-close"),
  arModalProductName: document.getElementById("ar-modal-product-name"),
  arAvatarIcon: document.getElementById("ar-avatar-icon"),
  arViewModeLabel: document.getElementById("ar-view-mode-label"),
  arModePill: document.getElementById("ar-mode-pill"),
  arUrnDisplay: document.getElementById("ar-urn-display"),
  arProfileCardsContainer: document.getElementById("profile-cards-container"),
  arRecommendedSize: document.getElementById("ar-recommended-size"),
  arRationaleText: document.getElementById("ar-rationale-text"),
  arWebxrInfo: document.getElementById("ar-webxr-info"),
  btnMode2D: document.getElementById("btn-mode-2d"),
  btnModeWebXR: document.getElementById("btn-mode-webxr"),
  btnArAddToCart: document.getElementById("btn-ar-add-to-cart"),
  btnArCloseReturn: document.getElementById("btn-ar-close-return"),
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
  showcaseBtn: document.getElementById("btn-showcase-open"),
  showcaseCloseBtn: document.getElementById("btn-showcase-close"),
  showcaseDrawer: document.getElementById("showcase-drawer"),
  metricProducts: document.getElementById("metric-products"),
  metricFittings: document.getElementById("metric-fittings"),
  metricRecommendations: document.getElementById("metric-recommendations"),
  metricOrders: document.getElementById("metric-orders"),
};

// --- Initialization ---
async function initApp() {
  bindEvents();
  init3DCanvasEvents();
  await loadCatalog();
  await loadMetrics();
  renderCategories();
  renderCatalog();
  renderCart();
  renderARProfiles();
  addAIMessage("system", state.lang === "es-419" ? "¡Hola! Soy tu asistente de moda en Tentaciones. ¿Buscas zapatillas de running, un vestido elegante o asistencia con tu talla?" : "Hello! I am your fashion assistant at Tentaciones. Are you looking for running shoes, an elegant dress, or size advice?");
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

  elements.heroTryNowBtn.addEventListener("click", () => {
    const firstArProd = state.products.find((p) => p.arAvailable) || state.products[0];
    if (firstArProd) {
      openARModal(firstArProd);
    }
  });

  elements.cartOpenBtn.addEventListener("click", () => openDrawer(elements.cartDrawer));
  elements.cartCloseBtn.addEventListener("click", () => closeDrawer(elements.cartDrawer));

  if (elements.showcaseBtn && elements.showcaseDrawer) {
    elements.showcaseBtn.addEventListener("click", () => openDrawer(elements.showcaseDrawer));
  }
  if (elements.showcaseCloseBtn && elements.showcaseDrawer) {
    elements.showcaseCloseBtn.addEventListener("click", () => closeDrawer(elements.showcaseDrawer));
  }

  elements.aiAssistantBtn.addEventListener("click", () => openDrawer(elements.aiDrawer));
  elements.aiCloseBtn.addEventListener("click", () => closeDrawer(elements.aiDrawer));

  elements.modalCloseBtn.addEventListener("click", () => closeModal(elements.productModal));
  elements.arModalCloseBtn.addEventListener("click", () => closeModal(elements.arModal));
  elements.btnArCloseReturn.addEventListener("click", () => closeModal(elements.arModal));
  elements.checkoutCloseBtn.addEventListener("click", () => closeModal(elements.checkoutModal));

  // 3D Viewer Toolbar & Buttons
  elements.viewer3DCloseBtn.addEventListener("click", () => close3DViewer());
  elements.btn3DReturn.addEventListener("click", () => {
    close3DViewer();
    if (state.selectedProductFor3D) {
      openProductDetailModal(state.selectedProductFor3D);
    }
  });
  elements.btn3DToAR.addEventListener("click", () => {
    const prod = state.selectedProductFor3D;
    close3DViewer();
    if (prod && prod.arAvailable) {
      openARModal(prod);
    }
  });

  elements.btn3DRotateLeft.addEventListener("click", () => {
    state.viewer3D.rotY -= 45;
    render3DMesh();
  });
  elements.btn3DRotateRight.addEventListener("click", () => {
    state.viewer3D.rotY += 45;
    render3DMesh();
  });
  elements.btn3DZoomIn.addEventListener("click", () => {
    state.viewer3D.zoom = Math.min(2.2, state.viewer3D.zoom + 0.2);
    render3DMesh();
  });
  elements.btn3DZoomOut.addEventListener("click", () => {
    state.viewer3D.zoom = Math.max(0.5, state.viewer3D.zoom - 0.2);
    render3DMesh();
  });
  elements.btn3DReset.addEventListener("click", () => {
    state.viewer3D.rotX = 15;
    state.viewer3D.rotY = 45;
    state.viewer3D.zoom = 1.0;
    state.viewer3D.autoSpin = false;
    elements.btn3DAutoSpin.className = "btn btn-secondary btn-sm";
    render3DMesh();
  });
  elements.btn3DAutoSpin.addEventListener("click", () => {
    state.viewer3D.autoSpin = !state.viewer3D.autoSpin;
    elements.btn3DAutoSpin.className = state.viewer3D.autoSpin ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm";
    if (state.viewer3D.autoSpin) {
      animate3DLoop();
    }
  });

  // AR Modes
  elements.btnMode2D.addEventListener("click", () => {
    state.arViewMode = "2D";
    elements.btnMode2D.className = "btn btn-secondary active-mode";
    elements.btnModeWebXR.className = "btn btn-secondary";
    elements.arModePill.textContent = "DEMO 2D SIMULATION";
    elements.arViewModeLabel.textContent = "Simulación Espacial 2D Interactiva";
  });

  elements.btnModeWebXR.addEventListener("click", () => {
    if (state.webxrSupported) {
      state.arViewMode = "WEBXR";
      elements.btnModeWebXR.className = "btn btn-secondary active-mode";
      elements.btnMode2D.className = "btn btn-secondary";
      elements.arModePill.textContent = "WEBXR IMMERSIVE";
      elements.arViewModeLabel.textContent = "Proyección Espacial AR WebXR Activa";
    } else {
      alert(t("ar.webxr_unsupported"));
    }
  });

  elements.btnArAddToCart.addEventListener("click", () => {
    const product = state.selectedProductForAR;
    if (product) {
      const recSize = elements.arRecommendedSize.textContent;
      const matchedVariant = product.variants.find((v) => String(v.size) === String(recSize)) || product.variants[0];
      addToCart(product, matchedVariant);
      closeModal(elements.arModal);
      openDrawer(elements.cartDrawer);
    }
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
  document.getElementById("hero-cta-try-text").textContent = t("hero.cta_try_now");
  document.getElementById("hero-cta-explore-text").textContent = t("hero.cta_explore");
  elements.searchInput.placeholder = t("search.placeholder");
  elements.searchBtn.textContent = t("search.button");

  const navAi = document.getElementById("nav-ai-label");
  if (navAi) navAi.textContent = t("nav.ai_assistant");
  const navCart = document.getElementById("nav-cart-label");
  if (navCart) navCart.textContent = t("nav.cart");
  const navShowcase = document.getElementById("nav-showcase-label");
  if (navShowcase) navShowcase.textContent = t("nav.portfolio");
  const demoBadge = document.getElementById("demo-badge");
  if (demoBadge) demoBadge.textContent = t("demo.badge");
  const demoDisc = document.getElementById("demo-disclosure-text");
  if (demoDisc) demoDisc.textContent = t("demo.disclosure");
  const brandBadge = document.getElementById("brand-badge-mode");
  if (brandBadge) brandBadge.textContent = t("demo.badge");

  const lblProd = document.getElementById("lbl-metric-products");
  if (lblProd) lblProd.textContent = t("metrics.products");
  const lblFit = document.getElementById("lbl-metric-fittings");
  if (lblFit) lblFit.textContent = t("metrics.fittings");
  const lblRec = document.getElementById("lbl-metric-recommendations");
  if (lblRec) lblRec.textContent = t("metrics.recommendations");
  const lblOrd = document.getElementById("lbl-metric-orders");
  if (lblOrd) lblOrd.textContent = t("metrics.orders");

  // How it works
  const howT = document.getElementById("how-title");
  if (howT) howT.textContent = t("how_it_works.title");
  const h1t = document.getElementById("how-step1-title");
  if (h1t) h1t.textContent = t("how_it_works.step1_title");
  const h1d = document.getElementById("how-step1-desc");
  if (h1d) h1d.textContent = t("how_it_works.step1_desc");
  const h2t = document.getElementById("how-step2-title");
  if (h2t) h2t.textContent = t("how_it_works.step2_title");
  const h2d = document.getElementById("how-step2-desc");
  if (h2d) h2d.textContent = t("how_it_works.step2_desc");
  const h3t = document.getElementById("how-step3-title");
  if (h3t) h3t.textContent = t("how_it_works.step3_title");
  const h3d = document.getElementById("how-step3-desc");
  if (h3d) h3d.textContent = t("how_it_works.step3_desc");

  // 3D Viewer Labels
  if (elements.viewer3DTitle) elements.viewer3DTitle.textContent = t("viewer3d.title");
  const lbl3dL = document.getElementById("lbl-3d-loading");
  if (lbl3dL) lbl3dL.textContent = t("viewer3d.loading");
  const lbl3dF = document.getElementById("lbl-3d-format");
  if (lbl3dF) lbl3dF.textContent = t("viewer3d.format");
  const lbl3dR = document.getElementById("lbl-3d-render");
  if (lbl3dR) lbl3dR.textContent = t("viewer3d.render");
  if (elements.btn3DToAR) elements.btn3DToAR.textContent = t("viewer3d.to_ar");
  if (elements.btn3DReturn) elements.btn3DReturn.textContent = t("viewer3d.return");

  // AR Modal Labels
  const arTitle = document.getElementById("ar-modal-title");
  if (arTitle) arTitle.textContent = t("ar.title");
  const lblM2d = document.getElementById("lbl-mode-2d");
  if (lblM2d) lblM2d.textContent = t("ar.mode_2d");
  const lblMxr = document.getElementById("lbl-mode-webxr");
  if (lblMxr) lblMxr.textContent = t("ar.mode_ar");
  const arProfLbl = document.getElementById("ar-profile-label");
  if (arProfLbl) arProfLbl.textContent = t("ar.profile_select");
  const arRecT = document.getElementById("ar-rec-title");
  if (arRecT) arRecT.textContent = t("ar.rec_size_title");

  renderCategories();
  renderCatalog();
  renderCart();
  renderARProfiles();
  if (state.selectedProductForAR) {
    updateARRecommendation();
  }
}

// --- Data Fetching ---
async function loadMetrics() {
  try {
    const res = await fetch("/api/metrics");
    if (res.ok) {
      const data = await res.json();
      if (elements.metricProducts) elements.metricProducts.textContent = String(data.totalProductsIndexed);
      if (elements.metricFittings) elements.metricFittings.textContent = String(data.virtualFittingSessions);
      if (elements.metricRecommendations) elements.metricRecommendations.textContent = String(data.recommendationsServed);
      if (elements.metricOrders) elements.metricOrders.textContent = String(data.demoOrdersConfirmed);
    }
  } catch {
    // Keep defaults
  }
}

async function loadCatalog() {
  try {
    const res = await fetch("/api/products");
    if (res.ok) {
      state.products = await res.json();
    } else {
      throw new Error("Local API endpoint not found");
    }
  } catch {
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
      arBadge.textContent = t("product.ar_badge");
      imgContainer.appendChild(arBadge);
    }

    const body = document.createElement("div");
    body.className = "product-body";

    const brand = document.createElement("span");
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

    const row1 = document.createElement("div");
    row1.className = "product-action-row";

    const viewBtn = document.createElement("button");
    viewBtn.className = "btn btn-secondary";
    viewBtn.style.flex = "1";
    viewBtn.textContent = t("product.view_details");
    viewBtn.addEventListener("click", () => openProductDetailModal(product));
    row1.appendChild(viewBtn);

    if (product.has3D !== false) {
      const btn3d = document.createElement("button");
      btn3d.className = "btn btn-secondary";
      btn3d.textContent = "🧊 3D";
      btn3d.title = t("product.view_3d");
      btn3d.addEventListener("click", () => open3DViewer(product));
      row1.appendChild(btn3d);
    }

    if (product.arAvailable) {
      const arBtn = document.createElement("button");
      arBtn.className = "btn btn-secondary";
      arBtn.textContent = "👓 AR";
      arBtn.title = t("product.try_on");
      arBtn.addEventListener("click", () => openARModal(product));
      row1.appendChild(arBtn);
    }

    const addBtn = document.createElement("button");
    addBtn.className = "btn btn-primary";
    addBtn.style.width = "100%";
    addBtn.textContent = "🛒 " + t("product.add_to_cart");
    addBtn.addEventListener("click", () => {
      addToCart(product, product.variants[0]);
      openDrawer(elements.cartDrawer);
    });

    actions.appendChild(row1);
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

  if (product.has3D !== false) {
    const view3dBtn = document.createElement("button");
    view3dBtn.className = "btn btn-secondary";
    view3dBtn.textContent = "🧊 " + t("product.view_3d");
    view3dBtn.addEventListener("click", () => {
      closeModal(elements.productModal);
      open3DViewer(product);
    });
    actionRow.appendChild(view3dBtn);
  }

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

// --- 3D Interactive GLTF / Native WebGL Mesh Viewer ---
function open3DViewer(product) {
  state.selectedProductFor3D = product;
  state.viewer3D.meshType = product.category;
  elements.viewer3DProductName.textContent = `${product.name} (${product.brand})`;

  openModal(elements.viewer3DModal);

  // Show loading indicator briefly to simulate streaming GLTF lazy load
  elements.viewer3DLoading.classList.add("active");
  setTimeout(() => {
    elements.viewer3DLoading.classList.remove("active");
    render3DMesh();
  }, 250);
}

function close3DViewer() {
  state.viewer3D.autoSpin = false;
  if (state.viewer3D.animFrameId) {
    cancelAnimationFrame(state.viewer3D.animFrameId);
    state.viewer3D.animFrameId = null;
  }
  closeModal(elements.viewer3DModal);
}

function init3DCanvasEvents() {
  const canvas = elements.canvas3D;
  if (!canvas) return;

  canvas.addEventListener("mousedown", (e) => {
    state.viewer3D.isDragging = true;
    state.viewer3D.lastMouseX = e.clientX;
    state.viewer3D.lastMouseY = e.clientY;
  });

  window.addEventListener("mouseup", () => {
    state.viewer3D.isDragging = false;
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!state.viewer3D.isDragging) return;
    const deltaX = e.clientX - state.viewer3D.lastMouseX;
    const deltaY = e.clientY - state.viewer3D.lastMouseY;
    state.viewer3D.rotY += deltaX * 0.7;
    state.viewer3D.rotX = Math.max(-60, Math.min(60, state.viewer3D.rotX + deltaY * 0.7));
    state.viewer3D.lastMouseX = e.clientX;
    state.viewer3D.lastMouseY = e.clientY;
    render3DMesh();
  });

  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    state.viewer3D.zoom = Math.max(0.5, Math.min(2.5, state.viewer3D.zoom - e.deltaY * 0.0015));
    render3DMesh();
  }, { passive: false });

  // Touch controls for mobile devices
  let touchStartX = 0;
  let touchStartY = 0;
  canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  });

  canvas.addEventListener("touchmove", (e) => {
    if (e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - touchStartX;
      const deltaY = e.touches[0].clientY - touchStartY;
      state.viewer3D.rotY += deltaX * 0.8;
      state.viewer3D.rotX = Math.max(-60, Math.min(60, state.viewer3D.rotX + deltaY * 0.8));
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      render3DMesh();
    }
  });
}

function animate3DLoop() {
  if (!state.viewer3D.autoSpin) return;
  state.viewer3D.rotY = (state.viewer3D.rotY + 0.8) % 360;
  render3DMesh();
  state.viewer3D.animFrameId = requestAnimationFrame(animate3DLoop);
}

// Native 3D Mathematical Projection & Wireframe Shader Renderer
function render3DMesh() {
  const canvas = elements.canvas3D;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Background gradient
  const grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w / 1.5);
  grad.addColorStop(0, "#312e81");
  grad.addColorStop(1, "#090d16");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Generate 3D geometry vertices and faces based on product category
  const geom = get3DGeometryForCategory(state.viewer3D.meshType);
  const radX = (state.viewer3D.rotX * Math.PI) / 180;
  const radY = (state.viewer3D.rotY * Math.PI) / 180;
  const zoom = state.viewer3D.zoom;

  // Project 3D vertices -> 2D Screen space
  const projected = geom.vertices.map((v) => {
    // Rotate Y
    const x1 = v[0] * Math.cos(radY) + v[2] * Math.sin(radY);
    const y1 = v[1];
    const z1 = -v[0] * Math.sin(radY) + v[2] * Math.cos(radY);

    // Rotate X
    const x2 = x1;
    const y2 = y1 * Math.cos(radX) - z1 * Math.sin(radX);
    const z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);

    // Perspective projection
    const distance = 400;
    const scale = (distance / (distance + z2)) * zoom;
    const sx = w / 2 + x2 * scale;
    const sy = h / 2 + y2 * scale;

    return { sx, sy, z: z2 };
  });

  // Draw 3D Grid Floor
  ctx.strokeStyle = "rgba(99, 102, 241, 0.15)";
  ctx.lineWidth = 1;
  for (let i = -120; i <= 120; i += 30) {
    ctx.beginPath();
    const p1 = projectPoint(i, 80, -120, radX, radY, zoom, w, h);
    const p2 = projectPoint(i, 80, 120, radX, radY, zoom, w, h);
    ctx.moveTo(p1.sx, p1.sy);
    ctx.lineTo(p2.sx, p2.sy);
    ctx.stroke();
  }

  // Draw 3D Faces sorted by depth (Z-buffer approximation)
  const facesWithDepth = geom.faces.map((f) => {
    const avgZ = (projected[f[0]].z + projected[f[1]].z + projected[f[2]].z) / 3;
    return { face: f, avgZ };
  });
  facesWithDepth.sort((a, b) => b.avgZ - a.avgZ);

  for (const { face } of facesWithDepth) {
    const p0 = projected[face[0]];
    const p1 = projected[face[1]];
    const p2 = projected[face[2]];

    ctx.beginPath();
    ctx.moveTo(p0.sx, p0.sy);
    ctx.lineTo(p1.sx, p1.sy);
    ctx.lineTo(p2.sx, p2.sy);
    ctx.closePath();

    // Shading based on normal and depth
    ctx.fillStyle = "rgba(79, 70, 229, 0.4)";
    ctx.fill();
    ctx.strokeStyle = "#818cf8";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function projectPoint(x, y, z, radX, radY, zoom, w, h) {
  const x1 = x * Math.cos(radY) + z * Math.sin(radY);
  const y1 = y;
  const z1 = -x * Math.sin(radY) + z * Math.cos(radY);

  const x2 = x1;
  const y2 = y1 * Math.cos(radX) - z1 * Math.sin(radX);
  const z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);

  const distance = 400;
  const scale = (distance / (distance + z2)) * zoom;
  return { sx: w / 2 + x2 * scale, sy: h / 2 + y2 * scale };
}

function get3DGeometryForCategory(category) {
  if (category === "calzado") {
    // 3D Sneaker geometry (10 vertices, 12 triangular faces)
    return {
      vertices: [
        [-50, 40, -20], [50, 40, -20], [60, 20, 0], [40, -20, 0],
        [-40, -30, 0], [-60, 0, 0], [-50, 40, 20], [50, 40, 20],
        [60, 20, 20], [40, -20, 20],
      ],
      faces: [
        [0, 1, 2], [0, 2, 5], [5, 2, 3], [5, 3, 4],
        [6, 7, 8], [6, 8, 5], [5, 8, 9], [0, 6, 7],
        [0, 7, 1], [1, 7, 8], [1, 8, 2], [2, 8, 9],
      ],
    };
  }

  if (category === "vestidos" || category === "faldas") {
    // 3D Dress A-Line geometry
    return {
      vertices: [
        [-20, -60, -10], [20, -60, -10], [20, -60, 10], [-20, -60, 10],
        [-15, -10, -15], [15, -10, -15], [15, -10, 15], [-15, -10, 15],
        [-55, 60, -30], [55, 60, -30], [55, 60, 30], [-55, 60, 30],
      ],
      faces: [
        [0, 1, 5], [0, 5, 4], [1, 2, 6], [1, 6, 5],
        [2, 3, 7], [2, 7, 6], [3, 0, 4], [3, 4, 7],
        [4, 5, 9], [4, 9, 8], [5, 6, 10], [5, 10, 9],
        [6, 7, 11], [6, 11, 10], [7, 4, 8], [7, 8, 11],
      ],
    };
  }

  // Default Apparel: Tops, T-shirts, Jackets, Hoodies
  return {
    vertices: [
      [-30, -50, -15], [30, -50, -15], [30, -50, 15], [-30, -50, 15],
      [-55, -20, -15], [55, -20, -15], [55, -20, 15], [-55, -20, 15],
      [-35, 50, -20], [35, 50, -20], [35, 50, 20], [-35, 50, 20],
    ],
    faces: [
      [0, 1, 5], [0, 5, 4], [1, 2, 6], [1, 6, 5],
      [2, 3, 7], [2, 7, 6], [3, 0, 4], [3, 4, 7],
      [4, 5, 9], [4, 9, 8], [5, 6, 10], [5, 10, 9],
      [6, 7, 11], [6, 11, 10], [7, 4, 8], [7, 8, 11],
    ],
  };
}

// --- AR Virtual Try-On & Profiles ---
function renderARProfiles() {
  const profiles = [
    { id: "Nova", name: "Nova", desc: "Atlético Femenino", height: "1.68m", icon: "👗" },
    { id: "Sora", name: "Sora", desc: "Unisex Slim", height: "1.75m", icon: "🧥" },
    { id: "Mateo", name: "Mateo", desc: "Deportivo Masculino", height: "1.82m", icon: "👕" },
  ];

  while (elements.arProfileCardsContainer.firstChild) {
    elements.arProfileCardsContainer.removeChild(elements.arProfileCardsContainer.firstChild);
  }

  for (const p of profiles) {
    const card = document.createElement("button");
    card.className = `profile-card-btn ${state.selectedARProfile === p.id ? "active" : ""}`;

    const icon = document.createElement("div");
    icon.style.fontSize = "1.25rem";
    icon.textContent = p.icon;

    const name = document.createElement("div");
    name.style.fontWeight = "700";
    name.style.fontSize = "0.8125rem";
    name.textContent = p.name;

    const sub = document.createElement("div");
    sub.style.fontSize = "0.6875rem";
    sub.style.color = "var(--text-secondary)";
    sub.textContent = `${p.desc} (${p.height})`;

    card.appendChild(icon);
    card.appendChild(name);
    card.appendChild(sub);

    card.addEventListener("click", () => {
      state.selectedARProfile = p.id;
      for (const c of elements.arProfileCardsContainer.children) {
        c.className = "profile-card-btn";
      }
      card.className = "profile-card-btn active";
      updateARRecommendation();
    });

    elements.arProfileCardsContainer.appendChild(card);
  }
}

function openARModal(product) {
  state.selectedProductForAR = product;
  elements.arModalProductName.textContent = `${product.name} (${product.brand})`;
  elements.arUrnDisplay.textContent = product.defaultArUrn || "urn:tentaciones:ar:apparel";
  elements.arAvatarIcon.textContent = getProductCategoryIcon(product.category);
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
    rationale = `Calce deportivo optimizado para silueta demo ${profile} con 8mm de holgura en puntera.`;
  } else if (product.category === "pantalones") {
    recommended = profile === "Mateo" ? "34" : profile === "Nova" ? "30" : "32";
    rationale = `Contorno de cintura proporcional para ajuste standard en perfil demo ${profile}.`;
  } else {
    recommended = profile === "Mateo" ? "L" : profile === "Nova" ? "S" : "M";
    rationale = `Holgura de torso y hombros calibrada para silueta ${profile} (ajuste óptimo 96%).`;
  }

  elements.arRecommendedSize.textContent = recommended;
  elements.arRationaleText.textContent = rationale;
}

function checkWebXRSupport() {
  if (navigator.xr) {
    navigator.xr.isSessionSupported("immersive-ar").then((supported) => {
      state.webxrSupported = supported;
      elements.arWebxrInfo.textContent = supported ? t("ar.webxr_supported") : t("ar.webxr_unsupported");
    }).catch(() => {
      state.webxrSupported = false;
      elements.arWebxrInfo.textContent = t("ar.webxr_unsupported");
    });
  } else {
    state.webxrSupported = false;
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

  elements.searchFeedbackBox.style.display = "block";
  elements.searchFeedbackIntent.textContent = `${t("search.intent_title")} "${query}"`;
  elements.searchFeedbackRationale.textContent = t("search.intent_rationale");

  addAIMessage("user", query);
  const results = state.products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.tags.some((t) => t.includes(query.toLowerCase())));
  const responseText = results.length > 0
    ? `Encontré ${results.length} producto(s) afines a tu búsqueda: "${query}". ${t("search.intent_rationale")}`
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
  } else if (normalized.includes("3d") || normalized.includes("tres d")) {
    reply = "Haz clic en el botón '3D' de cualquier prenda para explorar su modelo tridimensional interactivo con controles de rotación y zoom.";
  } else if (normalized.includes("ar") || normalized.includes("probar")) {
    reply = "Haz clic en el botón 'AR' o 'Probar en AR' de cualquier prenda para ingresar al Probador Virtual.";
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
  if (state.cart.items.length === 0) {
    alert(t("cart.empty"));
    return;
  }
  const shippingFee = state.cart.qualifiesForFreeShipping ? 0 : 3990;
  const total = state.cart.subtotal + shippingFee;
  elements.checkoutTotalVal.textContent = formatMoney(total, "CLP");
  openModal(elements.checkoutModal);
}

async function processDemoCheckout() {
  const name = document.getElementById("checkout-cust-name").value;
  const email = document.getElementById("checkout-cust-email").value;
  const street = document.getElementById("checkout-cust-street").value;
  const city = document.getElementById("checkout-cust-city").value;

  const orderId = `tentaciones-demo-${Math.random().toString(36).substring(2, 9)}`;

  elements.checkoutForm.style.display = "none";
  elements.checkoutSuccessOrderId.textContent = `${t("checkout.order_id")} ${orderId}`;
  elements.checkoutSuccessBox.style.display = "block";

  // Clear cart
  state.cart.items = [];
  state.cart.subtotal = 0;
  state.cart.missingForFreeShipping = state.cart.freeShippingThreshold;
  state.cart.qualifiesForFreeShipping = false;
  renderCart();
  await loadMetrics();
}

// --- Helpers ---
function openModal(modalEl) {
  modalEl.classList.add("open");
}

function closeModal(modalEl) {
  modalEl.classList.remove("open");
}

function openDrawer(drawerEl) {
  drawerEl.classList.add("open");
}

function closeDrawer(drawerEl) {
  drawerEl.classList.remove("open");
}

function getProductCategoryIcon(category) {
  switch (category) {
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
      has3D: true,
      model3DUrl: "/assets/3d/apparel/polera-essential.glb",
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
      has3D: true,
      model3DUrl: "/assets/3d/footwear/pro-carbon-racer.glb",
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
      has3D: true,
      model3DUrl: "/assets/3d/apparel/silk-evening-dress.glb",
      defaultArUrn: "urn:tentaciones:ar:apparel:silk-evening-dress",
      variants: [
        { sku: "SED-NOIR-M", color: "Noir Velvet", size: "M", priceCLP: 139990, stock: 12 },
      ],
    },
  ];
}

document.addEventListener("DOMContentLoaded", initApp);
