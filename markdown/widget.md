# Journal Checker Widget

The Journal Checker Widget allows you to embed the Journal Checker Tool's full functionality on your site. It also 
allows you to pre-select any of the values for the user: the ISSN for a journal, the funder, or the ROR for the institution.

To embed the widget on your web page, copy and paste the code below into the web page where you want the widget to be displayed,
and then customise it according to the documentation below.

```code
<script type="text/javascript" src="https://journalcheckertool.org/static/jct_plugin.js"></script>
<link href="https://journalcheckertool.org/static/css/main.css" rel='stylesheet' type='text/css'>
<script>
    window.jct_query_options = {
        journal: "[issn_of_the_journal]",
        funder: "[funder_id]",
        institution: "[ror_of_the_institution]",
        not_he: false, // true or false
    }
    jct.setup_plugin();
</script>
<div id="jct_plugin"></div>
```

## Considerations for embedding

The Journal Checker Widget provides a similar experience for the user as the main Journal Checker Tool.  As such, it 
is best displayed in a full page width container.  Future releases may include a minified version of the widget for
inclusion in page side-bars, etc.

The widget will give the user the 3 standard input boxes (with autosuggests for values), and then the usual summary
of compliance options followed by a fully expandable explanation of the results.  As a result, when all sections are completed
and expanded, the widget will take up substantial vertical space on the page.

## Configuring the widget

The widget can be configured to pre-fill the user input boxes with values dictated by the embedder.  Any number of the
input boxes can be pre-filled.

The parameter `window.jct_query_options` takes a set of default values for the plugin to offer to the user. 
All of the parameters are optional, and you do not need to include them if you do not want any default values.

***journal***    
This parameter should be a valid journal ISSN.
Setting it will pre-fill the "Journal" input box on the widget.
A user will also be able select other journals from the "Journal" box.

For example, providing the following configuration will pre-fill "Nature": 

```code
window.jct_query_options.journal = "1476-4687"
```

***funder***    
This parameter expects the identifier for the funder from JCT.
Setting it will pre-fill the "My Funder" input box on the widget.
A user will also be able to select other funders from the "My Funder" box.

The following funders are allowed in this field.  Below lists the funder's full name, followed by
their ID.  For example, if you wish to pre-fill the "My Funder" input box with the "Academy of Finland (AKA)"
then you should provide: 

```code
window.jct_query_options.funder = "academyoffinlandaka"
```

* Academy of Finland (AKA): `academyoffinlandaka`
* Aligning Science Across Parkinson’s (ASAP): `aligningscienceacrossparkinsonsasap`
* Austrian Science Fund (FWF): `austriansciencefundfwf`
* Bill & Melinda Gates Foundation: `billmelindagatesfoundation`
* European Commission (Horizon Europe Framework Programme): `europeancommissionhorizoneuropeframeworkprogramme`
* Formas (Sweden): `formassweden`
* FORTE (Sweden): `fortesweden`
* French National Research Agency (ANR): `frenchnationalresearchagencyanr`
* Higher Council for Science and Technology (HCST, Jordan): `highercouncilforscienceandtechnologyhcstjordan`
* Howard Hughes Medical Institute: `howardhughesmedicalinstitute`
* Luxembourg National Research Fund (FNR): `luxembourgnationalresearchfundfnr`
* National Institute for Nuclear Physics (INFN, Italy): `nationalinstitutefornuclearphysicsinfnitaly`
* National Science and Technology Council (NSTC, Zambia): `nationalscienceandtechnologycouncilnstczambia`
* National Science Centre, Poland (NCN): `nationalsciencecentrepolandncn`
* Netherlands Organisation for Scientific Research (NWO): `netherlandsorganisationforscientificresearchnwo`
* Research Council of Norway (RCN): `researchcouncilofnorwayrcn`
* Science Foundation Ireland (SFI): `sciencefoundationirelandsfi`
* Slovenian Research Agency (ARRS): `slovenianresearchagencyarrs`
* South African Medical Research Council (SAMRC): `southafricanmedicalresearchcouncilsamrc`
* Templeton World Charity Foundation (TWCF): `templetonworldcharityfoundationtwcf`
* United Kingdom Research & Innovation (UKRI): `unitedkingdomresearchinnovationukri`
* Vinnova (Sweden): `vinnovasweden`
* Wellcome: `wellcome`
* World Health Organization (WHO): `worldhealthorganizationwho`
* Special Programme for Research and Training in Tropical Diseases (TDR): `specialprogrammeforresearchandtrainingintropicaldiseasestdr`


***institution***    
This parameter expects the [ROR](https://ror.org) of the institution.
Setting it will pre-fill the "My Institution" input box.
A user will also be able to select other institutions from the "My Institution" box or select _No affiliation_.

If you do not know the ROR of the organisation that you wish to pre-fill, you can find it by searching in
the [ROR Registry](https://ror.org/) and taking the alphanumerical ID of the organisation (like `041kmwe10`).
For example, this will pre-fill "Imperial College London": 

```code
window.jct_query_options.institution = "041kmwe10"  
```
Do **not** include the `https://ror.org/` part of the ROR ID.

***not_he***    
This parameter can be set to either `true` or `false` and is used if you want to run the compliance check with no 
institution pre-filled. Instead the "Not affiliated" checkbox will be selected.
If set to `true`, it will override any institution value you have set.
A user will also be able to uncheck this box and select other institutions from the "My Institution" box.

```code
window.jct_query_options.no_he = true
```
