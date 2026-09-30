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

// The Contact sheet's form sends through Web3Forms, which mails it on, so no
// visitor needs a mail app. FORM_KEY is an access key from web3forms.com;
// messages go to the inbox it was created for, which may not be AUTHOR.email.
// It can only send there, so it is safe in the page. Without a key, Contact
// shows just the address.
export const FORM_ENDPOINT = "https://api.web3forms.com/submit";
export const FORM_KEY = "662e9a7c-24e7-4d3e-a31a-cab97463bb51";
