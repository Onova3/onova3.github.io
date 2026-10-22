// Accueil (phase 0) : inventaire des impôts par catégorie, avec recherche et choix de langue.
const CATEGORIES = ['revenus', 'enregistrement', 'consommation', 'local'];
let lang = 'fr', textes = {}, impots = [];
try { lang = localStorage.getItem('kh-lang') || 'fr'; } catch {}

const charger = async l => (await fetch(`src/i18n/${l}.json`)).json();
const t = k => textes[k] ?? k;

function afficher() {
  const q = document.getElementById('q').value.trim().toLowerCase();
  const filtre = i => !q || [i.sigle, i.nom.fr, i.nom.en, i.nom.mg].some(s => s.toLowerCase().includes(q));
  document.getElementById('liste').innerHTML = CATEGORIES.map(c => {
    const items = impots.filter(i => i.categorie === c && filtre(i));
    if (!items.length) return '';
    return `<section><h2>${t('cat_' + c)}</h2><ul>${items.map(i => `
      <li class="impot ${i.statut}">
        <span class="sigle">${i.sigle}</span>
        <span class="nom">${i.nom[lang]}<small>CDI · ${i.refCDI}</small></span>
        <span class="statut">${t('statut_' + i.statut)} · ${t('phase')} ${i.phase}</span>
      </li>`).join('')}</ul></section>`;
  }).join('');
}

async function changerLangue(l) {
  lang = l; textes = await charger(l);
  try { localStorage.setItem('kh-lang', l); } catch {}
  document.documentElement.lang = l;
  document.querySelectorAll('[data-i18n]').forEach(e => e.textContent = t(e.dataset.i18n));
  document.getElementById('q').placeholder = t('recherche');
  document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === l));
  afficher();
}

impots = (await (await fetch('data/impots.json')).json()).impots;
document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => changerLangue(b.dataset.lang)));
document.getElementById('q').addEventListener('input', afficher);
changerLangue(lang);
