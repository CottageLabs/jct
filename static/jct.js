let jct = {
    api: 'https://api.jct.cottagelabs.com',
    delay: 500,
    cache: {},
    chosen: {},
    latest_response: null
};

let inputs_plugin =`
    <div class="col col--1of3">
        <label for="journal">Journal *</label>
        <input type="text" id="journal" name="journal" which="journal">
    </div>
    <div class="col col--1of3">
        <label for="funder">My Funder *</label>
    <input type="text" id="funder" which="funder">
    </div>
    <div class="col col--1of3">
        <label for="institution">My Institution *</label>
        <input type="text" id="institution" which="institution">
        <div class="row notHE">
            <div class="col col--1of6">
                <input type="checkbox" id="notHE" name="notHE" class="notHE_input">
            </div>
            <div class="col col--5of6 notHE_label">
                <label for="notHE">Not part of Higher Education</label>
            </div>
        </div>
    </div>
    <div class="col col--1of3 suggest" id="suggestjournal">
    </div>
    <div class="col col--1of3 suggest" id="suggestfunder">
    </div>
    <div class="col col--1of3 suggest" id="suggestinstitution">
    </div>
`
let results_plugin =
    `
        <div class="row">
            <div id="compliant" class="col col--2of3 compliance" style="display:none">
                <h1>Yes, this combination is compliant.</h1>
            </div>
            <div id="notcompliant" class="col col--2of3 compliance" style="display:none;">
                <h1>No, this is not compliant.</h1>
            </div>  
            <a type="button" id="explain_results" class="col col--1of3" style="display: none;">Explain my result</a>
        </div>
<!--        <div class="row" id="buttons">-->
<!--            <div class="col col&#45;&#45;1of4">-->
<!--                <button id="refresh" class="button__refresh" style="display: none;">START AGAIN</button>-->
<!--            </div>  -->
<!--        </div>-->
        <div class="row" id="result">
        </div>
        <div class="row paths_results" id="paths_results"></div>
            <div class="col-sm-12" id="missing" style="display:none;"><p>Sorry, we can't find any <span id="whatsmissing"></span> called <b id="titlemissing"></b>. We'll add it as soon as we can.</p></div>
        </div>
        <div id="loading" class="loading" style="display:none;">
            <div style="margin-top:40px;margin-left:auto;margin-right:auto;width:200px;">
                <img style="height:200px;width:200px;" src="//static.cottagelabs.com/spin_grey.svg">
        </div>
`;

let _emptyElement = (elem) => {
    while (elem.firstChild) elem.removeChild(elem.firstChild);
}

jct.d = document;
jct.d.gebi = document.getElementById;
jct.d.gebc = document.getElementsByClassName   
jct.MAX_SUGGS_LENGTHS = 10;

jct.d.each = (cls, key, val) => {
    if (cls.indexOf('.') === 0) cls = cls.replace('.','');
    let els = jct.d.gebc(cls);
    for ( let i = 0; i < els.length; i++ ) {
        if (typeof key === 'function') {
            key(els[i]);
        } else {
            els[i][key] = val; // TODO make this handle multiple depths of keys
        }
    }
};

let _calculate_if_all_data_provided = () => {
    if (jct.chosen.journal && jct.chosen.funder && (jct.chosen.institution || jct.d.gebi("notHE").checked)) {
        jct.suggesting = false;
        let qr = {journal: jct.chosen.journal.id};
        qr.funder = jct.chosen.funder.id;
        if (jct.chosen.institution) {
            qr.institution = jct.chosen.institution.id;
        }
        //for dev purposes
        //qr.retention = true;
        qr.checks = "permission,doaj,ta,tj"
        jct.jx('/calculate', qr);
        jct.d.gebi('loading').style.display = 'block';
    }
}

jct.choose = (e, el) => {
    let et;
    if (e) {
        e.preventDefault();
        et = e.target
    } else if(el) {
        et = el;
    } else {
        let vis = [];
        jct.d.each('choose', function(el) {
            if (el.style.display !== 'none') vis.push(el)
        });
        if (vis.length === 1) {
            et = vis[0];
        } else {
            return;
        }
    }
    let which = et.getAttribute('which');
    let id = et.getAttribute('id');
    let title = et.getAttribute('title');
    jct.chosen[which] = {id: id, title: title};
    jct.d.gebi(which).value = title;
    jct.d.each('section',(el) => {
        el.style.display = 'none';
    });
    jct.d.each('suggest','innerHTML','');
    if (which === 'journal') {
        jct.d.gebi('funder').focus();
    } else if (which === 'funder') {
        jct.d.gebi('institution').focus();
    } else {
        jct.d.gebi('institution').blur();
    }
    _calculate_if_all_data_provided();
}

jct.COMPLIANCE_ROUTES_SHORT = {
    fully_oa: "fully_oa",
    ta: "ta",
    tj: "tj",
    sa: "self_archiving"
}

jct.COMPLIANCE_ROUTES_LONG = {
    fully_oa: "Fully Open Access",
    ta: "Transformative agreement",
    tj: "Transformative journal",
    self_archiving: "Self-archiving policy"
}

jct.error = (xhr) => {
    jct.latest_response = xhr;
    console.log("error")
    console.log(xhr.status + ': ' + xhr.statusText);
}
jct.progress = (e) => {
    // e && e.lengthComputable ? console.log(e.loaded + ' of ' + e.total + 'bytes') : console.log(e.loaded);
}
jct.success = (xhr) => {
    jct.d.gebi('loading').style.display = 'none';
    let js = JSON.parse(xhr.response);
    if (xhr.response.startsWith('[')) js = js[0];
    if (jct.suggesting) {
        jct.suggestions(js);
    } else {
        jct.latest_response = js.results;
        let paths_results = jct.d.gebi("paths_results");
        _emptyElement(paths_results)
        let detailed_results = jct.d.gebi("detailed_results");
        _emptyElement(detailed_results)

        jct.d.gebi(js.compliant ? 'compliant' : 'notcompliant').style.display = 'block';
        // jct.d.gebi("refresh").style.display = 'block';
        jct.d.gebi('explain_results').style.display = 'flex';
        //negatives only for dev
        if (js.compliant) {
            js.results.forEach((r) => {
                if (r.compliant === "yes") {
                    jct.add_tile(r.route, jct.chosen)

                }
            })
        }
        jct.explain(js)

// TODO may want to add further info to the compliant/notcompliant or result box about the compliance details
    }
}

jct.add_tile = (tile_type, data) => {
    let tile;
    switch(tile_type) {
        case jct.COMPLIANCE_ROUTES_SHORT.fully_oa:
            tile = jct.fullyOA_tile(data.journal.title);
            break;
        case jct.COMPLIANCE_ROUTES_SHORT.ta:
            tile = jct.transformative_agreement_tile(data.journal.title, data.institution.title);
            break;
        case jct.COMPLIANCE_ROUTES_SHORT.tj:
            tile = jct.transformative_journal_tile(data.journal.title);
            break;
        case jct.COMPLIANCE_ROUTES_SHORT.sa:
            tile = jct.self_archiving_tile(data.journal.title);
            break;
    }
    jct.d.gebi("paths_results").append(tile);
    if (tile_type === jct.COMPLIANCE_ROUTES_SHORT.tj){
        jct.d.gebi('tj_modal_button').addEventListener("click", () => {
            let modal = jct.d.gebi('modal_tj')
            modal.style.display = 'block';
        })
    }
    else if (tile_type === jct.COMPLIANCE_ROUTES_SHORT.sa){
        jct.d.gebi('sa_modal_button').addEventListener("click", () => {
            let modal = jct.d.gebi('modal_sa')
            modal.style.display = 'block';
        })
    }
}

jct.fullyOA_tile = (journal_title) => {
    return htmlToElement (`
        <div class="col col--1of4" id="fullyOA_tile ` + journal_title  + `">
            <div class="tile">
                <p class="tile"><b>` + journal_title + `</b> is fully open access.</p>
            </div>
        </div>
`)
}

jct.transformative_agreement_tile = (journal_title, publisher_title) => {
    return htmlToElement(`
        <div class="col col--1of4" id="ta_tile` + journal_title + `-` + publisher_title + `">
            <div class="tile">
                <p>It is part of transformative agreement between <b>` + publisher_title + `</b> and <b> ` + journal_title + `</b>.
                </p>
            </div>
        </div>
`)
}

jct.transformative_journal_tile = (journal_title) => {
    return htmlToElement (`
        <div class="col col--1of4" id="tj_tile` +journal_title + `">
            <div class="tile">
                <p class="tile"><b>` + journal_title + `</b> is a transformative journal.</p>
                <img src="../static/img/icons/question-inverted.svg" alt="circle help icon" class="helpicon_img tile_help" id="tj_modal_button">
            </div>
        </div>
`)
}

jct.self_archiving_tile = (journal_title) => {
    return htmlToElement (`
        <div class="col col--1of4" id="sa_tile` + journal_title + `">
            <div class="tile">
                <p>It has a self-archiving policy</p>
                <img src="../static/img/icons/question-inverted.svg" alt="circle help icon" class="helpicon_img tile_help" id="sa_modal_button">
            </div>
        </div>
`)
}

jct.jx = (route,q,after,api) => {
    let url = api ? api : jct.api;
    if (!url.endsWith('/')) url += '/';
    if (route) url += route.startsWith('/') ? route.replace('/','') : route;
    if (typeof q === 'string') {
        url += (url.indexOf('?') === -1 ? '?' : '&') + (q.indexOf('=') === -1 ? 'q=' : '') + q;
    } else if (typeof q === 'object' ) {
        if (url.indexOf('?') === -1) url += '?';
        for ( let p in q ) url += p + '=' + q[p] + '&'
    }
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.send();
    xhr.onload = () => { xhr.status !== 200 ? jct.error(xhr) : (typeof after === 'function' ? after(xhr) : jct.success(xhr)); };
    xhr.onprogress = (e) => { jct.progress(e); };
    xhr.onerror = () => { jct.error(); };
}

jct.suggestions = (suggs, cached) => {
    jct.d.gebi('missing').style.display = 'none';
    _emptyElement(jct.d.gebi('result'));
    jct.d.gebi('compliant').style.display = 'none';
    jct.d.gebi('notcompliant').style.display = 'none';
    let sgst = '';
    let sd = jct.d.gebi('suggest'+jct.suggesting);
    let typed = jct.d.gebi(jct.suggesting).value.toLowerCase();
    let update = false;
    let l = (suggs.data && suggs.data.length > jct.MAX_SUGGS_LENGTHS) ? jct.MAX_SUGGS_LENGTHS : suggs.data.length;
    for ( let s = 0; s < l; s++ ) {
        let t = suggs.data[s].title;
        let tl = t.toLowerCase();
        sgst += '<p class="select_option"><a class="button choose'+ '" which="' + jct.suggesting + '" title="' + t + '" id="' + suggs.data[s].id + '" href="#">' + t + '</a></p>';
    }
    if (sgst.length) {
        sd.innerHTML = sgst;
        jct.d.each("choose", function(el) { el.addEventListener('click', jct.choose); });
    }
    if (!jct.d.gebc('choose')) {
        jct.d.gebi('whatsmissing').innerHTML = jct.suggesting;
        jct.d.gebi('titlemissing').innerHTML = jct.d.gebi(jct.suggesting).value;
        jct.d.gebi('missing').style.display = 'block';
    }
}

jct.waiting = false;
jct.suggest = (focused) => {
    let typed = jct.d.gebi(focused).value.toLowerCase().replace(' of','').replace('the ','');
    if (typed.length === 0) {
        jct.d.each('suggest','innerHTML','');
    } else {
        if (typed.length > 1) {
            jct.suggesting = focused;
            jct.jx('/suggest/'+focused+'/'+typed);

        }
    }
}

jct.setTimer = () => {
    if (!jct.intervalID){
        jct.intervalID = window.setInterval(sent_suggestion_request, jct.delay);
    }
}

function sent_suggestion_request() {
    let funderInput = jct.d.gebi("funder");
    let journalInput = jct.d.gebi("journal");
    let institutionInput = jct.d.gebi("institution");

    let change = false;
    let focused;
    if (funderInput === document.activeElement){
        change = funderInput.value !== jct.inputValues.Funder;
        jct.inputValues.Funder = funderInput.value;
        focused = "funder";
    }
    else if (journalInput === document.activeElement){
        change = journalInput.value !== jct.inputValues.Journal;
        jct.inputValues.Journal = journalInput.value;
        focused = "journal";
    }
    else if (institutionInput === document.activeElement){
        change = institutionInput.value !== jct.inputValues.Institution;
        jct.inputValues.Institution = institutionInput.value;
        focused = "institution";
    }
    else {
        clearInterval(jct.intervalID);
        jct.intervalID = null;
        return;
    }

    if (change){
        jct._sug(focused);
    }
}

jct.setup = () => {
    document.getElementById("inputs_plugin").innerHTML = inputs_plugin;
    document.getElementById("results_plugin").innerHTML = results_plugin;
    let f = jct.d.gebi("funder");
    jct.suggesting = true;
    jct.inputValues = {
        Journal: "",
        Funder: "",
        Institution: "",
        notHE: ""
    }

    jct.d.gebi("funder").addEventListener("focus", jct.setTimer);
    jct.d.gebi("journal").addEventListener("focus", jct.setTimer);
    jct.d.gebi("institution").addEventListener("focus", jct.setTimer);
    jct.d.gebi("notHE").addEventListener("click", _calculate_if_all_data_provided)

    //how to change it to jct.d.gebc?
    document.querySelectorAll(".select_option").forEach(item => {
        item.addEventListener("click", jct.choose);
    })

    jct.d.gebi("explain_results").addEventListener("click", () => {
        jct.d.gebi("detailed_results").style.display = "block";
    })

    // jct.d.gebi("refresh").addEventListener("click", () => {location.reload()})

    // jct.preload();
}

jct._sug = (focused) => {
    jct.d.gebi('suggest'+focused).innerHTML="";
    jct.d.gebi('detailed_results').innerHTML = "";
    jct.d.gebi('detailed_results').style.display = "none";
    jct.d.gebi('explain_results').style.display = "none";
    jct.d.gebi('paths_results').innerHTML = "";
    //negatives only for dev
    jct.suggesting = focused;
    jct.suggest(focused);
}

/**
 * @param {String} HTML representing a single element
 * @return {Element}
 */
let htmlToElement = (html) => {
    let template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}
