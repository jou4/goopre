$(function(){
    var url = location.href;
    var id;
    if(url.match(/id=(.+)/)){
        id = RegExp.$1;
    }
    else{
        alert("invalid parameter.");
        return;
    }

    var resizeLock = null;
    var presentAttrs;
    var currentSlideIndex = 0;
    var numOfSlides = 0;
    var currentSlide;

    var slideIndexPopupTrigger = $("#footerSlideMenuContainer input");
    var slideIndexPopupVisible = false;
    var slideIndexPopup = $('<div class="footer-menu"></div>').hide().appendTo(document.body);


    // presentation

    function createPresentation(data){
        presentAttrs = data.attributes;
        document.title = presentAttrs.title;

        createSlides(data);

        $("#ToolbarPrev").click(gotoPrevSlide);
        $("#ToolbarNext").click(gotoNextSlide);

        gotoSlide(0);
    }

    function createSlides(data){
        var slides = data.children;
        var slideContainer = $("#slideFg");

        for(var slideId in slides){
            createSlide(slideContainer, slideId, slides[slideId]);
            numOfSlides++;
        }
    }

    function createSlide(slideContainer, slideId, slideData){
        var layout = slideData.attributes.layout;
        var items = slideData.children;

        var slide = $('<div class="slide"></div>').attr("id", slideId)
            .addClass(layout).css("display", "none").appendTo(slideContainer);

        for(var itemId in items){
            createItem(slide, itemId, items[itemId]);
        }

    }

    function createItem(slide, itemId, itemData){
        var attrs = itemData.attributes;
        var contentType = attrs.contentType;
        var bounds = attrs.bounds;
        var placeHolder = $('<div class="placeholder"></div>').attr("id", itemId)
            .addClass(contentType).appendTo(slide);

        if(bounds){
            placeHolder.css({
                left: bounds[0] + "%",
                top: bounds[1] + "%",
                width: bounds[2] + "%",
                height: bounds[3] + "%"
            });
        }

        switch(contentType){
            case "text":{
                if(attrs.type){
                    placeHolder.addClass(attrs.type);
                }
                else{
                    placeHolder.addClass("unknown");
                    placeHolder.css({
                        "font-size": "1.8em"
                    });
                }

                var inner = $('<div class="inner-text"></div>')
                    .attr("id", itemId + ".inner")
                    .appendTo(placeHolder);
                inner.append(attrs.contents);

                if(attrs.fontSize){
                    inner.css("font-size", attrs.fontSize + "em");
                }
                else{
                    inner.css("font-size", "1em");
                }

                if(attrs.verticalAlign){
                    placeHolder.css({
                        "display": "table"
                    });

                    inner.css({
                        "display": "table-cell",
                        "vertical-align": attrs.verticalAlign
                    });
                }

                break;
            }
            case "picture":{
                var inner = new Image();
                inner.src = presentAttrs.blobs[attrs.imageId];
                placeHolder.append(inner);
                break;
            }
        }
    }

    // pagenation

    function updatePagenation(){
        if(currentSlideIndex === 0){
            updatePrevBtn(false);
        }
        else{
            updatePrevBtn(true);
        }

        if(currentSlideIndex < numOfSlides - 1){
            updateNextBtn(true);
        }
        else{
            updateNextBtn(false);
        }
    }

    function updatePrevBtn(enabled){
        if(enabled){
            $("#ToolbarPrev").show();
            $("#ToolbarPrevDisabled").hide();
        }
        else{
            $("#ToolbarPrev").hide();
            $("#ToolbarPrevDisabled").show();
        }
    }

    function updateNextBtn(enabled){
        if(enabled){
            $("#ToolbarNext").show();
            $("#ToolbarNextDisabled").hide();
        }
        else{
            $("#ToolbarNext").hide();
            $("#ToolbarNextDisabled").show();
        }
    }

    function gotoSlide(pageIndex){
        if(pageIndex < 0 || pageIndex >= numOfSlides){
            return;
        }

        if(currentSlide){
            currentSlide.style.display = "none";
        }

        currentSlideIndex = pageIndex;
        currentSlide = $("#slideFg").children()[pageIndex];
        currentSlide.style.display = "block";

        updateSlideIndexPopupTrigger();
        updatePagenation();
    }

    function gotoPrevSlide(){
        gotoSlide(currentSlideIndex - 1);
    }

    function gotoNextSlide(){
        gotoSlide(currentSlideIndex + 1);
    }

    // popup menu
    function createSlideIndexPopup(){
        $("#slideFg .slide").each(function(i, slide){
            slide = $(slide);

            var menuItem = $('<div class="footer-menu-item"></div>')
                .click(function(){
                    gotoSlide(i);
                    hideSlideIndexPopup();
                })
                .appendTo(slideIndexPopup);
            var items;
            var caption = "";

            items = slide.find(".centeredTitle");
            if(items.length > 0){
                caption = (i+1) + ": " + $(items[0]).text();
            }

            if( ! caption){
                items = slide.find(".title");
                caption = (i+1) + ": " + $(items[0]).text();
            }

            menuItem.text(caption);
        });
    }


    function updateSlideIndexPopupTrigger(){
        slideIndexPopupTrigger.prop("value", "スライド " + (currentSlideIndex + 1) + " / " + numOfSlides);
    }

    function hideSlideIndexPopup(){
        if( ! slideIndexPopupVisible){ return; }
        slideIndexPopup.hide();
        slideIndexPopupTrigger.removeClass("footer-menu-btn-active");

        $(document).unbind("mousedown.menu-popup");

        slideIndexPopupVisible = false;
    }

    function showSlideIndexPopup(){
        if(slideIndexPopupVisible){ return; }
        slideIndexPopup.find(".footer-menu-item").each(function(i, item){
            if(i === currentSlideIndex){
                $(item).addClass("footer-menu-item-checked");
            }
            else{
                $(item).removeClass("footer-menu-item-checked");
            }
        });

        var offset = slideIndexPopupTrigger.offset();

        slideIndexPopup.css({
            left: offset.left,
            top: offset.top - slideIndexPopup.outerHeight(),
            display: "block"
        });

        slideIndexPopupTrigger.addClass("footer-menu-btn-active");

        setTimeout(function(){
            $(document).bind("mousedown.menu-popup", function(e){
                var x = e.pageX, y = e.pageY;
                var target = slideIndexPopup;
                var offset = target.offset();
                var l = offset.left;
                var r = l + target.outerWidth();
                var t = offset.top;
                var b = t + target.outerHeight();

                if(x >= l && x <= r && y >= t && y <= b){
                    return false;
                }

                hideSlideIndexPopup();
            });
        }, 0);

        slideIndexPopupVisible = true;
    }

    // etc

    function resize(){
        // スライドの高さ
        $("#main").height($(window).height() - $(".footer").height());

        // スライドの幅
        var primaryViewSlide = $("#primaryViewSlide");
        primaryViewSlide.width(primaryViewSlide.height() / 3 * 4);

        // フォントサイズの基準
        $("#slideFg").css("font-size", ($("#slideFg").height() / 30) + "pt")

        resizeLock = null;
    }


    // main process

    resize();

    var data = getSlide(id);
    createPresentation(data);
    createSlideIndexPopup();


    // bind event handlers

    $(window).resize(function(){
        if(resizeLock){
            clearTimeout(resizeLock);
            resizeLock = null;
        }
        resizeLock = setTimeout(resize, 100);
    });

    $(window).resize(hideSlideIndexPopup);

    $(document).keydown(function(e){
        switch(e.keyCode){
            case 37:
            case 38:
                gotoPrevSlide();
                break;
            case 39:
            case 40:
                gotoNextSlide();
                break;
        }
        return true;
    });

    $("#slideFg .slide").click(function(){
        gotoNextSlide();
        return true;
    });

    slideIndexPopupTrigger.mousedown(function(e){
        if(slideIndexPopupVisible){
            hideSlideIndexPopup();
        }
        else{
            showSlideIndexPopup();
        }
        return true;
    });

});
