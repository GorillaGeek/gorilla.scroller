﻿if (!window.gorilla) {
    window.gorilla = {};
}

(function ($, gorilla) {

    /************************************
     * VARS
     ************************************/
    var root;
    var navigation;
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

    sections.add = function (elem, index, totalSections) {
        sections.push(new Section(elem, index, totalSections - index + settings.zIndex));
    };

    sections.current = function () {
        return sections.filter(function (item) {
            return item.is(root.find('.gorilla-scroller-active').first());
        })[0];
    };

    sections.find = function (index) {
        var dom = root.find('#gorilla-scroller-section-' + index);

        if (!dom.size()) {
            return null;
        }

        return sections.filter(function (item) {
            return item.is(dom);
        })[0];
    };

    /************************************
     * METHODS
     ************************************/
    gorilla.scroller.prototype.init = function (elem, config) {
        root = elem;
        $.extend(settings, config);

        $('body').addClass('gorilla-scroller');
        root.addClass('gorilla-scroller-root');

        sectionsConfig();
        eventConfig();
        navigationConfig(root);
    };

    function sectionsConfig() {
        var sectionsDom = root.find('> section');
        sectionsDom.each(function (index) {
            sections.add($(this), index, sectionsDom.length);
        });

        sections[0].active(true);
    }

    function eventConfig() {
        var timeout;

        var current;
        var initialScroll = null;
        $(window).mousewheel(function () {
            clearTimeout(timeout);
            current = sections.current();

            if (initialScroll === null) {
                initialScroll = current.elem.scrollTop();
            }

            if (event.deltaY > 0) {
                timeout = setTimeout(function () {
                    if (!current.hasScroll() || initialScroll === current.elem.scrollTop()) {
                        scrollDown();
                    }

                    initialScroll = null;
                }, settings.scrollDelay);
                return;
            }

            timeout = setTimeout(function () {
                if (!current.hasScroll() || initialScroll === current.elem.scrollTop()) {
                    scrollUp();
                }

                initialScroll = null;
            }, settings.scrollDelay);
        });
    }


    function scrollDown() {
        var current = sections.current();

        if (!current.isScrollOnBottom() || !current.next()) {
            return;
        }

        current.active(false);
    }

    function scrollUp() {
        var current = sections.current();

        if (!current.isScrollOnTop() || !current.prev()) {
            return;
        }

        current.prev().active(true);
    }

    function navigationConfig() {
        navigation = $("<nav class='gorilla-scroller-navigation' />");
        var ul = $("<ul />");

        sections.forEach(function (item) {
            var li = $("<li />");
            var a = $("<a />");

            a.attr({ section: item.index });


            li.append(a);
            ul.append(li);
        });

        navigation.css({ 'z-index': sections.length + settings.zIndex });
        navigation.append(ul);
        root.append(navigation);

        navigation.on('click', 'a', function () {
            sections.find($(this).attr('section')).active(true);
        });

        setTimeout(function () {
            navigation.height(ul.height());
            navigationChange();
        }, 0);
    }

    function navigationChange() {
        if (!navigation) return;

        var current = sections.current();

        navigation.find('li').removeClass('active');
        navigation.find('[section=' + current.index + ']').parents('li').addClass('active');
    }


    /************************************
     * SECTIONS
     ************************************/
    var Section = function (elem, index, zIndex) {
        this.elem = elem;
        this.index = index;

        elem.addClass('gorilla-scroller-section gorilla-scroller-section-' + index);
        elem.attr('id', 'gorilla-scroller-section-' + index);
        elem.css({ 'z-index': zIndex });
    };

    Section.prototype.is = function (elem) {
        return this.elem[0] === $(elem)[0];
    };


    Section.prototype.hasScroll = function () {
        return (this.elem[0].scrollHeight - this.elem.height()) > 0;
    };

    Section.prototype.isScrollOnTop = function () {
        return !this.hasScroll() || this.elem.scrollTop() === 0;
    };

    Section.prototype.isScrollOnBottom = function () {
        return !this.hasScroll() || this.elem.scrollTop() >= (this.elem[0].scrollHeight - this.elem.height());
    };

    Section.prototype.active = function (active, isCascade) {
        if (active) {
            this.elem.addClass('gorilla-scroller-active');

            if (this.next()) {
                this.next().active(true, true);
            }

            if (!isCascade && this.prev()) {
                this.prev().active(false, true);
            }

            navigationChange(this.index);
            return;
        }

        this.elem.removeClass('gorilla-scroller-active');
        if (isCascade && this.prev()) {
            this.prev().active(false, true);
        }

        navigationChange(this.index);
    };

    Section.prototype.prev = function () {
        return sections.find(this.index - 1);
    };

    Section.prototype.next = function () {
        return sections.find(this.index + 1);
    };


})(jQuery, window.gorilla);