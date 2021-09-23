function buildCard(cardConfig, uiText, results) {
    // img: cards.[card_id].icon
    // site.preferred
    // cards.[card_id].title
    //
    // cards.[card_id].body.default
    // cards.[card_id].body.[compliant route id]

    let cardText = uiText.cards[cardConfig.id];

    let icon = cardText.icon; // this will need to be substituted for the svg icon inline, and also accept a missing field or "false" to mean no icon
    let preferred = cardConfig.preferred === "true" ? uiText.site.preferred : "";
    let modal = cardConfig.hasOwnProperty("modal") ? uiText.modalIcon : "";     // FIXME: need to wire this icon to the actual modal

    let body = "";
    if (cardText.body.hasOwnProperty("default")) {
        body += cardText.body.default;
    }

    let compliantRoutes = [];
    for (let i = 0; i < results.length; i++) {
        let r = results[i];
        if (r.compliant === "yes") {
            compliantRoutes.push(r.route);
        }
    }

    for (let i = 0; i < cardConfig.display_if_compliant.length; i++) {
        let route = cardConfig.display_if_compliant[i];
        if (compliantRoutes.includes(route)) {
            if (cardText.body.hasOwnProperty(route)) {
                body += cardText.body[route];
            }
        }
    }

    return `<div class="col col--1of4">
        <article class="card">
            ${icon}
            <h4 class="label card__heading">
                ${preferred}
                <span>${cardText.title}</span>
                ${modal}
            </h4>
            ${body}
        </article>
    </div>`;
}