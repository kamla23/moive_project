
/// ================= API CONFIG =================
const url = 'https://imdb236.p.rapidapi.com/api/imdb/cast/nm0000190/titles';
const options = {
  method: 'GET',
  headers: {
    'x-rapidapi-key': '2d234a30b5mshedee69cc575c217p1ac3cajsn0ad987d87517',
    'x-rapidapi-host': 'imdb236.p.rapidapi.com',
    'Content-Type': 'application/json'
  }
};

const slider = document.getElementById("movieSlider");
const loader = document.getElementById("loader");

// ================= LOADER FUNCTION =================
function showLoader(show) {
  if (loader) {
    loader.style.display = show ? "flex" : "none";
  }
}

// ================= FETCH MOVIES LIST =================
async function fetchMovies() {
  try {
    showLoader(true);
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json(); 
    const moviesList = Array.isArray(data) ? data : (data.results || []);
    displayMovies(moviesList);

  } catch (error) {
    console.error("Error fetching movies:", error);
  } finally {
    showLoader(false);
  }
}

fetchMovies();

// ================= DISPLAY MOVIES IN SLIDER =================
function displayMovies(movies) {
  if (!slider) return;
  slider.innerHTML = "";

  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  movies.forEach((movie) => {
    // 🔍 कंसोल में पूरा डेटा प्रिंट करें ताकि हम देख सकें कि नाम क्या हैं
    console.log("Full Movie Data:", movie);

    // 1. पोस्टर के सारे संभावित नाम चेक करना
    const moviePoster = movie.primaryImage || movie.poster || movie.image || (movie.primaryImage?.url) || "";
    if (!moviePoster) return; // बिना पोस्टर वाली मूवी को छोड़ दें

    // 2. टाइटल ढूंढने के लिए अलग-अलग रास्ते (IMDb API के अलग-अलग फॉर्मेट्स के लिए)
    let movieTitle = "Unknown Title";
    if (movie.titleText && movie.titleText.text) {
      movieTitle = movie.titleText.text;
    } else if (movie.title) {
      movieTitle = movie.title;
    } else if (movie.name) {
      movieTitle = movie.name;
    } else if (movie.originalTitle) {
      movieTitle = movie.originalTitle;
    }

    // 3. रेटिंग और अन्य डिटेल्स
    const movieRating = movie.imdbRating || movie.rating || movie.chartRating || 0;
    const releaseDate = movie.releaseDate || movie.year || (movie.releaseYear?.year) || "2024";
    const overview = movie.description || movie.plot || "A fascinating journey filled with suspense, action, and deep emotions. A must-watch masterpiece.";

    const card = document.createElement("div");
    card.classList.add("movie-card");

    card.innerHTML = `
      <div class="movie-image">
        <img src="${moviePoster}" alt="${movieTitle}">
        <div class="rating">⭐ ${Number(movieRating).toFixed(1)}</div>
      </div>
      <h3>${movieTitle}</h3>
      <button class="fav-btn">🤍</button>
    `;

    const favBtn = card.querySelector(".fav-btn");
    if (favorites.some((fav) => fav.title === movieTitle)) {
      favBtn.textContent = "❤️";
    }

    // Favorite Click
    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      let currentFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
      const index = currentFavorites.findIndex((f) => f.title === movieTitle);

      if (index === -1) {
        currentFavorites.push({ title: movieTitle, poster: moviePoster, rating: movieRating });
        favBtn.textContent = "❤️";
      } else {
        currentFavorites.splice(index, 1);
        favBtn.textContent = "🤍";
      }
      localStorage.setItem("favorites", JSON.stringify(currentFavorites));
      updateFavCount();
    });

    // ================= CLICK FOR DETAILS (MODAL) =================
    card.addEventListener("click", () => {
      const modal = document.getElementById("movieModal");
      const modalContent = document.querySelector(".modal-content");

      if (modal && modalContent) {
        modal.style.display = "flex";
        
        modalContent.innerHTML = `
          <span class="close">&times;</span>
          <div class="modal-flex" style="display: flex; gap: 20px; color: white; padding: 20px; align-items: flex-start; flex-wrap: wrap;">
            <img src="${moviePoster}" style="width: 220px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);" />
            <div style="flex: 1; min-width: 250px;">
              <h2 style="margin-top: 0; color: #ff4757; font-size: 1.8rem;">${movieTitle}</h2>
              <p style="font-size: 1.1rem; margin: 10px 0;"><strong>⭐ Rating:</strong> ${Number(movieRating).toFixed(1)}</p>
              <p style="font-size: 1.1rem; margin: 10px 0;"><strong>Release Date:</strong> ${releaseDate}</p>
              <h4 style="margin: 20px 0 5px 0; color: #f1f2f6;">Overview:</h4>
              <p style="line-height: 1.6; color: #ced6e0; margin-top: 0;">${overview}</p>
            </div>
          </div>
        `;
        
        modalContent.querySelector(".close").addEventListener("click", () => {
          modal.style.display = "none";
        });
      }
    });

    slider.appendChild(card);
  });

  updateFavCount();
}

// ================= FAVORITE COUNT =================
function updateFavCount() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const favCountEl = document.getElementById("favCount");
  if (favCountEl) favCountEl.innerText = `(${favorites.length})`;
}

// ================= SLIDER BUTTONS =================
const rightBtn = document.querySelector(".right");
const leftBtn = document.querySelector(".left");
if (rightBtn) rightBtn.addEventListener("click", () => slider.scrollBy({ left: 300, behavior: "smooth" }));
if (leftBtn) leftBtn.addEventListener("click", () => slider.scrollBy({ left: -300, behavior: "smooth" }));

// ================= AUTO SLIDE =================
let autoSlide = setInterval(() => {
  if (!slider) return;
  slider.scrollBy({ left: 220, behavior: "smooth" });
  if (slider.scrollLeft >= slider.scrollWidth - slider.clientWidth) {
    slider.scrollTo({ left: 0, behavior: "smooth" });
  }
}, 3000);

if (slider) {
  slider.addEventListener("mouseenter", () => clearInterval(autoSlide));
  slider.addEventListener("mouseleave", () => {
    autoSlide = setInterval(() => {
      slider.scrollBy({ left: 220, behavior: "smooth" });
    }, 3000);
  });
}

// ================= MODAL CLOSE =================
window.addEventListener("click", (e) => {
  const modal = document.getElementById("movieModal");
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// ================= DARK/LIGHT MODE =================
const themeToggle = document.getElementById("themeToggle");
if (localStorage.getItem("mode") === "light") {
  document.body.classList.add("light");
  if (themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
}
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    if (document.body.classList.contains("light")) {
      localStorage.setItem("mode", "light");
      themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
      localStorage.setItem("mode", "dark");
      themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
  });
}

// ================= LOCAL SEARCH =================
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase();
    document.querySelectorAll(".movie-card").forEach((card) => {
      const title = card.querySelector("h3").innerText.toLowerCase();
      card.style.display = title.includes(value) ? "block" : "none";
    });
  });
}



// ================= WATCH NOW & WATCHLIST BUTTONS LOGIC =================

const watchBtn = document.querySelector(".watch");
const watchlistBtn = document.querySelector(".watchlist");

// 1. Watch Now पर क्लिक करने पर ट्रेलर पॉपअप खोलना
if (watchBtn) {
  watchBtn.addEventListener("click", () => {
    const modal = document.getElementById("movieModal");
    const modalContent = document.querySelector(".modal-content");
    
    if (modal && modalContent) {
      modal.style.display = "flex";
      // यहाँ हम एक डमी यूट्यूब ट्रेलर लोड कर रहे हैं
      modalContent.innerHTML = `
        <span class="close">&times;</span>
        <h2 style="color: white; margin-bottom: 15px;">Playing: Beyond the Horizon</h2>
        <iframe width="100%" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                title="YouTube video player" frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen style="border-radius: 8px;">
        </iframe>
      `;
      
      modalContent.querySelector(".close").addEventListener("click", () => {
        modal.style.display = "none";
      });
    }
  });
}

// 2. Watchlist बटन पर क्लिक करने पर स्टेट बदलना
if (watchlistBtn) {
  watchlistBtn.addEventListener("click", () => {
    if (watchlistBtn.innerText === "+ Watchlist") {
      watchlistBtn.innerText = "✓ Added to Watchlist";
      watchlistBtn.style.background = "#2e7d32"; // ग्रीन कलर (सफलता का प्रतीक)
      alert("Beyond the Horizon has been added to your Watchlist!");
    } else {
      watchlistBtn.innerText = "+ Watchlist";
      watchlistBtn.style.background = "rgba(255, 255, 255, 0.1)"; // पुराना कलर
    }
  });
}