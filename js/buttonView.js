define([
    'coreJS/adapt'
], function(Adapt) {

    var ButtonView = Backbone.View.extend({

        className: "scrollSnap-button",
        $button: null,

        events: {
            "click button": "onClick"
        },

        initialize: function() {
            this.render();
        },

        render: function() {
            var template = Handlebars.templates.scrollButtonView;
            var data = this.model.toJSON();

            this.$el.html(template(data)).insertBefore('#wrapper');

            this.$button = this.$el.find('button');

            return this;
        },

        show: function() {
            this.$button.removeAttr('disabled');
            this.$el.removeClass('hide').addClass('show');
        },

        hide: function() {
            this.$el.removeClass('show').addClass('hide');
            this.$button.attr('disabled', 'disabled');
        },

        onClick: function() {
            this.trigger('buttonClick');
        }

    });

    return ButtonView;

});
