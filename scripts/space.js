

 const NASA_KEY = 'cSle6kEdSzMgZbLkmbGnDkJphl8GfzGOrmRG5vJR'; // api.nasa.gov — replace with your real key

async function  GetSpaceData (date){
    
    const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}&date=${date}`)
    if (!res.ok) throw new Error(`NASA API ${res.status}`);
    return res.json()
}

async function GetNewsData(date){

    const [, m, d] = date.split('-');
    const mm = m.padStart(2, '0');
    const dd = d.padStart(2, '0');
    const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/${mm}/${dd}`;
    const res = await fetch(url, {
        headers: { 'Api-User-Agent': 'SpaceNews/1.0 (student project)' }
    });
    if (!res.ok) throw new Error(`Wikipedia API ${res.status}`);
    const data = await res.json();
    return data
}

async function LoadSpaceData(data){
    const spaceCard = document.querySelector(".space-card")

    const image = document.createElement("img")
    const title = document.createElement("h3")
    const description = document.createElement("p")

    image.src = await data.url
    title.textContent = await data.title
    description.textContent = await data.explanation

    spaceCard.append(image)
    spaceCard.append(title)
    spaceCard.append(description)
}

async function LoadNewsData(data,year){
    const newsCard = document.querySelector(".news-card");
    ['events','births',"deaths","holidays","selected"].forEach(eventType=>{
        if(data[eventType]){
            const eventCollection  = data[eventType].filter(single => single.year === year)
            
            eventCollection.forEach(event=>{
                const article = document.createElement("div")
                const typeEl = document.createElement("span")
                const yearEl = document.createElement("span")
                const description = document.createElement("p")
                const title = document.createElement("p")

                typeEl.textContent = eventType
                yearEl.textContent = year
                description.textContent = event.pages[0].extract
                title.textContent = event.text

                article.append(typeEl)
                article.append(yearEl)
                article.append(description)
                article.append(title)
                newsCard.append(article)
        })
        }



    })



}

(async () => {
    try {
        const spaceData = await GetSpaceData("2001-01-02")
        console.log('NASA OK', spaceData)
        const newsData = await GetNewsData("2001-01-02")
        console.log('Wikipedia OK', newsData)

        LoadSpaceData(spaceData)
        LoadNewsData(newsData, 2001)
    } catch (err) {
        console.error('Fetch failed:', err)
    }
})();