const API_URL = "https://terrav-news.99-megatonne-fusswurzel.workers.dev";

function getNewspaperId() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        throw new Error("Keine Zeitungs-ID angegeben.");
    }

    return id;
}

async function getNewspaper(newspaperId) {
    const response = await fetch(
        `${API_URL}/article/latest?paper=${encodeURIComponent(newspaperId)}`
    );

    if (!response.ok) {
        throw new Error(
            `Worker-Fehler: ${response.status} ${response.statusText}`
        );
    }

    const data = await response.json();

    if (Array.isArray(data)) {
        return data;
    }

    if (typeof data.content === "string") {
        data.content = JSON.parse(data.content);
    }

    if (Array.isArray(data.content)) {
        return data.content;
    }

    if (data.content && typeof data.content === "object") {
        return [data.content];
    }

    return [data];
}

function createArticle(article, index) {
    const element = document.createElement("article");
    element.className = "article";

    if (index === 0) {
        element.classList.add("main-article");
    }

    if (article.image) {
        const image = document.createElement("div");
        image.className = "article-image";

        const img = document.createElement("img");
        img.src = article.image;
        img.alt = article.title || "";

        image.appendChild(img);
        element.appendChild(image);
    }

    const category = document.createElement("div");
    category.className = "article-category";
    category.textContent = article.category || "NEWS";

    const title = document.createElement("h2");
    title.textContent = article.title || "Ohne Titel";

    const lead = document.createElement("div");
    lead.className = "lead";
    lead.textContent = article.lead || "";

    const text = document.createElement("p");
    text.textContent = article.text || "";

    const meta = document.createElement("div");
    meta.className = "article-meta";

    const author = document.createElement("span");
    author.textContent = article.author || "TERRAV NEWS";

    const time = document.createElement("span");
    time.textContent = article.time || "";

    meta.appendChild(author);
    meta.appendChild(time);

    element.appendChild(category);
    element.appendChild(title);

    if (article.lead) {
        element.appendChild(lead);
    }

    if (article.text) {
        element.appendChild(text);
    }

    element.appendChild(meta);

    return element;
}

function createDivider() {
    const divider = document.createElement("div");
    divider.className = "divider";

    return divider;
}

async function loadNewspaper() {
    const articlesContainer = document.querySelector("#articles");
    const errorElement = document.querySelector("#error");

    try {
        const newspaperId = getNewspaperId();

        const articles = await getNewspaper(newspaperId);

        if (!articles.length) {
            throw new Error("Diese Zeitung enthält keine Artikel.");
        }

        articlesContainer.innerHTML = "";

        articles.forEach((article, index) => {
            articlesContainer.appendChild(
                createArticle(article, index)
            );

            if (index < articles.length - 1) {
                articlesContainer.appendChild(
                    createDivider()
                );
            }
        });

    } catch (error) {
        console.error(error);

        articlesContainer.innerHTML = "";

        errorElement.textContent =
            error.message || "Die Zeitung konnte nicht geladen werden.";
    }
}

function check() {
    if (sessionStorage.getItem("diclaimer") === "true") {
        loadNewspaper();
    } else {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        window.location.href = "/news/check.html?id=" + encodeURIComponent(id);
    }
}

document.addEventListener(
    "DOMContentLoaded",
    check
);