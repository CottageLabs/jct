---
title: "Public API docs"
date: 2021-02-13T23:38:56Z
description: "Documentation of the public API for the Journal Checker Tool: Plan S Compliance Validator."
---

# JCT Public API

The api is available at [https://api.journalcheckertool.org](https://api.journalcheckertool.org).

<hr>

**NOTE**

We are offering access to the early version of the api to enable programmatic access to the data.
This early version will be unsupported. Therefore we recommend that you do not integrate this API
into your production systems until we transition out of beta. <br><br>
The API is rate limited to 10 requests per second, with burst up to 6000, with delay. Exceeding the limit will result in 429.
<hr>

## Request a compliance calculation

To carry out a compliance calculation, you can make a get request, as detailed below.

```
GET /calculate?issn=[issn]&ror=[ror]&funder=[funder]
```

The server will execute the algorithm, and gather responses for all routes 
before responding to the request.

### Overall response format

```json
{
  "request" : {
    "started" : "<start timestamp of the request>",
    "ended" : "<end timestamp of the request>",
    "took" : "<the time in ms between request start and end (on the server, not including travel time)>",
    "journal" : [
      {
        "id": "<journal issn>", 
        "title": "journal title", 
        "issn" : ["<all of the matching issn's for this journal>"]
      },
      ...
    ],
    "funder" : [{"id": "<funder ID>", "title": "funder title", ...}],
    "institution" : [{"id": "<institution ROR>", "title": "institution title", ...}],
    "checks": ["permission","doaj","ta","tj"]
  },
  "compliant" : "<true/false> # (if there is any compliant: 'yes' result, this is true. Otherwise false.)",
  "retention" : "<true/false> # (If a check was made for retention.)",
  "results" : [
    <route responses as per the above>
  ]  
}
```

### Per-Route response data

For each route, there is a general response format:

```json
{
  "route" : "<the type id of the route (see below)>",
  "compliant" : "<the compliance type id of the route (see below)",
  "qualifications" : [
    {"<qualification id> (see below)" : {<qualification specific data (if needed)>},
    ...
  ],
  "issn" : "<the issn checked for this result, if there is one>",
  "funder" : "<the funder checked on this result, if there is one>",
  "ror" : "the ror relevant to this result, if there is one>",
  "log" : [
    {
      "action" : "<description of the action (see below for details)>",
      "result" : "<the outcome of the action (optional, depending on circumstance)>",
      "url" : "<url to data supporting the result, if available>"
    },
    ...
  ]
}
```

Type IDs:

* `fully_oa` - Fully OA route
* `self_archiving` - Self Archiving route
* `ta` - Transformative Agreement route
* `tj` - Transformative Journal route

Compliance IDs:

* `yes` - Route offers compliance
* `no` - Route does not offer compliance
* `unknown` - Not known if route offers compliance

Qualification IDs:

* `doaj_under_review` - the journal is in the DOAJ "in progress" or "under review" list, not the public DOAJ
    * no qualification specific data required
* `rights_retention_author_advice` - the journal does not have an SA policy and does not appear in the rights retention data source
    * no qualification specific data required
* `rights_rentention_funder_implementation` - the journal does not have an SA policy and the funder has a rights retention policy that starts in the future.  There should be one record of this per funder that meets the conditions, and the following qualification specific data is requried:
    * `funder: <funder name>`
    * `date: <date policy comes into force (YYYY-MM-DD)`
* `corresponding_authors` - the TA is only open to corresponding authors
    * no qualification specific data required
* `journal` - if a TA is currently in force, the journal start_date and end_date of being in the TA will be provided
    * `start_date: <start date (human format)>`
    * `end_date: <end date (human format)>`
* `institution` - if a TA is currently in force, the institution start_date and end_date of being in the TA will be provided
    * `start_date: <start date (human format)>`
    * `end_date: <end date (human format)>`
  
Log:

The log provides a description of an action and its result, in human-readable English, in order.

For example, items such as this may be present:

```
{
  "log" : [
    {"action" : "Lookup in DOAJ", "result" : "ISSN not in public DOAJ"},
    {"action" : "Lookup in DOAJ", "result" : "ISSN 'in progress' at DOAJ"},
  ]
}
```

In the above example there is no `url` parameter to visit, but if the record were in DOAJ, for example, the URL would be the URL to the ToC in the DOAJ `https://doaj.org/toc/<ISSN>`.


## Transformative Journals

Determine if a journal is a transformative journal, using the issn:

```
GET /tj/{issn}
```

Response format:

```json
{
  "issn" : "<issn requested>",
  "transformative_journal" : true
}
```

OR `404` if record not found

## Transformative Agreements

```
GET /ta?issn={issn}&ror={ror}
```

Response format:

```json
{
  "started" : "<start timestamp of the request>",
  "ended" : "<end timestamp of the request>",
  "took" : "<the time in ms between request start and end (on the server, not including travel time)>",
  "route" : "<ta> # indicating a check for transformative agreement was done in the api",
  "compliant" : "<true/false> # (if there is an agreement, this is true. Otherwise false.)",
  "qualifications" : [{
      {"<qualification id> (see below)" : {<qualification specific data (if needed)>},
    }
    ...
   ],
  "issn" : "<issn in the TA>",
  "ror" : "<ror in the TA>",
  "log" : [
    {
      "action" : "<description of the action (see above for details.)>",
      "result" : "<the outcome of the action (optional, depending on circumstance)>"
    }
   ]
}
```

OR `404` if no TA exists for that combination.
