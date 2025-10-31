let search = document.getElementById('search-filter');

let prevWeek = document.getElementById('prev-month-btn');
let thisWeek = document.getElementById('current-month-year');
let nextWeek = document.getElementById('next-month-btn');

let calendrier = document.getElementById('calendar-grid');
let reservationModel = document.getElementById('reservation-modal');
let titreModal = document.getElementById('modal-title');

let formEdit = document.getElementById('form-edit-id');
let formAjout = document.getElementById('form-jour');

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

    let draggedId = null; 
    
    let reservations = loadFromLocalStorage();

    let filtre = "";
    function openForm(date) {
        formReservation.reset();
        titreModal.textContent = "Ajouter reservation";
        formAjout.value = date; 
        formEdit.value = ""; 
        typeReservation.classList.remove('select-standard', 'select-vip', 'select-anniversaire', 'select-groupe');
        reservationModel.classList.remove('hidden');
    }
    function closeForm() {
        reservationModel.classList.add('hidden');
    }

    stopReservation.addEventListener('click', closeForm);
    cancel.addEventListener('click', closeForm);

    reservationModel.addEventListener('click', function (e) {
        if (e.target === reservationModel) {
            closeForm();
        }
    })

    function redesincalendrier(anne, mois) {
        calendrier.innerHTML = "";
        let firstdayinmonth = new Date(anne, mois, 1);
        let nbrdayinmonth = new Date(anne, mois + 1, 0).getDate();
        let dayforweek = firstdayinmonth.getDay();

        let dayforweeks = (dayforweek === 0) ? 6 : dayforweek - 1;

        thisWeek.textContent = firstdayinmonth.toLocaleDateString('fr-FR', {
            month: 'long', year: 'numeric'
        })
        for (let i = 0; i < dayforweeks; i++) {
            calendrier.innerHTML += '<div class="day-cell-empty"></div>';
        }
        let aujoudhui = new Date();
        for (let jour = 1; jour <= nbrdayinmonth; jour++) {
            let datee = new Date(anne, mois, jour);

            let moisPadded = String(mois + 1).padStart(2, '0');
            let jourPadded = String(jour).padStart(2, '0');
            let date = anne + '-' + moisPadded + '-' + jourPadded;

            let jourSemaine = datee.getDay();

            let divClasse = 'jour-semaine'; 
            if (jourSemaine === 0 || jourSemaine === 6) { 
                divClasse += ' jour-semaine-weekend';
            }

            if (anne === aujoudhui.getFullYear() && mois === aujoudhui.getMonth() && jour === aujoudhui.getDate()) {
                divClasse += ' jour-semaine-aujoudhui';
            }

            calendrier.innerHTML +=
                '<div class="' + divClasse + '" data-date="' + date + '">' + 
                '<span class="day-number">' + jour + '</span>' + 
                '<div class="reservations-container" id="res-container-' + date + '"></div>' + 
                '</div>';
        }

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
        tracerReservation();
    }

    function tracerReservation() {
        let container = document.querySelectorAll('.reservations-container');
        for (let i = 0; i < container.length; i++) {
            container[i].innerHTML = '';
        }
        for (let i = 0; i < reservations.length; i++) {
            let rese = reservations[i];

            let isMacth = true;
            if (filtre) {
                let nonRes = rese.nom.toLowerCase().includes(filtre);
                let typeRes = rese.type.toLowerCase().includes(filtre);
                let debutheure = rese.debut.includes(filtre);
                let finheure = rese.fin.includes(filtre);
                let nbrper = rese.personnes.toString().includes(filtre);

                if (nonRes || typeRes || debutheure || finheure || nbrper) {
                    isMacth = true;
                } else {
                    isMacth = false;
                }
            }

            let containerJour = document.getElementById('res-container-' + rese.jour);
            if (containerJour) {
                let card = document.createElement('div');
                card.classList.add('reservation-card', 'type-' + rese.type);
                card.dataset.id = rese.id;
                card.draggable = true; 
                if (!isMacth) {
                    card.classList.add('reservation-card-transparent');
                }

                card.innerHTML =
                    '<span class="event-info">' +
                    '<span>' + rese.debut + '</span>' +
                    '<span class="ml-1">' + rese.nom + '</span>' +
                    '</span>' +
                    '<div class="event-actions">' +
                    '<button class="btn-modifier p-1">Mod</button>' + 
                    '<button class="btn-supprimer p-1">Sup</button>' + 
                    '</div>';

                containerJour.appendChild(card);

                card.addEventListener('dragstart', function (e) {
                    let currentCard = e.target.closest('.reservation-card');
                    
                    if (currentCard && !currentCard.classList.contains('reservation-card-transparent')) {
                        draggedId = currentCard.dataset.id; 
                        
                        setTimeout(function () {
                            currentCard.classList.add('opacity-50');
                        }, 0);
                    } else {
                        e.preventDefault();
                    }
                });

                card.addEventListener('dragend', function(e) {
                    let currentCard = e.target.closest('.reservation-card');
                    if (currentCard) {
                        currentCard.classList.remove('opacity-50');
                    }
                    draggedId = null; 
                });
            }
        }
    }

    calendrier.addEventListener('click', function (e) {
        let clickJour = e.target.closest('.jour-semaine');
        
        if (clickJour && !clickJour.classList.contains('jour-semaine-weekend')) {
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