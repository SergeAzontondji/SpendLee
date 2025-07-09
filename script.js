


// Traitement unique pour galerie ou caméra
document.getElementById("photoUnique").addEventListener("change", function () {
  traiterImage(this.files[0]);
});


// Fonction commune OCR
async function traiterImage(file) {
  if (!file) return;

  document.getElementById("resultat").innerHTML = "⏳ Traitement de l'image...";

  const { data: { text } } = await Tesseract.recognize(file, 'fra', {
    logger: m => console.log(m)
  });

  document.getElementById("texte").value = text;
  calculerPrix();
}

function calculerPrix() {

  const texte = document.getElementById("texte").value;
  const operation = document.getElementById("operation").value;

  if (operation === "multi-opérateur") {
    calculerExpressionArithmetique(texte);
    return;
  }


  const montantRegex = /(\d{1,3}(?:[\s.,]?\d{3})*(?:[.,]\d+)?)(?:\s*)(k|f|fr|fcfa|€|\$)/gi;
  const montants = [];
  let match;

  while ((match = montantRegex.exec(texte)) !== null) {
    let brut = match[1].trim();
    brut = brut.replace(/\u00A0/g, '');
    if (brut.match(/,\d{3}/) && brut.includes(".")) {
      brut = brut.replace(/,/g, '');
    }
    brut = brut.replace(/[\s.](?=\d{3}(\D|$))/g, '');
    brut = brut.replace(',', '.');

    let valeur = parseFloat(brut);
    let unite = match[2].toLowerCase();

    if (unite === 'k') valeur *= 1000;
    else if (['f', 'fr', 'fcfa'].includes(unite)) valeur *= 1;
    else if (unite === '€') valeur *= 655;
    else if (unite === '$') valeur *= 600;

    montants.push(valeur);
  }

  if (montants.length === 0) {
    document.getElementById("resultat").innerHTML = "Aucun montant détecté.";
    return;
  }

  let total = montants[0];
  for (let i = 1; i < montants.length; i++) {
    switch (operation) {
      case "addition":
        total += montants[i];
        break;
      case "soustraction":
        total -= montants[i];
        break;
      case "multiplication":
        total *= montants[i];
        break;
      case "division":
        if (montants[i] === 0) {
          document.getElementById("resultat").innerHTML = "Erreur : division par zéro.";
          return;
        }
        total /= montants[i];
        break;
    }
  }

  const totalEuro = total / 655;
  const totalDollar = total / 600;

  const totalEuroStr = totalEuro.toFixed(5);
  const totalDollarStr = totalDollar.toFixed(5);

  document.getElementById("resultat").innerHTML = `
   
    <h5 class="text-primary">Résultat en chiffres :</h5>
    <span style="color: green;">En franc :<strong> ${total.toLocaleString('fr-FR')} Fr</strong></span><br>
    <span style="color: blue;">En euro :<strong> ${totalEuroStr} €</strong></span><br>
    <span style="color: red;">En dollar :<strong> ${totalDollarStr} $</strong></span><br>

    <hr style="border: 1px solid black; margin: 15px 0;">

    <h5 class="text-secondary">Résultats en lettres :</h5>
    <span style="color: green;">En franc :<strong> ${enLettres(total)} francs</strong></span><br>
    <span style="color: blue;">En euro :<strong> ${enLettres(totalEuro)} euros</strong></span><br>
    <span style="color: red;">En dollar :<strong> ${enLettres(totalDollar)} dollars</strong></span>
  `;
}

function calculerExpressionArithmetique(texte) {
  const montantRegex = /(\d{1,3}(?:[\s.,]?\d{3})*(?:[.,]\d+)?)(?:\s*)(k|f|fr|fcfa|€|\$)/gi;
  let expression = texte;

  expression = expression.replace(montantRegex, (match, nombre, unite) => {
    let brut = nombre.trim();
    brut = brut.replace(/\u00A0/g, '');
    if (brut.match(/,\d{3}/) && brut.includes(".")) {
      brut = brut.replace(/,/g, '');
    }
    brut = brut.replace(/[\s.](?=\d{3}(\D|$))/g, '');
    brut = brut.replace(',', '.');

    let valeur = parseFloat(brut);
    unite = unite.toLowerCase();

    if (unite === 'k') valeur *= 1000;
    else if (['f', 'fr', 'fcfa'].includes(unite)) valeur *= 1;
    else if (unite === '€') valeur *= 655;
    else if (unite === '$') valeur *= 600;

    return valeur.toString();
  });

  // Remplacer × et ÷ par * et /
  expression = expression.replace(/×/g, '*').replace(/÷/g, '/');

  try {
    const total = eval(expression);
    const totalEuro = total / 655;
    const totalDollar = total / 600;

    const totalEuroStr = totalEuro.toFixed(5);
    const totalDollarStr = totalDollar.toFixed(5);

    document.getElementById("resultat").innerHTML = `
      <h5 class="text-primary">Résultat en chiffres :</h5>
      <span style="color: green;">En franc : ${total.toLocaleString('fr-FR')} Fr</span><br>
      <span style="color: blue;">En euro : ${totalEuroStr} €</span><br>
      <span style="color: red;">En dollar : ${totalDollarStr} $</span><br><br>

      <hr style="border: 1px solid black; margin: 15px 0;">

      <h5 class="text-secondary">Résultats en lettres :</h5>
      <span style="color: green;">En franc : ${enLettres(total)} francs</span><br>
      <span style="color: blue;">En euro : ${enLettres(totalEuro)} euros</span><br>
      <span style="color: red;">En dollar : ${enLettres(totalDollar)} dollars</span>
    `;
  } catch (error) {
    document.getElementById("resultat").innerHTML = "Erreur : expression invalide.";
  }
}


// Conversion en lettres
function enLettres(nombre) {
  const parties = nombre.toFixed(5).split(".");
  const entier = parseInt(parties[0]);
  const decimal = parseInt(parties[1]);

  let phrase = convertirEnLettres(entier);
  if (decimal > 0) {
    phrase += ` et ${convertirEnLettres(decimal)} ${getUnitéCentime(decimal)}`;
  }
  return phrase;
}

function getUnitéCentime(decimal) {
  const longueur = decimal.toString().length;
  if (longueur === 1) return "dixièmes";
  if (longueur === 2) return "centimes";
  if (longueur === 3) return "millièmes";
  if (longueur === 4) return "dix-millièmes";
  if (longueur === 5) return "cent-millièmes";
  return "centimes";
}

function convertirEnLettres(n) {
  const unite = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
  const dizaine = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante"];
  const speciale = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];

  if (n < 10) return unite[n];
  if (n < 20) return speciale[n - 10];
  if (n < 70) return dizaine[Math.floor(n / 10)] + (n % 10 ? `-${unite[n % 10]}` : "");
  if (n < 80) return "soixante-" + convertirEnLettres(n - 60);
  if (n < 100) return "quatre-vingt" + (n === 80 ? "s" : `-${convertirEnLettres(n - 80)}`);
  if (n < 1000) {
    return (n >= 200 ? `${convertirEnLettres(Math.floor(n / 100))}-cent` : "cent") +
      (n % 100 ? ` ${convertirEnLettres(n % 100)}` : "");
  }
  if (n < 1000000) {
    return (n >= 2000 ? `${convertirEnLettres(Math.floor(n / 1000))} mille` : "mille") +
      (n % 1000 ? ` ${convertirEnLettres(n % 1000)}` : "");
  }
  if (n < 1000000000) {
    return (n >= 2000000 ? `${convertirEnLettres(Math.floor(n / 1000000))} millions` : "un million") +
      (n % 1000000 ? ` ${convertirEnLettres(n % 1000000)}` : "");
  }
  if (n < 1000000000000) {
    return (n >= 2000000000 ? `${convertirEnLettres(Math.floor(n / 1000000000))} milliards` : "un milliard") +
      (n % 1000000000 ? ` ${convertirEnLettres(n % 1000000000)}` : "");
  }

  return n.toString(); // Au-delà : fallback
}


// Fonction pour activer les événements sur le menu navbar
function activerSelectionOperationNavbar() {
  const liens = document.querySelectorAll(".navbar-nav .nav-link");
  const select = document.getElementById("operation");
  const alerte = document.getElementById("operationSelectionnee");

  liens.forEach((lien) => {
    lien.addEventListener("click", function (e) {
      e.preventDefault();

      const texte = lien.textContent.trim();
      let valeur = texte.toLowerCase();

      // Définir la valeur du select en cliquant sur le menu
      if (valeur === "multi-opérateur") {
        select.value = "multi-opérateur";
      } else if (valeur === "soustraction") {
        select.value = "soustraction";
      } else if (valeur === "addition") {
        select.value = "addition";
      } else if (valeur === "multiplication") {
        select.value = "multiplication";
      } else if (valeur === "division") {
        select.value = "division";
      }
      
      // Afficher l'alerte
      alerte.textContent = texte;
      alerte.classList.remove("d-none");
    });
  });
}

// Appel automatique quand tout est chargé
document.addEventListener("DOMContentLoaded", function () {
  activerSelectionOperationNavbar();
 
  document.getElementById("operation").addEventListener("change", function () {
  const valeur = this.value;
  const texte = {
    "addition": "Addition",
    "soustraction": "Soustraction",
    "multiplication": "Multiplication",
    "division": "Division",
    "multi-opérateur": "Multi-opérateur"
  }[valeur] || valeur;

  const alerte = document.getElementById("operationSelectionnee");
  alerte.textContent = texte;
  alerte.classList.remove("d-none");
});

});


async function exporterPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const franc = document.querySelector("#resultat").innerText;

  doc.text("Résultats Smartcalc", 10, 10);
  doc.text(franc, 10, 20);

  doc.save("resultats_smartcalc.pdf");
}

function copierResultat() {
  const texte = document.getElementById("resultat").innerText;
  navigator.clipboard.writeText(texte)
    .then(() => alert("Résultat copié !"))
    .catch(err => alert("Erreur de copie"));
}

function exporterTXT() {
  const texte = document.getElementById("resultat").innerText;
  const blob = new Blob([texte], { type: "text/plain;charset=utf-8" });
  const lien = document.createElement("a");
  lien.href = URL.createObjectURL(blob);
  lien.download = "resultats_smartcalc.txt";
  lien.click();
}


window.addEventListener("scroll", function () {
    const navbar = document.getElementById("navbar");
    if (window.scrollY > 50) {
      navbar.classList.add("navbar-transparent");
    } else {
      navbar.classList.remove("navbar-transparent");
    }
  });


//Pour le Mode Sombre et Clair
  document.getElementById("modeToggle").addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");

  // Changer l'icône en fonction du thème
  this.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
});


// Sauvegarder l'état
const theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
localStorage.setItem("theme", theme);

// Vérifie s'il y a un thème enregistré
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
}

// Bascule le mode sombre
document.querySelector('#toggleDarkMode').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  
  // Sauvegarde dans localStorage
  const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
});

// Appliquer le thème sauvegardé au chargement
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
  }
});
