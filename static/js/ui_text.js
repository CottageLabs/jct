jct_ui_text = {
    compliance: {
        yes: "The following publishing options are aligned with your funder’s OA policy.",
        no: "<strong>No</strong>, this combination is not compliant." +
            "<p class=\"jct_compliance--question\">What can I do now?</p>"
    },
    preferred: 'Preferred',
    tiles: {
      journal_non_compliant: {
          icon: false,
          preferred: false,
          title: "Check with an alternative journal",
          modal_icon: false,
          text: "Repeat your search with an alternative journals to see if it provides a route to compliance " +
              "with your funder’s Plan S aligned open access policy."
      },
      funder_non_compliant: {
          icon: false,
          preferred: false,
          title: "Check with a different funder",
          modal_icon: false,
          text: "If your research was funded by multiple Plan S funders, repeat your search using the name of " +
              "one of the other funders. The implementation timeline for Plan S aligned open access policies is " +
              "not the same for all funders, therefore results may vary by funder."
      },
      institution_non_compliant: {
          icon: false,
          preferred: false,
          title: "Check with a different institution",
          modal_icon: false,
          text: "If you or other authors on your research article are affiliated with different institutions, " +
              "repeat your search with these alternative institutions. Transformative agreements, are made " +
              "between publishers and (consortia of) institutions. While the institution you searched does not " +
              "currently have an agreement with the publisher of this journal, one of your collaborator’s " +
              "institutions may do."
      },
      rights_retention_non_compliant: {
          icon: false,
          preferred: false,
          title: "Rights retention",
          modal_icon: false,
          text: "cOAlition S has developed a Rights Retention Strategy to give researchers supported by a " +
              "cOAlition S Funder the freedom to publish in their journal of choice, including subscription " +
              "journals, whilst remaining fully compliant with Plan S. " +
              "<a href=\"https://www.coalition-s.org/wp-content/uploads/2020/10/RRS_onepager.pdf\" " +
              "target=\"_blank\" rel=\"noopener\">More information on how to use it is available here</a>."
      },
      fully_oa: {
          icon: 'fully_oa',
          preferred: true, // this also opens the preferred modal
          title: "Full <br>open access",
          modal_icon: false,
          text: "<p>Go ahead and submit. Remember to select a " +
              "<a href=\"https://creativecommons.org/licenses/by/2.0/\" target=\"_blank\" rel=\"noopener\">" +
              "CC BY licence</a> to ensure compliance.</p>"
      },
      ta: {
          icon: 'ta',
          preferred: true, // this also opens the preferred modal
          title: "Transformative <br>agreement",
          modal_icon: false, // ta modal triggered by text
          text: "" // this is got conditions and substitutions. See jct.js transformative_agreement_tile
      },
      tj: {
          icon: 'tj',
          preferred: true, // this also opens the preferred modal
          title: "Transformative <br>journal",
          modal_icon: 'tj_modal',
          text: "<p>Go ahead and submit. Remember to select the open access publishing option with a " +
              "<a href=\"https://creativecommons.org/licenses/by/2.0/\" target=\"_blank\" rel=\"noopener\">" +
              "CC BY licence</a> to ensure compliance.</p>" +
              "<p>Check <a href=\"https://www.coalition-s.org/plan-s-funders-implementation/\" target=\"_blank\" " +
              "rel=\"noopener\">here</a> to confirm if your funder will pay publishing fees.</p>"
      },
      sa: {
          icon: 'sa',
          preferred: false,
          title: "Self-archiving",
          modal_icon: 'sa_modal',
          text: "<p>Upon acceptance, you can deposit your Author Accepted Manuscript in a repository without embargo " +
              "and with a <a href=\"https://creativecommons.org/licenses/by/2.0/\" target=\"_blank\" rel=\"noopener\">" +
              "CC BY licence</a>. Publishing fees do not apply with this route. </p>"
      },
      sa_rr: {
          icon: 'sa',
          preferred: false,
          title: "Compliance through self-archiving using rights retention",
          modal_icon: false,
          text: "<p>Your funder’s grant conditions set out how you can retain sufficient rights to self-archive the Author " +
              "Accepted Manuscript in any OA repository. Publishing fees do not apply with this route.</p>" // also need modal text
      },
      fully_oa_sa: {
          icon: 'sa',
          preferred: false,
          title: "Full open access<br>self-archiving",
          modal_icon: false,
          text: "<p>Upon publication, you have the right to self-archive the final published article as an additional " +
              "route to compliance rather than an alternative route. </p>"
      }
    },
    modals: {
        ta: {
            title: 'Transformative agreements',
            text: `<p>Consult your institution’s library prior to submitting to this journal. </p>
                <p><em>Transformative agreements</em> may have eligibility criteria or limits on publication numbers
                    in place that the Journal Checker Tool is currently not able to check. </p>`
        },
        tj: {
            title: 'Transformative journals',
            text: `<p>A <em>Transformative Journal</em> is a subscription/hybrid journal that is committed to transitioning
                    to a fully OA journal. It must gradually increase the share of OA content and offset subscription
                    income from payments for publishing services (to avoid double payments).</p>
                <p>Check <a href="https://www.coalition-s.org/plan-s-funders-implementation/" target="_blank" 
                rel="noopener">here</a> to confirm if your funder will pay publishing fees.</p>`
        },
        sa: {
            title: 'Self-archiving',
            text: `<p>Self-archiving is sometimes referred to as <em>green open access</em>. Publishing fees do not apply 
                    with this route.</p>
                    <p>Publish your article via the journal’s standard route and do not select an open access option. 
                    Following acceptance, deposit the full text version of the author accepted manuscript (the version 
                    that includes changes requested by peer-reviewers) to a repository without embargo and under a 
                    <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener">CC BY licence</a>. 
                    Your funder may require you to archive your article in a specific repository.</p>`
        },
        sa_rr : {
            title: 'Compliance through self-archiving using rights retention',
            text: `<p>The cOAlition S <a href="https://www.coalition-s.org/wp-content/uploads/2020/10/RRS_onepager.pdf" 
                 target="_blank" rel="noopener">Rights Retention Strategy</a>
                 sets out how you can retain sufficient rights to self-archive your Author Accepted Manuscript in any OA 
                 repository at the time of publication with a CC BY license. When using this route to make your research 
                 articles OA, no fees are payable to the publisher.</p>
                 <p>Some subscription publishers may impose conditions -- via the License to Publish Agreement or otherwise 
                 -- that prevent you from meeting your funders' OA requirements. Authors should check publication terms 
                 before submitting a manuscript and should not sign a publishing contract that conflicts with funder 
                 conditions. Contact your funder for more information and guidance.</p>`
        },
        preferred: {
            title: `Preferred Route to OA`,
            text: `<p>The Version of Record (VoR) is different from the Author Accepted Manuscript (AAM). The AAM is the
                    version accepted for publication, including all changes made during peer review. The VoR contains all
                    the changes from the copyediting process, journal formatting/branding etc., but it is also the version
                    maintained and curated by the publisher, who has the responsibility to ensure that any corrections or
                    retractions are applied in a timely and consistent way.</p>
                <p>For these reasons, the preferred option is to ensure that the VoR is made Open Access. Where the VoR
                    can be made available in accordance with the Plan S principles, and there is a cost, many cOAlition S
                    Organisations make funding available to cover these costs.</p>`
        },
        help: {
            title: `What’s this?`,
            text: `<p>Plan S aims for full and immediate Open Access to peer-reviewed scholarly publications from research funded by public and private grants.
                  <a href="https://www.coalition-s.org/" target="_blank" rel="noopener">cOAlition S</a> is the coalition 
                  of research funding and performing organisations that have committed to implementing Plan S. The goal 
                  of cOAlition S is to accelerate the transition to a scholarly publishing system that is characterised
                  by immediate, free online access to, and largely unrestricted use and re-use (full Open Access) of 
                  scholarly publications. </p>
                <p>The Journal Checker Tool enables researchers to check whether they can comply with their funders Plan S
                aligned OA policy based on the combination of journal, funder(s) and the institution(s) affiliated with
                the research to be published. The tool currently only identifies routes to open access compliance for
                Plan S aligned policies.</p>
                <p>This is a <a href="https://www.coalition-s.org/" target="_blank" rel="noopener">cOAlition S</a> project.</p>
                <p>
                    <a href="/notices#privacy_notice">Privacy Notice</a> •
                    <a href="/notices#disclaimer_and_copyright">Disclaimer & Copyright</a>
                </p>`
        },
        feedback: {
            title: `Feedback? Suggestion? Contact us here.`,
            text: `<p>This tool is delivered by <a href="https://cottagelabs.com/" target="_blank" rel="noopener">
            Cottage Labs</a> on behalf of <a href="https://www.coalition-s.org/" target="_blank" rel="noopener">cOAlition S</a>. </p>
            <p>If you believe that there is an error in the result given by the tool or how the tool is functioning 
            please use this form. Your current search details will be automatically included in your feedback. 
            We will respond within 3 working days.</p>
            <form id="contact_form">
                <div class="modal-inputs">
                    <label for="name">Name</label>
                    <input class="contact_input" type="text" id="name" name="name" placeholder="Your name..">
                </div>
                <div class="modal-inputs">
                    <label for="email">Email</label>
                    <input class="contact_input" type="email" id="email" name="email" placeholder="Your email..">
                </div>
                <div class="modal-inputs">
                    <label for="message">Comment</label>
                    <textarea class="contact_input" id="message" name="message" placeholder="Write something.."></textarea>
                </div>
                <div class="modal-inputs">
                    <button class="button button--primary contact_submit" type="submit">
                        <svg width="24" height="25" viewbox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M4.88002 24.4048C4.99391 24.4685 5.11979 24.5 
                            5.24492 24.5C5.4165 24.5 5.58734 24.4416 5.72445 24.3269L10.9109 20.0044H14.2242C19.6018 20.0044 
                            23.9768 15.6286 23.9768 10.2518C23.9768 4.87501 19.6018 0.5 14.225 0.5H9.75255C4.37501 0.5 0 
                            4.87501 0 10.2518C0 13.8438 2.01854 17.1609 5.18872 18.8527L4.50389 23.6443C4.45968 23.9523 
                            4.60953 24.2542 4.88002 24.4048ZM1.49855 10.2518C1.49855 5.70071 5.20071 1.99855 9.75255 
                            1.99855H14.2242C18.7761 1.99855 22.4782 5.69996 22.4782 10.2518C22.4782 14.8036 18.7761 
                            18.5058 14.2242 18.5058H10.6397C10.4644 18.5058 10.295 18.5672 10.1602 18.6789L6.26243 21.9277L6.74721 
                            18.5298C6.79442 18.2016 6.62059 17.8824 6.32013 17.7438C3.39122 16.3891 1.49855 13.449 1.49855 
                            10.2518ZM6.74347 8.01597H17.2333C17.6477 8.01597 17.9826 7.6803 17.9826 7.2667C17.9826 6.8531 
                            17.6477 6.51743 17.2333 6.51743H6.74347C6.32987 6.51743 5.99419 6.8531 5.99419 7.2667C5.99419 
                            7.6803 6.32987 8.01597 6.74347 8.01597ZM6.74347 14.0102H12.7377C13.152 14.0102 13.4869 13.6752 
                            13.4869 13.2609C13.4869 12.8473 13.152 12.5116 12.7377 12.5116H6.74347C6.32987 12.5116 5.99419 
                            12.8473 5.99419 13.2609C5.99419 13.6752 6.32987 14.0102 6.74347 14.0102ZM17.2333 11.0131H6.74347C6.32987 
                            11.0131 5.99419 10.6774 5.99419 10.2638C5.99419 9.8502 6.32987 9.51452 6.74347 9.51452H17.2333C17.6477 
                            9.51452 17.9826 9.8502 17.9826 10.2638C17.9826 10.6774 17.6477 11.0131 17.2333 11.0131Z" fill="black"></path>
                        </svg>
                        Send
                    </button>
                </div>
            </form>
            <div id="feedback_success" style="display: none;"><h1>Email sent successfully.</h1></div>
            <div id="feedback_error" style="display: none;"><h1>Ooops, something went wrong.</h1></div>
            <p>
                <a href="/notices#privacy_notice">Privacy Notice</a> •
                <a href="/notices#disclaimer_and_copyright">Disclaimer & Copyright</a>
            </p>` // Feedback modal uses generic id names. If embedding in the plugin, need to change id names
        }
    }
}
