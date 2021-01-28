jct.explain = (q) => {
    let detailed_results = jct.d.gebi("jct_detailed_results_section")
    detailed_results.innerHTML = "";
    let compliant_routes = `<h2>Compliant Routes</h2>`
    let noncompliant_routes = `<h2>Non-Compliant Routes</h2>`
    let unknown_routes = `<h2>Unknown Routes</h2>`
    let compliant_routes_number = 0;
    let noncomplicant_routes_number = 0;
    let unknown_routes_number = 0;

    q.results.forEach((r) => {
        switch(r.route) {
            case jct.COMPLIANCE_ROUTES_SHORT.fully_oa:
                if (r.compliant === "yes") {
                    statement = "You are able to comply with Plan S as this is a fully open access journal.";
                    explanation = "The following checks in the Directory of Open Access Journals (DOAJ) were carried out to determine if your chosen journal is an open access journal that enables compliance:"
                } else if (r.compliant === "no") {
                    statement = "You are not able to <b>comply with Plan S</b> via the fully open access journal route.";
                    explanation = "The following checks in the Directory of Open Access Journals (DOAJ) were carried out to determine that this is not a route to compliance:"
                } else {
                    statement = "We are <b>unable to determine if you are complaint</b> via the fully open access journal route.";
                    explanation = "The following checks in the Directory of Open Access Journals (DOAJ) were carried out to determine compliance:"
                }
                break;
            case jct.COMPLIANCE_ROUTES_SHORT.ta:
                if (r.compliant === "yes") {
                    statement = "You are able to comply with Plan S via a Transformative agreement.";
                    explanation = "The following checks were carried out on the JCT’s Transformative Agreement Index to determine if a transformative agreements is available that would enable compliance:"
                } else if (r.compliant === "no") {
                    statement = "You are not able to <b>comply with Plan S</b> via a Transformative agreement.";
                    explanation = "The following checks were carried out on the JCT’s Transformative Agreement Index to determine if a transformative agreements is available that would enable compliance:"
                } else {
                    statement = "We are <b>unable to determine</b> if you are able to comply with Plan S via a Transformative agreement.";
                    explanation = "The following checks were carried out on the JCT’s Transformative Agreement Index to determine compliance:"
                }
                break;
            case jct.COMPLIANCE_ROUTES_SHORT.tj:
                if (r.compliant === "yes") {
                    statement = "This journal is a Transformative journal and therefore you <b>can comply with Plan S</b> via this route.";
                    explanation = "The following checks were carried out to determine that this is a compliant route:"
                } else if (r.compliant === "no") {
                    statement = "This journal is not a Transformative journal and therefore you <b>cannot comply with Plan S</b> via this route.";
                    explanation = "The following checks were carried out to determine that this is not a compliant route:"
                } else {
                    statement = "We are unable to determine if this journal is a Transformative journal and therefore <b>unable to determine compliance</b> via this route.";
                    explanation = "The following checks were carried out to determine compliance:"
                }
                break;
            case jct.COMPLIANCE_ROUTES_SHORT.sa:
                if (r.compliant === "yes") {
                    statement = "You are able to comply with Plan S via Self-archiving.";
                    explanation = "The following checks were carried out to determine whether the right exists to comply with Plan S via self-archiving. Data from Open Access Button Permissions (OAB Permissions) is used to see if the publisher's policy of self-archiving enables compliance. If it does not or if an unknown answer has been returned then data on cOAlition S Implementation Roadmap data is checked to see if cOAlition S’s Rights Retention Strategy provides a route to compliance :"
                } else if (r.compliant === "no") {
                    statement = "Self-archiving does not enable <b>Plan S</b> compliance when publishing in this journal.";
                    explanation = "TThe following checks were carried out to determine that this is not a compliant route:"
                } else {
                    statement = "We are <b>unable to determine</b> if you are able to comply with Plan S via Self-archiving, when publishing in this journal.";
                    explanation = "The following checks were carried out to determine compliance:"
                }
                break;
        }

        let route = `
        <h3>` + jct.COMPLIANCE_ROUTES_LONG[r.route] + `</h3>
        <p>`  + statement + `</p>
        <p>`  + explanation + `</p>`

        if (r.log) {
            r.log.forEach((log) => {
                route += "<ul><li>" + log.action + "</li>"
                route += "<ul><li>" + log.result + "</li>"
                if (log.url) {
                    route += "<li>" + log.url + "</li>"
                }
                route += "</ul></ul>"
            })
        }

        if (r.compliant === "yes") {
            compliant_routes_number++;
            compliant_routes += route;
        } else if (r.compliant === "no") {
            noncomplicant_routes_number++;
            noncompliant_routes += route;
        } else {
            unknown_routes_number++;
            unknown_routes += route;
        }
    });

    let blurb_for_count = "";
    [compliant_routes_number,
     noncomplicant_routes_number,
     unknown_routes_number].forEach((num, index) => {
        let human_num = (num === 0) ? 'no' : num;
        switch(index) {
            case 0:
                if (num === 1) {
                    blurb_for_count += '1 route that enables compliance, ';
                } else {
                    blurb_for_count += human_num + ' routes that enable compliance, ';
                }
                break;
            case 1:
                if (num === 1) {
                    blurb_for_count += '1 non-compliant route and ';
                } else {
                    blurb_for_count += human_num + ' non-compliant routes and ';
                }
                break;
            case 2:
                if (num === 1) {
                    blurb_for_count += '1 undetermined route.';
                } else {
                    blurb_for_count += human_num + ' undetermined routes.';
                }
                break;
        }
    })
    let issns = jct.chosen.journal.issn.join(", ");
    let publisher = jct.chosen.journal.publisher !== undefined ? jct.chosen.journal.publisher : "Not known";

    let journal = "Unknown Title"
    if (jct.chosen.journal.title) {
        journal = jct.chosen.journal.title;
    }
    journal += " (ISSN: " + issns + ")";

    let text =
        `
        <h3>Your query</h3>

        <p>You asked us to calculate whether you can comply with Plan S under the following conditions:

        <ul>
            <li>Journal: </li>
            <ul class="second">
                <li> ` + journal + `</li>
                <li> Publisher: ` + publisher + `</li>
            </ul>
            <li>Funder: ` + jct.chosen.funder.title + `</li>`

    if (jct.chosen.institution){
        inner_text = 'Institution: ' + jct.chosen.institution.title;
        if (jct.chosen.institution.country) {
            inner_text += ', ' + jct.chosen.institution.country;
        }
        if (jct.chosen.institution.id) {
            inner_text += ' (ROR: ' + jct.chosen.institution.id + ')';
        }
        text +=
            `
            <li>` + inner_text + `</li>`
    }
    else {
        text += `<li>Not part of Higher Education</li>`
    }

    text +=
        `</ul>

        We carried out this query at ` + new Date(q.request.started).toUTCString() +
        `, and found ` + blurb_for_count + `
        </p>
    `

    let elem = jct.htmlToElement("<div id='jct_detailed_result_text'>" + text +
        (compliant_routes_number > 0 ? compliant_routes : "") +
        (noncomplicant_routes_number > 0 ? noncompliant_routes : "") +
        (unknown_routes_number > 0 ? unknown_routes : "") + "</div>");
    detailed_results.append(elem);

    let print = jct.d.gebi('jct_print');
    if (print) {
        print.addEventListener("click", () => {
            let a = window.open('', '', 'height=500, width=500');
            let compliance = jct.d.gebc("jct_compliance")[0]
            let results_to_print = jct.d.gebi("jct_detailed_result_text")
            a.document.write(compliance.innerHTML);
            a.document.write(results_to_print.innerHTML);
            a.document.close();
            a.print();
        })
    }

    let fom = jct.d.gebi("jct_find_out_more");
    if (fom) {
        let url = "";
        if (window.JCT_UI_BASE_URL) {
            url = window.JCT_UI_BASE_URL;
        }
        url += "/";

        let jid, fid, iid, not_he = false;
        try {
            jid = jct.chosen.journal.id;
        } catch {}
        try {
            fid = jct.chosen.funder.id;
        } catch {}
        try {
            iid = jct.chosen.institution.id;
        } catch {}
        try {
            not_he = jct.d.gebi('jct_notHE').checked;
        } catch {}

        let args = [];
        if (jid) {
            args.push("issn=" + jid);
        }
        if (fid) {
            args.push("funder=" + fid);
        }
        if (iid) {
            args.push("ror=" + iid);
        }
        if (not_he) {
            args.push("not_he=" + not_he);
        }

        if (args.length > 0) {
            let query = args.join("&");
            url += "?" + query;
        }
        fom.setAttribute("href", url);
    }
}
