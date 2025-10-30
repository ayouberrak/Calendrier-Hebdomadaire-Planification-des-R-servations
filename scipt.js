// On récupère tous les éléments DOM dont on aura besoin
let search = document.getElementById('search-filter');

let prevWeek = document.getElementById('prev-month-btn');
let thisWeek = document.getElementById('current-month-year');
let nextWeek = document.getElementById('next-month-btn');

let calendrier = document.getElementById('calendar-grid');
let reservationModel = document.getElementById('reservation-modal');
let titreModal = document.getElementById('modal-title');

let formEdit = document.getElementById('form-edit-id');
let formAjout = document.getElementById('form-jour'); // Hada howa l input <input type="hidden">

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
    
    let reservations = loadFromLocalStorage();

    let filtre = "";

    // function for open the form
    function openForm(date) {
        formReservation.reset();
        titreModal.textContent = "Ajouter reservation";
        formAjout.value = date; // Nsajlo l date li clickina 3liha f l input hidden
        formEdit.value = ""; // Nkhwiw l input dial l'edit
        
        // N7ydo l loun l 9dim mn select box
        typeReservation.classList.remove('select-standard', 'select-vip', 'select-anniversaire', 'select-groupe');

        reservationModel.classList.remove('hidden');
    }

    // function for close the form
    function closeForm() {
        reservationModel.classList.add('hidden');
    }

    //  the posibility for close the form  
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

        //  l'emplacement de premier jour dans la semaine (hna nrdoha 0 = Lundi, 6 = Dimanche)
        let dayforweeks = (dayforweek === 0) ? 6 : dayforweek - 1;


        // la valeur de mois et anne dans le titre
        thisWeek.textContent = firstdayinmonth.toLocaleDateString('fr-FR', {
            month: 'long', year: 'numeric'
        })

        // ajout de div de mois precendant 
        for (let i = 0; i < dayforweeks; i++) {
            calendrier.innerHTML += '<div class="day-cell-empty"></div>';
        }

        // ajout de div de ce mois 
        let aujoudhui = new Date();
        for (let jour = 1; jour <= nbrdayinmonth; jour++) {
            let datee = new Date(anne, mois, jour);

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
            if (anne === aujoudhui.getFullYear() && mois === aujoudhui.getMonth() && jour === aujoudhui.getDate()) {
                divClasse += ' jour-semaine-aujoudhui';
            }

            // la structure html des div de la grille 
            // Tss7i7: 'reservations-container' machi 'resevations-container'
            calendrier.innerHTML +=
                '<div class="' + divClasse + '" data-date="' + date + '">' + 
                '<span class="day-number">' + jour + '</span>' + 
                '<div class="reservations-container" id="res-container-' + date + '"></div>' + 
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
        let container = document.querySelectorAll('.reservations-container'); // S77e7t l ghalat dial l class
        for (let i = 0; i < container.length; i++) {
            container[i].innerHTML = '';
        }

        // search logique
        for (let i = 0; i < reservations.length; i++) {
            let rese = reservations[i];

            let isMacth = true;
            if (filtre) {
                let nonRes = rese.nom.toLowerCase().includes(filtre);
                let typeRes = rese.type.toLowerCase().includes(filtre);
                let debutheure = rese.debut.includes(filtre);
                let finheure = rese.fin.includes(filtre);
                let nbrper = rese.personnes.toString().includes(filtre);

                // si le non ou le type et vrai 
                if (nonRes || typeRes || debutheure || finheure || nbrper) {
                    isMacth = true;
                } else {
                    isMacth = false;
                }
            }

            // le container de jour
            let containerJour = document.getElementById('res-container-' + rese.jour);

            // si le container de jour existe 
            if (containerJour) {
                // ajout les class pour style des div des card et on stok les id de reservation 
                let card = document.createElement('div');
                card.classList.add('reservation-card', 'type-' + rese.type);
                card.dataset.id = rese.id;
                card.draggable = true; // draggable pour deplacement des reservation

                // si la reservation et pas dans le filter o la rend transparent
                if (!isMacth) {
                    card.classList.add('reservation-card-transparent');
                }

                // afficher heure et le non + button supprimer et modifier avec leur style 
                // 7yydt "font-bold" mn JS bach nkhliw CSS tcontroliha
                card.innerHTML =
                    '<span class="event-info">' +
                    '<span>' + rese.debut + '</span>' +
                    '<span class="ml-1">' + rese.nom + '</span>' +
                    '</span>' +
                    '<div class="event-actions">' +
                    '<button class="btn-modifier p-1">Mod</button>' + // 7yydt l classes dial tailwind
                    '<button class="btn-supprimer p-1">Sup</button>' + // 7yydt l classes dial tailwind
                    '</div>';

                containerJour.appendChild(card);

                // gestion de drag et drop 
                // quand on commance a gliser event
                card.addEventListener('dragstart', function (e) {
                    let currentCard = e.target.closest('.reservation-card');
                    
                    if (currentCard && !currentCard.classList.contains('reservation-card-transparent')) {
                        draggedId = currentCard.dataset.id; // Nsajlo l'ID dialo
                        
                        setTimeout(function () {
                            currentCard.classList.add('opacity-50');
                        }, 0);
                    } else {
                        e.preventDefault(); // Mkhlinahch ythzz ila kan filtré w mchafoch
                    }
                });

                card.addEventListener('dragend', function(e) {
                    // Ns77o l bug: e.target khass ykon howa l currentCard
                    let currentCard = e.target.closest('.reservation-card');
                    if (currentCard) {
                        currentCard.classList.remove('opacity-50');
                    }
                    draggedId = null; // Nkhwiw l variable
                });
            }
        }
    }

    // gerer le click pour ajouter rejervation
    calendrier.addEventListener('click', function (e) {
        let clickJour = e.target.closest('.jour-semaine');
        
        // si il click sur une div n'est pas dans le weekand
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
        let click = e.target; 

        // supprimer
        if (click.classList.contains('btn-supprimer')) {
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

                tracerReservation();
                saveToLocalStorage();
            }
        }

        //  modifier 
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
                formAjout.value = reseToEdit.jour; 
                formEdit.value = reseToEdit.id;
                titreModal.textContent = "Modifer la reservation ";

                // Nlwno l select box b l loun l 7ali
                typeReservation.classList.remove('select-standard', 'select-vip', 'select-anniversaire', 'select-groupe');
                typeReservation.classList.add('select-' + reseToEdit.type);

                //remove de class hidden 
                reservationModel.classList.remove('hidden');
            }
        }
    });

    // === GESTION DRAG & DROP ===
    calendrier.addEventListener('dragover', function(e) {
        e.preventDefault(); 
        
        let dropTarget = e.target.closest('.jour-semaine');
        if (dropTarget && !dropTarget.classList.contains('jour-semaine-weekend') && !e.target.closest('.reservation-card')) {
            dropTarget.classList.add('drag-over-target');
        }
    });

    calendrier.addEventListener('dragleave', function(e) {
        let dropTarget = e.target.closest('.jour-semaine');
        if (dropTarget) {
            dropTarget.classList.remove('drag-over-target');
        }
    });

    calendrier.addEventListener('drop', function(e) {
        e.preventDefault(); 
        
        let dropTarget = e.target.closest('.jour-semaine');
         if (dropTarget) {
             dropTarget.classList.remove('drag-over-target');
        }

        if (dropTarget && !dropTarget.classList.contains('jour-semaine-weekend') && draggedId) {
            let newDate = dropTarget.dataset.date; 
            
            for (let i = 0; i < reservations.length; i++) {
                if (reservations[i].id === parseInt(draggedId)) {
                    reservations[i].jour = newDate; 
                    break;
                }
            }
            
            saveToLocalStorage();
            tracerReservation();
        }
        
        draggedId = null;
    });


    // logique de filter 
    // le filtere se refreche a chaque modification dans input de search 
    search.addEventListener('input', function (e) {
        filtre = e.target.value.toLowerCase();
        tracerReservation();
    });

    // === CODE ZAYD BACH YLWWEN SELECT BOX ===
    typeReservation.addEventListener('change', function (e) {
        let selectedType = e.target.value;
        
        // 1. 7yyd ga3 l classes dial l alwan l 9dam
        e.target.classList.remove('select-standard', 'select-vip', 'select-anniversaire', 'select-groupe');

        // 2. Zid l class l jdida
        if (selectedType) {
            e.target.classList.add('select-' + selectedType);
        }
    });
    // === FIN DIAL CODE ZAYD ===


    // pour la fontionalite de mois precedant 
    prevWeek.addEventListener('click', function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        redesincalendrier(currentDate.getFullYear(), currentDate.getMonth());
    });
    //  pour la fonctionalite de mois de suivant
    nextWeek.addEventListener('click', function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        redesincalendrier(currentDate.getFullYear(), currentDate.getMonth());
    })


    // logique de submit de form 
    formReservation.addEventListener('submit', function (e) {
        e.preventDefault();

        // VALIDATION: Lw9t dial fin khasso ykon kber mn lw9t dial l bdaya
        if (heureFin.value <= heureDebut.value) {
            alert("L'heure de fin doit être après l'heure de début.");
            return; // Kan7bsso l function
        }

        let newId;
        //  si il y a formEdit donc la modification , sinon est l'ajout   
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
            personnes: nbrPresonnes.value, 
            type: typeReservation.value,
        };
    
    //  si dans la modification 
    if (formEdit.value) {
        // on cherche l'ancien reservaation 
        let found = false;
        for (let i = 0; i < reservations.length; i++) {
            // on remplace par la nouvelle
            if (reservations[i].id === reservationData.id) {
                reservations[i] = reservationData;
                found = true;
                break; 
            }
        }
        // Hada 7titat, normalment khass dima yl9ah
        if (!found) { 
            reservations.push(reservationData);
        }
    } else {
        // sinon c est lajout 
        reservations.push(reservationData);
    }

    saveToLocalStorage();
    tracerReservation();
    closeForm();
    });

    
    function saveToLocalStorage() {
        // Nrtbo l reservations 9bel manssajlohom
        reservations.sort((a, b) => {
            if (a.jour < b.jour) return -1;
            if (a.jour > b.jour) return 1;
            if (a.debut < b.debut) return -1;
            if (a.debut > b.debut) return 1;
            return 0;
        });
        localStorage.setItem('reservations-legourmet', JSON.stringify(reservations));
    }

    function loadFromLocalStorage() {
        let data = localStorage.getItem('reservations-legourmet');
        if (data) {
            return JSON.parse(data); 
        } else {
            return []; 
        }
    }


    redesincalendrier(currentDate.getFullYear(), currentDate.getMonth());

});