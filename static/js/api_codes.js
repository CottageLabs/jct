jct.api_codes = {
    type_ids: {
        'fully_oa':                 'Fully OA route',
        'self_archiving':           'Self Archiving route',
        'ta':                       'Transformative Agreement route',
        'tj':                       'Transformative Journal route'
     },
    compliance_ids: {
        'yes':                      'Route offers compliance',
         'no':                      'Route does not offer compliance',
         'unknown':                 'Not known if route offers compliance'
    },
    qualification_ids: {
        'doaj_under_review': {
            description:    'the journal is in the DOAJ "in progress" or "under review" list, not the public DOAJ',
        },
        'rights_retention_author_advice': {
            description:    'the journal does not have an SA policy and does not appear in the rights retention data source',
        },
        'rights_rentention_funder_implementation': {
            description:    'the journal does not have an SA policy and the funder has a rights retention policy that starts in the future. There should be one record of this per funder that meets the conditions, and the following qualification specific data is requried',
            funder:         'The name of the funder',
            date:           '<date policy comes into force (YYYY-MM-DD)'
        },
        'corresponding_authors': {
            description: 'the TA is only open to corresponding authors',
        },
        'journal' : {
            description: 'if a TA is currently in force, the journal start_date and end_date of being in the TA will be provided',
            start_date:  'start date of the TA',
            end_date:    'end date of the TA'
        },
        'institution':  {
            description: 'if a TA is currently in force, the institution start_date and end_date of being in the TA will be provided',
            start_date:  'start date of the TA',
            end_date:    'end date of the TA'
        }
    },
    fully_oa: {
        'FullOA.NotInDOAJ':         'Journal not found in DOAJ',
        'FullOA.InProgressDOAJ':    'Journal application found in DOAJ',
        'FullOA.NotInProgressDOAJ': 'No application found in DOAJ',
        'FullOA.InDOAJ':            'Journal found in DOAJ',
        'FullOA.Compliant':         'Journal properties are compliant',
        'FullOA.Unknown':           'Journal properties are unclear',
        'FullOA.NonCompliant':      'Journal properties are non-compliant',
        'licence':                  'List of Journal licences',
        'missing':                  'List of missing properties'
    },
    self_archiving: {
        'SA.InOAB':                 'Journal was found in OAB',
        'SA.NotInOAB':              'Journal was not found in OAB',
        'SA.OABNonCompliant':       'The record in OAB did not comply with the Plan S requirements',
        'SA.OABIncomplete':         'Some data was missing from the OAB record, no determination could be made',
        'SA.Compliant':             'The record in OAB complied with the Plan S requirements',
        'SA.FunderRRNotActive': 	'Funder has not adopted the Rights Retention strategy',
        'SA.FunderRRActive':        'Funder has adopted the Rights Retention strategy',
        'SA.Unknown':               'Self-Archiving status could not be determined',
        'SA.NonCompliant':          'Self-Archiving is not possible under current circumstances',
        'SA.Compliant':             'Self-Archiving is permitted via Rights Retention',
        'licence':                  'List of allowed SA licenses',
		'embargo':                  'Embargo length',
		'version':                  'List of allowed SA versions',
        'missing':                  'List of missing properties',
    },
    ta: {
        'TA.NoTA':                  'No TA was found that matched the query parameters',
        'TA.Exists':                'A TA was found that matched the query parameters',
        'TA.NotAcive':              'The TA that was found is not current in force',
        'TA.Active':                'The TA that was found is currently in force',
        'TA.Unknown':               'It was not clear if the parameters of the TA meet Plan S criteria',
        'TA.NonCompliant':          'The parameters of the TA do not meet Plan S criteria',
        'TA.Compliant':             'The TA is Plan S compliant',
    },
    tj: {
        'TJ.NoTJ':                  'The Journal was not registered as a TJ',
        'TJ.Exists':                'The Journal is registered as a TJ',
        'TJ.NonCompliant':          'The parameters of the TJ do not meet Plan S criteria',
        'TJ.Compliant':             'The TJ is Plan S compliant',
    }
}

