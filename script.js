
function calculerPrix() {
  const texte = document.getElementById("texte").value;

  const regex = /(\d+(?:[.,]\d+)?)(?:\s*)(k|f|fr|€|\$)(?=[\s.,;!?]|$)/gi;
  let total = 0;

  const matches = [...texte.matchAll(regex)];

  if (matches) {
    matches.forEach(match => {
      let nombre = match[1].replace(",", ".");
      let unité = match[2].toLowerCase();
      let valeur = parseFloat(nombre);

      if (unité === 'k') {
        total += valeur * 1000;
      } else if (['f', 'fr'].includes(unité)) {
        total += valeur;
      } else if (unité === '€') {
        total += valeur * 655;
      } else if (unité === '$') {
        total += valeur * 600;
      }
    });
  }

  // Conversions
  const totalFr = Math.round(total);
  const totalEuro = total / 655;
  const totalDollar = total / 600;

  const totalEuroStr = totalEuro.toFixed(5);
  const totalDollarStr = totalDollar.toFixed(5);

  // Affichage structuré
  document.getElementById("resultat").innerHTML = `
    <h5 class="text-primary">Résultat en chiffres :</h5>
    <span style="color: green;">En franc : ${totalFr.toLocaleString('fr-FR')} Fr</span><br>
    <span style="color: blue;">En euro : ${totalEuroStr} €</span><br>
    <span style="color: red;">En dollar : ${totalDollarStr} $</span><br><br>

 <hr style="border: 1px solid black; margin: 15px 0;">  <!-- Ligne noire -->
 
    <h5 class="text-secondary">Résultats en lettres :</h5>
    <span style="color: green;">En franc : ${enLettres(totalFr)} francs</span><br>
    <span style="color: blue;">En euro : ${enLettres(totalEuro)} euros</span><br>
    <span style="color: red;">En dollar : ${enLettres(totalDollar)} dollars</span>
  `;
}

// Convertit les nombres en lettres (simplifié pour les besoins ici)
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
  return n.toString(); // fallback si trop grand
}
