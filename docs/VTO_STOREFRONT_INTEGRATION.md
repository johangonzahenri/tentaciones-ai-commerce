# CANONICAL DOCUMENT: VTO STOREFRONT EXPERIENCE INTEGRATION

STATUS: CERTIFIED
VERSION: 1.6.5
PROJECT: PROJ-01-TENTACIONES (tentaciones-ai-commerce)
OWNER: Principal Full-Stack & UX Integration Engineer

---

## 1. RESUMEN EJECUTIVO

Este documento certifica la integraciÃ³n de la experiencia de usuario (Storefront UI) con el motor de **AI Virtual Try-On (VTO)** en **Tentaciones AI Commerce**. Conecta la arquitectura probada del backend (`VTOExecutionGateway`, `TryOnImagePipeline`, `VirtualTryOnService`) directamente con la interfaz visual interactiva en el navegador del cliente.

---

## 2. ARQUITECTURA DE INTEGRACIÃ“N FRONTEND-BACKEND

La integraciÃ³n opera sobre un flujo desacoplado, asÃ­ncrono y resiliente:

```text
[ Storefront UI (Vanilla JS) ]
              â”‚
              â”œâ”€â”€ 1. POST /api/vto/assess (ValidaciÃ³n tÃ©cnica instantÃ¡nea de bytes e imagen)
              â”‚       â””â”€â”€ TryOnImagePipeline -> QualityAssessment (EXCELLENT | ACCEPTABLE | WARNING | REJECT)
              â”‚
              â”œâ”€â”€ 2. POST /api/vto/generate (EnvÃ­o de orden de inferencia)
              â”‚       â””â”€â”€ VirtualTryOnService -> VTOExecutionGateway -> Job Submission
              â”‚
              â”œâ”€â”€ 3. GET /api/vto/status/:id (Polling acotado con progreso visual)
              â”‚       â””â”€â”€ Bounded Poller (Intervalo adaptativo 800ms)
              â”‚
              â””â”€â”€ 4. GET /api/vto/result/:id (RecuperaciÃ³n y renderizado seguro)
                      â””â”€â”€ NormalizaciÃ³n de talla sugerida y descargo de responsabilidad (Disclaimer)
```

---

## 3. MÃQUINA DE ESTADOS FINITOS DEL STOREFRONT (UI STATE MACHINE)

El controlador en `public/app.js` implementa una mÃ¡quina de estados determinista (`setVTOUIState`):

```text
       â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
       â”‚     IDLE      â”‚â—„â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
       â””â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜                              â”‚
               â”‚ (Upload Photo)                       â”‚
               â–¼                                      â”‚
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                          â”‚
    â”‚   VALIDATING_INPUT   â”‚                          â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                          â”‚
               â”‚                                      â”‚
       â”Œâ”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                      â”‚
       â–¼                       â–¼                      â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”             â”‚
â”‚ QUALITY_REJECTâ”‚      â”‚ QUALITY_WARNING â”‚             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜             â”‚
                               â”‚                      â”‚
                               â–¼                      â”‚
                        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”              â”‚
                        â”‚    READY     â”‚              â”‚
                        â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜              â”‚
                               â”‚ (Click Generate)     â”‚
                               â–¼                      â”‚
                        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”              â”‚
                        â”‚  EXECUTING   â”‚              â”‚
                        â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜              â”‚
                               â”‚ (Job Created)        â”‚
                               â–¼                      â”‚
                        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”              â”‚
                        â”‚   POLLING    â”‚              â”‚
                        â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜              â”‚
               â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”‚
               â–¼                               â–¼      â”‚
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
        â”‚   SUCCESS    â”‚                â”‚  FAILED  â”œâ”€â”€â”˜
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 4. GESTIÃ“N DE MEMORIA Y CICLO DE VIDA DE OBJECT URL

Para evitar fugas de memoria (memory leaks) en navegadores mÃ³viles y de escritorio, el frontend aplica la funciÃ³n canÃ³nica `releaseVTOObjectUrl()`:

1. **Subida de nueva foto:** La URL previa generada con `URL.createObjectURL` se revoca antes de crear la nueva referencia.
2. **EliminaciÃ³n voluntaria:** Al presionar "Quitar", se invoca inmediatamente `releaseVTOObjectUrl()`.
3. **Cierre de modal:** Al cerrar el modal (`closeVTOModal`), se libera cualquier blob asignado y se resetea el canvas.
4. **CancelaciÃ³n de trabajo:** Si el usuario aborta durante el procesamiento, se revoca la referencia y se emite seÃ±al de cancelaciÃ³n al backend.

---

## 5. POLÃTICA DE PRIVACIDAD Y ZERO-DATA RETENTION

- **Consentimiento Previo (Consent Gate):** Es obligatorio aceptar el consentimiento de privacidad antes de acceder a la selecciÃ³n de fotografÃ­as.
- **Efimeridad Absoluta:** Las imÃ¡genes del usuario no se almacenan en servidores locales ni bases de datos. Los streams de datos base64 son descartados inmediatamente tras la inferencia.
- **RedacciÃ³n de Credenciales:** Cualquier mensaje o error proveniente del backend es saneado mediante `redactVTOSecrets` para impedir la exposiciÃ³n accidental de tokens.
