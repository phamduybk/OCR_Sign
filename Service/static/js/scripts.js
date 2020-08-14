//========================================================================
// Drag and drop image handling
//========================================================================

var fileDrag = document.getElementById("file-drag");
var fileSelect = document.getElementById("file-upload");

// Add event listeners
fileDrag.addEventListener("dragover", fileDragHover, false);
fileDrag.addEventListener("dragleave", fileDragHover, false);
fileDrag.addEventListener("drop", fileSelectHandler, false);
fileSelect.addEventListener("change", fileSelectHandler, false);

function fileDragHover(e) {
  // prevent default behaviour
  e.preventDefault();
  e.stopPropagation();

  fileDrag.className = e.type === "dragover" ? "upload-box dragover" : "upload-box";
}

function fileSelectHandler(e) {
  // handle file selecting
  var files = e.target.files || e.dataTransfer.files;
  fileDragHover(e);
  for (var i = 0, f; (f = files[i]); i++) {
    previewFile(f);
  }
}

//========================================================================
// Web page elements for functions to use
//========================================================================

var imagePreview = document.getElementById("image-preview");
var imageDisplay = document.getElementById("image-display");
var uploadCaption = document.getElementById("upload-caption");
// var predResult = document.getElementById("pred-result");
var loader = document.getElementById("loader");



//========================================================================
// Main button events
//========================================================================

function submitImage() {

  var myListText = document.getElementById('resultText');
  var myListConf = document.getElementById('confident');
  
  if(typeof(myListText) != 'undefined' && myListText != null)
  {
    while (myListText.lastElementChild) {
      myListText.removeChild(myListText.lastElementChild);
    }
    while (myListConf.lastElementChild) {
      myListConf.removeChild(myListConf.lastElementChild);
    }
    console.log('1');
  }else
  {
    console.log('2');
  }


  // action for the submit button
  console.log("submit");

  if (!imageDisplay.src || !imageDisplay.src.startsWith("data")) {
    window.alert("Please select an image before submit.");
    return;
  }

  loader.classList.remove("hidden");
  imageDisplay.classList.add("loading");
   
  // call the predict function of the backend
  predictImage(imageDisplay.src);
  

}

function clearImage() {
  var myListText = document.getElementById('resultText');
  var myListConf = document.getElementById('confident');
  
  if(typeof(myListText) != 'undefined' && myListText != null)
  {
    while (myListText.lastElementChild) {
      myListText.removeChild(myListText.lastElementChild);
    }
    while (myListConf.lastElementChild) {
      myListConf.removeChild(myListConf.lastElementChild);
    }
    console.log('3');
  }else
  {
    console.log('4');
  }

  // reset selected files
  fileSelect.value = "";

  // remove image sources and hide them
  imagePreview.src = "";
  imageDisplay.src = "";
  // predResult.innerHTML = "";

  hide(imagePreview);
  hide(imageDisplay);
  hide(loader);
  // hide(predResult);
  show(uploadCaption);

  imageDisplay.classList.remove("loading");
 
}

function previewFile(file) {
  // show the preview of the image
  console.log(file.name);
  var fileName = encodeURI(file.name);

  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = () => {
    imagePreview.src = URL.createObjectURL(file);

    show(imagePreview);
    hide(uploadCaption);

    // reset
    // predResult.innerHTML = "";
    imageDisplay.classList.remove("loading");

    displayImage(reader.result, "image-display");
  };
}

//========================================================================
// Helper functions
//========================================================================

function predictImage(image) {
  fetch("/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(image)
  })
    .then(resp => {
      if (resp.ok)
        resp.json().then(data => {

          imageDisplay.src = "";
          displayImage(data.src, "image-display");
          CreateListResult(data);
        
          hide(loader);
        });
    })
    .catch(err => {
      console.log("An error occured", err.message);
      window.alert("Oops! Something went wrong.");
    });
}

function displayImage(image, id) {
  // display image on given id <img> element
  let display = document.getElementById(id);
  console.log.apply(image);
  display.src = image;
  show(display);
}

function displayResult(data) {
  // display the result
  imageDisplay.classList.remove("loading");
  hide(loader);
  // predResult.innerHTML = data.result;
  // show(predResult);
}

function hide(el) {
  // hide an element
  el.classList.add("hidden");
}

function show(el) {
  // show an element
  el.classList.remove("hidden");
}

function CreateListResult(listData) {
  var cont = document.getElementById('resultText');
  var conf = document.getElementById('confident');

  // create ul element and set the attributes.
  var ul1 = document.createElement('ul');

  var ul2 = document.createElement('ul')
  ul1.setAttribute('style', 'padding-left: 10; margin: 10; text-align: left');
  ul1.setAttribute('id', 'theListText');

  ul2.setAttribute('style', 'padding-left: 10; margin: 10; text-align: left');
  ul2.setAttribute('id', 'theListConf');
  for (i = 0; i < listData.len; i++) {
      var li1 = document.createElement('li');     // create li element.
      li1.innerHTML = listData.bounds[i].text;      // assigning text to li using array value.
      li1.setAttribute('style', 'display: block;');    // remove the bullets.
    
      ul1.appendChild(li1);     // append li to ul.

      var li2 = document.createElement('li');     // create li element.
      li2.innerHTML = listData.bounds[i].conf;      // assigning text to li using array value.
      li2.setAttribute('style', 'display: block;');    // remove the bullets.
    
      ul2.appendChild(li2);     // append li to ul.
    
  }
  
 
  cont.appendChild(ul1);       // add list to the container.
  conf.appendChild(ul2);
}