
let brett = {
    element: null,
    bredde: 360,
    høyde: 640
};


let fugl = {
    x: brett.bredde / 8,
    y: brett.høyde / 2,
    bredde: 34,
    høyde: 24
};


let rør = {
    array: [],
    bredde: 64,
    høyde: 512,
    x: brett.bredde,
    y: 0
};


let fysikk = {
    fartX: -2,
    fartY: 0,
    tyngdekraft: 0.4
};


let spill = {
    slutt: false,
    poeng: 0
};

let toppRør = {
    bilde: null
};

let bunnRør = {
    bilde: null
};


const flakseLydfil = new Audio("Lyder/flappyflaks.mp3");
const stolpeTrefferLydfil = new Audio("Lyder/flappy-treff-stolpe.mp3");
const dødLydfil = new Audio("Lyder/flappydie.mp3");
const poengLydfil = new Audio("Lyder/flappypoint.mp3");

let rørIntervall = null;

let leaderboard = [];


function resetSpill() {
    console.log("RESET Spill")
    if (rørIntervall) {
        clearInterval(rørIntervall);
        rørIntervall = null;
        console.log("clearinterval")
    }
    fugl.y = brett.høyde / 2;
    rør.array = [];
    fysikk.fartX=-2
    fysikk.fartY=0
    spill.poeng = 0;
    spill.slutt = false;
}

function oppdater() {

    if (spill.slutt) {
        return;
 
    }

    kontekst.clearRect(0, 0, brett.element.width, brett.element.height);

    // Fugl
    fysikk.fartY += fysikk.tyngdekraft;
    fugl.y = Math.max(fugl.y + fysikk.fartY, 0);
    kontekst.drawImage(fugl.bilde, fugl.x, fugl.y, fugl.bredde, fugl.høyde);

    if (fugl.y > brett.høyde || fugl.y < 0) {
        spill.slutt = true;
        spillSlutt();
    }

    // Rør
    for (let i = 0; i < rør.array.length; i++) {
        let rørObjekt = rør.array[i];
        rørObjekt.x += fysikk.fartX;
        kontekst.drawImage(rørObjekt.bilde, rørObjekt.x, rørObjekt.y, rørObjekt.bredde, rørObjekt.høyde);

        if (!rørObjekt.passert && fugl.x > rørObjekt.x + rørObjekt.bredde) {
            spill.poeng += 0.5;
            rørObjekt.passert = true;
            poengLydfil.play();
        }

        if (oppdagKollisjon(fugl, rørObjekt)) {
            spill.slutt = true;
            stolpeTrefferLydfil.play();
            setTimeout(function () {
                dødLydfil.play();
            }, stolpeTrefferLydfil.duration * 1000); 
            spillSlutt(); 
        }

    }

    // Fjern rør
    while (rør.array.length > 0 && rør.array[0].x < -rør.bredde) {
        rør.array.shift();
    }

    // Poeng
    kontekst.fillStyle = "white";
    kontekst.font = "45px sans-serif";
    kontekst.fillText(spill.poeng, 5, 45);

    if (spill.slutt) {
        kontekst.fillText("SPILL SLUTT", 5, 90);
    }

    requestAnimationFrame(oppdater);

}

function plasserRør() {
    if (spill.slutt) {
        return;
    }

    let tilfeldigRørY = rør.y - rør.høyde / 4 - Math.random() * (rør.høyde / 2);
    let åpningsplass = brett.høyde / 4;

    let toppRørObjekt = {
        bilde: toppRør.bilde,
        x: rør.x,
        y: tilfeldigRørY,
        bredde: rør.bredde,
        høyde: rør.høyde,
        passert: false
    };
    
    rør.array.push(toppRørObjekt);

    let bunnRørObjekt = {
        bilde: bunnRør.bilde,
        x: rør.x,
        y: tilfeldigRørY + rør.høyde + åpningsplass,
        bredde: rør.bredde,
        høyde: rør.høyde,
        passert: false
    };
    rør.array.push(bunnRørObjekt);
}

function flyttFugl(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        fysikk.fartY = -6;

        flakseLydfil.currentTime = 0; 
        flakseLydfil.play();

        if(spill.slutt==true && e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX"){
            console.log("startSpill")
            startSpill()
        }
    
    }


}

function oppdagKollisjon(a, b) {
    return a.x < b.x + b.bredde &&
        a.x + a.bredde > b.x &&
        a.y < b.y + b.høyde &&
        a.y + a.høyde > b.y;
}

// Leaderboard
function spillSlutt() {
    const navn = prompt("Gratulerer! Skriv inn navnet ditt:");
    if (navn) {
        leggTilILeaderboard(navn, spill.poeng);
    }
}

function leggTilILeaderboard(navn, poeng) {
    leaderboard.push({ navn, poeng });
    leaderboard.sort((a, b) => b.poeng - a.poeng);
    if (leaderboard.length > 10) {
        leaderboard.pop();
    }
    oppdaterLeaderboard();
}
function oppdaterLeaderboard() {
    const leaderboardListe = document.getElementById("leaderboard-liste");
    leaderboardListe.innerHTML = "";
    
    leaderboard.forEach((spiller, indeks) => {
        const li = document.createElement("li");
        li.textContent = `${indeks + 1}. ${spiller.navn}: ${spiller.poeng}`;
        leaderboardListe.appendChild(li);
    });

    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

}

//Starter spillet
function startSpill() {

    resetSpill();

    rørIntervall = setInterval(plasserRør, 1500);
    document.addEventListener("keydown", flyttFugl);

    console.log(fysikk, rør, fugl, brett, bunnRør, toppRør, spill)

    brett.element = document.getElementById("brett");
    brett.element.height = brett.høyde;
    brett.element.width = brett.bredde;
    kontekst = brett.element.getContext("2d");

    fugl.bilde = new Image();
    fugl.bilde.src = "Bilder/flappybird.png";
    fugl.bilde.onload = function () {
        kontekst.drawImage(fugl.bilde, fugl.x, fugl.y, fugl.bredde, fugl.høyde);
    };

    toppRør.bilde = new Image();
    toppRør.bilde.src = "Bilder/toppipe.png";

    bunnRør.bilde = new Image();
    bunnRør.bilde.src = "Bilder/bottompipe.png";


    oppdater();


    if (localStorage.getItem("leaderboard")) {
        leaderboard = JSON.parse(localStorage.getItem("leaderboard"));
        oppdaterLeaderboard();
    }

}


// Hamburgermeny
const hamburger = document.getElementById('hamburger_meny');
const spilleregler = document.querySelector(".spilleregler_div");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    spilleregler.classList.toggle("js_spilleregler");
});

// Vis canvas knapp
const canvasDiv = document.querySelector(".canvas_div");
const visCanvasKnapp = document.querySelector(".vis_canvas_knapp");
const body = document.querySelector(".body");
const footer = document.querySelector(".footer");
const index = document.querySelector(".index")

visCanvasKnapp.addEventListener("click", () => {
    canvasDiv.style.display = "block";
    visCanvasKnapp.style.display = "none";
    index.style.backgroundColor = "#272b30";
    footer.style.display = "none";
    index.style.backgroundImage = "none";
    startSpill()
});

const navbarButtonHjem = document.querySelector(".navbar_button_hjem");

navbarButtonHjem.addEventListener("click", () => {
    canvasDiv.style.display = "none";
    visCanvasKnapp.style.display = "block";
    visCanvasKnapp.style.margin = "auto";
    footer.style.display = "block";
    body.style.display="block";
    leaderboardBody.style.display="none"
    index.style.backgroundImage="url(Bilder/flappybird.bakgrunnsbilde.png)"
});


const navbarLeaderboard = document.querySelector(".navbar-button-leaderboard")
const leaderboardBody = document.querySelector(".leaderboard_body")

navbarLeaderboard.addEventListener("click", () => {
    leaderboardBody.style.display="block"
    body.style.display="none"
    index.style.backgroundImage="url(Bilder/flappybird.bakgrunnsbilde.png)"
});

