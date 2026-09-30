// Who made the machine and where to reach them: the page footer, the About
// sheet and the power screen all read from here.
export const AUTHOR = {
  name: "Yilun Shi",
  handle: "samsara0xgg",
  bio: "CS student at UVic, building full-stack apps and interactive audio software.",
  github: "https://github.com/samsara0xgg",
  // a copy of the GitHub avatar, so the page makes no third-party request
  avatar: "/assets/avatar.jpg",
  email: "alllllenshi@gmail.com",
};

export const REPO = "https://github.com/samsara0xgg/drum-machine-pro";

// Mail from the site arrives tagged, so it can be filtered on the subject.
export const MAIL_TAG = "[Drum Machine Pro]";

// The Contact sheet's form posts to FormSubmit, which mails it on, so no
// visitor needs a mail app: in the background to the ajax endpoint, or, if
// the browser can't reach that, as a plain form post in a new tab. The
// first message sends an "Activate Form" mail to the address; nothing
// arrives until that link is clicked once.
export const FORM_ENDPOINT = `https://formsubmit.co/ajax/${AUTHOR.email}`;
export const FORM_ACTION = `https://formsubmit.co/${AUTHOR.email}`;
