/*  ----------------------------------------------------------------------------
 tagDiv live css compiler ( 2013 )
 - this script is used on our demo site to customize the theme live
 - not used on production sites
 */

/* global jQuery:{} */
/* global td_read_site_cookie:Function */
/* global td_set_cookies_life:Function */
/* global tdDetect: {} */

var tdDemoMenu;

(function(jQuery, undefined) {

    'use strict';

    tdDemoMenu = {

        // document - horizontal mouse position
        mousePosX: 0,

        // document - vertical mouse position
        mousePosY: 0,

        // The timer waiting to start de interval
        startTimeout: undefined,

        // The interval that decreases the padding-left css value and increases the left css value of the screen demo (previewer of the demo)
        startInterval: undefined,



        // Flag marks that it's possible to move the mouse to the original demo
        _extendedDemo: false,

        // The current demo element (for which the counters have been applied)
        _currentElement: undefined,

        // The timer waiting to start the interval for extended demo
        _startExtendedTimeout: undefined,

        // The interval that decreases the width css value of the extended element
        _startExtendedInterval: undefined,





        init: function () {

            // Get document mouse position
            jQuery(document).mousemove(function (event) {
                if (event.pageX || event.pageY) {
                    tdDemoMenu.mousePosX = event.pageX;
                    tdDemoMenu.mousePosY = event.pageY;
                } else if (event.clientX || event.clientY) {
                    tdDemoMenu.mousePosX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                    tdDemoMenu.mousePosY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                }
            });


            // cloase the preview on mouse leave
            jQuery(document).mouseleave(function (event) {

                // Any existing timeout is cleard to stop any further css settings
                if (undefined !== tdDemoMenu.startTimeout) {
                    window.clearTimeout(tdDemoMenu.startTimeout);
                }

                // Any existing interval is cleard to stop any further css settings
                if (undefined !== tdDemoMenu.startInterval) {
                    window.clearInterval(tdDemoMenu.startInterval);
                }

                jQuery('.td-screen-demo:first').css('visibility', 'hidden');
                jQuery('.td-screen-demo-extend:first').hide();
            });

            // Show/hide the arrow skin scroll element
            jQuery('#td-theme-settings').find('.td-skin-wrap:first').scroll(function (event) {
                //console.log( event );

                var theTarget = event.currentTarget,
                    tdSkinScroll = jQuery(this).find('.td-skin-scroll:first');

                if (theTarget.clientHeight + theTarget.scrollTop < theTarget.scrollHeight) {
                    tdSkinScroll.css({
                        bottom: 0
                    });
                } else {
                    tdSkinScroll.css({
                        bottom: -40
                    });
                }
            });

            jQuery('#td-theme-settings').find('.td-skin-scroll:first').click(function (event) {
                //console.log( event );

                var theTarget = event.currentTarget,
                    tdSkinWrap = jQuery(this).closest('.td-skin-wrap');

                tdSkinWrap.animate(
                    {scrollTop: tdSkinWrap.scrollTop() + 200},
                    {
                        duration: 800,
                        easing: 'easeInOutQuart'
                    });
            }).mouseenter(function (event) {
                // Any existing timeout is cleard to stop any further css settings
                if (undefined !== tdDemoMenu.startTimeout) {
                    window.clearTimeout(tdDemoMenu.startTimeout);
                }

                // Any existing interval is cleard to stop any further css settings
                if (undefined !== tdDemoMenu.startInterval) {
                    window.clearInterval(tdDemoMenu.startInterval);
                }

                //jQuery( '#td-theme-settings' ).find( '.td-screen-demo:first' ).hide();
                jQuery('#td-theme-settings').find('.td-screen-demo:first').css('visibility', 'hidden');
            });




            jQuery('.td-set-theme-style-link').hover(

                // The mouse enter event handler
                function (event) {

                //console.log( 'in MAIN ' + contor++);

                    // Any existing timeout is cleard to stop any further css settings
                    if (undefined !== tdDemoMenu.startTimeout) {
                        window.clearTimeout(tdDemoMenu.startTimeout);
                    }

                    // Any existing interval is cleard to stop any further css settings
                    if (undefined !== tdDemoMenu.startInterval) {
                        window.clearInterval(tdDemoMenu.startInterval);
                    }

                    var
                    // The css class of the container element
                        cssClassContainer = 'td-set-theme-style',

                    // The jquery object of the current element
                        $this = jQuery(this),

                    // The jquery object of the container of the current element
                        $thisContainer = $this.closest('.' + cssClassContainer),

                    // The demo previewer
                        jQueryDisplayEl = jQuery('.td-screen-demo:first'),

                    // The ref top value considers the existing of the wpadminbar element
                        refTopValue = 0,

                    // The top value set to the css top setting
                        topValue = 0,

                    // The left value set to the css left setting
                        rightValue = 0,

                    // The padding value set to the css padding-left setting
                        paddingRightValue = 0,

                    // The extra value added to the css padding-left setting and removed from the css left setting (if we need to start earlier or later - does nothing with 0 value)
                        extraRightValue = 0,

                    // The jquery wpadminbar element
                        jqWPAdminBar = jQuery('#wpadminbar');



                    // Show the image into the image previewer
                    var imgElement = jQueryDisplayEl.find('img:first'),
                        dataImgUrl = $this.data('img-url');

                    if (imgElement.length) {
                        imgElement.attr('src', dataImgUrl);
                    } else {
                        jQueryDisplayEl.html('<img src="' + dataImgUrl + '"/>');
                    }


                    // The first column
                    if ( 0 === jQuery( '.td-set-theme-style-link' ).index( this ) % 2 ) {
                        rightValue = $thisContainer.outerWidth(true) * 2;

                        // The second column
                    } else {
                        var $thisPrevContainer = $thisContainer.prev('.' + cssClassContainer);

                        if ($thisPrevContainer.length) {
                            rightValue = $thisPrevContainer.outerWidth(true) - extraRightValue;
                            paddingRightValue = $thisPrevContainer.outerWidth(true) + extraRightValue;

                        }
                        event.preventDefault();
                        event.stopPropagation();
                    }

                    topValue = event.pageY - document.body.scrollTop - ( jQueryDisplayEl.outerHeight( true ) / 2 );

                    // Do not allow displaying the previewer demo below the bottom of the window screen
                    if (topValue + jQueryDisplayEl.outerHeight(true) > window.innerHeight) {
                        topValue -= (topValue + jQueryDisplayEl.outerHeight(true)) - window.innerHeight;
                    }

                    // Do not allow displaying the previewer demo above the top of the window screen. It also checks if the wpadminbar exists.
                    if (jqWPAdminBar.length) {
                        refTopValue = jqWPAdminBar.outerHeight(true);
                    } else {
                        refTopValue = 0;
                    }

                    if (refTopValue > topValue) {
                        topValue = refTopValue;
                    }

                    // The 'width' css property is used for Chrome and IE browsers which do not display the previewer image with auto width and auto height
                    var cssSettings = {
                            'top': topValue,
                            'right': rightValue,
                            //'padding-right': paddingRightValue,
                            'width': ''
                        },
                        dataWidthPreview = jQueryDisplayEl.data('width-preview');


                    // For the first column of demos, the previewer has padding
                    if (paddingRightValue > 0) {
                        cssSettings.width = dataWidthPreview + paddingRightValue;
                    }




                    // Apply the computed css to the element
                    jQueryDisplayEl.css(cssSettings);

                    // The 'right-value' data will be used to set 'right' css value when the computed padding is < 0
                    jQueryDisplayEl.data('right-value', rightValue + paddingRightValue);

                    //jQueryDisplayEl.show();
                    jQueryDisplayEl.css('visibility', 'visible');
                },

                // The mouse exit event handler
                function (event) {

                    //console.log('out MAIN ');

                    jQuery('.td-screen-demo-extend:first').hide();

                    var
                    // The jquery object of the previewer demo element
                        jQueryDisplayEl = jQuery('.td-screen-demo:first'),

                    // The css right value
                        existingRightValue = jQueryDisplayEl.css('right'),

                    // The css padding-right value
                        existingExtraRightValue = jQueryDisplayEl.css('padding-right'),

                    // The css width value
                        existingWidthValue = jQueryDisplayEl.css('width'),

                    // The integer css right value
                        newRightValue = parseInt(existingRightValue.replace('px', '')),

                    // The integer css padding-right value
                        newExtraRightValue = parseInt(existingExtraRightValue.replace('px', '')),

                    // The step value used to decrease the padding-left css value and to increase the left css value
                        step = 10,

                    // The waiting time (ms) for the timeout
                        startTimeoutWait = 50,

                    // The time (ms) for the interval
                    //startIntervalWait = 15,
                    startIntervalWait = 15,

                        newWidthValue = parseInt(existingWidthValue.replace('px', ''));


                    var $this = jQuery(this);
                    tdDemoMenu._currentElement = $this;

                    var tdThemeSettingsWidth = parseInt(jQuery('#td-theme-settings').css('width').replace('px', ''));

                    if (newExtraRightValue > 0) {

                        // Clear any timeout if there's one, because a new one will be created
                        if (undefined !== tdDemoMenu.startTimeout) {
                            window.clearTimeout(tdDemoMenu.startTimeout);
                            tdDemoMenu.startTimeout = undefined;
                        }

                        // Clear any interval if there's one, because a new one will be created
                        if (undefined !== tdDemoMenu.startInterval) {
                            window.clearInterval(tdDemoMenu.startInterval);
                            tdDemoMenu.startInterval = undefined;
                        }

                        tdDemoMenu.startTimeout = setTimeout(function () {


                            // Extended demo is eligible to be shown (true)
                            // The flag is set to false when the mouse is found in wrong position (mouse position is reached)
                            // The flag is set to true when the counters (the timer and the interval) finish, there the extended demo element being shown
                            tdDemoMenu._extendedDemo = true;

                            tdDemoMenu.startInterval = setInterval(function () {

                                    var dataWidthPreview = jQueryDisplayEl.data('width-preview');

                                    newRightValue += step;
                                    newExtraRightValue -= step;
                                    newWidthValue -= step;

                                    var mousePositionFound = false;

                                    if (newExtraRightValue <= 0 ||
                                        newWidthValue < dataWidthPreview ||
                                        tdDemoMenu.mousePosX <= jQuery(window).width() - tdThemeSettingsWidth ||
                                        tdDemoMenu.mousePosX >= jQuery(window).width() - newRightValue) {

                                        // Clear any timeout, and we should have one, because we finished
                                        if (undefined !== tdDemoMenu.startTimeout) {
                                            window.clearTimeout(tdDemoMenu.startTimeout);
                                            tdDemoMenu.startTimeout = undefined;
                                        }

                                        // Clear any interval, and we should have one, because we finished
                                        if (undefined !== tdDemoMenu.startInterval) {
                                            window.clearInterval(tdDemoMenu.startInterval);
                                            tdDemoMenu.startInterval = undefined;
                                        }

                                        newExtraRightValue = 0;
                                        newRightValue = jQueryDisplayEl.data('right-value');
                                        newWidthValue = dataWidthPreview;

                                        if (tdDemoMenu.mousePosX >= jQuery(window).width() - newRightValue) {
                                            mousePositionFound = true;
                                        }
                                    }

                                    jQueryDisplayEl.css({
                                        'right': newRightValue,
                                        'padding-right': newExtraRightValue,
                                        'width': newWidthValue
                                    });

                                    // The timeout started and the interval are stopped (The mouse was reached or the css computation is done)
                                    if (mousePositionFound) {
                                        tdDemoMenu._extendedDemo = false;
                                        tdDemoMenu._checkMousePosition();
                                    } else if (undefined === tdDemoMenu.startTimeout && undefined === tdDemoMenu.startInterval) {
                                        tdDemoMenu._extendedDemo = true;
                                        tdDemoMenu._showExtendedScreenDemo();
                                    }

                                }, startIntervalWait
                            );
                        }, startTimeoutWait);

                    } else {
                        //jQueryDisplayEl.hide();
                        jQueryDisplayEl.css('visibility', 'hidden');
                    }
                }

            ).mousemove(function(event) {
                tdDemoMenu._moveScreenDemo( event );
            });

            //jQuery('.td-screen-demo').hover(
            //    function (event) {
            //        //jQuery(this).show();
            //        jQuery(this).css('visibility', 'visible');
            //
            //        tdDemoMenu._resetTdScreeDemoExtendWidth();
            //    },
            //    function (event) {
            //
            //        // We are on mouseleave event, and because of this, if the main counters (the timer and the interval) are not finished, it means we
            //        // don't have any extended demo element, so it's okay to set its flag to false and hide the extended demo element and the previewer demo element (this element)
            //
            //        // The main counters (the timer and the interval) are cleared immediately, because their final step can make extend demo visible
            //
            //        // Clear any timeout, and we should have one, because we finished
            //        if (undefined !== tdDemoMenu.startTimeout) {
            //            window.clearTimeout(tdDemoMenu.startTimeout);
            //            tdDemoMenu.startTimeout = undefined;
            //        }
            //
            //        // Clear any interval, and we should have one, because we finished
            //        if (undefined !== tdDemoMenu.startInterval) {
            //            window.clearInterval(tdDemoMenu.startInterval);
            //            tdDemoMenu.startInterval = undefined;
            //        }
            //
            //        //jQuery(this).hide();
            //        jQuery(this).css('visibility', 'hidden');
            //        jQuery('.td-screen-demo-extend:first').hide();
            //    }
            //
            //).mousemove(function(event) {
            //    //tdDemoMenu._moveScreenDemo( event );
            //});

            jQuery('.td-screen-demo-extend').hover(
                function (event) {

                if ( tdDemoMenu._extendedDemo ) {

                    // Set the flag to false to not execute this routine twice on mouseenter event
                    tdDemoMenu._extendedDemo = false;

                    var

                    // The jquery current element
                        $this = jQuery(this),

                    // The jquery '.td-screen-demo' element
                        $tdScreenDemo = jQuery('.td-screen-demo:first'),

                    // The css width value
                    //columnWidth = $this.data('width-column'),
                        columnWidth = parseInt(jQuery('#td-theme-settings').css('width').replace('px', '')) / 2,

                    // The step value used to decrease the padding-left css value and to increase the left css value
                        step = 10,

                    // The waiting time (ms) for the timeout
                        startTimeoutWait = 50,

                    // The time (ms) for the interval
                    //startIntervalWait = 15,
                        startIntervalWait = 15,

                            newWidthValue = columnWidth;

                        $this.css({
                            'width': columnWidth + 'px',
                            'top': $tdScreenDemo.css('top')
                        });

                        $this.show();
                        //$tdScreenDemo.show();
                        $tdScreenDemo.css('visibility', 'visible');


                        tdDemoMenu._startExtendedTimeout = setTimeout(function () {

                            tdDemoMenu._startExtendedInterval = setInterval(function () {

                                newWidthValue -= step;

                                var mousePositionFound = false;

                                if (newWidthValue < 0 ||
                                    tdDemoMenu.mousePosX <= jQuery(window).width() - columnWidth - newWidthValue) {

                                    // Clear any timeout, and we should have one, because we finished
                                    if (undefined !== tdDemoMenu._startExtendedTimeout) {
                                        window.clearTimeout(tdDemoMenu._startExtendedTimeout);
                                        tdDemoMenu._startExtendedTimeout = undefined;
                                    }

                                    // Clear any interval, and we should have one, because we finished
                                    if (undefined !== tdDemoMenu._startExtendedInterval) {
                                        window.clearInterval(tdDemoMenu._startExtendedInterval);
                                        tdDemoMenu._startExtendedInterval = undefined;
                                    }

                                    if (tdDemoMenu.mousePosX <= jQuery(window).width() - columnWidth - newWidthValue) {
                                        mousePositionFound = true;
                                    }

                                    newWidthValue = columnWidth;

                                    $this.hide();
                                }

                                $this.css({
                                    'width': newWidthValue,
                                    'top': $tdScreenDemo.css('top')
                                });

                                if (mousePositionFound) {
                                    tdDemoMenu._checkMousePosition();
                                }
                            }, startIntervalWait);
                        }, startTimeoutWait);
                    }
                },
                function (event) {

                    /**
                     * 1. clear any extended timer/interval
                     * 2. hide the element
                     * 3. adjust its width to the initial value
                     * 4. hide the previewer element (this will be shown by the a mouseenter event if it's the case)
                     */

                    // Clear any timeout, and we should have one, because we finished
                    if (undefined !== tdDemoMenu._startExtendedTimeout) {
                        window.clearTimeout(tdDemoMenu._startExtendedTimeout);
                        tdDemoMenu._startExtendedTimeout = undefined;
                    }

                    // Clear any interval, and we should have one, because we finished
                    if (undefined !== tdDemoMenu._startExtendedInterval) {
                        window.clearInterval(tdDemoMenu._startExtendedInterval);
                        tdDemoMenu._startExtendedInterval = undefined;
                    }

                    tdDemoMenu._resetTdScreeDemoExtendWidth();

                    jQuery(this).hide();

                    //jQuery( '.td-screen-demo:first').hide();
                    jQuery('.td-screen-demo:first').css('visibility', 'hidden');
                }

            ).mousemove(function(event) {
                //tdDemoMenu._moveScreenDemo( event );
            });
        },




        /**
         * Position the '.td-screen-demo' element according to the mouse position
         *
         * @param event - mouse move
         * @private
         */
        _moveScreenDemo: function( event ) {
            var
            // The jquery object of the previewer demo element
                $screenDemo = jQuery( '.td-screen-demo:first' ),

                $WPAdminBar = jQuery( '#wpadminbar' ),

            // new top value
                newTopValue = event.pageY - document.body.scrollTop - ( $screenDemo.outerHeight( true ) / 2 ),

            // The reference top value used when #wpadminbar is enabled
                refTopValue = 0;

            if ( $WPAdminBar.length ) {
                refTopValue = $WPAdminBar.outerHeight(true);
            } else {
                refTopValue = 0;
            }

            if ( refTopValue > newTopValue ) {
                newTopValue = refTopValue;
            }


            if ( newTopValue < 0 ) {
                newTopValue = 0;
            } else if ( jQuery( window ).height() - $screenDemo.outerHeight( true ) / 2 < event.pageY - document.body.scrollTop ) {
                newTopValue = jQuery( window ).height() - $screenDemo.outerHeight( true );
            }

            $screenDemo.css( 'top', newTopValue );
        },





        /**
         * Used when the width of the demo menu has changed (the width of the extended screen also changes)
         * @private
         */
        _resetTdScreeDemoExtendWidth: function () {

            var widthColumn = parseInt(jQuery('#td-theme-settings').css('width').replace('px', '')) / 2;

            jQuery('.td-screen-demo-extend:first').css({
                'width': widthColumn + 'px'
            });
        },

        _showExtendedScreenDemo: function () {

            if (tdDemoMenu._extendedDemo) {

                jQuery('.td-screen-demo-extend:first').css({
                    top: jQuery('.td-screen-demo:first').css('top')
                }).show();

            }
        },

        _checkMousePosition: function () {

            var theElement;

            jQuery('.td-set-theme-style-link').each(function (index, element) {

                tdDemoMenu._log(index);

                var $this = jQuery(element),
                    cssClassContainer = 'td-set-theme-style',
                    $thisContainer = $this.closest('.' + cssClassContainer);

                var verticalPosition = false;
                var horizontalPosition = false;

                if (0 === jQuery('.td-set-theme-style-link').index(element) % 2) {

                    if (parseInt($thisContainer.position().top) + parseInt(jQuery(window).scrollTop()) < tdDemoMenu.mousePosY && tdDemoMenu.mousePosY < parseInt($thisContainer.position().top) + parseInt(jQuery(window).scrollTop()) + parseInt($thisContainer.outerHeight())) {
                        verticalPosition = true;

                        if (parseInt(jQuery(window).width()) - 2 * parseInt($thisContainer.outerWidth()) < tdDemoMenu.mousePosX && tdDemoMenu.mousePosX < parseInt(jQuery(window).width()) - parseInt($thisContainer.outerWidth())) {
                            horizontalPosition = true;
                        }
                    }
                    //tdDemoMenu._log( 'caz A : ' + index + ' > vert: ' + verticalPosition + ' > hori: ' + horizontalPosition + ' > posY: ' + tdDemoMenu.mousePosY + ' > posX: ' + tdDemoMenu.mousePosX +
                    //    ' > top: ' + (parseInt($thisContainer.position().top) + parseInt(jQuery(window).scrollTop())) + ' > bottom: ' + (parseInt($thisContainer.position().top) + parseInt(jQuery(window).scrollTop()) + parseInt($thisContainer.outerHeight())) +
                    //    ' > left: ' + (parseInt(jQuery( window ).width()) - 2 * parseInt($thisContainer.outerWidth())) + ' > right: ' + (parseInt(jQuery( window ).width()) - parseInt($thisContainer.outerWidth())) );

                } else {
                    var $thisPrevContainer = $thisContainer.prev('.' + cssClassContainer);

                    if ($thisPrevContainer.length) {
                        if (parseInt($thisPrevContainer.position().top) + parseInt(jQuery(window).scrollTop()) < tdDemoMenu.mousePosY && tdDemoMenu.mousePosY < (parseInt($thisPrevContainer.position().top) + parseInt(jQuery(window).scrollTop()) + parseInt($thisPrevContainer.outerHeight()))) {
                            verticalPosition = true;

                            if (parseInt(jQuery(window).width()) - parseInt($thisContainer.outerWidth()) < tdDemoMenu.mousePosX && tdDemoMenu.mousePosX < parseInt(jQuery(window).width())) {
                                horizontalPosition = true;
                            }
                        }
                    }
                    //tdDemoMenu._log( 'caz B : ' + index + ' > vert: ' + verticalPosition + ' > hori: ' + horizontalPosition + ' > posY: ' + tdDemoMenu.mousePosY + ' > posX: ' + tdDemoMenu.mousePosX +
                    //    ' > top: ' + ($thisPrevContainer.position().top + parseInt(jQuery(window).scrollTop())) + ' > bottom: ' + (parseInt($thisPrevContainer.position().top) + parseInt(jQuery(window).scrollTop()) + parseInt($thisPrevContainer.outerHeight())) +
                    //    ' > left: ' + (parseInt(jQuery( window ).width()) - parseInt($thisContainer.outerWidth())) + ' > right: ' + parseInt(jQuery( window ).width()) );
                }

                // The element where the mouse is positioned, was found
                if (verticalPosition && horizontalPosition) {
                    theElement = element;
                    return false;
                }

            });

            if (undefined === theElement) {
                //jQuery( '#td-theme-settings').find( '.td-screen-demo:first' ).hide();
                jQuery('#td-theme-settings').find('.td-screen-demo:first').css('visibility', 'hidden');
            } else {
                jQuery(theElement).mouseenter();
            }
        },

        _log: function (msg) {

            //window.console.log( msg );
        }

    };

})( jQuery );


/**
 * show the panel if the cookie is set
 */
(function() {
    'use strict';
    var td_current_panel_stat = td_read_site_cookie( 'td_show_panel' );
    if ( 'hide' === td_current_panel_stat ) {
        var jQueryObj = jQuery( '#td-theme-settings' );
        if ( jQueryObj.length ) {
            jQueryObj.removeClass( 'td-theme-settings-small' );
            jQuery( '#td-theme-set-hide' ).html( 'DEMOS' );
        }
    } else {
        jQuery( '#td-theme-set-hide' ).html( 'CLOSE');
    }

})();





/*  ----------------------------------------------------------------------------
 On load
 */
jQuery().ready(function() {

    'use strict';

    // do not run on iOS
    if (tdDetect.isIos === false && tdDetect.isAndroid === false) {
        tdDemoMenu.init();
    }



    // Show/hide the demo menu panel
    jQuery( '#td-theme-set-hide' ).click(function(event) {
        event.preventDefault();
        event.stopPropagation();

        var $this = jQuery(this),
            jQueryObj = jQuery( '#td-theme-settings' );

        if ( jQueryObj.hasClass( 'td-theme-settings-small' ) ) {
            // close
            jQueryObj.removeClass( 'td-theme-settings-small' );
            jQueryObj.addClass( 'td-theme-settings-closed' );
            $this.html( 'DEMOS' );

            setTimeout(function(){
                jQueryObj.addClass( 'td-ts-closed-no-transition' ); // add the remove transition class after the animation has finished
            }, 450);

            td_set_cookies_life( ['td_show_panel', 'hide', 86400000] );//86400000 is the number of milliseconds in a day


        } else {
            // open
            jQueryObj.removeClass( 'td-ts-closed-no-transition' ); // remove the remove transition class :)


            jQueryObj.addClass( 'td-theme-settings-small' );
            jQueryObj.removeClass( 'td-theme-settings-closed' );
            $this.html( 'CLOSE' );
            td_set_cookies_life( ['td_show_panel', 'show', 86400000] );//86400000 is the number of milliseconds in a day
        }
    });


}); //end on load