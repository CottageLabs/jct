# Journal Checker Tool UI

This software provides the user interface for the Journal Checker Tool, all the client-side behaviours, and all the
static content.

Plan S aims for full and immediate Open Access to peer-reviewed scholarly publications from research funded by public 
and private grants. [cOAlition S](https://www.coalition-s.org/) is the coalition of research funding and performing 
organisations that have committed to implementing Plan S. The goal of cOAlition S is to accelerate the transition to a 
scholarly publishing system that is characterised by immediate, free online access to, and largely unrestricted use and 
re-use (full Open Access) of scholarly publications.

The Journal Checker Tool enables researchers to check whether they can comply with their funders Plan S aligned OA 
policy based on the combination of journal, funder(s) and the institution(s) affiliated with the research to be 
published. The tool currently only identifies routes to open access compliance for Plan S aligned policies.

This is a [cOAlition S](https://www.coalition-s.org/) project.

## Development steps
### Chaning content in static pages
1. Edit the relevant markdown file in the markdown folder
2. Run complie_markdown.py to push those changes to html

### Creating the jct_plugin javascript file
1. The plugin uses jct_plugin.js. This is a combimation of the following files
    - api_endpoint.js
    - clinput.js
    - jct.js
    - detailed_results.js
    - feedback.js
    - plugin.js
2. If you make any changes to any of the above js files, you need to recreate the jct_plugin.js file.
   To do this run compile_plugin_js.py
 