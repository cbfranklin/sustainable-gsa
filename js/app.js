if(!GSA){
    var GSA = {}
}

GSA.indexTracker;
GSA.retrieveContent = function() {
    var CIDs = ['strategically_sustainable','buildings', 'products-services', 'fleets', 'workplaces', 'policy', 'results']; // add CID numbers to this array
    for (var i=0; i<CIDs.length; i++) {
        $.ajax({
            url: 'CID/' + CIDs[i] + '.php',
            success: function(data) {
                GSA.initialDisplay(data);
                GSA.populateThumbs(data);
            },
            error : function() {
                // errorFunction();
            }
        });
    }
};

GSA.initialDisplay = function(data) {
    var response = $(data);
    var contentBlock = response.filter('#data-block').html(),
            size = $(contentBlock).find('#size').html(),
            image = $(contentBlock).find('#image').html(),
            tag = $(contentBlock).find('#tag').html(),
            title = $(contentBlock).find('#title').html(),
            excerpt = $(contentBlock).find('#excerpt').html();
            content = $(contentBlock).find('#content').html();
    var template = '<div class="col-sm-'+size+' block-wrap">'+
                        '<div class="block" style="background-image: url(images/'+image+')">'+
                            '<a data-content="ajax">'+
                                '<aside><span>'+tag+'</span></aside>'+
                                '<header>'+title+'</header>'+
                                '<article class="rollover">'+
                                    '<span class="arrow"><i class="icon-arrow-right"></i></span>'+
                                    excerpt +
                                '</article>'+
                            '</a>'+
                        '</div>'+
                        '<div class="full-display-content">'+
                           content +
                        '</div>'+
                    '</div>';

    $('.blocks-container').append(template);
    $('.block-wrap').fadeIn(500);
};

GSA.blockHover = function() {
    $("#landing").on({
        mouseenter: function () {
            $(this).find('.rollover').stop().fadeIn(500);
        },
        mouseleave: function () {
            $(this).find('.rollover').stop().fadeOut(300);
        }
    },'.block');
};

GSA.populateThumbs = function(data) {
    var response = $(data);
    var contentBlock = response.filter('#data-block').html(),
        image = $(contentBlock).find('#image').html(),
        title = $(contentBlock).find('#title').html();
    var wrapperWidth = $('.blocks-container').width(),
        thumbBlocks = wrapperWidth / 8,
        spacePadding = 6,
        blockWidth = thumbBlocks - spacePadding;

    var template = '<div class="thumb-wrap" style="width:'+blockWidth+'px">'+
        '<div class="thumb" style="background-image: url(images/'+image+')">'+
        '<header>'+title+'</header>'+
        '</div>'+
        '</div>';

    $('#thumb-nav').append(template);

    $('#thumb-nav > div:first-child').css('width', (thumbBlocks*2)-spacePadding);
};

GSA.displayThumbs = function() {
    $('#thumb-nav').children('div').each(function(i) {
        if(i == GSA.indexTracker) {
            $(this).addClass('active-thumb');
        }
       $(this).delay(i * 100).slideDown(600);
    });
}

GSA.activateBlocks = new function() {
    //disable functionality for first block click
    $('#landing').on('click','.block',function(e) {
        if($(this).parent('div').index() === 0) {
            e.preventDefault();
        } else {
            e.preventDefault();
            //maintain height of display area and get index number of clicked block
            var wrapper = $('.blocks-container');
            wrapper.height(wrapper.height());
            GSA.indexTracker = $(this).parent('div').index();

            //assign the active block and create some variables
            var activeBlock = $(this).parent('.block-wrap'),
            offsetLeft = activeBlock.position().left,
            offsetTop = activeBlock.position().top;

            // position the ACTIVE block
            activeBlock.addClass('current');
            activeBlock.css({position: 'absolute', display: 'block', left: offsetLeft, top: offsetTop});
            activeBlock.animate({left: 0, top: 0, width: '100%', height: '100%'}, 500, function () {
                // display the thumb navigation
                GSA.displayThumbs();
                $("html, body").animate({scrollTop: $('#thumb-nav').offset().top}, 500);
                // display left/right navigation
                $('.slide-section').fadeIn(500);
            });
            // apply template and style to each of the blocks hidden behind the active block
            $('.block-wrap').each(function() {
                 var title = $(this).find('header').text(),
                 label = $(this).find('aside').text(),
                 text = $(this).find('.full-display-content').html();
                 image = $(this).children('.block').css('background-image');
                 $(this).removeClass('block-wrap col-sm-3 col-sm-6').addClass('slide').html('<div class="inner-block" style="background-image:'+image+'"><aside>'+title+'</aside><header>'+label+'</header><article>'+text+'</article></div>').css({height : '100%'});
            });
        }
    });
};


GSA.toggleActiveBlocks = function() {
    var thumbBlock = '#thumb-nav > div';
    $('#landing').on('click',thumbBlock,function(e) {
        var thumbIndex = $(this).index();
        if(thumbIndex == 0) {
            GSA.resetBlocks();
        } else {
            e.preventDefault();
            $(thumbBlock).removeClass('active-thumb');
            $(this).addClass('active-thumb');
            var currentSlide = $('.blocks-container > div').eq(thumbIndex);
            currentSlide.addClass('current').fadeIn(500,function() {
                $('.current').not(currentSlide).fadeOut(300).delay(300).removeClass('current');
            });
            GSA.indexTracker = thumbIndex;
        }
    })
};

GSA.updateThumbIndex = function() {
    $('#thumb-nav > div').removeClass('active-thumb');
    $('#thumb-nav > div').eq(GSA.indexTracker).addClass('active-thumb');
};

GSA.nextSlide = function() {
    $('#landing').on('click','.slide-right', function() {
        $('.current').next('.slide').addClass('current').fadeIn(1, function() {
            $('.current').prev('.slide').removeClass('current').fadeOut(500);
        });
        GSA.indexTracker++;
        if(GSA.indexTracker == ($('.slide').length - 1)) {
            $('.slide-right').fadeOut(300);
        }
        GSA.updateThumbIndex();
    })
};

GSA.prevSlide = function() {
    $('#landing').on('click','.slide-left', function() {
        if(GSA.indexTracker == 1) {
            GSA.resetBlocks();
        } else {
            $('.current').prev('.slide').addClass('current').fadeIn(1, function () {
                $('.current').next('.slide').removeClass('current').fadeOut(500);
            });
            GSA.indexTracker--;
            if (GSA.indexTracker == ($('.slide').length - 1)) {
                $('.slide-left').fadeOut(300);
            }
            GSA.updateThumbIndex();
        }
    })
};

GSA.resetBlocks = function() {
    var thumbs = $('#thumb-nav').children('div');
    thumbs.slideUp(500,function() {
        $(this).remove();
        // display left/right navigation
        $('.slide-section').fadeOut(500);
        $('.blocks-container > *').fadeOut(500,function() {
            $(this).remove();
        });
    });
    setTimeout(function() {
        GSA.retrieveContent();
    },700);
};


/* /////////////////////////
    DOCUMENT READY        ///
/////////////////////////*/
$(function(){
    GSA.retrieveContent();
    GSA.blockHover();
    GSA.nextSlide();
    GSA.prevSlide();
    GSA.toggleActiveBlocks();
});


/* ROUTER STUFF

 var router = new Grapnel({ pushState : true });

 router.get('/OGILVY/sustainable-gsa-2/', function(req) {
 $('body').addClass('none');
 });
 router.get('/', function(req) {
 $('body').addClass('slash');
 });

 //router.navigate('/OGILVY/sustainable-gsa-2/CID/strategically_sustainable.php');
 */