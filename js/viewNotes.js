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
    console.log(catLegend);

  categoriesRed.on("value", snapshot => {
    const data = snapshot.val();
    catLegend.innerHTML = "";
    for (const category in data) {
      //works now
       console.log(catLegend, data[category]);
      catLegend.innerHTML = catLegend.innerHTML + `<button class="legend-color" onclick="filter('${data[category].title}')" style="background: ${data[category].color};"> ${data[category].title} </button>`;

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
  if (note.archive === true) {
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
  
    let noteDate = ""
    if (note.date) {
        noteDate = ` <footer class="card-footer date-created">
            ${new Date(note.date).toLocaleTimeString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
    </footer>`
    }


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
    <button class="card-footer-item" onClick="editNote('${noteId}')" >Edit</button>
    <button class="card-footer-item" onclick="delNote('${noteId}')">Delete</button>
  </footer>
  ${noteDate}
         </div>
       </div> `;
};

// Get the users input to later find matches find in terms of their title
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
      document.querySelector("#app").innerHTML = "No matches found. Try searching with another query.";
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

const editNote = noteId => {
  console.log(noteId);
  const editModal = document.querySelector("#edit-modal");
  const noteTitle = document.querySelector("#noteTitle");
  const noteText = document.querySelector("#noteText");
  const submitButton = document.querySelector("#update-note-button");

  editModal.classList.add("is-active");

  const notesRef = firebase.database().ref(`users/${userGlobalID}`);

  notesRef.on("value", snapshot => {
    const data = snapshot.val();
    console.log(data[noteId]);
    noteTitle.value = data[noteId].title;
    noteText.value = data[noteId].text;
    submitButton.setAttribute("onclick", `editNotePopup('${noteId}')`);
  });
};

const closeEdit = () => {
  const editModal = document.querySelector("#edit-modal");
  editModal.classList.remove("is-active");
};

const editNotePopup = noteId => {
  const editModal = document.querySelector("#edit-modal");
  const noteTitle = document.querySelector("#noteTitle");
  const noteText = document.querySelector("#noteText");

  let noteRef = firebase.database().ref(`users/${userGlobalID}/${noteId}`);

  noteRef.update({
    title: noteTitle.value,
    text: noteText.value
  });
  editModal.classList.remove("is-active");
};

function delNote(noteId) {
  let conf = confirm("Are you sure you want to delete this note?");
  if (conf) {
    let noteRef = firebase.database().ref(`users/${userGlobalID}/${noteId}`);
    noteRef.update({
      archive: true
    });
  }
}

function filter(c) {
  //console.log('working')
  let arr = checkForCatMatch(c);
  if (arr.length !== 0) {
    let cards = "";
    document.querySelector("#app").innerHTML = "";
    for (let noteItem in arr) {
      cards += createCard(noteItem, arr[noteItem]);
      console.log(arr[noteItem].title);
    }
    document.querySelector("#app").innerHTML = cards;
  } else {
    document.querySelector("#app").innerHTML = "No matches found. Try searching with another query.";
  }
}

function checkForCatMatch(c) {
  console.log(c.value);
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
        let cat = data[noteItem].category.toString();
        //console.log(title, str);
        if (cat == c.toString()) {
          console.log("match found");
          arr.push(data[noteItem]);
        }
      }
    }
  });
  return arr;
}
