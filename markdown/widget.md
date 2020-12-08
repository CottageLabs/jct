# JCT Widget

JCT Widget is a tools that allow you to embed the JCT compliance tool into your site. 

To embed the widget on your page, copy and paste the code below into your page where you want the widget to be displayed.

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
## Configuring the widget using jct_query_options
The parameter ***jct_query_options*** takes a set of fields to be able to set some default calues for the plugin.
 
 
| Parameter (optional) | Value to be set                                                                                                                                                                                                                                                                                                                                                        |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| journal              | This parameter should be a valid journal issn. <br><br>Setting it will run the compliance check for this journal.<br><br>A user will be able select other journals from the auto complete box.                                                                                                                                                                         |
| funder               | This parameter expects the name of the funder.<br><br>Setting it will run the compliance check for this funder.<br><br>A user will be able to select other funders from the auto complete box.                                                                                                                                                                         |
| institution          | This parameter expects the ror of the institution.<br><br>Setting it will run the compliance check for this institution.<br><br>A user will be able to select other institutions from the auto complete box or select no                                                                                                                                               |
| not_he               | This parameter can be set to either _true_ or _false_ and is used if you want to run the compliance check with no affiliation.<br><br>If set to true, it will override any institution value you have set and run the compliance check with no affiliation.  <br><br>A user will be able to uncheck this box and select other institutions from the auto complete box. |

All of the parameters are optional, and you do need to include them if you do not want any defaults set