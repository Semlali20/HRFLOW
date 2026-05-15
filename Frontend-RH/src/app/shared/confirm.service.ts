import { Injectable } from '@angular/core';

/**
 * Styled confirmation dialog that matches the InnovX HR design system.
 * Replaces native browser confirm() across all HR pages.
 *
 * Usage:
 *   async deleteXxx(item: any): Promise<void> {
 *     if (!(await this.confirmSvc.confirm(`Supprimer "${item.name}" ?`))) return;
 *     ...
 *   }
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {

  confirm(message: string, title = 'Confirmer l\'action'): Promise<boolean> {
    return new Promise(resolve => {

      // ── Inject keyframe styles once ──────────────────────────────────────
      if (!document.getElementById('_cf-styles')) {
        const s = document.createElement('style');
        s.id = '_cf-styles';
        s.textContent = `
          @keyframes _cfBackdropIn { from { opacity:0 } to { opacity:1 } }
          @keyframes _cfSlideIn    { from { opacity:0; transform:translate(-50%,-56%) scale(.96) }
                                     to   { opacity:1; transform:translate(-50%,-50%) scale(1) } }
          ._cf-btn-cancel:hover  { background:#E2E8F0 !important; }
          ._cf-btn-confirm:hover { background:#9F1239 !important; }
        `;
        document.head.appendChild(s);
      }

      // ── Backdrop ─────────────────────────────────────────────────────────
      const backdrop = document.createElement('div');
      Object.assign(backdrop.style, {
        position: 'fixed', inset: '0',
        background: 'rgba(10,20,35,.45)',
        zIndex: '9990',
        backdropFilter: 'blur(3px)',
        animation: '_cfBackdropIn .2s ease both',
      });

      // ── Dialog ───────────────────────────────────────────────────────────
      const dialog = document.createElement('div');
      Object.assign(dialog.style, {
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '420px',
        maxWidth: 'calc(100vw - 32px)',
        background: '#ffffff',
        borderRadius: '14px',
        boxShadow: '0 24px 64px rgba(10,20,35,.22)',
        zIndex: '9991',
        overflow: 'hidden',
        fontFamily: '\'Inter\', sans-serif',
        animation: '_cfSlideIn .22s cubic-bezier(.34,1.3,.64,1) both',
      });

      dialog.innerHTML = `
        <div style="padding:24px 24px 0;display:flex;align-items:flex-start;gap:16px">
          <div style="flex-shrink:0;width:46px;height:46px;border-radius:12px;
                      background:#FEF3C7;display:flex;align-items:center;justify-content:center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                 stroke="#D97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9"  x2="12"    y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div style="flex:1;min-width:0;padding-top:2px">
            <div style="font-size:15px;font-weight:700;color:#1A2B3C;margin-bottom:7px;
                        line-height:1.3">${title}</div>
            <div style="font-size:13.5px;color:#4A6080;line-height:1.55">${message}</div>
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;padding:22px 24px 24px">
          <button class="_cf-btn-cancel"
            style="padding:9px 22px;border:1.5px solid #E2E8F0;border-radius:9px;
                   background:#fff;font-size:13px;font-weight:600;color:#4A6080;
                   cursor:pointer;font-family:'Inter',sans-serif;transition:background .15s;
                   outline:none">
            Annuler
          </button>
          <button class="_cf-btn-confirm"
            style="padding:9px 22px;border:none;border-radius:9px;
                   background:#BE123C;font-size:13px;font-weight:600;color:#fff;
                   cursor:pointer;font-family:'Inter',sans-serif;transition:background .15s;
                   outline:none;display:flex;align-items:center;gap:7px">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
            Confirmer
          </button>
        </div>
      `;

      const cleanup = (result: boolean) => {
        if (document.body.contains(backdrop)) document.body.removeChild(backdrop);
        if (document.body.contains(dialog))   document.body.removeChild(dialog);
        document.removeEventListener('keydown', onKey);
        resolve(result);
      };

      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') cleanup(false);
        if (e.key === 'Enter')  cleanup(true);
      };

      backdrop.addEventListener('click', () => cleanup(false));
      dialog.querySelector('._cf-btn-cancel')!.addEventListener('click',  () => cleanup(false));
      dialog.querySelector('._cf-btn-confirm')!.addEventListener('click', () => cleanup(true));
      document.addEventListener('keydown', onKey);

      document.body.appendChild(backdrop);
      document.body.appendChild(dialog);

      // Focus the cancel button by default (safer UX)
      setTimeout(() => (dialog.querySelector('._cf-btn-cancel') as HTMLElement)?.focus(), 50);
    });
  }

  /**
   * Simple styled alert dialog (success / error / info).
   * Replaces Swal.fire() simple alerts across all HR pages.
   *
   * Usage:
   *   await this.confirmSvc.alert('Opération réussie.', 'Succès', 'success');
   *   await this.confirmSvc.alert('Une erreur est survenue.', 'Erreur', 'error');
   */
  alert(message: string, title = 'Information', type: 'success' | 'error' | 'info' = 'info', autoCloseMs?: number): Promise<void> {
    return new Promise(resolve => {

      if (!document.getElementById('_cf-styles')) {
        const s = document.createElement('style');
        s.id = '_cf-styles';
        s.textContent = `
          @keyframes _cfBackdropIn { from { opacity:0 } to { opacity:1 } }
          @keyframes _cfSlideIn    { from { opacity:0; transform:translate(-50%,-56%) scale(.96) }
                                     to   { opacity:1; transform:translate(-50%,-50%) scale(1) } }
          @keyframes _cfProgress   { from { width:100% } to { width:0% } }
          ._cf-btn-cancel:hover  { background:#E2E8F0 !important; }
          ._cf-btn-confirm:hover { background:#9F1239 !important; }
          ._cf-btn-ok:hover      { background:#155E59 !important; }
        `;
        document.head.appendChild(s);
      }

      const cfg = {
        success: {
          bg: '#D1FAE5', color: '#059669',
          icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                      stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                   <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                   <polyline points="22 4 12 14.01 9 11.01"/>
                 </svg>`,
          btnBg: '#1B7872', progressColor: '#059669',
        },
        error: {
          bg: '#FFE4E6', color: '#BE123C',
          icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                      stroke="#BE123C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                   <circle cx="12" cy="12" r="10"/>
                   <line x1="15" y1="9" x2="9" y2="15"/>
                   <line x1="9" y1="9" x2="15" y2="15"/>
                 </svg>`,
          btnBg: '#BE123C', progressColor: '#BE123C',
        },
        info: {
          bg: '#DBEAFE', color: '#1E40AF',
          icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                      stroke="#1E40AF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                   <circle cx="12" cy="12" r="10"/>
                   <line x1="12" y1="8"  x2="12" y2="12"/>
                   <line x1="12" y1="16" x2="12.01" y2="16"/>
                 </svg>`,
          btnBg: '#1B7872', progressColor: '#1E40AF',
        },
      }[type];

      const backdrop = document.createElement('div');
      Object.assign(backdrop.style, {
        position: 'fixed', inset: '0',
        background: 'rgba(10,20,35,.45)',
        zIndex: '9990',
        backdropFilter: 'blur(3px)',
        animation: '_cfBackdropIn .2s ease both',
      });

      const dialog = document.createElement('div');
      Object.assign(dialog.style, {
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '400px',
        maxWidth: 'calc(100vw - 32px)',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 24px 64px rgba(10,20,35,.22)',
        zIndex: '9991',
        overflow: 'hidden',
        fontFamily: '\'Inter\', sans-serif',
        animation: '_cfSlideIn .22s cubic-bezier(.34,1.3,.64,1) both',
      });

      dialog.innerHTML = `
        <div style="padding:36px 28px 28px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:16px">
          <div style="width:70px;height:70px;border-radius:50%;
                      background:${cfg.bg};display:flex;align-items:center;justify-content:center;
                      box-shadow:0 0 0 10px ${cfg.bg}88">
            ${cfg.icon}
          </div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <div style="font-size:18px;font-weight:800;color:#1A2B3C;letter-spacing:-0.3px">${title}</div>
            <div style="font-size:14px;color:#64748B;line-height:1.6;max-width:300px;margin:0 auto">${message}</div>
          </div>
        </div>
        ${autoCloseMs ? `
        <div style="height:3px;background:#F1F5F9;position:relative;overflow:hidden">
          <div style="position:absolute;left:0;top:0;height:100%;background:${cfg.progressColor};
                      animation:_cfProgress ${autoCloseMs}ms linear forwards"></div>
        </div>` : `
        <div style="padding:0 28px 28px;display:flex;justify-content:center">
          <button class="_cf-btn-ok"
            style="padding:11px 36px;border:none;border-radius:10px;
                   background:${cfg.btnBg};font-size:13.5px;font-weight:600;color:#fff;
                   cursor:pointer;font-family:'Inter',sans-serif;transition:background .15s;outline:none">
            OK
          </button>
        </div>`}
      `;

      const cleanup = () => {
        if (document.body.contains(backdrop)) document.body.removeChild(backdrop);
        if (document.body.contains(dialog))   document.body.removeChild(dialog);
        document.removeEventListener('keydown', onKey);
        resolve();
      };

      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Enter') cleanup();
      };

      backdrop.addEventListener('click', cleanup);
      const okBtn = dialog.querySelector('._cf-btn-ok');
      if (okBtn) okBtn.addEventListener('click', cleanup);
      document.addEventListener('keydown', onKey);

      document.body.appendChild(backdrop);
      document.body.appendChild(dialog);

      if (autoCloseMs) {
        setTimeout(cleanup, autoCloseMs);
      } else {
        setTimeout(() => (dialog.querySelector('._cf-btn-ok') as HTMLElement)?.focus(), 50);
      }
    });
  }
}
