const API = "https://terrav-news.99-megatonne-fusswurzel.workers.dev";
const list = document.getElementById("articleList");
const status = document.getElementById("status");

const id = new URLSearchParams(location.search).get("id");

async function loadArticles() {
    if (!id) {
        status.textContent = "Keine Zeitung ausgewählt.";
        return;
    }

    try {
        const response = await fetch(`${API}/articles?paper=${encodeURIComponent(id)}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Fehler");

        list.innerHTML = "";

        if (data.length === 0) {
            status.textContent = "Diese Zeitung hat noch keine Artikel.";
            return;
        }

        status.textContent = "";

        data.forEach(article => {
            const li = document.createElement("li");
            const link = document.createElement("a");

            link.href = `editor/?id=${encodeURIComponent(article.id)}&paper=${encodeURIComponent(id)}`;
            link.textContent = article.date || `Artikel #${article.id}`;

            li.appendChild(link);
            list.appendChild(li);
        });
    } catch (error) {
        console.error(error);
        status.textContent = error.message || "Artikel konnten nicht geladen werden.";
    }
}

loadArticles();