# Le Gourmet : Système de Gestion de Réservations

"Le Gourmet" est une application web front-end de gestion de réservations. Elle fournit un calendrier mensuel interactif permettant au personnel d'un restaurant de gérer numériquement les réservations des clients.

Ce projet a été développé en utilisant uniquement **HTML5**, **CSS3** et **JavaScript**. Il met l'accent sur la manipulation avancée du DOM, la gestion des événements et la persistance des données via le `localStorage` du navigateur.


## ✨ Fonctionnalités Principales

* **Affichage Calendrier Dynamique**: Navigation facile entre les mois avec mise en surbrillance du jour actuel.
* **Gestion Complète (CRUD)**:
    * **Create**: Ajouter de nouvelles réservations via un formulaire modal.
    * **Read**: Afficher toutes les réservations triées par date et heure.
    * **Update**: Modifier une réservation existante.
    * **Delete**: Supprimer une réservation (avec une demande de confirmation).
* **Drag & Drop**: Déplacer intuitivement une réservation d'un jour à l'autre (hors week-end) pour la reprogrammer.
* **Persistance des Données**: Toutes les réservations sont sauvegardées dans le **`localStorage`** du navigateur, ce qui signifie qu'elles ne disparaissent pas lorsque vous actualisez la page.
* **Filtrage et Recherche**: Une barre de recherche permet de filtrer instantanément les réservations par nom de client, type de réservation, heure, ou nombre de personnes.
* **Validation de Formulaire**: Empêche les réservations incorrectes (ex: l'heure de fin doit être après l'heure de début).
* **Statuts Visuels**: Les types de réservation (Standard, VIP, Anniversaire, Groupe) ont des couleurs distinctes pour une identification rapide.
* **Jours Désactivés**: Logique métier qui empêche la création de réservations durant le week-end (Samedi et Dimanche).

## 🛠️ Technologies Utilisées

* **HTML5**: Structure sémantique du calendrier et du formulaire modal.
* **CSS3**: Style de l'application, mise en page (Grid/Flexbox), et styles dynamiques pour les types de réservation et les états (drag, hover).
* **JavaScript (ES6+)**:
    * **DOM Manipulation**: Création dynamique du calendrier et des cartes de réservation.
    * **Event Listeners**: Gestion de tous les événements (click, submit, drag, drop, input).
    * **`localStorage` API**: Sauvegarde et chargement des données des réservations.
    * **`Date` Object**: Logique de calcul et d'affichage des mois et des jours.

## 🚀 Installation et Lancement

Ce projet est une application "statique" et ne nécessite aucun back-end ou processus de build.

1.  Clonez ce dépôt sur votre machine locale :
    ```bash
    git clone https://github.com/ayouberrak/Calendrier-Hebdomadaire-Planification-des-R-servations
    ```
2.  Naviguez dans le dossier du projet :
    ```bash
    cd Calendrier-Hebdomadaire-Planification-des-R-servations
    ```
3.  Ouvrez simplement le fichier `index.html` dans votre navigateur web préféré.