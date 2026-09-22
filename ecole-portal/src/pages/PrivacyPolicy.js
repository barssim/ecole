import React from "react";

const PrivacyPolicy = ({ language, schoolCustomization }) => {
  const school = schoolCustomization || {};
  const schoolName = school.name?.[language] || school.name?.fr || "l'établissement";
  const privacyEmail = school.mail || "[EMAIL VIE PRIVÉE]";

  return (
    <article className="legal-page" dir={language === "ar" ? "rtl" : "ltr"}>
      <p className="legal-page-meta">Dernière mise à jour : [DATE]</p>
      <h1>Politique de confidentialité</h1>
      <p>
        Cette politique explique comment {schoolName} et la plateforme traitent
        les données personnelles des utilisateurs du service.
      </p>

      <h2>1. Responsable du traitement</h2>
      <p>
        Responsable : {schoolName}. Pour toute question relative à la vie
        privée, contactez-nous à <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>.
      </p>

      <h2>2. Données traitées</h2>
      <p>
        Selon les fonctionnalités utilisées, nous pouvons traiter les données
        d'identité et de contact, les informations de compte et de rôle, les
        données scolaires (classes, cours, notes et présences), les échanges
        avec le support, ainsi que les journaux de connexion et de sécurité.
      </p>

      <h2>3. Finalités</h2>
      <p>
        Ces données sont utilisées pour gérer les comptes, fournir les services
        scolaires, assurer la sécurité de la plateforme, répondre aux demandes
        de support, gérer la facturation lorsque nécessaire et respecter les
        obligations légales applicables.
      </p>

      <h2>4. Destinataires et conservation</h2>
      <p>
        L'accès est limité aux utilisateurs habilités, au personnel autorisé
        du prestataire et aux sous-traitants nécessaires au fonctionnement du
        service. Les données sont conservées pendant la durée nécessaire aux
        finalités décrites, puis supprimées ou archivées conformément aux
        obligations applicables.
      </p>

      <h2>5. Vos droits</h2>
      <p>
        Selon la réglementation applicable, vous pouvez demander l'accès, la
        rectification, l'opposition ou la suppression de vos données. Toute
        demande peut être adressée à <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>.
        Une vérification raisonnable de l'identité peut être demandée.
      </p>

      <h2>6. Sécurité et cookies</h2>
      <p>
        La plateforme applique des mesures de contrôle des accès, de
        chiffrement des communications, de sauvegarde et de journalisation.
        Les cookies ou stockages nécessaires au fonctionnement peuvent être
        utilisés ; les outils non essentiels sont activés uniquement lorsque le
        consentement est requis.
      </p>

      <h2>7. Modifications</h2>
      <p>
        La version en vigueur est publiée sur cette page. En cas de changement
        important, les utilisateurs concernés sont informés par email ou par
        notification dans la plateforme avant l'entrée en vigueur de la
        modification.
      </p>
    </article>
  );
};

export default PrivacyPolicy;
