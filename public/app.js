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
    currentLoadedAsset: null,
    currentGeometry: null,
  },
  // WebXR AR Spatial Session & Hit-Test State
  arSpatial: {
    status: "AR_IDLE", // "AR_IDLE" | "AR_SCANNING_SURFACE" | "AR_SURFACE_DETECTED" | "AR_PLACED" | "AR_ERROR"
    session: null,
    refSpace: null,
    hitTestSource: null,
    animFrameId: null,
    surfaceHit: false,
    placedObject: false,
    transform: { x: 0, y: -0.2, z: -1.0, rotationY: 0, scale: 1.0 },
    loadedGeometry: null,
    isScanningSim: null,
  },
  // Walkthrough Stepper State
  walkthrough: {
    currentStep: 1,
    totalSteps: 5,
  },
  // AI Virtual Try-On (VTO) State
  vto: {
    selectedProduct: null,
    consentGranted: false,
    selectedAvatar: "Nova",
    uploadedPhotoBase64: null,
    uploadedPhotoMime: null,
    uploadedPhotoBlobUrl: null,
    inputMode: "SYNTHETIC_AVATAR", // "SYNTHETIC_AVATAR" | "USER_PHOTO"
    activeJobId: null,
    statusPollTimer: null,
    currentResult: null,
    uiState: "IDLE", // "IDLE" | "VALIDATING_INPUT" | "QUALITY_REJECTED" | "QUALITY_WARNING" | "READY" | "CONSENT_REQUIRED" | "EXECUTING" | "POLLING" | "SUCCESS" | "FAILED" | "CANCELLED"
    qualityAssessment: null,
    isSubmitting: false,
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
  lbl3DFormat: document.getElementById("lbl-3d-format"),
  lbl3DRender: document.getElementById("lbl-3d-render"),
  // AR elements
  arModal: document.getElementById("ar-modal"),
  arModalCloseBtn: document.getElementById("btn-ar-modal-close"),
  arModalProductName: document.getElementById("ar-modal-product-name"),
  arAvatarIcon: document.getElementById("ar-avatar-icon"),
  arViewModeLabel: document.getElementById("ar-view-mode-label"),
  arModePill: document.getElementById("ar-mode-pill"),
  arUrnDisplay: document.getElementById("ar-urn-display"),
  ar2DView: document.getElementById("ar-2d-view"),
  arSpatialViewport: document.getElementById("ar-spatial-viewport"),
  arSpatialCanvas: document.getElementById("ar-spatial-canvas"),
  arHitReticle: document.getElementById("ar-hit-reticle"),
  arHudStatus: document.getElementById("ar-hud-status"),
  arHudText: document.getElementById("ar-hud-text"),
  arSpatialControls: document.getElementById("ar-spatial-controls"),
  arPlacementActionContainer: document.getElementById("ar-placement-action-container"),
  btnArPlaceObject: document.getElementById("btn-ar-place-object"),
  btnArScaleDown: document.getElementById("btn-ar-scale-down"),
  btnArScaleUp: document.getElementById("btn-ar-scale-up"),
  btnArRotLeft: document.getElementById("btn-ar-rot-left"),
  btnArRotRight: document.getElementById("btn-ar-rot-right"),
  btnArRemoveObject: document.getElementById("btn-ar-remove-object"),
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
  // Walkthrough & Honesty Elements
  walkthroughCardContainer: document.getElementById("walkthrough-card-container"),
  walkthroughDotsContainer: document.getElementById("walkthrough-dots-container"),
  btnWalkthroughPrev: document.getElementById("btn-walkthrough-prev"),
  btnWalkthroughNext: document.getElementById("btn-walkthrough-next"),
  btnWalkthroughTry: document.getElementById("btn-walkthrough-try"),
  honestyTableContainer: document.getElementById("honesty-table-container"),
  // VTO Elements
  vtoModal: document.getElementById("vto-modal"),
  vtoModalTitle: document.getElementById("vto-modal-title"),
  vtoModalCloseBtn: document.getElementById("btn-vto-modal-close"),
  vtoModalProductName: document.getElementById("vto-modal-product-name"),
  vtoConsentBox: document.getElementById("vto-consent-box"),
  btnVtoConsentAccept: document.getElementById("btn-vto-consent-accept"),
  btnVtoConsentCancel: document.getElementById("btn-vto-consent-cancel"),
  vtoPhotoBox: document.getElementById("vto-photo-box"),
  vtoAvatarContainer: document.getElementById("vto-avatar-container"),
  vtoDropzone: document.getElementById("vto-dropzone"),
  vtoFileInput: document.getElementById("vto-file-input"),
  vtoDropzoneContent: document.getElementById("vto-dropzone-content"),
  vtoUploadPreview: document.getElementById("vto-upload-preview"),
  vtoUploadPreviewImg: document.getElementById("vto-upload-preview-img"),
  btnVtoRemovePhoto: document.getElementById("btn-vto-remove-photo"),
  btnVtoGenerate: document.getElementById("btn-vto-generate"),
  vtoProcessingBox: document.getElementById("vto-processing-box"),
  vtoProcessingStatus: document.getElementById("vto-processing-status"),
  vtoProgressFill: document.getElementById("vto-progress-fill"),
  vtoResultBox: document.getElementById("vto-result-box"),
  vtoResultImg: document.getElementById("vto-result-img"),
  vtoResultSize: document.getElementById("vto-result-size"),
  vtoResultDisclaimer: document.getElementById("vto-result-disclaimer"),
  btnVtoAddToCart: document.getElementById("btn-vto-add-to-cart"),
  btnVtoTryAnother: document.getElementById("btn-vto-try-another"),
  vtoQualityFeedbackBox: document.getElementById("vto-quality-feedback-box"),
  vtoQualityIcon: document.getElementById("vto-quality-icon"),
  vtoQualityTitle: document.getElementById("vto-quality-title"),
  vtoQualityBadge: document.getElementById("vto-quality-badge"),
  vtoQualityText: document.getElementById("vto-quality-text"),
  vtoQualityDetails: document.getElementById("vto-quality-details"),
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
  renderWalkthrough();
  renderHonestyMatrix();
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

  // Walkthrough Controls
  if (elements.btnWalkthroughPrev) {
    elements.btnWalkthroughPrev.addEventListener("click", () => {
      state.walkthrough.currentStep = state.walkthrough.currentStep > 1 ? state.walkthrough.currentStep - 1 : state.walkthrough.totalSteps;
      renderWalkthrough();
    });
  }

  if (elements.btnWalkthroughNext) {
    elements.btnWalkthroughNext.addEventListener("click", () => {
      state.walkthrough.currentStep = state.walkthrough.currentStep < state.walkthrough.totalSteps ? state.walkthrough.currentStep + 1 : 1;
      renderWalkthrough();
    });
  }

  if (elements.btnWalkthroughTry) {
    elements.btnWalkthroughTry.addEventListener("click", () => {
      const targetProd = state.products.find((p) => p.arAvailable) || state.products[0];
      if (targetProd) {
        openARModal(targetProd);
      }
    });
  }

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
  elements.arModalCloseBtn.addEventListener("click", () => closeARModal());
  elements.btnArCloseReturn.addEventListener("click", () => closeARModal());
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

  // AR Modes & Spatial Controls
  elements.btnMode2D.addEventListener("click", () => switchARViewMode("2D"));
  elements.btnModeWebXR.addEventListener("click", () => switchARViewMode("WEBXR"));

  elements.btnArPlaceObject.addEventListener("click", () => handleARPlaceObject());
  elements.btnArRemoveObject.addEventListener("click", () => handleARRemoveObject());

  elements.btnArScaleDown.addEventListener("click", () => {
    state.arSpatial.transform.scale = Math.max(0.3, state.arSpatial.transform.scale - 0.15);
  });
  elements.btnArScaleUp.addEventListener("click", () => {
    state.arSpatial.transform.scale = Math.min(2.5, state.arSpatial.transform.scale + 0.15);
  });
  elements.btnArRotLeft.addEventListener("click", () => {
    state.arSpatial.transform.rotationY -= 45;
  });
  elements.btnArRotRight.addEventListener("click", () => {
    state.arSpatial.transform.rotationY += 45;
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

  // VTO Event Listeners
  if (elements.vtoModalCloseBtn) {
    elements.vtoModalCloseBtn.addEventListener("click", () => closeVTOModal());
  }
  if (elements.btnVtoConsentAccept) {
    elements.btnVtoConsentAccept.addEventListener("click", () => {
      state.vto.consentGranted = true;
      setVTOUIState("IDLE");
      renderVTOAvatars();
      renderSyntheticQualityFeedback();
    });
  }
  if (elements.btnVtoConsentCancel) {
    elements.btnVtoConsentCancel.addEventListener("click", () => closeVTOModal());
  }
  if (elements.vtoDropzone && elements.vtoFileInput) {
    elements.vtoDropzone.addEventListener("click", () => elements.vtoFileInput.click());
    elements.vtoFileInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleVTOPhotoUpload(file);
    });
    elements.vtoDropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      elements.vtoDropzone.style.borderColor = "var(--primary-color)";
    });
    elements.vtoDropzone.addEventListener("dragleave", () => {
      elements.vtoDropzone.style.borderColor = "var(--border-color)";
    });
    elements.vtoDropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      elements.vtoDropzone.style.borderColor = "var(--border-color)";
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) handleVTOPhotoUpload(file);
    });
  }
  if (elements.btnVtoRemovePhoto) {
    elements.btnVtoRemovePhoto.addEventListener("click", () => removeVTOPhoto());
  }
  if (elements.btnVtoGenerate) {
    elements.btnVtoGenerate.addEventListener("click", () => handleVTOGenerate());
  }
  if (elements.btnVtoTryAnother) {
    elements.btnVtoTryAnother.addEventListener("click", () => {
      setVTOUIState("IDLE");
      if (state.vto.inputMode === "USER_PHOTO" && state.vto.qualityAssessment) {
        renderQualityAssessmentFeedback(state.vto.qualityAssessment);
      } else {
        renderSyntheticQualityFeedback();
      }
    });
  }
  if (elements.btnVtoAddToCart) {
    elements.btnVtoAddToCart.addEventListener("click", () => {
      const product = state.vto.selectedProduct;
      if (product) {
        const recSize = state.vto.currentResult && state.vto.currentResult.recommendedSize;
        const matchedVariant = (recSize && product.variants.find((v) => String(v.size) === String(recSize))) || product.variants[0];
        addToCart(product, matchedVariant);
        closeVTOModal();
        openDrawer(elements.cartDrawer);
      }
    });
  }
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

  // Walkthrough & Honesty Labels
  const wtBadge = document.getElementById("walkthrough-badge");
  if (wtBadge) wtBadge.textContent = t("walkthrough.badge");
  const wtTitle = document.getElementById("walkthrough-main-title");
  if (wtTitle) wtTitle.textContent = t("walkthrough.title");
  const wtSub = document.getElementById("walkthrough-main-subtitle");
  if (wtSub) wtSub.textContent = t("walkthrough.subtitle");
  const navWt = document.getElementById("nav-walkthrough-label");
  if (navWt) navWt.textContent = t("nav.walkthrough");
  if (elements.btnWalkthroughPrev) elements.btnWalkthroughPrev.textContent = t("walkthrough.prev");
  if (elements.btnWalkthroughNext) elements.btnWalkthroughNext.textContent = t("walkthrough.next");
  if (elements.btnWalkthroughTry) elements.btnWalkthroughTry.textContent = t("walkthrough.try_live");

  const hTitle = document.getElementById("honesty-title-label");
  if (hTitle) hTitle.textContent = t("honesty.title");
  const hSub = document.getElementById("honesty-subtitle-label");
  if (hSub) hSub.textContent = t("honesty.subtitle");

  // VTO Modal Labels
  if (elements.vtoModalTitle) elements.vtoModalTitle.textContent = t("tryon.title");
  const vtoConsentH = document.getElementById("vto-consent-heading");
  if (vtoConsentH) vtoConsentH.textContent = t("tryon.consent_title");
  const vtoConsentP = document.getElementById("vto-consent-paragraph");
  if (vtoConsentP) vtoConsentP.textContent = t("tryon.consent_text");
  if (elements.btnVtoConsentAccept) elements.btnVtoConsentAccept.textContent = t("tryon.consent_accept");
  if (elements.btnVtoConsentCancel) elements.btnVtoConsentCancel.textContent = t("tryon.consent_decline");
  const vtoSelectAvLabel = document.getElementById("vto-select-avatar-label");
  if (vtoSelectAvLabel) vtoSelectAvLabel.textContent = t("tryon.select_avatar");
  const vtoUploadLabel = document.getElementById("vto-upload-label");
  if (vtoUploadLabel) vtoUploadLabel.textContent = t("tryon.upload_own_photo");
  const vtoDropText = document.getElementById("vto-drop-text");
  if (vtoDropText) vtoDropText.textContent = t("tryon.dropzone_text");
  const vtoDropSub = document.getElementById("vto-drop-sub");
  if (vtoDropSub) vtoDropSub.textContent = t("tryon.dropzone_sub");
  if (elements.btnVtoRemovePhoto) elements.btnVtoRemovePhoto.textContent = t("tryon.remove_photo");
  if (elements.btnVtoGenerate) elements.btnVtoGenerate.textContent = t("tryon.generate_btn");
  const vtoResHead = document.getElementById("vto-result-heading");
  if (vtoResHead) vtoResHead.textContent = t("tryon.result_heading");
  if (elements.vtoResultDisclaimer) elements.vtoResultDisclaimer.textContent = t("tryon.disclaimer");
  if (elements.btnVtoAddToCart) elements.btnVtoAddToCart.textContent = t("tryon.add_to_cart");
  if (elements.btnVtoTryAnother) elements.btnVtoTryAnother.textContent = t("tryon.try_another");

  renderCategories();
  renderCatalog();
  renderCart();
  renderARProfiles();
  renderWalkthrough();
  renderHonestyMatrix();
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

    if (isProductVTOCompatible(product)) {
      const vtoBtn = document.createElement("button");
      vtoBtn.className = "btn btn-secondary";
      vtoBtn.textContent = "✨ IA";
      vtoBtn.title = t("product.try_on_ai");
      vtoBtn.addEventListener("click", () => openVTOModal(product));
      row1.appendChild(vtoBtn);
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
  actionRow.style.flexWrap = "wrap";
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

  if (isProductVTOCompatible(product)) {
    const vtoBtn = document.createElement("button");
    vtoBtn.className = "btn btn-secondary";
    vtoBtn.textContent = "✨ " + t("product.try_on_ai");
    vtoBtn.addEventListener("click", () => {
      closeModal(elements.productModal);
      openVTOModal(product);
    });
    actionRow.appendChild(vtoBtn);
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

// --- 3D Interactive GLTF / GLB / Native WebGL Mesh Viewer ---
async function open3DViewer(product) {
  state.selectedProductFor3D = product;
  state.viewer3D.meshType = product.category;
  elements.viewer3DProductName.textContent = `${product.name} (${product.brand})`;

  openModal(elements.viewer3DModal);

  // Show loading indicator
  elements.viewer3DLoading.classList.add("active");
  elements.lbl3DFormat.textContent = t("viewer3d.loading_model");

  try {
    const assetUrl = product.model3DUrl;
    if (assetUrl && (assetUrl.endsWith(".glb") || assetUrl.endsWith(".gltf"))) {
      const parsedGeometry = await loadReal3DAsset(assetUrl, product.model3DFormat || "gltf");
      state.viewer3D.currentGeometry = parsedGeometry;
      state.viewer3D.currentLoadedAsset = assetUrl;
      elements.lbl3DFormat.textContent = `${(product.model3DFormat || "GLB/GLTF").toUpperCase()} Binary/JSON Mesh (${parsedGeometry.vertices.length} vertices, ${parsedGeometry.faces.length} faces)`;
      elements.lbl3DRender.textContent = "Hardware Canvas Projection (Verified Real Spatial Asset)";
    } else {
      // Use procedural geometry
      state.viewer3D.currentGeometry = get3DGeometryForCategory(product.category);
      state.viewer3D.currentLoadedAsset = "procedural";
      elements.lbl3DFormat.textContent = "Procedural Synthetic Mesh (Local Fallback)";
      elements.lbl3DRender.textContent = "Mathematical Geometry Projection";
    }
  } catch (err) {
    // Fail-safe graceful fallback to procedural
    state.viewer3D.currentGeometry = get3DGeometryForCategory(product.category);
    state.viewer3D.currentLoadedAsset = "procedural_fallback";
    elements.lbl3DFormat.textContent = "Procedural Synthetic Mesh (Asset Stream Fallback)";
    elements.lbl3DRender.textContent = "Mathematical Geometry Projection (Safe Fallback)";
  } finally {
    elements.viewer3DLoading.classList.remove("active");
    render3DMesh();
  }
}

async function loadReal3DAsset(url, format) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch 3D asset: " + response.status);
  }

  if (url.endsWith(".glb") || format === "glb") {
    const arrayBuffer = await response.arrayBuffer();
    return parseGLBBuffer(arrayBuffer);
  } else {
    const gltfJson = await response.json();
    return parseGLTFJson(gltfJson);
  }
}

function parseGLTFJson(gltf) {
  if (!gltf.meshes || gltf.meshes.length === 0) {
    throw new Error("GLTF contains no meshes");
  }
  const mesh = gltf.meshes[0];
  const primitive = mesh.primitives[0];
  const posAccessorIdx = primitive.attributes.POSITION;
  const indAccessorIdx = primitive.indices;

  const posAccessor = gltf.accessors[posAccessorIdx];
  const indAccessor = gltf.accessors[indAccessorIdx];

  const posBufferView = gltf.bufferViews[posAccessor.bufferView];
  const indBufferView = gltf.bufferViews[indAccessor.bufferView];

  const buffer = gltf.buffers[0];
  let rawBuffer;
  if (buffer.uri.startsWith("data:")) {
    const base64 = buffer.uri.split(",")[1];
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    rawBuffer = bytes.buffer;
  } else {
    throw new Error("External GLTF URI buffers require relative resolution");
  }

  // Extract indices
  const indOffset = (indBufferView.byteOffset || 0) + (indAccessor.byteOffset || 0);
  const indices = new Uint16Array(rawBuffer, indOffset, indAccessor.count);

  // Extract vertices
  const posOffset = (posBufferView.byteOffset || 0) + (posAccessor.byteOffset || 0);
  const positions = new Float32Array(rawBuffer, posOffset, posAccessor.count * 3);

  const vertices = [];
  for (let i = 0; i < positions.length; i += 3) {
    vertices.push([positions[i], positions[i + 1], positions[i + 2]]);
  }

  const faces = [];
  for (let i = 0; i < indices.length; i += 3) {
    faces.push([indices[i], indices[i + 1], indices[i + 2]]);
  }

  return { vertices, faces };
}

function parseGLBBuffer(arrayBuffer) {
  const dataView = new DataView(arrayBuffer);
  const magic = dataView.getUint32(0, true);
  if (magic !== 0x46546c67) {
    throw new Error("Invalid GLB Magic Header");
  }
  const version = dataView.getUint32(4, true);
  const totalLength = dataView.getUint32(8, true);

  // Chunk 0 (JSON)
  const jsonChunkLength = dataView.getUint32(12, true);
  const jsonChunkType = dataView.getUint32(16, true);
  const jsonBytes = new Uint8Array(arrayBuffer, 20, jsonChunkLength);
  const jsonStr = new TextDecoder("utf-8").decode(jsonBytes);
  const gltf = JSON.parse(jsonStr.trim());

  // Chunk 1 (BIN)
  const binChunkOffset = 20 + jsonChunkLength;
  const binChunkLength = dataView.getUint32(binChunkOffset, true);
  const binDataOffset = binChunkOffset + 8;

  const mesh = gltf.meshes[0];
  const primitive = mesh.primitives[0];
  const posAccessorIdx = primitive.attributes.POSITION;
  const indAccessorIdx = primitive.indices;

  const posAccessor = gltf.accessors[posAccessorIdx];
  const indAccessor = gltf.accessors[indAccessorIdx];

  const posBufferView = gltf.bufferViews[posAccessor.bufferView];
  const indBufferView = gltf.bufferViews[indAccessor.bufferView];

  // Extract indices
  const indByteOffset = binDataOffset + (indBufferView.byteOffset || 0) + (indAccessor.byteOffset || 0);
  const indices = new Uint16Array(arrayBuffer, indByteOffset, indAccessor.count);

  // Extract positions
  const posByteOffset = binDataOffset + (posBufferView.byteOffset || 0) + (posAccessor.byteOffset || 0);
  const positions = new Float32Array(arrayBuffer, posByteOffset, posAccessor.count * 3);

  const vertices = [];
  for (let i = 0; i < positions.length; i += 3) {
    vertices.push([positions[i], positions[i + 1], positions[i + 2]]);
  }

  const faces = [];
  for (let i = 0; i < indices.length; i += 3) {
    faces.push([indices[i], indices[i + 1], indices[i + 2]]);
  }

  return { vertices, faces };
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

  // Use loaded real geometry or fallback procedural
  const geom = state.viewer3D.currentGeometry || get3DGeometryForCategory(state.viewer3D.meshType);
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

  // Reset to 2D view initially
  switchARViewMode("2D");
  openModal(elements.arModal);
}

function closeARModal() {
  cleanupARSpatialSession();
  closeModal(elements.arModal);
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
    // Graceful fallback for non-WebXR browsers
    state.webxrSupported = false;
    elements.arWebxrInfo.textContent = t("ar.webxr_unsupported");
  }
}

function switchARViewMode(mode) {
  state.arViewMode = mode;
  if (mode === "WEBXR") {
    elements.btnModeWebXR.className = "btn btn-secondary active-mode";
    elements.btnMode2D.className = "btn btn-secondary";
    elements.ar2DView.style.display = "none";
    elements.arSpatialViewport.style.display = "block";
    elements.arPlacementActionContainer.style.display = "block";
    elements.arModePill.textContent = "WEBXR IMMERSIVE";
    elements.arViewModeLabel.textContent = "Proyección Espacial AR WebXR";
    startARSpatialExperience();
  } else {
    elements.btnMode2D.className = "btn btn-secondary active-mode";
    elements.btnModeWebXR.className = "btn btn-secondary";
    elements.ar2DView.style.display = "flex";
    elements.arSpatialViewport.style.display = "none";
    elements.arPlacementActionContainer.style.display = "none";
    elements.arModePill.textContent = "DEMO 2D SIMULATION";
    elements.arViewModeLabel.textContent = "Simulación Espacial 2D Interactiva";
    cleanupARSpatialSession();
  }
}

async function startARSpatialExperience() {
  cleanupARSpatialSession();

  state.arSpatial.status = "AR_INITIALIZING";
  elements.arHudText.textContent = t("ar.hud_scanning");
  elements.btnArPlaceObject.disabled = true;
  elements.btnArPlaceObject.textContent = t("ar.place_button");
  elements.arHitReticle.style.display = "flex";
  elements.arSpatialControls.style.display = "none";

  const product = state.selectedProductForAR;
  if (product) {
    // Resolve real asset geometry or fallback
    state.arSpatial.loadedGeometry = state.viewer3D.currentGeometry || get3DGeometryForCategory(product.category);
  }

  // Real WebXR Session Initiation if device supports hardware session
  if (navigator.xr && state.webxrSupported) {
    try {
      const session = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: [],
        optionalFeatures: ["hit-test", "local-floor", "local"],
      });
      state.arSpatial.session = session;
      session.addEventListener("end", () => {
        cleanupARSpatialSession();
        switchARViewMode("2D");
      });
    } catch (err) {
      // Graceful fallback to camera / spatial simulated canvas
      console.warn("Native WebXR immersive session fallback:", err);
    }
  }

  // Start spatial hit-test simulation loop
  state.arSpatial.status = "AR_SCANNING_SURFACE";
  state.arSpatial.isScanningSim = setTimeout(() => {
    state.arSpatial.status = "AR_SURFACE_DETECTED";
    state.arSpatial.surfaceHit = true;
    elements.arHudText.textContent = t("ar.hud_detected");
    elements.btnArPlaceObject.disabled = false;
  }, 1200);

  renderARSpatialLoop();
}

function renderARSpatialLoop() {
  const canvas = elements.arSpatialCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Background camera pass-through backdrop simulation
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#090d16");
  grad.addColorStop(0.5, "#1e1b4b");
  grad.addColorStop(1, "#020617");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Draw Spatial Grid Matrix (Floor Anchor)
  ctx.strokeStyle = "rgba(129, 140, 248, 0.25)";
  ctx.lineWidth = 1;
  const radX = (25 * Math.PI) / 180;
  const radY = (state.arSpatial.transform.rotationY * Math.PI) / 180;
  const zoom = state.arSpatial.transform.scale;

  for (let i = -160; i <= 160; i += 40) {
    ctx.beginPath();
    const p1 = projectPoint(i, 70, -140, radX, radY, zoom, w, h);
    const p2 = projectPoint(i, 70, 140, radX, radY, zoom, w, h);
    ctx.moveTo(p1.sx, p1.sy);
    ctx.lineTo(p2.sx, p2.sy);
    ctx.stroke();
  }

  // If object placed, render 3D asset in spatial perspective
  if (state.arSpatial.placedObject && state.arSpatial.loadedGeometry) {
    const geom = state.arSpatial.loadedGeometry;
    const projected = geom.vertices.map((v) => {
      const x1 = v[0] * Math.cos(radY) + v[2] * Math.sin(radY);
      const y1 = v[1];
      const z1 = -v[0] * Math.sin(radY) + v[2] * Math.cos(radY);

      const x2 = x1;
      const y2 = y1 * Math.cos(radX) - z1 * Math.sin(radX);
      const z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);

      const distance = 350;
      const scale = (distance / (distance + z2)) * zoom;
      const sx = w / 2 + x2 * scale;
      const sy = h / 2 + y2 * scale;
      return { sx, sy, z: z2 };
    });

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

      ctx.fillStyle = "rgba(99, 102, 241, 0.55)";
      ctx.fill();
      ctx.strokeStyle = "#a5b4fc";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  if (state.arViewMode === "WEBXR") {
    state.arSpatial.animFrameId = requestAnimationFrame(renderARSpatialLoop);
  }
}

function handleARPlaceObject() {
  if (!state.arSpatial.surfaceHit) return;

  state.arSpatial.placedObject = true;
  state.arSpatial.status = "AR_PLACED";
  elements.arHitReticle.style.display = "none";
  elements.arSpatialControls.style.display = "flex";
  elements.arHudText.textContent = t("ar.hud_placed");
  elements.btnArPlaceObject.textContent = t("ar.placed_button");
  elements.btnArPlaceObject.disabled = true;
}

function handleARRemoveObject() {
  state.arSpatial.placedObject = false;
  state.arSpatial.status = "AR_SURFACE_DETECTED";
  elements.arHitReticle.style.display = "flex";
  elements.arSpatialControls.style.display = "none";
  elements.arHudText.textContent = t("ar.hud_detected");
  elements.btnArPlaceObject.textContent = t("ar.place_button");
  elements.btnArPlaceObject.disabled = false;
}

function cleanupARSpatialSession() {
  if (state.arSpatial.isScanningSim) {
    clearTimeout(state.arSpatial.isScanningSim);
    state.arSpatial.isScanningSim = null;
  }
  if (state.arSpatial.animFrameId) {
    cancelAnimationFrame(state.arSpatial.animFrameId);
    state.arSpatial.animFrameId = null;
  }
  if (state.arSpatial.session) {
    try {
      state.arSpatial.session.end();
    } catch (_) {}
    state.arSpatial.session = null;
  }
  state.arSpatial.status = "AR_IDLE";
  state.arSpatial.surfaceHit = false;
  state.arSpatial.placedObject = false;
  state.arSpatial.transform = { x: 0, y: -0.2, z: -1.0, rotationY: 0, scale: 1.0 };
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

// --- Interactive AR Walkthrough & Product Honesty Matrix Data & Logic ---
const WALKTHROUGH_STEPS_DATA = [
  {
    stepNumber: 1,
    id: "select-and-inspect",
    title: { es: "1. Selección e Inspección 3D", en: "1. Selection & 3D Inspection" },
    subtitle: { es: "Renderizado tridimensional inmediato en el navegador", en: "Instant 3D rendering in the web browser" },
    description: {
      es: "El usuario explora el catálogo asistido por IA y abre la vista 3D interactiva del producto. El motor carga assets binarios glTF / GLB reales con iluminación PBR optimizada y control orbital 360°.",
      en: "The user explores the AI-assisted catalog and opens the interactive 3D product view. The engine loads real glTF / GLB binary assets with optimized PBR lighting and 360° orbital controls."
    },
    technicalDetails: {
      es: "Formatos: GLB/glTF 2.0. Render: Canvas WebGL / Procedural fallback. Peso medio: < 2.5 MB.",
      en: "Formats: GLB/glTF 2.0. Render: Canvas WebGL / Procedural fallback. Average size: < 2.5 MB."
    },
    badge: { es: "Inspección 3D", en: "3D Inspection" },
    image: "assets/images/walkthrough-step1.svg",
  },
  {
    stepNumber: 2,
    id: "webxr-handshake",
    title: { es: "2. Handshake y Detección WebXR", en: "2. WebXR Handshake & Detection" },
    subtitle: { es: "Evaluación de hardware y permisos de cámara", en: "Hardware evaluation & camera permissions" },
    description: {
      es: "Al presionar 'Probar en Realidad Aumentada', el sistema consulta navigator.xr.isSessionSupported('immersive-ar') y verifica hit-test. Si el dispositivo no tiene soporte AR inmersivo, degrada de forma transparente a visualizador 3D interactivo.",
      en: "Upon clicking 'Try in Augmented Reality', the system queries navigator.xr.isSessionSupported('immersive-ar') and verifies hit-test. If unsupported, it gracefully degrades to the interactive 3D viewer."
    },
    technicalDetails: {
      es: "Feature flags: requiredFeatures: ['hit-test'], optionalFeatures: ['dom-overlay', 'light-estimation'].",
      en: "Feature flags: requiredFeatures: ['hit-test'], optionalFeatures: ['dom-overlay', 'light-estimation']."
    },
    badge: { es: "Handshake WebXR", en: "WebXR Handshake" },
    image: "assets/images/walkthrough-step2.svg",
  },
  {
    stepNumber: 3,
    id: "hit-test-scanning",
    title: { es: "3. Escaneo y Detección de Planos", en: "3. Plane Scanning & Hit-Testing" },
    subtitle: { es: "Cálculo de intersección espacial con superficies reales", en: "Spatial raycasting against physical floor and table planes" },
    description: {
      es: "La cámara transmite el stream óptico y el runtime WebXR calcula rayos de hit-test (XRHitTestSource) contra planos físicos detectados. Una retícula visual proyectada sobre el suelo indica el punto exacto de anclaje.",
      en: "The camera transmits the optical stream and WebXR calculates hit-test rays (XRHitTestSource) against detected physical planes. A projected floor reticle indicates the exact anchoring point."
    },
    technicalDetails: {
      es: "Frecuencia: 60 fps en XRFrame loop. Raycast referenceSpace: 'viewer' transformado a 'local-floor'.",
      en: "Frequency: 60 fps XRFrame loop. Raycast referenceSpace: 'viewer' transformed into 'local-floor'."
    },
    badge: { es: "Hit-Test Óptico", en: "Optical Hit-Test" },
    image: "assets/images/walkthrough-step3.svg",
  },
  {
    stepNumber: 4,
    id: "spatial-placement",
    title: { es: "4. Anclaje y Fijación Espacial", en: "4. Spatial Anchoring & Placement" },
    subtitle: { es: "Ubicación del modelo en coordenadas de mundo real", en: "Model placement into real-world coordinate system" },
    description: {
      es: "Al tocar la pantalla (select event), la matriz de transformación del hit-test se transfiere al modelo 3D. El objeto queda fijado en el espacio tridimensional real mientras el usuario camina a su alrededor.",
      en: "On tap (select event), the hit-test transform matrix transfers to the 3D model. The item becomes anchored in real physical 3D space, allowing 6-DoF user exploration."
    },
    technicalDetails: {
      es: "Transform: Matriz 4x4 de pose espacial (XRRigidTransform). Escala clamped: 0.25x a 2.50x.",
      en: "Transform: 4x4 spatial pose matrix (XRRigidTransform). Clamped scale: 0.25x to 2.50x."
    },
    badge: { es: "Anclaje 6-DoF", en: "6-DoF Anchor" },
    image: "assets/images/walkthrough-step4.svg",
  },
  {
    stepNumber: 5,
    id: "transform-and-bag",
    title: { es: "5. Interacción y Adición al Carrito", en: "5. Interaction & Bag Handoff" },
    subtitle: { es: "Validación biométrica de talla y compra fluida", en: "Biometric size validation & seamless checkout" },
    description: {
      es: "El probador muestra la recomendación de talla calculada para el perfil seleccionado (Nova, Sora, Mateo). Con un toque, el usuario transfiere la prenda verificada al carrito demo y continúa con el flujo de compra.",
      en: "The fitting engine displays the calculated size recommendation for the selected profile (Nova, Sora, Mateo). With one tap, the user transfers the verified item to the demo bag and proceeds."
    },
    technicalDetails: {
      es: "Biometría: Ajuste determinista por categoría. Carrito: Persistencia local reactiva sin cookies de terceros.",
      en: "Biometrics: Category deterministic sizing. Bag: Reactive local persistence without third-party cookies."
    },
    badge: { es: "Checkout Demo", en: "Demo Checkout" },
    image: "assets/images/walkthrough-step5.svg",
  },
];

const HONESTY_DATA = [
  {
    feature: { es: "Visualizador 3D Orbitable", en: "Orbitable 3D Viewer" },
    status: "IMPLEMENTED",
    detail: {
      es: "Renderizado WebGL nativo en Canvas con iluminación direccional y órbita táctil/ratón.",
      en: "Native Canvas WebGL rendering with directional lighting and touch/mouse orbital control."
    }
  },
  {
    feature: { es: "Carga de Modelos Reales GLB / glTF 2.0", en: "Real GLB / glTF 2.0 Model Loading" },
    status: "IMPLEMENTED",
    detail: {
      es: "Archivos binarios GLB y JSON glTF 2.0 servidos localmente con validación de magic header.",
      en: "Binary GLB and JSON glTF 2.0 files served locally with magic header verification."
    }
  },
  {
    feature: { es: "WebXR Immersive AR & Hit-Testing", en: "WebXR Immersive AR & Hit-Testing" },
    status: "IMPLEMENTED",
    detail: {
      es: "Soporte completo para dispositivos compatibles con WebXR (Android Chrome, ARCore). Detección automática de suelo.",
      en: "Full support for WebXR-compatible devices (Android Chrome, ARCore). Automatic floor detection."
    }
  },
  {
    feature: { es: "Motor de Recomendación de Tallas", en: "Biometric Sizing Engine" },
    status: "IMPLEMENTED",
    detail: {
      es: "Algoritmo determinista de ajuste morfológico según categoría y perfiles demo sintéticos.",
      en: "Deterministic morphological sizing algorithm across product categories and synthetic demo profiles."
    }
  },
  {
    feature: { es: "Tracking Corporal en Tiempo Real (Body Mesh)", en: "Real-time Body Mesh Tracking" },
    status: "NOT_IMPLEMENTED",
    detail: {
      es: "Fuera de alcance en esta fase. No se ejecuta malla esquelética compleja en el cliente.",
      en: "Out of scope for this phase. Complex skeletal mesh fitting is not executed on client."
    }
  },
  {
    feature: { es: "Simulación Física de Telas (Cloth Physics)", en: "Real-time Cloth Deformation Physics" },
    status: "NOT_IMPLEMENTED",
    detail: {
      es: "Los modelos textiles son estáticos / semi-rígidos para garantizar 60 fps en móviles web estándar.",
      en: "Textile models are static / semi-rigid to ensure solid 60 fps on standard mobile browsers."
    }
  },
  {
    feature: { es: "Motor de Virtual Try-On con IA (VTO)", en: "AI Virtual Try-On Engine (VTO)" },
    status: "IMPLEMENTED",
    detail: {
      es: "Abstracción provider-agnostic con modo Demo offline y conector FASHN AI para prendas compatibles.",
      en: "Provider-agnostic abstraction with offline Demo mode and FASHN AI connector for supported apparel."
    }
  },
  {
    feature: { es: "Pasarelas de Pago Bancario Real (Stripe / Transbank Live)", en: "Real Banking Payment Gateways (Stripe / Transbank Live)" },
    status: "NOT_IMPLEMENTED",
    detail: {
      es: "Estrictamente bloqueado por diseño (Fail-Closed). Solo se ejecuta simulador Webpay Demo.",
      en: "Strictly forbidden by design (Fail-Closed). Only simulated Webpay Demo is active."
    }
  }
];

// --- AI Virtual Try-On (VTO) Controller ---
// --- AI Virtual Try-On (VTO) Controller & State Machine ---
const VTO_COMPATIBLE_CATEGORIES = ["poleras", "camisas", "polerones", "chaquetas", "vestidos", "pantalones", "faldas"];

const VTO_AVATARS = [
  { id: "Nova", name: "Nova", subtitle: "Femenino / Contemporáneo (1.68m, Talla S/M)", icon: "👩" },
  { id: "Sora", name: "Sora", subtitle: "Unisex / Streetwear (1.74m, Talla M)", icon: "🧑" },
  { id: "Mateo", name: "Mateo", subtitle: "Masculino / Atlético (1.82m, Talla L)", icon: "👨" },
];

function isProductVTOCompatible(product) {
  if (!product || !product.category) return false;
  return VTO_COMPATIBLE_CATEGORIES.includes(product.category.toLowerCase());
}

/**
 * Explicit Memory and Object URL Lifecycle Cleanup (Leak Prevention)
 */
function releaseVTOObjectUrl() {
  if (state.vto.uploadedPhotoBlobUrl) {
    try {
      URL.revokeObjectURL(state.vto.uploadedPhotoBlobUrl);
    } catch {
      // Ignore if already revoked
    }
    state.vto.uploadedPhotoBlobUrl = null;
  }
}

/**
 * Transitions the VTO UI state machine and synchronizes DOM controls safely.
 */
function setVTOUIState(newState) {
  state.vto.uiState = newState;

  if (newState === "IDLE") {
    state.vto.isSubmitting = false;
    if (elements.vtoConsentBox) elements.vtoConsentBox.style.display = state.vto.consentGranted ? "none" : "block";
    if (elements.vtoPhotoBox) elements.vtoPhotoBox.style.display = state.vto.consentGranted ? "block" : "none";
    if (elements.vtoProcessingBox) elements.vtoProcessingBox.style.display = "none";
    if (elements.vtoResultBox) elements.vtoResultBox.style.display = "none";
    if (elements.btnVtoGenerate) elements.btnVtoGenerate.disabled = false;
  } else if (newState === "CONSENT_REQUIRED") {
    if (elements.vtoConsentBox) elements.vtoConsentBox.style.display = "block";
    if (elements.vtoPhotoBox) elements.vtoPhotoBox.style.display = "none";
    if (elements.vtoProcessingBox) elements.vtoProcessingBox.style.display = "none";
    if (elements.vtoResultBox) elements.vtoResultBox.style.display = "none";
  } else if (newState === "VALIDATING_INPUT") {
    if (elements.vtoQualityFeedbackBox) elements.vtoQualityFeedbackBox.style.display = "block";
    if (elements.vtoQualityBadge) {
      elements.vtoQualityBadge.className = "vto-quality-badge vto-badge-acceptable";
      elements.vtoQualityBadge.textContent = "VALIDATING";
    }
    if (elements.vtoQualityText) {
      elements.vtoQualityText.textContent = state.lang === "es-419" ? "Analizando resolución y formato técnico..." : "Analyzing resolution and technical format...";
    }
    if (elements.btnVtoGenerate) elements.btnVtoGenerate.disabled = true;
  } else if (newState === "QUALITY_REJECTED") {
    if (elements.vtoQualityFeedbackBox) elements.vtoQualityFeedbackBox.style.display = "block";
    if (elements.btnVtoGenerate) elements.btnVtoGenerate.disabled = true;
  } else if (newState === "QUALITY_WARNING" || newState === "READY") {
    if (elements.vtoQualityFeedbackBox) elements.vtoQualityFeedbackBox.style.display = "block";
    if (elements.btnVtoGenerate) elements.btnVtoGenerate.disabled = false;
  } else if (newState === "EXECUTING" || newState === "POLLING") {
    state.vto.isSubmitting = true;
    if (elements.vtoConsentBox) elements.vtoConsentBox.style.display = "none";
    if (elements.vtoPhotoBox) elements.vtoPhotoBox.style.display = "none";
    if (elements.vtoResultBox) elements.vtoResultBox.style.display = "none";
    if (elements.vtoProcessingBox) elements.vtoProcessingBox.style.display = "block";
    if (elements.btnVtoGenerate) elements.btnVtoGenerate.disabled = true;
  } else if (newState === "SUCCESS") {
    state.vto.isSubmitting = false;
    if (elements.vtoProcessingBox) elements.vtoProcessingBox.style.display = "none";
    if (elements.vtoPhotoBox) elements.vtoPhotoBox.style.display = "none";
    if (elements.vtoConsentBox) elements.vtoConsentBox.style.display = "none";
    if (elements.vtoResultBox) elements.vtoResultBox.style.display = "block";
    if (elements.btnVtoGenerate) elements.btnVtoGenerate.disabled = false;
  } else if (newState === "FAILED" || newState === "CANCELLED") {
    state.vto.isSubmitting = false;
    if (elements.vtoProcessingBox) elements.vtoProcessingBox.style.display = "none";
    if (elements.vtoPhotoBox) elements.vtoPhotoBox.style.display = "block";
    if (elements.vtoResultBox) elements.vtoResultBox.style.display = "none";
    if (elements.btnVtoGenerate) elements.btnVtoGenerate.disabled = false;
  }
}

function openVTOModal(product) {
  state.vto.selectedProduct = product;
  if (elements.vtoModalProductName) {
    elements.vtoModalProductName.textContent = `${product.name} (${product.brand})`;
  }

  if (!state.vto.consentGranted) {
    setVTOUIState("CONSENT_REQUIRED");
  } else {
    setVTOUIState("IDLE");
    renderVTOAvatars();
    renderSyntheticQualityFeedback();
  }

  openModal(elements.vtoModal);
}

function closeVTOModal() {
  if (state.vto.statusPollTimer) {
    clearInterval(state.vto.statusPollTimer);
    state.vto.statusPollTimer = null;
  }
  if (state.vto.isSubmitting && state.vto.activeJobId) {
    cancelActiveVTOJob(state.vto.activeJobId);
  }
  releaseVTOObjectUrl();
  setVTOUIState("IDLE");
  closeModal(elements.vtoModal);
}

async function cancelActiveVTOJob(jobId) {
  try {
    await fetch(`/api/vto/cancel/${encodeURIComponent(jobId)}`, { method: "POST" });
  } catch {
    // Fail silently on fire-and-forget cancel
  }
}

function renderVTOAvatars() {
  if (!elements.vtoAvatarContainer) return;

  while (elements.vtoAvatarContainer.firstChild) {
    elements.vtoAvatarContainer.removeChild(elements.vtoAvatarContainer.firstChild);
  }

  for (const avatar of VTO_AVATARS) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `vto-avatar-card ${state.vto.selectedAvatar === avatar.id && state.vto.inputMode === "SYNTHETIC_AVATAR" ? "active" : ""}`;
    card.style.display = "flex";
    card.style.alignItems = "center";
    card.style.gap = "0.75rem";
    card.style.padding = "0.75rem 1rem";
    card.style.borderRadius = "0.5rem";
    card.style.border = state.vto.selectedAvatar === avatar.id && state.vto.inputMode === "SYNTHETIC_AVATAR" ? "2px solid var(--primary-color)" : "1px solid var(--border-color)";
    card.style.backgroundColor = "var(--bg-secondary)";
    card.style.cursor = "pointer";
    card.style.width = "100%";
    card.style.textAlign = "left";

    const icon = document.createElement("span");
    icon.style.fontSize = "1.75rem";
    icon.textContent = avatar.icon;

    const info = document.createElement("div");
    const name = document.createElement("div");
    name.style.fontWeight = "600";
    name.style.fontSize = "0.875rem";
    name.textContent = avatar.name;

    const sub = document.createElement("div");
    sub.style.fontSize = "0.75rem";
    sub.style.color = "var(--text-secondary)";
    sub.textContent = avatar.subtitle;

    info.appendChild(name);
    info.appendChild(sub);
    card.appendChild(icon);
    card.appendChild(info);

    card.addEventListener("click", () => {
      state.vto.selectedAvatar = avatar.id;
      state.vto.inputMode = "SYNTHETIC_AVATAR";
      removeVTOPhoto();
      renderVTOAvatars();
      renderSyntheticQualityFeedback();
    });

    elements.vtoAvatarContainer.appendChild(card);
  }
}

function renderSyntheticQualityFeedback() {
  if (!elements.vtoQualityFeedbackBox) return;
  const isEn = state.lang !== "es-419";

  elements.vtoQualityFeedbackBox.style.display = "block";
  if (elements.vtoQualityIcon) elements.vtoQualityIcon.textContent = "✨";
  if (elements.vtoQualityTitle) elements.vtoQualityTitle.textContent = isEn ? "Avatar Model Quality" : "Calidad del Avatar Modelo";
  if (elements.vtoQualityBadge) {
    elements.vtoQualityBadge.className = "vto-quality-badge vto-badge-excellent";
    elements.vtoQualityBadge.textContent = "EXCELLENT";
  }
  if (elements.vtoQualityText) {
    elements.vtoQualityText.textContent = isEn
      ? `Calibrated synthetic avatar '${state.vto.selectedAvatar}' is pre-optimized for cloth simulation.`
      : `Avatar sintético calibrado '${state.vto.selectedAvatar}' pre-optimizado para simulación textil.`;
  }

  if (elements.vtoQualityDetails) {
    while (elements.vtoQualityDetails.firstChild) {
      elements.vtoQualityDetails.removeChild(elements.vtoQualityDetails.firstChild);
    }
    const spanRes = document.createElement("span");
    spanRes.textContent = "📐 800x1200 px (3:4)";
    const spanFormat = document.createElement("span");
    spanFormat.textContent = "📦 SVG/Vector Optimized";
    elements.vtoQualityDetails.appendChild(spanRes);
    elements.vtoQualityDetails.appendChild(spanFormat);
  }

  setVTOUIState("READY");
}

function renderQualityAssessmentFeedback(assessment) {
  if (!elements.vtoQualityFeedbackBox || !assessment) return;
  const isEn = state.lang !== "es-419";
  const stateVal = assessment.state || "UNKNOWN";

  elements.vtoQualityFeedbackBox.style.display = "block";

  if (elements.vtoQualityBadge) {
    let badgeClass = "vto-quality-badge ";
    if (stateVal === "EXCELLENT") badgeClass += "vto-badge-excellent";
    else if (stateVal === "ACCEPTABLE") badgeClass += "vto-badge-acceptable";
    else if (stateVal === "WARNING") badgeClass += "vto-badge-warning";
    else badgeClass += "vto-badge-reject";

    elements.vtoQualityBadge.className = badgeClass;
    elements.vtoQualityBadge.textContent = stateVal;
  }

  if (elements.vtoQualityIcon) {
    elements.vtoQualityIcon.textContent = stateVal === "REJECT" ? "⚠️" : stateVal === "WARNING" ? "⚡" : "✅";
  }

  if (elements.vtoQualityTitle) {
    elements.vtoQualityTitle.textContent = isEn ? "Photo Quality Assessment" : "Evaluación de Calidad de Fotografía";
  }

  if (elements.vtoQualityText) {
    const feedbackText = isEn ? assessment.feedback?.en : assessment.feedback?.es;
    elements.vtoQualityText.textContent = feedbackText || (isEn ? "Quality evaluated." : "Calidad evaluada.");
  }

  if (elements.vtoQualityDetails && assessment.technicalSummary) {
    const sum = assessment.technicalSummary;
    while (elements.vtoQualityDetails.firstChild) {
      elements.vtoQualityDetails.removeChild(elements.vtoQualityDetails.firstChild);
    }

    const spanDim = document.createElement("span");
    spanDim.textContent = `📐 ${sum.width}x${sum.height} px`;

    const spanFmt = document.createElement("span");
    spanFmt.textContent = `📦 ${(sum.format || "img").toUpperCase()} (${Math.round((sum.fileSizeBytes || 0) / 1024)} KB)`;

    const spanOri = document.createElement("span");
    spanOri.textContent = `🧭 ${sum.orientation || "portrait"}`;

    elements.vtoQualityDetails.appendChild(spanDim);
    elements.vtoQualityDetails.appendChild(spanFmt);
    elements.vtoQualityDetails.appendChild(spanOri);
  }

  if (stateVal === "REJECT") {
    setVTOUIState("QUALITY_REJECTED");
  } else if (stateVal === "WARNING") {
    setVTOUIState("QUALITY_WARNING");
  } else {
    setVTOUIState("READY");
  }
}

async function handleVTOPhotoUpload(file) {
  if (!file) return;

  const validMimes = ["image/jpeg", "image/png", "image/webp"];
  if (!validMimes.includes(file.type)) {
    alert(t("tryon.invalid_mime") || "Formato no válido. Use JPG, PNG o WebP.");
    return;
  }

  const maxSizeBytes = 10 * 1024 * 1024; // 10 MB limit
  if (file.size > maxSizeBytes) {
    alert(t("tryon.max_size_exceeded") || "La imagen excede el límite permitido de 10 MB.");
    return;
  }

  setVTOUIState("VALIDATING_INPUT");

  const reader = new FileReader();
  reader.onload = async (e) => {
    const dataUrl = e.target.result;
    const parts = String(dataUrl).split(",");
    if (parts.length < 2) return;

    state.vto.uploadedPhotoBase64 = parts[1];
    state.vto.uploadedPhotoMime = file.type;
    state.vto.inputMode = "USER_PHOTO";

    // Manage memory lifecycle safely
    releaseVTOObjectUrl();
    state.vto.uploadedPhotoBlobUrl = URL.createObjectURL(file);

    if (elements.vtoUploadPreviewImg) {
      elements.vtoUploadPreviewImg.src = state.vto.uploadedPhotoBlobUrl;
    }
    if (elements.vtoDropzoneContent) {
      elements.vtoDropzoneContent.style.display = "none";
    }
    if (elements.vtoUploadPreview) {
      elements.vtoUploadPreview.style.display = "block";
    }

    renderVTOAvatars();

    // Perform technical quality assessment via backend pipeline
    try {
      const assessRes = await fetch("/api/vto/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64: state.vto.uploadedPhotoBase64,
          mimeType: file.type,
          userConsentGranted: true,
        }),
      });

      if (assessRes.ok) {
        const assessData = await assessRes.json();
        state.vto.qualityAssessment = assessData.assessment;
        renderQualityAssessmentFeedback(assessData.assessment);
      } else {
        // Fallback local assessment if endpoint fails
        renderQualityAssessmentFeedback({
          state: "ACCEPTABLE",
          feedback: { es: "Fotografía cargada correctamente.", en: "Photograph uploaded successfully." },
          technicalSummary: { width: 800, height: 1000, format: file.type.replace("image/", ""), fileSizeBytes: file.size, orientation: "portrait" },
        });
      }
    } catch {
      renderQualityAssessmentFeedback({
        state: "ACCEPTABLE",
        feedback: { es: "Fotografía cargada para simulación.", en: "Photograph loaded for simulation." },
        technicalSummary: { width: 800, height: 1000, format: file.type.replace("image/", ""), fileSizeBytes: file.size, orientation: "portrait" },
      });
    }
  };
  reader.readAsDataURL(file);
}

function removeVTOPhoto() {
  releaseVTOObjectUrl();
  state.vto.uploadedPhotoBase64 = null;
  state.vto.uploadedPhotoMime = null;
  state.vto.qualityAssessment = null;
  state.vto.inputMode = "SYNTHETIC_AVATAR";

  if (elements.vtoFileInput) {
    elements.vtoFileInput.value = "";
  }
  if (elements.vtoUploadPreviewImg) {
    elements.vtoUploadPreviewImg.src = "";
  }
  if (elements.vtoUploadPreview) {
    elements.vtoUploadPreview.style.display = "none";
  }
  if (elements.vtoDropzoneContent) {
    elements.vtoDropzoneContent.style.display = "block";
  }

  renderVTOAvatars();
  renderSyntheticQualityFeedback();
}

async function handleVTOGenerate() {
  if (!state.vto.selectedProduct || state.vto.isSubmitting) return;

  // Gate check: quality state reject prevents submission
  if (state.vto.inputMode === "USER_PHOTO" && state.vto.qualityAssessment?.state === "REJECT") {
    alert(state.lang === "es-419" ? "La imagen no cumple las condiciones técnicas mínimas requeridas." : "Image does not meet technical quality requirements.");
    return;
  }

  setVTOUIState("EXECUTING");
  if (elements.vtoProcessingStatus) elements.vtoProcessingStatus.textContent = t("tryon.status_submitting") || (state.lang === "es-419" ? "Enviando solicitud al motor de IA..." : "Submitting to AI engine...");
  if (elements.vtoProgressFill) elements.vtoProgressFill.style.width = "15%";

  const payload = {
    productId: state.vto.selectedProduct.id,
    inputType: state.vto.inputMode,
    syntheticProfileId: state.vto.selectedAvatar,
    userConsentGiven: true,
  };

  if (state.vto.inputMode === "USER_PHOTO" && state.vto.uploadedPhotoBase64) {
    payload.userImageBase64 = state.vto.uploadedPhotoBase64;
    payload.userImageMimeType = state.vto.uploadedPhotoMime || "image/jpeg";
  }

  try {
    const res = await fetch("/api/vto/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }

    const job = await res.json();
    state.vto.activeJobId = job.jobId;

    setVTOUIState("POLLING");
    if (elements.vtoProgressFill) elements.vtoProgressFill.style.width = `${Math.max(25, job.progress || 25)}%`;
    if (elements.vtoProcessingStatus) elements.vtoProcessingStatus.textContent = getLocalizedStageMessage(job.stage);

    pollVTOStatus(job.jobId);
  } catch (_err) {
    // Graceful client fallback for pure static hosting (e.g. GitHub Pages)
    simulateClientSyntheticVTO();
  }
}

function simulateClientSyntheticVTO() {
  setVTOUIState("POLLING");
  const stages = ["QUEUED", "SEGMENTING", "WARPING", "INPAINTING", "FINALIZING"];
  let stageIdx = 0;

  if (state.vto.statusPollTimer) {
    clearInterval(state.vto.statusPollTimer);
  }

  state.vto.statusPollTimer = setInterval(() => {
    stageIdx++;
    const progress = Math.min(100, stageIdx * 20);
    if (elements.vtoProgressFill) elements.vtoProgressFill.style.width = `${progress}%`;
    if (elements.vtoProcessingStatus) {
      elements.vtoProcessingStatus.textContent = getLocalizedStageMessage(stages[Math.min(stages.length - 1, stageIdx)]);
    }

    if (stageIdx >= stages.length) {
      clearInterval(state.vto.statusPollTimer);
      state.vto.statusPollTimer = null;

      // Synthetic client result
      const syntheticResult = {
        outputImageUrl: "assets/images/demo-vto-composite.svg",
        recommendedSize: state.vto.selectedAvatar === "Mateo" ? "L" : "M",
        confidencePercent: 95,
        disclaimer: {
          es: "Simulación de demostración pública. Generado en modo sintético cliente seguro.",
          en: "Public demonstration simulation. Generated in safe synthetic client mode.",
        },
      };

      state.vto.currentResult = syntheticResult;
      setVTOUIState("SUCCESS");

      if (elements.vtoResultImg) {
        elements.vtoResultImg.src = syntheticResult.outputImageUrl;
        elements.vtoResultImg.alt = `Virtual Try-On Demo: ${state.vto.selectedProduct?.name || "Prenda"}`;
      }
      if (elements.vtoResultSize) {
        const sizeText = state.lang === "es-419"
          ? `Talla Recomendada: ${syntheticResult.recommendedSize} (${syntheticResult.confidencePercent}% confianza)`
          : `Recommended Size: ${syntheticResult.recommendedSize} (${syntheticResult.confidencePercent}% confidence)`;
        elements.vtoResultSize.textContent = sizeText;
      }
      if (elements.vtoResultDisclaimer) {
        const disc = state.lang === "es-419" ? syntheticResult.disclaimer.es : syntheticResult.disclaimer.en;
        elements.vtoResultDisclaimer.textContent = disc;
      }
    }
  }, 400);
}

function pollVTOStatus(jobId) {
  if (state.vto.statusPollTimer) {
    clearInterval(state.vto.statusPollTimer);
  }

  state.vto.statusPollTimer = setInterval(async () => {
    try {
      const res = await fetch(`/api/vto/status/${encodeURIComponent(jobId)}`);
      if (!res.ok) throw new Error("Error consultando estado del trabajo");

      const statusData = await res.json();
      if (elements.vtoProgressFill) {
        elements.vtoProgressFill.style.width = `${statusData.progress || 50}%`;
      }
      if (elements.vtoProcessingStatus) {
        elements.vtoProcessingStatus.textContent = getLocalizedStageMessage(statusData.stage);
      }

      if (statusData.status === "COMPLETED") {
        clearInterval(state.vto.statusPollTimer);
        state.vto.statusPollTimer = null;
        await fetchAndDisplayVTOResult(jobId);
      } else if (statusData.status === "FAILED") {
        clearInterval(state.vto.statusPollTimer);
        state.vto.statusPollTimer = null;
        setVTOUIState("FAILED");
        const safeErr = (statusData.errorMessage || "Error desconocido").replace(/fa_live_[a-zA-Z0-9_-]+/g, "[REDACTED]");
        alert(`${state.lang === "es-419" ? "Generación de Virtual Try-On fallida" : "Virtual Try-On generation failed"}: ${safeErr}`);
      }
    } catch {
      // Continue bounded polling until timeout
    }
  }, 800);
}

async function fetchAndDisplayVTOResult(jobId) {
  try {
    const res = await fetch(`/api/vto/result/${encodeURIComponent(jobId)}`);
    if (!res.ok) throw new Error("No se pudo obtener el resultado del probador");

    const result = await res.json();
    state.vto.currentResult = result;

    setVTOUIState("SUCCESS");

    if (elements.vtoResultImg) {
      elements.vtoResultImg.src = result.outputImageUrl;
      elements.vtoResultImg.alt = `Virtual Try-On: ${state.vto.selectedProduct?.name || "Prenda"}`;
    }

    if (elements.vtoResultSize) {
      const sizeText = state.lang === "es-419"
        ? `Talla Recomendada: ${result.recommendedSize || "M"} (${result.confidencePercent || 94}% confianza)`
        : `Recommended Size: ${result.recommendedSize || "M"} (${result.confidencePercent || 94}% confidence)`;
      elements.vtoResultSize.textContent = sizeText;
    }

    if (elements.vtoResultDisclaimer) {
      const disc = (typeof result.disclaimer === "object" ? (state.lang === "es-419" ? result.disclaimer?.es : result.disclaimer?.en) : result.disclaimer) || t("tryon.result_disclaimer");
      elements.vtoResultDisclaimer.textContent = disc;
    }
  } catch (err) {
    setVTOUIState("FAILED");
    const safeMsg = err.message.replace(/fa_live_[a-zA-Z0-9_-]+/g, "[REDACTED]");
    alert(`${state.lang === "es-419" ? "Error recuperando resultado" : "Error retrieving result"}: ${safeMsg}`);
  }
}

function getLocalizedStageMessage(stage) {
  const isEn = state.lang !== "es-419";
  switch (stage) {
    case "QUEUED":
      return isEn ? "Job queued in processing queue..." : "Solicitud en cola de procesamiento...";
    case "SEGMENTING":
      return isEn ? "Segmenting pose and garment silhouette..." : "Segmentando pose corporal y silueta textil...";
    case "WARPING":
      return isEn ? "Calculating 2D/3D cloth deformation warp..." : "Ajustando deformación y caída de tela...";
    case "INPAINTING":
      return isEn ? "Synthesizing realistic texture inpainting..." : "Sintetizando texturas y sombras fotorrealistas...";
    case "FINALIZING":
      return isEn ? "Finalizing high-resolution rendering..." : "Finalizando renderizado de alta resolución...";
    default:
      return isEn ? "Processing with AI Neural Engine..." : "Procesando con Motor Neuronal de IA...";
  }
}

function renderWalkthrough() {
  if (!elements.walkthroughCardContainer || !elements.walkthroughDotsContainer) return;

  // Render Dots
  while (elements.walkthroughDotsContainer.firstChild) {
    elements.walkthroughDotsContainer.removeChild(elements.walkthroughDotsContainer.firstChild);
  }

  for (let i = 1; i <= state.walkthrough.totalSteps; i++) {
    const dot = document.createElement("button");
    dot.className = "walkthrough-dot" + (state.walkthrough.currentStep === i ? " active" : "");
    dot.setAttribute("aria-label", `Paso ${i}`);
    dot.addEventListener("click", () => {
      state.walkthrough.currentStep = i;
      renderWalkthrough();
    });
    elements.walkthroughDotsContainer.appendChild(dot);
  }

  // Render Card
  const step = WALKTHROUGH_STEPS_DATA.find((s) => s.stepNumber === state.walkthrough.currentStep) || WALKTHROUGH_STEPS_DATA[0];
  const langKey = state.lang === "es-419" ? "es" : "en";

  while (elements.walkthroughCardContainer.firstChild) {
    elements.walkthroughCardContainer.removeChild(elements.walkthroughCardContainer.firstChild);
  }

  const card = document.createElement("div");
  card.className = "walkthrough-card";

  // Media box
  const mediaBox = document.createElement("div");
  mediaBox.className = "walkthrough-media-box";
  const img = document.createElement("img");
  img.className = "walkthrough-media-img";
  img.src = step.image;
  img.alt = step.title[langKey];
  mediaBox.appendChild(img);

  // Info box
  const infoBox = document.createElement("div");
  infoBox.className = "walkthrough-info-box";

  const badge = document.createElement("span");
  badge.className = "walkthrough-step-badge";
  badge.textContent = step.badge[langKey];

  const title = document.createElement("h3");
  title.className = "walkthrough-step-title";
  title.textContent = step.title[langKey];

  const sub = document.createElement("div");
  sub.className = "walkthrough-step-sub";
  sub.textContent = step.subtitle[langKey];

  const desc = document.createElement("p");
  desc.className = "walkthrough-step-desc";
  desc.textContent = step.description[langKey];

  const tech = document.createElement("div");
  tech.className = "walkthrough-tech-box";
  tech.textContent = step.technicalDetails[langKey];

  infoBox.appendChild(badge);
  infoBox.appendChild(title);
  infoBox.appendChild(sub);
  infoBox.appendChild(desc);
  infoBox.appendChild(tech);

  card.appendChild(mediaBox);
  card.appendChild(infoBox);
  elements.walkthroughCardContainer.appendChild(card);
}

function renderHonestyMatrix() {
  if (!elements.honestyTableContainer) return;
  const langKey = state.lang === "es-419" ? "es" : "en";

  while (elements.honestyTableContainer.firstChild) {
    elements.honestyTableContainer.removeChild(elements.honestyTableContainer.firstChild);
  }

  const table = document.createElement("table");
  table.className = "honesty-table";

  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");

  const thFeature = document.createElement("th");
  thFeature.textContent = t("honesty.col_feature");
  const thStatus = document.createElement("th");
  thStatus.textContent = t("honesty.col_status");
  const thDetail = document.createElement("th");
  thDetail.textContent = t("honesty.col_detail");

  trHead.appendChild(thFeature);
  trHead.appendChild(thStatus);
  trHead.appendChild(thDetail);
  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (const row of HONESTY_DATA) {
    const tr = document.createElement("tr");

    const tdFeature = document.createElement("td");
    tdFeature.style.fontWeight = "600";
    tdFeature.textContent = row.feature[langKey];

    const tdStatus = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "honesty-badge " + (row.status === "IMPLEMENTED" ? "honesty-badge-implemented" : "honesty-badge-not-implemented");
    badge.textContent = row.status;
    tdStatus.appendChild(badge);

    const tdDetail = document.createElement("td");
    tdDetail.style.color = "var(--text-secondary)";
    tdDetail.textContent = row.detail[langKey];

    tr.appendChild(tdFeature);
    tr.appendChild(tdStatus);
    tr.appendChild(tdDetail);
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  elements.honestyTableContainer.appendChild(table);
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
      model3DUrl: "assets/3d/apparel/polera-essential.gltf",
      model3DFormat: "gltf",
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
      model3DUrl: "assets/3d/footwear/pro-carbon-racer.glb",
      model3DFormat: "glb",
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
      model3DUrl: "assets/3d/apparel/silk-evening-dress.gltf",
      model3DFormat: "gltf",
      defaultArUrn: "urn:tentaciones:ar:apparel:silk-evening-dress",
      variants: [
        { sku: "SED-NOIR-M", color: "Noir Velvet", size: "M", priceCLP: 139990, stock: 12 },
      ],
    },
  ];
}

document.addEventListener("DOMContentLoaded", initApp);
