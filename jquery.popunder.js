/*!
 * jquery-popunder
 *
 * @fileoverview jquery-popunder plugin
 *
 * @author Hans-Peter Buniat <hpbuniat@googlemail.com>
 * @copyright 2012 Hans-Peter Buniat <hpbuniat@googlemail.com>
 * @license http://www.opensource.org/licenses/bsd-license.php BSD License
 *
 * @requires jQuery
 */
(function($) {
    "use strict";

    /**
     * Create a popunder
     *
     * @param  sUrl Url to open as popunder
     * @param  aOptions Options for the Popunder
     *
     * @return jQuery
     */
    $.popunder = function(sUrl, aOptions) {
        aOptions = aOptions || {};
        $.popunder.helper.open(sUrl, aOptions);
        return $;
    };

    /* several helper functions */
    $.popunder.helper = {
        /**
         * Helper to create a (optionally) random value with prefix
         *
         * @param  sUrl The url to open
         * @param  aOptions Options for the Popunder
         *
         * @return boolean
         */
        cookieCheck: function(sUrl, aOptions) {
            var name = this.rand(aOptions.cookie, false),
                cookie = $.cookies.get(name),
                ret = false;

            if (!cookie) {
                cookie = sUrl;
            }
            else if (cookie.indexOf(sUrl) === -1) {
                cookie += sUrl;
            }
            else {
                ret = true;
            }

            $.cookies.set(name, cookie, {
                expiresAt: new Date((new Date()).getTime() + aOptions.blocktime * 3600000)
            });

            return ret;
        },

        /**
         * Helper to create a (optionally) random value with prefix
         *
         * @param  name
         * @param  rand
         *
         * @return string
         */
        rand: function(name, rand) {
            var p = (name) ? name : 'pu_';
            return p + (rand === false ? '' : Math.floor(89999999*Math.random()+10000000));
        },

        /**
         * Open the popunder
         *
         * @param  sUrl The URL to open
         * @param  aOptions
         *
         * @return boolean
         */
        open: function(sUrl, aOptions) {
            var _parent = window.self,
                sToolbar = (!$.browser.webkit && (!$.browser.mozilla || parseInt($.browser.version, 10) < 12)) ? 'yes' : 'no',
                sOptions,
                popunder;

            aOptions.blocktime = (aOptions.blocktime) ? aOptions.blocktime : false;
            aOptions.cookie = (aOptions.cookie) ? aOptions.cookie : 'puCookie';
            aOptions.height = (aOptions.height) ? aOptions.height : (screen.availHeight - 122).toString();
            aOptions.width = (aOptions.width) ? aOptions.width : (screen.availWidth - 122).toString();

            if (aOptions.blocktime && $.popunder.helper.cookieCheck(sUrl, aOptions)) {
                return false;
            }

            if (top !== window.self) {
                try {
                    if (top.document.location.toString()) {
                        _parent = top;
                    }
                }
                catch(err) { }
            }

            /* popunder options */
            sOptions = 'toolbar=' + sToolbar + ',scrollbars=yes,location=yes,statusbar=yes,menubar=no,resizable=1,width=' + aOptions.width + ',height=' + aOptions.height + ',screenX=0,screenY=0,left=0,top=0';

            /* create pop-up from parent context */
            popunder = _parent.window.open(sUrl, $.popunder.helper.rand(), sOptions);
            if (popunder) {
                popunder.blur();
                if ($.browser.msie === true) {
                    /* classic popunder, used for ie */
                    window.focus();
                    try {
                        opener.window.focus();
                    }
                    catch (err) {
                    }
                }
                else {
                    /* popunder for e.g. ff, chrome */
                    popunder.init = function(e) {
                        /* in ff4+, chrome21+ we need to trigger a window.open on our parent to bring it to the front */
                        if (typeof e.window.mozPaintCount !== 'undefined' || typeof e.navigator.webkitGetUserMedia === "function") {
                            var x = e.window.open('about:blank');
                            x.close();
                        }

                        try {
                            e.opener.window.focus();
                        }
                        catch (err) { }
                    };
                    popunder.params = {
                        url: sUrl
                    };
                    popunder.init(popunder);
                }
            }

            return true;
        }
    };
})(jQuery);
