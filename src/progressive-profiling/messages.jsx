import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'progressive.profiling.page.title': {
    id: 'progressive.profiling.page.title',
    defaultMessage: 'Welcome | {siteName}',
    description: 'progressive profiling page title',
  },
  'progressive.profiling.page.heading': {
    id: 'progressive.profiling.page.heading',
    defaultMessage: 'We are excited to have you here! We just need some information to get started.',
    description: 'The page heading for the progressive profiling page.',
  },
  'optional.fields.information.link': {
    id: 'optional.fields.information.link',
    defaultMessage: 'Learn more about how we use this information.',
    description: 'Optional fields page information link',
  },
  'optional.fields.submit.button': {
    id: 'optional.fields.submit.button',
    defaultMessage: 'Submit',
    description: 'Submit button text',
  },
  'optional.fields.skip.button': {
    id: 'optional.fields.skip.button',
    defaultMessage: 'Skip for now',
    description: 'Skip button text',
  },
  'optional.fields.next.button': {
    id: 'optional.fields.next.button',
    defaultMessage: 'Next',
    description: 'Next button text',
  },
  // modal dialog box
  'continue.to.platform': {
    id: 'continue.to.platform',
    defaultMessage: 'Continue to {platformName}',
    description: 'Button text for modal when user chooses "skip for now" option',
  },
  'modal.title': {
    id: 'modal.title',
    defaultMessage: 'Thanks for letting us know.',
    description: 'Heading for welcome page modal',
  },
  'modal.description': {
    id: 'modal.description',
    defaultMessage: 'You can complete your profile in settings at any time if you change your mind.',
    description: 'Modal body text',
  },
  // error message
  'welcome.page.error.heading': {
    id: 'welcome.page.error.heading',
    defaultMessage: 'We couldn\'t update your profile',
    description: 'Error message heading',
  },
  'welcome.page.error.message': {
    id: 'welcome.page.error.message',
    defaultMessage: 'An error occurred. You can complete your profile in settings at any time.',
    description: 'Error message body',
  },
  'welcome.page.supporting.information': {
    id: 'welcome.page.supporting.information',
    defaultMessage: 'If you are not affiliated with an organization, leave blank.',
    description: 'Supporting information below the input fields',
  },
  'welcome.page.organization.name': {
    id: 'welcome.page.organization.name',
    defaultMessage: 'Organization Name',
    description: 'Title for Organization Name field',
  },
  'welcome.page.organization.description': {
    id: 'welcome.page.organization.description',
    defaultMessage: 'Please enter the name of the organization that you work for.',
    description: 'Description for Organization name field',
  },
  'organization.name.length.error': {
    id: 'organization.name.length.error',
    defaultMessage: 'Organization name must be between 2 and 255 characters long.',
  },
  'organization.name.duplicate.error': {
    id: 'organization.name.duplicate.error',
    defaultMessage: 'An organization with this name already exists. Please choose from the existing list or input another name.',
  },
  'organization.select.info': {
    id: 'organization.select.info',
    defaultMessage: 'We found similar organizations in our system. You can select from the list below.',
    description: 'Information for user in the drop-down select field of the organization selection',
  },
});
export default messages;
