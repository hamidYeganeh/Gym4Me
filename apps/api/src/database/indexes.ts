import "../config/load-env.js";
import { connectDatabase, disconnectDatabase, registerModels } from "./index.js";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required");
const connection = await connectDatabase(uri);
const models = registerModels(connection);
for (const model of Object.values(models)) await model.syncIndexes();
await disconnectDatabase();
