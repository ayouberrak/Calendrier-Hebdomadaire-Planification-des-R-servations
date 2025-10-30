// On récupère tous les éléments DOM dont on aura besoin
let search = document.getElementById('search-filter');

let prevWeek = document.getElementById('prev-month-btn');
let thisWeek = document.getElementById('current-month-year');
let nextWeek = document.getElementById('next-month-btn');

let calendrier = document.getElementById('calendar-grid');
let reservationModel = document.getElementById('reservation-modal');
let titreModal = document.getElementById('modal-title');

let formEdit = document.getElementById('form-edit-id');
let formAjout = document.getElementById('form-jour'); // C'est le champ <input type="date">

let formReservation = document.getElementById('reservation-form');

let NonClient = document.getElementById('nom-client');
let heureDebut = document.getElementById('heure-debut');
let heureFin = document.getElementById('heure-fin');
let nbrPresonnes = document.getElementById('nombre-personnes');
let typeReservation = document.getElementById('type-reservation');

let stopReservation = document.getElementById('close-modal-btn');
let cancel = document.getElementById('cancel-btn');

let currentDate = new Date();


document.addEventListener('DOMContentLoaded', function () {

    let draggedId = null; // Pour savoir quelle réservation on déplace (Drag & Drop)
    // const date = new Date(); // Ma 3ndna mandiro biha hna

    // On charge les réservations déjà sauvegardées
    let reservations = loadFromLocalStorage();

    // Variable pour le filtre de recherche
    let filtre = "";

    // function for open the form
    // Le 'date' vient du jour cliqué
    function openForm(date) {
        // On vide le formulaire
        formReservation.reset();
        titreModal.textContent = "Ajouter reservation";
        formAjout.value = date; // Nsajlo l date li clickina 3liha f l input hidden/date
        formEdit.value = ""; // Nkhwiw l input dial l'edit
        reservationModel.classList.remove('hidden');
    }

    // function for close the form
    function closeForm() {
        reservationModel.classList.add('hidden');
    }

    //  the posibility for close the form  
    stopReservation.addEventListener('click', closeForm);
    cancel.addEventListener('click', closeForm);

    reservationModel.addEventListener('click', function (e) {
        if (e.target === reservationModel) {
            closeForm();
        }
    })

    function redesincalendrier(anne, mois) {
        calendrier.innerHTML = "";
        // first day of month , nombre de jours de mois , l'emplacement de premier jour dans la semaine
        let firstdayinmonth = new Date(anne, mois, 1);
        let nbrdayinmonth = new Date(anne, mois + 1, 0).getDate();
        let dayforweek = firstdayinmonth.getDay(); // 0 = Dimanche, 1 = Lundi...

        //  l'emplacement de premier jour dans la semaine (hna nrdoha 0 = Lundi, 6 = Dimanche)
        // On ajuste le premier jour (Lundi = 0, Dimanche = 6)
        let dayforweeks = (dayforweek === 0) ? 6 : dayforweek - 1;


        // la valeur de mois et anne dans le titre
        // Afficher le mois en français
        thisWeek.textContent = firstdayinmonth.toLocaleDateString('fr-FR', {
            month: 'long', year: 'numeric'
        })

        // ajout de div de mois precendant 
        for (let i = 0; i < dayforweeks; i++) {
            calendrier.innerHTML += '<div class="day-cell-empty"></div>';
        }

        // ajout de div de ce mois 
        let aujoudhui = new Date();
        // Boucle pour tous les jours du mois
        for (let jour = 1; jour <= nbrdayinmonth; jour++) {
            let datee = new Date(anne, mois, jour);

            // On formate la date en YYYY-MM-DD
            let moisPadded = String(mois + 1).padStart(2, '0');
            let jourPadded = String(jour).padStart(2, '0');
            let date = anne + '-' + moisPadded + '-' + jourPadded;

            let jourSemaine = datee.getDay();

            // weekand (class 'jour-semaine' hiya l 3adia)
            let divClasse = 'jour-semaine'; // L class l 3adia
            if (jourSemaine === 0 || jourSemaine === 6) { // 0 = Dimanche, 6 = Samedi
                divClasse += ' jour-semaine-weekend';
            }

            // aujourdhui
            // On vérifie si c'est le jour actuel
            if (anne === aujoudhui.getFullYear() && mois === aujoudhui.getMonth() && jour === aujoudhui.getDate()) {
                divClasse += ' jour-semaine-aujoudhui';
            }

            // la structure html des div de la grille 
            // Correction de la balise span (c'était </sapn>)
            calendrier.innerHTML +=
                '<div class="' + divClasse + '" data-date="' + date + '">' + // Khass " " 9bl data-date
                '<span class="day-number">' + jour + '</span>' + // Correction de la balise
                '<div class="resevations-container" id="res-container-' + date + '"></div>' +
                '</div>';
        }

        // les joures de next mois 
        let totalDiv = dayforweeks + nbrdayinmonth;
        let joursRes;
        if (totalDiv % 7 === 0) {
            joursRes = 0;
        } else {
            joursRes = 7 - (totalDiv % 7);
        }

        for (let i = 0; i < joursRes; i++) {
            calendrier.innerHTML += '<div class="day-cell-empty"></div>';
        }

        // tracer les reservations 
        tracerReservation();
    }

    function tracerReservation() {
        // vider tous les div 
        let container = document.querySelectorAll('.resevations-container');
        for (let i = 0; i < container.length; i++) {
            container[i].innerHTML = '';
        }

        // search logique
        // On parcourt toutes les réservations
        for (let i = 0; i < reservations.length; i++) {
            let rese = reservations[i];

            let isMacth = true;
            if (filtre) {
                // On vérifie le nom, type, heures...
                let nonRes = rese.nom.toLowerCase().includes(filtre);
                let typeRes = rese.type.toLowerCase().includes(filtre);
                let debutheure = rese.debut.includes(filtre);
                let finheure = rese.fin.includes(filtre);
                // On convertit le nombre de personnes en texte pour la recherche
                let nbrper = rese.personnes.toString().includes(filtre);

                // si le non ou le type et vrai 
                if (nonRes || typeRes || debutheure || finheure || nbrper) {
                    isMacth = true;
                } else {
                    isMacth = false;
                }
            }

            // le container de jour
            // On trouve le conteneur du bon jour
            let containerJour = document.getElementById('res-container-' + rese.jour);

            // si le container de jour existe 
            if (containerJour) {
                // ajout les class pour style des div des card et on stok les id de reservation 
                let card = document.createElement('div');
                card.classList.add('reservation-card', 'type-' + rese.type);
                card.dataset.id = rese.id;
                card.draggable = true; // draggable pour deplacement des reservation

                // si la reservation et pas dans le filter o la rend transparent
                // On rend transparent si ça ne correspond pas au filtre
                if (!isMacth) {
                    card.classList.add('reservation-card-transparent');
                }

                // afficher heure et le non + button supprimer et modifier avec leur style 
                // Le HTML de la carte de réservation
                card.innerHTML =
                    '<span class="event-info">' +
                    '<span class="font-bold">' + rese.debut + '</span>' +
                    '<span class="ml-1">' + rese.nom + '</span>' +
                    '</span>' +
                    '<div class="event-actions">' +
                    '<button class="btn-modifier text-blue-600 text-xs font-medium hover:underline p-1">Modifier</button>' + // Tss7i7 hna
                    '<button class="btn-supprimer text-red-600 text-xs font-medium hover:underline p-1">&times;</button>' +
                    '</div>';

                // On ajoute la carte au conteneur du jour
                containerJour.appendChild(card);

                // On active le 'drag' sur la carte
                card.addEventListener('dragstart', function (e) {
                    let currentCard = e.target.closest('.reservation-card');

                    // On vérifie si on déplace un élément non filtré
                    if (currentCard && !currentCard.classList.contains('reservation-card-transparent')) {
                        draggedId = currentCard.dataset.id; // Nsajlo l'ID dialo

                        // Nrdoh chfaf chwiya bach n3rfo rshna hazino
                        setTimeout(function () {
                            currentCard.classList.add('opacity-50');
                        }, 0);
                    } else {
                        e.preventDefault(); // Mkhlinahch ythzz ila kan filtré w mchafoch
                    }
                });

                // Quand on lâche la carte (fin du drag)
                card.addEventListener('dragend', function (e) {
                    e.target.classList.remove('opacity-50');
                    draggedId = null; // Nkhwiw l variable
                });
            }
        }
    }

    // gerer le click pour ajouter rejervation
    calendrier.addEventListener('click', function (e) {
        // On cherche le jour sur lequel on a cliqué
        let clickJour = e.target.closest('.jour-semaine');

        // On vérifie qu'on ne clique pas sur le weekend
        if (clickJour && !clickJour.classList.contains('jour-semaine-weekend')) {
            // si on ne click pas sur une reservation 
            if (!e.target.closest('.reservation-card')) {
                let date = clickJour.dataset.date;
                openForm(date); // Nssifto l date l function openForm
            }
        }
    });

    // gerer le click de modifier et supprimer 
    calendrier.addEventListener('click', function (e) {
        let click = e.target; // Had l variable mzyana

        // supprimer
        if (click.classList.contains('btn-supprimer')) {
            // On trouve la carte sur laquelle on a cliqué
            let card = click.closest('.reservation-card')
            let delateId = card.dataset.id;

            // confirmation 
            if (confirm('vous voulez vraiment supprimer la reservation')) {
                let newResvation = [];
                // on garde les resevation sauf supprimer 
                for (let i = 0; i < reservations.length; i++) {
                    if (reservations[i].id != parseInt(delateId)) {
                        newResvation.push(reservations[i]);
                    }
                }
                reservations = newResvation;

                // On redessine le calendrier
                tracerReservation();
                // On sauvegarde les changements
                saveToLocalStorage();
            }
        }

        //  modifier 
        //  ......................................................
        if (click.classList.contains('btn-modifier')) {
            let card = click.closest('.reservation-card');
            let editId = card.dataset.id;

            let reseToEdit = null;
            for (let j = 0; j < reservations.length; j++) {
                if (reservations[j].id === parseInt(editId)) {
                    reseToEdit = reservations[j];
                    break;
                }
            }
            // si il y a une reservation on rempli le form et le champ cache id , le titre de form 
            if (reseToEdit) {
                NonClient.value = reseToEdit.nom;
                heureDebut.value = reseToEdit.debut;
                heureFin.value = reseToEdit.fin;
                nbrPresonnes.value = reseToEdit.personnes;
                typeReservation.value = reseToEdit.type;
                formAjout.value = reseToEdit.jour; // Hada howa l input date
                formEdit.value = reseToEdit.id;
                titreModal.textContent = "Modifer la reservation ";

                //remove de class hidden 
                reservationModel.classList.remove('hidden');
            }
        }
    });

    // --- Gestion du Drag and Drop (Déposer) ---

    calendrier.addEventListener('dragover', function (e) {
        // On empêche le comportement par défaut pour autoriser le 'drop'
        e.preventDefault();

        let dropTarget = e.target.closest('.jour-semaine');
        // Nchofo wach hna fo9 nhar (machi weekend w machi empty)
        if (dropTarget && !dropTarget.classList.contains('jour-semaine-weekend') && !e.target.closest('.reservation-card')) {
            // Momkin tzid chi class hna bach tbyn l user fin ghadi y7t (ex: 'drag-over')
            dropTarget.classList.add('drag-over-target');
        }
    });

    // On enlève le style 'drag-over' quand la souris sort
    calendrier.addEventListener('dragleave', function (e) {
        let dropTarget = e.target.closest('.jour-semaine');
        if (dropTarget) {
            dropTarget.classList.remove('drag-over-target');
        }
    });

    // Quand on lâche la carte dans une nouvelle case
    calendrier.addEventListener('drop', function (e) {
        e.preventDefault(); // Nmn3o l comportement l 3adi

        let dropTarget = e.target.closest('.jour-semaine');
        // N7ydo l class dial l highlight
        if (dropTarget) {
            dropTarget.classList.remove('drag-over-target');
        }

        // Nchofo wach 7tina l card f blassa khassa (nhar, machi weekend, w 3ndna ID)
        if (dropTarget && !dropTarget.classList.contains('jour-semaine-weekend') && draggedId) {
            let newDate = dropTarget.dataset.date; // Njbdo l date jdid mn data-date

            // Nl9aw l reservation li kna hazin w nbddlo liha l date
            for (let i = 0; i < reservations.length; i++) {
                if (reservations[i].id === parseInt(draggedId)) {
                    reservations[i].jour = newDate; // Bddlna liha nhar
                    break;
                }
            }

            // Nsajlo l bdal w n3awdo nrsmo kolchi
            saveToLocalStorage();
            tracerReservation();
        }

        // Nnssaw l ID li kna hazin
        draggedId = null;
    });


    // logique de filter 
    // le filtere se refreche a chaque modification dans input de search 
    search.addEventListener('input', function (e) {
        filtre = e.target.value.toLowerCase();
        // On redessine les réservations avec le filtre
        tracerReservation();
    });

    // pour la fontionalite de mois precedant 
    prevWeek.addEventListener('click', function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        redesincalendrier(currentDate.getFullYear(), currentDate.getMonth());
        // thisWeek.innerText = "" // Hada khass ythyd, 'redesincalendrier' hiya li kat 3mrha
    });
    //  pour la fonctionalite de mois de suivant
    nextWeek.addEventListener('click', function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        redesincalendrier(currentDate.getFullYear(), currentDate.getMonth());
    })

    // logique de submit de form 
    formReservation.addEventListener('submit', function (e) {
        e.preventDefault();

        let newId;
        //  si il y a formEdit donc la modification , sinon est l'ajout  
        if (formEdit.value) {
            newId = parseInt(formEdit.value);
        } else {
            // dans l'ajout un id nouveau
            newId = Date.now();
        }

        // objet pour stoker les info de formulaire 
        let reservationData = {
            id: newId,
            jour: formAjout.value,
            nom: NonClient.value,
            debut: heureDebut.value,
            fin: heureFin.value,
            personnes: nbrPresonnes.value, // Hada radi yji string, mzn
            type: typeReservation.value,
        };

        //  si dans la modification 
        if (formEdit.value) {
            // on cherche l'ancien reservaation 
            let found = false;
            for (let i = 0; i < reservations.length; i++) {
                // on remplace par la nouvelle
                if (reservations[i].id === reservationData.id) {
                    reservations[i] = reservationData;
                    found = true;
                    break; // N7bsso l loop mli nl9awha
                }
            }
            if (!found) {
                reservations.push(reservationData);
            }
        } else {
            // sinon c est lajout 
            reservations.push(reservationData);
        }

        // On sauvegarde et on redessine
        saveToLocalStorage();
        tracerReservation();
        closeForm();
    });


    // --- Fonctions de Sauvegarde (LocalStorage) ---

    // Enregistre l'array 'reservations' dans le localStorage
    function saveToLocalStorage() {
        // N7wlo l array d 'reservations' l string JSON w nkhzno f localStorage
        localStorage.setItem('reservations-legourmet', JSON.stringify(reservations));
    }

    // Charge les réservations depuis le localStorage au démarrage
    function loadFromLocalStorage() {
        let data = localStorage.getItem('reservations-legourmet');
        if (data) {
            return JSON.parse(data); // Nrdoh array dial objects
        } else {
            return []; // Nrdo array khawya ila mal9ina walo
        }
    }


    // Nbdaw l application b l mois l7ali
    redesincalendrier(currentDate.getFullYear(), currentDate.getMonth());

});