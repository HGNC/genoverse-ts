module.exports = {
  '../node_modules/jquery/dist/jquery.js': {
    'exports': 'jQuery'
  },
  '../node_modules/jquery-ui-dist/jquery-ui.js': {
    'depends': {
      '../node_modules/jquery/dist/jquery.js': 'jQuery'
    }
  }
};