//   declaration des variables pour utiliser 
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

// pour la date de ajoudhui  
let currentDate = new Date();

//  function principale  pour eviter les rechargment des composant de la page 
document.addEventListener('DOMContentLoaded', function () {

    let draggedId = null; 
    
    let reservations = loadFromLocalStorage();

    let filtre = "";

    // pour ouvrir le formulaire 
    function openForm(date) {
        formReservation.reset();
        titreModal.textContent = "Ajouter reservation";
        formAjout.value = date; 
        formEdit.value = ""; 
        typeReservation.classList.remove('select-standard', 'select-vip', 'select-anniversaire', 'select-groupe');
        reservationModel.classList.remove('hidden');
    }
    // close 
    function closeForm() {
        reservationModel.classList.add('hidden');
    }

    // les cas pour closer le form 
    stopReservation.addEventListener('click', closeForm);
    cancel.addEventListener('click', closeForm);

    reservationModel.addEventListener('click', function (e) {
        if (e.target === reservationModel) {
            closeForm();
        }
    })

    // tracer les div de calender 
    function desinercalender(anne, mois) {

        
        calendrier.innerHTML = "";
        // le premier jour , 31 or 30 , emplacemt de 1/../....  
        let firstdayinmonth = new Date(anne, mois, 1);
        let nbrdayinmonth = new Date(anne, mois + 1, 0).getDate();
        let dayforweek = firstdayinmonth.getDay();

        // si est dimenche il re tourn a lundi
        let dayforweeks;
        if (dayforweek === 0) {
            dayforweeks = 6;
        } else {
            dayforweeks = dayforweek - 1;
        }
        
        // forma de de mois / anne 
        thisWeek.textContent = firstdayinmonth.toLocaleDateString('fr-FR', {
            month: 'long', year: 'numeric'
        })

        // pour les jour avant 1
        for (let i = 0; i < dayforweeks; i++) {
            calendrier.innerHTML += '<div class="day-cell-empty"></div>';
        }

        // tracer les jour de mois 
        let aujoudhui = new Date();
        for (let jour = 1; jour <= nbrdayinmonth; jour++) {
            let datee = new Date(anne, mois, jour);

            let moisPadded = String(mois + 1).padStart(2, '0');
            let jourPadded = String(jour).padStart(2, '0');
            let date = anne + '-' + moisPadded + '-' + jourPadded;

            let jourSemaine = datee.getDay();
            
            // weekend 
            let divClasse = 'jour-semaine'; 
            if (jourSemaine === 0 || jourSemaine === 6) { 
                divClasse += ' jour-semaine-weekend';
            }

            // current date
            if (anne === aujoudhui.getFullYear() && mois === aujoudhui.getMonth() && jour === aujoudhui.getDate()) {
                divClasse += ' jour-semaine-aujoudhui';
            }
          //  tous les jours 
            calendrier.innerHTML +=
                '<div class="' + divClasse + '" data-date="' + date + '">' + 
                '<span class="day-number">' + jour + '</span>' + 
                '<div class="reservations-container" id="res-container-' + date + '"></div>' + 
                '</div>';
        }
        
        // les ligne de calender 
        let totalDiv = dayforweeks + nbrdayinmonth;
        let joursRes;
        if (totalDiv % 7 === 0) {
            joursRes = 0;
        } else {
            joursRes = 7 - (totalDiv % 7);
        }

        // pour les apres 31
        for (let i = 0; i < joursRes; i++) {
            calendrier.innerHTML += '<div class="day-cell-empty"></div>';
        }
        tracerReservation();
    }

    // tracer reservations 
    function tracerReservation() {

        let container = document.querySelectorAll('.reservations-container');
        // vider le conatainer 
        for (let i = 0; i < container.length; i++) {
            container[i].innerHTML = '';
        }
        // 
        for (let i = 0; i < reservations.length; i++) {
            let rese = reservations[i];

            let isMacth = true;
            // si il ya une recherche
            if (filtre) {
                // filter inclus dans les champs 
                let nonRes = rese.nom.toLowerCase().includes(filtre);
                let typeRes = rese.type.toLowerCase().includes(filtre);
                let debutheure = rese.debut.includes(filtre);
                let finheure = rese.fin.includes(filtre);
                let nbrper = rese.personnes.toString().includes(filtre);
                //  si il trouve un de c'est chanps => affiche
                if (nonRes || typeRes || debutheure || finheure || nbrper) {
                    isMacth = true;
                } else {
                    isMacth = false;
                }
            }
            // exemple  "res-container-2025-10-31"
            let containerJour = document.getElementById('res-container-' + rese.jour);
            
            // cree les div de reservation 
            if (containerJour) {
                let card = document.createElement('div');
                card.classList.add('reservation-card', 'type-' + rese.type);
                card.dataset.id = rese.id;
                // clee de drag & drop
                card.draggable = true; 
                // si il ya pas dans le search il va etre opacity 50
                if (!isMacth) {
                    card.classList.add('reservation-card-transparent');
                }
                // html sturcture
                card.innerHTML =
                    '<span class="event-info">' +
                    '<span>' + rese.debut + '</span>' +
                    '<span class="ml-1">' + rese.nom + '</span>' +
                    '</span>' +
                    '<div class="event-actions">' +
                    '<button class="btn-modifier p-1">Mod</button>' + 
                    '<button class="btn-supprimer p-1">Sup</button>' + 
                    '</div>';
                // append in card calender 
                containerJour.appendChild(card);
                
                // logique de drag & drop 
                card.addEventListener('dragstart', function (e) {
                    let currentCard = e.target.closest('.reservation-card');
                    // si il est filtree 
                    if (currentCard && !currentCard.classList.contains('reservation-card-transparent')) {
                        draggedId = currentCard.dataset.id; 
                        setTimeout(function () {
                            currentCard.classList.add('opacity-50');
                        }, 0);
                    } else {
                        e.preventDefault();
                    }
                });
                // sinon
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
    
    // gestion de ouvrir le form
    calendrier.addEventListener('click', function (e) {
        let clickJour = e.target.closest('.jour-semaine');
        
        if (clickJour && !clickJour.classList.contains('jour-semaine-weekend')) {
            if (!e.target.closest('.reservation-card')) {
                let date = clickJour.dataset.date;
                openForm(date);
            }
        }
    });

    calendrier.addEventListener('click', function (e) {
        let click = e.target; 

        if (click.classList.contains('btn-supprimer')) {
            let card = click.closest('.reservation-card')
            let delateId = card.dataset.id;

            if (confirm('vous voulez vraiment supprimer la reservation')) {
                let newResvation = [];
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
            if (reseToEdit) {
                NonClient.value = reseToEdit.nom;
                heureDebut.value = reseToEdit.debut;
                heureFin.value = reseToEdit.fin;
                nbrPresonnes.value = reseToEdit.personnes;
                typeReservation.value = reseToEdit.type;
                formAjout.value = reseToEdit.jour; 
                formEdit.value = reseToEdit.id;
                titreModal.textContent = "Modifer la reservation ";

                typeReservation.classList.remove('select-standard', 'select-vip', 'select-anniversaire', 'select-groupe');
                typeReservation.classList.add('select-' + reseToEdit.type);

                reservationModel.classList.remove('hidden');
            }
        }
    });

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

    search.addEventListener('input', function (e) {
        filtre = e.target.value.toLowerCase();
        tracerReservation();
    });

    typeReservation.addEventListener('change', function (e) {
        let selectedType = e.target.value;
        
        e.target.classList.remove('select-standard', 'select-vip', 'select-anniversaire', 'select-groupe');

        if (selectedType) {
            e.target.classList.add('select-' + selectedType);
        }
    });

    prevWeek.addEventListener('click', function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        desinercalender(currentDate.getFullYear(), currentDate.getMonth());
    });
    nextWeek.addEventListener('click', function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        desinercalender(currentDate.getFullYear(), currentDate.getMonth());
    })


    formReservation.addEventListener('submit', function (e) {
        e.preventDefault();

        if (heureFin.value <= heureDebut.value) {
            alert("L'heure de fin doit être après l'heure de début.");
            return; 
        }

        let newId;
        if (formEdit.value) {
            newId = parseInt(formEdit.value);
        } else {
            newId = Date.now();
        }
        
    let reservationData = {
            id: newId,
            jour: formAjout.value,
            nom: NonClient.value,
            debut: heureDebut.value,
            fin: heureFin.value,
            personnes: nbrPresonnes.value, 
            type: typeReservation.value,
        };
    
    if (formEdit.value) {
        let found = false;
        for (let i = 0; i < reservations.length; i++) {
            if (reservations[i].id === reservationData.id) {
                reservations[i] = reservationData;
                found = true;
                break; 
            }
        }
        if (!found) { 
            reservations.push(reservationData);
        }
    } else {
        reservations.push(reservationData);
    }

    saveToLocalStorage();
    tracerReservation();
    closeForm();
    });

    
    function saveToLocalStorage() {
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


    desinercalender(currentDate.getFullYear(), currentDate.getMonth());

});