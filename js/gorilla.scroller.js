if (!window.gorilla) {
    window.gorilla = {};
}

(function ($, gorilla) {
    var root;
    var sections = [];

    var settings = {
        zIndex: 0
    };

    var scroller = function (elem, config) {
        root = $(elem);
        $.extend(settings, config || {});
        console.log(settings);

        $('body').addClass('gorilla-scroller');
        root.addClass('gorilla-scroller-root');

        sectionConfig(root);
        eventConfig(root);
    };

    function sectionConfig(elem) {
        sections = elem.find('> section');
        sections.each(function (index) {
            var section = $(this);
            section.addClass('gorilla-scroller-section gorilla-scroller-active gorilla-scroller-section-' + index);

            var zIndex = sections.size() - index + settings.zIndex;
            section.css({ 'z-index': zIndex });
        });
    }

    function eventConfig() {
        $(window).mousewheel(function (e) {
            if (event.deltaY > 0) {
                console.log('down');
                return;
            }

            console.log('up');
        });
    }


    gorilla.scroller = scroller;
    $.fn.gorillaScroller = function (config) {
        return new scroller(this, config);
    };

})(jQuery, window.gorilla);