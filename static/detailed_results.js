jct.explain = (q) => {
    let detailed_results = jct.d.gebi("detailed_results_section")
    detailed_results.innerHTML = "";
    let compliant_routes = `<h2>Compliant Routes</h2>`
    let noncompliant_routes = `<h2>Non-Compliant Routes</h2>`
    let unknown_routes = `<h2>Unknown Routes</h2>`
    let compliant_routes_number = 0;
    let noncomplicant_routes_number = 0;
    let unknown_routes_number = 0;

    q.results.forEach((r) => {
        if (r.compliant === "yes") {
            statement = "You <b>are Plan S compliant</b> on this route";
            explanation = "The following checks were carried out to determine that this is a compliant route:"
        } else if (r.compliant === "no") {
            statement = "You <b>cannot comply with Plan S</b> on this route";
            explanation = "The following checks were carried out to determine that this is not a compliant route:"
        } else {
            statement = "We are <b>unable to determine if you are complaint</b> on this route";
            explanation = "The following checks were carried out to determine compliance:"
        }

        let route = `
        <h3>` + jct.COMPLIANCE_ROUTES_LONG[r.route] + `</h3>
        <p>`  + statement + ` (` + jct.COMPLIANCE_ROUTES_LONG[r.route] + `).</p>
        <p>`  + explanation + `</p>`

        r.log.forEach((log) => {
            route += "<ul><li>" + log.action + "</li>"
            route += "<ul><li>" + log.result + "</li>"
            if (log.url) {
                route += "<li>" + log.url + "</li>"
            }
            route += "</ul></ul>"
        })

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
    let blurb_routes = [ "compliant", "non-compliant", "undetermined" ];
    let blurb_line_construct = [ ", ", " and ", "." ];
    [compliant_routes_number, noncomplicant_routes_number, unknown_routes_number].forEach((num, index) => {
        switch(num) {
            case 0:
                blurb_for_count += `no ` + blurb_routes[index] + ` routes` + blurb_line_construct[index];
                break;
            case 1:
                blurb_for_count += `1 ` + blurb_routes[index] + ` route` + blurb_line_construct[index];
                break;
            default:
                blurb_for_count += num + ` ` + blurb_routes[index] + ` routes` + blurb_line_construct[index];
                break;
        }
    })

    let text =
        `
        <h3>Your query</h3>

        <p>You asked us to calculate whether you are Plan S compliant under the following conditions:

        <ul>
            <li>Journal: </li>
            <ul class="second">
                <li> ISSN: ` + q.request.journal[0].id + `</li>
                <li> Title: ` + q.request.journal[0].title + `</li>
                <li> Publisher: ` + (q.request.journal[0].publisher !== undefined ? q.request.journal[0].publisher : "Not known") + `</li>
            </ul>
            <li>Funder: ` + q.request.funder[0].title + `</li>`

    if ((q.request.institution.length > 0)){
        text +=
            `
            <li>Institution: </li>
                <ul>
                    <li> ROR: ` + q.request.institution[0].id + `</li>
                    <li> Title: ` + q.request.institution[0].title + `</li>
                </ul>`
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

    let elem = htmlToElement("<div id='detailed_result_text'>" + text +
        (compliant_routes_number > 0 ? compliant_routes : "") +
        (noncomplicant_routes_number > 0 ? noncompliant_routes : "") +
        (unknown_routes_number > 0 ? unknown_routes : "") + "</div>");
    detailed_results.append(elem);

    jct.d.gebi("print").addEventListener("click", () => {
        let a = window.open('', '', 'height=500, width=500');
        let compliance = jct.d.gebc("compliance")[0]
        let results_to_print = jct.d.gebi("detailed_result_text")
        a.document.write(compliance.innerHTML);
        a.document.write(results_to_print.innerHTML);
        a.document.close();
        a.print();
    })
}
