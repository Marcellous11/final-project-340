const NASA_KEY = "cSle6kEdSzMgZbLkmbGnDkJphl8GfzGOrmRG5vJR"; // api.nasa.gov — replace with your real key
const exploreBtn = document.querySelector("#exploreBtn");
const dateInput = document.querySelector("#datePicker");

async function GetSpaceData(date) {
  const res = await fetch(
    `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}&date=${date}`,
  );
  if (!res.ok) throw new Error(`NASA API ${res.status}`);
  return res.json();
}

async function GetNewsData(date) {
  const [, m, d] = date.split("-");
  const mm = m.padStart(2, "0");
  const dd = d.padStart(2, "0");
  const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/${mm}/${dd}`;
  const res = await fetch(url, {
    headers: { "Api-User-Agent": "SpaceNews/1.0 (student project)" },
  });
  if (!res.ok) throw new Error(`Wikipedia API ${res.status}`);
  const data = await res.json();
  return data;
}

async function LoadSpaceData(data) {
  const spaceCard = document.querySelector(".space-card");
  spaceCard.innerHTML = "";

  const image = document.createElement("img");
  const title = document.createElement("h3");
  const description = document.createElement("p");

  image.src = await data.url;
  title.textContent = await data.title;
  description.textContent = await data.explanation;

  spaceCard.append(image);
  spaceCard.append(title);
  spaceCard.append(description);
}

async function LoadNewsData(data, year) {
  const newsCard = document.querySelector(".news-card");
  newsCard.innerHTML = "";
  ["events", "births", "deaths", "holidays"].forEach(
    (eventType) => {

      data[eventType].splice(0,2).forEach((event) => {
        if (!event.pages || event.pages.length === 0) return;
        const article = document.createElement("div");
        const typeEl = document.createElement("span");
        const yearEl = document.createElement("span");
        const description = document.createElement("p");
        const title = document.createElement("p");

        typeEl.textContent = eventType.toUpperCase();
        typeEl.classList.add("article-meta");
        yearEl.textContent = event.year;
        yearEl.classList.add("article-meta");
        description.textContent = event.pages[0].description;
        title.textContent = event.text;
        article.classList.add("article")

        const sep = document.createElement("span");

        sep.textContent = " · ";
        sep.classList.add("article-sep");
        article.append(typeEl);
        article.append(sep);
        article.append(yearEl);
        article.append(title);
        article.append(description);
        newsCard.append(article);
        if(newsCard.innerHTML === ""){
            newsCard.textContent = "No events on this day"
        }
      });
    },
  );
}

async function RenderPage() {
  try {
    let spaceData = JSON.parse(sessionStorage.getItem("spaceData"));
    let newsData = JSON.parse(sessionStorage.getItem("newsData"));

    if (!spaceData || !newsData) return;

    const year = parseInt(spaceData.date.split("-")[0]);
    LoadSpaceData(spaceData);
    LoadNewsData(newsData, year);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

function showError(message) {
  const spaceCard = document.querySelector(".space-card");
  const newsCard = document.querySelector(".news-card");
  spaceCard.innerHTML = `<p class="api-error">${message}</p>`;
  newsCard.innerHTML = "";
}

exploreBtn.addEventListener("click", async () => {
  let date = dateInput.value || "1996-09-24";
  exploreBtn.textContent = "Loading...";
  exploreBtn.disabled = true;
  try {
    const spaceData = await GetSpaceData(date);
    const newsData = await GetNewsData(date);

    sessionStorage.setItem("spaceData", JSON.stringify(spaceData));
    sessionStorage.setItem("newsData", JSON.stringify(newsData));

    RenderPage();
  } catch (err) {
    if (err.message.includes("400")) {
      showError("NASA has no image for this date. Try a different date (APOD starts June 16, 1995).");
    } else if (err.message.includes("429")) {
      showError("NASA API rate limit reached. Wait a few minutes and try again.");
    } else if (err.message.includes("503")) {
      showError("NASA's API is temporarily unavailable. Please try again shortly.");
    } else {
      showError(`Something went wrong: ${err.message}`);
    }
  } finally {
    exploreBtn.textContent = "Explore this date";
    exploreBtn.disabled = false;
  }
});

RenderPage();
