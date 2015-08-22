const riot = require('riot');

require('../../src/ui/templates/**/*.html', { mode: 'expand' });

document.addEventListener('DOMContentLoaded', function() {
  riot.mount('*');
});
