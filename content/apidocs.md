---
title: "Public API docs"
date: 2021-02-13T23:38:56Z
description: "Documentation of the public API for the Journal Checker Tool: Plan S Compliance Validator."
---

<style type="text/css">
table {
    border: 1px solid #cccccc;
}

thead {
    font-weight: bold;
}

td, th {
    border: 1px solid #cccccc;
    padding: 5px;
}
</style>

# JCT Public API

The api is available at [{{< param apidocs.ApiURL >}}]({{< param apidocs.ApiURL >}}).

<hr>

**NOTE**

We are offering access to the early version of the api to enable programmatic access to the data.
This early version will be unsupported. Therefore, we recommend that you do not integrate this API
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

The parameters you can pass to the `/calculate` endpoint are as follows:

* **issn** - either the print or online ISSN of the journal you wish to check.
* **ror** - the ROR ID of the organisation that you wish to check.  See [https://ror.org](https://ror.org/) for more information
* **funder** - the JCT ID for the funder that you wish to check.  Allowable Funder IDs are listed [here](/funder-ids)

The `issn` field is the only *required* field, though without the `ror` and `funder` fields your results will
be partial, and may not give you complete and accurate information.  If you omit the `funder` or enter an invalid
funder ID, the API will ignore the invalid ID and give you results as if you had not provided the `funder` field.

The `ror` field is optional, and is equivalent to selecting "Not affiliated" via the User Interface.

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
    {"<qualification id> (see below)" : { <qualification specific data (if needed)> },
    ...
  ],
  "issn" : "<the issn checked for this result, if there is one>",
  "funder" : "<the funder checked on this result, if there is one>",
  "ror" : "the ror relevant to this result, if there is one>",
  "log" : [
    {
      "code" : "<algorithm transition code (see below)>",
      "parameters" : {
        "<parameter name>" : ["<parameter value>"]
      }
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
* `corresponding_authors` - the TA is only open to corresponding authors
    * no qualification specific data required
  
Log:

The log provides a list of decision transitions through the algorithm, in order of traversal.  This allows you to 
see the path through the algorithm that was taken to reach the decision, along with any relevant parameters.

See the table below for a full list of transitions, their meanings, and the parameters that may be associated.

For example, items such as this may be present:

```json
{
  "log" : [
    { "code" : "FullOA.InDOAJ" },
    { 
      "code" : "FullOA.Compliant",
      "parameters" : {
        "licence" : ["CC BY", "CC-BY-SA"]
      }
    } 
  ]
}
```

#### Full OA Route Codes:

| Code | Meaning | Property | Property Value |
| ---- | ------- | -------- | -------------- |
| FullOA.NotInDOAJ | Journal not found in DOAJ | | |
| FullOA.InProgressDOAJ | Journal application found in DOAJ | | |
| FullOA.NotInProgressDOAJ | No application found in DOAJ | | |
| FullOA.InDOAJ | Journal found in DOAJ | | |
| FullOA.Compliant | Journal properties are compliant | licence | List of Journal licences |
| FullOA.Unknown | Journal properties are unclear | missing | List of missing properties |
| FullOA.NonCompliant | Journal properties are non-compliant | license | List of Journal licences |

#### Self-Archiving Route Codes:

| Code | Meaning | Property | Property Value |
| ---- | ------- | -------- | -------------- |
| SA.InOAB | Journal was found in OAB | | |
| SA.NotInOAB | Journal was not found in OAB | | |
| SA.OABNonCompliant | The record in OAB did not comply with the Plan S requirements | licence | List of allowed SA licenses |
| | | embargo | Embargo length (list of length 1) |
| | | version | List of allowed SA versions |
| SA.OABIncomplete | Some data was missing from the OAB record, no determination could be made | missing | List of missing properties |
| SA.Compliant | The record in OAB complied with the Plan S requirements | licence | List of allowed SA licences |
| | | embargo | Embargo length (list of length 1) |
| | | version | List of allowed SA versions |
| SA.FunderRRNotActive | Funder has not adopted the Rights Retention strategy | | |
| SA.FunderRRActive | Funder has adopted the Rights Retention strategy | | |
| SA.Unknown | Self-Archiving status could not be determined | | |
| SA.NonCompliant | Self-Archiving is not possible under current circumstances | | |
| SA.Compliant | Self-Archiving is permitted via Rights Retention | | |

#### Transformative Agreement Route Codes:

| Code | Meaning | Property | Property Value |
| ---- | ------- | -------- | -------------- |
| TA.NoTA | No TA was found that matched the query parameters | | |
| TA.Exists | A TA was found that matched the query parameters | | |
| TA.NotAcive | The TA that was found is not current in force | | |
| TA.Active | The TA that was found is currently in force | | |
| TA.Unknown | It was not clear if the parameters of the TA meet Plan S criteria | | |
| TA.NonCompliant | The parameters of the TA do not meet Plan S criteria | | |
| TA.Compliant | The TA is Plan S compliant | | |

#### Transformative Journals Route Codes:

| Code | Meaning | Property | Property Value |
| ---- | ------- | -------- | -------------- |
| TJ.NoTJ | The Journal was not registered as a TJ | | |
| TJ.Exists | The Journal is registered as a TJ | | |
| TJ.NonCompliant | The parameters of the TJ do not meet Plan S criteria | | |
| TJ.Compliant | The TJ is Plan S compliant | | |


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
  "qualifications" : [
    {
      "<qualification id> (see below)" : { <qualification specific data (if needed)> },
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
