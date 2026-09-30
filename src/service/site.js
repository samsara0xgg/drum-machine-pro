// Who made the machine and where to reach them: the page footer, the About
// sheet and the power screen all read from here.
export const AUTHOR = {
  name: "Yilun Shi",
  handle: "samsara0xgg",
  bio: "CS student at UVic, building full-stack apps and interactive audio software.",
  github: "https://github.com/samsara0xgg",
  // a copy of the GitHub avatar, so the page makes no third-party request
  avatar: "/assets/avatar.jpg",
  // Set an address to make CONTACT a mail link instead of a GitHub issue.
  email: "",
};

export const REPO = "https://github.com/samsara0xgg/drum-machine-pro";

export const CONTACT = AUTHOR.email
  ? `mailto:${AUTHOR.email}`
  : `${REPO}/issues/new`;
