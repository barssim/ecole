import React from "react";

const TermsOfUse = ({ language }) => (
  <article className="legal-page" dir={language === "ar" ? "rtl" : "ltr"}>
    <p className="legal-page-meta">Version : 1.0 — Entrée en vigueur : [DATE]</p>
    <h1>Conditions générales d'utilisation</h1>
    <p>
      Les présentes CGU définissent les règles d'utilisation de la plateforme
      par les utilisateurs autorisés de l'établissement.
    </p>
    <h2>Utilisation du compte</h2>
    <p>
      L'utilisateur fournit des informations exactes, protège ses identifiants,
      ne partage pas son compte et signale toute compromission.
    </p>
    <h2>Utilisations interdites</h2>
    <p>
      Il est interdit d'accéder à un compte sans autorisation, de contourner
      les mesures de sécurité, d'introduire un logiciel malveillant, d'extraire
      massivement des données ou de perturber le service.
    </p>
    <h2>Acceptation électronique</h2>
    <p>
      En cochant « J'accepte les CGU » et en validant le formulaire, l'utilisateur
      accepte expressément les présentes CGU. La case n'est pas cochée par
      défaut. La plateforme peut conserver la date, l'identifiant du compte et
      la version acceptée afin de prouver cette acceptation.
    </p>
    <p>
      Lorsqu'un compte est créé par un administrateur, celui-ci peut confirmer
      que les CGU ont été remises à l'utilisateur. Cette confirmation prouve
      l'information, mais ne remplace pas l'acceptation personnelle de
      l'utilisateur lorsque celle-ci est requise.
    </p>
    <h2>Données et sécurité</h2>
    <p>
      L'utilisation de la plateforme est soumise à la
      <a href="/politique-confidentialite"> Politique de confidentialité</a>.
      Des mesures de sécurité sont appliquées et l'accès peut être suspendu en
      cas de risque sérieux.
    </p>
    <h2>Contact</h2>
    <p>Support : [EMAIL SUPPORT]</p>
  </article>
);

export default TermsOfUse;
