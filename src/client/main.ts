/**
 * Punto de entrada del cliente (`src/client/main.ts`).
 * Gestiona la apertura del sobre postal, el inicio/cierre de sesión contra `/api/auth/*`
 * y la carga protegida del mixtape desde `/api/mixtape`.
 */

import './styles.css';
import type {
  AuthSessionResponse,
  MixtapeResponse,
  NavigationTab,
} from '../shared/types';
import {
  renderLoadingMixtapeState,
  renderMixtapeScrapbook,
} from './render-mixtape';

let isEnvelopeOpen = false;
let isSubmittingAuth = false;
let currentTab: NavigationTab = 'carta';

function apiUrl(endpointPath: string): string {
  const isSubpath =
    window.location.pathname === '/thinking-about-you' ||
    window.location.pathname.startsWith('/thinking-about-you/');
  return isSubpath ? `/thinking-about-you${endpointPath}` : endpointPath;
}

const loginView = document.getElementById('loginView') as HTMLElement | null;
const mixtapeView = document.getElementById('mixtapeView') as HTMLElement | null;
const envelopeCard = document.getElementById('envelopeCard') as HTMLElement | null;
const frontDecorative = document.getElementById('frontDecorative') as HTMLElement | null;
const waxSeal = document.getElementById('waxSeal') as HTMLElement | null;
const letterCard = document.getElementById('letterCard') as HTMLElement | null;
const envelopeHeading = document.getElementById('envelopeHeading') as HTMLElement | null;
const subInstruction = document.getElementById('subInstruction') as HTMLElement | null;
const authForm = document.getElementById('authForm') as HTMLFormElement | null;
const passInput = document.getElementById('passInput') as HTMLInputElement | null;
const btnTogglePass = document.getElementById('btnTogglePass') as HTMLButtonElement | null;
const btnUnlock = document.getElementById('btnUnlock') as HTMLButtonElement | null;
const btnUnlockText = document.getElementById('btnUnlockText') as HTMLElement | null;
const authError = document.getElementById('authError') as HTMLElement | null;
const authErrorMessage = document.getElementById('authErrorMessage') as HTMLElement | null;
const authFeedback = document.getElementById('authFeedback') as HTMLElement | null;
const authFeedbackText = document.getElementById('authFeedbackText') as HTMLElement | null;

function openEnvelope(instant = false): void {
  if (isEnvelopeOpen) {
    return;
  }
  isEnvelopeOpen = true;

  envelopeCard?.classList.remove('ambient-envelope');

  const revealInnerLetter = (): void => {
    frontDecorative?.classList.add('hidden');
    frontDecorative?.classList.remove('envelope-front-closing');
    waxSeal?.classList.remove('wax-seal-opening');

    if (letterCard) {
      letterCard.classList.remove('hidden');
      letterCard.classList.add('flex', 'letter-extracted');
    }

    if (envelopeHeading) {
      envelopeHeading.textContent = 'Sello abierto con éxito';
    }
    if (subInstruction) {
      subInstruction.textContent = 'Ingresa la clave secreta para desbloquear el sobre';
    }

    setTimeout(() => {
      passInput?.focus();
    }, 120);
  };

  if (instant) {
    revealInnerLetter();
    return;
  }

  waxSeal?.classList.add('wax-seal-opening');
  frontDecorative?.classList.add('envelope-front-closing');
  setTimeout(revealInnerLetter, 270);
}

function resetEnvelopeToClosed(): void {
  isEnvelopeOpen = false;
  isSubmittingAuth = false;
  loginView?.classList.remove('login-unlock-zoom');
  mixtapeView?.classList.remove('mixtape-unfold-enter');
  envelopeCard?.classList.add('ambient-envelope');
  waxSeal?.classList.remove('wax-seal-opening');
  frontDecorative?.classList.remove('hidden', 'envelope-front-closing');
  frontDecorative?.classList.add('envelope-front-enter');
  setTimeout(() => {
    frontDecorative?.classList.remove('envelope-front-enter');
  }, 450);
  if (letterCard) {
    letterCard.classList.add('hidden');
    letterCard.classList.remove('flex', 'letter-extracted');
  }
  if (envelopeHeading) {
    envelopeHeading.textContent = 'Tienes un correo sin abrir';
  }
  if (subInstruction) {
    subInstruction.textContent = 'Toca el sobre o el sello de para abrir el sobre';
  }
  if (passInput) {
    passInput.value = '';
    passInput.type = 'password';
  }
  authError?.classList.add('hidden');
  authFeedback?.classList.add('hidden');
  if (btnUnlock) {
    btnUnlock.disabled = false;
  }
  if (btnUnlockText) {
    btnUnlockText.textContent = 'Desbloquear y abrir carta';
  }
}

function showLoginError(message: string): void {
  if (authErrorMessage) {
    authErrorMessage.textContent = message;
  }
  authError?.classList.remove('hidden');
  authFeedback?.classList.add('hidden');

  if (passInput) {
    passInput.classList.add('border-rose-400', 'shake-anim');
    setTimeout(() => {
      passInput.classList.remove('shake-anim');
    }, 450);
  }
}

async function handleLoginSubmit(event: Event): Promise<void> {
  event.preventDefault();
  if (!isEnvelopeOpen) {
    openEnvelope();
    return;
  }
  if (isSubmittingAuth) {
    return;
  }

  const password = passInput?.value.trim() ?? '';

  if (!password) {
    showLoginError('Por favor ingresa la clave secreta para desbloquear.');
    passInput?.focus();
    return;
  }

  isSubmittingAuth = true;
  authError?.classList.add('hidden');
  if (btnUnlock) {
    btnUnlock.disabled = true;
  }
  if (btnUnlockText) {
    btnUnlockText.textContent = 'Verificando clave...';
  }

  try {
    const response = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        password,
      }),
    });

    const result = (await response.json()) as AuthSessionResponse;

    if (!response.ok || !result.authenticated) {
      isSubmittingAuth = false;
      if (btnUnlock) {
        btnUnlock.disabled = false;
      }
      if (btnUnlockText) {
        btnUnlockText.textContent = 'Desbloquear y abrir carta';
      }
      showLoginError(
        result.error || 'La clave secreta no es correcta. Pide una pista al remitente.'
      );
      passInput?.focus();
      return;
    }

    // Limpiar el campo de contraseña de inmediato de la memoria del input
    if (passInput) {
      passInput.value = '';
    }

    if (authFeedbackText) {
      authFeedbackText.textContent = 'Acceso verificado con cariño. Abriendo tu carta...';
    }
    authFeedback?.classList.remove('hidden');
    if (btnUnlockText) {
      btnUnlockText.textContent = 'Abriendo carta... 🎧';
    }

    await loadAndRenderMixtape(true);
  } catch {
    isSubmittingAuth = false;
    if (btnUnlock) {
      btnUnlock.disabled = false;
    }
    if (btnUnlockText) {
      btnUnlockText.textContent = 'Desbloquear y abrir carta';
    }
    showLoginError('No se pudo conectar con el servidor. Intenta de nuevo en unos segundos.');
  }
}

async function handleLogout(): Promise<void> {
  try {
    await fetch(apiUrl('/api/auth/logout'), {
      method: 'POST',
      credentials: 'same-origin',
    });
  } finally {
    // Limpiar inmediatamente los datos privados del DOM y memoria
    currentTab = 'carta';
    if (mixtapeView) {
      mixtapeView.innerHTML = '';
      mixtapeView.classList.add('hidden');
    }
    loginView?.classList.remove('hidden');
    document.title = 'Mixtape • Para ti';
    resetEnvelopeToClosed();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function bindMixtapeInteractions(): void {
  if (!mixtapeView) {
    return;
  }

  const btnLogout = document.getElementById('btnLogout');
  btnLogout?.addEventListener('click', () => {
    void handleLogout();
  });

  const btnRetrySpotify = document.getElementById('btnRetrySpotify');
  btnRetrySpotify?.addEventListener('click', () => {
    void loadAndRenderMixtape();
  });

  const navButtons = mixtapeView.querySelectorAll<HTMLButtonElement>('[data-nav-tab]');
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = (btn.getAttribute('data-nav-tab') as NavigationTab) || 'carta';
      currentTab = targetTab;

      navButtons.forEach((item) => {
        const isCurrent = item.getAttribute('data-nav-tab') === currentTab;
        item.setAttribute('aria-current', isCurrent ? 'page' : 'false');
        item.classList.toggle('bg-surface-container-high', isCurrent);
        item.classList.toggle('text-primary', isCurrent);
        item.classList.toggle('shadow-2xs', isCurrent);
        item.classList.toggle('text-on-surface-variant', !isCurrent);
        item.classList.toggle('hover:bg-surface-container-low', !isCurrent);
        item.classList.toggle('hover:text-on-surface', !isCurrent);
      });

      if (targetTab === 'notas') {
        const mixtapeAnchor = document.getElementById('section-mixtape');
        mixtapeAnchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (targetTab === 'mixtape') {
        const closingAnchor = document.getElementById('section-cierre');
        closingAnchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

async function loadAndRenderMixtape(animateUnlock = false): Promise<void> {
  if (!mixtapeView || !loginView) {
    return;
  }

  document.title = 'Mixtape • Para ti';

  if (animateUnlock) {
    loginView.classList.add('login-unlock-zoom');
  } else {
    loginView.classList.add('hidden');
    mixtapeView.classList.remove('hidden');
    mixtapeView.innerHTML = renderLoadingMixtapeState();
  }

  try {
    const fetchPromise = fetch(apiUrl('/api/mixtape'), {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    });

    if (animateUnlock) {
      await new Promise((resolve) => setTimeout(resolve, 520));
    }

    const response = await fetchPromise;

    if (response.status === 401) {
      // Sesión expirada o inválida: regresar a la pantalla de acceso
      mixtapeView.innerHTML = '';
      mixtapeView.classList.add('hidden');
      loginView.classList.remove('hidden', 'login-unlock-zoom');
      document.title = 'Mixtape • Para ti';
      resetEnvelopeToClosed();
      openEnvelope(true);
      showLoginError('Tu sesión expiró. Ingresa nuevamente la clave secreta.');
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as MixtapeResponse;
    loginView.classList.add('hidden');
    loginView.classList.remove('login-unlock-zoom');
    mixtapeView.classList.remove('hidden');
    mixtapeView.innerHTML = renderMixtapeScrapbook(data, currentTab);
    const mainCanvas = mixtapeView.querySelector('main');
    if (mainCanvas) {
      mainCanvas.classList.add('mixtape-unfold-enter');
      setTimeout(() => {
        mainCanvas.classList.remove('mixtape-unfold-enter');
      }, 720);
    }
    bindMixtapeInteractions();
    window.scrollTo({ top: 0, behavior: 'auto' });
  } catch {
    loginView.classList.add('hidden');
    loginView.classList.remove('login-unlock-zoom');
    mixtapeView.classList.remove('hidden');
    mixtapeView.innerHTML = `
      <div class="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <div class="max-w-md w-full bg-surface-container-lowest p-6 rounded-2xl shadow-md border border-[#edd6c1] space-y-4">
          <span class="material-symbols-outlined text-error text-[32px]">error</span>
          <h2 class="font-[Epilogue] text-[20px] font-semibold text-on-surface">
            No pudimos cargar el contenido de la carta
          </h2>
          <p class="font-[Literata] text-[13px] text-on-surface-variant italic">
            Verifica tu conexión e intenta cargar de nuevo.
          </p>
          <div class="flex items-center justify-center gap-3 pt-2">
            <button id="btnRetryFull" type="button" class="bg-primary text-on-primary font-[Plus_Jakarta_Sans] text-xs font-bold px-4 py-2 rounded-full cursor-pointer">
              Reintentar
            </button>
            <button id="btnBackLogin" type="button" class="bg-surface-container-high text-on-surface font-[Plus_Jakarta_Sans] text-xs font-bold px-4 py-2 rounded-full cursor-pointer">
              Volver al sobre
            </button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('btnRetryFull')?.addEventListener('click', () => {
      void loadAndRenderMixtape();
    });
    document.getElementById('btnBackLogin')?.addEventListener('click', () => {
      void handleLogout();
    });
  } finally {
    isSubmittingAuth = false;
  }
}

async function checkInitialSession(): Promise<void> {
  try {
    const response = await fetch(apiUrl('/api/auth/session'), {
      method: 'GET',
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      return;
    }
    const session = (await response.json()) as AuthSessionResponse;
    if (session.authenticated) {
      await loadAndRenderMixtape();
    }
  } catch {
    // Permanecer en la vista de sobre postal si no hay sesión
  }
}

function initClient(): void {
  frontDecorative?.addEventListener('click', () => {
    openEnvelope();
  });

  frontDecorative?.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openEnvelope();
    }
  });

  btnTogglePass?.addEventListener('click', () => {
    if (!passInput) {
      return;
    }
    passInput.type = passInput.type === 'password' ? 'text' : 'password';
    passInput.focus();
  });

  authForm?.addEventListener('submit', (event) => {
    void handleLoginSubmit(event);
  });

  void checkInitialSession();
}

/**
 * Recarga el contenido de `/api/mixtape` en caliente (HMR) conservando la posición
 * exacta de scroll y mostrando un indicador visual breve cuando se editan
 * archivos del servidor durante el desarrollo local.
 */
async function refreshMixtapeInPlace(changedFile?: string): Promise<void> {
  if (!mixtapeView || mixtapeView.classList.contains('hidden')) {
    return;
  }

  const previousScrollY = window.scrollY;
  try {
    const response = await fetch(apiUrl(`/api/mixtape?_t=${Date.now()}`), {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as MixtapeResponse;
    mixtapeView.innerHTML = renderMixtapeScrapbook(data, currentTab);
    bindMixtapeInteractions();
    window.scrollTo({ top: previousScrollY, behavior: 'instant' as ScrollBehavior });

    showLiveSupervisorToast(changedFile);
  } catch {
    // Ignorar errores transitorios mientras se guarda un archivo
  }
}

function showLiveSupervisorToast(changedFile?: string): void {
  const existing = document.getElementById('liveSupervisorToast');
  existing?.remove();

  const toast = document.createElement('div');
  toast.id = 'liveSupervisorToast';
  toast.className =
    'fixed top-16 right-4 z-[60] bg-[#25190c]/95 text-[#ffeedf] px-3.5 py-2 rounded-full shadow-lg border border-[#e06d53]/60 flex items-center gap-2 font-[Plus_Jakarta_Sans] text-[11px] font-bold transition-opacity duration-300 pointer-events-none';
  toast.innerHTML = `
    <span class="w-2 h-2 rounded-full bg-[#bbf37c] animate-ping"></span>
    <span>Actualizado en vivo${changedFile ? `: ${changedFile.split('/').pop()}` : ''}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 1800);
}

const viteHot = (
  import.meta as ImportMeta & {
    hot?: {
      on: (
        event: string,
        cb: (payload?: { file?: string; timestamp?: number }) => void
      ) => void;
    };
  }
).hot;

if (viteHot) {
  viteHot.on('mixtape:server-updated', (payload) => {
    void refreshMixtapeInPlace(payload?.file);
  });
}

initClient();
