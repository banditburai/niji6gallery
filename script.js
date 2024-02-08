
let displayedImages = {};
let totalArtistsLoaded = 0; // A counter to keep track of the total number of artists loaded
const initialLoadLimit = 20; // The number of artist rows to initially load

// Fetch the JSON data and initialize the gallery
fetch("./niji6_metadata_output.json")
  .then((response) => response.json())
  .then((data) => {
    artistsData = data;
    loadInitialImages();
  })
  .catch((error) => {
    console.error("Error loading the JSON file:", error);
  });

// Load initial images for each artist
function loadInitialImages() {
  // Shuffle and only load a limited number of artists initially
  const shuffledArtistsArray = shuffleArray(Object.keys(artistsData)).slice(
    0,
    initialLoadLimit,
  );
  shuffledArtistsArray.forEach((artist) => {
    displayedImages[artist] = 0; // Initialize the displayed count for this artist
    const artistRow = createArtistRow(artist);
    document.getElementById("gallery").appendChild(artistRow);
    displayRandomImages(artist, artistRow, 4);
  });
  setupLazyLoading();
}

// Shuffle the array and slice it to get a number of random images
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Create a row for the artist
function createArtistRow(artistName) {
  const artistRow = document.createElement("div");
  artistRow.classList.add("artist-row");
  artistRow.setAttribute("data-artist", artistName);
  return artistRow;
}

// Display a certain number of random images for an artist
function displayRandomImages(artist, artistRow) {
  // Randomly choose to display 3, 4, or 5 images
  const count = Math.floor(Math.random() * 3) + 3;

  const imagesToShow = shuffleArray(artistsData[artist]).slice(0, count);
  imagesToShow.forEach((imageData) => {
    const imgElement = createImageElement(imageData, artist);
    artistRow.appendChild(imgElement);
    displayedImages[artist]++;
  });

  // Create and append the "show more" button if needed
  if (artistsData[artist].length > count) {
    const showMoreButton = createShowMoreButton(artist);
    artistRow.appendChild(showMoreButton);
  }
}

function createImageElement(imageData, artist) {
  const imgWrapper = document.createElement("div");
  imgWrapper.classList.add("image-wrapper");

  // Image element
  const imgElement = document.createElement("img");
  imgElement.src = imageData.webpFile;
  imgElement.alt = imageData.caption;
  imgElement.title = imageData.prompt;
  imgElement.classList.add("Gallery-img");
  imgElement.loading = "lazy";
  imgWrapper.appendChild(imgElement);

  // Icons container div
  const iconsContainer = document.createElement("div");
  iconsContainer.classList.add("icons-container");
  imgWrapper.appendChild(iconsContainer);

  // Image link icon
  const imageLinkIcon = document.createElement("a");
  imageLinkIcon.href = imageData.imageURL;
  imageLinkIcon.target = "_blank";
  imageLinkIcon.rel = "noopener noreferrer";
  imageLinkIcon.innerHTML =
    '<svg width="800" height="800" viewBox="0 0 24 24" version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg"><circle cx="8.5" cy="8.5" r="2.5"/><path d="M16 10c-2 0-3 3-4.5 3s-1.499-1-3.5-1c-2 0-3.001 4-3.001 4H19s-1-6-3-6zm4-7H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zm0 14H4V5h16v12z"/></svg>';
  imageLinkIcon.classList.add("icon");
  iconsContainer.appendChild(imageLinkIcon);

  // Grid link icon
  const gridLinkIcon = document.createElement("a");
  gridLinkIcon.href = imageData.gridURL;
  gridLinkIcon.target = "_blank";
  gridLinkIcon.rel = "noopener noreferrer";
  gridLinkIcon.innerHTML =
    '<svg width="800" height="800" viewBox="-32 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M64 96h136v136H64V96Zm184 0h136v136H248V96ZM64 280h136v136H64V280Zm184 0h136v136H248V280Z"/></svg>';
  gridLinkIcon.classList.add("icon");
  iconsContainer.appendChild(gridLinkIcon);

  // Caption div
  const captionDiv = document.createElement("div");
  captionDiv.classList.add("caption");
  captionDiv.textContent = imageData.caption;
  captionDiv.onclick = function () {
    copyToClipboard(imageData.caption);
  };
  imgWrapper.appendChild(captionDiv);

  // Event listener for image click to remove image
  imgElement.addEventListener("click", () => {
    imgWrapper.remove();
  });

  return imgWrapper;
}

function setupLazyLoading() {
  const options = {
    root: null,
    rootMargin: "0px",
    threshold: 0.2,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadMoreImages();
        observer.unobserve(entry.target);
      }
    });
  }, options);

  // Observe the last artist row currently in the DOM
  const lastArtistRow = document.querySelector(".artist-row:last-child");
  if (lastArtistRow) {
    observer.observe(lastArtistRow);
  }
}

// Create the "show more" button
function createShowMoreButton(artist) {
  const showMoreButton = document.createElement("div");
  showMoreButton.classList.add("Gallery-add");
  showMoreButton.innerHTML =
    '<svg width="30" height="30" viewBox="0 0 48 48" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M24 0C10.745 0 0 10.745 0 24s10.745 24 24 24 24-10.745 24-24S37.255 0 24 0zm0 44C13.511 44 4 34.489 4 24S13.511 4 24 4s20 9.511 20 20-9.511 20-20 20zm10-22H26V14a2 2 0 10-4 0v8h-8a2 2 0 100 4h8v8a2 2 0 104 0v-8h8a2 2 0 100-4z"/></svg>';
  showMoreButton.addEventListener("click", () => {
    const nextImage = getNextImage(artist);
    if (nextImage) {
      const imgElement = createImageElement(nextImage, artist);
      const artistRow = showMoreButton.parentNode;
      artistRow.insertBefore(imgElement, showMoreButton);
    } else {
      showMoreButton.style.display = "none";
    }
  });
  return showMoreButton;
}

// Get the next image for an artist
function getNextImage(artist) {
  if (displayedImages[artist] < artistsData[artist].length) {
    const nextImage = artistsData[artist][displayedImages[artist]];
    displayedImages[artist]++;
    return nextImage;
  } else {
    return null;
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    console.log("Text copied to clipboard");
  }).catch((err) => {
    console.error("Failed to copy text: ", err);
  });
}

function loadMoreImages() {
  // Continue shuffling the remaining, unloaded artists
  const remainingArtists = Object.keys(artistsData).slice(totalArtistsLoaded);
  const shuffledRemainingArtists = shuffleArray(remainingArtists).slice(
    0,
    initialLoadLimit,
  );

  shuffledRemainingArtists.forEach((artist) => {
    displayedImages[artist] = displayedImages[artist] || 0;
    const artistRow = createArtistRow(artist);
    document.getElementById("gallery").appendChild(artistRow);
    // Display a shuffled selection of images for this artist
    displayRandomImages(artist, artistRow, 4);
  });

  totalArtistsLoaded += shuffledRemainingArtists.length;

  // Check if there are more artists to load and set up lazy loading if so
  if (totalArtistsLoaded < Object.keys(artistsData).length) {
    const newLastArtistRow = document.querySelector(".artist-row:last-child");
    if (newLastArtistRow) {
      setupLazyLoading();
    }
  }
}

loadInitialImages();
