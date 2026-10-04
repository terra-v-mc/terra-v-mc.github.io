const news = [
    {
        title: "OFFICIAL NEWS",
        headline: "OFFICIAL\nNEWS",
        subline: "Official newspaper form our team.",
        id: 1
    },
    {
        title: "NONE",
        headline: "NOT YET\nBOOKED",
        subline: "This could be yours.",
        id: 0
    },
        {
        title: "NONE",
        headline: "NOT YET\nBOOKED",
        subline: "This could be yours.",
        id: 0
    },
        {
        title: "NONE",
        headline: "NOT YET\nBOOKED",
        subline: "This could be yours.",
        id: 0
    },
        {
        title: "NONE",
        headline: "NOT YET\nBOOKED",
        subline: "This could be yours.",
        id: 0
    },
        {
        title: "NONE",
        headline: "NOT YET\nBOOKED",
        subline: "This could be yours.",
        id: 0
    },
        {
        title: "NONE",
        headline: "NOT YET\nBOOKED",
        subline: "This could be yours.",
        id: 0
    },
    {
        title: "OTHERS",
        headline: "MINI\nNEWS",
        subline: "Other small newspapers.",
        id: "o"
    }
];


const newspaperDisplay = document.getElementById("newspaperDisplay");

news.forEach((article, index) => {

    const newspaper = document.createElement("a");
    newspaper.href = "./check.html?id=" + article.id;
    newspaper.className = `newspaper paper-${index + 1}`;

    newspaper.innerHTML = `
        <div class="paper-title">${article.title}</div>

        <div class="headline">
            ${article.headline.replace(/\n/g, "<br>")}
        </div>

        <div class="subheadline">
            ${article.subline}
        </div>

        <div class="fake-lines">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    newspaperDisplay.appendChild(newspaper);
});