let states;
let ids;
let remain;
let target;
let isPlaying;
let timer;
let nam;

window.addEventListener("beforeunload", (leave) => {
  if (isPlaying === 1) {
    leave.preventDefault();
    leave.returnValue = "";
  }
});

function generate() {
  const params = new URLSearchParams(window.location.search);
  const col = params.get("columns");
  const lin = params.get("rows");
  const bmb = params.get("bombs");
  const emo = params.get("emojis");
  nam = params.get("name");
  const hin = params.get("hints");
  
  const total = lin*col;
  const emojis = ["📦", "🎁", "🧰", "🧳", "💼", "🥡"];
  const names = ["cardboard package", "gift", "toolbox", "suitcase", "breifcase", "food box"];
  const expressions = [["above me","under me","to my right","to my left"]];
    
//Build array of IDs
  ids = [];
  for (let i = 0; i < lin; i++) { 
  for (let j = 0; j < col; j++) {
      ids.push("T"+String(i)+String(j));  
  }
  }
  
//Build grid
  let tempstyle = document.createElement("style");
  tempstyle.textContent = `#game { grid-template-columns: 40px repeat(${col}, 1fr); }`;
  document.head.appendChild(tempstyle);
  for (let i = 0; i < col; i++) { document.getElementById("game").innerHTML += `<div class="pkg mark"><center><h1>${i+1}</h1><p>Column</p></center></div>` }
  let k = 0;
  for (let i = 0; i < lin; i++) {
    document.getElementById("game").innerHTML += `<div class="pkg mark line"><center><h1>${i+1}</h1><p>Row</p></center></div>`;
    for (let j = 0; j < col; j++) { 
    document.getElementById("game").innerHTML += `<div id="${ids[k]}" class="pkg"><button class="icon" onClick="iconClick(this.parentElement)">📦</button><br><p class="hint"> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis finibus ex non velit congue, ut.</p></div>`;
    k++;
    }
  }

// Randomize emojis 
  states = [];
  for (let i = 0; i < total; i++) { 
      states.push("clear");
      document.querySelector("#" + ids[i] + " button").innerHTML = emojis[Math.floor(Math.random() * emo)];
  }

//Random bomb placement
  let packages = [...ids];
  for (let i = 0; i < bmb; i++) {
    let ind = Math.floor(Math.random() * packages.length);
    states[ids.indexOf(packages[ind])] = "bomb";
    packages.splice(ind, 1);
  }

//Hint generation
  //Find enabled hints
  let hints = [];

  for (let i = 0; i < hin.length; i++) {
    if (hin[i] === "1") { hints.push(i) }
  }

  k = 0;
  for (let i = 0; i < lin; i++) {
  for (let j = 0; j < col; j++) {
    let random = hints[Math.floor(Math.random() * hints.length)];
    let tag = document.querySelector("#" + ids[k] + " p")
    let negation = -1;
    let var1 = [];
    let var2;
    let not;
    let selected;
    
  //Proximity hint
    if (random == 0) {
      if (j === 0) { 
        if (i === 0)        { var1 = [[2,k+1],[1,k+col]] }
        else if (i===lin-1) { var1 = [[2,k+1],[0,k-col]] }
        else                { var1 = [[2,k+1],[0,k-col],[1,k+col]] }
      }
      else if (j === col-1) {
        if (i === 0)        { var1 = [[3,k-1],[1,k+col]] }
        else if (i===lin-1) { var1 = [[3,k-1],[0,k-col]] }
        else                { var1 = [[3,k-1],[0,k-col],[1,k+col]] }
      }
      else if (i === 0)     { var1 = [[3,k-1],[2,k+1],[1,k+col]] }
      else if (i===lin-1)   { var1 = [[3,k-1],[2,k+1],[0,k-col]] }
      else                  { var1 = [[0,k-col],[1,k+col],[2,k+1],[3,k-1]] }

      selected = var1[Math.floor(Math.random()*var1.length)];

      if (states[selected[1]] === "bomb") {negation = 1} else {negation = -1}
      if (states[k] === "bomb")           {negation *= -1}
      if (negation === -1)                {not = "not"}  else {not = ""}
      
      tag.innerHTML = "The box " + expressions[0][selected[0]] + " is " + not + " a bomb.";
    }
  //Emoji hint
    if (random === 1) {
      selected = document.querySelector("#" + ids[Math.floor(Math.random()*ids.length)] + " button").innerHTML.trim().replace(/\uFE0F/g, "");
            for (let l = 0; l < states.length; l++) {if (states[l] == "bomb" && document.querySelector("#" + ids[l] + " button").innerHTML.trim().replace(/\uFE0F/g, "") == selected) {
        negation = 1;
        break;
        }}
      if (states[k] === "bomb") {negation *= -1}
      if (negation === 1) {not = "'s at least 1 "} else {not = " isn't any "}
      
      tag.innerHTML = "There" + not + " explosive " + names[emojis.indexOf(selected)] + ".";
    }
  //Row & Column hint
    if (random === 2) {
      random = Math.random()
      if (random < 0.5) {
        var1 = col;
        var2 = "column";
      } else {
        var1 = lin
        var2 = "line";
      }
      selected = Math.floor(Math.random() * var1);
      
      for (let l = 0; l < var1; l++) {if (states[(selected-1)*var1+l] === "bomb") {negation = 1}}

      if (states[k] === "bomb") {negation *= -1}
      if (negation === -1) {not = "are no bombs"} else {not = "is at least 1 bomb"}
      tag.innerHTML = "There " + not + " in " + var2 + " n°" + selected

    }
    k++;
  }
  }
  
//Update info labels
  document.title = "Boxpect - " + nam;
  target = total - bmb;
  remain = 0;
  document.getElementById("remaining").innerHTML = bmb;
  document.getElementById("counter").innerHTML = 0;
  document.getElementById("counterMax").innerHTML = target;
  
  isPlaying = 0;
/*  updateBest(false); */
  timer = setInterval(updateTimer,1000);
}

function iconClick(element) {
  isPlaying = 1
  let state = states[ids.indexOf(element.id)];
  if (state === "bomb") {
    revealBomb(element);
    document.getElementById("audioClickBomb").play();
    setTimeout(lose, 1000);
    isPlaying = 3;
    let bombs = [];
    states.forEach((val, i) => { if (val === "bomb") bombs.push(i); });
    bombs.forEach((val) => { revealBomb(document.getElementById(ids[val])) });
    setTimeout(() => setOverlay("You lost","You clicked a bomb. Better luck next time!"), 1000)
  }
    
  else {
    if (!element.querySelector("p").classList.contains("revealed")) { 
      document.getElementById("audioClickCorrect").play();
      remain++;
    }
    element.querySelector("p").style.borderColor = "MediumSeaGreen";
    element.querySelector("p").style.backgroundColor = "LightGreen";
    element.querySelector("p").classList.add("revealed");
    document.getElementById("counter").innerHTML = remain;
    if (remain === target) {
      isPlaying = 3;
      document.getElementById("audioWin").play();
      setTimeout(() => setOverlay("You win","Good job! You found all the non-bomb packages"), 100)
/*      updateBest(true) */
    }
  }
  element.querySelector("p").style.textDecoration = "underline DimGray";
  }

function lose() {
  document.getElementById("audioLose").play();
}

function updateTimer() {
  let seconds = document.getElementById("timerSeconds");
  let minutes = document.getElementById("timerMinutes");
  if (isPlaying < 2) { 
    if (seconds.innerHTML === "59") {
      minutes.innerHTML = String((Number(minutes.innerHTML) + 1)).padStart(2,"0")
      seconds.innerHTML = "00"
  }
    else { seconds.innerHTML = String((Number(seconds.innerHTML) + 1)).padStart(2,"0") }
  } else if (Number(seconds.innerHTML) > 0) { 
    clearInterval(timer);
  }
}

function revealBomb(element) {
    element.querySelector("button").innerHTML = "💣";
    element.querySelector("p").style.borderColor = "IndianRed";
    element.querySelector("p").style.backgroundColor = "LightCoral"; 
}

function setOverlay(title,text) {
  let overlay = document.getElementById("overlay");
  overlay.style.display = "flex"
  overlay.querySelector("h1").innerHTML = title
  overlay.querySelector("p").innerHTML = text
  }

/*   function updateBest(replace) {
    let currentMins = document.getElementById("timerMinutes").innerHTML;
    let currentSecs = document.getElementById("timerSeconds").innerHTML;
    let minsKey = `bestMinutes${nam}`;
    let secsKey = `bestSeconds${nam}`;
    let getMins = localStorage.getItem(minsKey);
    let getSecs = localStorage.getItem(secsKey);

    if (((currentMins <= getMins && currentSecs < getSecs) || (getMins === null)) && ["Easy","Normal","Hard"].includes(nam)) {
      if (replace) {
        localStorage.setItem(minsKey,currentMins);
        localStorage.setItem(secsKey,currentSecs);
        getMins = currentMins;
        getSecs = currentSecs;
    }
  }
  if (getMins !== null) {
    document.getElementById("bestMinutes").innerHTML = getMins;
    document.getElementById("bestSeconds").innerHTML = getSecs;
  }
}
 */