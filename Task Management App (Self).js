//object for localstorage
let arrayobject={};
window.onload=function(){



   
    let silentreload=false;
   let audio=null;
    //notification permission on top
    if ("Notification" in window) {
    Notification.requestPermission();
}
const addbtn = document.querySelector('.Add');
const delbtn = document.querySelector(".Delete");
const textA = document.querySelector('.textArea-cont');
const date = document.getElementById('deadline');
const colour = document.querySelectorAll('.priority-color');
let colour1 = "lightpink";
const modalcont = document.querySelector('.modal-cont');
const container = document.querySelector('.container');

// priority order for sorting / cycling
const arr = ["yellow", "lightgreen", "lightblue", "lightpink"];

const lock = "fa-lock";
const unlock = "fa-lock-open";

let modalflag = false;



// ====================== NAVBAR FILTER ELEMENTS ======================
const filtersPanel = document.querySelector('.fam');
const priorityCircles = filtersPanel.querySelectorAll('.cir');
const sortPriorityBtn = filtersPanel.querySelector('.sort-priority');
const sortDueBtn = filtersPanel.querySelector('.sort-due');
const clearFiltersBtn = filtersPanel.querySelector('.clear-filters');


// SHOW ALL TICKETS
function showAllTickets() {
    const tickets = container.querySelectorAll(".ticket");
    tickets.forEach(t => t.style.display = "flex");
}

// ====================== PRIORITY CIRCLE FILTER ======================
priorityCircles.forEach(circle => {
    circle.addEventListener('click', () => {
        const selectedColor = circle.dataset.color;
          console.log(selectedColor);
        // active state
        priorityCircles.forEach(c => c.classList.remove('active'));
        circle.classList.add('active');

        const tickets = container.querySelectorAll(".ticket");

        tickets.forEach(ticket => {
            const bar = ticket.querySelector(".ticket-color");
            const ticketColor = bar.dataset.color;
            
           if (ticketColor === selectedColor) {
    ticket.style.setProperty("display", "flex", "important");//this overides css
} else {
    ticket.style.setProperty("display", "none", "important");
}

        });
    });
});

// ====================== SORT BY PRIORITY ======================
sortPriorityBtn.addEventListener('click', () => {
    const tickets = Array.from(container.querySelectorAll(".ticket"));

    tickets.sort((a, b) => {
        const colorA = a.querySelector(".ticket-color").dataset.color;
        const colorB = b.querySelector(".ticket-color").dataset.color;
        return arr.indexOf(colorA) - arr.indexOf(colorB);
    });

    tickets.forEach(t => container.appendChild(t));
});

// ====================== SORT BY DUE DATE ======================
sortDueBtn.addEventListener('click', () => {
    const tickets = Array.from(container.querySelectorAll(".ticket"));

    tickets.sort((a, b) => {
        const aDate = new Date(a.querySelector(".deadline-input").value);
        const bDate = new Date(b.querySelector(".deadline-input").value);
        return aDate - bDate;
    });

    tickets.forEach(t => container.appendChild(t));
});

// ====================== CLEAR FILTERS ======================
clearFiltersBtn.addEventListener("click", () => {
    // remove active filter UI
    priorityCircles.forEach(c => c.classList.remove("active"));

    // show all
    showAllTickets();

    // restore original order by calling from localstorage
    silentreload=true;
    container.innerHTML = "";       
    loadtickets(); 
    silentreload=false;
});


// ====================== MODAL OPEN/CLOSE ======================
addbtn.addEventListener("click", function () {
    modalcont.style.display = modalflag ? "none" : "flex";
    modalflag = !modalflag;
});

// ====================== DELETE MODE ======================
let delflag = false;
delbtn.addEventListener("click", function () {
    const alldelete = document.querySelectorAll('.ticket-delete');
    delflag = !delflag;

    alldelete.forEach(function (del) {
        del.style.display = delflag ? 'block' : 'none';
    });
});

// ====================== DELETE SPECIFIC TICKET ======================
container.addEventListener("click", function (e) {
    if (e.target.classList.contains("ticket-delete")) {
        const ticket = e.target.closest(".ticket");
        const id=ticket.dataset.id;
         delete arrayobject[id];
        localStorage.setItem("tickets",JSON.stringify(arrayobject));
        ticket.remove();
       
    }
});

//Notification and Audio System

function notification(ticket){

    if(silentreload)return;

   audio=new Audio("Alarm.wav");
   audio.loop=true;
    audio.play();

  if(Notification.permission==="granted"){
    new Notification("The Deadline Has Passed!",{
         body:  ticket.querySelector('.ticket-area').textContent,
         icon: "alarm.jpeg"
    });
  }
  ticket.classList.add('expired');
}
//to pause the alarm
document.body.addEventListener("click", () => {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;  // reset
        audio = null;
    }
});

// ====================== TIME LEFT DISPLAY ======================
function updateTimeLeft(datelocal, timeleft,ticket) {
    if (!datelocal.value) {
        timeleft.textContent = "No deadline set";
        return;
    }

    const future = new Date(datelocal.value);
    const now = new Date();
    const rem = future - now;

    if (rem <= 0){ 
        
        if(ticket.dataset.expired === "false") {
    ticket.dataset.expired = "true";
    notification(ticket);
    
    }
    timeleft.style.color = "red";
        timeleft.textContent = "⚠ Deadline passed";
        return;
}
     else {
        const minutes = Math.floor(rem / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        const remHours = hours % 24;
        const remMinutes = minutes % 60;

        timeleft.style.color = "";
        timeleft.textContent =
            `${days} days ${remHours} hours ${remMinutes} minutes left`;
    }
}

// Refresh The timer
function refresh() {
    const allTickets = container.querySelectorAll('.ticket');

    allTickets.forEach(ticket => {

        const timeleft = ticket.querySelector('.deadline-left');
        const timeinput = ticket.querySelector('.deadline-input');

        const lockIcon = ticket.querySelector('.ticket-lock i');
        const isLocked = lockIcon.classList.contains("fa-lock");

        // Only update when locked AND countdown is visible
        if (isLocked && timeinput.disabled===true) {
            updateTimeLeft(timeinput, timeleft,ticket);
        }
        
    });
}

setInterval(refresh, 1000);


// ====================== GENERATE TICKET ======================
function generate(text, date2, colour2,uniqueid=genunid(),expired="false") {
    const tickets = document.createElement('div');
    tickets.classList.add("ticket");

    tickets.dataset.id=uniqueid;
     tickets.dataset.expired = expired.toString();//imp to convert as it checks the string not boolean 

    tickets.innerHTML = `
        <div class="ticket-color" data-color="${colour2}" style="background-color:${colour2}"></div>
        <div class="ticket-lock"><i class="fa-solid ${lock}"></i></div>

        <div class="deadline">
            <input type="datetime-local" class="deadline-input" value="${date2}">
            <div class="deadline-left"></div>
        </div>

        <div class="ticket-area" contenteditable="false">${text}</div>
        <div class="ticket-delete">X</div>
    `;

    const datelocal = tickets.querySelector('.deadline-input');
    const timeleft = tickets.querySelector('.deadline-left');

    arrayobject[uniqueid]={
       text:text,
       deadline:date2,
       color: colour2,
       expired:expired.toString()

    };
    localStorage.setItem("tickets",JSON.stringify(arrayobject));

    updateTimeLeft(datelocal, timeleft,tickets);
    
    container.appendChild(tickets);
    lockTicket(tickets);
    colorchange(arr, tickets);
    //to call the function for ticking down
     refresh();
}
//to generate the unique ids

function genunid()
{
  return "t_"+Date.now();
}
//to load ticktes first
    loadtickets();
     
function loadtickets()
{
    const items=(localStorage.getItem("tickets"));
    if(!items)return; //no data inside it

    arrayobject=JSON.parse(items);

    for(let uniqueid in arrayobject)
    {
        const t=arrayobject[uniqueid];
        generate(t.text,t.deadline,t.color,uniqueid,t.expired);
    }
}
 

// ====================== MODAL PRIORITY COLOR PICKER ======================
colour.forEach(colorBox => {
    colorBox.addEventListener('click', function () {
        colour.forEach(c => c.classList.remove("active"));
        colorBox.classList.add("active");

        colour1 = colorBox.classList[0]; // lightpink/lightblue/etc.
    });
});

// ====================== SUBMIT TICKET (SHIFT + ENTER) ======================
modalcont.addEventListener("keydown", function (e) {
    const txt = textA.value.trim();
    const date1 = date.value.trim();

    if (e.key === "Enter" && e.shiftKey) {
        modalcont.style.display = "none";
        modalflag = false;

        generate(txt, date1, colour1);

        textA.value = '';
        date.value = '';
    }
});

// ====================== FIXED COLOR CHANGE FUNCTION ======================
function colorchange(arr, tickets) {
    const bar = tickets.querySelector(".ticket-color");
     const id=tickets.dataset.id;
    bar.addEventListener("click", function () {
        if (bar.style.pointerEvents === "none") return;

        let current = bar.dataset.color;
        let index = arr.indexOf(current);
        if (index === -1) index = 0;

        const next = arr[(index + 1) % arr.length];

        bar.dataset.color = next;
        bar.style.backgroundColor = next;

        arrayobject[id].color = next;
localStorage.setItem("tickets", JSON.stringify(arrayobject));

    });
}

// ====================== LOCK / UNLOCK LOGIC ======================
function lockTicket(tickets) {
    const changes = tickets.querySelector('.ticket-lock i');
    let lockflag = false;
    const tickettext = tickets.querySelector('.ticket-area');
    const datetime = tickets.querySelector('.deadline-input');
    const timeleft = tickets.querySelector('.deadline-left');
    const bar = tickets.querySelector('.ticket-color');

    const id=tickets.dataset.id;
   
    // INITIAL STATE: LOCKED
    tickettext.setAttribute("contenteditable", "false");
    datetime.disabled = true;
    datetime.style.display = "none";
    timeleft.style.display = "block";
    updateTimeLeft(datetime, timeleft,tickets);
    bar.style.pointerEvents = "none";

    changes.classList.remove(unlock);
    changes.classList.add(lock);

     datetime.addEventListener('input',function(){
        tickets.dataset.expired="false";
        
        arrayobject[id].deadline=datetime.value;
        arrayobject[id].expired="false";
        localStorage.setItem("tickets",JSON.stringify(arrayobject));
    })

    changes.addEventListener('click', function () {
        lockflag = !lockflag;

        if (lockflag) {
            // UNLOCK
            changes.classList.remove(lock);
            changes.classList.add(unlock);

            tickettext.setAttribute("contenteditable", "true");
            datetime.disabled = false;
            datetime.style.display = "block";
            timeleft.style.display = "none";
            bar.style.pointerEvents = "auto";
            
            //to store in localstorage when changed the text
    
    tickettext.addEventListener('input',function(){
        
        arrayobject[id].text=tickettext.textContent;
        localStorage.setItem("tickets",JSON.stringify(arrayobject));
    })

   
        } else {
            // LOCK AGAIN
            changes.classList.remove(unlock);
            changes.classList.add(lock);

            tickettext.setAttribute("contenteditable", "false");
            datetime.disabled = true;
            datetime.style.display = "none";
            timeleft.style.display = "block";
            updateTimeLeft(datetime, timeleft);
            bar.style.pointerEvents = "none";
        }
                 
    });
    
}



}