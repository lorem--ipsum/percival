module.exports = function(config) {
  config.set({
    basePath: '',
    
    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'percival.min.js',
      '/tmp/percival.spec.js',
      '*.html'
    ],
    
    coverageReporter: {
      type : 'text-summary',
      dir : 'coverage/'
    },

    reporters: ['dots', 'coverage'],

    autoWatch: true,

    browsers: ['PhantomJS'],
    
    preprocessors: {
      '*.html': ['ng-html2js'],
      'percival.min.js': ['coverage']
    },
    
    frameworks: ['jasmine']
  });
};