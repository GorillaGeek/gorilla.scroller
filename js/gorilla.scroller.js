if (!window.gorilla) {
    window.gorilla = {};
}

(function ($, gorilla) {
    /************************************
	 * VARS
	 ************************************/
    var root;
    var navigation;
    var isDisabled = false;
    var settings = {
        zIndex: 0,
        scrollDelay: 300,
        showNavigation: true,
        disable: false,
        callback: function (event, data) { }
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
        var dom = root.find('.gorilla-scroller-section[section=' + index + ']');

        if (!dom.size()) {
            return null;
        }

        return sections.filter(function (item) {
            return item.is(dom);
        })[0];
    };

    /************************************
	 * EXPORT
	 ************************************/
    Scroller = function (elem, config) {
        this.init($(elem), config || {});
    };

    gorilla.scroller = Scroller;
    $.fn.gorillaScroller = function (config) {
        return new gorilla.scroller(this, config);
    };

    Scroller.prototype.init = function (elem, config) {
        root = elem;
        $.extend(settings, config);

        $('body').addClass('gorilla-scroller');
        root.addClass('gorilla-scroller-root');

        sectionsConfig();
        eventConfig();

        if (settings.showNavigation) {
            navigationConfig();
        }

        disableConfig();
    };

    Scroller.prototype.active = function (index) {
        var current = sections.find(index);

        if (!current) {
            throw "Gorilla Scroller: Section not found";
        }

        current.active(true);
    };

    Scroller.prototype.disabled = function () {
        return isDisabled;
    };

    /************************************
	 * METHODS
	 ************************************/
    function sectionsConfig() {
        var sectionsDom = root.find('section');

        var index = 0;
        sectionsDom.each(function () {
            var section = $(this);

            if (section.find('section').size() > 0) {
                return;
            }

            sections.add(section, index, sectionsDom.length);
            index++;
        });

        sections[0].active(true);
    }

    function eventConfig() {
        var timeout;

        var current;
        var initialScroll = null;
        $(window).mousewheel(function (event) {
            clearTimeout(timeout);
            current = sections.current();

            if (initialScroll === null) {
                initialScroll = current.elem.scrollTop();
            }

            if (event.deltaY < 0) {
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

    function disableConfig() {
        var enable = function () {
            $('body').addClass('gorilla-scroller');

            if (isDisabled) {
                sections[0].active(true);
            }

            isDisabled = false;
        };

        var disable = function () {
            isDisabled = true;
            $('body').removeClass('gorilla-scroller');
        };

        var timeoutResize = null;
        $(window).resize(function () {
            clearTimeout(timeoutResize);
            timeoutResize = setTimeout(function () {
                if (typeof settings.disable == "function") {
                    if (settings.disable()) {
                        disable();
                        return;
                    }

                    enable();
                    return;
                }

                if (!settings.disable) {
                    enable();
                    return;
                }

                disable();
            }, 100);
        });
        $(window).trigger('resize');
    }

    function scrollDown() {
        var current = sections.current();

        if (isDisabled || !current.isScrollOnBottom() || !current.next()) {
            return;
        }

        current.active(false);
    }

    function scrollUp() {
        var current = sections.current();

        if (isDisabled || !current.isScrollOnTop() || !current.prev()) {
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

            a.attr({
                section: item.index
            });

            var parentSection = item.elem.parents('section');
            if (parentSection.size() > 0 && parentSection.find('section:first-child')[0] !== item.elem[0]) {
                return;
            }

            li.append(a);
            ul.append(li);
        });

        navigation.css({
            'z-index': (sections.length + settings.zIndex) + 2
        });
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
        var currentLink;
        var index = current.index;

        do {
            currentLink = navigation.find('[section=' + index + ']');
            index--;

            if (index < -1) {
                throw "Gorilla Scroller: Navigation link not found";
            }
        } while (currentLink.size() === 0);

        navigation.removeClass(function (index, css) {
            return (css.match(/(^|\s)active-\S+/g) || []).join(' ');
        });
        navigation.addClass("active-" + current.index);

        navigation.find('li').removeClass("active active-sub");
        navigation.find('li').removeClass(function (index, css) {
            return (css.match(/(^|\s)active-\S+/g) || []).join(' ');
        });

        var activeClass = "active";

        if (current.isChild()) {
            activeClass += " active-sub active-" + current.parentIndex;
        }

        currentLink.parents('li').addClass(activeClass);
    }


    /************************************
	 * SECTIONS
	 ************************************/
    var Section = function (elem, index, zIndex) {
        this.elem = elem;
        this.index = index;
        this.parentIndex = 0;

        if (this.isChild()) {
            elem.parents('section').find('.gorilla-scroller-section').each(function (index, elem) {
                if (this.is(elem)) {
                    return false;
                }

                this.parentIndex++;
            }.bind(this));
        }

        elem.addClass('gorilla-scroller-section gorilla-scroller-section-' + index);
        elem.attr('section', index);
        elem.css({
            'z-index': zIndex
        });
    };

    Section.prototype.is = function (elem) {
        return this.elem[0] === $(elem)[0];
    };

    Section.prototype.isChild = function () {
        return this.elem.parents('section').size() > 0;
    };

    Section.prototype.hasScroll = function () {
        return (this.elem[0].scrollHeight - this.elem.outerHeight()) > 0;
    };

    Section.prototype.isScrollOnTop = function () {
        return !this.hasScroll() || this.elem.scrollTop() === 0;
    };

    Section.prototype.isScrollOnBottom = function () {
        return !this.hasScroll() || this.elem.scrollTop() >= (this.elem[0].scrollHeight - this.elem.outerHeight());
    };

    Section.prototype.active = function (active, applyCascade) {
        if (!applyCascade) {
            if (active) {
                settings.callback("current", { section: this.index, elem: this.elem });
            } else {
                var next = this.next();
                settings.callback("current", { section: next.index, elem: next.elem });
            }
        }

        if (active) {
            this.elem.addClass('gorilla-scroller-active');

            if (this.next()) {
                this.next().active(true, true);
            }

            if (!applyCascade && this.prev()) {
                this.prev().active(false, true);
            }

            navigationChange(this.index);
            return;
        }

        this.elem.removeClass('gorilla-scroller-active');
        if (applyCascade && this.prev()) {
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