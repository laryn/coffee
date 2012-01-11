(function ($) {

  Drupal.coffee = Drupal.coffee || {};

  Drupal.behaviors.coffee = {
    attach: function () {
      $('body').once('coffee', function () {

        var body = $(this);

        Drupal.coffee.bg.appendTo(body).hide();

        Drupal.coffee.label.appendTo(Drupal.coffee.form);
        Drupal.coffee.field.appendTo(Drupal.coffee.form);
        Drupal.coffee.results.appendTo(Drupal.coffee.form);
        Drupal.coffee.form.wrapInner('<div id="coffee-form-inner" />').appendTo(body).hide();

        $(document).keydown(function (event) {

          // Show the form with alt + D
          if (!Drupal.coffee.form.is(':visible') && event.altKey === true && (event.keyCode === 68 || event.keyCode === 206) ) {
            Drupal.coffee.open();
            event.preventDefault();
          }

          // Close the form with esc or alt + D
          else if (Drupal.coffee.form.is(':visible') && ( event.keyCode === 27 || (event.altKey === true && (event.keyCode === 68 || event.keyCode === 206) ))) {
            Drupal.coffee.close();
            event.preventDefault();
          }

          // Use the arrow up/down keys to navigate trough the results
          else if (Drupal.coffee.form.is(':visible') && Drupal.coffee.results.children().length && (event.keyCode === 38 || event.keyCode === 40)) {
            Drupal.coffee.move(event.keyCode === 38 ? 'up' : 'down');
            event.preventDefault();
          }

          // Redirect to a result when the enter key is used on the link for it.
          // Redirect to the first result when the enter key is used in the search field.
          // We assume that the active element is the search field when srcElement.href isn't available.
          // Also: enter does nothing when there are no results.
          else if (Drupal.coffee.form.is(':visible') && event.keyCode === 13) {
            if (Drupal.coffee.results.children().length) {
              Drupal.coffee.redirect(event.srcElement.href ? event.srcElement.href : Drupal.coffee.results.find('a:first').attr('href'));
            }
            event.preventDefault();
          }

        });

        // Prevent multiple highlighted results with :hover and :focus.
        // .live() is deprecated ==>> convert to .on() when Drupal gets jQuery 1.7+
        // http://api.jquery.com/live/
        $('#coffee-results a').live('hover', function () {
          $(this).focus();
        // Remove the fake focus class once actual focus is used
        }).live('focus', function () {
          Drupal.coffee.results.find('.focus').removeClass('focus');
        // We close the form explicitly after opening a result as pages aren't reloaded in case of overlay usage
        }).live('click', function () {
          Drupal.coffee.close();
        });
      });
    }
  };

  Drupal.coffee.open = function () {
    Drupal.coffee.form.show();
    Drupal.coffee.bg.show();
    Drupal.coffee.field.focus();
  };

  Drupal.coffee.close = function () {
    Drupal.coffee.field.val('');
    Drupal.coffee.results.empty();
    Drupal.coffee.form.hide();
    Drupal.coffee.bg.hide();
  };

  Drupal.coffee.move = function (direction) {
    var activeElement = $(document.activeElement);

    // Loop around the results when at the first or last, or at the search field.
    // Skip the first result if it already has the fake focus class.
    if (activeElement[0] === Drupal.coffee.results.find('a:' + (direction === 'up' ? 'first' : 'last'))[0] || activeElement[0] === Drupal.coffee.field[0]) {
      Drupal.coffee.results.find((direction === 'down' && Drupal.coffee.results.find('.focus').length ? 'li:nth-child(2) ' : '') + 'a:' + (direction === 'up' ? 'last' : 'first')).focus();
    }
    else if (direction === 'up') {
      activeElement.parent().prev().find('a').focus();
    }
    else {
      activeElement.parent().next().find('a').focus();
    }
  };

  Drupal.coffee.redirect = function (path) {
    Drupal.coffee.close();
    document.location = path;
  };

  // The elements

  Drupal.coffee.label = $('<label for="coffee-q" class="element-invisible" />').text(Drupal.t('Query'));

  Drupal.coffee.results = $('<ol id="coffee-results" />');

  // Instead of appending results one by one, we put them in a placeholder element
  // first and then append them all at once to prevent flickering while typing.
  Drupal.coffee.resultsPlaceholder = $('<ol />');

  Drupal.coffee.form = $('<form id="coffee-form" />');

  Drupal.coffee.bg = $('<div id="coffee-bg" />').click(function () {
    Drupal.coffee.close();
  });

  Drupal.coffee.field = $('<input id="coffee-q" type="text" autocomplete="off" />').keyup(function () {
    Drupal.coffee.resultsPlaceholder.empty();

    $.getJSON(Drupal.settings.basePath + 'admin/coffee/result/' + Drupal.coffee.field.val(), function (data) {
      if (data) {
        $.each(data, function (key, value) {
          var description = $('<small class="description" />').text(value.path);
          $('<a />').text(value.title)
            .attr('href', Drupal.settings.basePath + value.path)
            .append(description)
            .appendTo(Drupal.coffee.resultsPlaceholder)
            .wrap('<li />');
        });

        // Highlight the first result as if it were focused, as a visual hint for
        // what will happen when using the enter key in the search field.
        Drupal.coffee.results.html(Drupal.coffee.resultsPlaceholder.children()).find('a:first').addClass('focus');
      }
    });
  });

}(jQuery));
