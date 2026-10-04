const API = "https://terrav-news.99-megatonne-fusswurzel.workers.dev";

const headlineList = document.getElementById("headlineList");
const status = document.getElementById("status");
const articleInfo = document.getElementById("articleInfo");
const addHeadlineButton = document.getElementById("addHeadline");
const saveButton = document.getElementById("save");
const newArticleButton = document.getElementById("newArticle");

const params = new URLSearchParams(location.search);
let articleId = params.get("id");
let article = null;

async function loadArticle() {
    if (!articleId) {
        status.textContent = "Keine Artikel-ID angegeben.";
        return;
    }

    try {
        status.textContent = "Artikel wird geladen...";

        const response = await fetch(`${API}/articles?paper=${encodeURIComponent(articleId)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Artikel konnten nicht geladen werden.");
        }

        const found = data.find(item => String(item.id) === String(articleId));

        if (!found) {
            throw new Error("Artikel nicht gefunden.");
        }

        article = found;

        try {
            article.content = JSON.parse(article.content || "[]");
        } catch {
            article.content = [];
        }

        if (!Array.isArray(article.content)) {
            article.content = [];
        }

        articleInfo.textContent = `Artikel #${article.id} · ${article.date || ""}`;

        renderHeadlines();
        status.textContent = "";
    } catch (error) {
        console.error(error);
        status.textContent = error.message;
    }
}

function renderHeadlines() {
    headlineList.innerHTML = "";

    article.content.forEach((headline, index) => {
        headlineList.appendChild(createHeadlineCard(headline, index));
    });
}

function createHeadlineCard(headline, index) {
    const card = document.createElement("article");
    card.className = "headline-card";

    card.innerHTML = `
        <div class="card-header">
            <h2>news ${index + 1}</h2>
            <button type="button" class="delete-button">delete</button>
        </div>

        <div class="fields">
            <label>
                kategory
                <input type="text" data-field="category" value="${escapeHtml(headline.category || "")}">
            </label>

            <label>
                title
                <input type="text" data-field="title" value="${escapeHtml(headline.title || "")}">
            </label>

            <label>
                subtitle
                <input type="text" data-field="lead" value="${escapeHtml(headline.lead || "")}">
            </label>

            <label>
                author
                <input type="text" data-field="author" value="${escapeHtml(headline.author || "")}">
            </label>

            <label>
                time
                <input type="text" data-field="time" value="${escapeHtml(headline.time || "")}">
            </label>

            <label>
                picture
                <input type="text" data-field="image" value="${escapeHtml(headline.image || "")}">
            </label>

            <label class="full">
                content
                <textarea data-field="text" rows="7">${escapeHtml(headline.text || "")}</textarea>
            </label>
        </div>
    `;

    card.querySelectorAll("[data-field]").forEach(input => {
        input.addEventListener("input", () => {
            article.content[index][input.dataset.field] = input.value;
        });
    });

    card.querySelector(".delete-button").addEventListener("click", () => {
        article.content.splice(index, 1);
        renderHeadlines();
    });

    return card;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

addHeadlineButton.addEventListener("click", () => {
    article.content.push({
        category: "",
        title: "",
        lead: "",
        text: "",
        author: "",
        time: "",
        image: ""
    });

    renderHeadlines();

    const cards = headlineList.querySelectorAll(".headline-card");
    cards[cards.length - 1]?.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
});

saveButton.addEventListener("click", async () => {
    if (!articleId || !article) return;

    try {
        saveButton.disabled = true;
        status.textContent = "Speichern...";

        const response = await fetch(`${API}/setArticle`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                articleId: articleId,
                content: article.content
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Speichern fehlgeschlagen.");
        }

        status.textContent = "Gespeichert.";
    } catch (error) {
        console.error(error);
        status.textContent = error.message;
    } finally {
        saveButton.disabled = false;
    }
});

newArticleButton.addEventListener("click", async () => {
    const paper = params.get("paper");

    if (!paper) {
        status.textContent = "Keine Zeitungs-ID angegeben.";
        return;
    }

    try {
        newArticleButton.disabled = true;
        status.textContent = "Neuer Artikel wird erstellt...";

        const response = await fetch(`${API}/addArticle`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                newsletterId: paper,
                date: new Date().toISOString().split("T")[0],
                content: []
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Artikel konnte nicht erstellt werden.");
        }

        location.href = `?id=${encodeURIComponent(data.articleId)}&paper=${encodeURIComponent(paper)}`;
    } catch (error) {
        console.error(error);
        status.textContent = error.message;
        newArticleButton.disabled = false;
    }
});

loadArticle();