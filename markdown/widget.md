# Journal Checker Widget

The Journal Checker Widget is a tool that allow you to embed the Journal Checker Tool on your site. 

To embed the widget on your web page, copy and paste the code below into the web page where you want the widget to be displayed.

```code
<script type="text/javascript" src="../static/jct_plugin.js"></script>
<link href="../static/css/main.css" rel='stylesheet' type='text/css'>
<script>
    window.jct_query_options = {
        journal: "issn_of_the_journal",
        funder: "funder_id",
        institution: "ror_of_the_institution",
        not_he: false, // true or false
    }
    jct.setup_plugin();
</script>
<div id="jct_plugin"></div>
```
## Configuring the widget

The parameter ***jct_query_options*** takes a set of parameters to be able to set some default values for the plugin. 
All of the parameters are optional, and you do need to include them if you do not want any defaults values.
 
***journal***    
This parameter should be a valid journal issn.  <br>
Setting it will run the compliance check for this journal. <br>
A user will be able select other journals from the auto complete box.

***funder***    
This parameter expects the name of the funder. <br>
Setting it will run the compliance check for this funder. <br>
A user will be able to select other funders from the auto complete box.

***institution***    
This parameter expects the ror of the institution. <br>
Setting it will run the compliance check for this institution. <br>
A user will be able to select other institutions from the auto complete box or select _No affiliation_.

***not_he***    
This parameter can be set to either _true_ or _false_ and is used if you want to run the compliance check with no affiliation. <br>
If set to true, it will override any institution value you have set and run the compliance check with no affiliation. <br>
A user will be able to uncheck this box and select other institutions from the auto complete box.
