Polymer({
  publish: {
    /**
       * The `format` attribute details http://momentjs.com/docs/#/parsing/string-format/.
       *
       * @attribute format
       * @type string
       */
    format: 'DD/MM/YYYY',
    date: null
  },
  created: function() {
    this.items = [];
    this.views = {
      Days: {
        item: 'day',
        heading: 'month'
      },
      Months: {
        item: 'month',
        heading: 'year'
      },
      Years: {
        item: 'year',
        heading: 'years'
      }
    };
    this.updateNowDate = this.debounce(this._updateNowDate, 500);
  },
  // Utility method; More here: http://davidwalsh.name/function-debounce
  debounce: function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  },
  ready: function() {
    this.now = moment();
    this.view = 'Days';
    this.canFireEvent = true;
    this.updateDate();
    this.item  = this.day+ this.month+this.year;
  },
  observe: {
    date: 'updateNowDate',
    now: 'updateInputDate',
    day: 'setNowDate',
    month: 'render',
    year: 'render',
    view: 'render'
  },

  prev: function() {
    // As of now, I don't find any other solution to make the button ripple animation smoother :(
    var that = this;
    this.$.content.style.visibility = "hidden";
    this.$.loadingAnim.setAttribute("active", "");
    this.$.loadingAnim.style.display = "block";
    setTimeout(function() {
      that.now = that.now.clone().subtract(1, that.views[that.view].heading);
      that.updateDate();
    }, 400);
  },

  next: function() {
    // As of now, I don't find any other solution to make the button ripple animation smoother :(
    var that = this;
    this.$.content.style.visibility = "hidden";
    this.$.loadingAnim.setAttribute("active", "");
    this.$.loadingAnim.style.display = "block";
    setTimeout(function(){
      that.now = that.now.clone().add(1, that.views[that.view].heading);
      that.updateDate();
    }, 300);
  },

  nextView: function() {
    var keys = Object.keys(this.views),
      view = keys[keys.indexOf(this.view) + 1];
    this.view = view || this.view;
    this.render();
  },

  prevView: function() {
    var keys = Object.keys(this.views),
      view = keys[keys.indexOf(this.view) - 1];
    this.view = view || this.view;
  },

  setItem: function(e, d, el) {
    var currentView;
    if (el.className.indexOf('active') === -1) { return; }
    currentView = this.views[this.view].item;
    if(currentView === "day"){
      this.canFireEvent = true;
    }
    this[currentView] = el.dataset.value;
    this.prevView();
    this.item = this.day+ this.month+this.year;
  },

  render: function() {
    this.setNowDate();
    this['set' + this.view]();
    this.header = this[this.views[this.view].heading];
    this.$.content.style.visibility = "visible";
    this.$.loadingAnim.removeAttribute("active");
    this.$.loadingAnim.style.display = "none";
  },

  canFireEvent: false,

  _updateNowDate: function() {
    var now = this.date ? moment(this.date, this.format) : moment();
    if (!now.isValid()) { return; }
    this.now = now;
    this.updateDate();
  },

  updateInputDate: function() {
  if(this.canFireEvent) {
    this.canFireEvent = false;
    this.fire("date-selected", this.now);
  }
  },

  setNowDate: function() {
    var now = moment([this.day, this.month, this.year].join(' '), 'D MMMM YYYY');
    if (now.isValid()) {
      this.now = now;
    } else if (this.day > moment(this.month, 'MMMM').daysInMonth()) {
      this.day = moment(this.month, 'MMMM').daysInMonth();
    }
  },

  updateDate: function() {
    this.day = this.now.format('D');
    this.month = this.now.format('MMMM');
    this.year = this.now.format('YYYY');
  },

  getDayNames: function() {
    var start = moment().day(0),
      end = moment().day(6),
      days = [];
    moment()
      .range(start, end)
      .by('days', function(moment) {
        days.push({
          val: moment.format('dd'),
          label: moment.format('dd'),
          cl: 'heading'
        });
      });
    return days;
  },

  setDays: function() {
    var start = this.now.clone().startOf('month').day(0),
      end = this.now.clone().endOf('month').day(6),
      items = this.items = this.getDayNames(),
      month = this.now.month();
    this.type = 'days';
    moment()
      .range(start, end)
      .by('days', function(moment) {
        items.push({
          val: moment.format('D')+moment.format('MMMM')+moment.format('YYYY'),
          label: moment.format('D'),
          cl: moment.month() === month ? 'active': 'fade'
        });
      });
  },

  setMonths: function() {
    var start = this.now.clone().startOf('year'),
      end = this.now.clone().endOf('year'),
      items = this.items = [];
    this.type = 'months';
    moment()
      .range(start, end)
      .by('months', function(moment) {
        items.push({
          val: moment.format('MMMM'),
          label: moment.format('MMM'),
          cl: 'active'
        });
      });
  },

  setYears: function() {
    var start = this.now.clone().subtract(12, 'year'),
      end = this.now.clone().add(12, 'year'),
      items = this.items = [];
    this.years = [start.format('YYYY'),end.format('YYYY')].join('-');
    this.type = 'years';
    moment()
      .range(start, end)
      .by('years', function(moment) {
        items.push({
          val: moment.format('YYYY'),
          label: moment.format('YYYY'),
          cl: 'active'
        });
      });
  }
});