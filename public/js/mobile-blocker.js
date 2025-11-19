/**
 * Mobile Blocker - Bloqueia funcionalidades JavaScript em dispositivos móveis
 * Mantém a responsividade visual mas desabilita todas as interações
 */

(function() {
    'use strict';
    
    /**
     * Detecta se o dispositivo é móvel usando múltiplas técnicas
     * @returns {boolean} true se for dispositivo móvel
     */
    function isMobileDevice() {
        // Verifica user agent
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i;
        
        // Verifica se é touch device
        const isTouchDevice = ('ontouchstart' in window) || 
                              (navigator.maxTouchPoints > 0) || 
                              (navigator.msMaxTouchPoints > 0);
        
        // Verifica largura da tela (tablets e celulares geralmente têm menos de 1024px)
        const isSmallScreen = window.innerWidth < 1024;
        
        // Combina as verificações
        return mobileRegex.test(userAgent) || (isTouchDevice && isSmallScreen);
    }
    
    /**
     * Cria e exibe o overlay de bloqueio
     */
    function createBlockOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'mobile-block-overlay';
        overlay.innerHTML = `
            <div class="mobile-block-content">
                <div class="mobile-block-icon">
                    <i class="bi bi-phone-fill"></i>
                    <i class="bi bi-slash-circle"></i>
                </div>
                <h2>Acesso Restrito</h2>
                <p>Este sistema está disponível apenas para dispositivos desktop.</p>
                <p class="mobile-block-subtitle">
                    Por favor, acesse através de um computador para utilizar todas as funcionalidades.
                </p>
                <div class="mobile-block-info">
                    <i class="bi bi-info-circle"></i>
                    <span>O layout está otimizado, mas as interações estão desabilitadas em dispositivos móveis.</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        document.body.classList.add('mobile-blocked');
    }
    
    /**
     * Desabilita todos os scripts existentes
     */
    function disableScripts() {
        // Previne execução de event listeners
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            // Permite apenas eventos internos do navegador
            if (this === window && type === 'load') {
                return originalAddEventListener.call(this, type, listener, options);
            }
            // Bloqueia todos os outros eventos
            console.warn(`[Mobile Blocker] Event listener bloqueado: ${type}`);
            return;
        };
        
        // Bloqueia clicks
        document.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        }, true);
        
        // Bloqueia submits
        document.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        }, true);
        
        // Bloqueia inputs
        document.addEventListener('input', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        }, true);
        
        // Bloqueia teclas
        document.addEventListener('keydown', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        }, true);
        
        // Bloqueia touch events
        document.addEventListener('touchstart', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        }, { passive: false, capture: true });
        
        // Desabilita todos os botões, inputs e links
        window.addEventListener('load', function() {
            const interactiveElements = document.querySelectorAll('button, input, select, textarea, a');
            interactiveElements.forEach(element => {
                element.style.pointerEvents = 'none';
                element.style.opacity = '0.6';
                element.setAttribute('disabled', 'disabled');
            });
        });
    }
    
    /**
     * Adiciona estilos CSS para o overlay de bloqueio
     */
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Mobile Block Overlay Styles */
            #mobile-block-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(10px);
                animation: fadeIn 0.3s ease-in;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .mobile-block-content {
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                border-radius: 20px;
                padding: 3rem 2rem;
                max-width: 90%;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.4s ease-out;
            }
            
            @keyframes slideUp {
                from {
                    transform: translateY(50px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            .mobile-block-icon {
                position: relative;
                width: 100px;
                height: 100px;
                margin: 0 auto 2rem;
                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 10px 30px rgba(220, 53, 69, 0.4);
            }
            
            .mobile-block-icon i {
                font-size: 3rem;
                color: white;
            }
            
            .mobile-block-icon i:first-child {
                position: absolute;
            }
            
            .mobile-block-icon i:last-child {
                position: absolute;
                font-size: 4rem;
                opacity: 0.9;
            }
            
            .mobile-block-content h2 {
                color: #212529;
                margin-bottom: 1rem;
                font-weight: 700;
                font-size: 1.75rem;
            }
            
            .mobile-block-content p {
                color: #495057;
                margin-bottom: 1rem;
                line-height: 1.6;
                font-size: 1.1rem;
            }
            
            .mobile-block-subtitle {
                color: #6c757d !important;
                font-size: 1rem !important;
                margin-bottom: 2rem !important;
            }
            
            .mobile-block-info {
                background: #e7f3ff;
                border-left: 4px solid #0d6efd;
                padding: 1rem;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-top: 2rem;
            }
            
            .mobile-block-info i {
                color: #0d6efd;
                font-size: 1.5rem;
                flex-shrink: 0;
            }
            
            .mobile-block-info span {
                color: #495057;
                font-size: 0.9rem;
                text-align: left;
                line-height: 1.5;
            }
            
            body.mobile-blocked {
                overflow: hidden;
            }
            
            /* Desabilita pointer events em todos os elementos quando bloqueado */
            body.mobile-blocked * {
                cursor: not-allowed !important;
            }
            
            /* Mantém o overlay clicável (embora não faça nada) */
            #mobile-block-overlay,
            #mobile-block-overlay * {
                cursor: default !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Inicializa o bloqueio para dispositivos móveis
     */
    function initMobileBlocker() {
        if (isMobileDevice()) {
            console.warn('[Mobile Blocker] Dispositivo móvel detectado - Bloqueando funcionalidades');
            
            // Injeta estilos
            injectStyles();
            
            // Desabilita scripts e eventos
            disableScripts();
            
            // Cria overlay quando o DOM estiver pronto
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', createBlockOverlay);
            } else {
                createBlockOverlay();
            }
            
            return true;
        }
        
        console.log('[Mobile Blocker] Dispositivo desktop detectado - Funcionalidades habilitadas');
        return false;
    }
    
    // Executa imediatamente
    window.isMobileBlocked = initMobileBlocker();
    
    // Previne que outros scripts ignorem o bloqueio
    Object.defineProperty(window, 'isMobileBlocked', {
        writable: false,
        configurable: false
    });
    
})();
