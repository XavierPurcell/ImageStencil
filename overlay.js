console.log("loaded from script");

//glboal varibles we need to store where we clicked on an image in terms of relative pixels.
let offLeft = 0;
let offTop = 0;

let overlayOn = false;

//insert html nodes into the page
let body = document.querySelector("body");
let tracer = document.createElement("div");
tracer.classList.add("tracer__container");
tracer.innerHTML =
  '<div class="desktop__container">' +
  '<img class="tracer__image" width="auto" height="auto" draggable="true" src="/Images/startercomponent.png">' +
  "</div>";
body.insertAdjacentElement("beforeend", tracer);

//insert the stored image into the src
chrome.storage.local.get(["key"], function (result) {
  //console.log("Value currently is " + result.key);
  if (result.key != null) {
    let desktopImage = document.querySelector(".tracer__image");
    desktopImage.src = result.key;
  }
  else
  {
    let desktopImage = document.querySelector(".tracer__image");
    desktopImage.src = "https://storage.cloud.google.com/photo-storage-xp-01/startercomponent.png";
  }
  // else
  // {
  //   chrome.runtime.sendMessage({ greeting: "GetDefaultImage" }, function (response) {
  //     if (chrome.runtime.lastError) {
  //       console.log("error");
  //     } else {
  //       let desktopImage = document.querySelector(".tracer__image");
  //       desktopImage.src = response.farewell;
  //       console.log(response.farewell);
  //     }
  //     //
  //   });
  // }
});

setImageProps();

// add events to the image so we can drag it
let desktopImage = document.querySelector(".tracer__image");
desktopImage.addEventListener("mousedown", getClick);
desktopImage.addEventListener("dragstart", drag);

// make the container have the drag and drop ability
let desktopContainer = document.querySelector(".desktop__container");
// total window height
let totalHeight = document.body.scrollHeight;
desktopContainer.style.height = totalHeight + "px";
desktopContainer.addEventListener("drop", drop);
desktopContainer.addEventListener("dragover", allowDrop);


chrome.storage.local.get(["Button"], function (result) {
  if (result != null) {
    if (result.Button=="On")
    {
      overlayOn = true;
      tracer.style.display = "block";
    }
    else
    {
      overlayOn = false;
      tracer.style.display = "none";
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (e.ctrlKey === true && e.code === "KeyM") {
    if (overlayOn == false) {
      overlayOn = true;
      tracer.style.display = "block";

      chrome.storage.local.set({"Button":"On"}, function () {});

    } else {
      overlayOn = false;
      tracer.style.display = "none";
      chrome.storage.local.set({"Button":"Off"}, function () {});
    }
  }
  //log key event
  //console.log(e);
});

function getClick(ev) {
  //The following are the x/y coordinates of the mouse click relative to image.
  offLeft = ev.pageX - this.offsetLeft;
  offTop = ev.pageY - this.offsetTop;
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();

  // get the x and y location of the event (where we dropped the image)
  let x = ev.pageX;
  let y = ev.pageY;
  // get the image
  let image = document.querySelector(".tracer__image");
  // get where we dropped the image and minus where we clicked the image to make it have a smooth experience.
  // this solves the issue where we are measuring from the top left instead of where we clicked on the image.
  image.style.left = x - offLeft + "px";
  image.style.top = y - offTop + "px";

  //console.log(window.location.href);

  let nameX = 'coordX' + window.location.href;
  let nameY = 'coordY' + window.location.href;

  // set coordinates
  chrome.storage.local.set({[nameX]: image.style.left }, function () {});
  chrome.storage.local.set({[nameY]: image.style.top }, function () {});

  chrome.runtime.sendMessage({ greeting: "hello" }, function (response) {
    if (chrome.runtime.lastError) {
      //console.log("error");
    } else {
      //success
    }
    //
  });

  chrome.storage.local.get([nameX], function (result) {
    console.log(result[nameX]);

    if (result[nameX] != null) {
      //console.log(result[nameX]); 
    }
  });

}

function setImageProps() {
  let image = document.querySelector(".tracer__image");

  let nameX = 'coordX' + window.location.href;
  let nameY = 'coordY' + window.location.href;

  chrome.storage.local.get([nameX], function (result) {
    if (result[nameX] != null) {
      image.style.left = result[nameX];
      //console.log(result.nameX);
    }
  });

  chrome.storage.local.get([nameY], function (result) {
    if (result[nameY] != null) {
      image.style.top = result[nameY];
    }
  });
}
