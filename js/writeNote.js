let googleUser;

// let firebase = firebase;

window.onload = event => {
  // Use this to retain user state between html pages.
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log("Logged in as: " + user.displayName);
      googleUser = user;
      updateSelect(user.uid)
    } else {
      window.location = "index.html"; // If not logged in, navigate back to login page.
    }
  });
};

const updateSelect = userId =>{
  const categoriesRed = firebase.database().ref(`users/${userId}/category`);

  categoriesRed.on("value", snapshot => {
    const data = snapshot.val();
    renderCategories(data)
  })
}

const renderCategories = categories => {
   console.log(categories)
    const selectContent = document.querySelector("#cat");
       selectContent.innerHTML = `<option value="">Select Category</option>`;
  
    for (const categoryID in categories) {

     const category = categories[categoryID];
    selectContent.innerHTML += `<option value="${category.title}">${category.title}</option>`
  
  }
}
                   


const handleNoteSubmit = () => {
  // 1. Capture the form data
  const noteTitle = document.querySelector("#noteTitle");
  //const noteText = document.querySelector("#noteText");
  var editor = new Quill("#editor");
  //var preciousContent = document.getElementById("myPrecious");
  //var justTextContent = document.getElementById("justText");
  var justHtmlContent = document.getElementById("justHtml");

    //var delta = editor.getContents();
    //var text = editor.getText();
    var justHtml = editor.root.innerHTML;
    console.log(justHtml)
    //preciousContent.innerHTML = JSON.stringify(delta);
    //justTextContent.innerHTML = text;
    //justHtmlContent.innerHTML = justHtml;
  
    const noteText = justHtml.toString()
  //console.log(noteText);
  const noteCategory = document.querySelector("#cat");
  // 2. Format the data and write it to our database

  firebase
    .database()
    .ref(`users/${googleUser.uid}`)
    .push({
      title: noteTitle.value,
      text: noteText,
      category: noteCategory.value,
      archive: false
    })

    // 3. Clear the form so that we can write a new note
    .then(() => {
      noteTitle.value = "";
      noteText.value = "";
      noteCategory.value = "";
    });
};

const handleNewCategory = () => {
  const newCategory = document.querySelector("#newCategory");
  const newColor = document.querySelector("#newColor");
  if (newCategory.value && newColor.value) {
    firebase
      .database()
      .ref(`users/${googleUser.uid}/category`)
      .push({
        title: newCategory.value.toLowerCase(),
        color: newColor.value
      })

      // 3. Clear the form so that we can write a new note
      .then(() => {
        newCategory.value = "";
        newColor.value = "";
      });
  }
};
