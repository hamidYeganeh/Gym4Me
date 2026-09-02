import mongoose, { type Connection, type ConnectOptions } from "mongoose";

export * from "./models.js";

export async function connectDatabase(
  uri: string,
  options: ConnectOptions = {},
): Promise<Connection> {
  await mongoose.connect(uri, {
    autoIndex: process.env.NODE_ENV !== "production",
    maxPoolSize: 20,
    ...options,
  });
  return mongoose.connection;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
