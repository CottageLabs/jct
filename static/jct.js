let jct = {
    api: 'https://api.jct.cottagelabs.com',
    delay: 700,
    cache: {},
    chosen: {},
    latest_response: null
};

let plugin_template =`
<div class="button-group shadowed">
    <input class="unbound col-sm ac" type="text" id="journal" placeholder="journal (name or ISSN)">
    <input class="unbound col-sm ac" type="text" id="funder" placeholder="your funder">
    <input class="unbound col-sm ac" type="text" id="institution" placeholder="your institution"> 
</div>
<div class="row">
<!--    <div id="help_journal" class="col-sm help">-->
<!--    <p>-->
<!--      Start typing a journal title, ISSN, or field of research, we'll find it and check its OA status-->
<!--      (for example Annals of Oncology).-->
<!--    </p>-->
<!--  </div>-->
<!--  <div id="help_funder" class="col-sm help">-->
<!--    <p>-->
<!--      Tell us the main funder of your research, we'll find their publishing policy-->
<!--      (try Wellcome Trust). If your funder is not part of Plan S, this tool will not-->
<!--      be relevant to you. (List will be restricted to Plan S funders later.)-->
<!--    </p>-->
<!--  </div>-->
<!--  <div id="help_institution" class="col-sm help">-->
<!--    <p>-->
<!--      Let us know the institution you're affiliated to for this research-->
<!--      (e.g. Max Planck Society).-->
<!--    </p>-->
<!--  </div>-->
</div>
<div class="row">
 <div class="col-sm suggest" id="suggestjournal"></div>
  <div class="col-sm suggest" id="suggestfunder"></div>
  <div class="col-sm suggest" id="suggestinstitution"></div>
</div>
<div class="row">
  <div id="compliant" class="card fluid success col-md-12" style="display:none;">
    <h1>&#x2713; COMPLIANT</h1>
  </div>
  <div id="notcompliant" class="card fluid error col-md-12" style="display:none;">
    <h1>&#x2717; NOT COMPLIANT</h1>
  </div>
  <div class="col-sm-12" id="result">
  </div>
  <div class="row paths_results" id="paths_results"></div>
  <div class="col-sm-12" id="missing" style="display:none;"><p>Sorry, we can't find any <span id="whatsmissing"></span> called <b id="titlemissing"></b>. We'll add it as soon as we can.</p></div>
</div>
<div id="loading" class="loading" style="display:none;">
  <div style="margin-top:40px;margin-left:auto;margin-right:auto;width:200px;">
    <img style="height:200px;width:200px;" src="//static.cottagelabs.com/spin_grey.svg">
  </div>
</div>`;

jct.d = document;
jct.d.gebi = document.getElementById;
jct.d.gebc = document.getElementsByClassName;

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

jct.suggesting = false;

jct.choose = (e, el) => {
    jct.suggesting = false;
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
    let cls = et.getAttribute('class');
    jct.chosen[which] = {id: id, title: title};
    jct.d.gebi(which).value = title;
    jct.d.each('section',function(el) { el.style.display = 'none'; });
    jct.d.each('suggest','innerHTML','');
    //scroll(0,0); // TODO should take account of embed location and only scroll to search box height, if embedded further down a page
    if (cls.indexOf('success') !== -1) {
        jct.d.gebi('spacer').style.display = 'none';
        jct.d.gebi('compliant').style.display = 'block'; // TODO may want to add more info here about the compliance
    } else if (which === 'funder') {
        jct.d.gebi('journal').focus();
    } else if (which === 'journal') {
        jct.d.gebi('institution').focus();
    } else {
        jct.d.gebi('institution').blur();
        //jct.jx('journal/' + jct.chosen.journal.id, {funder: jct.chosen.funder.id, institution: jct.chosen.institution.id});
        //jct.d.gebi('loading').style.display = 'block';
    }
    if (jct.chosen.journal && jct.chosen.journal.id) {
        // TODO don't query every time if available values haven't changed sufficiently to alter an already received answer
        let qr = {journal: jct.chosen.journal.id};
        if (jct.chosen.funder && jct.chosen.funder.id) qr.funder = jct.chosen.funder.id;
        if (jct.chosen.institution && jct.chosen.institution.id) qr.institution = jct.chosen.institution.id;
        jct.jx('/calculate', qr);
        jct.d.gebi('loading').style.display = 'block';
    }
}

jct.COMPLIANCE_ROUTES = {
    fully_oa: "fully_oa",
    ta: "ta",
    tj: "tj",
    sa: "self_archiving"
}

jct.error = (xhr) => {
    jct.latest_response = xhr;
    console.log(xhr.status + ': ' + xhr.statusText);
}
jct.progress = (e) => {
    e && e.lengthComputable ? console.log(e.loaded + ' of ' + e.total + 'bytes') : console.log(e.loaded);
}
jct.success = (xhr) => {
    jct.d.gebi('loading').style.display = 'none';
    console.log(xhr.response.length + ' bytes');
    let js = JSON.parse(xhr.response);
    if (xhr.response.startsWith('[')) js = js[0];
    if (jct.suggesting) {
        jct.suggestions(js);
        jct.suggesting = false;
    } else {
        console.log(js)
        jct.latest_response = js.results;
        jct.d.gebi("paths_results").innerHTM = ""
        //jct.d.gebi('spacer').style.display = 'none';
        jct.d.gebi(js.compliant ? 'compliant' : 'notcompliant').style.display = 'block';
        jct.d.gebi("paths_results").innerHTML = "";
        // if (jct.chosen.journal){
        //     jct.add_tile(jct.COMPLIANCE_ROUTES.fully_oa);
        //     jct.add_tile(jct.COMPLIANCE_ROUTES.tj);
        //     jct.add_tile(jct.COMPLIANCE_ROUTES.sa);
        //     if (jct.chosen.institution){
        //         jct.add_tile(jct.COMPLIANCE_ROUTES.ta);
        //     }
        // }
        if (js.compliant) {
            js.results.forEach((r) => {
                if (r.compliant === "yes") {
                    jct.add_tile(r.route, jct.chosen)
                }
            })
        }

        // TODO may want to add further info to the compliant/notcompliant or result box about the compliance details
    }
}

jct.add_tile = (tile_type, data) => {
    let tile;
    switch(tile_type) {
        case jct.COMPLIANCE_ROUTES.fully_oa:
            tile = jct.fullyOA_tile(data.journal.title);
            break;
        case jct.COMPLIANCE_ROUTES.ta:
            tile = jct.transformative_agreement_tile(data.journal.title, data.institution.title);
            break;
        case jct.COMPLIANCE_ROUTES.tj:
            tile = jct.transformative_journal_tile(data.journal.title);
            break;
        case jct.COMPLIANCE_ROUTES.sa:
            tile = jct.self_archiving_tile(data.journal.title);
            break;
    }
    jct.d.gebi("paths_results").append(tile);
}

jct.fullyOA_tile = (journal_title) => {
    return htmlToElement (`
    <div class="col col--1of4" id="fyllyOA_tile ` + journal_title  + `">
        <p><b>` + journal_title + `</b> is fully open access.</p>
    </div>
  `)
}

jct.transformative_agreement_tile = (journal_title, publisher_title) => {
    return htmlToElement(`
    <div class="col col--1of4" id="ta_tile` + journal_title + `-` + publisher_title + `">
      <p>It is part of transformative agreement between <i>` + publisher_title + `</i> and <i> ` + journal_title + `</i>.</p>
    </div>
  `)
}

jct.transformative_journal_tile = (journal_title) => {
    return htmlToElement (`
    <div class="col col--1of4" id="tj_tile` +journal_title + `">
     <p>It is a transformative journal.</p>
    </div>
  `)
}

jct.self_archiving_tile = (journal_title) => {
    return htmlToElement (`
    <div class="col col--1of4" id="sa_tile` + journal_title + `">
     <p>It has a self-archiving policy, as shown on DOAJ.</p>
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
    jct.d.gebi('result').innerHTML = '';
    jct.d.gebi('compliant').style.display = 'none';
    jct.d.gebi('notcompliant').style.display = 'none';
    let sgst = '';
    let sd = jct.d.gebi('suggest'+jct.suggesting);
    let typed = jct.d.gebi(jct.suggesting).value.toLowerCase();
    jct.d.each('choose', function(el) { if (el.innerHTML.toLowerCase().indexOf(typed) === -1) { el.parentNode.removeChild(el); } });
    if (jct.cache[jct.suggesting] === undefined) jct.cache[jct.suggesting] = {string: '', data: []};
    let update = false;
    for ( let s in suggs.data ) {
        let t = suggs.data[s].title;
        let tl = t.toLowerCase();
        if (!jct.d.gebi(suggs.data[s].id)) {
            if (tl.indexOf(typed) !== -1) {
                sgst += '<p><a class="button choose' + (suggs.data[s].doaj ? ' success' : '') + '" which="' + jct.suggesting + '" title="' + t + '" id="' + suggs.data[s].id + '" href="#">' + t + '</a></p>';
            }
        } else if (!cached && jct.cache[jct.suggesting].string.indexOf(tl) === -1) {
            jct.cache[jct.suggesting].string += ' ' + tl;
            jct.cache[jct.suggesting].data.push(suggs.data[s]);
            update = true;
        }
    }
    if (update) {
        try {
            // in case we get too big for local storage...
            localStorage.setItem(jct.suggesting,JSON.stringify(jct.cache[jct.suggesting].data));
        } catch(err) {}
    }
    console.log(jct.d.gebc('choose').length)
    if (sgst.length) {
        console.log(jct.suggesting + ' ' + jct.cache[jct.suggesting].data.length);
        sd.innerHTML = sgst + sd.innerHTML;
        jct.d.each("choose", function(el) { el.addEventListener('click', jct.choose); });
    }
    if (jct.d.gebc('choose').length < 10 && cached) {
        // TODO also track how many were remaining from the last query (suggs.total - suggs.data.length)
        // and take into account if typed is still a subset of the last search, in which case there is no point triggering another search
        jct.jx('/suggest/'+jct.suggesting+'/'+typed.replace('journal','').replace(' of','').replace(' and',''));
    }
    if (!jct.d.gebc('choose')) {
        jct.d.gebi('whatsmissing').innerHTML = jct.suggesting;
        jct.d.gebi('titlemissing').innerHTML = jct.d.gebi(jct.suggesting).value;
        jct.d.gebi('missing').style.display = 'block';
        // TODO send missing value to backend
    }
}

// suggest strings based on user input, get jx from remote if not already present
jct.waiting = false;
jct.suggest = (e) => {
    // if on journal tab, could be a topic search
    // could also be an issn search starting with a number, in which case do nothing until is at least half an ISSN
    if (e === undefined) e = jct.waiting;
    if (e) {
        let which = e.target.id;
        let typed = e.target.value.toLowerCase().replace(' of','').replace('the ','');
        if ('journal'.indexOf(typed.trim()) !== -1) typed = '';
        if (typed.length === 0) {
            jct.d.each('suggest','innerHTML','');
        } else {
            if (typed.length > 1) {
                jct.suggesting = which;
                if (jct.cache[which] !== undefined && jct.cache[which].string !== undefined && jct.cache[which].string.indexOf(typed) !== -1) {
                    jct.suggestions(jct.cache[which], true);
                } else {
                    jct.jx('/suggest/'+which+'/'+typed);
                }
            }
        }
    }
    jct.waiting = false;
}

// preload most popular strings for first user interaction (on journals, most likely)
// store them in local storage - NOTE local storage can be up to 5MB / 2551000 characters, all journals, funders, institutions
// with IDs comes to almost that - if we end up with a lot more, may need to store just the title strings 
// separately then get the IDs when needed. Also note that we may want to start caching possible results too.
jct.preload = () => {
    let sdate = localStorage.getItem('cache');
    if (sdate && window.location.search.indexOf('storage=false') === -1) {
        let keys = ['journal','funder','institution'];
        for ( let k in keys) {
            jct.cache[keys[k]] = {string: '', data: localStorage.getItem(keys[k]) ? JSON.parse(localStorage.getItem(keys[k])) : {}};
            for ( let sk in jct.cache[keys[k]].data ) {
                jct.cache[keys[k]].string += jct.cache[keys[k]].data[sk].title.toLowerCase() + ' ';
            }
        }
        // TODO check js.date of local storage, and get any createdAt / updatedAt since then and add to local storage
        // also probably refresh after X time? or on url param?
    } else {
        let size = 2000;
        let max = 10000; // TODO once we have an idea of usage, get most popular rather than just first X on initial load
        let types = ['journal','funder','institution'];
        jct.preload._totals = {};
        jct.preload._from = {};
        jct.preload._preload = (xhr) => {
            let tps = xhr.responseURL.split('suggest/')[1].split('?')[0];
            let js = JSON.parse(xhr.response);
            if (jct.preload._totals[tps] === undefined) jct.preload._totals[tps] = js.total;
            for ( let s in js.data ) {
                jct.cache[tps].string += ' ' + js.data[s].title.toLowerCase();
                jct.cache[tps].data.push(js.data[s]);
            }
            let jcs = JSON.stringify({date: Date.now(), cache: jct.cache});
            console.log(jcs.length + ' chars going to local storage');
            try {
                localStorage.setItem('cache',Date.now());
                localStorage.setItem(tps,JSON.stringify(jct.cache[tps].data));
            } catch(err) {}
            console.log(tps + ' ' + jct.cache[tps].data.length);
            jct.preload._from[tps] += size;
            if (jct.preload._from[tps] < jct.preload._totals[tps] && jct.preload._from[tps] < max) jct.preload._get(tps);
        }
        jct.preload._get = (tp) => {
            jct.jx('suggest/'+tp, 'size=' + size + '&from='+jct.preload._from[tp], jct.preload._preload);
        }
        for ( let t in types ) {
            let tp = types[t];
            if (jct.cache[tp] === undefined) jct.cache[tp] = {string: '', data: []};
            if (jct.preload._from[tp] === undefined) jct.preload._from[tp] = 0;
            jct.preload._get(types[t]);
        }
    }
}

// start off with getting the funder automcompletes, then the journal autocompletes, which should be filtering results already
// then do further autocompletes by institution and filter the possible journals by that too
jct.setup = () => {
    console.log("setup")
    document.getElementById("plugin").innerHTML = plugin_template;
    let f = jct.d.gebi("funder");
    /*while (f === null) {
      console.log('waiting for page to draw');
      f = jct.d.gebi("funder");
    }*/

    let _sug = (e) => {
        jct.d.each('help', function(el) { el.style.display = 'none'; });
        let sl = jct.d.gebi('help_'+e.target.id);
        if (sl) sl.parentNode.removeChild(sl);
        jct.d.each('choose', function(el) { if (el.innerHTML.toLowerCase().indexOf(e.target.value.toLowerCase()) === -1 || el.getAttribute('which') !== e.target.id) el.parentNode.removeChild(el); });
        if (jct.waiting === false) jct.waiting = e; setTimeout(jct.suggest,jct.delay);
    }
    jct.d.gebi("funder").addEventListener("keyup", _sug);
    jct.d.gebi("journal").addEventListener("keyup", _sug);
    jct.d.gebi("institution").addEventListener("keyup", _sug);

    let _choose = (e) => {
        if (jct.d.gebi('help_'+e.target.getAttribute('id'))) jct.d.gebi('help_'+e.target.getAttribute('id')).style.display = 'block';
        jct.choose();
    }
    jct.d.gebi("funder").addEventListener("focus", _choose);
    jct.d.gebi("journal").addEventListener("focus", _choose);
    jct.d.gebi("institution").addEventListener("focus", _choose);

    jct.preload();
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
