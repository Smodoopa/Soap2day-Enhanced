// ==UserScript==
// @name         SOAPTV Autoplay
// @namespace    https://soap2day.ac/*
// @version      0.5
// @description  I just wanna sleep!
// @author       Justin Slocum
// @match        https://soap2day.ac/*
// @icon         https://www.google.com/s2/favicons?domain=google.com
// @require      https://code.jquery.com/jquery-2.1.4.min.js
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @resource     IMPORTED_CSS https://raw.githubusercontent.com/Smodoopa/Soap2day-Enhanced/main/style.css
// ==/UserScript==

(function() {
    'use strict';
    const my_css = GM_getResourceText("IMPORTED_CSS"),
          x_img = 'https://raw.githubusercontent.com/Smodoopa/Soap2day-Enhanced/main/resources/x.png',
          up_img = 'https://raw.githubusercontent.com/Smodoopa/Soap2day-Enhanced/main/resources/up-arrow.png',
          down_img = 'https://raw.githubusercontent.com/Smodoopa/Soap2day-Enhanced/main/resources/down-arrow.png';

    GM_addStyle(my_css);

    if (!localStorage.getItem('autoplay')) localStorage.setItem('autoplay', 'false');
    if (!localStorage.getItem('autoplay')) localStorage.setItem('theatermode', 'false');

    const waitForPlayer = setInterval(() => {
        var isAutoPlayOn = JSON.parse(localStorage.getItem('autoplay'));
        

        if (!isAutoPlayOn) clearInterval(waitForPlayer);

        if ($('.jw-video').length > 0) {
                clearInterval(waitForPlayer);
                document.getElementById('player').scrollIntoView();
                //$('#divTurnOff').click();
                $('.jw-video').get(0).play();
                listenForEndOfMedia;
                initTheaterBTN();
                console.log('[SOAPTV AutoPlay] Autoplay initiated.');
        }

    }, 1000);


    // ------------------------------------------------------
    // ------------------------------------------------------
    // ------------------------------------------------------

    const addToQueue = () => {
        var myQueue = JSON.parse(localStorage.getItem('myQueue'));

        myQueue.push([$('#t1').text(), window.location.href]);

        localStorage.setItem("myQueue", JSON.stringify(myQueue));
    }

    const addQueueBtnSearch = () => {
        var searchResults = $('.thumbnail div:nth-child(2) > h5').toArray();

        searchResults.forEach(item => {
            $(item).append('<button class="searchAddQueueBtn">+</button>');
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

    const loadQueueModal = () => {
         var queue = JSON.parse(localStorage.getItem('myQueue'));

         queue.forEach((item, index) => {
            if (index == 0) {
                $('.queue-table tr:last').after(`<tr style="background: #1706a940;"><td>${index + 1}</td><td class="queueTableRowData"><a href="${item[1]}">${item[0]}</a><div class="upNextLabel">Up Next</div><div id="btnQueueDown" class="btnQueueTable"><img src="${down_img}" /></div><div id="btnQueueUp" class="btnQueueTable"><img src="${up_img}" /></div><div id="btnQueueDelete" class="btnQueueTable"><img src="${x_img}" /></div></td></tr>`);
            } else {
                $('.queue-table tr:last').after(`<tr><td>${index + 1}</td><td class="queueTableRowData"><a href="${item[1]}">${item[0]}</a><div id="btnQueueDown" class="btnQueueTable"><img src="${down_img}" /></div><div id="btnQueueUp" class="btnQueueTable"><img src="${up_img}" /></div><div id="btnQueueDelete" class="btnQueueTable"><img src="${x_img}" /></div></td></tr>`);
            }
         });

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
         $('.content').toggleClass('blurred');
         $('body').toggleClass('noscroll');
    }

    const closeQueueModal = () => {
            $('.queue-modal').hide();
            $('.content').toggleClass('blurred');
            $('.queue-table').html('<tbody><tr class="queue-table-headers"><th>Order</th><th>Name</th></tr></tbody>');
            $('body').toggleClass('noscroll');
    }

    const initTheaterBTN = () => {
        $(".jw-button-container").insertAt(12, '<div id="btnTheater">THEATER MODE</div>');
        $('#btnTheater').click(() => {
            localStorage.setItem('theatermode', !JSON.parse(localStorage.getItem('theatermode')));
            $('.panel-player').toggleClass("theatermode");
            $('#player').toggleClass("player_theater");
            $('body').toggleClass("theatermode_body");
        });

        if (JSON.parse(localStorage.getItem('theatermode'))) {
            $('.panel-player').addClass("theatermode");
            $('#player').addClass("player_theater");
            $('body').addClass("theatermode_body");
        }
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

        closeQueueModal();
        loadQueueModal();
    }

    // ------------------------------------------------------
    // ------------------------------------------------------
    // ------------------------------------------------------

    setTimeout(() => {
        // Bypasses Idle check.
        if (window.location.href.includes("enter.html")) {
            document.getElementById('btnhome').click();
        } 
        else if (window.location.href.includes("/search/keyword/")) {
            addQueueBtnSearch();
        }
        else {

            $.fn.insertAt = function(index, element) {
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

            $('body').prepend('<div class="queue-modal"><div class="queue-modal-content"><div class="queue-details"><div class="server-header"><h3 class="header-text">My Queue</h3><div class="close-btn">X</div></div><table class="queue-table"><tbody><tr class="queue-table-headers"><th>Order</th><th>Name</th></tr></tbody></table><div class="queue-button-panel"><div id="btnQueueClear" class="btn btn-primary">Clear Queue</div><div id="btnShuffleQueue" class="btn btn-primary">Shuffle</div></div></div></div></div>');
            
            $('.navbar-nav').prepend('<li><a href="/"><img src="https://soap2day.ac/pic/title.png" style="width: 89px;height: 20px;"></a></li>');
            $('#divPlayerSelect').append('<div id="btnAutoPlay" class="btn btn-primary">Auto-Play</div>');
            $('#divPlayerSelect').append('<div id="btnFlip" class="btn btn-primary">Flip</div>');
            $('#divPlayerSelect').append('<div id="btnZachMode" class="btn btn-primary"><img src="https://i.imgur.com/bPmmuES.png"></div>');
            $('#divPlayerSelect').append('<span style="margin-left: 15px;font-weight: 900;">|</span>');
            $('#divPlayerSelect').append('<div id="btnQueue" class="btn btn-primary">My Queue</div>');
            $('#divPlayerSelect').append('<div id="btnQueueAdd" class="btn btn-primary">+</div>');
            $('#divPlayerSelect').append('<span style="margin-left: 15px;font-weight: 900;">|</span>');
            $('#divPlayerSelect').append('<div id="btnAddAllEpisodes" class="btn btn-primary">Add All Episodes</div>');

            $('.navbar-nav').append('<li class="btnSearch"><i class="fa fa-search"></i></li>');

            $('.btnSearch').click(() => {
                if ($('.navbar-form').css('display') == 'block') {
                    $('.navbar-nav').css('width', '100%');
                } else {
                    $('.navbar-nav').css('width', '80%');
                }
                $('.navbar-form').toggle()
            });

            $('body > div:nth-child(9)').addClass('tricks');
            
            $('#btnFlip').click(() => {
                $('.content').toggleClass('flipped');
                setTimeout(() => document.getElementById('player').scrollIntoView(), 600);
            });

            $('#btnZachMode').click(() => {
                $('.content').toggleClass('zachMode');
            });

            $(window).scroll(() => {
                if ($(window).scrollTop() == 0) {
                    $('.navbar-default').show();
                } else {
                    $('.navbar-default').hide();
                    $('.navbar-nav').css('width', '100%');
                    if ($('.navbar-form').css('display') == 'block') $('.navbar-form').toggle()
                }
            });

            $('#btnQueueAdd').click(() => {
                addToQueue();
            });

            $('#btnQueue').click(() => {
                loadQueueModal();
            });

            $('.close-btn').click(() => {
                closeQueueModal();
            });

            $('#btnQueueClear').click(() => {
                localStorage.setItem('myQueue', '[]');
                closeQueueModal();
                loadQueueModal();
            });

            $('#btnShuffleQueue').click(() => {
                shuffleQueue();
            });

            $('#btnAddAllEpisodes').click(() => {
                addAllEpisodesToQueue();
            });

            // Search Button
            //$('.form-control').eq(0).attr('id', 'search-boxx');
            $
            
            ('.btnSearch').click(() => {
                document.getElementById("search-boxx").focus();
            });

            if (JSON.parse(localStorage.getItem('autoplay'))) $('#btnAutoPlay').addClass("autoPlayActive");

            $('#btnAutoPlay').click(() => {
                localStorage.setItem('autoplay', !JSON.parse(localStorage.getItem('autoplay')));
                $('#btnAutoPlay').toggleClass('autoPlayActive');
            });

            if (!localStorage.getItem('myQueue')) localStorage.setItem('myQueue', '[]');

            if (JSON.parse(localStorage.getItem('autoplay'))) waitForPlayer;
        }
    }, 2500);
})();