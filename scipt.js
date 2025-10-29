let search = document.getElementById('search-filter');

let prevWeek = document.getElementById('prev-month-btn');
let thisWeek = document.getElementById('current-month-year');
let nextWeek = document.getElementById('next-month-btn');

let calendrier = document.getElementById('calendar-grid');
let reservationModel = document.getElementById('reservation-modal');
let titreModal = document.getElementById('modal-title');

let formEdit= document.getElementById('form-edit-id');
let formAjout = document.getElementById('form-jour');

let formReservation =document.getElementById('reservation-form');

let NonClient = document.getElementById('nom-client');
let heureDebut = document.getElementById('heure-debut');
let heureFin = document.getElementById('heure-fin');
let nbrPresonnes = document.getElementById('nombre-personnes');
let typeReservation = document.getElementById('type-reservation');

let stopReservation = document.getElementById('close-modal-btn');
let cancel =document.getElementById('cancel-btn');



document.addEventListener('DOMContentLoaded',function(){


  const date =new Date();

  let reservations = []; 

  // function for open the form
  function openForm(){
    reservationModel.reset();
    titreModal.textContent="Ajouter reservation";
    formAjout.value=date;
    formEdit.value="";
    reservationModel.classList.remove('hidden');
  }
  // function for close the form
  function closeForm(){
    reservationModel.classList.add('hidden');
  }

  //  the posibility for close the form  
  stopReservation.addEventListener('click' , closeForm);
  cancel.addEventListener('click',closeForm);

  reservationModel.addEventListener('click' , function(e){
    if(e.target === reservationModel){
      closeForm();
    }
  })

  function desincalendrier(anne,mois){
    calendrier.innerHTML="";
    // first day of month , nombre de jours de mois , l'emplacement de premier jour dans la semaine
    let firstdayinmonth = new Date(anne,mois,1);
    let nbrdayinmonth = new Date(anne,mois+1,0).getDate();
    let dayforweek = firstdayinmonth.getDay();

    //  l'emplacement de premier jour dans la semaine
    let dayforweeks ;
    if(dayforweek === 6){
      dayforweeks = 1 
    }else{
      dayforweeks = dayforweek-1
    }

    // la valeur de mois et anne dans le titre
    thisWeek.textContent = firstdayinmonth.toLocaleDateString('fr-FR' , {
      mois:'long' , anne:'numeric'
    })

    // ajout de div de mois precendant 
    for(let i = 0; i < dayforweeks;i++){
      calendrier.innerHTML += '<div class="day-cell-empty"></div>';
    }

    // ajout de div de ce mois 
    let aujoudhui = new Date();
    for (let jour = 1 ; jour<dayforweeks ; jour++){
      let datee = new Date(anne,mois,jour);
      
      let date = anne + '-' +mois + '-'+jour;
      let jourSemaine = datee.getDay();

      // weekand 
      let divClasse = 'jour-semaine';
      if (jourSemaine === 0 || jourSemaine ===6){
        divClasse += 'jour-semaine-weekend';
      }

      // aujourdhui
      if(anne === aujoudhui.getFullYear() && mois === aujoudhui.getMonth && jour === aujoudhui.getDate()){
        divClasse += 'jour-semaine-aujoudhui';
      }

      // la structure html des div de la grille 
      calendrier.innerHTML += 
        '<div class ="'+divClasse + 'data-date="'+ date + '">'+
            '<span class="day-number">'+day+'</sapn>'+
            '<div class="resevations-container" id="res-container-'+date+'"></div>'+
        '</div>';
    }

    // les joures de next mois 
    let totalDiv = dayforweeks + nbrdayinmonth;
    let joursRes;
    if(totalDiv % 7 ===0){
      joursRes = 0;
    }else {
      joursRes = 7 -(totalDiv % 7);
    }

    for (let i = 0 ; i <joursRes ; i++){
      calendrier.innerHTML += '<div class="day-cell-empty"></div>';
    }

    // tracer les reservations 
    tracerReservation();
  }

  let filtre = "";
  function tracerReservation(){
    // vider tous les div 
    let container = document.querySelectorAll('.resevations-container');
    for (let i = 0 ; i<container.length ;i++){
      container[i].innerHTML = '';
    }
    
    
    // search logique
    for (let i = 0;i<reservations.length;j++){
      let rese=reservations[i];

      let isMacth = true;
      if(filtre){
        let nonRes = rese.non.toLowerCase().includes(filtre);
        let typeRes = rese.type.toLowerCase().includes(filtre);
        let debutheure = rese.debut.includes(filtre);
        let finheure = rese.fin.includes(filtre);
        let nbrper = rese.personnes.includes(filtre);

        // si le non ou le type et vrai 
        if(nonRes || typeRes ||  debutheure){
          isMacth = true;
        }else{
          isMacth = false;
        }
      }

    // le container de jour
    let container = document.getElementById('res-container-'+rese.jour);

    // si le container de jour existe 
    if(container){
      // ajout les class pour style des div des card et on stok les id de reservation 
      let card = document.createElement('div');
      card.classList.add('reservation-card','type-'+rese.type);
      card.dataset.id = rese.id;
      card.draggable = true; // draggable pour deplacement des reservation
    }

    // si la reservation et pas dans le filter o la rend transparent
    if(!isMacth){
      crad.classList.add('reservation-card-transparent');
    }

    // afficher heure et le non + button supprimer et modifier avec leur style 
    card.innerHTML=
          '<span class="event-info">' +
                  '<span class="font-bold">' + rese.debut + '</span>' +
                  '<span class="ml-1">' + rese.nom + '</span>' +
          '</span>' +
          '<div class="event-actions">' +
                  '<button class="btn-modifier text-blue-600 text-xs font-medium hover:underline p-1"><Modifier></button>' +
                  '<button class="btn-supprimer text-red-600 text-xs font-medium hover:underline p-1">&times;</button>' +
          '</div>';
    }
  }

  // gerer le click pour ajouter rejervation
  calendrier.addEventListener('click' , function(e){
    let clickJour = e.target.closest('.day-cell');
    // si il click sur une div n'est pas dans le weekand
    if(clickJour && !clickJour.classList.contains('day-cell-weekend')){
      // si on ne click pas sur une reservation 
      if(!e.target.closest('.reservation-card')){
        let date = clickJour.dataset.date;
        openForm(date);
      }
    }
  });

  // gerer le click de modifier et supprimer 
  calendrier.addEventListener('click',function(e){
    let click = e.target;

    // supprimer
    if(click.classList.contains('btn-supprimer')){
      let card = target.closest('.reservation-card')
      let delateId = card.dataset.id;

      // confirmation 
      if(confirm('vous voulez vraiment supprimer la reservation')){
        let newResvation = [];
        // on garde les resevation sauf supprimer 
        for (let i =0 ; i<reservations.length;i++){
          if(reservations[i].id != parseInt(delateId)){
            newResvation.push(reservations[i]);
          }
        }
        reservations = newResvation;

        renderReservations();
        saveToLocalStorage();
      }
    }

    //  modifier 
    //  ......................................................
    if(target.classList.contains('btn-modifier')){
      let card = target.closest('.reservation-card');
      let editId = card.dataset.id;

      let reseToEdit = null;
      for(let j =0;j<reservations.length;j++){
        if(reservations[j].id === parseInt(editId)){
          reseToEdit = reservations[j];
          break;
        }
      }
      if(reseToEdit){
        NonClient.value =reseToEdit.non;
        heureDebut.value = reseToEdit.debut;
        heureFin.value=reseToEdit.fin;
        nbrPresonnes.value=reseToEdit.personnes;
        typeReservation.value=reseToEdit.type;
      }
    }

  });








})