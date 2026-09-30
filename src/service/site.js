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

// A bare mailto does nothing in a browser with no mail app set up, so the
// Contact sheet offers the address to copy, Gmail's compose page, and the
// mail app, the last two with the tagged subject filled in.
const subject = encodeURIComponent(`${MAIL_TAG} `);
export const MAILTO = `mailto:${AUTHOR.email}?subject=${subject}`;
export const GMAIL = `https://mail.google.com/mail/?view=cm&fs=1&to=${AUTHOR.email}&su=${subject}`;
