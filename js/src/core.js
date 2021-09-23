function getCardsToDisplay(config, results) {
    let cards = [];
    for (let i = 0; i < config.cards.length; i++) {
        let cardConfig = config.cards[i];
        if (_matches(cardConfig, results)) {
            cards.push(cardConfig);
        }
    }
    return cards;
}

function _matches(cardConfig, results) {
    return _matches_routes(cardConfig.match_routes, results) &&
            _matches_qualifications(cardConfig.match_qualifications, results);
}

function _matches_routes(routes, results) {
    if (!routes) {
        return true;
    }

    let compliantRoutes = [];
    for (let i = 0; i < results.length; i++) {
        let r = results[i];
        if (r.compliant === "yes") {
            compliantRoutes.push(r.route);
        }
    }

    if (routes.must) {
        for (let i = 0; i < routes.must.length; i++) {
            let mr = routes.must[i];
            if (!compliantRoutes.includes(mr)) {
                return false;
            }
        }
    }

    if (routes.not) {
        for (let i = 0; i < routes.not.length; i++) {
            let nr = routes.not[i];
            if (compliantRoutes.includes(nr)) {
                return false;
            }
        }
    }

    if (routes.or) {
        for (let i = 0; i < routes.or.length; i++) {
            let or = routes.or[i];
            if (compliantRoutes.includes(or)) {
                return true;
            }
        }
        return false;
    }

    return true;
}

function _matches_qualifications(qualifications, results) {
    if (!qualifications) {
        return true;
    }

    if (qualifications.must) {
        for (let i = 0; i < qualifications.must.length; i++) {
            let mq = qualifications.must[i];
            if (!_hasQualification(mq, results)) {
                return false;
            }
        }
    }

    if (qualifications.not) {
        for (let i = 0; i < qualifications.not.length; i++) {
            let nq = qualifications.not[i];
            if (_hasQualification(nq, results)) {
                return false;
            }
        }
    }

    if (qualifications.or) {
        for (let i = 0; i < qualifications.or.length; i++) {
            let oq = qualifications.or[i];
            if (_hasQualification(oq, results)) {
                return true;
            }
        }
        return false;
    }

    return true;
}

function _hasQualification(path, results) {
    let bits = path.split(".");
    for (let i = 0; i < results.length; i++) {
        let r = results[i];
        if (bits[0] === r.route) {
            if ("qualifications" in r) {
                if (r.qualifications.includes(bits[1])) {
                    return true;
                }
            }
        }
    }
    return false;
}