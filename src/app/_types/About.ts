import { z } from "zod"; // zodライブラリのインポート
import {
  userNameSchema,
  aboutContentSchema,
  aboutSlugSchema,
} from "./CommonSchemas";

export const aboutSchema = z.object({
  userName: userNameSchema,
  aboutSlug: aboutSlugSchema,
  aboutContent: aboutContentSchema,
});

export type About = z.infer<typeof aboutSchema>;
