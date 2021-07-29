let userGlobalID = null;

window.onload = event => {
  // Firebase authentication goes here.
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      // Console log the user to confirm they are logged in
      console.log("Logged in as: " + user.displayName);
      const googleUserId = user.uid;
      userGlobalID = googleUserId;
      getNotes(googleUserId);
      updateLegend(googleUserId);
    } else {
      // If not logged in, navigate back to login page.
      window.location = "index.html";
    }
  });
};

const updateLegend = userId => {
  const categoriesRed = firebase.database().ref(`users/${userId}/category`);
  const catLegend = document.querySelector("#category-legend");

  categoriesRed.on("value", snapshot => {
    const data = snapshot.val();
    for (const category in data) {
      catLegend.innerHTML += `
  <span class="legend-color" style="background: ${data[category].color};">${data[category].title}<span>
  `;
    }
  });
};

const getNotes = userId => {
  const notesRef = firebase.database().ref(`users/${userId}`);

  notesRef.on("value", snapshot => {
    const data = snapshot.val();
    renderDataAsHtml(data, userId);
  });
};

//Given a list of notes, render them in HTML
const renderDataAsHtml = (data, userId) => {
  let cards = "";
  for (const noteItem in data) {
    if (noteItem !== "category") {
      const note = data[noteItem];
      cards += createCard(noteItem, note);
    }
  }
  document.querySelector("#app").innerHTML = cards;
};

// Return a note object converted into an HTML card
const createCard = (noteId, note) => {
  if (note.archive === false) {
    return "";
  }
  const categoriesRed = firebase
    .database()
    .ref(`users/${userGlobalID}/category`);
  let color = "";
  categoriesRed.on("value", snapshot => {
    const data = snapshot.val();
    for (const category in data) {
      if (data[category].title === note.category) {
        color = data[category].color;
      }
    }
  });

  return `
         <div class="column is-one-quarter">
         <div class="card" style="background: ${color};">
           <header class="card-header">
             <p class="card-header-title">${note.title}</p>
           </header>
           <div class="card-content">
             <div class="content">${note.text}</div>
           </div>
             <footer class="card-footer">
    <button class="card-footer-item" onclick="unarchiveNote('${noteId}')">Unarchive</button>
  </footer>
         </div>
       </div> `;
};

const searchBar = document.querySelector(".input");

searchBar.addEventListener(
  "keyup",
  e => {
    const searchString = e.target.value.toLowerCase();
    //document.querySelector("#app").innerHTML = "";
    let arr = checkForMatch(searchString);
    if (arr.length !== 0) {
      let cards = "";
      document.querySelector("#app").innerHTML = "";
      for (let noteItem in arr) {
        cards += createCard(noteItem, arr[noteItem]);
        console.log(arr[noteItem].title);
      }
      document.querySelector("#app").innerHTML = cards;
    } else {
      document.querySelector("#app").innerHTML = "No matches found yeT";
    }
  }
  //else{console.log('woohoo')}
);

function checkForMatch(str) {
  //console.log("checking")
  //grab array of all titles
  //compare all values to str
  //create array of matching notes
  //call createCard for each
  let arr = [];
  const notesRef = firebase.database().ref(`users/${userGlobalID}`);
  notesRef.on("value", snapshot => {
    const data = snapshot.val();
    for (const noteItem in data) {
      if (noteItem !== "category") {
        let title = data[noteItem].title.toLowerCase();
        console.log(title, str);
        if (title.includes(str)) {
          console.log("match found");
          arr.push(data[noteItem]);
        }
      }
    }
  });

  console.log(arr);
  return arr;
}


function unarchiveNote(noteId) {
  let conf = confirm("Are you sure you want to restore this note?");
  if (conf) {
    let noteRef = firebase.database().ref(`users/${userGlobalID}/${noteId}`);
    noteRef.update({
      archive: false
    });
  }
}
