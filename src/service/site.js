// Who made the machine and where to reach them: the page footer, the About
// sheet and the power screen all read from here.
export const AUTHOR = {
  name: "Yilun Shi",
  handle: "samsara0xgg",
  bio: "CS student at UVic, building full-stack apps and interactive audio software.",
  github: "https://github.com/samsara0xgg",
  // a copy of the GitHub avatar, so the page makes no third-party request
  avatar: "/assets/avatar.jpg",
  // CONTACT mails this; without one it opens a GitHub issue instead.
  email: "alllllenshi@gmail.com",
};

export const REPO = "https://github.com/samsara0xgg/drum-machine-pro";

// Mail from the site arrives tagged, so it can be filtered on the subject.
export const MAIL_TAG = "[Drum Machine Pro]";

export const CONTACT = AUTHOR.email
  ? `mailto:${AUTHOR.email}?subject=${encodeURIComponent(`${MAIL_TAG} `)}`
  : `${REPO}/issues/new`;
