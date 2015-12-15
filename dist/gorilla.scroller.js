if (!window.gorilla) {
    window.gorilla = {};
}

(function ($, gorilla) {

    /************************************
     * VARS
     ************************************/
    var root;
    var settings = {
        zIndex: 0,
        scrollDelay: 300
    };

    /************************************
     * EXPORT
     ************************************/
    gorilla.scroller = function (elem, config) {
        this.init($(elem), config || {});
    };

    $.fn.gorillaScroller = function (config) {
        return new gorilla.scroller(this, config);
    };

    /************************************
     * SECTIONS
     ************************************/
    var sections = [];

    sections.add = function(item, index, totalSections) {
        sections.push(new Section($(this), index, totalSections - index + settings.zIndex));
    };

    sections.find = function(index) {
        var dom = root.find('#gorilla-scroller-section-' + index);

        if (!dom.size()) {
            return null;
        }

        return sections.filter(function(item) {
            return item.is(dom);
        })[0];
    };

    

    /************************************
     * METHODS
     ************************************/
    gorilla.scroller.prototype.init = function (elem, config) {
        root = elem;
        $.extend(settings, config);
        console.log(settings);

        $('body').addClass('gorilla-scroller');
        root.addClass('gorilla-scroller-root');

        var sectionsDom = elem.find('> section');
        sectionsDom.each(function (index) {
            sections.add(elem, index, sectionsDom.length);
        });

        console.log(sections);
        eventConfig(root);
    };

    function eventConfig() {
        var timeout;

        $(window).mousewheel(function () {
            clearTimeout(timeout);

            if (event.deltaY > 0) {
                timeout = setTimeout(function () {
                    scrollDown();
                }, settings.scrollDelay);
                return;
            }

            timeout = setTimeout(function () {
                scrollUp();
            }, settings.scrollDelay);
        });
    }

    function scrollDown() {
        var current = getCurrentSection();

        if (!current.isScrollOnBottom()) {
            return;
        }

        if (!current.next()) {
            return;
        }

        current.active(false);
    }

    function scrollUp() {
        var current = getCurrentSection();

        if (!current.isScrollOnTop() || !current.prev()) {
            return;
        }

        current.prev().active(true);
    }

    function getCurrentSection() {
        return sections.filter(function (item) {
            return item.is(root.find('.gorilla-scroller-active').first());
        })[0];
    }

    /************************************
     * SECTIONS
     ************************************/
    var Section = function (elem, index, zIndex) {
        this.elem = elem;
        this.index = index;
        this.active(true);

        elem.addClass('gorilla-scroller-section gorilla-scroller-section-' + index);
        elem.attr('id', 'gorilla-scroller-section-' + index);
        elem.css({ 'z-index': zIndex });
    };

    Section.prototype.is = function (elem) {
        return this.elem[0] === $(elem)[0];
    }

    Section.prototype.isScrollOnTop = function () {
        return this.elem.scrollTop() === 0;
    };

    Section.prototype.isScrollOnBottom = function () {
        return this.elem.scrollTop() >= (this.elem[0].scrollHeight - this.elem.height());
    };

    Section.prototype.active = function (active) {
        if (active) {
            this.elem.addClass('gorilla-scroller-active');
            return;
        }

        this.elem.removeClass('gorilla-scroller-active');
    };

    Section.prototype.prev = function () {
        return sections.find(this.index - 1);
    }

    Section.prototype.next = function () {
        return sections.find(this.index + 1);
    }


})(jQuery, window.gorilla);