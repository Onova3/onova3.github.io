// Partage d'un résultat de calcul en texte : partage du téléphone si disponible, sinon copie.

/**
 * Texte partagé, fonction pure.
 * @param {{titre: string, lignes: [string, string][], total: [string, string], mention: string, lien: string}} r
 */
export function texteResultat({ titre, lignes, total, mention, lien }) {
  const corps = lignes.filter(([l, v]) => l && v).map(([l, v]) => `${l} : ${v}`);
  return [titre, '', ...corps, '', `${total[0]} : ${total[1]}`, '', mention, lien].join('\n');
}

/** Lit un ticket affiché (.ticket) et en tire les lignes et le total. */
export function lireTicket(ticket) {
  const propre = el => el.cloneNode(true);
  const texte = el => { const c = propre(el); c.querySelectorAll('.art').forEach(a => a.remove()); return c.textContent.replace(/\s+/g, ' ').trim(); };
  const lignes = [...ticket.querySelectorAll('.row')].map(r => { const [a, b] = r.children; return [a ? texte(a) : '', b ? texte(b) : '']; });
  const total = [texte(ticket.querySelector('.total .k') ?? ticket), texte(ticket.querySelector('.total .v') ?? ticket)];
  return { lignes, total };
}

/** @returns {Promise<'partage'|'copie'|'echec'>} */
export async function partager(texte, titre) {
  try {
    if (navigator.share) { await navigator.share({ title: titre, text: texte }); return 'partage'; }
  } catch (e) {
    if (e && e.name === 'AbortError') return 'partage';
  }
  try { await navigator.clipboard.writeText(texte); return 'copie'; } catch { return 'echec'; }
}
