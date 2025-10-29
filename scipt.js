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
    let nbrdayinmonth = new Date(anne,mois+1,0).getDate;
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

    






  }








})

