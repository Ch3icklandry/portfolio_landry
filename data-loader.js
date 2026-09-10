async function chargerDonnees() {
  try {
    const reponse = await fetch('data.json?_=' + Date.now());
    const data = await reponse.json();
    window.SITE_DATA = data;
    appliquerDonnees(data);
  } catch (e) {
    console.error('Erreur chargement data.json', e);
  } finally {
    if (typeof initSite === 'function') initSite();
  }
}

function appliquerDonnees(data) {

  // Logo & identité
  if (data.identite) {
    const logoImg = document.querySelector('.logo');
    if (logoImg && data.identite.logo) logoImg.src = data.identite.logo;
  }

  // Hero (photo, noms, bulles)
  if (data.hero) {
    const h = data.hero;
    const setText = (sel, val) => { const el = document.querySelector(sel); if (el && val) el.textContent = val; };
    setText('.nom1', h.nom1);
    setText('.nom2', h.nom2);
    setText('.nom3', h.nom3);
    setText('.nom4', h.nom4);
    setText('.text_haut', h.texte_haut);
    setText('.text_bas', h.texte_bas);
    const photo = document.querySelector('.photo_landry');
    if (photo && h.photo) photo.src = h.photo;
  }

  // Contact
  if (data.contact) {
    const c = data.contact;
    const texteEl = document.querySelector('.contact_texte');
    if (texteEl && c.texte) texteEl.textContent = c.texte;
    const lienGithub = document.getElementById('lien_github');
    if (lienGithub && c.github) lienGithub.href = c.github;
    const lienLinkedin = document.getElementById('lien_linkedin');
    if (lienLinkedin && c.linkedin) lienLinkedin.href = c.linkedin;
    const lienEmail = document.getElementById('lien_email');
    if (lienEmail && c.email) lienEmail.href = 'mailto:' + c.email;
  }

  // Projets
  if (Array.isArray(data.projets)) {
    const conteneur = document.querySelector('.conteneur_projet');
    if (conteneur) {
      conteneur.innerHTML = data.projets.map((p, i) => {
        const n = (i % 5) + 1;
        return `
        <div class="projet_${n}">
          <div class="titre_projet${n}">${p.titre || ''}</div>
          <div class="sous_titre_projet${n}">${p.sous_titre || ''}</div>
          ${p.description || ''}
          <ul>${(p.taches || []).map(t => `<li>${t}</li>`).join('')}</ul>
          <button class="btn_projet1" onclick="window.location.href='${p.lien || '#'}';">${p.bouton_texte || 'Voir le projet'}</button>
        </div>`;
      }).join('');
    }
  }

  // Formations
  if (Array.isArray(data.formations)) {
    const liste = document.querySelector('.formation_liste');
    if (liste) {
      liste.innerHTML = data.formations.map(f => `
        <div class="formation_item">
          <div class="formation_contenu">
            <div class="formation_top">
              <div>
                <h3 class="formation_nom">${f.nom || ''}</h3>
                <span class="formation_diplome ${f.couleur || 'vert'}">${f.diplome || ''}</span>
              </div>
              <div class="formation_meta">
                <span class="formation_ecole">${f.ecole || ''}</span>
                <span class="formation_date ${f.couleur || 'vert'}">${f.date || ''}</span>
              </div>
            </div>
            <p class="formation_desc">${f.desc || ''}</p>
            ${(f.tags && f.tags.length) ? `<div class="formation_tags">${f.tags.map(t => `<span>${t}</span>`).join('')}</div>` : ''}
          </div>
        </div>
      `).join('');
    }
  }

  // Expériences
  if (Array.isArray(data.experiences)) {
    const timeline = document.querySelector('.experience_timeline');
    if (timeline) {
      timeline.innerHTML = data.experiences.map(exp => `
        <div class="experience_item">
          <span class="timeline_point ${exp.couleur || 'vert'}"></span>
          <div class="experience_carte">
            <div class="experience_header">
              <div>
                <h3 class="experience_poste">${exp.poste || ''}</h3>
                <span class="experience_entreprise ${exp.couleur || 'vert'}">${exp.entreprise || ''}</span>
                <p class="experience_lieu">${exp.lieu || ''}</p>
              </div>
              <div class="experience_meta">
                <span class="badge ${exp.couleur || 'vert'}">${exp.badge || ''}</span>
                <span class="experience_date">${exp.date || ''}</span>
              </div>
            </div>
            <ul>${(exp.taches || []).map(t => `<li>${t}</li>`).join('')}</ul>
          </div>
        </div>
      `).join('');
    }
  }

  // Certifications (groupées par catégorie)
  if (Array.isArray(data.certifications)) {
    const grille = document.querySelector('.certification_grille');
    if (grille) {
      const categories = [...new Set(data.certifications.map(c => c.categorie))];
      grille.innerHTML = categories.map(cat => {
        const items = data.certifications.filter(c => c.categorie === cat);
        return `
          <h3 class="certif_categorie_title" style="grid-column: 1 / -1; margin: 30px 0 10px; font-family:'Courier New',monospace;">${cat}</h3>
          ${items.map(c => `
            <div class="certif_card">
              <div class="certif_image"><img src="${c.image}" alt="${c.nom}"></div>
              <div class="certif_body">
                <h3 class="certif_nom ${c.couleur}">${c.nom}</h3>
                <p class="certif_meta"><strong>Organisation :</strong> ${c.organisation}</p>
                <p class="certif_meta"><strong>Date :</strong> ${c.date}</p>
                <p class="certif_desc">${c.desc || ''}</p>
                <button class="certif_btn ${c.couleur}" onclick="openModal('${(c.nom || '').replace(/'/g, "\\'")}', '${(c.desc || '').replace(/'/g, "\\'")}', '${c.image}')">
                  <span class="certif_dot"></span> Voir le Certificat
                </button>
              </div>
            </div>
          `).join('')}
        `;
      }).join('');
    }
  }
    // Compétences
  if (Array.isArray(data.competences)) {
    const conteneur = document.querySelector('.conteneur_comp');
    if (conteneur) {
      conteneur.innerHTML = data.competences.map(cat => `
        <div class="${cat.classe || 'carte_prog'}">
          <div class="titre_prog">${cat.icone_categorie ? `<i class="${cat.icone_categorie}"></i>` : '<span class="icone">&lt;/&gt;</span>'} ${cat.categorie || ''}</div>
          <ul>
            ${(cat.items || []).map(it => `
              <li style="--pct:${it.pourcentage || 0}%">
                <i class="${it.icone || ''}"></i> ${it.nom || ''} <span>${it.pourcentage || 0}%</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `).join('');
    }
  }
  
}

document.addEventListener('DOMContentLoaded', chargerDonnees);