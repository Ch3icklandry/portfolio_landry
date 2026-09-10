function downloadPDF() {
  alert("Téléchargement du CV en cours...");
  const link = document.createElement('a');
  link.href = './cv.pdf';
  link.download = 'cv.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function initSite() {

  /* 1. MENU BURGER */
  const menuBurger = document.getElementById('menuBurger');
  const navElement = document.querySelector('.nav_element');

  if (menuBurger && navElement) {
    menuBurger.addEventListener('click', () => {
      menuBurger.classList.toggle('actif');
      navElement.classList.toggle('menu_ouvert');
      const open = menuBurger.classList.contains('actif');
      menuBurger.setAttribute('aria-expanded', open);
    });

    document.querySelectorAll('.nav_element a').forEach(link => {
      link.addEventListener('click', () => {
        menuBurger.classList.remove('actif');
        navElement.classList.remove('menu_ouvert');
        menuBurger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* 2. TYPEWRITER */
  const phrases = (window.SITE_DATA && window.SITE_DATA.hero && window.SITE_DATA.hero.phrases) || [
    "Ingénieur de Travaux en Systèmes d'Information",
    "Développeur Junior",
    "Passionné d'Intelligence Artificielle, de Programmation et de Réseaux"
  ];
  let phraseIndex = 0, charIndex = 0, isDeleting = false;
  const texteAnim = document.getElementById('texte_anim');

  function typeWriter() {
    const phraseActuelle = phrases[phraseIndex];
    if (isDeleting) {
      texteAnim.textContent = phraseActuelle.substring(0, charIndex - 1);
      charIndex--;
    } else {
      texteAnim.textContent = phraseActuelle.substring(0, charIndex + 1);
      charIndex++;
    }
    let vitesse = isDeleting ? 30 : 60;
    if (!isDeleting && charIndex === phraseActuelle.length) {
      vitesse = 1800;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      vitesse = 400;
    }
    setTimeout(typeWriter, vitesse);
  }
  if (texteAnim) typeWriter();

  /* 3. BARRE DE SCROLL */
  const scrollProgress = document.getElementById('scrollProgress');
  if (!window._scrollProgressAttache) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      if (scrollProgress) scrollProgress.style.width = scrolled + '%';
    });
    window._scrollProgressAttache = true;
  }

  /* 4. PLUIE DE CODE */
  if (!window._canvasInit) {
    const canvas = document.getElementById('particulesBg');
    const ctx = canvas.getContext('2d');
    let largeur, hauteur, gouttes;
    const caracteres = "01アイウエオカキクケコ<>{}[]/;=+-#$%";

    function initCanvas() {
      largeur = canvas.width = window.innerWidth;
      hauteur = canvas.height = window.innerHeight;
      gouttes = new Array(Math.floor(largeur / 16)).fill(1);
    }
    initCanvas();
    window.addEventListener('resize', initCanvas);

    function dessinerPluie() {
      // Remplace : ctx.fillStyle = 'rgba(5, 5, 10, 0.08)';
// Par :
      ctx.fillStyle = document.body.classList.contains('light-mode') 
    ? 'rgba(244, 246, 249, 0.15)' 
    : 'rgba(5, 5, 10, 0.08)';
      ctx.fillRect(0, 0, largeur, hauteur);
      ctx.fillStyle = '#00ff88';
      ctx.font = '16px monospace';
      for (let i = 0; i < gouttes.length; i++) {
        const texte = caracteres[Math.floor(Math.random() * caracteres.length)];
        ctx.fillText(texte, i * 16, gouttes[i] * 16);
        if (gouttes[i] * 16 > hauteur && Math.random() > 0.975) gouttes[i] = 0;
        gouttes[i]++;
      }
      requestAnimationFrame(dessinerPluie);
    }
    dessinerPluie();

    /* 5. CURSEUR NEON */
    const spotlight = document.createElement('div');
    spotlight.className = 'curseur_spotlight';
    document.body.appendChild(spotlight);

    const curseurPoint = document.createElement('div');
    curseurPoint.className = 'curseur_point';
    document.body.appendChild(curseurPoint);

    document.addEventListener('mousemove', (e) => {
      spotlight.style.left = e.clientX + 'px';
      spotlight.style.top = e.clientY + 'px';
      curseurPoint.style.left = e.clientX + 'px';
      curseurPoint.style.top = e.clientY + 'px';
    });

    window._canvasInit = true;
  }

  /* 6. INDICATEUR NAV + LIEN ACTIF */
  const glassIndicator = document.querySelector('.glass-indicator');
  const navLinks = document.querySelectorAll('.nav_element a');

  function bougerIndicateur(lien) {
    if (!lien || !glassIndicator) return;
    glassIndicator.style.left = lien.offsetLeft + 'px';
    glassIndicator.style.width = lien.offsetWidth + 'px';
    glassIndicator.style.opacity = '1';
  }

  navLinks.forEach(lien => lien.addEventListener('mouseenter', () => bougerIndicateur(lien)));
  const navElementScroll = document.querySelector('.nav_element');
  if (navElementScroll) {
    navElementScroll.addEventListener('mouseleave', () => {
      const actif = document.querySelector('.nav_element a.actif');
      if (actif) bougerIndicateur(actif);
      else if (glassIndicator) glassIndicator.style.opacity = '0';
    });
  }

  const sections = document.querySelectorAll('section[id]');
  function majLienActif() {
    let actuel = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 120) actuel = section.getAttribute('id');
    });
    navLinks.forEach(lien => {
      lien.classList.remove('actif');
      if (lien.getAttribute('href') === '#' + actuel) {
        lien.classList.add('actif');
        bougerIndicateur(lien);
      }
    });
  }
  if (!window._scrollActifAttache) {
    window.addEventListener('scroll', majLienActif);
    window._scrollActifAttache = true;
  }
  majLienActif();

  /* 7. REVEAL AU SCROLL */
  const elementsAAnimer = document.querySelectorAll(
    '.carte_prog, .carte_dev, .carte_bdd, .carte_rs, .carte_br, .carte_ia, ' +
    '.projet_1, .projet_2, .projet_3, .projet_4, .projet_5, ' +
    '.certif_card, .formation_item, .experience_carte, .about_left, .about_right, .contact_formulaire, .contact_gauche'
  );
  elementsAAnimer.forEach((el, index) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (index % 6) * 0.08 + 's';
  });

  const observateurReveal = new IntersectionObserver((entrees) => {
    entrees.forEach(entree => {
      if (entree.isIntersecting) {
        entree.target.classList.add('active');
        observateurReveal.unobserve(entree.target);
      }
    });
  }, { threshold: 0.15 });
  elementsAAnimer.forEach(el => observateurReveal.observe(el));

  /* 8. TITRES LETTRE PAR LETTRE */
  if (!window._titresDecoupes) {
    function decouperEnLettres(selecteur) {
      document.querySelectorAll(selecteur).forEach(titre => {
        const texte = titre.textContent;
        titre.textContent = '';
        titre.classList.add('titre_anime_lettres');
        [...texte].forEach((lettre, i) => {
          const span = document.createElement('span');
          span.textContent = lettre === ' ' ? '\u00A0' : lettre;
          span.style.animationDelay = (i * 0.035) + 's';
          titre.appendChild(span);
        });
      });
    }
    decouperEnLettres('.titre, .titre_comp, .titre_projet, .formation_titre, .experience_titre, .certification_titre, .contact_titre');
    window._titresDecoupes = true;

    const observateurTitres = new IntersectionObserver((entrees) => {
      entrees.forEach(entree => {
        if (entree.isIntersecting) {
          entree.target.classList.add('en_vue');
          observateurTitres.unobserve(entree.target);
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('.titre_anime_lettres').forEach(t => observateurTitres.observe(t));
  }

  /* 9. TILT 3D */
  const cartesTilt = document.querySelectorAll(
    '.projet_1, .projet_2, .projet_3, .projet_4, .projet_5, .certif_card, ' +
    '.carte_prog, .carte_dev, .carte_bdd, .carte_rs, .carte_br, .carte_ia'
  );
  cartesTilt.forEach(carte => {
    carte.addEventListener('mousemove', (e) => {
      const rect = carte.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotX = ((y - rect.height / 2) / (rect.height / 2)) * -4;
      const rotY = ((x - rect.width / 2) / (rect.width / 2)) * 4;
      carte.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
    });
    carte.addEventListener('mouseleave', () => { carte.style.transform = ''; });
  });

  /* 10. BARRES DE COMPETENCES */
  const elementsCompetence = document.querySelectorAll('[style*="--pct"]');
  const observateurCompetence = new IntersectionObserver((entrees) => {
    entrees.forEach(entree => {
      if (entree.isIntersecting) {
        const li = entree.target;
        li.classList.add('pct_visible');
        const span = li.querySelector('span');
        if (span && !span.dataset.anime) {
          span.dataset.anime = "1";
          const cible = parseInt(li.style.getPropertyValue('--pct'));
          let courant = 0;
          const intervalle = setInterval(() => {
            courant += Math.ceil(cible / 25) || 1;
            if (courant >= cible) { courant = cible; clearInterval(intervalle); }
            span.textContent = courant + '%';
          }, 40);
        }
        observateurCompetence.unobserve(li);
      }
    });
  }, { threshold: 0.3 });
  elementsCompetence.forEach(li => observateurCompetence.observe(li));

  /* 11. EFFET MAGNETIQUE */
  document.querySelectorAll('.btn_down_cv, .btn_contact_me, .btn_projet, .btn_projet1, .btn_projet3, .btn_envoyer').forEach(bouton => {
    bouton.addEventListener('mouseenter', () => { bouton.style.transition = 'transform 0.15s ease-out'; });
    bouton.addEventListener('mousemove', (e) => {
      const rect = bouton.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
      bouton.style.transform = `translate(${x}px, ${y}px)`;
    });
    bouton.addEventListener('mouseleave', () => {
      bouton.style.transition = 'transform 0.3s ease';
      bouton.style.transform = 'translate(0,0)';
    });
  });

  /* 12. RIPPLE */
  document.querySelectorAll('.btn_down_cv, .btn_contact_me, .btn_projet, .btn_projet1, .btn_projet3, .btn_envoyer, .certif_btn').forEach(bouton => {
    bouton.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const taille = Math.max(rect.width, rect.height);
      const ripple = document.createElement('span');
      ripple.className = 'ripple_effect';
      ripple.style.width = ripple.style.height = taille + 'px';
      ripple.style.left = (e.clientX - rect.left - taille / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - taille / 2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  /* 13. RETOUR EN HAUT */
  const backToTop = document.getElementById('backToTop');
  if (!window._backToTopAttache) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 500);
    });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window._backToTopAttache = true;
  }

  /* 14. LIGHTBOX CERTIFICATS */
  const lightboxOverlay = document.getElementById('lightboxOverlay');
  const lightboxImage = document.getElementById('lightboxImage');
  document.querySelectorAll('.certif_image img').forEach(img => {
    img.addEventListener('click', () => {
      lightboxImage.src = img.src;
      lightboxOverlay.classList.add('actif');
    });
  });
  if (!window._lightboxFermetureAttache) {
    lightboxOverlay.addEventListener('click', () => lightboxOverlay.classList.remove('actif'));
    window._lightboxFermetureAttache = true;
  }
}

/* PRECHARGEUR */
function masquerPreloader() {
  const preloader = document.getElementById('preloader');
  if (preloader && !preloader.classList.contains('cache')) {
    setTimeout(() => {
      preloader.classList.add('cache');
      setTimeout(() => preloader.remove(), 700);
    }, 400);
  }
}
if (document.readyState === 'complete') { masquerPreloader(); }
else { window.addEventListener('load', masquerPreloader); }
setTimeout(masquerPreloader, 2500);

function openModal(title, desc, imgSrc) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalDesc').textContent = desc;
  document.getElementById('modalImg').src = imgSrc;
  const modal = document.getElementById('certifModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModalForce() {
  const modal = document.getElementById('certifModal');
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}
function closeModal(event) {
  if (event.target.classList.contains('modal_overlay')) closeModalForce();
}
/* 5. GESTION DU MODE CLAIR / SOMBRE */
const themeToggleBtn = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');

// Si l'utilisateur a précédemment choisi le mode clair
if (savedTheme === 'light') {
  document.body.classList.add('light-mode');
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    
    // Sauvegarde de la préférence
    if (document.body.classList.contains('light-mode')) {
      localStorage.setItem('theme', 'light');
    } else {
      localStorage.setItem('theme', 'dark');
    }
  });
}
