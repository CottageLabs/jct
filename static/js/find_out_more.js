jct.setup_fom_url = () => {
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