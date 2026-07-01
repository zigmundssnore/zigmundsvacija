document.addEventListener('DOMContentLoaded', () => {
 
    // =========================
    // WhatsApp poga: pirmās 3 sek izvērsta ar tekstu, tad sakļaujas (mobilajā)
    // =========================
    const waFloat = document.querySelector('.whatsapp-float');
    if (waFloat) {
        waFloat.classList.add('intro');
        setTimeout(() => waFloat.classList.remove('intro'), 3000);
    }

        // =========================
    // Gallery numuri + WhatsApp poga
    // =========================
    const waNumber = '37122811564';
    document.querySelectorAll('.gallery-container .gallery-item').forEach((item, i) => {
        const num = i + 1;
        const info = item.querySelector('.image-info');
        if (!info) return;
 
        const numEl = document.createElement('p');
        numEl.className = 'gallery-number';
        numEl.textContent = 'Nr. ' + num;
        info.insertBefore(numEl, info.firstChild);


    });
 
        // =========================
    // Delivery Modal
    // =========================
    const deliveryOverlay = document.getElementById('deliveryOverlay');
    const modalKlatiene = document.getElementById('modalKlatiene');
    const modalOmniva = document.getElementById('modalOmniva');
 
    function openDeliveryModal(num) {
        const msgKlatiene = encodeURIComponent('Sveiki, vēlos iegādāties un saņemt klātienē gleznu Nr.' + num + '. Vai tā ir pieejama?');
        const msgOmniva = encodeURIComponent('Sveiki, vēlos iegādāties un saņemt ar pakomātu gleznu Nr.' + num + '. Vai tā ir pieejama?');
        modalKlatiene.href = 'https://wa.me/' + waNumber + '?text=' + msgKlatiene;
        modalOmniva.href = 'https://wa.me/' + waNumber + '?text=' + msgOmniva;
 
        const frameNote = document.getElementById('modalFrameNote');
        const modalIeramet = document.getElementById('modalIeramet');
        const allGalleryItems = Array.from(document.querySelectorAll('.gallery-container .gallery-item'));
        const clickedItem = allGalleryItems[num - 1];
        const isFramed = clickedItem?.dataset.category === 'ieramettas';
        if (frameNote) frameNote.style.display = isFramed ? 'none' : 'block';
        if (modalIeramet) {
            const msgIeramet = encodeURIComponent('Sveiki, vēlos iegādāties gleznu Nr.' + num + ' rāmī. Vai tā būtu pieejama?');
            modalIeramet.href = 'https://wa.me/' + waNumber + '?text=' + msgIeramet;
        }
 
        deliveryOverlay.classList.add('open');
        document.body.classList.add('modal-open');
        history.pushState({ modal: true }, document.title, location.href);
    }
 
    function closeDeliveryModal() {
        deliveryOverlay.classList.remove('open');
        document.body.classList.remove('modal-open');
    }
 
    document.getElementById('deliveryModalClose')?.addEventListener('click', closeDeliveryModal);
    deliveryOverlay?.addEventListener('click', (e) => {
        if (e.target === deliveryOverlay) closeDeliveryModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDeliveryModal();
    });
 
    // =========================
    // Gallery Tabs
    // =========================
    const tabs = document.querySelectorAll('.gallery-tab');
    const allItems = document.querySelectorAll('.gallery-container .gallery-item');
 
    function switchTab(tabName) {
        tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
        allItems.forEach(item => {
            const hide = item.dataset.category !== tabName;
            item.classList.toggle('hidden', hide);
            if (!hide) item.classList.add('visible');
        });
        if (typeof layoutMasonry === 'function') layoutMasonry();
        updateLightboxItems();
    }
 
    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // =========================
    // Masonry izkārtojums — bildes plūst pa RINDĀM (lasīšanas secībā):
    // 1. bilde augšā pa kreisi, 2. tai pa labi utt. (round-robin pa kolonnām)
    // =========================
    const galleryEl = document.querySelector('.gallery-container');
    const originalOrder = Array.from(allItems);  // sākotnējā secība (priekš "Nekārtot")

    // gleznas ar JAUNUMS ("data-new") vienmēr pirmās (stabili — saglabā secību grupās)
    const applyNewFirst = arr => {
        const isNew = it => it.dataset.new === 'true';
        return [...arr.filter(isNew), ...arr.filter(it => !isNew(it))];
    };
    let currentOrder = applyNewFirst(originalOrder.slice());

    // atklājam pašreizējo secību lentei (cits scope) — pieaug pēc katras kārtošanas
    let orderVersion = 0;
    window.__galleryOrder = () => currentOrder;
    window.__galleryOrderVersion = () => orderVersion;

    const columnCount = () => (window.innerWidth >= 769 ? 4 : 2);

    function layoutMasonry() {
        if (!galleryEl) return;
        const cols = columnCount();
        galleryEl.textContent = '';
        const colEls = [];
        for (let i = 0; i < cols; i++) {
            const c = document.createElement('div');
            c.className = 'gallery-col';
            colEls.push(c);
            galleryEl.appendChild(c);
        }
        currentOrder
            .filter(it => !it.classList.contains('hidden'))
            .forEach((it, i) => colEls[i % cols].appendChild(it));
    }

    let lastCols = columnCount();
    window.addEventListener('resize', () => {
        const c = columnCount();
        if (c !== lastCols) { lastCols = c; layoutMasonry(); }
    });

        // =========================
    // "Uz augšu" poga
    // =========================
    const toTop = document.getElementById('toTop');
    if (toTop) {
        const toggleToTop = () => toTop.classList.toggle('show', window.scrollY > 600);
        window.addEventListener('scroll', toggleToTop, { passive: true });
        toggleToTop();
        toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // =========================
    // Scrollspy — izgaismo aktīvo sadaļu navigācijā
    // =========================
    const navLinks = document.querySelectorAll('header nav ul li a');
    const sectionLinkMap = {};
    navLinks.forEach(link => {
        const id = (link.getAttribute('href') || '').slice(1);
        const sec = document.getElementById(id);
        if (sec) sectionLinkMap[id] = link;
    });
    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(l => l.classList.remove('active'));
                sectionLinkMap[entry.target.id]?.classList.add('active');
            }
        });
    }, { rootMargin: '-35% 0px -55% 0px' });
    Object.keys(sectionLinkMap).forEach(id => spyObserver.observe(document.getElementById(id)));

    // =========================
    // Galerijas bilžu fade-in pēc ielādes
    // =========================
    document.querySelectorAll('.gallery-container .gallery-item img').forEach(img => {
        const markLoaded = () => img.classList.add('img-loaded');
        if (img.complete && img.naturalWidth > 0) markLoaded();
        else img.addEventListener('load', markLoaded, { once: true });
    });

    // =========================
    // 3D tilt galerijas kartiņām (tikai ar peli)
    // =========================
    if (window.matchMedia('(pointer: fine)').matches &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.querySelectorAll('.gallery-container .gallery-item').forEach(item => {
            item.addEventListener('mousemove', (e) => {
                const r = item.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                item.style.transition = 'transform 0.12s ease-out';
                item.style.transform =
                    'perspective(900px) rotateX(' + (-py * 6).toFixed(2) + 'deg)' +
                    ' rotateY(' + (px * 6).toFixed(2) + 'deg) translateY(-4px)';
            });
            item.addEventListener('mouseleave', () => {
                item.style.transition = '';
                item.style.transform = '';
            });
        });
    }
 
    // =========================
    // Gallery Lightbox + Swipe
    // =========================
    // ORIĢINĀLĀ secība (nevis masonry kolonnu secība) — lai "Nr. X",
    // #glezna-N saites un numerācija paliek pareizas pēc kārtošanas
    const galleryItems = Array.from(allItems);
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
 
    if (!lightbox || !lightboxImage || galleryItems.length === 0) return;
 
    let currentIndex = 0;
    let lightboxOpen = false;
    let isZoomed = false;
 
    lightboxImage.style.transition = 'opacity 0.15s ease';
 
    const zoomBtn = document.getElementById('lightboxZoom');

    // zoom poga dzīvo apakšējā info joslā kopā ar pārējām pogām —
    // tur tā vienmēr ir redzama gan telefonā, gan datorā
    const lbInfoBar = document.querySelector('.lightbox-info');
    const lbActions = document.querySelector('.lb-info-actions') || lbInfoBar;
    if (zoomBtn && lbActions) {
        lbActions.insertBefore(zoomBtn, document.getElementById('lightboxInquire'));
    }

    // =========================
    // Dubultklikšķis uz gleznas = like + liela sirds pār ekrānu
    // =========================




    const lbCounter = document.getElementById('lightboxCounter');
    const lbName = document.getElementById('lightboxName');
    const lbPrice = document.getElementById('lightboxPrice');
    const lbInquire = document.getElementById('lightboxInquire');

    function visibleGalleryItems() {
        // seko pašreizējai kārtošanas/masonry secībai (currentOrder),
        // nevis oriģinālajai — lai bultiņas iet sakārtotā secībā
        return currentOrder.filter(it => !it.classList.contains('hidden'));
    }

    function updateLightboxInfo() {
        const item = galleryItems[currentIndex];
        if (!item) return;
        const name = item.querySelector('.image-name')?.textContent || '';
        const price = item.querySelector('.image-size')?.textContent || '';
        if (lbName) lbName.textContent = 'Nr. ' + (currentIndex + 1) + ' · ' + name;
        if (lbPrice) lbPrice.textContent = price;
        // ierāmētajām gleznām nav ko ierāmēt — tikai "Saņemšana"
        const lbInq = document.getElementById('lightboxInquire');
        if (lbInq) lbInq.textContent = item.dataset.category === 'ieramettas'
            ? 'Saņemšana'
            : 'Saņemšana & ierāmēšana';
        const vis = visibleGalleryItems();
        const pos = vis.indexOf(item);
        if (lbCounter) lbCounter.textContent = (pos >= 0 ? pos + 1 : 1) + ' / ' + vis.length;
    }

    // izsaukts arī no switchTab — atjauno info, ja lightbox atvērts cilnes maiņas brīdī
    function updateLightboxItems() {
        if (lightboxOpen) updateLightboxInfo();
    }

    lbInquire?.addEventListener('click', (e) => {
        e.stopPropagation();
        openDeliveryModal(currentIndex + 1);
    });

    document.getElementById('lightboxShare')?.addEventListener('click', (e) => {
        e.stopPropagation();
        shareGlezna(currentIndex + 1);
    });
 
    function updateZoomButton() {
        const item = galleryItems[currentIndex];
        const isFramed = item?.dataset.category === 'ieramettas';
        if (zoomBtn) {
            zoomBtn.style.display = isFramed ? 'block' : 'none';
            zoomBtn.textContent = '🔍 Pietuvināt';
            isZoomed = false;
        }
    }
 
    if (zoomBtn) {
        zoomBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = galleryItems[currentIndex];
            const img = item.querySelector('img');
            const mainSrc = img.getAttribute('data-src') || img.getAttribute('src');
            if (!isZoomed) {
                const zoomSrc = mainSrc.replace('.webp', 'nr2.webp');
                lightboxImage.style.opacity = '0';
                setTimeout(() => {
                    lightboxImage.src = zoomSrc;
                    lightboxImage.style.opacity = '1';
                }, 150);
                zoomBtn.textContent = '← Atpakaļ';
                isZoomed = true;
            } else {
                lightboxImage.style.opacity = '0';
                setTimeout(() => {
                    lightboxImage.src = mainSrc;
                    lightboxImage.style.opacity = '1';
                }, 150);
                zoomBtn.textContent = '🔍 Pietuvināt';
                isZoomed = false;
            }
        });
    }
 
    function openLightbox(index) {
        currentIndex = index;
        lbTapTime = 0; // tīrs starts dubultklikšķa uztveršanai lightboxā
        const img = galleryItems[currentIndex].querySelector('img');
        lightboxImage.src = img.getAttribute('data-src') || img.getAttribute('src');
        lightbox.style.display = 'flex';
        lightboxOpen = true;
        document.body.classList.add('lightbox-open');
        updateZoomButton();
        updateLightboxInfo();
        const openedItem = galleryItems[index];
        if (openedItem?.dataset.category === 'ieramettas') {
            const preload = new Image();
            preload.src = (img.getAttribute('data-src') || img.getAttribute('src')).replace('.webp', 'nr2.webp');
        }
        history.pushState({ lightbox: true }, document.title, location.href);
    }
 
    function closeLightbox() {
        lightbox.style.display = 'none';
        lightboxOpen = false;
        document.body.classList.remove('lightbox-open');
        history.pushState(null, document.title, location.href);
    }
 
    function stepLightbox(dir) {
        const vis = visibleGalleryItems();
        if (!vis.length) return;
        let pos = vis.indexOf(galleryItems[currentIndex]);
        if (pos < 0) pos = 0;
        pos = (pos + dir + vis.length) % vis.length;
        currentIndex = galleryItems.indexOf(vis[pos]);
        lightboxImage.style.opacity = '0';
        setTimeout(() => {
            const img = galleryItems[currentIndex].querySelector('img');
            lightboxImage.src = img.getAttribute('data-src') || img.getAttribute('src');
            lightboxImage.style.opacity = '1';
            updateZoomButton();
            updateLightboxInfo();
        }, 150);
    }

    function showNext() { stepLightbox(1); }
 
    function showPrev() { stepLightbox(-1); }
 
    // viens klikšķis (pēc 280 ms nogaides) = atvērt; dubultklikšķis = like
    // indeksu rēķinām dinamiski, lai kārtošana (DOM pārkārtošana) nesalūst
    galleryItems.forEach((item) => {
        item.style.cursor = 'pointer';
        let pressTimer = null;
        item.addEventListener('click', () => {
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            } else {
                pressTimer = setTimeout(() => {
                    pressTimer = null;
                    openLightbox(galleryItems.indexOf(item));
                }, 280);
            }
        });
    });
 
    document.querySelector('.lightbox .close')?.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLightbox();
    });
 
    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) closeLightbox();
    });
 
    document.addEventListener('keydown', (event) => {
        if (!lightboxOpen) return;
        if (event.key === 'Escape') closeLightbox();
        if (event.key === 'ArrowRight') showNext();
        if (event.key === 'ArrowLeft') showPrev();
    });
 
    history.pushState(null, document.title, location.href);
    window.onpopstate = () => {
        if (deliveryOverlay?.classList.contains('open')) {
            closeDeliveryModal();
        } else if (lightboxOpen) {
            closeLightbox();
        } else {
            history.pushState(null, document.title, location.href);
        }
    };
 
    document.querySelector('.lightbox-prev')?.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrev();
    });
    document.querySelector('.lightbox-next')?.addEventListener('click', (e) => {
        e.stopPropagation();
        showNext();
    });
 
    let touchStartX = 0;
    let touchStartY = 0;
 
    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
 
    lightbox.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) < Math.abs(dy) || Math.abs(dx) < 50) return;
        if (dx < 0) showNext();
        else showPrev();
    }, { passive: true });
 
    // =========================
    // Tiešā saite: #glezna-N atver konkrēto gleznu lightboxā
    // =========================
    const deepLink = location.hash.match(/^#glezna-(\d+)$/);
    if (deepLink) {
        const idx = parseInt(deepLink[1], 10) - 1;
        if (galleryItems[idx]) {
            const cat = galleryItems[idx].dataset.category;
            if (galleryItems[idx].classList.contains('hidden')) switchTab(cat);
            setTimeout(() => openLightbox(idx), 350);
        }
    }

    // =========================
    // Scroll Reveal
    // =========================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
 
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
 
    document.querySelectorAll('.gallery-item').forEach((item, i) => {
        item.classList.add('reveal');
        item.style.setProperty('--i', i % 8);
        revealObserver.observe(item);
    });
 
});
