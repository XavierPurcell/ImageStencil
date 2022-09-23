// values we need
let tab;
let nameX;
let nameY;
let desktopImagePop;
let opacity;
let coordY;
let coordX;
let OnButton;



document.addEventListener("DOMContentLoaded", async () => {
  // set up

  // grab our active tab
  [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // execute this function within the target (our active tab in this instance)
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: testing,
  });

  // image we update
  desktopImagePop = document.querySelector(".image__desktop");

  //key names
  nameX = "coordX" + tab.url;
  nameY = "coordY" + tab.url;

  // attributes of image
  OnButton = document.querySelector(".on__button");
  opacity = document.querySelector(".desktop__opacity");
  coordX = document.querySelector(".x__coordinate");
  coordY = document.querySelector(".y__coordinate");

  // end of setup;

  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    console.log(
      sender.tab
        ? "from a content script:" + sender.tab.url
        : "from the extension"
    );

    if (request.greeting === "hello") {
      //sendResponse({farewell: "goodbye"});

      chrome.storage.local.get([nameX], function (result) {
        if (result[nameX] != null) {
          let DisplayResult = result[nameX].replace('px', '')
          coordX.value = DisplayResult;
        }
      });

      chrome.storage.local.get([nameY], function (result) {
        if (result[nameY] != null) {
          let DisplayResult = result[nameY].replace('px', '')
          coordY.value = DisplayResult;
        }
      });
    }
    else if (request.greeting === "GetDefaultImageTest") {
      let image = document.querySelector(".image__desktop");
      sendResponse({ farewell: image.src });
    }
    else if (request.greeting === "On") {
      OnButton.innerHTML = "On";
    }
    else if (request.greeting === "Off") {
      OnButton.innerHTML = "Off";
    }
  });

  chrome.storage.local.get([nameX], function (result) {
    if (result[nameX] != null) {
      let DisplayResult = result[nameX].replace('px', '')
      coordX.value = DisplayResult;
    }
  });

  chrome.storage.local.get([nameY], function (result) {
    if (result[nameY] != null) {
      let DisplayResult = result[nameY].replace('px', '')
      coordY.value = DisplayResult;
    }
  });

  //insert the stored image into the src
  chrome.storage.local.get(["key"], function (result) {
    //console.log("Value currently is " + result.key);
    if (result.key != null) {
      desktopImagePop.src = result.key;
    }
  });


  // file selector
  //ImageSelector();
  if (window.FileList && window.File && window.FileReader) {
    document
      .querySelector(".uploadImage")
      .addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file.type) {
          return;
        }
        if (!file.type.match("image.*")) {
          return;
        }
        const reader = new FileReader();
        reader.addEventListener("load", (event) => {
          let srcLink = event.target.result;
          chrome.storage.local.set({ key: srcLink }, function () { });

          desktopImagePop.src = event.target.result;

          // runs js on tab
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: overlay,
          });

          // output.src = event.target.result;
        });
        reader.readAsDataURL(file);
      });
  }


  chrome.storage.local.get(["Button"], function (result) {
    if (result != null) {
      if (result.Button=="On")
      {
        OnButton.innerHTML="On";
        chrome.storage.local.set({"Button":"On"}, function () {});
      }
      else
      {
        OnButton.innerHTML="Off";
        chrome.storage.local.set({"Button":"Off"}, function () {});
      }
    }
  });

  OnButtonListener()

  // change image opacity
  AddOpacityListener();
  // change image coordiantes
  AddTabCoordinateListener();

});

function testing() {
  console.log("loaded from popup");
}


// opacity
//#region 
function AddOpacityListener() {
  opacity.addEventListener("change", () => {
    let desktopImagePop = document.querySelector(".image__desktop");
    let opacity = document.querySelector(".desktop__opacity");

    let value = opacity.value / 100;

    desktopImagePop.style.opacity = value;

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: updateOpacity,
      args: [value],
    });
  }); // end of add event listener
}


function overlay() {
  chrome.storage.local.get(["key"], function (result) {
    if (result.key != null) {
      let el = document.querySelector(".tracer__image");
      el.src = result.key;
    }
  });
}

function updateOpacity(value) {
  let desktopImagePop = document.querySelector(".tracer__image");
  desktopImagePop.style.opacity = value;
}
//#endregion


// coordinates
//#region 
function AddTabCoordinateListener() {

  let coordX = document.querySelector(".x__coordinate");
  let coordY = document.querySelector(".y__coordinate");

  coordX.addEventListener("change", (event) => {

    let value = coordX.value;

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: UpdateCoordinateX,
      args: [value],
    });

  });

  coordY.addEventListener("change", (event) => {

    let value = coordY.value;

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: UpdateCoordinateY,
      args: [value],
    });

  });
}

function UpdateCoordinateX(value) {
  let image = document.querySelector(".tracer__image");
  image.style.left = value + "px";
  // set coordinates
  let nameX = 'coordX' + window.location.href;
  chrome.storage.local.set({ [nameX]: image.style.left }, function () { });
}


function UpdateCoordinateY(value) {
  let image = document.querySelector(".tracer__image");
  image.style.top = value + "px";
  // set coordinates
  let nameY = 'coordY' + window.location.href;
  chrome.storage.local.set({ [nameY]: image.style.top }, function () { });
}

//#endregion


// imageSelector
//#region 
function ImageSelector() {


}
//#endregion

//on button
//#region 

function OnButtonListener() {

  OnButton.addEventListener("click", (event) => {

    if (OnButton.innerHTML == "Off") {
      OnButton.innerHTML = "On";
      chrome.storage.local.set({"Button":"On"}, function () {});
    }
    else if (OnButton.innerHTML == "On") {
      OnButton.innerHTML = "Off"
      chrome.storage.local.set({"Button":"Off"}, function () {});
    }
    else {
      console.log(OnButton.innerHTML);
    }

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: ToggleOnOff,
      args: [],
    });

  });
}


function ToggleOnOff() {

  if (overlayOn == false) {
    overlayOn = true;
    tracer.style.display = "block";
  } else {
    overlayOn = false;
    tracer.style.display = "none";
  }

}


//#endregion



function defaultImage() {
  chrome.storage.local.get(["keyt"], function (result) {
    let desktopImage = document.querySelector(".tracer__image");
    desktopImage.src = result.key;
  });
}
