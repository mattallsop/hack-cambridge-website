import * as $ from 'jquery';
import { Application } from 'stimulus';

import AlertController from './controllers/alert-controller';
import EmailSignUpController from './controllers/email-sign-up-controller';
import FieldValidatorController from './controllers/field-validator-controller';
import ValidationMessagesController from './controllers/validation-messages-controller';
import { UJS } from './ujs';

import * as live from './live';

const pages = [live];

$(document).ready(() => {
  pages.forEach(f => f.start());
});

UJS.start();

const application = Application.start();
application.register('email-sign-up', EmailSignUpController);
application.register('field-validator', FieldValidatorController);
application.register('validation-messages', ValidationMessagesController);
application.register('alert', AlertController);
