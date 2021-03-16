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
        let name = jct.api_codes[r.route]['name'];
        let statement = jct.api_codes[r.route]['statement'][r.compliant];
        let explanation = jct.api_codes[r.route]['explanation'][r.compliant];
        let qualification = jct.get_qualifications(r.qualifications);

        let route = `
        <h3>` + name + `</h3>
        <p>`  + statement + `</p>
        <p style="color: #F47115">`  + qualification + `</p>
        <p>`  + explanation + `</p>`;

        if (r.log) {
            r.log.forEach((log) => {
                let action = log.code;
                if (r.route in jct.api_codes && log.code in jct.api_codes[r.route]) {
                    action = jct.api_codes[r.route][log.code];
                }
                let parameters = ''
                if (log.parameters) {
                    for (let [parameter,values] of Object.entries(log.parameters)) {
                        let p = parameter;
                        if (r.route in jct.api_codes && parameter in jct.api_codes[r.route]) {
                            p = jct.api_codes[r.route][parameter];
                        }
                        parameters += p + "<br/>";
                        if (values && values.length > 0) {
                            parameters += "<ul>";
                            values.forEach((value) => {
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

    fom = `<p><a href="#" id="jct_find_out_more" target="_blank">Link to this result</a></p>`

    let elem = jct.htmlToElement("<div id='jct_detailed_result_text'>" + text +
        (compliant_routes_number > 0 ? compliant_routes : "") +
        (noncomplicant_routes_number > 0 ? noncompliant_routes : "") +
        (unknown_routes_number > 0 ? unknown_routes : "") + fom + "</div>");
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
}

jct.get_qualifications = (qualifications) => {
    let qualification = '';
    if ((typeof qualifications !== "undefined") && qualifications.length > 0) {
        for (let [key,values] of Object.entries(qualifications[0])) {
            if (key in jct.api_codes.qualification_ids && 'description' in jct.api_codes.qualification_ids[key]) {
                qualification = jct.api_codes.qualification_ids[key]['description'] + "<br/>";
            }
            if (values) {
                for (let [k2,v2] of Object.entries(values)) {
                    let label = k2;
                    if (key in jct.api_codes.qualification_ids && k2 in jct.api_codes.qualification_ids[key]) {
                        label = jct.api_codes.qualification_ids[key][k2]
                    }
                    qualification += label + ' ' + v2 + "<br/>";
                }
            }
        }
    }
    return qualification
}
