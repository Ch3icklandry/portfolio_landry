const API = 'api.php';
let SITE_DATA = null;

async function api(action, opts = {}) {
  const res = await fetch(`${API}?action=${action}`, opts);
  return res.json();
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = document.getElementById('password').value;
  const res = await api('login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if (res.success) afficherDashboard();
  else document.getElementById('loginError').textContent = res.error;
});

async function verifierSession() {
  const res = await api('check');
  if (res.authenticated) afficherDashboard();
}

function afficherDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  chargerData();
}

async function chargerData() {
  SITE_DATA = await api('get_data');
  renderGeneral();
  renderListe('projets', configProjets);
  renderListe('formations', configFormations);
  renderListe('experiences', configExperiences);
  renderListe('certifications', configCertifications);
  renderCompetences();
}

async function sauverSection(section, content) {
  const res = await api('save_section', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section, content })
  });
  if (res.success) alert('Enregistré ✔');
  else alert('Erreur : ' + res.error);
}

async function uploadImage(inputEl, target) {
  const file = inputEl.files[0];
  if (!file) return null;
  const fd = new FormData();
  fd.append('file', file);
  fd.append('target', target);
  const res = await fetch(`${API}?action=upload`, { method: 'POST', body: fd });
  return res.json();
}

/* ---- GENERAL ---- */
function renderGeneral() {
  const g = SITE_DATA.identite || {};
  const h = SITE_DATA.hero || {};
  const c = SITE_DATA.contact || {};
  champ_nom_identite.value = g.nom || '';
  champ_nom1.value = h.nom1 || '';
  champ_nom2.value = h.nom2 || '';
  champ_nom3.value = h.nom3 || '';
  champ_nom4.value = h.nom4 || '';
  champ_texte_haut.value = h.texte_haut || '';
  champ_texte_bas.value = h.texte_bas || '';
  champ_phrases.value = (h.phrases || []).join('\n');
  apercu_logo.src = g.logo || '';
  apercu_photo.src = h.photo || '';
  champ_contact_texte.value = c.texte || '';
  champ_github.value = c.github || '';
  champ_linkedin.value = c.linkedin || '';
  champ_email.value = c.email || '';
}

document.getElementById('formGeneral').addEventListener('submit', async (e) => {
  e.preventDefault();
  const identite = { nom: champ_nom_identite.value, logo: SITE_DATA.identite.logo };
  const hero = {
    nom1: champ_nom1.value, nom2: champ_nom2.value, nom3: champ_nom3.value, nom4: champ_nom4.value,
    texte_haut: champ_texte_haut.value, texte_bas: champ_texte_bas.value,
    phrases: champ_phrases.value.split('\n').map(s => s.trim()).filter(Boolean),
    photo: SITE_DATA.hero.photo
  };
  const contact = { texte: champ_contact_texte.value, github: champ_github.value, linkedin: champ_linkedin.value, email: champ_email.value };
  await sauverSection('identite', identite);
  await sauverSection('hero', hero);
  await sauverSection('contact', contact);
  SITE_DATA.identite = identite; SITE_DATA.hero = hero; SITE_DATA.contact = contact;
});

document.getElementById('inputLogo').addEventListener('change', async (e) => {
  const res = await uploadImage(e.target, 'logo');
  if (res.success) {
    SITE_DATA.identite.logo = res.path;
    apercu_logo.src = res.path + '?_=' + Date.now();
    await sauverSection('identite', SITE_DATA.identite);
  } else alert(res.error);
});

document.getElementById('inputPhoto').addEventListener('change', async (e) => {
  const res = await uploadImage(e.target, 'photo');
  if (res.success) {
    SITE_DATA.hero.photo = res.path;
    apercu_photo.src = res.path + '?_=' + Date.now();
    await sauverSection('hero', SITE_DATA.hero);
  } else alert(res.error);
});

/* ---- LISTES GENERIQUES ---- */
const configProjets = {
  champs: [
    { key: 'titre', label: 'Titre', type: 'text' },
    { key: 'sous_titre', label: 'Sous-titre', type: 'text' },
    { key: 'description', label: 'Description (HTML autorisé)', type: 'textarea' },
    { key: 'taches', label: 'Points clés (un par ligne)', type: 'liste' },
    { key: 'bouton_texte', label: 'Texte du bouton', type: 'text' },
    { key: 'lien', label: 'Lien', type: 'text' }
  ],
  vide: { titre: '', sous_titre: '', description: '', taches: [], bouton_texte: 'Voir le projet', lien: '#' }
};

const configFormations = {
  champs: [
    { key: 'nom', label: 'Établissement', type: 'text' },
    { key: 'diplome', label: 'Diplôme / filière', type: 'text' },
    { key: 'ecole', label: 'Ville / université', type: 'text' },
    { key: 'date', label: 'Période', type: 'text' },
    { key: 'couleur', label: 'Couleur', type: 'select', options: ['vert', 'cyan', 'violet'] },
    { key: 'desc', label: 'Description', type: 'textarea' },
    { key: 'tags', label: 'Tags (un par ligne)', type: 'liste' }
  ],
  vide: { nom: '', diplome: '', ecole: '', date: '', couleur: 'vert', desc: '', tags: [] }
};

const configExperiences = {
  champs: [
    { key: 'poste', label: 'Poste', type: 'text' },
    { key: 'entreprise', label: 'Entreprise / organisation', type: 'text' },
    { key: 'lieu', label: 'Lieu', type: 'text' },
    { key: 'badge', label: 'Badge (ex: Bénévolat)', type: 'text' },
    { key: 'date', label: 'Période', type: 'text' },
    { key: 'couleur', label: 'Couleur', type: 'select', options: ['vert', 'cyan', 'violet'] },
    { key: 'taches', label: 'Missions (une par ligne)', type: 'liste' }
  ],
  vide: { poste: '', entreprise: '', lieu: '', badge: '', date: '', couleur: 'vert', taches: [] }
};

const configCertifications = {
  champs: [
    { key: 'categorie', label: 'Catégorie', type: 'text' },
    { key: 'nom', label: 'Nom de la certification', type: 'text' },
    { key: 'organisation', label: 'Organisation', type: 'text' },
    { key: 'date', label: 'Date', type: 'text' },
    { key: 'couleur', label: 'Couleur', type: 'select', options: ['vert', 'cyan', 'violet', 'rouge', 'jaune'] },
    { key: 'desc', label: 'Description', type: 'textarea' },
    { key: 'image', label: 'Image', type: 'image', target: 'certificats' }
  ],
  vide: { categorie: '', nom: '', organisation: '', date: '', couleur: 'cyan', desc: '', image: '' }
};

function renderListe(section, config) {
  const conteneur = document.getElementById('liste_' + section);
  conteneur.innerHTML = '';
  (SITE_DATA[section] || []).forEach((item, index) => {
    conteneur.appendChild(creerCarteItem(section, config, item, index));
  });
}

function creerCarteItem(section, config, item, index) {
  const div = document.createElement('div');
  div.className = 'admin_item_carte';

  config.champs.forEach(champ => {
    const wrapper = document.createElement('div');
    wrapper.className = 'admin_champ';
    const label = document.createElement('label');
    label.textContent = champ.label;
    wrapper.appendChild(label);

    if (champ.type === 'textarea' || champ.type === 'liste') {
      const textarea = document.createElement('textarea');
      textarea.value = champ.type === 'liste' ? (item[champ.key] || []).join('\n') : (item[champ.key] || '');
      textarea.addEventListener('input', () => {
        item[champ.key] = champ.type === 'liste'
          ? textarea.value.split('\n').map(s => s.trim()).filter(Boolean)
          : textarea.value;
      });
      wrapper.appendChild(textarea);
    } else if (champ.type === 'select') {
      const select = document.createElement('select');
      champ.options.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt; o.textContent = opt;
        if (item[champ.key] === opt) o.selected = true;
        select.appendChild(o);
      });
      select.addEventListener('change', () => { item[champ.key] = select.value; });
      wrapper.appendChild(select);
    } else if (champ.type === 'image') {
      const img = document.createElement('img');
      img.className = 'admin_apercu_mini';
      img.src = item[champ.key] || '';
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*';
      input.addEventListener('change', async () => {
        const res = await uploadImage(input, champ.target || 'certificats');
        if (res.success) { item[champ.key] = res.path; img.src = res.path + '?_=' + Date.now(); }
        else alert(res.error);
      });
      wrapper.appendChild(img);
      wrapper.appendChild(input);
    } else {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = item[champ.key] || '';
      input.addEventListener('input', () => { item[champ.key] = input.value; });
      wrapper.appendChild(input);
    }
    div.appendChild(wrapper);
  });

  const btnSupprimer = document.createElement('button');
  btnSupprimer.type = 'button';
  btnSupprimer.className = 'admin_btn_supprimer';
  btnSupprimer.textContent = 'Supprimer';
  btnSupprimer.addEventListener('click', () => {
    if (confirm('Supprimer cet élément ?')) {
      SITE_DATA[section].splice(index, 1);
      renderListe(section, config);
    }
  });
  div.appendChild(btnSupprimer);
  return div;
}

function ajouterItem(section, config) {
  SITE_DATA[section] = SITE_DATA[section] || [];
  SITE_DATA[section].push(JSON.parse(JSON.stringify(config.vide)));
  renderListe(section, config);
}

function enregistrerListe(section) {
  sauverSection(section, SITE_DATA[section] || []);
}

document.getElementById('btn_ajouter_projets').addEventListener('click', () => ajouterItem('projets', configProjets));
document.getElementById('btn_ajouter_formations').addEventListener('click', () => ajouterItem('formations', configFormations));
document.getElementById('btn_ajouter_experiences').addEventListener('click', () => ajouterItem('experiences', configExperiences));
document.getElementById('btn_ajouter_certifications').addEventListener('click', () => ajouterItem('certifications', configCertifications));

document.getElementById('btn_save_projets').addEventListener('click', () => enregistrerListe('projets'));
document.getElementById('btn_save_formations').addEventListener('click', () => enregistrerListe('formations'));
document.getElementById('btn_save_experiences').addEventListener('click', () => enregistrerListe('experiences'));
document.getElementById('btn_save_certifications').addEventListener('click', () => enregistrerListe('certifications'));

document.querySelectorAll('.admin_tab_btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin_tab_btn').forEach(b => b.classList.remove('actif'));
    document.querySelectorAll('.admin_tab_contenu').forEach(c => c.style.display = 'none');
    btn.classList.add('actif');
    document.getElementById('tab_' + btn.dataset.tab).style.display = 'block';
  });
});

document.getElementById('btn_logout').addEventListener('click', async () => {
  await api('logout', { method: 'POST' });
  location.reload();
});
/* ---- COMPETENCES (catégories + items imbriqués) ---- */
const CLASSES_COMPETENCES = ['carte_prog', 'carte_dev', 'carte_bdd', 'carte_rs', 'carte_br', 'carte_ia'];

function renderCompetences() {
  const conteneur = document.getElementById('liste_competences');
  conteneur.innerHTML = '';
  SITE_DATA.competences = SITE_DATA.competences || [];

  SITE_DATA.competences.forEach((cat, catIndex) => {
    const carte = document.createElement('div');
    carte.className = 'admin_item_carte';

    // Nom de la catégorie
    const wrapCat = document.createElement('div');
    wrapCat.className = 'admin_champ';
    wrapCat.innerHTML = `<label>Nom de la catégorie</label>`;
    const inputCat = document.createElement('input');
    inputCat.type = 'text';
    inputCat.value = cat.categorie || '';
    inputCat.addEventListener('input', () => { cat.categorie = inputCat.value; });
    wrapCat.appendChild(inputCat);
    carte.appendChild(wrapCat);

    // Classe / couleur de la catégorie
    const wrapClasse = document.createElement('div');
    wrapClasse.className = 'admin_champ';
    wrapClasse.innerHTML = `<label>Couleur (classe CSS)</label>`;
    const selectClasse = document.createElement('select');
    CLASSES_COMPETENCES.forEach(c => {
      const o = document.createElement('option');
      o.value = c; o.textContent = c;
      if (cat.classe === c) o.selected = true;
      selectClasse.appendChild(o);
    });
    selectClasse.addEventListener('change', () => { cat.classe = selectClasse.value; });
    wrapClasse.appendChild(selectClasse);
    carte.appendChild(wrapClasse);

    // Icône de la catégorie (classe FontAwesome)
    const wrapIconeCat = document.createElement('div');
    wrapIconeCat.className = 'admin_champ';
    wrapIconeCat.innerHTML = `<label>Icône catégorie (classe FontAwesome, ex: fa-solid fa-code)</label>`;
    const inputIconeCat = document.createElement('input');
    inputIconeCat.type = 'text';
    inputIconeCat.value = cat.icone_categorie || '';
    inputIconeCat.addEventListener('input', () => { cat.icone_categorie = inputIconeCat.value; });
    wrapIconeCat.appendChild(inputIconeCat);
    carte.appendChild(wrapIconeCat);

    // Sous-titre pour la liste des items
    const titreItems = document.createElement('h3');
    titreItems.textContent = 'Compétences de cette catégorie';
    titreItems.style.color = '#00cfff';
    titreItems.style.marginTop = '16px';
    carte.appendChild(titreItems);

    // Liste des items (compétences individuelles)
    const conteneurItems = document.createElement('div');
    cat.items = cat.items || [];

    function renderItems() {
      conteneurItems.innerHTML = '';
      cat.items.forEach((item, itemIndex) => {
        const ligne = document.createElement('div');
        ligne.className = 'admin_item_competence';

        const inputIcone = document.createElement('input');
        inputIcone.type = 'text';
        inputIcone.placeholder = 'Icône (ex: fa-brands fa-python)';
        inputIcone.value = item.icone || '';
        inputIcone.addEventListener('input', () => { item.icone = inputIcone.value; });

        const inputNom = document.createElement('input');
        inputNom.type = 'text';
        inputNom.placeholder = 'Nom (ex: Python)';
        inputNom.value = item.nom || '';
        inputNom.addEventListener('input', () => { item.nom = inputNom.value; });

        const inputPct = document.createElement('input');
        inputPct.type = 'number';
        inputPct.min = 0; inputPct.max = 100;
        inputPct.placeholder = '%';
        inputPct.value = item.pourcentage ?? 50;
        inputPct.addEventListener('input', () => { item.pourcentage = parseInt(inputPct.value) || 0; });

        const btnDel = document.createElement('button');
        btnDel.type = 'button';
        btnDel.textContent = '✕';
        btnDel.className = 'admin_btn_supprimer_mini';
        btnDel.addEventListener('click', () => {
          cat.items.splice(itemIndex, 1);
          renderItems();
        });

        ligne.appendChild(inputIcone);
        ligne.appendChild(inputNom);
        ligne.appendChild(inputPct);
        ligne.appendChild(btnDel);
        conteneurItems.appendChild(ligne);
      });
    }
    renderItems();
    carte.appendChild(conteneurItems);

    const btnAjouterItem = document.createElement('button');
    btnAjouterItem.type = 'button';
    btnAjouterItem.textContent = '+ Ajouter une compétence';
    btnAjouterItem.className = 'admin_btn_ajouter';
    btnAjouterItem.style.marginTop = '10px';
    btnAjouterItem.addEventListener('click', () => {
      cat.items.push({ icone: '', nom: '', pourcentage: 50 });
      renderItems();
    });
    carte.appendChild(btnAjouterItem);

    // Supprimer toute la catégorie
    const btnSupprimerCat = document.createElement('button');
    btnSupprimerCat.type = 'button';
    btnSupprimerCat.textContent = 'Supprimer cette catégorie';
    btnSupprimerCat.className = 'admin_btn_supprimer';
    btnSupprimerCat.style.marginTop = '16px';
    btnSupprimerCat.addEventListener('click', () => {
      if (confirm('Supprimer toute la catégorie "' + (cat.categorie || '') + '" ?')) {
        SITE_DATA.competences.splice(catIndex, 1);
        renderCompetences();
      }
    });
    carte.appendChild(btnSupprimerCat);

    conteneur.appendChild(carte);
  });
}

document.getElementById('btn_ajouter_categorie_comp').addEventListener('click', () => {
  SITE_DATA.competences.push({ categorie: '', classe: 'carte_prog', icone_categorie: '', items: [] });
  renderCompetences();
});

document.getElementById('btn_save_competences').addEventListener('click', () => {
  sauverSection('competences', SITE_DATA.competences || []);
});
verifierSession();