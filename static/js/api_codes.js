jct.api_codes = {
    type_ids: {
        'fully_oa':                 'Open Access Journal Route',
        'self_archiving':           'Self Archiving Route',
        'ta':                       'Transformative Agreement Route',
        'tj':                       'Transformative Journal Route'
     },
    compliance_ids: {
        'yes':                      'Route offers compliance',
         'no':                      'Route does not offer compliance',
         'unknown':                 'Not known if route offers compliance'
    },
    qualification_ids: {
        'name':                     'Please note,',
        'doaj_under_review': {
            description:            'this journal is currently under review for potential inclusion in DOAJ, it is yet to be ' +
                                    'approved for inclusion within the public DOAJ database.',
        },
        'rights_retention_author_advice': {
            description:            'your funder supports you to use the <a href="https://www.coalition-s.org/faq-theme/rights-licences/" target="_blank"  rel="noopener">'+'' +
                                    'cOAlition S rights retention strategy</a> as a route to compliance irrespective of the journal\'s self-archiving policy.',
        },
        'corresponding_authors': {
            description:            'The corresponding author of the submitted article must be based at '+
                                    'an institution within this transformative agreement for it to provide a route to compliance.',
        },
        'journal' : {
            description:            'a transformative agreement is currently in force for this journal.',
            start_date:             'Start date of the transformative agreement:',
            end_date:               'End date of the transformative agreement:'
        },
        'institution':  {
            description:            'a transformative agreement is currently in force for this institution.',
            start_date:             'Start date of the transformative agreement:',
            end_date:               'End date of the transformative agreement:'
        }
    },
    fully_oa: {
        'name':                     'Open Access Journal Route',
        'statement': {
            'yes':                  'You are able to comply with Plan S as this is a fully open access journal.',
            'no':                   'You are not able to <b>comply with Plan S</b> via the fully open access journal route.',
            'unknown':              'We are <b>unable to determine if you are complaint</b> via the fully open access journal route.',
        },
        'explanation': {
            'yes':                  'The following checks in the Directory of Open Access Journals (DOAJ) were carried ' +
                                    'out to determine if your chosen journal is an open access journal that enables compliance:',
            'no':                   'The following checks in the Directory of Open Access Journals (DOAJ) were carried out ' +
                                    'to determine that this is not a route to compliance:',
            'unknown':              'The following checks in the Directory of Open Access Journals (DOAJ) were carried out to determine compliance:',
        },
        'FullOA.NotInDOAJ':         'This journal is not present in DOAJ.',
        'FullOA.InProgressDOAJ':    'This journal is currently under review for potential inclusion in DOAJ.',
        'FullOA.NotInProgressDOAJ': 'This journal is not currently under review at DOAJ.',
        'FullOA.InDOAJ':            'This journal is present in DOAJ.',
        'FullOA.Compliant':         'This journal enables you to publish under the following licences that are supported by your funder\'s policy:',
            'FullOA.Compliant.Properties': {
            'licence':              ''
        },
        'FullOA.Unknown':           'We were unable to determine if this journal provides a route to compliance.',
        'FullOA.Unknown.Properties': {
            'missing':              'The following required information was missing from the DOAJ record:'
        },
        'FullOA.NonCompliant':      'This journal does not enable you to publish under a CC BY or equivalent licence required for policy compliance.',
        'FullOA.NonCompliant.Properties': {
            'licence':               'The licences allowed by this journal are:'
        },
    },
    self_archiving: {
        'name':                     'Self Archiving Route',
        'statement': {
            'yes':                  'You are able to comply with Plan S via Self-archiving.',
            'no':                   'Self-archiving does not enable <b>Plan S</b> compliance when publishing in this journal.',
            'unknown':              'We are <b>unable to determine</b> if you are able to comply with Plan S via Self-archiving, when publishing in this journal.',
        },
        'explanation': {
            'yes':                  "The following checks were carried out to determine whether the right exists to comply with " +
                                    "Plan S via self-archiving. Data from Open Access Button Permissions (OAB Permissions) is used " +
                                    "to see if the publisher's policy of self-archiving enables compliance. If it does not or if an " +
                                    "unknown answer has been returned then the cOAlition S Implementation Roadmap data is checked " +
                                    "to see if cOAlition S's Rights Retention Strategy provides a route to compliance:",
            'no':                   'The following checks were carried out to determine that this is not a compliant route:',
            'unknown':              'The following checks were carried out to determine compliance:',
        },
        'SA.InOAB':                 'This journal is present in OAB Permissions.',
        'SA.NotInOAB':              'This journal is not present in OAB Permissions.',
        'SA.OABNonCompliant':       "This journal's self-archiving policy does not enable compliance with your funder's open access policy, for the following reason(s):",
        'SA.OABNonCompliant.Properties': {
            'version':              'The manuscript version that can be archived is:',
            'embargo':              'There is an embargo period (in months):',
            'licence':              'The licence that can be used on the manuscript to be archived is:'
        },
        'SA.OABIncomplete':         'We were unable to determine if this journal provides a route to compliance.',
        'SA.OABIncomplete.Properties': {
            'missing':               'The following required information was missing from the OAB Permissions database:',
        },
        'SA.OABCompliant':          "This journals self-archiving policy aligns with your funder's open access policy.",
        'SA.OABCompliant.Properties': {
            'version':              'The manuscript version that can be archived is:',
            'embargo':              'There is an embargo period (in months):',
            'licence':              'The licence that can be used on the manuscript to be archived is:'
        },
        'SA.FunderRRNotActive': 	'Your funder has not implemented the ' +
                                    '<a href="https://www.coalition-s.org/faq-theme/rights-licences/" target="_blank"  rel="noopener">Plan S Rights Retention Strategy</a>.',
        'SA.FunderRRActive':        'Your funder has implemented the ' +
                                    '<a href="https://www.coalition-s.org/faq-theme/rights-licences/" target="_blank"  rel="noopener">Plan S Rights Retention Strategy</a>. ' +
                                    'Rights retention takes precedence over the journal\'s self-archiving policy. It provides a route to ' +
                                    'compliance irrespective of publisher imposed restrictions or embargo periods.',
        'SA.Unknown':               'We are unable to determine if this journal provides a route to compliance via self-archiving due to missing information.',
        'SA.NonCompliant':          'Self-archiving is not a route to compliance when publishing in this journal.',
        'SA.Compliant':             'Self-archiving can be a route to compliance when publishing in this journal.'
    },
    ta: {
        'name':                     'Transformative Agreement Route',
        'statement': {
            'yes':                  'You are able to comply with Plan S via a Transformative Agreement.',
            'no':                   'You are not able to <b>comply with Plan S</b> via a Transformative Agreement.',
            'unknown':              'We are <b>unable to determine</b> if you are able to comply with Plan S via a Transformative Agreement.',
        },
        'explanation': {
            'yes':                  'The following checks were carried out on the JCT\'s Transformative Agreement Index to ' +
                                    'determine if a Transformative Agreement is available that would enable compliance:',
            'no':                   'The following checks were carried out on the JCT\'s Transformative Agreement Index to ' +
                                    'determine if a Transformative Agreement is available that would enable compliance:',
            'unknown':              'The following checks were carried out on the JCT\'s Transformative Agreement Index to determine compliance:',
        },
        'TA.NoTA':                  'No Transformative Agreement containing the selected journal and institution was found within our database.',
        'TA.Exists':                'A Transformative Agreement containing the selected journal and institution was found within our database.',
        'TA.NotActive':             'Our database shows that the Transformative Agreement containing the selected journal and institution has expired.',
        'TA.Active':                'Our database shows that the Transformative Agreement containing the selected journal and institution is active.',
        'TA.Unknown':               'We do not have sufficient information to determine if a Transformative Agreement is available to provide a route to compliance.',
        'TA.NonCompliant':          'There is no Transformative Agreement available to provide a route to compliance.',
        'TA.Compliant':             'A Transformative Agreement is available that can provide a route to compliance.',
    },
    tj: {
        'name':                     'Transformative Journal Route',
        'statement': {
            'yes':                  'This journal is a Transformative Journal and therefore you <b>can comply with Plan S</b> via this route.',
            'no':                   'This journal is not a Transformative Journal and therefore you <b>cannot comply with Plan S</b> via this route.',
            'unknown':              'We are unable to determine if this journal is a Transformative Journal and therefore <b>unable to determine compliance</b> via this route.',
        },
        'explanation': {
            'yes':                  'The following checks were carried out on the JCT\'s Transformative Journal Index to determine that this is a compliant route:',
            'no':                   'The following checks were carried out on the JCT\'s Transformative Journal Index to determine that this is not a compliant route:',
            'unknown':              'The following checks were carried out on the JCT\'s Transformative Journal Index to determine compliance:',
        },
        'TJ.NoTJ':                  'This journal is not a Transformative Journal.',
        'TJ.Exists':                'This journal is a Transformative Journal.',
        'TJ.NonCompliant':          'As this journal is not a Transformative Journal, this route to compliance is not available.',
        'TJ.Compliant':             'This Transformative Journal provides a route to compliance.',
    }
}

