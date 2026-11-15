/* ===========================================
   MAIN.JS — Inge, pianoles
   1. Tekst invullen vanuit content.json
   2. Header bij scrollen
   3. Contactformulier
   4. Start
=========================================== */

var MAIL_API_URL = 'https://vitis-mail-api.fly.dev/api/v1/contacts';
var MAIL_API_KEY = '167f32ce62f760611642670f90ea95776cab0379818126bb75634bdca51be76f';

/* Wordt gevuld zodra content.json geladen is */
var SITE_CONTENT = null;


/* ===========================================
   1. TEKST INVULLEN
=========================================== */

/* Laadt content.json. 'no-cache' zorgt dat een aanpassing direct zichtbaar is. */
async function loadContent() {
    var res = await fetch('content.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('content.json niet gevonden (HTTP ' + res.status + ')');
    return res.json();
}

/* Toont een duidelijke melding bovenaan de pagina als content.json niet werkt */
function showContentError(err) {
    console.error(err);
    var msg = el('p', 'content-error',
        'De teksten konden niet geladen worden. Controleer content.json op een vergeten komma ' +
        'of aanhalingsteken (tip: plak de inhoud op jsonlint.com). Details: ' + err.message);
    document.body.prepend(msg);
}

function injectContent(c) {
    var isContact = document.body.classList.contains('page-contact');
    document.title = isContact ? c.contact.titelPagina : c.site.titel;
    var meta = document.querySelector('meta[name="description"]');
    var beschrijving = isContact ? c.contact.beschrijving : c.site.beschrijving;
    if (meta && beschrijving) meta.content = beschrijving;

    // Foto's
    setSource('hero-foto-mobiel', c.hero.fotoMobiel);
    setImage('hero-foto', c.hero.foto, c.hero.fotoAlt);
    setImage('over-mij-foto', c.overMij.foto, c.overMij.fotoAlt);
    setImage('contact-foto', c.contact.foto, c.contact.fotoAlt);

    setText('site-naam', c.site.naam);
    setText('site-ondertitel', c.site.ondertitel);
    setText('nav-over-mij', c.nav.overMij);
    setText('nav-reviews', c.nav.reviews);
    setText('nav-contact', c.nav.contact);
    setText('footer-tekst', c.footer.tekst);

    // Homepage
    setText('hero-kop', c.hero.kop);
    setText('hero-slogan', c.hero.slogan);
    setText('hero-cta', c.hero.knop);

    setText('over-mij-titel', c.overMij.titel);
    setText('over-mij-kop', c.overMij.kop);
    fill('over-mij-alineas', c.overMij.alineas, function (tekst) {
        return el('p', null, tekst);
    });
    fill('over-mij-feiten', c.overMij.feiten, function (feit) {
        var li = el('li');
        li.appendChild(el('strong', null, feit.waarde));
        li.appendChild(el('span', null, feit.label));
        return li;
    });

    setText('reviews-titel', c.reviews.titel);
    setText('reviews-kop', c.reviews.kop);
    fill('reviews-items', c.reviews.items, function (r) {
        var fig = el('figure', 'review');
        fig.appendChild(el('blockquote', null, r.tekst));
        var cap = el('figcaption');
        cap.appendChild(el('strong', null, r.naam));
        if (r.detail) cap.appendChild(el('span', null, r.detail));
        fig.appendChild(cap);
        return fig;
    });

    setText('oproep-kop', c.oproep.kop);
    setText('oproep-tekst', c.oproep.tekst);
    setText('oproep-knop', c.oproep.knop);

    // Contactpagina
    var k = c.contact;
    setText('contact-titel', k.titel);
    setText('contact-kop', k.kop);
    setText('contact-intro', k.intro);
    setText('contact-lesadres', k.lesadres);
    setText('contact-veld-naam', k.veldNaam);
    setText('contact-veld-email', k.veldEmail);
    setText('contact-veld-telefoon', k.veldTelefoon);
    setText('contact-veld-bericht', k.veldBericht);
    setText('contact-versturen', k.versturen);
    setText('contact-error', k.errorTekst);
    setText('contact-success-titel', k.successTitel);
    setText('contact-success-tekst', k.successTekst);
    setText('contact-terug', k.terug);
    var bericht = document.getElementById('bericht');
    if (bericht && k.placeholderBericht) bericht.placeholder = k.placeholderBericht;
}

/* Zet platte tekst in alle elementen met data-content="key" */
function setText(key, text) {
    if (text === undefined || text === null) return;
    document.querySelectorAll('[data-content="' + key + '"]').forEach(function (node) {
        node.textContent = text;
    });
}

/* Zet bron en alt-tekst van een foto met data-content="key" */
function setImage(key, src, alt) {
    var img = document.querySelector('img[data-content="' + key + '"]');
    if (!img) return;
    if (src) img.src = src;
    if (alt !== undefined) img.alt = alt;
}

/* Zet de foto voor kleine schermen (een <source> binnen <picture>) */
function setSource(key, src) {
    var source = document.querySelector('source[data-content="' + key + '"]');
    if (source && src) source.srcset = src;
}

/* Vult een container met elementen, één per item uit een lijst */
function fill(key, items, render) {
    var container = document.querySelector('[data-content="' + key + '"]');
    if (!container || !items) return;
    container.textContent = '';
    items.forEach(function (item) {
        container.appendChild(render(item));
    });
}

function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
}


/* ===========================================
   2. HEADER — wordt donker zodra je voorbij de hero scrolt
=========================================== */

function initHeader() {
    var header = document.querySelector('.site-header--overlay');
    if (!header) return;
    var update = function () {
        header.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
}


/* ===========================================
   3. CONTACTFORMULIER
   Verstuurt naar de gedeelde mail-API (vitis-mail-api op Fly.io).
   Veldnamen (naam, email, telefoon, bericht) NIET wijzigen:
   de API verwacht precies deze namen.
=========================================== */

function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var loadedAt = document.getElementById('formLoadedAt');
    if (loadedAt) loadedAt.value = Date.now();

    var error = document.getElementById('formError');
    var button = form.querySelector('[type="submit"]');
    var k = (SITE_CONTENT && SITE_CONTENT.contact) || {};

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        error.hidden = true;

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        button.disabled = true;
        button.textContent = k.bezig || 'Bezig met versturen…';

        try {
            var res = await fetch(MAIL_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': MAIL_API_KEY,
                },
                body: JSON.stringify(Object.fromEntries(new FormData(form))),
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);

            form.hidden = true;
            document.getElementById('formSuccess').hidden = false;
        } catch (err) {
            error.hidden = false;
            button.disabled = false;
            button.textContent = k.versturen || 'Versturen';
        }
    });
}


/* ===========================================
   4. START
=========================================== */

async function init() {
    var year = document.getElementById('currentYear');
    if (year) year.textContent = new Date().getFullYear();
    initHeader();

    try {
        SITE_CONTENT = await loadContent();
        injectContent(SITE_CONTENT);
    } catch (err) {
        showContentError(err);
    }

    initContactForm();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
