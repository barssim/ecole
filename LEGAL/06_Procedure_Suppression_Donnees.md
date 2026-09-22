> **Avertissement important**  
> Ce modèle constitue une base de travail et ne remplace pas les conseils d'un avocat ou d'un conseil spécialisé en protection des données. Il doit être adapté aux activités réelles, aux flux de données, aux sous-traitants, aux mesures de sécurité et aux obligations applicables.
> **Avant utilisation**  
> Remplacer les éléments entre crochets par les informations réelles et supprimer les options inutiles. Vérifier que les engagements décrits correspondent aux pratiques effectivement mises en place.
# 6. Procédure de suppression des données

**Propriétaire :** `[RESPONSABLE]`  
**Version :** `[NUMÉRO]`  
**Date d'effet :** `[DATE]`
# PROCÉDURE DE SUPPRESSION ET RESTITUTION DES DONNÉES

**Version : 1.0**

## 1. Objectif

Cette procédure définit ce qui se passe lorsque l'établissement quitte la plateforme ou demande la suppression de ses données.

## 2. Déclenchement

La procédure peut être déclenchée par :

* expiration du contrat ;
* résiliation ;
* demande légitime de l'établissement ;
* demande de suppression autorisée.

## 3. Étape 1 — Vérification

Le Prestataire vérifie :

* l'identité du demandeur ;
* son pouvoir de représenter l'établissement ;
* les données concernées ;
* les éventuelles obligations de conservation.

## 4. Étape 2 — Export

Lorsque l'établissement le demande, les données sont exportées dans un format structuré raisonnablement exploitable.

Format possible :

* CSV ;
* Excel ;
* JSON ;
* PDF pour les documents nécessitant une conservation visuelle.

## 5. Étape 3 — Désactivation

Les comptes utilisateurs de l'établissement sont désactivés à la fin du service, sauf nécessité contraire.

## 6. Étape 4 — Suppression des données actives

Les données sont supprimées des environnements de production après expiration de la période de restitution.

Délai cible :

**30 jours après la fin du contrat.**

## 7. Étape 5 — Sauvegardes

Les copies présentes dans les sauvegardes sont supprimées ou deviennent inaccessibles selon le cycle normal de rotation des sauvegardes.

Durée maximale cible :

**90 jours**, sauf obligation légale ou nécessité technique documentée.

## 8. Exceptions

Certaines informations peuvent être conservées lorsqu'une obligation légale impose leur conservation.

Dans ce cas :

* l'accès est limité ;
* les données ne sont plus utilisées pour les finalités courantes ;
* elles sont supprimées dès expiration de l'obligation de conservation.

## 9. Confirmation

Après exécution, le Prestataire peut fournir à l'établissement une confirmation écrite indiquant que la suppression des données actives a été effectuée.

## 10. Traçabilité

Les opérations de suppression importantes peuvent être enregistrées dans un journal interne comprenant :

* date ;
* compte ayant effectué l'opération ;
* établissement concerné ;
* type d'opération ;
* résultat.

## 11. Suppression accidentelle

Lorsqu'une suppression accidentelle est détectée avant l'expiration des sauvegardes disponibles, le Prestataire peut tenter une restauration à partir d'une sauvegarde appropriée.

La restauration dépend de la disponibilité et de l'intégrité des sauvegardes.

---
