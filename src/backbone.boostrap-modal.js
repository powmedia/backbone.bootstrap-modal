/**
 * Bootstrap Modal wrapper for use with Backbone.
 * 
 * Takes care of instantiation, adds several options and 
 * removes the element from the DOM when closed
 *
 * @author Charles Davison <charlie@powmedia.co.uk>
 *
 * Events:
 * closed: The user dismissed the modal
 * done: The user clicked OK
 */
(function($, _, Backbone) {

  //Set custom template settings
  var _interpolateBackup = _.templateSettings;
  _.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g,
    evaluate: /<%([\s\S]+?)%>/g
  }

  var template = _.template('\
    <% if (title) { %>\
      <div class="modal-header">\
        <% if (closeable) { %>\
          <a class="close">×</a>\
        <% } %>\
        <h3>{{title}}</h3>\
      </div>\
    <% } %>\
    <div class="modal-body"><p>{{content}}</p></div>\
    <div class="modal-footer">\
      <% if (closeable) { %>\
        <a href="#" class="btn cancel">{{cancelText}}</a>\
      <% } %>\
      <a href="#" class="btn ok btn-primary">{{okText}}</a>\
    </div>\
  ');

  //Reset to users' template settings
  _.templateSettings = _interpolateBackup;
  

  var Modal = Backbone.View.extend({

    /**
     * Creates an instance of a Bootstrap Modal
     *
     * @see http://twitter.github.com/bootstrap/javascript.html#modals
     *
     * @param {Object} options
     * @param {String|View} [options.content] Modal content. Default: none
     * @param {String} [options.title]        Title. Default: none
     * @param {String} [options.okText]       Text for the OK button. Default: 'OK'
     * @param {String} [options.cancelText]   Text for the cancel button. Default: 'Cancel'
     * @param {Boolean} [options.closeable]   Whether the modal can be closed, other than by pressing OK. Default: true
     * @param {Boolean} [options.escape]      Whether the 'esc' key can dismiss the modal. Default: true, but false if closeable is true
     * @param {Boolean} [options.animate]     Whether to animate in/out. Default: false
     * @param {Function} [options.template]   Compiled underscore template to override the default one
     */
    initialize: function(options) {
      this.options = _.extend({
        okText: 'OK',
        cancelText: 'Cancel',
        closeable: true,
        escape: true,
        animate: false,
        template: template
      }, options);
    },

    className: 'modal',

    events: {
      'click .close': function(event) {
        event.preventDefault();

        this.trigger('closed');
        this.close();
      },
      'click .cancel': function(event) {
        event.preventDefault();

        this.trigger('closed');
        this.close();
      },
      'click .ok': function(event) {
        event.preventDefault();

        this.trigger('done');
        this.close();
      }
    },

    /**
     * Creates the DOM element
     * 
     * @api private
     */
    render: function() {
      var $el = this.$el,
          options = this.options,
          content = options.content;

      //Create the modal container
      $el.html(options.template(options));

      var $content = this.$content = $el.find('.modal-body p')

      //Insert the main content if it's a view
      if (content.$el) {
        $el.find('.modal-body p').html(content.render().$el);
      }

      if (options.animate) $el.addClass('fade');

      return this;
    },

    /**
     * Renders and shows the modal
     */
    open: function() {
      this.render();

      var $el = this.$el;

      //Create it
      $el.modal({
        keyboard: this.options.closeable,
        backdrop: this.options.closeable ? true : 'static'
      });

      //Focus OK button
      $el.on('shown', function() {
        $el.find('.btn.ok').focus();
        $el.off('shown', this);
      });

      return this;
    },

    /**
     * Closes the modal
     */
    close: function() {
      var self = this,
          $el = this.$el;

      //Check if the modal should stay open
      if (this._preventClose) {
        this._preventClose = false;
        return;
      }

      $el.modal('hide');

      $el.one('hidden', _.bind(this.remove, this));
    },

    /**
     * Stop the modal from closing.
     * Can be called from within a 'close' or 'done' event listener.
     */
    preventClose: function() {
      this._preventClose = true;
    }
  });


  //EXPORTS
  //CommonJS
  if (typeof require == 'function' && module && exports) {
    module.exports = Modal;
  }

  //AMD / RequireJS
  if (typeof define === 'function' && define.amd) {
    return define(function() {
      return Modal;
    })
  }

  //Regular; add to Backbone.Bootstrap.Modal
  else {
    Backbone.BootstrapModal = Modal;
  }

})(jQuery, _, Backbone);
