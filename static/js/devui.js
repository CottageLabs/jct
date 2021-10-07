let devui = {};

devui.logs = {}

devui.logs.fully_oa = {}
devui.logs.fully_oa.compliant = [
    {code : "FullOA.InDOAJ"},
    {code : "FullOA.Compliant", "parameters" : {"licence" : ["cc-by"]}}
]
devui.logs.fully_oa.non_compliant = [
    {code: "FullOA.NotInDOAJ"},
    {code: "FullOA.NotInProgressDOAJ"}
]
devui.logs.fully_oa.unknown = [
    {code : "FullOA.InDOAJ"},
    {code: "FullOA.Unknown", "parameters" : {"missing" : ["licence"]}}
]

devui.logs.self_archiving = {}
devui.logs.self_archiving.compliant = [
    {code: "SA.InOAB"},
    {code: "SA.OABCompliant", "parameters" : {"version" : ["publishedVersion"], "embargo" : ["0"], "licence" : ["cc-by"]}}
]
devui.logs.self_archiving.non_compliant = [
    {code: "SA.NotInOAB"},
    {code: "SA.FunderRRNotActive"},
    {code: "SA.NonCompliant"}
]
devui.logs.self_archiving.unknown = [
    {code: "SA.InOAB"},
    {code: "SA.FunderRRNotActive"},
    {code: "SA.Unknown"}
]

devui.logs.ta = {}
devui.logs.ta.compliant = [
    {code: "TA.Exists"},
    {code: "TA.Active"},
    {code: "TA.Compliant"}
]
devui.logs.ta.non_compliant = [
    {code: "TA.NoTA"}
]
devui.logs.ta.unknown = [
    {code: "TA.Exists"},
    {code: "TA.Active"},
    {code: "TA.Unknown"}
]

devui.logs.tj = {}
devui.logs.tj.compliant = [
    {code: "TJ.Exists"},
    {code: "TJ.Compliant"}
]
devui.logs.tj.non_compliant = [
    {code: "TJ.NoTJ"}
]
devui.logs.tj.unknown = []

devui.makeAPIResponse = function(compliant_routes, non_compliant_routes, unknown_routes, quals) {
    let results = [];
    for (let i = 0; i < compliant_routes.length; i++) {
        let qualifications = [];
        if (compliant_routes[i] === "self_archiving" && quals.includes("rights_retention_author_advice")) {
            qualifications = [{"rights_retention_author_advice": ""}]
        }
        if (compliant_routes[i] === "ta" && quals.includes("corresponding_authors")) {
            qualifications = [{"corresponding_authors" : ""}]
        }
        results.push({
            route : compliant_routes[i],
            compliant: "yes",
            issn: ["1474-9718", "1474-9726"],
            log:  devui.logs[compliant_routes[i]].compliant,
            qualifications: qualifications
        })
    }
    for (let i = 0; i < non_compliant_routes.length; i++) {
        results.push({
            route : non_compliant_routes[i],
            compliant: "no",
            issn: ["1474-9718", "1474-9726"],
            log:  devui.logs[non_compliant_routes[i]].non_compliant
        })
    }

    for (let i = 0; i < unknown_routes.length; i++) {
        results.push({
            route : unknown_routes[i],
            compliant: "unknown",
            issn: ["1474-9718", "1474-9726"],
            log:  devui.logs[unknown_routes[i]].unknown
        })
    }

    return {
        request: {},
        compliant: compliant_routes.length > 0,
        results: results
    }
}

devui.responses = {}
devui.responses.fully_oa = devui.makeAPIResponse(["fully_oa"], ["ta", "tj", "self_archiving"], [], []);
devui.responses.sarr = devui.makeAPIResponse(["self_archiving"], ["fully_oa", "ta", "tj"], [], ["rights_retention_author_advice"]);
devui.responses.sa = devui.makeAPIResponse(["self_archiving"], ["fully_oa", "ta", "tj"], [], []);
devui.responses.ta = devui.makeAPIResponse(["ta"], ["fully_oa", "tj", "self_archiving"], [], []);
devui.responses.taaq = devui.makeAPIResponse(["ta"], ["fully_oa", "tj", "self_archiving"], [], ["corresponding_authors"]);
devui.responses.tj = devui.makeAPIResponse(["tj"], ["fully_oa", "ta", "self_archiving"], [],[])
devui.responses.non_compliant = devui.makeAPIResponse([], ["tj", "ta", "self_archiving", "fully_oa"], [], [])
devui.responses.max = devui.makeAPIResponse(["self_archiving", "fully_oa", "ta", "tj"], [], [], ["corresponding_authors"])
devui.responses.unknown = devui.makeAPIResponse([], [], ["self_archiving", "fully_oa", "ta", "tj"], [])


devui.api_response = devui.responses.unknown;
devui.chosen = {
    "journal":{
        "title":"Aging",
        "issn":["1945-4589"],
        "publisher":"\"Impact Journals, LLC \"",
        "id":"1945-4589"
    },
    "funder":{
        "title":"Wellcome",
        "id":"wellcome"
    },
    "institution":{
        "title":"Imperial Oil",
        "country":"Canada",
        "id":"00bve7358"
    }
}

jct.result_equals_chosen = function() {
    return true;
}

devui.setup = function() {
    jct.chosen = devui.chosen;
    jct.success({
        response : JSON.stringify(devui.api_response)
    });
    jct.d.toggle_detailed_results();
}