import workerEntry from "../../dist/server/index.js";

export default async (req, context) => {
  return workerEntry.fetch(req, process.env, context);
};

export const config = {
  path: "/*",
  preferStatic: true,
};
