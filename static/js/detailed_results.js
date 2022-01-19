jct.site_modals.share_results = {
    title: "Share this result",
    body: `<p>To share this result, copy the following link
            <button class="button button--primary" style="float: right;" onClick="jct.copy_results_url()">Copy</button>
        </p>
        <p id="jct_results_url"></p>`
}

jct.explain = (q) => {
    // start by clearing anything that was in the explain section before
    let detailed_results = jct.d.gebi("jct_detailed_results_section")
    detailed_results.innerHTML = "";

    let yq = jct._yourQuery(q);
    let ways = jct._renderWays(q);
    let routes = jct._renderRoutes(q);


    let compliant = "";
    if (routes.compliant.length > 0) {
        compliant = `<h2>${jct.lang.explain.supporting_data.compliant_routes}</h2>` + routes.compliant.join("");
    }

    let non_compliant = "";
    if (routes.non_compliant.length > 0) {
        non_compliant = `<h2>${jct.lang.explain.supporting_data.non_compliant_routes}</h2>` + routes.non_compliant.join("");
    }

    let unknown = "";
    if (routes.unknown.length > 0) {
        unknown = `<h2>${jct.lang.explain.supporting_data.unknown_routes}</h2>` + routes.unknown.join("");
    }

    let elem = jct.htmlToElement(`<div id='jct_detailed_result_text'>${yq} ${ways} ${compliant} ${non_compliant} ${unknown}</div>`);
    detailed_results.append(elem);

    jct._resultPrint();
}

jct._resultPrint = () => {
    let print = jct.d.gebi('jct_print');
    if (print) {
        print.addEventListener("click", () => {
            let a = window.open('', '', 'height=500, width=500');
            let compliance = jct.d.gebc("jct_compliance")[0];
            let results_to_print = jct.d.gebi("jct_detailed_result_text");
            let share_url = jct.d.gebi("jct_results_url");
            let share_text = ''
            if (share_url) {
                share_text = `To view these results, visit <a href="`+ share_url.innerHTML +`">`+ share_url.innerHTML + `</a>`
            }
            a.document.write(compliance.innerHTML);
            a.document.write(results_to_print.innerHTML);
            a.document.write(share_text);
            a.document.close();
            a.print();
        })
    }
}

jct._renderWays = (q) => {
    let title = jct.lang.explain.ways_to_comply.title;
    let intro = jct.lang.explain.ways_to_comply.text;

    let ways = `<h2>${title}</h2>
                <p>${intro}</p>`;

    let conditions = jct.lang.explain.ways_to_comply.conditions.title;
    let conditionsIntro = jct.lang.explain.ways_to_comply.conditions.text;

    let routeMust = jct.lang.explain.route_match.must;
    let routeOr = jct.lang.explain.route_match.or;
    let routeNot = jct.lang.explain.route_match.not;
    let qualMust = jct.lang.explain.qualification_match.must;
    let qualOr = jct.lang.explain.qualification_match.or;
    let qualNot = jct.lang.explain.qualification_match.not;

    function makeWay(card, matcher, bool, lang, title) {
        let ways = "";
        if (card[matcher][bool]) {
            ways += `<p>${title}</p>
                        <ul>`;
            for (let j = 0; j < card[matcher][bool].length; j++) {
                let key = card[matcher][bool][j];
                let label = lang[key].label;
                ways += `<li>${label}</li>`;
            }
            ways += `</ul>`;
        }
        return ways;
    }

    function makeHowRoute(card, bool, how, q) {
        let ways = "";
        if (card.match_routes[bool]) {
            for (let j = 0; j < card.match_routes[bool].length; j++) {
                let key = card.match_routes[bool][j];
                for (let k = 0; k < q.results.length; k++) {
                    let result = q.results[k];
                    if (result.route === key) {
                        let isCompliant = result.compliant === "yes";
                        if (isCompliant) {
                            let text = jct.lang.explain.how[key][how];
                            ways += `<li>${text}</li>`;
                        }
                    }
                }
            }
        }
        return ways;
    }

    function makeHowQual(card, bool, how, q) {
        let ways = "";
        if (card.match_qualifications[bool]) {
            for (let j = 0; j < card.match_qualifications[bool].length; j++) {
                let fullQual = card.match_qualifications[bool][j];
                let bits = fullQual.split(".");
                let route = bits[0];
                let qual = bits[1];
                for (let k = 0; k < q.results.length; k++) {
                    let result = q.results[k];
                    if (result.route === route) {
                        let isCompliant = result.compliant === "yes";
                        if (isCompliant) {
                            let presentQualifications = Object.keys(result.qualifications);
                            if (presentQualifications.includes(qual)) {
                                let text = jct.lang.explain.how[fullQual][how];
                                ways += `<li>${text}</li>`;
                            }
                        }
                    }
                }
            }
        }
        return ways;
    }

    let cardsToDisplay = q.cards;
    for (let i = 0; i < cardsToDisplay.length; i++) {
        let card = cardsToDisplay[i];
        let wayTitle = jct.lang.cards[card.id].title;
        ways += `<h3>${wayTitle}</h3>
                 <h4>${conditions}</h4>
                 <p>${conditionsIntro}</p>`;

        if (card.match_routes) {
            ways += makeWay(card, "match_routes", "must", jct.lang.explain.routes, routeMust);
            ways += makeWay(card, "match_routes", "or", jct.lang.explain.routes, routeOr);
            ways += makeWay(card, "match_routes", "not", jct.lang.explain.routes, routeNot);
        }

        if (card.match_qualifications) {
            ways += makeWay(card, "match_qualifications", "must", jct.lang.explain.qualifications, qualMust);
            ways += makeWay(card, "match_qualifications", "or", jct.lang.explain.qualifications, qualOr);
            ways += makeWay(card, "match_qualifications", "not", jct.lang.explain.qualifications, qualNot);
        }

        let how = jct.lang.explain.ways_to_comply.how_it_complies.title;
        let howIntro = jct.lang.explain.ways_to_comply.how_it_complies.text;
        ways += `<h4>${how}</h4>
                 <p>${howIntro}</p>
                 <ul>`;

        if (card.match_routes) {
            ways += makeHowRoute(card, "must", "must_or", q);
            ways += makeHowRoute(card, "or", "must_or", q);
            ways += makeHowRoute(card, "not", "not", q);
        }

        if (card.match_qualifications) {
            ways += makeHowQual(card, "must", "must_or", q);
            ways += makeHowQual(card, "or", "must_or", q);
            ways += makeHowQual(card, "not", "not", q);
        }

        ways += `</ul>`;
    }

    return ways;
}

jct._renderRoutes = (q) => {
    let response = {
        compliant: [],
        non_compliant: [],
        unknown: []
    }
    q.results.forEach((r) => {
        let name = jct.lang.explain.routes[r.route].label;
        let statement = jct.lang.explain.routes[r.route][r.compliant].statement;
        let explanation = jct.lang.explain.routes[r.route][r.compliant].explanation;
        let qualification = jct.get_qualifications(r.qualifications);
        let route = `<h3>` + name + `</h3>` +
            `<p>`  + statement + `</p>` +
            `<p>`  + qualification + `</p>` +
            `<p>`  + explanation + `</p>`;

        let is_in_doaj = jct.is_in_doaj(r.route, r.log);
        let is_in_progress_doaj = jct.is_in_progress_doaj(r.route, r.log);
        if (r.log) {
            let route_defined = r.route in jct.lang.api_codes.logs;
            r.log.forEach((log) => {
                let action = log.code;
                // FIXME: these seem very specific, I don't think they should be here, but I need
                // to understand them before I can factor them out
                if (is_in_doaj && action === 'FullOA.NotInProgressDOAJ') {
                    return;
                }
                if (is_in_progress_doaj && action === 'FullOA.NotInDOAJ') {
                    return;
                }
                if (route_defined && log.code in jct.lang.api_codes.logs[r.route]) {
                    action = jct.lang.api_codes.logs[r.route][log.code];
                }
                let parameters = ''
                if (log.parameters) {
                    for (let [parameter,values] of Object.entries(log.parameters)) {
                        let parent_key = log.code + '.Properties';
                        if (route_defined && parent_key in jct.lang.api_codes.logs[r.route] &&
                            parameter in jct.lang.api_codes.logs[r.route][parent_key] &&
                            jct.lang.api_codes.logs[r.route][parent_key][parameter]) {
                            // The key is displayed irrespective of the value existing
                            parameters += jct.lang.api_codes.logs[r.route][parent_key][parameter] + "<br/>";
                        }

                        if (values && values.length > 0) {
                            parameters += "<ul>";
                            values.forEach((value) => {
                                if (parameter === 'version') {
                                    value = jct.version_rename(value);
                                }
                                parameters += "<li>" + value + "</li>";
                            })
                            parameters += "</ul>";
                        }
                    }
                }
                route += "<ul><li>" + action + "</li>";
                route += parameters;
                route += "</ul>";
            })
        }

        if (r.compliant === "yes") {
            response.compliant.push(route);
        } else if (r.compliant === "no") {
            response.non_compliant.push(route);
        } else {
            response.unknown.push(route);
        }
    });

    return response;
}

jct._yourQuery = (q) => {
    let compliant_count = 0;
    let non_compliant_count = 0;
    let unknown_count = 0;

    for (let i = 0; i < q.results.length; i++) {
        let result = q.results[i];
        if (result.compliant === "yes") {
            compliant_count++;
        } else if (result.compliant === "no") {
            non_compliant_count++;
        } else {
            unknown_count++;
        }
    }

    let issns = jct.chosen.journal.issn.join(", ");
    let publisher = jct.chosen.journal.publisher !== undefined ? jct.chosen.journal.publisher : jct.lang.explain.your_query.publisher_not_known;

    let journal = jct.lang.explain.your_query.journal_title_unknown;
    if (jct.chosen.journal.title) {
        journal = jct.chosen.journal.title;
    }
    journal += " (ISSN: " + issns + ")";

    let text = `<h3>${jct.lang.explain.your_query.title}</h3>
        <p>${jct.lang.explain.your_query.text}
        <ul>
            <li>${jct.lang.explain.your_query.journal_label}: </li>
            <ul class="second">
                <li> ` + journal + `</li>
                <li> ${jct.lang.explain.your_query.publisher_label}: ` + publisher + `</li>
            </ul>
            <li>${jct.lang.explain.your_query.funder_label}: ` + jct.chosen.funder.name + `</li>`

    if (jct.chosen.institution){
        let inner_text = `${jct.lang.explain.your_query.institution_label}: ` + jct.chosen.institution.title;
        if (jct.chosen.institution.alternate && !(/^[a-zA-Z0-9 ]+$/.test(jct.chosen.institution.alternate))) {
            inner_text += ' (' + jct.chosen.institution.alternate + ')';
        }
        if (jct.chosen.institution.country) {
            inner_text += ', ' + jct.chosen.institution.country;
        }
        if (jct.chosen.institution.id) {
            inner_text += ' (ROR: ' + jct.chosen.institution.id + ')';
        }
        text += `<li>` + inner_text + `</li>`
    }
    else {
        text += `<li>${jct.lang.explain.your_query.unaffiliated}</li>`
    }

    let statement = jct.lang.explain.your_query.statement;
    statement = statement.replace("{date}", new Date(q.request.started).toUTCString());
    statement = statement.replace("{compliant}", compliant_count);
    statement = statement.replace("{compliant_plural}", compliant_count !== 1 ? "s" : "");
    statement = statement.replace("{non_compliant}", non_compliant_count);
    statement = statement.replace("{non_compliant_plural}", non_compliant_count !== 1 ? "s" : "");
    statement = statement.replace("{unknown}", unknown_count);
    statement = statement.replace("{unknown_plural}", unknown_count !== 1 ? "s" : "");

    text += `</ul>${statement}</p>`;
    return text;
}

jct.modal_setup.share_results = function () {
    jct.display_results_url();
}

jct.get_qualifications = (qualifications) => {
    let qualification = '';
    if ((typeof qualifications !== "undefined") && qualifications.length > 0) {
        for (let [key,values] of Object.entries(qualifications[0])) {
            if (key in jct.lang.api_codes.qualifications && 'description' in jct.lang.api_codes.qualifications[key]) {
                qualification = jct.lang.api_codes.qualifications[key]['description'] + "<br/>";
                if (values) {
                    for (let [k2,v2] of Object.entries(values)) {
                        if (v2) {
                            let label = k2;
                            if (key in jct.lang.api_codes.qualifications && k2 in jct.lang.api_codes.qualifications[key]) {
                                label = jct.lang.api_codes.qualifications[key][k2]
                            }
                            qualification += label + ' ' + v2 + "<br/>";
                        }
                    }
                }
            }
        }
    }
    if (qualification) {
        return `<p>` + jct.lang.explain.supporting_data.qualifications_prefix + ` ` + qualification + `</p>`;
    }
    return qualification
}

jct.is_in_doaj = (route, logs) => {
    if (route !== 'fully_oa') { return false }
    let is_in = false;
    logs.forEach((log) => {
        if (log.code === 'FullOA.InDOAJ') {
            is_in = true;
        }
    })
    return is_in
}

jct.is_in_progress_doaj = (route, logs) => {
    if (route !== 'fully_oa') { return false }
    let is_in = false;
    logs.forEach((log) => {
        if (log.code === 'FullOA.InProgressDOAJ') {
            is_in = true;
        }
    })
    return is_in
}

jct.version_rename = (val) => {
    let new_val;
    switch(val) {
        case "publishedVersion":
            new_val = jct.lang.explain.versions.publishedVersion;
            break;
        case "acceptedVersion":
            new_val = jct.lang.explain.versions.acceptedVersion;
            break;
        case "submittedVersion":
            new_val = jct.lang.explain.versions.submittedVersion;
            break;
        default:
            new_val = val;
   }
   return new_val
}
