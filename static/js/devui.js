let devui = {};

devui.makeAPIResponse = function(compliant_routes, non_compliant_routes, quals) {
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
            log:  [],
            qualifications: qualifications
        })
    }
    for (let i = 0; i < non_compliant_routes.length; i++) {
        results.push({
            route : non_compliant_routes[i],
            compliant: "no",
            issn: ["1474-9718", "1474-9726"],
            log:  []
        })
    }
    return {
        request: {},
        compliant: compliant_routes.length > 0,
        results: results
    }
}

devui.responses = {}
devui.responses.fully_oa = devui.makeAPIResponse(["fully_oa"], ["ta", "tj", "self_archiving"], []);
devui.responses.sarr = devui.makeAPIResponse(["self_archiving"], ["fully_oa", "ta", "tj"], ["rights_retention_author_advice"]);
devui.responses.sa = devui.makeAPIResponse(["self_archiving"], ["fully_oa", "ta", "tj"], []);
devui.responses.ta = devui.makeAPIResponse(["ta"], ["fully_oa", "tj", "self_archiving"], []);
devui.responses.taaq = devui.makeAPIResponse(["ta"], ["fully_oa", "tj", "self_archiving"], ["corresponding_authors"]);
devui.responses.tj = devui.makeAPIResponse(["tj"], ["fully_oa", "ta", "self_archiving"], [])
devui.responses.non_compliant = devui.makeAPIResponse([], ["tj", "ta", "self_archiving", "fully_oa"], [])
devui.responses.max = devui.makeAPIResponse(["self_archiving", "fully_oa", "ta", "tj"], [], ["corresponding_authors"])

devui.api_response = devui.responses.non_compliant;
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

// {
//     request : {},
//     compliant: true,
//     results : [
//         {
//             "route": "tj",
//             "compliant": "yes",
//             "issn": ["1474-9718", "1474-9726"],
//             "log": [{"code": "TJ.NoTJ"}]
//         },
//         {
//             "route": "fully_oa",
//             "compliant": "yes",
//             "issn": ["1474-9718", "1474-9726"],
//             "log": [
//                 {"code": "FullOA.InDOAJ"},
//                 {"code": "FullOA.Compliant", "parameters": {"licence": ["CC BY"]}}
//             ]
//         },
//         {
//             "route": "ta",
//             "compliant": "yes",
//             "issn": ["1474-9718", "1474-9726"],
//             "ror": "00bve7358",
//             "log": [{"code": "TA.NoTA"}]
//         },
//         {
//             "route": "self_archiving",
//             "compliant": "yes",
//             "qualifications": [{"rights_retention_author_advice": ""}],
//             "issn": ["1474-9718", "1474-9726"],
//             "ror": "00bve7358",
//             "funder": "wellcome",
//             "log": [
//                 {"code": "SA.InOAB"},
//                 {"code": "SA.OABNonCompliant", "parameters": {"licence": ["other (non-commercial)"], "version": ["acceptedVersion"]}},
//                 {"code": "SA.FunderRRActive"},
//                 {"code": "SA.Compliant"}
//             ]
//         }
//     ]
// }

jct.result_equals_chosen = function() {
    return true;
}

devui.setup = function() {
    // let body = document.getElementsByTagName("body")[0];
    // let newNode = document.createElement("div")
    // newNode.innerHTML = `
    //     <h1>JCT Test Mode</h1>
    // `;
    // body.insertBefore(newNode, body.getElementsByTagName("main")[0]);
    jct.chosen = devui.chosen;
    jct.success({
        response : JSON.stringify(devui.api_response)
    })
}