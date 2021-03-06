/**
 * Created by ra on 9/30/2015.
 */

/*
 tdWeather.js
 v1.0
 */
/* global jQuery:false */
/* global tdDetect:false */
/* global tdUtil:false */
/* global alert:false */
/* global tdLocalCache:false */




var tdWeather = {};

( function(){
    "use strict";

    tdWeather = {

        // used to translate the OWM code to icon
        _icons: {
            // day
            '01d' : 'clear-sky-d',
            '02d' : 'few-clouds-d',
            '03d' : 'scattered-clouds-d',
            '04d' : 'broken-clouds-d',
            '09d' : 'shower-rain-d',   // ploaie hardcore
            '10d' : 'rain-d',          // ploaie light
            '11d' : 'thunderstorm-d',
            '13d' : 'snow-d',
            '50d' : 'mist-d',

            //night:
            '01n' : 'clear-sky-n',
            '02n' : 'few-clouds-n',
            '03n' : 'scattered-clouds-n',
            '04n' : 'broken-clouds-n',
            '09n' : 'shower-rain-n',   // ploaie hardcore
            '10n' : 'rain-n',          // ploaie light
            '11n' : 'thunderstorm-n',
            '13n' : 'snow-n',
            '50n' : 'mist-n'
        },

        _currentRequestInProgress: false, // prevent multiple parallel requests
        _currentItem: '',  // current weather object, it is set on click and after we modify it, it will be displayed

        // latitude and longitude position, used in callback hell
        _currentLatitude: 0,
        _currentLongitude: 0,
        _currentPositionCacheKey: '',
        _currentLocationCacheKey: '',

        //location
        _currentLocation: '',

        // all the weather items
        items: [],  /** an item is json encoded from this in PHP: @see td_weather::$weather_data */

        // location set filed open
        _is_location_open: false,



        /**
         * Init the class, we hook the click event
         */
        init: function () {

            // weather location button click
            jQuery('.td-icons-location').click(function() {
                if (tdWeather._currentRequestInProgress === true) {
                    return;
                }
                tdWeather._currentRequestInProgress = true;

                // get the block id
                tdWeather._currentItem = tdWeather._getItemByBlockID(jQuery(this).data('block-uid'));

                // get the position + callback
                var timeoutVal = 10 * 1000 * 1000;
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        tdWeather._updateLocationCallback,
                        tdWeather._displayLocationApiError,
                        {enableHighAccuracy: true, timeout: timeoutVal, maximumAge: 600000});
                }

                tdWeather._currentRequestInProgress = false;

            });

            jQuery('.td-weather-now').click(function(){
                if (tdWeather._currentRequestInProgress === true) {
                    return;
                }
                tdWeather._currentRequestInProgress = true;

                // get the block id
                tdWeather._currentItem = tdWeather._getItemByBlockID(jQuery(this).data('block-uid'));

                if (tdWeather._currentItem.current_unit === 1) {
                    tdWeather._currentItem.current_unit = 0;
                } else {
                    tdWeather._currentItem.current_unit = 1;
                }
                tdWeather._renderCurrentItem();
            });

            /**
             *  set manual location
             *  */

            jQuery('.td-manual-location-form').submit( function(event){
                event.preventDefault();

                if (tdWeather._currentRequestInProgress === true) {
                    return;
                }

                tdWeather._currentRequestInProgress = true;

                tdWeather._currentItem = tdWeather._getItemByBlockID(jQuery(this).data('block-uid'));
                //console.debug(this);

                tdWeather._currentLocation = jQuery('input#' + jQuery(this).data('block-uid')).val();

                tdWeather._updateLocationCallback2(tdWeather._currentLocation);

                tdWeather._currentRequestInProgress = false;
                tdWeather._hide_manual_location_form();
            });


            jQuery(document).click(function(ev) {

                if ( tdWeather._is_location_open === true
                    && jQuery(ev.target).hasClass('td-location-set-input') !== true
                    && jQuery(ev.target).hasClass('td-location-set-button') !== true ) {
                    tdWeather._hide_manual_location_form();
                }

            });
        },


        /**
         * adds a new weather item
         * item.block_uid is REQUIERED, based on that id, we delete the item from the array *as of 27.4.2016 the id is not used
         * @param item object - an item is json encoded from this in PHP: @see td_weather::$weather_data
         */
        addItem: function (item) {
            tdWeather.items.push(item);
        },

        ///
        // For now it's not needed because td_weater.php does not add js if it detects td-composer
        // **
        // * Deletes an item base on blockUid.
        // * Make sure that you add block_uid to items that you expect to be deleted
        // * @param blockUid
        // */
        //deleteItem: function(blockUid) {
        //    for (var cnt = 0; cnt < tdWeather.items.length; cnt++) {
        //        if (tdWeather.items[cnt].block_uid === blockUid) {
        //            tdWeather.items.splice(cnt, 1); // remove the item from the "array"
        //            return true;
        //        }
        //    }
        //    return false;
        //},


        /**
         * 1. LOCATION api - position callback
         * @param position
         * @private
         */
        _updateLocationCallback: function(position) {
            tdWeather._currentLatitude = position.coords.latitude;
            tdWeather._currentLongitude = position.coords.longitude;
            tdWeather._currentPositionCacheKey = position.coords.latitude + '_' + position.coords.longitude; //  update the cache key for current position

            // check the cache first and avoid doing the same ajax request again
            if (tdLocalCache.exist(tdWeather._currentPositionCacheKey + '_today')) {
                tdWeather._owmGetTodayDataCallback(tdLocalCache.get(tdWeather._currentPositionCacheKey + '_today'));
            } else {
                var weather = 'http://api.openweathermap.org/data/2.5/weather?lat=' + tdWeather._currentLatitude + '&lon=' + tdWeather._currentLongitude + '&units=metric&lang=' + tdWeather._currentItem.api_language + '&appid=' + tdWeather._currentItem.api_key;
                jQuery.ajax({
                    dataType: "jsonp",
                    url: weather,
                    success: tdWeather._owmGetTodayDataCallback,
                    cache: true
                });
            }

            //alert(position.coords.latitude + ' ' + position.coords.longitude);

        },


        /**
         * 2. AJAX callback for today forecast, this also makes a call to ajax 5 days forecast
         * @param data - OWM api response - NOTICE: We don't check anything if it's correct :)
         * @private
         */
        _owmGetTodayDataCallback: function (data) {
            // save the data to localCache
            tdLocalCache.set(tdWeather._currentPositionCacheKey + '_today', data);


            // prepare the tdWeather._currentItem object, notice that tdWeather._currentItem is a reference to an object stored in tdWeather.items
            tdWeather._currentItem.api_location = data.name;
            tdWeather._currentItem.today_clouds = tdUtil.round(data.clouds.all);
            tdWeather._currentItem.today_humidity = tdUtil.round(data.main.humidity);
            tdWeather._currentItem.today_icon = tdWeather._icons[data.weather[0].icon];
            tdWeather._currentItem.today_icon_text = data.weather[0].description;
            tdWeather._currentItem.today_max[0] = tdUtil.round(data.main.temp_max, 1);                                  //celsius
            tdWeather._currentItem.today_max[1] = tdWeather._celsiusToFahrenheit(data.main.temp_max);                   //imperial
            tdWeather._currentItem.today_min[0] = tdUtil.round(data.main.temp_min, 1);                                  //celsius
            tdWeather._currentItem.today_min[1] = tdWeather._celsiusToFahrenheit(data.main.temp_min);                   //imperial
            tdWeather._currentItem.today_temp[0] = tdUtil.round(data.main.temp, 1);                                     //celsius
            tdWeather._currentItem.today_temp[1] = tdWeather._celsiusToFahrenheit(data.main.temp);                      //imperial
            tdWeather._currentItem.today_wind_speed[0] = tdUtil.round(data.wind.speed, 1);                              //metric
            tdWeather._currentItem.today_wind_speed[1] = tdWeather._kmphToMph(data.wind.speed);                         //imperial

            //console.log(tdWeather._currentItem);
            //console.log(data);

            // check the cache first and avoid doing the same ajax request again
            if (tdLocalCache.exist(tdWeather._currentPositionCacheKey)) {
                tdWeather._owmGetFiveDaysData(tdLocalCache.get(tdWeather._currentPositionCacheKey));
            } else {
                var weather = 'http://api.openweathermap.org/data/2.5/forecast/daily?lat=' + tdWeather._currentLatitude + '&lon=' + tdWeather._currentLongitude + '&units=metric&lang=' + tdWeather._currentItem.api_language + '&appid=' + tdWeather._currentItem.api_key;
                //console.log('forecast: ' + weather);
                jQuery.ajax({
                    dataType: "jsonp",
                    url: weather,
                    success: tdWeather._owmGetFiveDaysData,
                    cache:true
                });
            }

        },


        /**
         * 3. AJAX callback for the 5 days forecast
         * @param data - OWM api response NOTICE: We don't check anything if it's correct :)
         * @private
         */
        _owmGetFiveDaysData: function (data) {
            // save the data to localCache
            tdLocalCache.set(tdWeather._currentPositionCacheKey, data);

            // process the data
            for (var item_index = 0; item_index < tdWeather._currentItem.forecast.length ; item_index++) {
                var current_forecast = tdWeather._currentItem.forecast[item_index];
                current_forecast.day_temp[0] = tdUtil.round(data.list[current_forecast.owm_day_index].temp.day);        //celsius
                current_forecast.day_temp[1] = tdWeather._celsiusToFahrenheit(current_forecast.day_temp[0]);            //imperial
            }
            tdWeather._renderCurrentItem();
        },


        /**
         * 4. Here we render the global tdWeather._currentItem object to the screen. The object already contains all the needed information
         * about where and what we have to render.
         * @private
         */
        _renderCurrentItem: function () {

            //console.log('.' + tdWeather._currentItem.block_uid + ' .td-weather-city');

            var blockInner = jQuery('#' + tdWeather._currentItem.block_uid);

            var currentLatitude = tdWeather._currentLatitude;
            var currentLongitude = tdWeather._currentLongitude;
            var currentLocation = tdWeather._currentLocation;

            // city
            blockInner.find('.td-weather-city').html(tdWeather._currentItem.api_location);

            if (currentLocation === '' && ( currentLatitude === 0 && currentLongitude === 0)){
                blockInner.find('.td-weather-city').html(tdWeather._currentItem.location);
            }

            // conditions
            blockInner.find('.td-weather-condition').html(tdWeather._currentItem.today_icon_text);

            // animation
            // we remove all the classes! including the animation ones
            var icon_el = blockInner.find('.td-w-today-icon');
            icon_el.removeClass();
            icon_el.addClass('td-w-today-icon');
            icon_el.addClass(tdWeather._currentItem.today_icon);

            var currentTempUnit = tdWeather._currentItem.current_unit;
            var currentSpeedLabel = 'kmh';
            var currentTempLabel = 'C';

            // preapare the labels
            if (currentTempUnit === 1) {
                currentSpeedLabel = 'mph';
                currentTempLabel = 'F';
            }


            // main temp
            blockInner.find('.td-big-degrees').html(tdWeather._currentItem.today_temp[currentTempUnit]);

            // main temp units
            blockInner.find('.td-weather-unit').html(currentTempLabel);


            // high
            blockInner.find('.td-w-high-temp').html(tdWeather._currentItem.today_max[currentTempUnit]);

            // low
            blockInner.find('.td-w-low-temp').html(tdWeather._currentItem.today_min[currentTempUnit]);

            // humidity
            blockInner.find('.td-w-today-humidity').html(tdWeather._currentItem.today_humidity + '%');

            // wind speed
            blockInner.find('.td-w-today-wind-speed').html(tdWeather._currentItem.today_wind_speed[currentTempUnit] + currentSpeedLabel);

            // clouds
            blockInner.find('.td-w-today-clouds').html(tdWeather._currentItem.today_clouds + '%');

            // full list of items! - just the temperature
            for (var item_index = 0; item_index < tdWeather._currentItem.forecast.length ; item_index++) {
                blockInner.find('.td-degrees-' + item_index).html(tdWeather._currentItem.forecast[item_index].day_temp[currentTempUnit]);
            }


            tdWeather._currentRequestInProgress = false; // allow other requests to take place
        },


        /**
         * gets a weather item based on block_uid
         * @param block_uid
         * @returns {*}
         * @private
         */
        _getItemByBlockID: function (block_uid) {
            for (var item_index = 0; item_index < tdWeather.items.length; item_index++) {
                if (tdWeather.items[item_index].block_uid === block_uid) {
                    return tdWeather.items[item_index];
                }
            }
            return false;
        },


        /**
         * Displays a friendly error when the location api fails
         * @param error - a location api error object?
         * @private
         */
        _displayLocationApiError: function (error) {

            if (error.code === 1) {
                if (tdDetect.isAndroid) {

                    //show manual location form
                    tdWeather._show_manual_location_form();

                    //alert('Please enable your gps and reload the page.');
                }

                else if (tdDetect.isIos) {
                    alert("Please enable Location services for Safari Websites and reload the page. \n ---------------------- \nSettings > Privacy > Location Services");
                    return;
                }

                //alert("Permission denied. Enable GPS or Location services and reload the page");
                //show manual location form
                tdWeather._show_manual_location_form();
            }

            //show manual location form
            tdWeather._show_manual_location_form();
        },


        /**
         * C to F converter. It rounds on big F numbers because we don't have space on the UI.
         * @param celsiusDegrees
         * @returns {*}
         * @private
         */
        _celsiusToFahrenheit: function (celsiusDegrees) {
            var f_degrees = celsiusDegrees * 9 / 5 + 32;

            var rounded_val = tdUtil.round(f_degrees, 1);
            if (rounded_val > 99.9) {  // if the value is bigger than 100, round it
                return tdUtil.round(f_degrees);
            }

            return rounded_val;
        },

        /**
         * converter for KMH -> MPH  ex: 2.3
         * @param $kmph
         * @returns {*}
         * @private
         */
        _kmphToMph: function ($kmph) {
            return tdUtil.round($kmph * 0.621371192, 1);
        },

        /**
         * *************************************************************************************************************
         *      set manual location for weather widget
         * *************************************************************************************************************
         */

        /**
         * shows the manual location form
         */

        _show_manual_location_form: function (){

            tdWeather._currentItem = tdWeather._getItemByBlockID(tdWeather._currentItem.block_uid);

            jQuery('#' + tdWeather._currentItem.block_uid).find('.td-weather-set-location').addClass( 'td-show-location' );
            jQuery('.td-manual-location-form input').focus();

            tdWeather._is_location_open = true;

        },

        /**
         * hides the manual location form
         */

        _hide_manual_location_form: function (){

            jQuery('#' + tdWeather._currentItem.block_uid).find('.td-weather-set-location').removeClass('td-show-location');

            tdWeather._is_location_open = false;
        },

        /**
         *  Location API - position callback 2 - used on chrome or other browsers that do not allow current position retrieving
         * @param location
         */

        _updateLocationCallback2: function(location){

            tdWeather._currentLocationCacheKey = location;

            // check the cache first and avoid doing the same ajax request again
            if (tdLocalCache.exist(tdWeather._currentLocationCacheKey + '_today')) {
                tdWeather._owmGetTodayDataCallback2(tdLocalCache.get(tdWeather._currentLocationCacheKey + '_today'));

            } else {

                //console.log('city weather api request!');
                var weather = 'http://api.openweathermap.org/data/2.5/weather?q=' + encodeURIComponent(location) + '&lang=' + tdWeather._currentItem.api_language + '&units=metric&appid=' + tdWeather._currentItem.api_key;

                //console.log('city api request url: ' + weather);

                jQuery.ajax({
                    dataType: "jsonp",
                    url: weather,
                    success: tdWeather._owmGetTodayDataCallback2,
                    cache: true
                });
            }
        },


        /**
         * AJAX callback for today forecast on manual city location api request
         * @param data - OWM api response
         *
         */

        _owmGetTodayDataCallback2: function (data) {
            // save the data to localCache
            tdLocalCache.set(tdWeather._currentLocationCacheKey + '_today', data);


            // prepare the tdWeather._currentItem object, notice that tdWeather._currentItem is a reference to an object stored in tdWeather.items
            tdWeather._currentItem.api_location = data.name;
            tdWeather._currentItem.today_clouds = tdUtil.round(data.clouds.all);
            tdWeather._currentItem.today_humidity = tdUtil.round(data.main.humidity);
            tdWeather._currentItem.today_icon = tdWeather._icons[data.weather[0].icon];
            tdWeather._currentItem.today_icon_text = data.weather[0].description;
            tdWeather._currentItem.today_max[0] = tdUtil.round(data.main.temp_max, 1);                                  //celsius
            tdWeather._currentItem.today_max[1] = tdWeather._celsiusToFahrenheit(data.main.temp_max);                   //imperial
            tdWeather._currentItem.today_min[0] = tdUtil.round(data.main.temp_min, 1);                                  //celsius
            tdWeather._currentItem.today_min[1] = tdWeather._celsiusToFahrenheit(data.main.temp_min);                   //imperial
            tdWeather._currentItem.today_temp[0] = tdUtil.round(data.main.temp, 1);                                     //celsius
            tdWeather._currentItem.today_temp[1] = tdWeather._celsiusToFahrenheit(data.main.temp);                      //imperial
            tdWeather._currentItem.today_wind_speed[0] = tdUtil.round(data.wind.speed, 1);                              //metric
            tdWeather._currentItem.today_wind_speed[1] = tdWeather._kmphToMph(data.wind.speed);                         //imperial


            // check the cache first and avoid doing the same ajax request again
            if (tdLocalCache.exist(tdWeather._currentLocationCacheKey)) {
                tdWeather._owmGetFiveDaysData2(tdLocalCache.get(tdWeather._currentLocationCacheKey));

            } else {

                //console.log('api forecast request!');

                var weather = 'http://api.openweathermap.org/data/2.5/forecast/daily?q=' + tdWeather._currentItem.api_location + '&lang=' + tdWeather._currentItem.api_language + '&units=metric&cnt=7&appid=' + tdWeather._currentItem.api_key;

                //console.log('city forecast api request url: ' + weather);

                jQuery.ajax({
                    dataType: "jsonp",
                    url: weather,
                    success: tdWeather._owmGetFiveDaysData2,
                    cache:true
                });
            }

        },


        /**
         * AJAX callback for 5 days forecast on manual city location api request
         * @param data - OWM api response
         *
         */

        _owmGetFiveDaysData2: function (data) {
            // save the data to localCache
            tdLocalCache.set(tdWeather._currentLocationCacheKey, data);

            /**
             * ---------------------------------------------------------------------------------------------------
             * go through the api data list and increment the counter when we find a past day or the same as today
             * ---------------------------------------------------------------------------------------------------
             */
            var counter = 0;
            for (var list_item_index = 0; list_item_index <  data.list.length ; list_item_index++) {

                var timestamp = data.list[list_item_index].dt;
                //console.log(timestamp);

                //the forecast day in a 'easy to read' format - for testing purposes
                var forecast_day_format = td_date_i18n('Y m d, H:i a, T', timestamp);
                //console.log(forecast_day_format);

                var today_date = td_date_i18n('Ymd');
                var forecast_day = td_date_i18n('Ymd', timestamp);

                // compare today with the forecast date in the format 20150210, today must be smaller
                if (today_date >= forecast_day){
                    counter = counter + 1;
                }

            }

            /**
             * --------------------------------------------------------------------------------------------------
             * check the data and set the current forecast day index accordingly
             * --------------------------------------------------------------------------------------------------
             */
            for (var item_index = 0; item_index < tdWeather._currentItem.forecast.length ; item_index++) {
                var current_forecast = tdWeather._currentItem.forecast[item_index];

                //daca indexul ii pe 1 si trebuie trecut pe 2
                if (item_index === 0 && counter > 1 && current_forecast.owm_day_index < 2){
                    var current_forecast_owm_day_index_update_status_2 = true;
                }

                //daca trebuie setat pe 2 actulizeaza indexul curent
                if (current_forecast_owm_day_index_update_status_2) {
                    current_forecast.owm_day_index = current_forecast.owm_day_index + 1;
                }

                //daca e pe 2 si trebuie trecut pe 1
                if (item_index === 0 && counter < 2 && current_forecast.owm_day_index > 1){
                    var current_forecast_owm_day_index_update_status_1 = true;
                }

                //daca trebuie setat pe 1 actulizeaza indexul curent
                if (current_forecast_owm_day_index_update_status_1) {
                    current_forecast.owm_day_index = current_forecast.owm_day_index - 1;
                }

                current_forecast.day_temp[0] = tdUtil.round(data.list[current_forecast.owm_day_index].temp.day);        //celsius
                current_forecast.day_temp[1] = tdWeather._celsiusToFahrenheit(current_forecast.day_temp[0]);            //imperial
            }
            tdWeather._renderCurrentItem();
        }

    };  // end tdWeather
})();

tdWeather.init(); //init the class