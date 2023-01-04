// ==UserScript==
// @name         SOAP Enhanced
// @namespace    https://soap2day.ac/*
// @version      1.001
// @description  I just wanna sleep!
// @author       Justin Slocum
// @match        https://soap2day.ac/*
// @icon         https://www.google.com/s2/favicons?domain=google.com
// @require      https://code.jquery.com/jquery-2.1.4.min.js
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @resource     IMPORTED_CSS https://raw.githubusercontent.com/Smodoopa/Soap2day-Enhanced/main/style.css
// ==/UserScript==

(function () {
    'use strict';
    const my_css = GM_getResourceText("IMPORTED_CSS"),
        x_img = 'https://raw.githubusercontent.com/Smodoopa/Soap2day-Enhanced/main/resources/x.png',
        up_img = 'https://raw.githubusercontent.com/Smodoopa/Soap2day-Enhanced/main/resources/up-arrow.png',
        down_img = 'https://raw.githubusercontent.com/Smodoopa/Soap2day-Enhanced/main/resources/down-arrow.png',
        siteRootPath = 'https://soap2day.ac/';

    GM_addStyle(my_css);

    if (!localStorage.getItem('autoplay')) localStorage.setItem('autoplay', 'false');

    const waitForPlayer = setInterval(() => {
        var isAutoPlayOn = JSON.parse(localStorage.getItem('autoplay'));


        if (!isAutoPlayOn) clearInterval(waitForPlayer);

        if ($('.jw-video').length > 0) {
            clearInterval(waitForPlayer);
            document.getElementById('player').scrollIntoView();
            //$('#divTurnOff').click();
            $('.jw-video').get(0).play();
            listenForEndOfMedia;
            console.log('[SOAPTV AutoPlay] Autoplay initiated.');
        }

    }, 1000);


    // ------------------------------------------------------
    // ---------------------Favorites------------------------
    // ------------------------------------------------------

    const addToFavorites = (text, url) => {
        var myFavorites = JSON.parse(localStorage.getItem('myFavorites'));

        myFavorites.push([text, url]);

        localStorage.setItem("myFavorites", JSON.stringify(myFavorites));
        triggerNoticiation(`${text} successfully added to your favorites!`);
    }

    const loadFavoritesList = () => {
        var myFavorites = JSON.parse(localStorage.getItem('myFavorites'));

        unloadQueueItems();

        myFavorites.forEach((item, index) => {
            if (index == 0) {
                $('.queue-table tr:last').after(`<tr style="background: #a3a3a340;"><td>${index + 1}</td><td class="queueTableRowData"><a href="${item[1]}">${item[0]}</a><div class="upNextLabel">Up Next</div><div id="btnQueueDown" class="btnQueueTable"><img src="${down_img}" /></div><div id="btnQueueUp" class="btnQueueTable"><img src="${up_img}" /></div><div id="btnQueueDelete" class="btnQueueTable"><img src="${x_img}" /></div></td></tr>`);
            } else {
                $('.queue-table tr:last').after(`<tr><td>${index + 1}</td><td class="queueTableRowData"><a href="${item[1]}">${item[0]}</a><div id="btnQueueDown" class="btnQueueTable"><img src="${down_img}" /></div><div id="btnQueueUp" class="btnQueueTable"><img src="${up_img}" /></div><div id="btnQueueDelete" class="btnQueueTable"><img src="${x_img}" /></div></td></tr>`);
            }
        });
    }

    // ------------------------------------------------------
    // ---------------------Queue Management-----------------
    // ------------------------------------------------------

    const addToQueue = (text, url) => {
        var myQueue = JSON.parse(localStorage.getItem('myQueue'));

        myQueue.push([text, url]);

        localStorage.setItem("myQueue", JSON.stringify(myQueue));
        triggerNoticiation(`${text} successfully added to your queue!`);
    }

    const addQueueBtnSearch = () => {
        var searchResults = $('.thumbnail div:nth-child(2) > h5').toArray();

        searchResults.forEach(item => {
            let searchTitle = $(item).eq(0).find('a').eq(0).text(),
                searchUrl = siteRootPath + $(item).find('a:first').attr('href');
            $(item).append(`<button title="${searchTitle}" url="${searchUrl}" class="searchAddQueueBtn">+</button>`);
        });

        $('.searchAddQueueBtn').click(e => {
            addToQueue($(e.target).eq(0).attr('title'), $(e.target).eq(0).attr('url'));
        });
    }

    const addAllEpisodesToQueue = () => {
        var myQueue = JSON.parse(localStorage.getItem('myQueue'));

        var EpisodeObjList = [];

        Array.from($('.col-md-6')).forEach(episode => {

            var episodeObj = $(episode)[0].firstChild;

            var episodeLink = $(episodeObj)[0].href;


            EpisodeObjList.push([episode.outerText, episodeLink]);
        });

        EpisodeObjList.forEach(episodeObj => {
            myQueue.push(episodeObj);
        });

        localStorage.setItem("myQueue", JSON.stringify(myQueue));
    }

    const triggerNoticiation = (notifMessage) => {
        var notifId = `notif${Math.floor(Math.random() * 5000)}`
        $('body').prepend(`<div id=${notifId} class="pageNotification"></div>`);
        var notificationClass = '.pageNotification';
        $(notificationClass).text(notifMessage);
        $(notificationClass).css('opacity', 1);
        setTimeout(() => {
            $(notificationClass).css('opacity', 0); 
        }, 2000);
        setTimeout(() => {
            $(`#${notifId}`).remove();
        }, 3000);
    }

    const loadQueueModal = () => {
        var queue = JSON.parse(localStorage.getItem('myQueue'));

        queue.forEach((item, index) => {
            if (index == 0) {
                $('.queue-table tr:last').after(`<tr style="background: #a3a3a340;"><td>${index + 1}</td><td class="queueTableRowData"><a href="${item[1]}">${item[0]}</a><div class="upNextLabel">Up Next</div><div id="btnQueueDown" class="btnQueueTable"><img src="${down_img}" /></div><div id="btnQueueUp" class="btnQueueTable"><img src="${up_img}" /></div><div id="btnQueueDelete" class="btnQueueTable"><img src="${x_img}" /></div></td></tr>`);
            } else {
                $('.queue-table tr:last').after(`<tr><td>${index + 1}</td><td class="queueTableRowData"><a href="${item[1]}">${item[0]}</a><div id="btnQueueDown" class="btnQueueTable"><img src="${down_img}" /></div><div id="btnQueueUp" class="btnQueueTable"><img src="${up_img}" /></div><div id="btnQueueDelete" class="btnQueueTable"><img src="${x_img}" /></div></td></tr>`);
            }
        });

        $('#btnFav').click(e => { loadFavoritesList() });

        $('.queueTableRowData > #btnQueueDelete').click(e => {
            var myQueue = JSON.parse(localStorage.getItem('myQueue'));
            myQueue.splice($(e.target.parentElement.parentElement).index() - 1, 1);
            localStorage.setItem("myQueue", JSON.stringify(myQueue));
            closeQueueModal();
            loadQueueModal();
        });

        $('.queueTableRowData > #btnQueueUp').click(e => {
            var myQueue = JSON.parse(localStorage.getItem('myQueue')),
                rowToMove = $(e.target.parentElement.parentElement).index() - 1;

            if (rowToMove == 0) return;

            let movedRowDataTemp = myQueue[rowToMove];
            myQueue[rowToMove] = myQueue[rowToMove - 1];
            myQueue[rowToMove - 1] = movedRowDataTemp;

            localStorage.setItem("myQueue", JSON.stringify(myQueue));

            closeQueueModal();
            loadQueueModal();
        });

        $('.queueTableRowData > #btnQueueDown').click(e => {
            var myQueue = JSON.parse(localStorage.getItem('myQueue')),
                rowToMove = $(e.target.parentElement.parentElement).index() - 1;

            if (rowToMove == (myQueue.length - 1)) return;

            let movedRowDataTemp = myQueue[rowToMove];
            myQueue[rowToMove] = myQueue[rowToMove + 1];
            myQueue[rowToMove + 1] = movedRowDataTemp;

            localStorage.setItem("myQueue", JSON.stringify(myQueue));

            closeQueueModal();
            loadQueueModal();
        });

        $('.queue-modal').css('display', 'flex');
        $('body').toggleClass('noscroll');
    }

    const unloadQueueItems = () => {
        $('.queue-table tbody tr:not(:first)').remove();
    }

    const closeQueueModal = () => {
        $('.queue-modal').hide();
        $('.queue-table').html('<tbody><tr class="queue-table-headers"><th>Order</th><th>Name</th></tr></tbody>');
        $('body').toggleClass('noscroll');
    }

    const quickQueueSearch = (searchQuery) => {
        fetch(`https://soap2day.ac/search/keyword/${encodeURIComponent(searchQuery)}`)
            .then(function (response) {
                return response.text()
            })
            .then(function (html) {
                var parser = new DOMParser();

                var doc = parser.parseFromString(html, "text/html");

                var quickSearchResult = $(doc).find('.thumbnail div:nth-child(2) > h5 > a').toArray()[0];

                if (quickSearchResult !== null) {
                    addToQueue(quickSearchResult.text, quickSearchResult.href);
                    $('.quickAddInput').val('');
                    closeQueueModal();
                    loadQueueModal();
                }

            })
            .catch(function (err) {
                console.log('Failed to fetch page: ', err);
            });
    }

    const listenForEndOfMedia = setInterval(() => {
        var elapsedSeconds, durationSeconds;

        var elapsed = $('div.jw-icon.jw-icon-inline.jw-text.jw-reset.jw-text-elapsed').text(),
            duration = $('.jw-text-duration').text();

        var a = elapsed.split(':'),
            b = duration.split(':');

        //Repeat code. Gross. I have to go to bed. :(
        if (a.length == 3) elapsedSeconds = ((parseInt(a[0]) * 60) * 60) + (parseInt(a[1]) * 60) + parseInt(a[2]);
        if (a.length == 2) elapsedSeconds = (parseInt(a[0]) * 60) + parseInt(a[1]);
        if (a.length == 1) elapsedSeconds = parseInt(a[0]);

        if (b.length == 3) durationSeconds = ((parseInt(b[0]) * 60) * 60) + (parseInt(b[1]) * 60) + parseInt(b[2]);
        if (b.length == 2) durationSeconds = (parseInt(b[0]) * 60) + parseInt(b[1]);
        if (b.length == 1) durationSeconds = parseInt(b[0]);

        if ((durationSeconds - elapsedSeconds) == 5) playNextInQueue();
    }, 1000);

    const playNextInQueue = () => {
        var queue = JSON.parse(localStorage.getItem('myQueue'));

        if (queue.length < 1) return;

        var nextMedia = queue.shift();
        localStorage.setItem("myQueue", JSON.stringify(queue));

        window.location.replace(nextMedia[1]);
    }

    const shuffleQueue = () => {
        var queue = JSON.parse(localStorage.getItem('myQueue'));

        for (let i = queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [queue[i], queue[j]] = [queue[j], queue[i]];
        }

        localStorage.setItem("myQueue", JSON.stringify(queue));

        triggerNoticiation(`Queue shuffled!`);

        closeQueueModal();
        loadQueueModal();
    }

    const initSearchThumbOverlay = () => {
        let thumbOverlay = '<div class="thumb-overlay"><i class="fa fa-plus" aria-hidden="true"></i><i class="fa fa-star" aria-hidden="true"></i></div>';
        $('.thumbnail').prepend(thumbOverlay);
    }

    // ------------------------------------------------------
    // ---------------------Nav Bar--------------------------
    // ------------------------------------------------------

    const upgradeNav = () => {
        $('.navbar-nav').prepend('<li><a href="/"><img src="https://soap2day.ac/pic/title.png" style="width: 89px;height: 20px;"></a></li>');

        var queueDropDown = '<i class="fa fa-align-justify" aria-hidden="true"></i>',
            siteSearch = '<i class="fa fa-search"></i>';

        $('.navbar-nav').append(`<li class="nav-right">${queueDropDown}${siteSearch}</li>`);

        // Init Queue List
        if (!localStorage.getItem('myQueue')) localStorage.setItem('myQueue', '[]');

        // Init Favorites List
        if (!localStorage.getItem('myFavorites')) localStorage.setItem('myFavorites', '[]');

        $('body').prepend('<div class="queue-modal"><div class="queue-modal-content"><div class="queue-details"><div class="server-header"><h3 class="header-text">My Queue</h3><div class="close-btn"><i class="fa fa-times" aria-hidden="true"></i></div></div><table class="queue-table"><tbody><tr class="queue-table-headers"><th>Order</th><th>Name</th></tr></tbody></table><div class="queue-button-panel"><div id="btnFav" class="btn btn-primary"><i class="fa fa-star" aria-hidden="true"></i></div><div id="btnQueueClear" class="btn btn-primary"><i class="fa fa-trash" aria-hidden="true"></i></div><div id="btnShuffleQueue" class="btn btn-primary"><i class="fa fa-random" aria-hidden="true"></i></div><input class="quickAddInput" placeholder="Quick Add"><div class="btn btn-primary quickAddSubmit"><i class="fa fa-search" aria-hidden="true"></i></div></div></div></div></div>');

        $('.quickAddInput').submit(() => quickQueueSearch($('.quickAddInput').val()));

        $('.quickAddInput').keypress(function (e) { // On enter.
            if (e.which == 13) {
                $('.quickAddInput').submit();
                return false;
            }
        });

        $('.quickAddSubmit').click(() => $('.quickAddInput').submit());

        $('.close-btn').click(() => {
            closeQueueModal();
        });

        $('#btnQueueClear').click(() => {
            localStorage.setItem('myQueue', '[]');
            triggerNoticiation('Queue cleared!');
            closeQueueModal();
            loadQueueModal();
        });

        $('#btnShuffleQueue').click(() => {
            shuffleQueue();
        });

        // Search Nav Button
        $('.fa-search').click(() => {
            if ($('.navbar-form').css('display') == 'block') {
                $('.navbar-nav').css('width', '100%');
            } else {
                $('.navbar-nav').css('width', '80%');
            }
            $('.navbar-form').toggle()
        });

        $('.fa-align-justify').click(() => loadQueueModal());

        $(window).scroll(() => {
            if ($(window).scrollTop() == 0) {
                $('.navbar-default').show();
            } else {
                $('.navbar-default').hide();
                $('.navbar-nav').css('width', '100%');
                if ($('.navbar-form').css('display') == 'block') $('.navbar-form').toggle()
            }
        });
    }

    // ------------------------------------------------------
    // --------------------Section Init----------------------
    // ------------------------------------------------------

    const initStreamPage = () => {
        $.fn.insertAt = function (index, element) {
            var lastIndex = this.children().size();
            if (index < 0) {
                index = Math.max(0, lastIndex + 1 + index);
            }
            this.append(element);
            if (index < lastIndex) {
                this.children().eq(index).before(this.children().last());
            }
            return this;
        }

        $('#divPlayerSelect').append('<div id="btnAutoPlay" class="btn btn-primary">Auto-Play</div>');
        $('#divPlayerSelect').append('<div id="btnFlip" class="btn btn-primary">Flip</div>');
        $('#divPlayerSelect').append('<div id="btnZachMode" class="btn btn-primary"><img src="https://i.imgur.com/bPmmuES.png"></div>');
        $('#divPlayerSelect').append('<span style="margin-left: 15px;font-weight: 900;">|</span>');
        $('#divPlayerSelect').append('<div id="btnQueueAdd" class="btn btn-primary">+</div>');
        $('#divPlayerSelect').append('<span style="margin-left: 15px;font-weight: 900;">|</span>');
        $('#divPlayerSelect').append('<div id="btnAddAllEpisodes" class="btn btn-primary">Add All Episodes</div>');

        $('#btnFlip').click(() => {
            $('.content').toggleClass('flipped');
            setTimeout(() => document.getElementById('player').scrollIntoView(), 600);
        });

        $('#btnZachMode').click(() => {
            $('.content').toggleClass('zachMode');
        });

        $('#btnQueueAdd').click(() => {
            addToQueue($('#t1').text(), window.location.href);
        });

        $('#btnAddAllEpisodes').click(() => {
            addAllEpisodesToQueue();
        });

        if (JSON.parse(localStorage.getItem('autoplay'))) $('#btnAutoPlay').addClass("autoPlayActive");

        $('#btnAutoPlay').click(() => {
            localStorage.setItem('autoplay', !JSON.parse(localStorage.getItem('autoplay')));
            $('#btnAutoPlay').toggleClass('autoPlayActive');
        });

        if (JSON.parse(localStorage.getItem('autoplay'))) waitForPlayer;
    }

    // ------------------------------------------------------
    // ------------------------------------------------------
    // ------------------------------------------------------

    setTimeout(() => {
        // Bypasses Idle check.
        if (window.location.href.includes("enter.html")) {
            document.getElementById('btnhome').click();
        }
        else if (window.location.href.includes("/search/keyword/") || window.location.href.includes("/movielist/")) {
            upgradeNav();
            initSearchThumbOverlay();
            addQueueBtnSearch();
        }
        else {
            upgradeNav();
            initStreamPage();
        }
    }, 1000);
})();