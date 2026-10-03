const articles = [
    {
        category: "Publicity",
        title: "new trailer comming sool",
        lead: "epic animations by ThePhoenix49.",
        text: "The new epic trailer made by ThePhoenix49 wil be released soon on the official TerraV YouTube accont.",
        author: "no-name-coding",
        time: "next days",
        image: ""
    }
];

const container = document.getElementById("articles");
const dateElement = document.getElementById("date");

dateElement.textContent = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
}).format(new Date());

articles.forEach((article, index) => {
    const element = document.createElement("article");
    element.className = "article";

    element.innerHTML = `
        ${article.image ? `
            <div class="article-image">
                <img src="${article.image}" alt="${article.title}">
            </div>
        ` : ""}

        <div class="article-category">
            ${article.category}
        </div>

        <h2>${article.title}</h2>

        <div class="lead">
            ${article.lead}
        </div>

        <p>
            ${article.text}
        </p>

        <div class="article-meta">
            <span>${article.author}</span>
            <span>${article.time}</span>
        </div>
    `;

    container.appendChild(element);

    if (index < articles.length - 1 && index === 2) {
        const divider = document.createElement("div");
        divider.className = "divider";
        container.appendChild(divider);
    }
});