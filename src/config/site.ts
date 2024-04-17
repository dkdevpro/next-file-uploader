export const siteConfig = {
  name: "Next-File-Uploader",
  ogImage: "",
  description:
    "A uploader component that demonstrates with cloud provider such as AWS, R2, uploadthing, etc.",
  links: {
    twitter: "https://twitter.com/dkdevpro",
    github: "https://github.com/dinesktech/next-file-uploader",
  },
  url:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://next-uploader.dkdevpro.com",
};

export type SiteConfig = typeof siteConfig;
