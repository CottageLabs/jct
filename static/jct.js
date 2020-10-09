let jct = {
    api: 'https://api.jct.cottagelabs.com',
    delay: 500,
    cache: {},
    chosen: {},
    latest_response: null
};

let inputs_plugin =`
    <h2 class="sr-only">Make a query</h2>
        <div class="col col--1of3 expression">
        <div class="expression__input">
            <label for="journal">Journal</label>
            <input type="text" id="journal" name="journal" which="journal" placeholder="By ISSN or title" required>            
        </div>
        <div class="expression__operator">
            <svg width="36" height="36" viewbox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.3 3L18.3 33M3 17.7H33" stroke="white" stroke-width="5" stroke-linecap="round"></path>
            </svg>
        </div>
    </div>

    <div class="col col--1of3 expression">
        <div class="expression__input">
            <label for="funder">My funder</label>
            <input type="text" id="funder" name="funder" which="funder" placeholder="By Crossref Funders’ ID or name" required>
        </div>
        <div class="expression__operator">
            <svg width="36" height="36" viewbox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.3 3L18.3 33M3 17.7H33" stroke="white" stroke-width="5" stroke-linecap="round"></path>
            </svg>
        </div>
    </div>

    <div class="col col--1of3 expression">
        <div class="expression__input">
            <label for="institution">My institution</label>
            <input type="text" id="institution" name="institution" which="institution" placeholder="By ROR or name" required>
            <br>
            <div class="expression__checkbox">
              <input type="checkbox" id="notHE" name="notHE">
              <label for="notHE">No affiliation</label>
            </div>
        </div>
        <div class="expression__operator">
        <div>
            <svg width="70" height="70" viewbox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="35" cy="35" r="32.5" stroke="#FABE5E" stroke-width="2.5">
                    <animate attributename="r" from="10" to="35" dur="1.5s" begin="0s" repeatcount="indefinite"></animate>
                    <animate attributename="opacity" from="1" to="0" dur="1.5s" begin="0s" repeatcount="indefinite"></animate>
                </circle>
                <circle cx="35" cy="35" r="22.5" fill="#FABE5E">
                    <animate attributename="r" from="1" to="30" dur="1.5s" begin="0s" repeatcount="indefinite"></animate>
                    <animate attributename="opacity" from="1" to="0" dur="1.5s" begin="0s" repeatcount="indefinite"></animate>
                </circle>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M22.5 22C21.1193 22 20 23.1193 20 24.5C20 25.8807 21.1193 27 22.5 27H47.5C48.8807 27 50 25.8807 50 24.5C50 23.1193 48.8807 22 47.5 22H22.5ZM22.5 42C21.1193 42 20 43.1193 20 44.5C20 45.8807 21.1193 47 22.5 47H47.5C48.8807 47 50 45.8807 50 44.5C50 43.1193 48.8807 42 47.5 42H22.5Z" fill="white"></path>
            </svg>
        </div>
            </a>
          </div>
        </div>
      </form>
        
    </div>
    <div class="col col--1of3 suggest" id="suggestjournal">
    </div>
    <div class="col col--1of3 suggest" id="suggestfunder">
    </div>
    <div class="col col--1of3 suggest" id="suggestinstitution">
    </div>
    <ul class="loading" id="loading"><li class='loading__dots' style="display: none"><div></div><div></div><div></div><span class='sr-only'>Loading choices…</span></li></ul>
    
`
let results_plugin =
    `
        <header>
            <h2 data-aos="fade-up" data-aos-duration="2000" id="compliant">
                <strong>Yes</strong>, this combination is <br><a href="#">compliant</a>.
            </h2>
            <h2 data-aos="fade-up" data-aos-duration="2000" id="notcompliant">
                <strong>No</strong>, this combination is <br><a href="#">not compliant</a>.
            </h2>
        </header>
    `

let tiles_plugin =
    `
        <section class="row" id="paths_results">
        <h3 class="sr-only">Results</h3>
        </section>
`;

//             <a type="button" id="explain_results" class="col col--1of3" style="display: none;">Explain my result</a>
//         </div>
// <!--        <div class="row" id="buttons">-->
// <!--            <div class="col col&#45;&#45;1of4">-->
// <!--                <button id="refresh" class="button__refresh" style="display: none;">START AGAIN</button>-->
// <!--            </div>  -->
// <!--        </div>-->

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
    jct._setComplianceTheme();
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
        jct.d.gebi("loading").style.display = "block";
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
    jct.d.gebi("loading").style.display = "none";
    let js = JSON.parse(xhr.response);
    if (xhr.response.startsWith('[')) js = js[0];
    if (jct.suggesting) {
        jct.suggestions(js);
    } else {
        jct.latest_response = js.results;
        let paths_results = jct.d.gebi("paths_results");
        _emptyElement(paths_results)
        let detailed_results = jct.d.gebi("detailed_results");
        // _emptyElement(detailed_results)

        jct.d.gebi(js.compliant ? 'compliant' : 'notcompliant').style.display = 'block';
        // jct.d.gebi("refresh").style.display = 'block';
        jct.d.gebi('explain_results').style.display = 'initial';
        //negatives only for dev
        jct.d.gebi("results").style.display = 'block';
        if (js.compliant) {
            jct._setComplianceTheme(true);
            js.results.forEach((r) => {
                if (r.compliant === "yes") {
                    jct.add_tile(r.route, jct.chosen)

                }
            })
        }
        else {
            jct._setComplianceTheme(false);
        }
        jct.explain(js)

// TODO may want to add further info to the compliant/notcompliant or result box about the compliance details
    }
}

jct._setComplianceTheme = (compliant) => {
    let query_div = document.getElementsByClassName('query')[0];
    let results_div = document.getElementsByClassName('results')[0];
    if (compliant === undefined) {
        if (query_div.classList.contains("query--non-compliant")) {
            query_div.classList.remove("query--non-compliant");
        }
        if (results_div.classList.contains("results--non-compliant")) {
            results_div.classList.remove("results--non-compliant");
        }
        if (query_div.classList.contains("query--compliant")) {
            query_div.classList.remove("query--compliant");
        }
        if (results_div.classList.contains("results--compliant")) {
            results_div.classList.remove("results--compliant");
        }
    }
    else if (compliant){
        if (query_div.classList.contains("query--non-compliant")) {
            query_div.classList.remove("query--non-compliant");
        }
        if (results_div.classList.contains("results--non-compliant")) {
            results_div.classList.remove("results--non-compliant");
        }
        query_div.classList.add('query--compliant');
        results_div.classList.add('results--compliant');
    }
    else {
        if (query_div.classList.contains("query--compliant")) {
            query_div.classList.remove("query--compliant");
        }
        if (results_div.classList.contains("results--compliant")) {
            results_div.classList.remove("results--compliant");
        }
        query_div.classList.add('query--non-compliant');
        results_div.classList.add('results--non-compliant');
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
<div class="col col--1of4">
    <article class="card" data-aos="fade-up" data-aos-duration="2000">
        <span class="card__icon"><svg width="16" height="22" viewbox="0 0 16 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M2.75 4.8125V8.9375H1.71531C0.769312 8.9375 0 9.70681 0 10.6528V20.2806C0 21.2286 0.771375 22 1.71875 22H13.4056C14.3536 22 15.125 21.2286 15.125 20.2806V10.6528C15.125 9.70681 14.3557 8.9375 13.4097 8.9375H4.125V4.8125C4.125 2.91706 5.66706 1.375 7.5625 1.375C9.45794 1.375 11 2.91706 11 4.8125V6.1875C11 6.567 11.3073 6.875 11.6875 6.875C12.0677 6.875 12.375 6.567 12.375 6.1875V4.8125C12.375 2.15875 10.2156 0 7.5625 0C4.90875 0 2.75 2.15875 2.75 4.8125ZM1.71531 10.3125C1.52762 10.3125 1.375 10.4651 1.375 10.6528V20.2806C1.375 20.4703 1.52969 20.625 1.71875 20.625H13.4056C13.5953 20.625 13.75 20.4703 13.75 20.2806V10.6528C13.75 10.4651 13.5974 10.3125 13.4097 10.3125H1.71531ZM6.875 17.1875C6.875 17.5677 7.183 17.875 7.5625 17.875C7.942 17.875 8.25 17.5677 8.25 17.1875V13.75C8.25 13.3698 7.942 13.0625 7.5625 13.0625C7.183 13.0625 6.875 13.3698 6.875 13.75V17.1875Z" fill="black"></path>
            </svg>
        </span>
        <h4 class="label card__heading">Full <br>Open Access</h4>
        <p>Go ahead and publish. No additional actions to take.</p>
        <p><em>` + journal_title + `</em> is fully open access.</p>
    </article>
</div>
`)
}

jct.transformative_agreement_tile = (journal_title, publisher_title) => {
    return htmlToElement(`
        <div class="col col--1of4">
            <article class="card" data-aos="fade-up" data-aos-duration="2000">
                <span class="card__icon"><svg width="22" height="22" viewbox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0 4.8125C0 5.192 0.308 5.5 0.6875 5.5H4.125V17.1875V19.25C4.125 20.7666 5.35838 22 6.875 22H19.25C20.7666 22 22 20.7666 22 19.25V17.1875C22 16.8073 21.6927 16.5 21.3125 16.5H19.25V2.75C19.25 1.23337 18.0166 0 16.5 0H2.75C1.23337 0 0 1.23337 0 2.75V4.8125ZM17.875 2.75C17.875 1.99169 17.2583 1.375 16.5 1.375H5.13107C5.36564 1.7797 5.5 2.24942 5.5 2.75V4.8125V17.1875V19.25C5.5 20.0083 6.11669 20.625 6.875 20.625C7.63331 20.625 8.25 20.0083 8.25 19.25V17.1875C8.25 16.8073 8.558 16.5 8.9375 16.5H17.875V2.75ZM9.625 17.875H18.5625H20.625V19.25C20.625 20.0083 20.0083 20.625 19.25 20.625H9.25607C9.49064 20.2203 9.625 19.7506 9.625 19.25V17.875ZM1.375 2.75C1.375 1.99169 1.99169 1.375 2.75 1.375C3.50831 1.375 4.125 1.99169 4.125 2.75V4.125H1.375V2.75ZM15.8125 5.5H7.5625C7.183 5.5 6.875 5.192 6.875 4.8125C6.875 4.433 7.183 4.125 7.5625 4.125H15.8125C16.1927 4.125 16.5 4.433 16.5 4.8125C16.5 5.192 16.1927 5.5 15.8125 5.5ZM7.5625 8.25H15.8125C16.1927 8.25 16.5 7.942 16.5 7.5625C16.5 7.183 16.1927 6.875 15.8125 6.875H7.5625C7.183 6.875 6.875 7.183 6.875 7.5625C6.875 7.942 7.183 8.25 7.5625 8.25ZM15.8125 11H7.5625C7.183 11 6.875 10.692 6.875 10.3125C6.875 9.933 7.183 9.625 7.5625 9.625H15.8125C16.1927 9.625 16.5 9.933 16.5 10.3125C16.5 10.692 16.1927 11 15.8125 11ZM7.5625 13.75H11.6875C12.0677 13.75 12.375 13.4427 12.375 13.0625C12.375 12.6823 12.0677 12.375 11.6875 12.375H7.5625C7.183 12.375 6.875 12.6823 6.875 13.0625C6.875 13.4427 7.183 13.75 7.5625 13.75Z" fill="black"></path>
                    </svg>
                </span>
                <h4 class="label">Transformative <br>Agreement</h4>
                <p>You have to do X and consult Y to comply and <a href="#">make sure to read this information</a>.</p>
                <p><em>Annals of Nuclear Cardiology</em> is part of a transformative agreement between Publisher X and University of Cambridge.</p>
            </article>
        </div>
`)
}

jct.transformative_journal_tile = (journal_title) => {
    return htmlToElement (`
        <div class="col col--1of4">
        <article class="card" data-aos="fade-up" data-aos-duration="2000">
          <span class="card__icon"><svg width="22" height="22" viewbox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M10.3125 21.3125C10.3125 21.6927 10.6205 22 11 22C11.3795 22 11.6875 21.6927 11.6875 21.3125V0.6875C11.6875 0.308 11.3795 0 11 0C10.6205 0 10.3125 0.308 10.3125 0.6875V21.3125ZM8.25 19.25H1.71737C0.770687 19.25 0 18.4793 0 17.5326V4.455C0 3.51519 0.765188 2.75 1.705 2.75H8.18744C8.56694 2.75 8.87494 3.058 8.87494 3.4375C8.87494 3.817 8.56694 4.125 8.18744 4.125H1.705C1.52281 4.125 1.375 4.27281 1.375 4.455V17.5319C1.375 17.7176 1.53175 17.875 1.71737 17.875H8.25C8.6295 17.875 8.9375 18.1823 8.9375 18.5625C8.9375 18.9427 8.6295 19.25 8.25 19.25ZM19.3118 18.5625C19.3118 18.1844 19.6211 17.875 19.9993 17.875C20.3774 17.875 20.6868 18.1844 20.6868 18.5625C20.6868 18.9406 20.3774 19.25 19.9993 19.25C19.6211 19.25 19.3118 18.9406 19.3118 18.5625ZM17.2493 18.5625C17.2493 18.1844 17.5586 17.875 17.9368 17.875C18.3149 17.875 18.6243 18.1844 18.6243 18.5625C18.6243 18.9406 18.3149 19.25 17.9368 19.25C17.5586 19.25 17.2493 18.9406 17.2493 18.5625ZM15.1868 18.5625C15.1868 18.1844 15.4961 17.875 15.8743 17.875C16.2524 17.875 16.5618 18.1844 16.5618 18.5625C16.5618 18.9406 16.2524 19.25 15.8743 19.25C15.4961 19.25 15.1868 18.9406 15.1868 18.5625ZM13.1243 18.5625C13.1243 18.1844 13.4336 17.875 13.8118 17.875C14.1899 17.875 14.4993 18.1844 14.4993 18.5625C14.4993 18.9406 14.1899 19.25 13.8118 19.25C13.4336 19.25 13.1243 18.9406 13.1243 18.5625ZM20.6249 17.3731C20.6249 16.995 20.9343 16.6856 21.3124 16.6856C21.6905 16.6856 21.9999 16.995 21.9999 17.3731C21.9999 17.7588 21.6905 18.0606 21.3124 18.0606C20.9343 18.0606 20.6249 17.7581 20.6249 17.3731ZM20.6249 15.3106C20.6249 14.9325 20.9343 14.6231 21.3124 14.6231C21.6905 14.6231 21.9999 14.9325 21.9999 15.3106C21.9999 15.6963 21.6905 15.9981 21.3124 15.9981C20.9343 15.9981 20.6249 15.6956 20.6249 15.3106ZM20.6249 13.2481C20.6249 12.87 20.9343 12.5606 21.3124 12.5606C21.6905 12.5606 21.9999 12.87 21.9999 13.2481C21.9999 13.6338 21.6905 13.9356 21.3124 13.9356C20.9343 13.9356 20.6249 13.6331 20.6249 13.2481ZM20.6249 11.1925C20.6249 10.8075 20.9343 10.4981 21.3124 10.4981C21.6905 10.4981 21.9999 10.8075 21.9999 11.1925C21.9999 11.5706 21.6905 11.8731 21.3124 11.8731C20.9343 11.8731 20.6249 11.5706 20.6249 11.1925ZM20.6249 9.12313C20.6249 8.745 20.9343 8.4425 21.3124 8.4425C21.6905 8.4425 21.9999 8.745 21.9999 9.12313C21.9999 9.50813 21.6905 9.8175 21.3124 9.8175C20.9343 9.8175 20.6249 9.50813 20.6249 9.12313ZM20.6249 7.0675C20.6249 6.6825 20.9343 6.37313 21.3124 6.37313C21.6905 6.37313 21.9999 6.6825 21.9999 7.0675C21.9999 7.44562 21.6905 7.74813 21.3124 7.74813C20.9343 7.74813 20.6249 7.44562 20.6249 7.0675ZM20.6249 4.99813C20.6249 4.62 20.9343 4.3175 21.3124 4.3175C21.6905 4.3175 21.9999 4.62 21.9999 4.99813C21.9999 5.38312 21.6905 5.6925 21.3124 5.6925C20.9343 5.6925 20.6249 5.38312 20.6249 4.99813ZM20.3155 4.125H20.3086C19.9305 4.09062 19.6555 3.76063 19.683 3.3825C19.7174 3.00437 20.0474 2.7225 20.4324 2.75688H20.4255C20.8036 2.79125 21.0855 3.12125 21.058 3.49938C21.0236 3.85688 20.728 4.13188 20.3705 4.13188C20.359 4.13188 20.3473 4.12974 20.337 4.12785C20.3287 4.12635 20.3213 4.125 20.3155 4.125ZM17.6205 3.4375C17.6205 3.05938 17.9299 2.75 18.308 2.75C18.6861 2.75 18.9955 3.05938 18.9955 3.4375C18.9955 3.81562 18.6861 4.125 18.308 4.125C17.9299 4.125 17.6205 3.81562 17.6205 3.4375ZM15.558 3.4375C15.558 3.05938 15.8674 2.75 16.2455 2.75C16.6236 2.75 16.933 3.05938 16.933 3.4375C16.933 3.81562 16.6236 4.125 16.2455 4.125C15.8674 4.125 15.558 3.81562 15.558 3.4375ZM13.4955 3.4375C13.4955 3.05938 13.8049 2.75 14.183 2.75C14.5611 2.75 14.8705 3.05938 14.8705 3.4375C14.8705 3.81562 14.5611 4.125 14.183 4.125C13.8049 4.125 13.4955 3.81562 13.4955 3.4375Z" fill="black"></path>
</svg>
</span>
          <h4 class="label">Transformative <br>Journal</h4>
          <p>You have to do X and consult Y to comply and <a href="#">make sure to read this information</a>.</p>
        </article>
        <img src="../static/img/icons/question.svg" alt="circle help icon" class="helpicon_img tile_help" id="tj_modal_button">
      </div>
`)
}

jct.self_archiving_tile = (journal_title) => {
    return htmlToElement (`
        <div class="col col--1of4">
        <article class="card" data-aos="fade-up" data-aos-duration="2000">
          <span class="card__icon"><svg width="22" height="22" viewbox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M22 5.15831C22 5.98803 21.4085 6.68203 20.625 6.84086V20.2778C20.625 21.2273 19.8523 22 18.9028 22H3.09719C2.14775 22 1.375 21.2273 1.375 20.2778V6.84086C0.591483 6.68203 0 5.98803 0 5.15831V1.71669C0 0.77 0.77 0 1.71669 0H20.2833C21.23 0 22 0.77 22 1.71669V5.15831ZM20.2833 5.5H19.9375H2.0625H1.71669C1.52831 5.5 1.375 5.34669 1.375 5.15831V1.71669C1.375 1.52831 1.52831 1.375 1.71669 1.375H20.2833C20.4717 1.375 20.625 1.52831 20.625 1.71669V5.15831C20.625 5.34669 20.4717 5.5 20.2833 5.5ZM2.75 20.2778V6.875H19.25V20.2778C19.25 20.4689 19.0939 20.625 18.9028 20.625H3.09719C2.90606 20.625 2.75 20.4689 2.75 20.2778ZM7.5625 11H14.4375C14.8177 11 15.125 10.692 15.125 10.3125C15.125 9.933 14.8177 9.625 14.4375 9.625H7.5625C7.183 9.625 6.875 9.933 6.875 10.3125C6.875 10.692 7.183 11 7.5625 11Z" fill="black"></path>
</svg>
</span>
          <h4 class="label">Self-archiving <br>Journal</h4>
          <p>Go ahead and publish. No additional actions to take.</p>
          <p><em>Annals of Nuclear Cardiology</em> is a transformative journal approved by cOAlition S.</p>
          <img src="../static/img/icons/question.svg" alt="circle help icon" class="helpicon_img tile_help" id="sa_modal_button">
        </article>
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
    jct._setComplianceTheme();
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
    // AOS.init();
    jct.d.gebi("inputs_plugin").innerHTML = inputs_plugin;
    jct.d.gebi("results_plugin").innerHTML = results_plugin;
    jct.d.gebi("tiles_plugin").innerHTML = tiles_plugin;
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
    });
}

jct._sug = (focused) => {
    jct.d.gebi('suggest'+focused).innerHTML="";
    jct.d.gebi('detailed_results').innerHTML = "";
    jct.d.gebi('explain_results').style.display = "none";
    jct.d.gebi('detailed_results').style.display = "none";
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
