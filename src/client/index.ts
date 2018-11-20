import { Application } from 'stimulus'
import { definitionsFromContext } from 'stimulus/webpack-helpers'
//import * as $ from 'jquery';

//import * as live from './live';
//import * as payment from './payment';
//import * as splash from './splash';

//let pages = [live, payment, splash];

/*$(document).ready(() => {
  pages.forEach((f) => f.start());
});*/

const application = Application.start();
const context = require.context('./controllers', true, /\.ts$/)
application.load(definitionsFromContext(context))
