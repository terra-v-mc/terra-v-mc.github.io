const API = "https://terrav-news.99-megatonne-fusswurzel.workers.dev";
const status = document.getElementById("status");
const list = document.getElementById("newspaperList");
const username = localStorage.getItem("username");

async function loadNewspapers() {
    if (!username) {
        status.textContent = "Du bist nicht eingeloggt.";
        return;
    }

    try {
        const response = await fetch(`${API}/user/newspapers?user=${encodeURIComponent(username)}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Fehler");

        list.innerHTML = "";

        if (data.length === 0) {
            status.textContent = "Du besitzt keine Zeitungen.";
            return;
        }

        status.textContent = "";

        data.forEach(newspaper => {
            const li = document.createElement("li");
            const link = document.createElement("a");

            link.href = `./view.html?id=${encodeURIComponent(newspaper.id)}`;
            link.textContent = newspaper.name || `Zeitung #${newspaper.id}`;

            li.appendChild(link);
            list.appendChild(li);
        });
    } catch (error) {
        console.error(error);
        status.textContent = error.message || "Zeitungen konnten nicht geladen werden.";
    }
}

loadNewspapers();